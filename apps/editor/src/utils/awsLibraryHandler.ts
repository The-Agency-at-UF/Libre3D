/**
 * PURPOSE: Server side of the Libre3D material library (`/api/library/materials`): the materials
 * every scene can pick from, kept by Libre3D's developers.
 *
 * - `GET`: the whole library. Public, like a published scene: guests at `/try` see it too.
 * - `POST { name, category, layers, opacity? }`: adds a material. Returns `{ material }`.
 * - `DELETE { id }`: removes one.
 *
 * Adding and removing need a signed-in user in the Cognito group `library-editors`
 * (materialLibraryShared.ts). The group comes from the verified access token, never from the
 * request, so nobody can claim it.
 *
 * The library is one JSON object in the stage's bucket (`library/materials.json`): it is small and
 * always read whole. A write reads it, changes it and puts it back, so two developers adding in the
 * same second could lose one of the two; with a handful of developers that is accepted for now.
 *
 * A library material can't hold pictures yet (Image, Matcap or Displace layers with a picture, or
 * Lighting maps): pictures are stored per user, and the library has no shared place for them.
 *
 * Called by `api/library/materials.ts` and the Vite dev middleware (`vite.config.ts`).
 */

import { randomUUID } from "node:crypto";
import type { IncomingHttpHeaders } from "node:http";

import { GetObjectCommand, NoSuchKey, PutObjectCommand, type S3Client } from "@aws-sdk/client-s3";

// `.js` is required: Vercel runs server modules under Node's ES module loader (see awsConfig.ts).
import { getAwsClients, readRequiredEnv, type ServerEnv } from "./awsConfig.js";
import { errorResponse, json, parseBody, type SceneApiResponse } from "./awsSceneHandler.js";
import {
  DEFAULT_LIBRARY_CATEGORY,
  LIBRARY_EDITORS_GROUP,
  MAX_LIBRARY_CATEGORY_LENGTH,
  MAX_LIBRARY_NAME_LENGTH,
  type LibraryMaterial,
} from "./materialLibraryShared.js";
import { collectAssetHashes } from "./sceneAssets.js";
import { verifyAuth } from "./verifyAuth.js";

export interface LibraryApiRequest {
  method: string;
  headers: IncomingHttpHeaders;
  /** Raw JSON string (Vite middleware) or an already-parsed object (Vercel). */
  body?: unknown;
}

interface LibraryConfig {
  bucketName: string;
  s3: S3Client;
}

export const LIBRARY_MATERIALS_KEY = "library/materials.json";
const LIBRARY_FILE_VERSION = 1;
const MAX_LIBRARY_MATERIALS = 500;
const MAX_LAYERS = 32;
// A stack is a few kB; this only stops something that isn't one.
const MAX_MATERIAL_BYTES = 64 * 1024;
const ALLOWED_METHODS = ["GET", "POST", "DELETE"];

const isObject = (value: unknown): value is Record<string, unknown> => typeof value === "object" && value !== null && !Array.isArray(value);

const readLibrary = async (config: LibraryConfig): Promise<LibraryMaterial[]> => {
  try {
    const object = await config.s3.send(new GetObjectCommand({ Bucket: config.bucketName, Key: LIBRARY_MATERIALS_KEY }));
    const file: unknown = JSON.parse((await object.Body?.transformToString()) ?? "null");
    return isObject(file) && Array.isArray(file.materials) ? (file.materials as LibraryMaterial[]) : [];
  } catch (error) {
    // Nothing has been added yet.
    if (error instanceof NoSuchKey) return [];
    throw error;
  }
};

const writeLibrary = async (config: LibraryConfig, materials: LibraryMaterial[]): Promise<void> => {
  await config.s3.send(
    new PutObjectCommand({
      Bucket: config.bucketName,
      Key: LIBRARY_MATERIALS_KEY,
      Body: JSON.stringify({ version: LIBRARY_FILE_VERSION, materials }),
      ContentType: "application/json",
    }),
  );
};

const readText = (value: unknown, maxLength: number): string | null => {
  const text = typeof value === "string" ? value.trim() : "";
  return text && text.length <= maxLength ? text : null;
};

const addMaterial = async (config: LibraryConfig, body: Record<string, unknown>): Promise<SceneApiResponse> => {
  const name = readText(body.name, MAX_LIBRARY_NAME_LENGTH);
  if (!name) {
    return errorResponse(400, `A library material needs a name of at most ${MAX_LIBRARY_NAME_LENGTH} characters.`);
  }

  const category = body.category === undefined || body.category === "" ? DEFAULT_LIBRARY_CATEGORY : readText(body.category, MAX_LIBRARY_CATEGORY_LENGTH);
  if (!category) {
    return errorResponse(400, `A category is at most ${MAX_LIBRARY_CATEGORY_LENGTH} characters.`);
  }

  const { layers } = body;
  if (
    !Array.isArray(layers) ||
    layers.length === 0 ||
    layers.length > MAX_LAYERS ||
    !layers.every((layer) => isObject(layer) && typeof layer.id === "string" && typeof layer.type === "string")
  ) {
    return errorResponse(400, "layers must be the material's layer stack.");
  }

  if (Buffer.byteLength(JSON.stringify(layers), "utf8") > MAX_MATERIAL_BYTES) {
    return errorResponse(413, "This material is too large for the library.");
  }

  if (collectAssetHashes({ materials: { material: { layers } } }).length > 0) {
    return errorResponse(422, "A material with pictures can't be added to the library yet.");
  }

  const opacity = typeof body.opacity === "number" && Number.isFinite(body.opacity) ? Math.min(1, Math.max(0, body.opacity)) : 1;
  const materials = await readLibrary(config);

  if (materials.length >= MAX_LIBRARY_MATERIALS) {
    return errorResponse(413, "The library is full.");
  }

  const material: LibraryMaterial = {
    id: randomUUID(),
    name,
    category,
    layers,
    ...(opacity < 1 ? { opacity } : null),
    addedAt: new Date().toISOString(),
  };

  await writeLibrary(config, [...materials, material]);
  return json(201, { material });
};

const removeMaterial = async (config: LibraryConfig, body: Record<string, unknown>): Promise<SceneApiResponse> => {
  const materials = await readLibrary(config);
  const kept = materials.filter((material) => material.id !== body.id);

  if (typeof body.id !== "string" || kept.length === materials.length) {
    return errorResponse(404, "That material isn't in the library.");
  }

  await writeLibrary(config, kept);
  return json(200, { removed: body.id });
};

export const handleMaterialLibraryRequest = async (request: LibraryApiRequest, env: ServerEnv): Promise<SceneApiResponse> => {
  const method = request.method.toUpperCase();

  if (!ALLOWED_METHODS.includes(method)) {
    return json(405, { error: "Method not allowed" }, { Allow: ALLOWED_METHODS.join(", ") });
  }

  if (method !== "GET") {
    const auth = await verifyAuth(request.headers, env);

    if (!auth.authorized) {
      return errorResponse(auth.status, auth.error);
    }

    if (!auth.groups.includes(LIBRARY_EDITORS_GROUP)) {
      return errorResponse(403, "Only Libre3D developers can change the material library.");
    }
  }

  try {
    const config: LibraryConfig = { bucketName: readRequiredEnv(env, "S3_BUCKET_NAME"), s3: getAwsClients(env).s3 };

    if (method === "GET") {
      return json(200, { materials: await readLibrary(config) });
    }

    const body = parseBody(request.body);
    return method === "POST" ? await addMaterial(config, body) : await removeMaterial(config, body);
  } catch (error) {
    console.error(`Material library API error (${method}):`, error);
    return errorResponse(500, "Something went wrong on the server. Try again.");
  }
};
