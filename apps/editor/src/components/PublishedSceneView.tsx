import { useEffect, useRef } from "react";

import type { StoredSceneContent } from "../utils/sceneDocument";
import { createPublishedSceneSource } from "../viewport/publishedSceneSource";
import { SceneViewer } from "../viewport/SceneViewer";

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
 */
export default function PublishedSceneView({ content, assets }: PublishedSceneViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const reduceMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
    const viewer = new SceneViewer(container, content, createPublishedSceneSource(content.entities, assets), { reduceMotion });
    return () => viewer.dispose();
  }, [content, assets]);

  return <div ref={containerRef} className="viewer-canvas" />;
}
