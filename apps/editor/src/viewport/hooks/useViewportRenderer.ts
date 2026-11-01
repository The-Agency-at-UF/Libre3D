import { useEffect, useRef } from "react";
import * as THREE from "three";
import { useEditorStore } from "../../store/useEditorStore";
import Stats from "three/examples/jsm/libs/stats.module.js";
import { hasPendingThumbnail, renderPendingThumbnail } from "../thumbnailCapture";
import { hideEditorOnlyObjects } from "../../utils/exportScene";
import { createSceneRenderer, exposeLiveRenderer } from "../rendererSettings";

export function useViewportRenderer(
  containerRef: React.RefObject<HTMLDivElement | null>,
  scene: THREE.Scene,
  // Accept a ref so the RAF loop always reads the live camera,
  // even after perspective ↔ orthographic switches.
  cameraRef: React.RefObject<THREE.Camera>,
  onRender?: () => void,
  // Runs immediately after the main scene render call, not before it — for
  // anything that needs to draw *on top of* the just-rendered frame, such as
  // the navigation gizmo (useViewportGizmo.ts), which scissor-renders itself
  // into a corner of this same canvas and would otherwise be overpainted by
  // the main `renderer.render(scene, camera)` call below.
  onAfterRender?: () => void
) {
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const statsRef    = useRef<Stats | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Set up as the share-link viewer's is (rendererSettings.ts), so the editor previews what's published.
    const renderer = createSceneRenderer();
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // KTX2 decoding in .glb imports (non-component code) needs the live renderer.
    const unexposeRenderer = exposeLiveRenderer(renderer);

    const stats = new Stats();
    stats.dom.style.position = "absolute";
    stats.dom.style.top  = "10px";
    stats.dom.style.left = "10px";
    container.appendChild(stats.dom);
    statsRef.current = stats;

    let animationFrameId = 0;

    const animate = () => {
      animationFrameId = window.requestAnimationFrame(animate);
      stats.update();
      if (onRender) onRender();
      // A gallery picture asked for since the last frame (thumbnailCapture.ts) is taken here,
      // before the normal render paints over it.
      if (hasPendingThumbnail()) renderPendingThumbnail(renderer, scene, cameraRef.current);
      // Play shows the scene without the editor's own objects (grid, light helpers, selection
      // outlines, gizmo): the set exports and the gallery picture leave out. Hidden for each
      // render rather than once when Play starts, so nothing the editor shows again meanwhile
      // gets into a Play frame.
      const restoreEditorOnlyObjects = useEditorStore.getState().isPreviewMode ? hideEditorOnlyObjects(scene) : null;
      // cameraRef.current is always the active camera — no stale closure.
      renderer.render(scene, cameraRef.current);
      restoreEditorOnlyObjects?.();
      if (onAfterRender) onAfterRender();
    };
    animate();

    return () => {
      window.cancelAnimationFrame(animationFrameId);
      unexposeRenderer();
      renderer.dispose();
      renderer.forceContextLoss();
      renderer.domElement.remove();
      stats.dom.remove();
    };
    // Only scene/container matter for renderer lifecycle; camera is via ref.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [containerRef, scene]);

  // Handle Stats visibility
  useEffect(() => {
    return useEditorStore.subscribe(
      (state) => state.hudOverlay,
      (hudOverlay) => {
        if (statsRef.current) {
          statsRef.current.dom.style.display = hudOverlay === "Stats" ? "block" : "none";
        }
      },
      { fireImmediately: true }
    );
  }, []);

  return rendererRef;
}
