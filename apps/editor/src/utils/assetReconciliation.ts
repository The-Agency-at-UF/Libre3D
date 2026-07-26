import type { Entity } from "../store/useEditorStore";
import { deleteModelAsset, listModelAssetIds } from "./modelAssetStore";
import { deleteTextureAsset, listTextureAssetIds } from "./textureAssetStore";

// Runs once per app load (wired via useEditorStore's onRehydrateStorage) to free
// OPFS storage for model/texture assets no entity references anymore. Deletion
// is deliberately deferred to this reconciliation pass rather than happening at
// entity-delete time: zundo's undo history is in-memory/session-scoped and never
// persisted, so as long as nothing is freed from OPFS until the *next* reload,
// Ctrl+Z always restores a fully working entity no matter how long the user
// waits before pressing it. Worst case is a buffer sitting unused in OPFS until
// the next reload, not a permanent leak.
export async function reconcileAssetStorage(entities: Entity[]): Promise<void> {
  const referencedModelIds = new Set<string>();
  const referencedTextureIds = new Set<string>();

  for (const entity of entities) {
    if (entity.assetId) referencedModelIds.add(entity.assetId);
    for (const layer of entity.materialLayers ?? []) {
      if (layer.type === "image" && layer.textureAssetId) {
        referencedTextureIds.add(layer.textureAssetId);
      }
    }
  }

  const [storedModelIds, storedTextureIds] = await Promise.all([
    listModelAssetIds(),
    listTextureAssetIds(),
  ]);

  const orphanedModelIds = storedModelIds.filter((id) => !referencedModelIds.has(id));
  const orphanedTextureIds = storedTextureIds.filter((id) => !referencedTextureIds.has(id));

  await Promise.all([
    ...orphanedModelIds.map((id) =>
      deleteModelAsset(id).catch((error) =>
        console.error(`[Libre3D] Failed to reconcile orphaned model asset "${id}":`, error),
      ),
    ),
    ...orphanedTextureIds.map((id) =>
      deleteTextureAsset(id).catch((error) =>
        console.error(`[Libre3D] Failed to reconcile orphaned texture asset "${id}":`, error),
      ),
    ),
  ]);

  if (orphanedModelIds.length || orphanedTextureIds.length) {
    console.info(
      `[Libre3D] Asset reconciliation freed ${orphanedModelIds.length} model asset(s) and ${orphanedTextureIds.length} texture asset(s).`,
    );
  }
}
