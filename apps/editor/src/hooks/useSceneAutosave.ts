import { useCallback, useEffect, useRef, useState } from "react";
import { shallow } from "zustand/shallow";

import { selectSceneContent, useEditorStore } from "../store/useEditorStore";
import { SceneAutosaver, type SaveStatus } from "../utils/sceneAutosave";
import { toSceneDocument } from "../utils/sceneDocument";
import type { OpenedScene } from "../utils/sceneLibrary";

/**
 * Autosaves the open scene (see `SceneAutosaver` for the timing) for as long as the editor is
 * mounted: every change to the scene's content in the store counts as an edit. Leaving the editor
 * saves right away; closing the tab with unsaved edits asks first.
 *
 * Returns the save status for the indicator, `retry` (save now), and `flush` (save everything and
 * report whether that worked, e.g. before signing out).
 */
export function useSceneAutosave(scene: OpenedScene) {
  const [status, setStatus] = useState<SaveStatus>({ kind: "saved", savedAt: null });
  const autosaverRef = useRef<SceneAutosaver | null>(null);

  useEffect(() => {
    const autosaver = new SceneAutosaver({
      sceneId: scene.sceneId,
      revision: scene.revision,
      readDocument: () => toSceneDocument(selectSceneContent(useEditorStore.getState())),
      onStatus: setStatus,
    });
    autosaverRef.current = autosaver;

    // Subscribed after the scene was loaded, so the load itself isn't an edit.
    const unsubscribe = useEditorStore.subscribe(selectSceneContent, () => autosaver.markChanged(), {
      equalityFn: shallow,
    });

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (autosaver.hasUnsavedWork) {
        void autosaver.saveNow();
        event.preventDefault();
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      unsubscribe();
      window.removeEventListener("beforeunload", handleBeforeUnload);
      // Leaving for the gallery: save now. The gallery's list waits for this save to land.
      void autosaver.saveNow();
      autosaver.dispose();
      autosaverRef.current = null;
    };
  }, [scene.sceneId, scene.revision]);

  const retry = useCallback(() => {
    void autosaverRef.current?.saveNow();
  }, []);

  const flush = useCallback(async (): Promise<boolean> => (await autosaverRef.current?.flush()) ?? true, []);

  return { status, retry, flush };
}
