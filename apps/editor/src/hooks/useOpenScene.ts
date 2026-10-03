import { useEffect, useState } from "react";

import { useEditorStore } from "../store/useEditorStore";
import { ApiAuthError } from "../utils/apiFetch";
import { parseSceneDocument } from "../utils/sceneDocument";
import { SceneApiError, getScene, type OpenedScene } from "../utils/sceneLibrary";

export type OpenSceneState =
  | { status: "loading" }
  | { status: "ready"; scene: OpenedScene }
  | { status: "notFound" }
  | { status: "newer" }
  | { status: "error"; message: string };

/**
 * Loads `/edit/:sceneId`'s scene into the store (`loadScene`, which also clears undo history) and
 * reports how that went. The editor shows the viewport only once this is `ready`, so the managers
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

        if (document === null) {
          useEditorStore.getState().loadScene(null);
          setState({ status: "ready", scene });
          return;
        }

        const parsed = parseSceneDocument(document);

        if (!parsed.ok) {
          setState(parsed.reason === "newer" ? { status: "newer" } : { status: "error", message: "This scene's saved data is damaged." });
          return;
        }

        useEditorStore.getState().loadScene(parsed.content);
        setState({ status: "ready", scene });
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
