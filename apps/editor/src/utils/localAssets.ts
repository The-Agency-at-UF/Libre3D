/**
 * PURPOSE: This browser's copy of each kind of asset, in one table: the uploader, the downloader and
 * `.libre3d` files read and write every kind through it, so a new kind is one entry here (a missing
 * one is a compile error) rather than a `kind === "model" ? … : …` in each of them.
 *
 * INPUT: An asset's kind and content hash (sceneAssets.ts).
 * OUTPUT: `LOCAL_ASSETS[kind]`: `load` (the stored bytes, as that kind's store keeps them),
 *         `has`, and `save` (from a Blob, however it arrived).
 */

import { hasAudioAsset, loadAudioAsset, saveAudioAsset } from "./audioAssetStore";
import { hasModelAsset, loadModelAsset, saveModelAsset } from "./modelAssetStore";
import type { AssetKind } from "./sceneAssets";
import { hasTextureAsset, loadTextureAsset, saveTextureAsset } from "./textureAssetStore";

export interface LocalAssetStore {
  load: (id: string) => Promise<ArrayBuffer | Blob | null>;
  has: (id: string) => Promise<boolean>;
  save: (id: string, blob: Blob) => Promise<void>;
}

export const LOCAL_ASSETS: Record<AssetKind, LocalAssetStore> = {
  model: { load: loadModelAsset, has: hasModelAsset, save: async (id, blob) => saveModelAsset(id, await blob.arrayBuffer()) },
  // Pictures are kept as Blobs (createImageBitmap takes them).
  texture: { load: loadTextureAsset, has: hasTextureAsset, save: saveTextureAsset },
  audio: { load: loadAudioAsset, has: hasAudioAsset, save: async (id, blob) => saveAudioAsset(id, await blob.arrayBuffer()) },
};
