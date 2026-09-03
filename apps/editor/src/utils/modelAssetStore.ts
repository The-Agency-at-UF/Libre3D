// Raw imported-model buffers, stored outside the persisted editor state -- an
// importedModel entity holds only an assetId pointing here, because a .glb is far
// too large to inline into the localStorage-backed store.
//
// Storage strategy (OPFS first, IndexedDB fallback) and the reasoning behind it
// live in createAssetStore.ts; this module only supplies the model-specific names
// and the ArrayBuffer decode. The four exported functions keep their original
// signatures -- callers are unchanged.

import { createAssetStore } from "./createAssetStore";

const store = createAssetStore<ArrayBuffer>({
  dirName: "libre3d-models",
  dbName: "libre3d-model-assets",
  storeName: "model-assets",
  // GLTFLoader.parse() wants the bytes, so read the file through to an
  // ArrayBuffer rather than handing back the File.
  decode: (file) => file.arrayBuffer(),
});

export function saveModelAsset(assetId: string, data: ArrayBuffer): Promise<void> {
  return store.save(assetId, data);
}

export function loadModelAsset(assetId: string): Promise<ArrayBuffer | null> {
  return store.load(assetId);
}

export function deleteModelAsset(assetId: string): Promise<void> {
  return store.remove(assetId);
}

export function listModelAssetIds(): Promise<string[]> {
  return store.listIds();
}
