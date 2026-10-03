import { useEffect, useState } from "react";

import { useEditorStore } from "../store/useEditorStore";
import { ApiAuthError } from "../utils/apiFetch";
import { getAuthSnapshot } from "../utils/authSession";
import { clearSceneCache, readSceneCache, resolveSceneToOpen } from "../utils/sceneCache";
import type { StoredSceneContent } from "../utils/sceneDocument";
import { cancelRelease } from "../utils/sceneLock";
import { SceneApiError, claimSceneLock, getScene, type LockClaim, type OpenedScene } from "../utils/sceneLibrary";

export type OpenSceneState =
  | { status: "loading" }
  | { status: "ready"; scene: OpenedScene; hasRecoveredEdits: boolean; lock: LockClaim }
  | { status: "notFound" }
  | { status: "newer" }
  | { status: "error"; message: string };

export type SceneToShow =
  | { status: "ready"; scene: OpenedScene; content: StoredSceneContent | null; hasRecoveredEdits: boolean }
  | { status: "notFound" }
  | { status: "newer" }
  | { status: "error"; message: string };

const describeFailure = (error: unknown): SceneToShow => {
  if (error instanceof SceneApiError && error.status === 404) {
    return { status: "notFound" };
  }

  console.error("Failed to open the scene.", error);
  return {
    status: "error",
    message: error instanceof ApiAuthError ? error.message : "The scene could not be opened. Check your connection and try again.",
  };
};

/**
 * Picks what to show for a scene just fetched from the cloud. With `recoverEdits` (this tab holds
 * the editing lock), this browser's unsaved edits to it (sceneCache.ts) win if the cloud copy hasn't
 * moved on since they were made; the choice is `resolveSceneToOpen`. Without it (read-only), the
 * cloud copy is shown and the local edits are left alone: they may be another tab's, still being made.
 */
const chooseSceneToShow = (
  sceneId: string,
  { scene, document }: { scene: OpenedScene; document: unknown },
  recoverEdits: boolean,
): SceneToShow => {
  const auth = getAuthSnapshot();
  const cached = recoverEdits && auth.status === "signedIn" && auth.userId ? readSceneCache(auth.userId, sceneId) : null;
  const toOpen = resolveSceneToOpen({ document, revision: scene.revision }, cached);

  if (toOpen.discardCache) {
    // Saved from somewhere else since (or unreadable): the cloud copy wins.
    console.warn("[Libre3D] Discarded unsaved local edits to a scene that changed in the cloud since.");
    clearSceneCache(sceneId);
  }

  if (toOpen.status === "ready") {
    return { status: "ready", scene, content: toOpen.content, hasRecoveredEdits: toOpen.hasRecoveredEdits };
  }

  return toOpen.status === "newer" ? { status: "newer" } : { status: "error", message: "This scene's saved data is damaged." };
};

/** Fetches a scene and picks what to show (see chooseSceneToShow). Doesn't touch the store. */
export const fetchSceneToShow = async (sceneId: string, { recoverEdits }: { recoverEdits: boolean }): Promise<SceneToShow> => {
  try {
    return chooseSceneToShow(sceneId, await getScene(sceneId), recoverEdits);
  } catch (error) {
    return describeFailure(error);
  }
};

/**
 * Claims the editing lock while opening a scene. Only a deleted scene or a lost session is fatal
 * (loading the scene fails the same way); anything else opens it read-only, and useSceneLock keeps
 * trying.
 */
const claimForOpening = async (sceneId: string): Promise<LockClaim> => {
  // Coming straight back to a scene this tab just left: keep the lock instead of releasing it.
  cancelRelease(sceneId);

  try {
    return await claimSceneLock(sceneId);
  } catch (error) {
    if ((error instanceof SceneApiError && error.status === 404) || error instanceof ApiAuthError) {
      throw error;
    }

    console.warn("[Libre3D] Couldn't claim the scene's editing lock; opening it read-only for now.", error);
    return { held: false, revision: -1, heldByYou: true };
  }
};

/**
 * Loads `/edit/:sceneId`'s scene into the store (`loadScene`, which also clears undo history) and
 * claims its editing lock, and reports how that went. A tab that gets the lock opens the scene for
 * editing, with this browser's unsaved edits to it if they're still current (`hasRecoveredEdits`:
 * they're saved right away). One that doesn't opens the cloud copy read-only (`readOnlyReason`).
 * The editor shows the viewport only once this is `ready`, so the managers never build whatever
 * scene the store held before.
 */
export function useOpenScene(sceneId: string): OpenSceneState {
  const [state, setState] = useState<OpenSceneState>({ status: "loading" });

  useEffect(() => {
    // Ignore a response for a scene that was left before it arrived.
    let active = true;
    setState({ status: "loading" });

    void (async () => {
      let toShow: SceneToShow;
      let lock: LockClaim = { held: false, revision: -1, heldByYou: true };

      try {
        const [fetched, claim] = await Promise.all([getScene(sceneId), claimForOpening(sceneId)]);
        lock = claim;
        // A save that landed between the two reads (a lapsed holder's last one) would make this tab's
        // first save a conflict. Rare; fetch again so the copy shown is the one the lock was claimed on.
        const current = claim.held && claim.revision !== fetched.scene.revision ? await getScene(sceneId) : fetched;
        toShow = chooseSceneToShow(sceneId, current, claim.held);
      } catch (error) {
        toShow = describeFailure(error);
      }

      if (!active) {
        return;
      }

      if (toShow.status !== "ready") {
        setState(toShow);
        return;
      }

      const store = useEditorStore.getState();
      store.loadScene(toShow.content);
      store.setReadOnly(lock.held ? null : "openElsewhere");
      setState({ status: "ready", scene: toShow.scene, hasRecoveredEdits: toShow.hasRecoveredEdits, lock });
    })();

    return () => {
      active = false;
    };
  }, [sceneId]);

  return state;
}
