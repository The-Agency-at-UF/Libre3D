/**
 * PURPOSE: What a scene's imported assets are called, shared by the editor and the server.
 *
 * INPUT: Asset bytes (`hashAsset`), or a scene's entities (`collectAssetRefs`), typed or straight
 *        out of a request body.
 * OUTPUT: Content addresses: the SHA-256 of an asset's bytes as 64 lowercase hex characters.
 *
 * An imported model's `assetId` and a texture layer's `textureAssetId` are the hash of the bytes
 * stored for them, the same in this browser's storage and in the cloud
 * (`users/<sub>/assets/<hash>`). So the same file is stored and uploaded once however many entities
 * or scenes use it, an uploaded asset never changes, and the scene document needs no list of its
 * assets beside the entities. Scenes made before cloud assets have random IDs (`asset-…`,
 * `texture-…`); those are still collected, and `isAssetHash` tells them apart.
 *
 * No imports, so the server modules can use this too (with a `.js` extension).
 */

export type AssetKind = "model" | "texture";

export interface AssetRef {
  id: string;
  kind: AssetKind;
}

/** Largest asset that can be imported or uploaded: 100 MB per file. */
export const MAX_ASSET_BYTES = 100 * 1024 * 1024;

const ASSET_HASH_PATTERN = /^[0-9a-f]{64}$/;

/** Whether an asset ID is a content address (rather than an ID from before cloud assets). */
export const isAssetHash = (id: unknown): id is string => typeof id === "string" && ASSET_HASH_PATTERN.test(id);

/** The content address of some bytes: their SHA-256, as lowercase hex. */
export const hashAsset = async (data: ArrayBuffer | Blob): Promise<string> => {
  const buffer = data instanceof Blob ? await data.arrayBuffer() : data;
  const digest = new Uint8Array(await crypto.subtle.digest("SHA-256", buffer));

  return Array.from(digest, (byte) => byte.toString(16).padStart(2, "0")).join("");
};

/** The same hash in base64, the form S3 takes it in (`x-amz-checksum-sha256`). */
export const assetHashToBase64 = (hash: string): string => {
  let binary = "";

  for (let index = 0; index < hash.length; index += 2) {
    binary += String.fromCharCode(Number.parseInt(hash.slice(index, index + 2), 16));
  }

  return btoa(binary);
};

const isObject = (value: unknown): value is Record<string, unknown> => typeof value === "object" && value !== null;

/**
 * Every asset a scene references, once each, in order of first use: imported models (`assetId`)
 * and the pictures in layers (`textureAssetId`), the entities' own and those of the scene's
 * material assets (`materials`, by ID). Tolerates malformed input, since the server reads it from a
 * request body.
 */
export const collectAssetRefs = (entities: unknown, materials?: unknown): AssetRef[] => {
  const refs = new Map<string, AssetRef>();
  const add = (id: unknown, kind: AssetKind) => {
    if (typeof id === "string" && id && !refs.has(id)) {
      refs.set(id, { id, kind });
    }
  };

  const addLayers = (layers: unknown) => {
    if (!Array.isArray(layers)) return;
    for (const layer of layers) {
      if (isObject(layer) && (layer.type === "image" || layer.type === "matcap" || layer.type === "displace")) {
        add(layer.textureAssetId, "texture");
      }
      // A Lighting layer's maps (normal, roughness, …): pictures too.
      if (isObject(layer) && layer.type === "lighting" && isObject(layer.maps)) {
        for (const map of Object.values(layer.maps)) {
          if (isObject(map)) add(map.textureAssetId, "texture");
        }
      }
    }
  };

  for (const entity of Array.isArray(entities) ? entities : []) {
    if (!isObject(entity)) {
      continue;
    }

    add(entity.assetId, "model");
    addLayers(entity.materialLayers);
  }

  // A picture used only inside a material asset is the scene's too: without it, the objects that
  // use the asset would lose it when the scene is saved, published or written to a file.
  for (const asset of isObject(materials) ? Object.values(materials) : []) {
    if (isObject(asset)) addLayers(asset.layers);
  }

  return Array.from(refs.values());
};

/** The content addresses among the assets a scene references (old random IDs left out). */
export const collectAssetHashes = (entities: unknown, materials?: unknown): string[] =>
  collectAssetRefs(entities, materials)
    .map((ref) => ref.id)
    .filter(isAssetHash);
