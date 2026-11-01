import type { EditorState, Entity, MaterialLayer } from "../store/useEditorStore";

/**
 * What ObjectManager reads and writes besides the entities each sync hands it. In the editor that's
 * the store and this browser's asset storage (editorSceneSource.ts); in the share-link viewer, a
 * published scene and its download links (viewer/publishedSceneSource.ts). Imported models resolve
 * asynchronously, after the sync that started them, so ObjectManager asks for the entities again
 * when they land rather than keeping the list it was last given.
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
  /** An import's empty wrapper nodes collapsed after the fact (utils/pruneImportHierarchy.ts). */
  applyHierarchyPrune: EditorState["applyHierarchyPrune"];
}
