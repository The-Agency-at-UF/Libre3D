/**
 * PURPOSE: Server-side (Node) logic for publishing a scene and for the public viewer.
 *
 * Routes:
 *   POST /api/publish        `{ sceneId }`, one of the caller's scenes (sign-in required): returns
 *                            `{ publishId, uploadUrl }`, a presigned PUT for the published GLB
 *   GET  /api/scene/:id      public: `{ cloudAssetUrl }`, a short-lived presigned GET for the GLB
 *                            published under that publish ID
 *
 * Ownership is by construction: the publish ID is made here, kept on the caller's own user-scenes
 * row (`publishId`), and only ever read back from there, so a client can't name someone else's
 * published scene. Each scene has one publish ID for life; publishing again replaces its GLB, so
 * the share link (`/v/<publishId>`) stays the same. The published-scenes row records the owner and
 * where the GLB is; its condition refuses to take over a row someone else owns as a backstop.
 *
 * Publishing doesn't need the editing lock: it doesn't change the scene's document, and setting the
 * publish ID happens once. Deleting a scene unpublishes it (`unpublishScene` in awsSceneHandler.ts).
 *
 * The Vercel functions (`api/publish.ts`, `api/scene/[sceneId].ts`) and the Vite dev middleware are
 * thin adapters around these two handlers, so the two environments cannot drift.
 */

import { randomUUID } from "node:crypto";
import type { IncomingHttpHeaders } from "node:http";

import { ConditionalCheckFailedException, GetItemCommand, PutItemCommand, UpdateItemCommand } from "@aws-sdk/client-dynamodb";
import { GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// `.js` is required: Vercel runs server modules under Node's ES module loader (see awsConfig.ts).
import type { ServerEnv } from "./awsConfig.js";
import {
  errorResponse,
  isSceneId,
  json,
  parseBody,
  publishedGlbKey,
  readSceneConfig,
  rowKey,
  type SceneApiResponse,
  type SceneConfig,
} from "./awsSceneHandler.js";
import { verifyAuth } from "./verifyAuth.js";

export interface PublishApiRequest {
  method: string;
  headers: IncomingHttpHeaders;
  /** Parsed JSON (Vercel) or the raw string (Vite middleware); either is accepted. */
  body: unknown;
}

export interface PublishedSceneApiRequest {
  method: string;
  /** The `:id` path segment of `/api/scene/:id`: a publish ID. */
  publishId: string;
}

const GLB_CONTENT_TYPE = "model/gltf-binary";
// How long the editor has to start uploading, and the viewer to start downloading. S3 checks the
// expiry when a transfer starts, so a slow one isn't cut off.
const GLB_URL_TTL_SECONDS = 900;

const methodNotAllowed = (allowed: string): SceneApiResponse => json(405, { error: "Method not allowed" }, { Allow: allowed });

/** The scene's publish ID, made on its first publish; null when the caller has no such scene. */
const reservePublishId = async (config: SceneConfig, userId: string, sceneId: string): Promise<string | null> => {
  try {
    const result = await config.dynamo.send(
      new UpdateItemCommand({
        TableName: config.tableName,
        Key: rowKey(userId, sceneId),
        // One call, so two publishes at once still agree on one ID.
        UpdateExpression: "SET publishId = if_not_exists(publishId, :publishId)",
        ConditionExpression: "attribute_exists(sceneId)",
        ExpressionAttributeValues: { ":publishId": { S: randomUUID() } },
        ReturnValues: "ALL_NEW",
      }),
    );

    return result.Attributes?.publishId?.S ?? null;
  } catch (error) {
    if (error instanceof ConditionalCheckFailedException) {
      return null;
    }

    throw error;
  }
};

const publishScene = async (config: SceneConfig, userId: string, body: Record<string, unknown>): Promise<SceneApiResponse> => {
  if (!isSceneId(body.sceneId)) {
    return errorResponse(400, "sceneId must be the scene to publish.");
  }

  const sceneId = body.sceneId;
  const publishId = await reservePublishId(config, userId, sceneId);

  if (!publishId) {
    return errorResponse(404, "Scene not found.");
  }

  const assetKey = publishedGlbKey(publishId);

  try {
    await config.dynamo.send(
      new PutItemCommand({
        TableName: config.publishedTableName,
        Item: {
          sceneId: { S: publishId },
          assetKey: { S: assetKey },
          ownerId: { S: userId },
          sourceSceneId: { S: sceneId },
          updatedAt: { S: new Date().toISOString() },
        },
        ConditionExpression: "attribute_not_exists(sceneId) OR ownerId = :owner",
        ExpressionAttributeValues: { ":owner": { S: userId } },
      }),
    );
  } catch (error) {
    if (!(error instanceof ConditionalCheckFailedException)) {
      throw error;
    }

    console.error(`Publish ID ${publishId} on ${userId}'s scene ${sceneId} belongs to someone else`);
    return errorResponse(409, "This scene's share link belongs to someone else.");
  }

  const uploadUrl = await getSignedUrl(
    config.s3,
    new PutObjectCommand({ Bucket: config.bucketName, Key: assetKey, ContentType: GLB_CONTENT_TYPE }),
    { expiresIn: GLB_URL_TTL_SECONDS },
  );

  return json(200, { publishId, uploadUrl });
};

export const handlePublishRequest = async (request: PublishApiRequest, env: ServerEnv): Promise<SceneApiResponse> => {
  if (request.method.toUpperCase() !== "POST") {
    return methodNotAllowed("POST");
  }

  // The upload URL is write access to the bucket, so only a signed-in owner gets one.
  const auth = await verifyAuth(request.headers, env);

  if (!auth.authorized) {
    return errorResponse(auth.status, auth.error);
  }

  try {
    return await publishScene(readSceneConfig(env), auth.userId, parseBody(request.body));
  } catch (error) {
    console.error("Publish API error:", error);
    return errorResponse(500, "Something went wrong on the server. Try again.");
  }
};

/** Public, no sign-in: anyone with the share link may view the scene. */
export const handlePublishedSceneRequest = async (
  request: PublishedSceneApiRequest,
  env: ServerEnv,
): Promise<SceneApiResponse> => {
  if (request.method.toUpperCase() !== "GET") {
    return methodNotAllowed("GET");
  }

  if (!isSceneId(request.publishId)) {
    return errorResponse(404, "Scene not found.");
  }

  try {
    const config = readSceneConfig(env);
    const { Item: item } = await config.dynamo.send(
      new GetItemCommand({ TableName: config.publishedTableName, Key: { sceneId: { S: request.publishId } } }),
    );
    // Rows from before publishing was tied to users have the same `assetKey`, so their links work.
    const assetKey = item?.assetKey?.S;

    if (!assetKey) {
      return errorResponse(404, "Scene not found.");
    }

    const cloudAssetUrl = await getSignedUrl(config.s3, new GetObjectCommand({ Bucket: config.bucketName, Key: assetKey }), {
      expiresIn: GLB_URL_TTL_SECONDS,
    });

    // The URL expires, so nothing may keep this answer for later.
    return json(200, { cloudAssetUrl }, { "Cache-Control": "no-store" });
  } catch (error) {
    console.error(`Published scene API error (${request.publishId}):`, error);
    return errorResponse(500, "Something went wrong on the server. Try again.");
  }
};
