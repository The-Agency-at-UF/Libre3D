// Imported-material texture bitmaps, stored outside the persisted editor state.
// Pixel data is far too large to inline into materialLayers, which is persisted
// straight to localStorage -- an ImageLayer stores only a textureAssetId pointing
// here. Each blob is a PNG re-encode of one unique glTF texture image, deduped by
// underlying image identity at extraction time (see utils/materialLayers.ts).
//
// Storage strategy (OPFS first, IndexedDB fallback) and the reasoning behind it
// live in createAssetStore.ts; this module only supplies the texture-specific
// names and the Blob decode. The four exported functions keep their original
// signatures -- callers are unchanged.

import { createAssetStore } from "./createAssetStore";

const store = createAssetStore<Blob>({
  dirName: "libre3d-textures",
  dbName: "libre3d-texture-assets",
  storeName: "texture-assets",
  // File already is a Blob, and buildTextureFromLayer takes it straight through
  // to createImageBitmap -- no conversion needed.
  decode: (file) => file,
});

export function saveTextureAsset(textureAssetId: string, data: Blob): Promise<void> {
  return store.save(textureAssetId, data);
}

export function loadTextureAsset(textureAssetId: string): Promise<Blob | null> {
  return store.load(textureAssetId);
}

export function deleteTextureAsset(textureAssetId: string): Promise<void> {
  return store.remove(textureAssetId);
}

export function listTextureAssetIds(): Promise<string[]> {
  return store.listIds();
}
