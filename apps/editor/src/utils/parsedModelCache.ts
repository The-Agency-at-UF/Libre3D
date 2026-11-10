/**
 * PURPOSE: Hands a model that was just imported, and so just parsed, to the viewport, which would
 * otherwise read the same bytes back from storage and parse them a second time.
 *
 * INPUT: A parsed glTF under its asset ID, from the importer (importModel.ts).
 * OUTPUT: That glTF, once, to whoever draws the asset first (ObjectManager's hydrate).
 *
 * Apart from the importer so the viewport can read the cache without loading the importer's file
 * checks and dialogs. The share-link viewer builds objects with the same ObjectManager; nothing is
 * imported there, so for it the cache is always empty.
 */

import type { GLTF } from "three/examples/jsm/loaders/GLTFLoader.js";

// Hands the freshly parsed glTF off to the very first hydrate of the same
// asset (ObjectManager.hydrateImportedModel), which would otherwise re-fetch
// the identical buffer from storage and parse it a second time. Entries are
// one-shot: takeParsedModel deletes on read, so a reload — where nothing was
// parsed this session — falls through to the buffer as before.
const parsedModelCache = new Map<string, GLTF>();
const parsedModelTimers = new Map<string, ReturnType<typeof setTimeout>>();

// Hydration follows a fresh import within the same tick, so anything still
// cached after this long was never claimed (an import that failed between the
// parse and the store update). Drop it rather than pin a whole parsed scene —
// geometry, textures and all — in memory for the life of the page.
const PARSED_MODEL_TTL_MS = 30_000;

export function cacheParsedModel(assetId: string, gltf: GLTF): void {
  parsedModelCache.set(assetId, gltf);
  parsedModelTimers.set(
    assetId,
    setTimeout(() => {
      parsedModelCache.delete(assetId);
      parsedModelTimers.delete(assetId);
    }, PARSED_MODEL_TTL_MS),
  );
}

// Get-and-delete. Returns undefined on a miss, which is the signal to parse
// from the stored buffer instead.
export function takeParsedModel(assetId: string): GLTF | undefined {
  const gltf = parsedModelCache.get(assetId);
  parsedModelCache.delete(assetId);
  const timer = parsedModelTimers.get(assetId);
  if (timer !== undefined) {
    clearTimeout(timer);
    parsedModelTimers.delete(assetId);
  }
  return gltf;
}
