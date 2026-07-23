import { useEffect, useRef } from "react";
import * as THREE from "three";
import { useEditorStore } from "../../store/useEditorStore";
import Stats from "three/examples/jsm/libs/stats.module.js";

export function useViewportRenderer(
  containerRef: React.RefObject<HTMLDivElement | null>,
  scene: THREE.Scene,
  // Accept a ref so the RAF loop always reads the live camera,
  // even after perspective ↔ orthographic switches.
  cameraRef: React.RefObject<THREE.Camera>,
  onRender?: () => void
) {
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const statsRef    = useRef<Stats | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(window.devicePixelRatio || 1);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.domElement.style.width   = "100%";
    renderer.domElement.style.height  = "100%";
    renderer.domElement.style.display = "block";
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Expose the live renderer the same way ViewportCanvas exposes the live
    // scene (window.__libre3dScene) — KTX2Loader.detectSupport() needs a real
    // renderer to probe GPU compressed-texture support, and .glb imports run
    // from non-component code (importModel.ts) that can't reach it otherwise.
    (window as unknown as { __libre3dRenderer?: THREE.WebGLRenderer | null }).__libre3dRenderer = renderer;

    const stats = new Stats();
    stats.dom.style.position = "absolute";
    stats.dom.style.top  = "10px";
    stats.dom.style.left = "10px";
    container.appendChild(stats.dom);
    statsRef.current = stats;

    let animationFrameId = 0;

    const animate = () => {
      animationFrameId = window.requestAnimationFrame(animate);
      if (useEditorStore.getState().isPreviewMode) return;
      stats.update();
      if (onRender) onRender();
      // cameraRef.current is always the active camera — no stale closure.
      renderer.render(scene, cameraRef.current);
    };
    animate();

    return () => {
      window.cancelAnimationFrame(animationFrameId);
      const rendererWindow = window as unknown as { __libre3dRenderer?: THREE.WebGLRenderer | null };
      if (rendererWindow.__libre3dRenderer === renderer) {
        delete rendererWindow.__libre3dRenderer;
      }
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
