import { useEffect, useRef } from "react";
import * as THREE from "three";
import { useEditorStore } from "../../store/useEditorStore";
import Stats from "three/examples/jsm/libs/stats.module.js";
import { hasPendingThumbnail, renderPendingThumbnail } from "../thumbnailCapture";
import { hideEditorOnlyObjects } from "../editorOnly";
import { setLiveRenderer } from "../liveViewport";
import { createSceneRenderer, disposeSceneRenderer, whenRendererReady, type SceneRenderer } from "../rendererSettings";
import { RIGHT_SIDEBAR_CLEARANCE } from "./useViewportGizmo";

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
  const rendererRef = useRef<SceneRenderer | null>(null);
  // The FPS panel, while the HUD shows it (see the effect below); null otherwise.
  const statsRef    = useRef<Stats | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Set up as the share-link viewer's is (rendererSettings.ts), so the editor previews what's published.
    const renderer = createSceneRenderer();
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // KTX2 decoding in .glb imports (non-component code) needs the live renderer.
    const clearLiveRenderer = setLiveRenderer(renderer);

    let animationFrameId = 0;
    let disposed = false;

    const animate = () => {
      animationFrameId = window.requestAnimationFrame(animate);
      statsRef.current?.update();
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
    // Nothing can be drawn until the renderer has started (it asks the browser for a GPU device,
    // which takes a moment). The canvas is already in the page, so the hooks that listen on it
    // don't wait.
    whenRendererReady(renderer).then(
      () => {
        if (!disposed) animate();
      },
      (error) => console.error("[Libre3D] The renderer could not start:", error),
    );

    return () => {
      disposed = true;
      window.cancelAnimationFrame(animationFrameId);
      clearLiveRenderer();
      disposeSceneRenderer(renderer);
    };
    // Only scene/container matter for renderer lifecycle; camera is via ref.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [containerRef, scene]);

  // The FPS panel is built when the HUD setting asks for it and removed when it stops asking.
  // Updating it draws on its own canvases every frame, which a hidden panel paid for too.
  useEffect(() => {
    const removeStats = () => {
      statsRef.current?.dom.remove();
      statsRef.current = null;
    };
    const unsubscribe = useEditorStore.subscribe(
      (state) => state.hudOverlay === "Stats",
      (showStats) => {
        if (!showStats) {
          removeStats();
          return;
        }
        const canvas = rendererRef.current?.domElement;
        if (statsRef.current || !canvas) return;
        const stats = new Stats();
        // Bottom right of the part of the viewport that shows. The viewport runs under both
        // sidebars, and the panel's old place (its top left corner) is behind the left one, whose
        // width the user can change; the right one's is fixed, as for the navigation gizmo.
        stats.dom.style.position = "absolute";
        stats.dom.style.top = "auto";
        stats.dom.style.left = "auto";
        stats.dom.style.bottom = "16px";
        stats.dom.style.right = `${RIGHT_SIDEBAR_CLEARANCE}px`;
        // In the editor's viewport area, not in the canvas's own container: a fixed-size frame
        // sizes and scales that container, and the panel must stay where it is on the screen.
        (canvas.closest(".viewport-container") ?? canvas.parentElement)?.appendChild(stats.dom);
        statsRef.current = stats;
      },
      { fireImmediately: true }
    );
    return () => {
      unsubscribe();
      removeStats();
    };
    // After the effect above, which makes the renderer's canvas for the same container and scene.
  }, [containerRef, scene]);

  return rendererRef;
}
