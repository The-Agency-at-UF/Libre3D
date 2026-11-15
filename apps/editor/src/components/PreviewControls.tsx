import { useEffect, useState } from "react";
import { useEditorStore } from "../store/useEditorStore";
import { setPlayScrollProgress } from "../viewport/playScroll";

// The scrubber's resolution: 1000 steps from 0 to 1, fine enough that a drag looks continuous.
const SCRUB_STEPS = 1000;

// Preview hides the whole inspector, which is where Play/Stop normally lives, so
// this floating bar is the only way back out — plus Escape, since a full-bleed
// preview reads as a modal surface. Mounted only while previewing, so each Play
// starts its scrubber at 0, as the runtime does.
export function PreviewControls() {
  const setPreviewMode = useEditorStore((state) => state.setPreviewMode);
  // A boolean, so the bar re-renders only when a Scroll event comes or goes, not on every edit.
  const hasScrollEvents = useEditorStore((state) =>
    Object.values(state.animation.events).some((event) => event.trigger === "scroll"),
  );

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setPreviewMode(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [setPreviewMode]);

  return (
    <div className="play-bar">
      {hasScrollEvents && <ScrollScrubber />}
      <button
        className="btn-chip preview-exit-btn"
        type="button"
        title="Stop preview (Esc)"
        onClick={() => setPreviewMode(false)}
      >
        <i className="ti ti-player-stop" style={{ fontSize: "12px" }}></i>
        <span>Stop</span>
      </button>
    </div>
  );
}

// Stands in for the page scroll Scroll events follow on the share page (decision tree B4): there is
// no page to scroll in the editor. Its value goes straight to Play's runtime (playScroll.ts), never
// through the store, so a drag costs no React render outside this component and no undo step.
function ScrollScrubber() {
  const [steps, setSteps] = useState(0);

  return (
    <label className="play-scrubber" title="Scroll: scrub the scene's Scroll events">
      <i className="ti ti-mouse"></i>
      <input
        type="range"
        min={0}
        max={SCRUB_STEPS}
        step={1}
        value={steps}
        aria-label="Scroll progress"
        style={{ "--value-percent": `${(steps / SCRUB_STEPS) * 100}%` } as React.CSSProperties}
        onChange={(event) => {
          const next = Number(event.target.value);
          setSteps(next);
          setPlayScrollProgress(next / SCRUB_STEPS);
        }}
      />
    </label>
  );
}
