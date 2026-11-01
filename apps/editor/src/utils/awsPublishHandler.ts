/**
 * PURPOSE: Server-side (Node) logic for publishing a scene and for the public viewer.
 *
 * Routes:
 *   POST /api/publish        `{ sceneId }`, one of the caller's scenes (sign-in required): publishes
 *                            the scene as last saved and returns `{ publishId }`
 *   GET  /api/scene/:id      public: `{ document, assets }`, the published scene's document and a
 *                            short-lived presigned GET for each imported asset it uses, by hash
 *
 * A scene is published whole, as Spline publishes its own scene format rather than a glTF: a copy
 * of its saved document (`scenes/<publishId>.json`), played by the viewer the way the editor plays
 * it (components/viewer/). The copy is made here from the scene's row, so what's published is what
 * was last saved (the editor saves pending edits first), and later saves don't change the share
 * link until the scene is published again. Its imported models and pictures aren't copied: the
 * viewer reads the owner's own content-addressed objects (`users/<owner>/assets/<hash>`), which
 * nothing deletes; the published row records which ones, as the save that wrote the document did.
 *
 * Ownership is by construction: the publish ID is made here, kept on the caller's own user-scenes
 * row (`publishId`), and only ever read back from there, so a client can't name someone else's
 * published scene. Each scene has one publish ID for life, so the share link (`/v/<publishId>`)
 * stays the same. The published-scenes row records the owner and the document's copy; its
 * condition refuses to take over a row someone else owns as a backstop.
 *
 * Publishing doesn't need the editing lock: it doesn't change the scene's document, and setting the
 * publish ID happens once. Deleting a scene unpublishes it (`unpublishScene` in awsSceneHandler.ts).
 * Scenes published as a GLB, before this, answer 410: their owner publishes them again.
 *
 * The Vercel functions (`api/publish.ts`, `api/scene/[sceneId].ts`) and the Vite dev middleware are
 * thin adapters around these two handlers, so the two environments cannot drift.
 */

import { randomUUID } from "node:crypto";
import type { IncomingHttpHeaders } from "node:http";

import { ConditionalCheckFailedException, GetItemCommand, PutItemCommand, UpdateItemCommand } from "@aws-sdk/client-dynamodb";
import { GetObjectCommand, NoSuchKey, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// `.js` is required: Vercel runs server modules under Node's ES module loader (see awsConfig.ts).
import type { ServerEnv } from "./awsConfig.js";
import {
  assetKey,
  deleteObjectQuietly,
  errorResponse,
  isSceneId,
  json,
  parseBody,
  publishedDocumentKey,
  publishedGlbKey,
  readSceneConfig,
  rowKey,
  type SceneApiResponse,
  type SceneConfig,
} from "./awsSceneHandler.js";
import { isAssetHash } from "./sceneAssets.js";
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

// How long the viewer has to start downloading an asset. S3 checks the expiry when a transfer
// starts, so a slow one isn't cut off.
const ASSET_URL_TTL_SECONDS = 900;
// A save between reading the row and copying its document deletes the one read (saves replace it).
const COPY_ATTEMPTS = 3;

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

/**
 * The scene's saved document and the assets it uses, read from its row and S3 together. Null
 * when the caller has no such scene; `document` null when it was never saved.
 */
const readSavedScene = async (
  config: SceneConfig,
  userId: string,
  sceneId: string,
): Promise<{ document: string | null; assetHashes: string[] } | null> => {
  for (let attempt = 1; ; attempt += 1) {
    const { Item: row } = await config.dynamo.send(
      new GetItemCommand({ TableName: config.tableName, Key: rowKey(userId, sceneId), ConsistentRead: true }),
    );

    if (!row) return null;
    const documentKey = row.documentKey?.S;
    const assetHashes = row.assetHashes?.SS ?? [];
    if (!documentKey) return { document: null, assetHashes };

    try {
      const object = await config.s3.send(new GetObjectCommand({ Bucket: config.bucketName, Key: documentKey }));
      return { document: (await object.Body?.transformToString()) ?? null, assetHashes };
    } catch (error) {
      if (!(error instanceof NoSuchKey) || attempt >= COPY_ATTEMPTS) throw error;
    }
  }
};

const publishScene = async (config: SceneConfig, userId: string, body: Record<string, unknown>): Promise<SceneApiResponse> => {
  if (!isSceneId(body.sceneId)) {
    return errorResponse(400, "sceneId must be the scene to publish.");
  }

  const sceneId = body.sceneId;
  const saved = await readSavedScene(config, userId, sceneId);

  if (!saved) {
    return errorResponse(404, "Scene not found.");
  }

  if (!saved.document) {
    return errorResponse(409, "This scene hasn't been saved yet. Try again in a moment.");
  }

  const publishId = await reservePublishId(config, userId, sceneId);

  if (!publishId) {
    return errorResponse(404, "Scene not found.");
  }

  const documentKey = publishedDocumentKey(publishId);

  try {
    await config.dynamo.send(
      new PutItemCommand({
        TableName: config.publishedTableName,
        Item: {
          sceneId: { S: publishId },
          documentKey: { S: documentKey },
          ownerId: { S: userId },
          sourceSceneId: { S: sceneId },
          updatedAt: { S: new Date().toISOString() },
          // A string set can't be empty, so a scene without imported assets has none.
          ...(saved.assetHashes.length > 0 ? { assetHashes: { SS: saved.assetHashes } } : {}),
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

  await config.s3.send(
    new PutObjectCommand({ Bucket: config.bucketName, Key: documentKey, Body: saved.document, ContentType: "application/json" }),
  );
  // Published as a GLB before scenes were published whole: nothing reads that any more.
  await deleteObjectQuietly(config, publishedGlbKey(publishId));

  return json(200, { publishId });
};

export const handlePublishRequest = async (request: PublishApiRequest, env: ServerEnv): Promise<SceneApiResponse> => {
  if (request.method.toUpperCase() !== "POST") {
    return methodNotAllowed("POST");
  }

  // Publishing makes the scene public, so only a signed-in owner may.
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
    const documentKey = item?.documentKey?.S;
    const ownerId = item?.ownerId?.S;

    if (!documentKey || !ownerId) {
      return item?.assetKey?.S
        ? errorResponse(410, "This scene was published with an older version of Libre3D. Its owner needs to publish it again.")
        : errorResponse(404, "Scene not found.");
    }

    const object = await config.s3.send(new GetObjectCommand({ Bucket: config.bucketName, Key: documentKey }));
    const document: unknown = JSON.parse((await object.Body?.transformToString()) ?? "null");
    const hashes = (item?.assetHashes?.SS ?? []).filter(isAssetHash);
    const assets = Object.fromEntries(
      await Promise.all(
        hashes.map(async (hash) => [
          hash,
          await getSignedUrl(config.s3, new GetObjectCommand({ Bucket: config.bucketName, Key: assetKey(ownerId, hash) }), {
            expiresIn: ASSET_URL_TTL_SECONDS,
          }),
        ]),
      ),
    );

    // The URLs expire, so nothing may keep this answer for later.
    return json(200, { document, assets }, { "Cache-Control": "no-store" });
  } catch (error) {
    console.error(`Published scene API error (${request.publishId}):`, error);
    return errorResponse(500, "Something went wrong on the server. Try again.");
  }
};
