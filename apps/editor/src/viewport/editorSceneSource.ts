import { useEditorStore } from "../store/useEditorStore";
import { loadModelForScene, loadTextureForScene } from "../utils/assetTransfers";
import type { SceneSource } from "./sceneSource";

/**
 * The editor's scene source: the store, and imported assets from this browser's storage (fetched
 * from the open scene's cloud copies when missing, utils/assetTransfers.ts). What ObjectManager
 * derives or prunes on an imported model is written to the store, so it's saved with the scene.
 */
export const editorSceneSource: SceneSource = {
  getEntities: () => useEditorStore.getState().entities,
  isWireframe: () => useEditorStore.getState().sceneSettings.wireframe,
  loadModel: loadModelForScene,
  loadTexture: loadTextureForScene,
  setMaterialLayers: (entityId, layers) => useEditorStore.getState().setEntityMaterialLayers(entityId, layers),
  applyHierarchyPrune: (removedIds, updates) => useEditorStore.getState().applyHierarchyPrune(removedIds, updates),
};
