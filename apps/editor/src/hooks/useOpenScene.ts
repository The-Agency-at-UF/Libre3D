import { useEffect, useState } from "react";

import { useEditorStore } from "../store/useEditorStore";
import { ApiAuthError } from "../utils/apiFetch";
import { getAuthSnapshot } from "../utils/authSession";
import { clearSceneCache, readSceneCache } from "../utils/sceneCache";
import { parseSceneDocument } from "../utils/sceneDocument";
import { SceneApiError, getScene, type OpenedScene } from "../utils/sceneLibrary";

export type OpenSceneState =
  | { status: "loading" }
  | { status: "ready"; scene: OpenedScene; hasRecoveredEdits: boolean }
  | { status: "notFound" }
  | { status: "newer" }
  | { status: "error"; message: string };

/**
 * Loads `/edit/:sceneId`'s scene into the store (`loadScene`, which also clears undo history) and
 * reports how that went. If this browser still holds this user's unsaved edits to the scene
 * (sceneCache.ts) and the cloud copy hasn't moved on since they were made, those are loaded
 * instead and saved right away (`hasRecoveredEdits`). The editor shows the viewport only once this is `ready`, so the managers
 * never build whatever scene the store held before.
 */
export function useOpenScene(sceneId: string): OpenSceneState {
  const [state, setState] = useState<OpenSceneState>({ status: "loading" });

  useEffect(() => {
    // Ignore a response for a scene that was left before it arrived.
    let active = true;
    setState({ status: "loading" });

    getScene(sceneId)
      .then(({ scene, document }) => {
        if (!active) {
          return;
        }

        const auth = getAuthSnapshot();
        const cached = auth.status === "signedIn" && auth.userId ? readSceneCache(auth.userId, sceneId) : null;
        const recovered = cached && cached.baseRevision === scene.revision ? parseSceneDocument(cached.document) : null;

        if (recovered?.ok) {
          useEditorStore.getState().loadScene(recovered.content);
          setState({ status: "ready", scene, hasRecoveredEdits: true });
          return;
        }

        if (cached) {
          // Saved from somewhere else since (or unreadable): the cloud copy wins.
          console.warn("[Libre3D] Discarded unsaved local edits to a scene that changed in the cloud since.");
          clearSceneCache(sceneId);
        }

        if (document === null) {
          useEditorStore.getState().loadScene(null);
          setState({ status: "ready", scene, hasRecoveredEdits: false });
          return;
        }

        const parsed = parseSceneDocument(document);

        if (!parsed.ok) {
          setState(parsed.reason === "newer" ? { status: "newer" } : { status: "error", message: "This scene's saved data is damaged." });
          return;
        }

        useEditorStore.getState().loadScene(parsed.content);
        setState({ status: "ready", scene, hasRecoveredEdits: false });
      })
      .catch((error: unknown) => {
        if (!active) {
          return;
        }

        if (error instanceof SceneApiError && error.status === 404) {
          setState({ status: "notFound" });
          return;
        }

        console.error("Failed to open the scene.", error);
        setState({
          status: "error",
          message: error instanceof ApiAuthError ? error.message : "The scene could not be opened. Check your connection and try again.",
        });
      });

    return () => {
      active = false;
    };
  }, [sceneId]);

  return state;
}
