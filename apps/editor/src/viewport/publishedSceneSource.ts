import type { Entity } from "../store/useEditorStore";
import type { SceneSource } from "./sceneSource";

/**
 * A published scene's source for ObjectManager (sceneSource.ts): its entities, and its imported
 * models and pictures downloaded through the presigned URLs the share link came with
 * (`GET /api/scene/:id`, awsPublishHandler.ts). Nothing is saved: layers derived for an imported
 * mesh stay in memory, and a hierarchy prune is skipped (scenes are saved, so published, already
 * pruned). Store-free, like everything the viewer loads.
 */
export const createPublishedSceneSource = (entities: Entity[], assetUrls: Record<string, string>): SceneSource => {
  let current = entities;

  const download = async (assetId: string): Promise<Response | null> => {
    const url = assetUrls[assetId];
    if (!url) return null;
    const response = await fetch(url);
    return response.ok ? response : null;
  };

  return {
    getEntities: () => current,
    isWireframe: () => false,
    loadModel: async (assetId) => (await download(assetId))?.arrayBuffer() ?? null,
    loadTexture: async (assetId) => (await download(assetId))?.blob() ?? null,
    setMaterialLayers: (entityId, layers) => {
      current = current.map((entity) => (entity.id === entityId ? { ...entity, materialLayers: layers } : entity));
    },
    applyHierarchyPrune: () => undefined,
  };
};
