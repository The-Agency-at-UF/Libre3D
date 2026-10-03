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

const readLegacyScene = (): unknown | null => {
  try {
    const raw = localStorage.getItem(LEGACY_SCENE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const clearLegacyScene = (): void => {
  try {
    localStorage.removeItem(LEGACY_SCENE_KEY);
  } catch {
    // Nothing to do.
  }
};

// The editor store's persist key; older than v17 means its migration hasn't run in this browser yet.
const hasUnmigratedEditorState = (): boolean => {
  try {
    const raw = localStorage.getItem("libre3d-scene-state");
    const version = raw ? (JSON.parse(raw) as { version?: unknown }).version : undefined;
    return typeof version === "number" && version < 17;
  } catch {
    return false;
  }
};

/**
 * The pre-cloud scene document, if this browser has one. When the editor's v17 migration hasn't run
 * yet (the editor wasn't opened since), loads the store once to run it, which pulls in the editor's
 * code just this one time; otherwise the gallery stays free of it.
 */
export const findLegacyScene = async (): Promise<unknown | null> => {
  if (hasUnmigratedEditorState()) {
    await import("../store/useEditorStore");
  }

  return readLegacyScene();
};
