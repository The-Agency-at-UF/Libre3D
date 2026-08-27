import { useCallback } from "react";
import { useEditorStore } from "../store/useEditorStore";
import { createSceneExportBlob, getLiveScene } from "../utils/exportScene";

// Play/Stop is reachable from two places once preview hides the inspector: the
// topbar button and the floating control that replaces it on screen. Both drive
// the same session here so the blob URL is always created and revoked in one
// place — a second copy of this would leak object URLs the moment they drift.
export function usePreviewSession() {
  const isPreviewMode = useEditorStore((state) => state.isPreviewMode);

  const stopPreview = useCallback(() => {
    const { previewGlbUrl, setPreviewMode } = useEditorStore.getState();
    if (previewGlbUrl) {
      URL.revokeObjectURL(previewGlbUrl);
    }
    setPreviewMode(false, null);
  }, []);

  const startPreview = useCallback(async () => {
    const liveScene = getLiveScene();
    if (!liveScene) {
      window.alert("The live scene is not ready yet.");
      return;
    }

    try {
      const blob = await createSceneExportBlob(liveScene, "glb");
      if (!blob) {
        window.alert("There is no exportable mesh content in the current scene to preview.");
        return;
      }
      useEditorStore.getState().setPreviewMode(true, URL.createObjectURL(blob));
    } catch (error) {
      console.error("Failed to generate preview GLB:", error);
      window.alert("Failed to start Play Mode.");
    }
  }, []);

  const togglePreview = useCallback(async () => {
    if (useEditorStore.getState().isPreviewMode) {
      stopPreview();
      return;
    }
    await startPreview();
  }, [startPreview, stopPreview]);

  return { isPreviewMode, startPreview, stopPreview, togglePreview };
}
