/**
 * PURPOSE: Server-side (Node) logic for the signed-in user's scenes, `/api/scenes[/:sceneId]`.
 *
 * INPUT: The request's method, scene ID path segment, headers (for the access token), and body.
 * OUTPUT: The status and JSON body to answer with.
 *
 * Routes (all require sign-in):
 *   GET    /api/scenes       the caller's scenes, newest first
 *   POST   /api/scenes       create one `{ name?, document? }`
 *   GET    /api/scenes/:id   one scene's row and document (`null` until its first save)
 *   PUT    /api/scenes/:id   save `{ document, baseRevision }`; 409 when another save got there first
 *   PATCH  /api/scenes/:id   rename `{ name }`
 *   DELETE /api/scenes/:id   delete the row and its S3 objects
 *
 * The Vercel functions (`api/scenes/index.ts`, `api/scenes/[sceneId].ts`) and the Vite dev
 * middleware are thin adapters around `handleScenesRequest`, so routing, validation, and
 * responses live only here and the two environments cannot drift.
 *
 * Ownership is by construction: every row is keyed by the verified token's `sub` (the user-scenes
 * partition key) and every object lives under `users/<sub>/`, so there is no way to name someone
 * else's scene. The document itself is opaque here; the editor owns its shape (sceneDocument.ts).
 */

import { randomUUID } from "node:crypto";
import type { IncomingHttpHeaders } from "node:http";

import {
  ConditionalCheckFailedException,
  DeleteItemCommand,
  GetItemCommand,
  PutItemCommand,
  QueryCommand,
  UpdateItemCommand,
  type AttributeValue,
  type DynamoDBClient,
} from "@aws-sdk/client-dynamodb";
import {
  DeleteObjectCommand,
  DeleteObjectsCommand,
  GetObjectCommand,
  ListObjectsV2Command,
  NoSuchKey,
  PutObjectCommand,
  type S3Client,
} from "@aws-sdk/client-s3";

// `.js` is required: Vercel runs server modules under Node's ES module loader (see awsConfig.ts).
import { createDynamoClient, createS3Client, readAwsAccess, readRequiredEnv, type ServerEnv } from "./awsConfig.js";
import { verifyAuth } from "./verifyAuth.js";

export interface SceneApiRequest {
  method: string;
  /** The `:sceneId` path segment, or null for the collection (`/api/scenes`). */
  sceneId: string | null;
  headers: IncomingHttpHeaders;
  /** Parsed JSON (Vercel) or the raw string (Vite middleware); either is accepted. */
  body: unknown;
}

export interface SceneApiResponse {
  status: number;
  body: unknown;
  headers?: Record<string, string>;
}

interface SceneSummaryBody {
  sceneId: string;
  name: string;
  updatedAt: string;
}

interface SceneConfig {
  bucketName: string;
  tableName: string;
  s3: S3Client;
  dynamo: DynamoDBClient;
}

const DEFAULT_SCENE_NAME = "Untitled scene";
const MAX_NAME_LENGTH = 120;
// Imported model/texture bytes are never in the document (they're referenced by ID), so a real
// scene is a few hundred kB at most. Well under Vercel's 4.5 MB request body limit.
const MAX_DOCUMENT_BYTES = 2 * 1024 * 1024;
const SCENE_ID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const json = (status: number, body: unknown, headers?: Record<string, string>): SceneApiResponse => ({
  status,
  body,
  headers,
});

const errorResponse = (status: number, error: string, extra: Record<string, unknown> = {}): SceneApiResponse =>
  json(status, { error, ...extra });

const readConfig = (env: ServerEnv): SceneConfig => {
  const access = readAwsAccess(env);

  return {
    bucketName: readRequiredEnv(env, "S3_BUCKET_NAME"),
    tableName: readRequiredEnv(env, "USER_SCENES_TABLE_NAME"),
    s3: createS3Client(access),
    dynamo: createDynamoClient(access),
  };
};

// ---- Request parsing ------------------------------------------------------------------------

const parseBody = (body: unknown): Record<string, unknown> => {
  let parsed: unknown = body;

  if (typeof body === "string") {
    if (!body.trim()) {
      return {};
    }

    try {
      parsed = JSON.parse(body);
    } catch {
      return {};
    }
  }

  return typeof parsed === "object" && parsed !== null && !Array.isArray(parsed)
    ? (parsed as Record<string, unknown>)
    : {};
};

const readName = (value: unknown): string | null => {
  if (typeof value !== "string") {
    return null;
  }

  const name = value.trim().slice(0, MAX_NAME_LENGTH);

  return name || null;
};

type DocumentCheck =
  | { ok: true; serialized: string; schemaVersion: number }
  | { ok: false; response: SceneApiResponse };

// Only the envelope is checked. The editor owns the document's shape and its migrations.
const checkDocument = (value: unknown): DocumentCheck => {
  const document = value as { format?: unknown; schemaVersion?: unknown } | null;

  if (
    typeof document !== "object" ||
    document === null ||
    document.format !== "libre3d.scene" ||
    typeof document.schemaVersion !== "number" ||
    !Number.isInteger(document.schemaVersion) ||
    document.schemaVersion < 1
  ) {
    return { ok: false, response: errorResponse(400, "That isn't a Libre3D scene document.") };
  }

  const serialized = JSON.stringify(document);

  if (Buffer.byteLength(serialized, "utf8") > MAX_DOCUMENT_BYTES) {
    return { ok: false, response: errorResponse(413, "This scene is too large to save.") };
  }

  return { ok: true, serialized, schemaVersion: document.schemaVersion };
};

// ---- Storage helpers ------------------------------------------------------------------------

// Everything stored for one scene starts with this prefix (document versions, later the thumbnail),
// so deleting a scene is one prefix sweep.
const sceneObjectPrefix = (userId: string, sceneId: string): string => `users/${userId}/scenes/${sceneId}.`;

// Each save writes a new object and then points the row at it, so a save that loses the revision
// race never overwrites the winner's document (see saveScene).
const newDocumentKey = (userId: string, sceneId: string): string =>
  `${sceneObjectPrefix(userId, sceneId)}${randomUUID()}.json`;

const rowKey = (userId: string, sceneId: string): Record<string, AttributeValue> => ({
  userId: { S: userId },
  sceneId: { S: sceneId },
});

const toSummary = (item: Record<string, AttributeValue>): SceneSummaryBody => ({
  sceneId: item.sceneId?.S ?? "",
  name: item.name?.S ?? DEFAULT_SCENE_NAME,
  updatedAt: item.updatedAt?.S ?? "",
});

const putDocument = async (config: SceneConfig, key: string, serialized: string): Promise<void> => {
  await config.s3.send(
    new PutObjectCommand({
      Bucket: config.bucketName,
      Key: key,
      Body: serialized,
      ContentType: "application/json",
    }),
  );
};

const deleteObjectQuietly = async (config: SceneConfig, key: string): Promise<void> => {
  try {
    await config.s3.send(new DeleteObjectCommand({ Bucket: config.bucketName, Key: key }));
  } catch (error) {
    // Only costs storage: nothing points at this object any more.
    console.warn(`Could not delete unreferenced scene object ${key}:`, error);
  }
};

// ---- Route handlers -------------------------------------------------------------------------

const listScenes = async (config: SceneConfig, userId: string): Promise<SceneApiResponse> => {
  const scenes: SceneSummaryBody[] = [];
  let exclusiveStartKey: Record<string, AttributeValue> | undefined;

  do {
    const page = await config.dynamo.send(
      new QueryCommand({
        TableName: config.tableName,
        KeyConditionExpression: "userId = :userId",
        ExpressionAttributeValues: { ":userId": { S: userId } },
        ExpressionAttributeNames: { "#name": "name" },
        ProjectionExpression: "sceneId, #name, updatedAt",
        ExclusiveStartKey: exclusiveStartKey,
      }),
    );

    page.Items?.forEach((item) => scenes.push(toSummary(item)));
    exclusiveStartKey = page.LastEvaluatedKey;
  } while (exclusiveStartKey);

  // The sort key is sceneId, so order here. A user has tens of scenes, not thousands.
  scenes.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));

  return json(200, { scenes });
};

const createScene = async (
  config: SceneConfig,
  userId: string,
  body: Record<string, unknown>,
): Promise<SceneApiResponse> => {
  const sceneId = randomUUID();
  const name = readName(body.name) ?? DEFAULT_SCENE_NAME;
  const now = new Date().toISOString();
  const item: Record<string, AttributeValue> = {
    ...rowKey(userId, sceneId),
    name: { S: name },
    createdAt: { S: now },
    updatedAt: { S: now },
    // Revision 0 = no document yet; the editor opens the default scene and its first save makes 1.
    revision: { N: "0" },
  };

  // Only the one-time upload of a scene saved in the browser before cloud saving sends a document.
  if (body.document !== undefined) {
    const check = checkDocument(body.document);

    if (!check.ok) {
      return check.response;
    }

    const documentKey = newDocumentKey(userId, sceneId);
    await putDocument(config, documentKey, check.serialized);
    item.revision = { N: "1" };
    item.documentKey = { S: documentKey };
    item.schemaVersion = { N: String(check.schemaVersion) };
  }

  await config.dynamo.send(
    new PutItemCommand({
      TableName: config.tableName,
      Item: item,
      ConditionExpression: "attribute_not_exists(sceneId)",
    }),
  );

  return json(201, { sceneId, name, updatedAt: now });
};

const getScene = async (config: SceneConfig, userId: string, sceneId: string): Promise<SceneApiResponse> => {
  const { Item: item } = await config.dynamo.send(
    new GetItemCommand({ TableName: config.tableName, Key: rowKey(userId, sceneId), ConsistentRead: true }),
  );

  if (!item) {
    return errorResponse(404, "Scene not found.");
  }

  let document: unknown = null;
  const documentKey = item.documentKey?.S;

  if (documentKey) {
    try {
      const object = await config.s3.send(new GetObjectCommand({ Bucket: config.bucketName, Key: documentKey }));
      document = JSON.parse((await object.Body?.transformToString("utf-8")) ?? "null");
    } catch (error) {
      if (!(error instanceof NoSuchKey)) {
        throw error;
      }

      // The row points at a missing object. Report it rather than opening an empty scene that the
      // next autosave would write over whatever recovery is still possible.
      console.error(`Scene ${sceneId} points at missing document ${documentKey}`);
      return errorResponse(500, "This scene's saved data could not be found.");
    }
  }

  return json(200, {
    scene: { ...toSummary(item), revision: Number(item.revision?.N ?? "0") },
    document,
  });
};

const saveScene = async (
  config: SceneConfig,
  userId: string,
  sceneId: string,
  body: Record<string, unknown>,
): Promise<SceneApiResponse> => {
  const baseRevision = body.baseRevision;

  if (typeof baseRevision !== "number" || !Number.isInteger(baseRevision) || baseRevision < 0) {
    return errorResponse(400, "baseRevision must be the revision this save was based on.");
  }

  const check = checkDocument(body.document);

  if (!check.ok) {
    return check.response;
  }

  // Write the new document under a fresh key first, then move the row to it only if nobody saved
  // in between (`revision = baseRevision`). Whichever save loses that race deletes its own object,
  // so the S3 document and the row can't disagree and a stale tab can't overwrite a newer save.
  const documentKey = newDocumentKey(userId, sceneId);
  await putDocument(config, documentKey, check.serialized);

  const now = new Date().toISOString();
  const revision = baseRevision + 1;
  let previousKey: string | undefined;

  try {
    const result = await config.dynamo.send(
      new UpdateItemCommand({
        TableName: config.tableName,
        Key: rowKey(userId, sceneId),
        UpdateExpression: "SET #revision = :revision, updatedAt = :now, documentKey = :key, schemaVersion = :schema",
        ConditionExpression: "attribute_exists(sceneId) AND #revision = :base",
        ExpressionAttributeNames: { "#revision": "revision" },
        ExpressionAttributeValues: {
          ":revision": { N: String(revision) },
          ":base": { N: String(baseRevision) },
          ":now": { S: now },
          ":key": { S: documentKey },
          ":schema": { N: String(check.schemaVersion) },
        },
        ReturnValues: "UPDATED_OLD",
        ReturnValuesOnConditionCheckFailure: "ALL_OLD",
      }),
    );

    previousKey = result.Attributes?.documentKey?.S;
  } catch (error) {
    if (!(error instanceof ConditionalCheckFailedException)) {
      await deleteObjectQuietly(config, documentKey);
      throw error;
    }

    await deleteObjectQuietly(config, documentKey);

    if (!error.Item) {
      return errorResponse(404, "This scene was deleted.");
    }

    return errorResponse(409, "This scene was saved from somewhere else.", {
      revision: Number(error.Item.revision?.N ?? "0"),
    });
  }

  if (previousKey) {
    await deleteObjectQuietly(config, previousKey);
  }

  return json(200, { revision, updatedAt: now });
};

const renameScene = async (
  config: SceneConfig,
  userId: string,
  sceneId: string,
  body: Record<string, unknown>,
): Promise<SceneApiResponse> => {
  const name = readName(body.name);

  if (!name) {
    return errorResponse(400, "A scene needs a name.");
  }

  try {
    // A rename isn't an edit of the scene, so it leaves updatedAt and the revision alone.
    await config.dynamo.send(
      new UpdateItemCommand({
        TableName: config.tableName,
        Key: rowKey(userId, sceneId),
        UpdateExpression: "SET #name = :name",
        ConditionExpression: "attribute_exists(sceneId)",
        ExpressionAttributeNames: { "#name": "name" },
        ExpressionAttributeValues: { ":name": { S: name } },
      }),
    );
  } catch (error) {
    if (error instanceof ConditionalCheckFailedException) {
      return errorResponse(404, "Scene not found.");
    }

    throw error;
  }

  return json(200, { name });
};

const deleteScene = async (config: SceneConfig, userId: string, sceneId: string): Promise<SceneApiResponse> => {
  try {
    // The row first: it's what the gallery lists, so the scene disappears even if S3 cleanup fails.
    await config.dynamo.send(
      new DeleteItemCommand({
        TableName: config.tableName,
        Key: rowKey(userId, sceneId),
        ConditionExpression: "attribute_exists(sceneId)",
      }),
    );
  } catch (error) {
    if (error instanceof ConditionalCheckFailedException) {
      return errorResponse(404, "Scene not found.");
    }

    throw error;
  }

  let continuationToken: string | undefined;

  do {
    const page = await config.s3.send(
      new ListObjectsV2Command({
        Bucket: config.bucketName,
        Prefix: sceneObjectPrefix(userId, sceneId),
        ContinuationToken: continuationToken,
      }),
    );
    const keys = (page.Contents ?? []).flatMap((object) => (object.Key ? [{ Key: object.Key }] : []));

    if (keys.length > 0) {
      await config.s3.send(new DeleteObjectsCommand({ Bucket: config.bucketName, Delete: { Objects: keys } }));
    }

    continuationToken = page.NextContinuationToken;
  } while (continuationToken);

  return json(200, { deleted: true });
};

// ---- Dispatch -------------------------------------------------------------------------------

export const handleScenesRequest = async (request: SceneApiRequest, env: ServerEnv): Promise<SceneApiResponse> => {
  const method = request.method.toUpperCase();
  const allowed = request.sceneId === null ? ["GET", "POST"] : ["GET", "PUT", "PATCH", "DELETE"];

  if (!allowed.includes(method)) {
    return json(405, { error: "Method not allowed" }, { Allow: allowed.join(", ") });
  }

  const auth = await verifyAuth(request.headers, env);

  if (!auth.authorized) {
    return errorResponse(auth.status, auth.error);
  }

  if (request.sceneId !== null && !SCENE_ID_PATTERN.test(request.sceneId)) {
    return errorResponse(404, "Scene not found.");
  }

  try {
    const config = readConfig(env);
    const body = parseBody(request.body);

    if (request.sceneId === null) {
      return method === "GET" ? await listScenes(config, auth.userId) : await createScene(config, auth.userId, body);
    }

    switch (method) {
      case "GET":
        return await getScene(config, auth.userId, request.sceneId);
      case "PUT":
        return await saveScene(config, auth.userId, request.sceneId, body);
      case "PATCH":
        return await renameScene(config, auth.userId, request.sceneId, body);
      default:
        return await deleteScene(config, auth.userId, request.sceneId);
    }
  } catch (error) {
    console.error(`Scene API error (${method} ${request.sceneId ?? "collection"}):`, error);
    return errorResponse(500, "Something went wrong on the server. Try again.");
  }
};
