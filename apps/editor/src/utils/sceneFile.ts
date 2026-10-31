/**
 * PURPOSE: A scene as one file (`.libre3d`), to keep a copy outside the cloud and open it again as a
 * new scene, in this browser or any other, under this account or another.
 *
 * INPUT: A scene document (sceneDocument.ts), its name, and the bytes of the imported models and
 *        pictures it uses (`writeSceneFile`); or a file's bytes (`readSceneFile`).
 * OUTPUT: The file's bytes; or the scene content and assets read back, every asset checked against
 *         its name (the SHA-256 of its bytes, sceneAssets.ts).
 *
 * Laid out like a GLB, all numbers little-endian uint32s: a 12-byte header (the magic "L3DF", the
 * container version, the file's length), then chunks, each its data's length, its type, and its
 * data padded to 4 bytes. The first is "JSON": the scene's name, its document, and where each
 * asset's bytes sit in the second, "BIN\0" (only there when the scene uses imported assets; each
 * asset starts on a 4-byte boundary). Readers skip chunks they don't know, as GLB readers do.
 *
 * The document is the same versioned one the cloud stores, so an older file migrates on read and a
 * newer one is refused, for the same reason (parseSceneDocument). The container has its own version
 * for changes to the layout itself. Store-free and DOM-free, so it's tested in Node.
 */

import { collectAssetRefs, hashAsset, isAssetHash, MAX_ASSET_BYTES, type AssetKind } from "./sceneAssets";
import { parseSceneDocument, type SceneDocument, type StoredSceneContent } from "./sceneDocument";

export const SCENE_FILE_EXTENSION = ".libre3d";

export const isSceneFile = (file: File): boolean => file.name.toLowerCase().endsWith(SCENE_FILE_EXTENSION);

/** A file name for the scene: its name without the characters file systems refuse. */
export const sceneFileName = (name: string): string =>
  `${name.replace(/[\\/:*?"<>|\u0000-\u001f]+/g, "-").trim() || "scene"}${SCENE_FILE_EXTENSION}`;

const MAGIC = 0x4644334c; // "L3DF"
const CONTAINER_VERSION = 1;
const JSON_CHUNK = 0x4e4f534a; // "JSON"
const BIN_CHUNK = 0x004e4942; // "BIN\0"
const HEADER_BYTES = 12;
const CHUNK_HEADER_BYTES = 8;
const FILE_FORMAT = "libre3d.file";

export interface SceneFileAsset {
  hash: string;
  kind: AssetKind;
  bytes: Uint8Array<ArrayBuffer>;
}

interface SceneFileJson {
  format: typeof FILE_FORMAT;
  name: string;
  document: SceneDocument;
  assets: { hash: string; kind: AssetKind; byteOffset: number; byteLength: number }[];
}

export type ReadSceneFile =
  /** `document` is the file's as written (older ones migrate when parsed again); `content` is it parsed. */
  | { ok: true; name: string; document: unknown; content: StoredSceneContent; assets: SceneFileAsset[] }
  /** "invalid": not a scene file, or a damaged one. "newer": saved by a newer Libre3D. */
  | { ok: false; reason: "invalid" | "newer" };

const padTo4 = (length: number): number => (length + 3) & ~3;

/** The scene as a `.libre3d` file's bytes. Throws a RangeError past the format's 4 GB. */
export const writeSceneFile = (scene: { name: string; document: SceneDocument; assets: SceneFileAsset[] }): Uint8Array<ArrayBuffer> => {
  const entries: SceneFileJson["assets"] = [];
  let binLength = 0;

  for (const asset of scene.assets) {
    binLength = padTo4(binLength);
    entries.push({ hash: asset.hash, kind: asset.kind, byteOffset: binLength, byteLength: asset.bytes.byteLength });
    binLength += asset.bytes.byteLength;
  }

  const json: SceneFileJson = { format: FILE_FORMAT, name: scene.name, document: scene.document, assets: entries };
  const jsonBytes = new TextEncoder().encode(JSON.stringify(json));
  const jsonChunkLength = padTo4(jsonBytes.byteLength);
  const binChunkLength = padTo4(binLength);
  const total = HEADER_BYTES + CHUNK_HEADER_BYTES + jsonChunkLength + (entries.length > 0 ? CHUNK_HEADER_BYTES + binChunkLength : 0);

  if (total > 0xffffffff) {
    throw new RangeError("The scene is too large for one .libre3d file (over 4 GB).");
  }

  const bytes = new Uint8Array(new ArrayBuffer(total));
  const view = new DataView(bytes.buffer);
  view.setUint32(0, MAGIC, true);
  view.setUint32(4, CONTAINER_VERSION, true);
  view.setUint32(8, total, true);

  let at = HEADER_BYTES;
  view.setUint32(at, jsonChunkLength, true);
  view.setUint32(at + 4, JSON_CHUNK, true);
  bytes.set(jsonBytes, at + CHUNK_HEADER_BYTES);
  bytes.fill(0x20, at + CHUNK_HEADER_BYTES + jsonBytes.byteLength, at + CHUNK_HEADER_BYTES + jsonChunkLength); // JSON pads with spaces
  at += CHUNK_HEADER_BYTES + jsonChunkLength;

  if (entries.length > 0) {
    view.setUint32(at, binChunkLength, true);
    view.setUint32(at + 4, BIN_CHUNK, true);
    scene.assets.forEach((asset, index) => bytes.set(asset.bytes, at + CHUNK_HEADER_BYTES + entries[index].byteOffset));
  }

  return bytes;
};

const isPlainObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const isByteCount = (value: unknown): value is number => typeof value === "number" && Number.isInteger(value) && value >= 0;

/** Reads a `.libre3d` file's bytes, checking every asset's bytes against its hash. */
export const readSceneFile = async (data: ArrayBuffer): Promise<ReadSceneFile> => {
  const invalid = { ok: false, reason: "invalid" } as const;
  const view = new DataView(data);

  if (data.byteLength < HEADER_BYTES || view.getUint32(0, true) !== MAGIC) return invalid;
  if (view.getUint32(4, true) > CONTAINER_VERSION) return { ok: false, reason: "newer" };
  if (view.getUint32(8, true) !== data.byteLength) return invalid;

  let json: Uint8Array<ArrayBuffer> | null = null;
  let bin: Uint8Array<ArrayBuffer> | null = null;

  for (let at = HEADER_BYTES; at < data.byteLength; ) {
    if (at + CHUNK_HEADER_BYTES > data.byteLength) return invalid;
    const length = view.getUint32(at, true);
    const type = view.getUint32(at + 4, true);
    const start = at + CHUNK_HEADER_BYTES;
    if (start + length > data.byteLength) return invalid;
    if (json === null && type !== JSON_CHUNK) return invalid; // the JSON chunk comes first
    if (type === JSON_CHUNK && json === null) json = new Uint8Array(data, start, length);
    else if (type === BIN_CHUNK && bin === null) bin = new Uint8Array(data, start, length);
    at = start + length;
  }

  let parsed: unknown;

  try {
    parsed = JSON.parse(new TextDecoder().decode(json ?? new Uint8Array()));
  } catch {
    return invalid;
  }

  if (!isPlainObject(parsed) || parsed.format !== FILE_FORMAT || !Array.isArray(parsed.assets)) return invalid;

  const scene = parseSceneDocument(parsed.document);
  if (!scene.ok) return scene;

  const assets: SceneFileAsset[] = [];

  for (const entry of parsed.assets) {
    if (!isPlainObject(entry) || !isAssetHash(entry.hash) || (entry.kind !== "model" && entry.kind !== "texture")) return invalid;
    if (!isByteCount(entry.byteOffset) || !isByteCount(entry.byteLength) || entry.byteLength > MAX_ASSET_BYTES) return invalid;
    if (!bin || entry.byteOffset + entry.byteLength > bin.byteLength) return invalid;
    // A copy, so each asset can be stored on its own rather than keeping the whole file alive.
    const bytes = bin.slice(entry.byteOffset, entry.byteOffset + entry.byteLength);
    if ((await hashAsset(bytes.buffer)) !== entry.hash) return invalid;
    assets.push({ hash: entry.hash, kind: entry.kind, bytes });
  }

  return {
    ok: true,
    name: typeof parsed.name === "string" ? parsed.name.trim() : "",
    document: parsed.document,
    content: scene.content,
    assets,
  };
};

/** The imported assets a scene's entities use that are content-addressed (the ones a file can carry). */
export const sceneFileAssetRefs = (entities: unknown) => collectAssetRefs(entities).filter((ref) => isAssetHash(ref.id));
