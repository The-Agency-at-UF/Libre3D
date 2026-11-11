import type { Entity, MaterialLayer } from "../scene/types";
import type { Vec3 } from "../scene/vec3";

/**
 * What ObjectManager, and the materials and imported-model modules it owns (entityMaterials.ts,
 * importedModels.ts), read and write besides the entities each sync hands it. In the editor that's
 * the store and this browser's asset storage (editorSceneSource.ts); in the share-link viewer, a
 * published scene and its download links (viewer/publishedSceneSource.ts). Imported models resolve
 * asynchronously, after the sync that started them, so the entities are asked for again when they
 * land rather than kept from the last sync.
 *
 * Type-only here, so the viewer can build objects without loading the editor's store.
 */
export interface SceneSource {
  getEntities(): Entity[];
  isWireframe(): boolean;
  /** An imported model's bytes by content hash (sceneAssets.ts); null when it can't be had. */
  loadModel(assetId: string): Promise<ArrayBuffer | null>;
  loadTexture(assetId: string): Promise<Blob | null>;
  /**
   * Keeps a texture taken out of an imported model's own material, under its content hash, so
   * `loadTexture` can return it. The editor writes it to this browser's storage; the viewer must not.
   */
  saveTexture(assetId: string, blob: Blob): Promise<void>;
  /** Editable layers derived from an imported mesh's own material, for a mesh that had none. */
  setMaterialLayers(entityId: string, layers: MaterialLayer[]): void;
}
