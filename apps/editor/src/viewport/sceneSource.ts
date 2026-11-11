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
  /** Editable layers derived from an imported mesh's own material, for a mesh that had none. */
  setMaterialLayers(entityId: string, layers: MaterialLayer[]): void;
  /**
   * An import's empty wrapper nodes collapsed after the fact (utils/pruneImportHierarchy.ts): the
   * entities to remove, and the parent and transform each kept one takes over from them.
   */
  applyHierarchyPrune(removedIds: Set<string>, updates: Map<string, { position: Vec3; rotation: Vec3; scale: Vec3; parentId: string | null }>): void;
}
