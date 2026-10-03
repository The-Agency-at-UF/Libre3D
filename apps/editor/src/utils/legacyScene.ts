/**
 * PURPOSE: The scene that was saved in this browser before scenes moved to the cloud.
 *
 * Until persist v17 the editor kept one scene in localStorage (`libre3d-scene-state`). v17's
 * migration moves it here, as a scene document, when it has anything worth keeping
 * (`hasSceneContent`), so opening a cloud scene can't overwrite it. It stays until the user adds
 * it to their scenes or discards it from the gallery.
 *
 * Plain localStorage and free of the store and Three.js, so the gallery can read it.
 */

const LEGACY_SCENE_KEY = "libre3d-legacy-scene";

/** Keeps the first scene stashed; a later migration never replaces it. */
export const stashLegacyScene = (document: unknown): void => {
  try {
    if (!localStorage.getItem(LEGACY_SCENE_KEY)) {
      localStorage.setItem(LEGACY_SCENE_KEY, JSON.stringify(document));
    }
  } catch (error) {
    console.error("[Libre3D] Could not keep the scene saved in this browser.", error);
  }
};
