import { useEffect, useRef, useState } from "react";
import { hasScrollEvents as anyScrollEvents, hasSoundActions } from "../animation/events";
import { clampProgress } from "../animation/transitions";
import { useEditorStore } from "../store/useEditorStore";
import { setPlayMuted } from "../viewport/playAudio";
import { setPlayScrollProgress } from "../viewport/playScroll";
import { sessionMuted } from "../viewport/sceneAudio";
import { MuteButton } from "./ui/MuteButton";

// The scrubber's resolution: 1000 steps from 0 to 1, fine enough that a drag looks continuous.
const SCRUB_STEPS = 1000;

// A wheel notch in pixels, for wheels that report lines instead (Firefox, some mice).
const LINE_PIXELS = 16;

// Preview hides the whole inspector, which is where Play/Stop normally lives, so
// this floating bar is the only way back out — plus Escape, since a full-bleed
// preview reads as a modal surface. Mounted only while previewing, so each Play
// starts its scrubber at 0, as the runtime does.
export function PreviewControls() {
  const setPreviewMode = useEditorStore((state) => state.setPreviewMode);
  const hasScrollEvents = useEditorStore((state) => anyScrollEvents(state.animation.events));
  // A scene with sound gets the mute button, unless the author hid it (then it stays muted, as on the share page).
  const showMuteButton = useEditorStore((state) => state.sceneSettings.audioButton.visible && hasSoundActions(state.animation.events));

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setPreviewMode(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [setPreviewMode]);

  return (
    <>
      {showMuteButton && <PlayMuteButton />}
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
    </>
  );
}

// Starts as this session last left it (muted the first time); goes to Play's audio through
// playAudio.ts, never the store.
function PlayMuteButton() {
  const [muted, setMuted] = useState(sessionMuted.get);
  return (
    <MuteButton
      muted={muted}
      onToggle={(next) => {
        setMuted(next);
        sessionMuted.set(next);
        setPlayMuted(next);
      }}
    />
  );
}

// Stands in for the page scroll Scroll events follow on the share page (decision tree B4): there is
// no page to scroll in the editor. Its value goes straight to Play's runtime (playScroll.ts), never
// through the store, so a drag costs no React render outside this component and no undo step.
// The mouse wheel over the viewport scrubs it too, by the same distance the share page scrolls: the
// scene's scroll length is that many screen heights, so the scrollable range is (length - 1) of them.
function ScrollScrubber() {
  const [steps, setSteps] = useState(0);
  const scrollLength = useEditorStore((state) => state.sceneSettings.scroll.length);
  const progressRef = useRef(0); // the exact progress; `steps` is only what the slider shows
  const lengthRef = useRef(scrollLength);
  lengthRef.current = scrollLength;

  const scrubTo = (progress: number) => {
    progressRef.current = progress;
    setSteps(Math.round(progress * SCRUB_STEPS));
    setPlayScrollProgress(progress);
  };

  useEffect(() => {
    const handleWheel = (event: WheelEvent) => {
      // Only over the viewport, and not with Ctrl or Cmd (zoom).
      if (!(event.target instanceof HTMLCanvasElement) || event.ctrlKey || event.metaKey) return;
      const range = (lengthRef.current - 1) * window.innerHeight;
      if (!(range > 0)) return;
      event.preventDefault();
      const pixels = event.deltaMode === 1 ? event.deltaY * LINE_PIXELS : event.deltaMode === 2 ? event.deltaY * window.innerHeight : event.deltaY;
      scrubTo(clampProgress(progressRef.current + pixels / range));
    };
    window.addEventListener("wheel", handleWheel, { passive: false });
    return () => window.removeEventListener("wheel", handleWheel);
    // scrubTo only uses state setters and a module function, which never change.
  }, []);

  return (
    <label className="play-scrubber" title="Scroll: scrub the scene's Scroll events (or use the mouse wheel over the scene)">
      <i className="ti ti-mouse"></i>
      <input
        type="range"
        min={0}
        max={SCRUB_STEPS}
        step={1}
        value={steps}
        aria-label="Scroll progress"
        style={{ "--value-percent": `${(steps / SCRUB_STEPS) * 100}%` } as React.CSSProperties}
        onChange={(event) => scrubTo(Number(event.target.value) / SCRUB_STEPS)}
      />
    </label>
  );
}
