/**
 * PURPOSE: This browser's copy of scene edits that haven't reached the cloud yet, so a closed tab,
 * a crash, or a lost connection doesn't lose them.
 *
 * One localStorage key per scene, written while the scene has unsaved edits and removed once
 * they're saved. Each entry records who made the edits (the token's `sub`) and the revision they
 * were made on top of. Opening the scene again as the same user restores them only if the cloud
 * copy hasn't moved on since; anyone else's entry is ignored and removed, and signing out removes
 * them all, so one user's scene never reaches the next user of a shared browser.
 *
 * The cloud stays the source of truth; this is a stopgap copy, not editor state. Free of the store
 * and Three.js so `authSession.signOut` can clear it.
 */

const CACHE_KEY_PREFIX = "libre3d-scene-cache:";

export interface SceneCacheEntry {
  ownerId: string;
  sceneId: string;
  /** The cloud revision the edits were made on top of. */
  baseRevision: number;
  document: unknown;
}

const cacheKey = (sceneId: string): string => `${CACHE_KEY_PREFIX}${sceneId}`;

export const writeSceneCache = (entry: SceneCacheEntry): void => {
  try {
    localStorage.setItem(cacheKey(entry.sceneId), JSON.stringify(entry));
  } catch (error) {
    // Full or blocked storage only loses the crash copy; the cloud save is unaffected.
    console.warn("[Libre3D] Could not keep a local copy of unsaved edits.", error);
  }
};

export const clearSceneCache = (sceneId: string): void => {
  try {
    localStorage.removeItem(cacheKey(sceneId));
  } catch {
    // Nothing to do.
  }
};

/** This user's unsaved edits to this scene, if any. Another user's entry is removed, unread. */
export const readSceneCache = (ownerId: string, sceneId: string): SceneCacheEntry | null => {
  try {
    const raw = localStorage.getItem(cacheKey(sceneId));
    const entry = raw ? (JSON.parse(raw) as SceneCacheEntry) : null;

    if (entry && entry.ownerId === ownerId && entry.sceneId === sceneId && typeof entry.baseRevision === "number") {
      return entry;
    }

    if (entry) {
      clearSceneCache(sceneId);
    }
  } catch {
    clearSceneCache(sceneId);
  }

  return null;
};

/** Removes every scene's local copy (on sign-out). */
export const clearAllSceneCaches = (): void => {
  try {
    Object.keys(localStorage)
      .filter((key) => key.startsWith(CACHE_KEY_PREFIX))
      .forEach((key) => localStorage.removeItem(key));
  } catch {
    // Nothing to do.
  }
};
