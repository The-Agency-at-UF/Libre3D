import { useCallback, useEffect, useRef, useState } from "react";
import { shallow } from "zustand/shallow";

import { selectSceneContent, useEditorStore } from "../store/useEditorStore";
import { getAuthSnapshot } from "../utils/authSession";
import { SceneAutosaver, type SaveStatus } from "../utils/sceneAutosave";
import { clearSceneCache, writeSceneCache } from "../utils/sceneCache";
import { toSceneDocument } from "../utils/sceneDocument";
import type { OpenedScene } from "../utils/sceneLibrary";

// How often unsaved edits are copied to this browser's cache while editing continues.
const CACHE_WRITE_INTERVAL_MS = 500;

interface UseSceneAutosaveOptions {
  /** The scene was opened from this browser's copy of unsaved edits: save them right away. */
  hasRecoveredEdits: boolean;
}

/**
 * Autosaves the open scene (see `SceneAutosaver` for the timing) for as long as the editor is
 * mounted: every change to the scene's content in the store counts as an edit. Until an edit is
 * saved, a copy stays in this browser (sceneCache.ts) so a closed tab or lost connection can't lose
 * it. Leaving the editor saves right away; closing the tab with unsaved edits asks first.
 *
 * Returns the save status for the indicator, `retry` (save now), and `flush` (save everything and
 * report whether that worked, e.g. before signing out).
 */
export function useSceneAutosave(scene: OpenedScene, { hasRecoveredEdits }: UseSceneAutosaveOptions) {
  const [status, setStatus] = useState<SaveStatus>({ kind: "saved", savedAt: null });
  const autosaverRef = useRef<SceneAutosaver | null>(null);
  // The latest saved revision, kept across effect runs: a save fired by one run's cleanup (e.g.
  // StrictMode's remount) must not leave the next autosaver building on the old revision (a 409).
  const revisionRef = useRef(scene.revision);

  useEffect(() => {
    const auth = getAuthSnapshot();
    const ownerId = auth.status === "signedIn" ? auth.userId : null;
    const readDocument = () => toSceneDocument(selectSceneContent(useEditorStore.getState()));
    let cacheTimer: ReturnType<typeof setTimeout> | null = null;

    const writeCacheNow = () => {
      if (cacheTimer !== null) {
        clearTimeout(cacheTimer);
        cacheTimer = null;
      }

      if (ownerId) {
        writeSceneCache({
          ownerId,
          sceneId: scene.sceneId,
          baseRevision: revisionRef.current,
          document: readDocument(),
        });
      }
    };

    const autosaver = new SceneAutosaver({
      sceneId: scene.sceneId,
      readRevision: () => revisionRef.current,
      readDocument,
      onStatus: setStatus,
      onSaved: (revision, hasPendingEdits) => {
        revisionRef.current = revision;

        if (hasPendingEdits) {
          // Re-key the copy to the new revision, or reopening would think the cloud moved on.
          writeCacheNow();
        } else {
          if (cacheTimer !== null) {
            clearTimeout(cacheTimer);
            cacheTimer = null;
          }

          clearSceneCache(scene.sceneId);
        }
      },
    });
    autosaverRef.current = autosaver;

    // Subscribed after the scene was loaded, so the load itself isn't an edit.
    const unsubscribe = useEditorStore.subscribe(
      selectSceneContent,
      () => {
        autosaver.markChanged();
        cacheTimer ??= setTimeout(writeCacheNow, CACHE_WRITE_INTERVAL_MS);
      },
      { equalityFn: shallow },
    );

    if (hasRecoveredEdits) {
      autosaver.markChanged();
    }

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (autosaver.hasUnsavedWork) {
        writeCacheNow();
        void autosaver.saveNow();
        event.preventDefault();
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      unsubscribe();
      window.removeEventListener("beforeunload", handleBeforeUnload);

      if (autosaver.hasUnsavedWork) {
        writeCacheNow();
      }

      // Leaving for the gallery: save now. The gallery's list waits for this save to land, and
      // onSaved clears the local copy once it has.
      void autosaver.saveNow();
      autosaver.dispose();
      autosaverRef.current = null;
    };
  }, [scene.sceneId, hasRecoveredEdits]);

  const retry = useCallback(() => {
    void autosaverRef.current?.saveNow();
  }, []);

  const flush = useCallback(async (): Promise<boolean> => (await autosaverRef.current?.flush()) ?? true, []);

  return { status, retry, flush };
}
