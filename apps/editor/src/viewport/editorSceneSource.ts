import { selectDrawnEntities, useEditorStore } from "../store/useEditorStore";
import { loadModelForScene, loadTextureForScene } from "../utils/assetTransfers";
import { saveTextureAsset } from "../utils/textureAssetStore";
import type { SceneSource } from "./sceneSource";

/**
 * The editor's scene source: the store, and imported assets from this browser's storage (fetched
 * from the open scene's cloud copies when missing, utils/assetTransfers.ts). What ObjectManager
 * derives or prunes on an imported model is written to the store, so it's saved with the scene; the
 * textures it takes out of a model's materials go to this browser's storage, and from there to the cloud.
 */
export const editorSceneSource: SceneSource = {
  // As they're drawn: an object that uses a material asset comes with the asset's layers.
  getEntities: () => selectDrawnEntities(useEditorStore.getState()),

  isWireframe: () => useEditorStore.getState().sceneSettings.wireframe,
  loadModel: loadModelForScene,
  loadTexture: loadTextureForScene,
  saveTexture: saveTextureAsset,
  setMaterialLayers: (entityId, layers, opacity) => useEditorStore.getState().setEntityMaterialLayers(entityId, layers, opacity),
};
