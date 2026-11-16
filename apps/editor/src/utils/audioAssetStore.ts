// Uploaded sounds (Sound actions, C3), stored outside the persisted editor state, as models and
// textures are: a Sound action holds only an assetId (the bytes' content hash) pointing here.
//
// Storage strategy (OPFS first, IndexedDB fallback) lives in createAssetStore.ts; this module only
// supplies the audio-specific names and the ArrayBuffer decode (Web Audio's decodeAudioData takes
// the bytes).

import { createAssetStore } from "./createAssetStore";

const store = createAssetStore<ArrayBuffer>({
  dirName: "libre3d-audio",
  dbName: "libre3d-audio-assets",
  storeName: "audio-assets",
  decode: (file) => file.arrayBuffer(),
});

export function saveAudioAsset(assetId: string, data: ArrayBuffer): Promise<void> {
  return store.save(assetId, data);
}

export function loadAudioAsset(assetId: string): Promise<ArrayBuffer | null> {
  return store.load(assetId);
}

export function hasAudioAsset(assetId: string): Promise<boolean> {
  return store.has(assetId);
}
