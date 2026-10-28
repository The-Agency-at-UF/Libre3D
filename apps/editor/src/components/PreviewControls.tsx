import { useEffect } from "react";
import { useEditorStore } from "../store/useEditorStore";

// Preview hides the whole inspector, which is where Play/Stop normally lives, so
// this floating chip is the only way back out — plus Escape, since a full-bleed
// preview reads as a modal surface. Mounted only while previewing.
export function PreviewControls() {
  const setPreviewMode = useEditorStore((state) => state.setPreviewMode);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setPreviewMode(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [setPreviewMode]);

  return (
    <button
      className="btn-chip preview-exit-btn"
      type="button"
      title="Stop preview (Esc)"
      onClick={() => setPreviewMode(false)}
    >
      <i className="ti ti-player-stop" style={{ fontSize: "12px" }}></i>
      <span>Stop</span>
    </button>
  );
}
