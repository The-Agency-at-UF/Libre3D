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
