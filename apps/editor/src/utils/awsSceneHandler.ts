/**
 * PURPOSE: Server-side (Node) logic for the signed-in user's scenes, `/api/scenes[/:sceneId]`.
 *
 * INPUT: The request's method, scene ID path segment, headers (for the access token), and body.
 * OUTPUT: The status and JSON body to answer with.
 *
 * Routes (all require sign-in):
 *   GET    /api/scenes       the caller's scenes, newest first
 *   POST   /api/scenes       create one `{ name? }` (empty: revision 0 until its first save)
 *   GET    /api/scenes/:id   one scene's row and document (`null` until its first save)
 *   PUT    /api/scenes/:id   save `{ document, baseRevision, sessionId }`; 423 unless that editor
 *                             session holds the lock, 409 when another save got there first
 *   PATCH  /api/scenes/:id   rename `{ name }`
 *   DELETE /api/scenes/:id   delete the row and its S3 objects
 *   POST   /api/scenes/:id/lock   claim or renew the editing lock `{ sessionId, takeOver? }`; 423 when
 *                                  another session holds it
 *   DELETE /api/scenes/:id/lock   release it `{ sessionId }` (a no-op unless that session holds it)
 *   POST   /api/scenes/:id/assets/uploads    `{ sessionId, assets: [{ hash, size, kind }] }`: presigned
 *                                            PUTs for the assets the cloud doesn't have yet; 423
 *                                            unless that editor session holds the lock
 *   POST   /api/scenes/:id/assets/downloads  `{ hashes }`: presigned GETs for the scene's assets
 *
 * The lock is a lease on the row (`lockHolder`, `lockUserId`, `lockExpiresAt`): one editor session
 * (a browser tab) holds it for 60 s at a time and renews it while open; saves renew it too. Only the
 * holder can save, so a second tab or device is read-only even if its UI misbehaves. `takeOver`
 * moves the lock regardless; the old holder's next save or renewal finds out. Times are this
 * server's clock only.
 *
 * The Vercel functions (`api/scenes/index.ts`, `api/scenes/[sceneId].ts`) and the Vite dev
 * middleware are thin adapters around `handleScenesRequest`, so routing, validation, and
 * responses live only here and the two environments cannot drift.
 *
 * Imported models and textures are content-addressed (sceneAssets.ts): `users/<sub>/assets/<hash>`,
 * shared by every scene of that user that uses them, so deleting a scene leaves them. The browser
 * uploads and downloads them directly with presigned URLs; each PUT is signed with the hash, so S3
 * refuses bytes that don't match their address. A save may only name assets the cloud has (422
 * otherwise), so a saved scene always opens complete elsewhere. The row lists the assets its
 * document uses (`assetHashes`): later saves check only new ones, and downloads are limited to them.
 *
 * Ownership is by construction: every row is keyed by the verified token's `sub` (the user-scenes
 * partition key) and every object lives under `users/<sub>/`, so there is no way to name someone
 * else's scene; a published copy (awsPublishHandler.ts) is found through the row's `publishId`. The
 * document itself is opaque here, apart from finding its assets (`collectAssetHashes`); the editor
 * owns its shape (sceneDocument.ts).
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
  HeadObjectCommand,
  ListObjectsV2Command,
  NoSuchKey,
  NotFound,
  PutObjectCommand,
  type S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// `.js` is required: Vercel runs server modules under Node's ES module loader (see awsConfig.ts).
import { createDynamoClient, createS3Client, readAwsAccess, readRequiredEnv, type ServerEnv } from "./awsConfig.js";
import { MAX_ASSET_BYTES, assetHashToBase64, collectAssetHashes, isAssetHash, type AssetKind } from "./sceneAssets.js";
import { verifyAuth } from "./verifyAuth.js";

/** What follows `/api/scenes/:sceneId/`, if anything. */
export type SceneSubresource = "lock" | "assets/uploads" | "assets/downloads";

export interface SceneApiRequest {
  method: string;
  /** The `:sceneId` path segment, or null for the collection (`/api/scenes`). */
  sceneId: string | null;
  /** `lock` for `/api/scenes/:sceneId/lock`, and so on; absent for the scene itself. */
  subresource?: SceneSubresource | null;
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
  /** Set once the scene has been published; its share link is `/v/<publishId>`. */
  publishId?: string;
}

export interface SceneConfig {
  bucketName: string;
  /** user-scenes */
  tableName: string;
  /** published-scenes: publish ID → published GLB and its owner. */
  publishedTableName: string;
  s3: S3Client;
  dynamo: DynamoDBClient;
}

const DEFAULT_SCENE_NAME = "Untitled scene";
const MAX_NAME_LENGTH = 120;
// Imported model/texture bytes are never in the document (they're referenced by ID), so a real
// scene is a few hundred kB at most. Well under Vercel's 4.5 MB request body limit.
const MAX_DOCUMENT_BYTES = 2 * 1024 * 1024;
const SCENE_ID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
// Editor sessions are random UUIDs made per tab (editorSession.ts); anything else is malformed.
const SESSION_ID_PATTERN = SCENE_ID_PATTERN;
// How long a claim or save holds the lock. The editor renews every 20 s, so a closed tab that
// couldn't release frees the scene within a minute.
const LOCK_LEASE_MS = 60_000;
const LOCKED_MESSAGE = "This scene is open somewhere else.";
// How long a presigned asset URL works. The editor asks for a new one if an upload waits longer.
const ASSET_URL_TTL_SECONDS = 900;
// Per uploads/downloads request; the editor asks in batches.
const MAX_ASSETS_PER_REQUEST = 100;
// Per scene. Each new one costs a HEAD on the save that adds it, and they're all listed on the row.
const MAX_SCENE_ASSETS = 500;
const ASSET_CONTENT_TYPES: Record<AssetKind, string> = { model: "model/gltf-binary", texture: "image/png" };

export const json = (status: number, body: unknown, headers?: Record<string, string>): SceneApiResponse => ({
  status,
  body,
  headers,
});

export const errorResponse = (status: number, error: string, extra: Record<string, unknown> = {}): SceneApiResponse =>
  json(status, { error, ...extra });

export const readSceneConfig = (env: ServerEnv): SceneConfig => {
  const access = readAwsAccess(env);

  return {
    bucketName: readRequiredEnv(env, "S3_BUCKET_NAME"),
    tableName: readRequiredEnv(env, "USER_SCENES_TABLE_NAME"),
    publishedTableName: readRequiredEnv(env, "PUBLISHED_SCENES_TABLE_NAME"),
    s3: createS3Client(access),
    dynamo: createDynamoClient(access),
  };
};

// ---- Request parsing ------------------------------------------------------------------------

export const parseBody = (body: unknown): Record<string, unknown> => {
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

/** Scene and publish IDs are UUIDs made by the server; anything else can't name one. */
export const isSceneId = (value: unknown): value is string => typeof value === "string" && SCENE_ID_PATTERN.test(value);

const readSessionId = (value: unknown): string | null =>
  typeof value === "string" && SESSION_ID_PATTERN.test(value) ? value : null;

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

// Everything stored for one scene starts with this prefix (document versions, later the
// thumbnail), so deleting a scene is one prefix sweep. Its published copy lives elsewhere (publishedGlbKey).
const sceneObjectPrefix = (userId: string, sceneId: string): string => `users/${userId}/scenes/${sceneId}.`;

// Each save writes a new object and then points the row at it, so a save that loses the revision
// race never overwrites the winner's document (see saveScene).
const newDocumentKey = (userId: string, sceneId: string): string =>
  `${sceneObjectPrefix(userId, sceneId)}${randomUUID()}.json`;

/** Where a published scene's GLB lives. Outside `users/`: the public viewer reads it by publish ID. */
export const publishedGlbKey = (publishId: string): string => `scenes/${publishId}.glb`;

export const rowKey = (userId: string, sceneId: string): Record<string, AttributeValue> => ({
  userId: { S: userId },
  sceneId: { S: sceneId },
});

const assetKey = (userId: string, hash: string): string => `users/${userId}/assets/${hash}`;

/** The assets the row's document uses, as recorded by the save that wrote it. */
const readAssetHashes = (item: Record<string, AttributeValue> | undefined): Set<string> => new Set(item?.assetHashes?.SS ?? []);

// 423 Locked: another editor session holds the scene. `heldByYou` is false only once scenes can be
// shared; today every row belongs to one user, so it's always one of their own tabs or devices.
const lockedResponse = (item: Record<string, AttributeValue>, userId: string): SceneApiResponse =>
  errorResponse(423, LOCKED_MESSAGE, {
    revision: Number(item.revision?.N ?? "0"),
    heldByYou: (item.lockUserId?.S ?? userId) === userId,
  });

const lockExpiry = (): string => String(Date.now() + LOCK_LEASE_MS);

const toSummary = (item: Record<string, AttributeValue>): SceneSummaryBody => ({
  sceneId: item.sceneId?.S ?? "",
  name: item.name?.S ?? DEFAULT_SCENE_NAME,
  updatedAt: item.updatedAt?.S ?? "",
  publishId: item.publishId?.S,
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

// Whether the cloud has this asset intact: uploaded through a URL signed with its hash (so S3
// checked the bytes against it) and within the size cap. Anything else at the key counts as
// missing, so the next upload replaces it.
const isAssetStored = async (config: SceneConfig, userId: string, hash: string): Promise<boolean> => {
  try {
    const head = await config.s3.send(
      new HeadObjectCommand({ Bucket: config.bucketName, Key: assetKey(userId, hash), ChecksumMode: "ENABLED" }),
    );

    return head.ChecksumSHA256 === assetHashToBase64(hash) && (head.ContentLength ?? Infinity) <= MAX_ASSET_BYTES;
  } catch (error) {
    // A 404 needs the role's ListBucket; without it S3 answers 403, which throws here instead.
    if (error instanceof NotFound) {
      return false;
    }

    throw error;
  }
};

const findMissingAssets = async (config: SceneConfig, userId: string, hashes: string[]): Promise<string[]> => {
  const stored = await Promise.all(hashes.map((hash) => isAssetStored(config, userId, hash)));

  return hashes.filter((_hash, index) => !stored[index]);
};

type AssetCheck = { ok: true; hashes: string[] } | { ok: false; response: SceneApiResponse };

// A saved document may only name assets the cloud has, so the scene opens complete anywhere. Those
// the row already lists were checked by an earlier save, so only new ones are looked up.
const checkDocumentAssets = async (
  config: SceneConfig,
  userId: string,
  document: unknown,
  known: Set<string>,
): Promise<AssetCheck> => {
  const hashes = collectAssetHashes((document as { scene?: { entities?: unknown } }).scene?.entities);

  if (hashes.length > MAX_SCENE_ASSETS) {
    return { ok: false, response: errorResponse(413, "This scene has too many imported files to save.") };
  }

  const missing = await findMissingAssets(
    config,
    userId,
    hashes.filter((hash) => !known.has(hash)),
  );

  if (missing.length > 0) {
    return {
      ok: false,
      response: errorResponse(422, "Some of this scene's imported files haven't been uploaded yet.", { missingAssets: missing }),
    };
  }

  return { ok: true, hashes };
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
        ProjectionExpression: "sceneId, #name, updatedAt, publishId",
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
    // assetHashes: the editor never uploads these again.
    scene: { ...toSummary(item), revision: Number(item.revision?.N ?? "0"), assetHashes: Array.from(readAssetHashes(item)) },
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

  const sessionId = readSessionId(body.sessionId);

  if (!sessionId) {
    // A tab still running the editor from before the lock existed. 409 makes it stop and offer
    // Reload (its "changed somewhere else" state), which is what it needs.
    return errorResponse(409, "Reload the page to keep editing this scene.");
  }

  const check = checkDocument(body.document);

  if (!check.ok) {
    return check.response;
  }

  // Read the row first: a tab without the lock is told so before anything is written or looked up,
  // and the assets earlier saves already checked needn't be checked again.
  const { Item: current } = await config.dynamo.send(
    new GetItemCommand({ TableName: config.tableName, Key: rowKey(userId, sceneId), ConsistentRead: true }),
  );

  if (!current) {
    return errorResponse(404, "This scene was deleted.");
  }

  if (current.lockHolder?.S !== sessionId) {
    return lockedResponse(current, userId);
  }

  const assets = await checkDocumentAssets(config, userId, body.document, readAssetHashes(current));

  if (!assets.ok) {
    return assets.response;
  }

  // Write the new document under a fresh key first, then move the row to it only if this session
  // still holds the lock and nobody saved in between (`revision = baseRevision`); the read above
  // could be stale by now. Whichever save loses deletes its own object, so the S3 document and the
  // row can't disagree and neither a read-only tab nor a stale one can overwrite a newer save. The
  // lease isn't checked here: a lapsed lock nobody else claimed is still this session's, and the
  // save renews it.
  const documentKey = newDocumentKey(userId, sceneId);
  await putDocument(config, documentKey, check.serialized);

  const now = new Date().toISOString();
  const revision = baseRevision + 1;
  const values: Record<string, AttributeValue> = {
    ":revision": { N: String(revision) },
    ":base": { N: String(baseRevision) },
    ":now": { S: now },
    ":key": { S: documentKey },
    ":schema": { N: String(check.schemaVersion) },
    ":session": { S: sessionId },
    ":expires": { N: lockExpiry() },
  };

  // A string set can't be empty, so a scene without assets has none.
  if (assets.hashes.length > 0) {
    values[":assets"] = { SS: assets.hashes };
  }

  let previousKey: string | undefined;

  try {
    const result = await config.dynamo.send(
      new UpdateItemCommand({
        TableName: config.tableName,
        Key: rowKey(userId, sceneId),
        UpdateExpression: `SET #revision = :revision, updatedAt = :now, documentKey = :key, schemaVersion = :schema, lockExpiresAt = :expires${
          assets.hashes.length > 0 ? ", assetHashes = :assets" : " REMOVE assetHashes"
        }`,
        ConditionExpression: "attribute_exists(sceneId) AND lockHolder = :session AND #revision = :base",
        ExpressionAttributeNames: { "#revision": "revision" },
        ExpressionAttributeValues: values,
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

    if (error.Item.lockHolder?.S !== sessionId) {
      return lockedResponse(error.Item, userId);
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

const claimLock = async (
  config: SceneConfig,
  userId: string,
  sceneId: string,
  body: Record<string, unknown>,
): Promise<SceneApiResponse> => {
  const sessionId = readSessionId(body.sessionId);

  if (!sessionId) {
    return errorResponse(400, "sessionId must be this editor session's ID.");
  }

  const takeOver = body.takeOver === true;
  const values: Record<string, AttributeValue> = {
    ":session": { S: sessionId },
    ":user": { S: userId },
    ":expires": { N: lockExpiry() },
  };

  if (!takeOver) {
    values[":now"] = { N: String(Date.now()) };
  }

  try {
    const result = await config.dynamo.send(
      new UpdateItemCommand({
        TableName: config.tableName,
        Key: rowKey(userId, sceneId),
        UpdateExpression: "SET lockHolder = :session, lockUserId = :user, lockExpiresAt = :expires",
        // Free, already ours (a renewal), or lapsed. A take-over skips that.
        ConditionExpression: takeOver
          ? "attribute_exists(sceneId)"
          : "attribute_exists(sceneId) AND (attribute_not_exists(lockHolder) OR lockHolder = :session OR lockExpiresAt < :now)",
        ExpressionAttributeValues: values,
        ReturnValues: "ALL_NEW",
        ReturnValuesOnConditionCheckFailure: "ALL_OLD",
      }),
    );

    // The revision lets the editor tell whether the scene it shows is still the latest.
    return json(200, { revision: Number(result.Attributes?.revision?.N ?? "0") });
  } catch (error) {
    if (!(error instanceof ConditionalCheckFailedException)) {
      throw error;
    }

    return error.Item ? lockedResponse(error.Item, userId) : errorResponse(404, "Scene not found.");
  }
};

const releaseLock = async (
  config: SceneConfig,
  userId: string,
  sceneId: string,
  body: Record<string, unknown>,
): Promise<SceneApiResponse> => {
  const sessionId = readSessionId(body.sessionId);

  if (!sessionId) {
    return errorResponse(400, "sessionId must be this editor session's ID.");
  }

  try {
    await config.dynamo.send(
      new UpdateItemCommand({
        TableName: config.tableName,
        Key: rowKey(userId, sceneId),
        UpdateExpression: "REMOVE lockHolder, lockUserId, lockExpiresAt",
        ConditionExpression: "lockHolder = :session",
        ExpressionAttributeValues: { ":session": { S: sessionId } },
      }),
    );
  } catch (error) {
    if (error instanceof ConditionalCheckFailedException) {
      // Taken over, lapsed and claimed, or the scene is gone: nothing of ours to release.
      return json(200, { released: false });
    }

    throw error;
  }

  return json(200, { released: true });
};

interface AssetUpload {
  hash: string;
  size: number;
  kind: AssetKind;
}

type AssetUploadsCheck = { ok: true; assets: AssetUpload[] } | { ok: false; response: SceneApiResponse };

const readAssetUploads = (value: unknown): AssetUploadsCheck => {
  if (!Array.isArray(value) || value.length === 0 || value.length > MAX_ASSETS_PER_REQUEST) {
    return { ok: false, response: errorResponse(400, `assets must list 1 to ${MAX_ASSETS_PER_REQUEST} files.`) };
  }

  const assets = new Map<string, AssetUpload>();

  for (const entry of value) {
    const { hash, size, kind } = (typeof entry === "object" && entry !== null ? entry : {}) as Record<string, unknown>;

    if (
      !isAssetHash(hash) ||
      (kind !== "model" && kind !== "texture") ||
      typeof size !== "number" ||
      !Number.isInteger(size) ||
      size < 1
    ) {
      return { ok: false, response: errorResponse(400, "Each asset needs its SHA-256 hash, its size in bytes, and its kind.") };
    }

    if (size > MAX_ASSET_BYTES) {
      return {
        ok: false,
        response: errorResponse(413, `Imported files can be up to ${MAX_ASSET_BYTES / (1024 * 1024)} MB.`, { hash }),
      };
    }

    assets.set(hash, { hash, size, kind });
  }

  return { ok: true, assets: Array.from(assets.values()) };
};

const prepareUploads = async (
  config: SceneConfig,
  userId: string,
  sceneId: string,
  body: Record<string, unknown>,
): Promise<SceneApiResponse> => {
  const sessionId = readSessionId(body.sessionId);

  if (!sessionId) {
    return errorResponse(400, "sessionId must be this editor session's ID.");
  }

  const request = readAssetUploads(body.assets);

  if (!request.ok) {
    return request.response;
  }

  try {
    // Only the editor session holding the lock adds to the scene, and uploading counts as editing:
    // it renews the lease like a save does.
    await config.dynamo.send(
      new UpdateItemCommand({
        TableName: config.tableName,
        Key: rowKey(userId, sceneId),
        UpdateExpression: "SET lockExpiresAt = :expires",
        ConditionExpression: "attribute_exists(sceneId) AND lockHolder = :session",
        ExpressionAttributeValues: { ":session": { S: sessionId }, ":expires": { N: lockExpiry() } },
        ReturnValuesOnConditionCheckFailure: "ALL_OLD",
      }),
    );
  } catch (error) {
    if (!(error instanceof ConditionalCheckFailedException)) {
      throw error;
    }

    return error.Item ? lockedResponse(error.Item, userId) : errorResponse(404, "Scene not found.");
  }

  const missing = new Set(
    await findMissingAssets(
      config,
      userId,
      request.assets.map((asset) => asset.hash),
    ),
  );
  const uploads = await Promise.all(
    request.assets
      .filter((asset) => missing.has(asset.hash))
      .map(async (asset) => {
        // The browser sends these headers as they are; they're part of the signature.
        const headers = {
          "Content-Type": ASSET_CONTENT_TYPES[asset.kind],
          "x-amz-checksum-sha256": assetHashToBase64(asset.hash),
        };
        const url = await getSignedUrl(
          config.s3,
          new PutObjectCommand({
            Bucket: config.bucketName,
            Key: assetKey(userId, asset.hash),
            ContentType: headers["Content-Type"],
            ContentLength: asset.size,
            ChecksumSHA256: headers["x-amz-checksum-sha256"],
          }),
          {
            expiresIn: ASSET_URL_TTL_SECONDS,
            // Size, type, and checksum all signed as headers: S3 then refuses a body of another
            // length (403) or other bytes (400 BadDigest). With the presigner's defaults the
            // checksum moves into the query string, where a wrong body isn't caught the same way.
            signableHeaders: new Set(["content-length", "content-type"]),
            unhoistableHeaders: new Set(["x-amz-checksum-sha256"]),
          },
        );

        return { hash: asset.hash, url, headers };
      }),
  );

  return json(200, { uploads });
};

const prepareDownloads = async (
  config: SceneConfig,
  userId: string,
  sceneId: string,
  body: Record<string, unknown>,
): Promise<SceneApiResponse> => {
  const requested = body.hashes;

  if (
    !Array.isArray(requested) ||
    requested.length === 0 ||
    requested.length > MAX_ASSETS_PER_REQUEST ||
    !requested.every(isAssetHash)
  ) {
    return errorResponse(400, `hashes must list 1 to ${MAX_ASSETS_PER_REQUEST} asset hashes.`);
  }

  const { Item: item } = await config.dynamo.send(
    new GetItemCommand({ TableName: config.tableName, Key: rowKey(userId, sceneId), ConsistentRead: true }),
  );

  if (!item) {
    return errorResponse(404, "Scene not found.");
  }

  // Only the assets the scene's saved document uses: everything it can show, and (once scenes can
  // be shared) exactly what someone allowed to view it may read.
  const available = readAssetHashes(item);
  const hashes = Array.from(new Set(requested));
  const downloads = await Promise.all(
    hashes
      .filter((hash) => available.has(hash))
      .map(async (hash) => ({
        hash,
        url: await getSignedUrl(config.s3, new GetObjectCommand({ Bucket: config.bucketName, Key: assetKey(userId, hash) }), {
          expiresIn: ASSET_URL_TTL_SECONDS,
        }),
      })),
  );

  return json(200, { downloads, unavailable: hashes.filter((hash) => !available.has(hash)) });
};

// ---- Dispatch -------------------------------------------------------------------------------

export const handleScenesRequest = async (request: SceneApiRequest, env: ServerEnv): Promise<SceneApiResponse> => {
  const method = request.method.toUpperCase();
  const subresource = request.subresource ?? null;
  const isLock = subresource === "lock";
  const allowed =
    request.sceneId === null
      ? ["GET", "POST"]
      : isLock
        ? ["POST", "DELETE"]
        : subresource
          ? ["POST"]
          : ["GET", "PUT", "PATCH", "DELETE"];

  if (!allowed.includes(method)) {
    return json(405, { error: "Method not allowed" }, { Allow: allowed.join(", ") });
  }

  const auth = await verifyAuth(request.headers, env);

  if (!auth.authorized) {
    return errorResponse(auth.status, auth.error);
  }

  if (request.sceneId !== null && !isSceneId(request.sceneId)) {
    return errorResponse(404, "Scene not found.");
  }

  try {
    const config = readSceneConfig(env);
    const body = parseBody(request.body);

    if (request.sceneId === null) {
      return method === "GET" ? await listScenes(config, auth.userId) : await createScene(config, auth.userId, body);
    }

    if (isLock) {
      return method === "POST"
        ? await claimLock(config, auth.userId, request.sceneId, body)
        : await releaseLock(config, auth.userId, request.sceneId, body);
    }

    if (subresource === "assets/uploads") {
      return await prepareUploads(config, auth.userId, request.sceneId, body);
    }

    if (subresource === "assets/downloads") {
      return await prepareDownloads(config, auth.userId, request.sceneId, body);
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
    console.error(`Scene API error (${method} ${request.sceneId ?? "collection"}${subresource ? `/${subresource}` : ""}):`, error);
    return errorResponse(500, "Something went wrong on the server. Try again.");
  }
};
