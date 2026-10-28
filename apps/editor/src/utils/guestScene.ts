/**
 * PURPOSE: The guest editor's one scene (`/try`), kept in this browser so a reload or a later visit
 * picks up where the guest left off. Nothing goes to the cloud: a guest has no account, and the API
 * refuses requests without one.
 *
 * Stored in the same versioned document format as cloud scenes (sceneDocument.ts), so it migrates
 * the same way when the format changes. Imported models and textures aren't in it: like a cloud
 * scene's, they're referenced by hash and kept in this browser's asset storage (OPFS/IndexedDB).
 */

import { parseSceneDocument, toSceneDocument, type SceneContent, type StoredSceneContent } from "./sceneDocument";

const GUEST_SCENE_KEY = "libre3d-guest-scene";

export type GuestSceneToOpen =
  /** `content: null` = nothing kept (or nothing readable): start from the default scene. */
  | { status: "ready"; content: StoredSceneContent | null }
  /** Saved by a newer build; opening it here would overwrite what this one doesn't understand. */
  | { status: "newer" };

export const readGuestScene = (): GuestSceneToOpen => {
  let raw: string | null = null;

  try {
    raw = localStorage.getItem(GUEST_SCENE_KEY);
  } catch {
    // Storage blocked (e.g. private mode settings): nothing kept.
  }

  if (raw === null) {
    return { status: "ready", content: null };
  }

  let document: unknown;

  try {
    document = JSON.parse(raw);
  } catch {
    return { status: "ready", content: null };
  }

  const parsed = parseSceneDocument(document);

  if (parsed.ok) {
    return { status: "ready", content: parsed.content };
  }

  return parsed.reason === "newer" ? { status: "newer" } : { status: "ready", content: null };
};

/** False when it couldn't be kept (storage full or blocked); the scene still works until reload. */
export const writeGuestScene = (content: SceneContent): boolean => {
  try {
    localStorage.setItem(GUEST_SCENE_KEY, JSON.stringify(toSceneDocument(content)));
    return true;
  } catch (error) {
    console.warn("[Libre3D] The guest scene couldn't be kept in this browser.", error);
    return false;
  }
};
