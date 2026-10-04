import { useCallback, useEffect, useRef, useState } from "react";

import { useEditorStore } from "../store/useEditorStore";
import { getAuthSnapshot } from "../utils/authSession";
import { readSceneCache } from "../utils/sceneCache";
import type { StoredSceneContent } from "../utils/sceneDocument";
import { hasPendingSaves, type LockClaim, type OpenedScene } from "../utils/sceneLibrary";
import { SceneLock, cancelRelease, releaseWhenSaved, type SceneLockState } from "../utils/sceneLock";
import { fetchSceneToShow } from "./useOpenScene";
import { usePreviewSession } from "./usePreviewSession";
import type { EditSession } from "./useSceneAutosave";

export type EditingState =
  | { mode: "editing"; session: EditSession }
  /** Read-only: another session holds the lock. `heldByYou`: it's this user's other tab or device. */
  | { mode: "viewing"; heldByYou: boolean };

interface UseSceneLockOptions {
  scene: OpenedScene;
  /** The claim useOpenScene made while opening the scene. */
  lock: LockClaim;
  hasRecoveredEdits: boolean;
}

// Unsaved edits to this scene in this browser: a save still out, or a local copy (sceneCache.ts)
// that no save has cleared yet. Holding the lock until they're saved keeps another tab from
// building on a scene that's about to change.
const hasUnsavedLocalEdits = (sceneId: string): boolean => {
  const auth = getAuthSnapshot();
  return hasPendingSaves() || (auth.status === "signedIn" && auth.userId !== null && readSceneCache(auth.userId, sceneId) !== null);
};

/**
 * Keeps the open scene's editing lock (sceneLock.ts) for as long as the editor shows the scene, and
 * switches the editor between editing and viewing as the lock comes and goes:
 *
 * - Lock lost (taken over, or claimed after this tab's lease lapsed): the store goes read-only at
 *   once, autosaving stops (no edit session), and the view reloads from the cloud. Unsaved edits
 *   stay in this browser's local copy.
 * - While viewing: the view reloads whenever the scene's revision moves (the other tab saved). The
 *   viewer's camera and selection are kept.
 * - Lock regained (retry or take-over): the scene is reopened from the cloud, with this browser's
 *   unsaved edits if they're still current, before editing resumes in a new edit session.
 *
 * `reportLost` is for a save the server refused for want of the lock. `problem` is set once the lock
 * finds the scene deleted or the session gone, which ends the lock for good.
 */
export function useSceneLock({ scene, lock, hasRecoveredEdits }: UseSceneLockOptions) {
  const { sceneId } = scene;
  const [editing, setEditingState] = useState<EditingState>(() =>
    lock.held
      ? { mode: "editing", session: { revision: scene.revision, hasRecoveredEdits } }
      : { mode: "viewing", heldByYou: lock.heldByYou },
  );
  const [problem, setProblem] = useState<"deleted" | "signedOut" | null>(null);
  const [isTakingOver, setIsTakingOver] = useState(false);
  const editingRef = useRef(editing);
  // The cloud revision of the scene on screen.
  const shownRevisionRef = useRef(scene.revision);
  const lockRef = useRef<SceneLock | null>(null);
  // A reload of the scene is under way; lock answers meanwhile are acted on by the next one.
  const isReloadingRef = useRef(false);
  const { stopPreview } = usePreviewSession();

  const setEditing = useCallback((next: EditingState) => {
    editingRef.current = next;
    setEditingState(next);
  }, []);

  useEffect(() => {
    let active = true;

    // Loads the cloud copy into the store, ending a preview first (loadScene leaves preview mode
    // without freeing its blob URL).
    const showScene = (content: StoredSceneContent | null) => {
      if (useEditorStore.getState().isPreviewMode) {
        stopPreview();
      }

      useEditorStore.getState().loadScene(content);
    };

    const refreshView = async () => {
      isReloadingRef.current = true;

      try {
        const toShow = await fetchSceneToShow(sceneId, { recoverEdits: false });

        if (!active || editingRef.current.mode !== "viewing" || toShow.status !== "ready") {
          return;
        }

        // Keep the viewer's own camera and selection: only the scene's content is news.
        const { cameraProfiles, activeProfileId, selectedEntityIds } = useEditorStore.getState();
        showScene(toShow.content ? { ...toShow.content, cameraProfiles, activeProfileId } : null);
        const stillThere = new Set(useEditorStore.getState().entities.map((entity) => entity.id));
        useEditorStore.getState().selectEntities(selectedEntityIds.filter((id) => stillThere.has(id)));
        shownRevisionRef.current = toShow.scene.revision;
      } finally {
        isReloadingRef.current = false;

        // The lock may have come back meanwhile (a take-over, say): act on it now, not next tick.
        if (active && lockRef.current?.current.kind === "held") {
          handleLockState(lockRef.current.current);
        }
      }
    };

    const reopenForEditing = async () => {
      isReloadingRef.current = true;

      try {
        const toShow = await fetchSceneToShow(sceneId, { recoverEdits: true });

        if (!active || editingRef.current.mode !== "viewing" || lockRef.current?.current.kind !== "held") {
          return;
        }

        if (toShow.status === "notFound") {
          setProblem("deleted");
          return;
        }

        if (toShow.status !== "ready") {
          // Still holding the lock: the next renewal tries again.
          return;
        }

        showScene(toShow.content);
        useEditorStore.getState().setReadOnly(null);
        shownRevisionRef.current = toShow.scene.revision;
        setEditing({ mode: "editing", session: { revision: toShow.scene.revision, hasRecoveredEdits: toShow.hasRecoveredEdits } });
      } finally {
        isReloadingRef.current = false;
      }
    };

    const handleLockState = (state: SceneLockState) => {
      if (state.kind === "deleted" || state.kind === "signedOut") {
        setProblem(state.kind);
        return;
      }

      const current = editingRef.current;

      if (state.kind === "elsewhere" && current.mode === "editing") {
        // Lost it. Block edits before anything else can land.
        useEditorStore.getState().setReadOnly("openElsewhere");
        setEditing({ mode: "viewing", heldByYou: state.heldByYou });
        void refreshView();
        return;
      }

      if (isReloadingRef.current || current.mode !== "viewing") {
        return;
      }

      if (state.kind === "held") {
        void reopenForEditing();
      } else if (state.revision !== shownRevisionRef.current && state.revision >= 0) {
        void refreshView();
      }
    };

    cancelRelease(sceneId);
    const sceneLock = new SceneLock({
      sceneId,
      initial:
        editingRef.current.mode === "editing"
          ? { kind: "held", revision: shownRevisionRef.current }
          : { kind: "elsewhere", revision: shownRevisionRef.current, heldByYou: editingRef.current.heldByYou },
      onChange: handleLockState,
      hasUnsavedEdits: () => hasUnsavedLocalEdits(sceneId),
    });
    lockRef.current = sceneLock;

    return () => {
      active = false;
      sceneLock.dispose();
      lockRef.current = null;

      // Leaving the scene (or StrictMode's remount, which calls this off again right away).
      if (sceneLock.current.kind === "held") {
        releaseWhenSaved(sceneId, () => hasUnsavedLocalEdits(sceneId));
      }
    };
  }, [sceneId, setEditing, stopPreview]);

  const takeOver = useCallback(async () => {
    setIsTakingOver(true);

    try {
      await lockRef.current?.takeOver();
    } finally {
      setIsTakingOver(false);
    }
  }, []);

  const reportLost = useCallback(() => {
    lockRef.current?.markLost();
  }, []);

  return { editing, problem, isTakingOver, takeOver, reportLost };
}
