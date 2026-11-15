import { useEffect, useRef, useState } from "react";

import { exposeConsoleHandle } from "../utils/consoleHandle";
import type { StoredSceneContent } from "../utils/sceneDocument";
import { createPublishedSceneSource } from "../viewport/publishedSceneSource";
import { SceneViewer } from "../viewport/SceneViewer";
import { scrollProgressOf } from "../viewport/scrollProgress";

interface PublishedSceneViewProps {
  content: StoredSceneContent;
  /** Presigned GETs for the scene's imported assets, by content hash. */
  assets: Record<string, string>;
}

/*
 * BLOCK: PublishedSceneView (React Component)
 * PURPOSE: The share page's scene: a SceneViewer (viewport/SceneViewer.ts) filling the page, made on
 *          mount and disposed on unmount. Lazy-loaded by PublicViewer, so Three.js downloads only
 *          once there's a scene to show.
 *
 *          A scene with Scroll events makes the page scroll (decision tree B4): the canvas stays
 *          pinned (sticky) in a scroller of its own (the body never scrolls: the editor's shell
 *          needs it fixed), over an empty spacer as tall as the scene's scroll length, so scrolling
 *          it from top to bottom plays the Scroll events from start to end. The scroller's one
 *          passive scroll listener only hands the viewer the progress; the viewer's frame loop
 *          does the rest. A scene without Scroll events gets no spacer and doesn't scroll.
 */
export default function PublishedSceneView({ content, assets }: PublishedSceneViewProps) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<SceneViewer | null>(null);
  // The scroll length (screen heights) when the scene has Scroll events, else null.
  const [scrollLength, setScrollLength] = useState<number | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const reduceMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
    const viewer = new SceneViewer(container, content, createPublishedSceneSource(content.entities, assets, content.materials), { reduceMotion });
    viewerRef.current = viewer;
    setScrollLength(viewer.hasScrollEvents ? viewer.scrollLength : null);
    // The share page's console handle, like the editor's. The page sets it, not the viewer.
    const removeHandle = exposeConsoleHandle("__libre3dRenderer", viewer.renderer);
    return () => {
      removeHandle();
      viewer.dispose();
      viewerRef.current = null;
    };
  }, [content, assets]);

  useEffect(() => {
    const scroller = scrollerRef.current;
    if (scrollLength === null || !scroller) return;
    // Measured here, on a scroll or a resize, never in the frame loop.
    const onScroll = () => viewerRef.current?.setScrollProgress(scrollProgressOf(scroller.scrollTop, scroller.scrollHeight, scroller.clientHeight));
    scroller.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    onScroll();
    // Focused, so Space, Page Down, and the arrows scroll it without a click first.
    scroller.focus({ preventScroll: true });
    return () => {
      scroller.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [scrollLength]);

  return (
    <div ref={scrollerRef} className={`viewer-scroller${scrollLength === null ? "" : " is-scrollable"}`} tabIndex={-1}>
      <div ref={containerRef} className="viewer-canvas" />
      {scrollLength !== null && <div className="viewer-scroll-spacer" style={{ height: `${scrollLength * 100}%` }} aria-hidden="true" />}
    </div>
  );
}
