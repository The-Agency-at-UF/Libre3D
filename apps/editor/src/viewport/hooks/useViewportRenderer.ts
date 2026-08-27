import { useEffect, useRef } from "react";
import * as THREE from "three";
import { useEditorStore } from "../../store/useEditorStore";
import Stats from "three/examples/jsm/libs/stats.module.js";

// model-viewer's exposure boost for Neutral tone mapping without an explicit
// environment/skybox image. Keep in step with the `tone-mapping` attribute on the
// preview <model-viewer> in App.tsx.
const MODEL_VIEWER_NEUTRAL_EXPOSURE = 1.3;

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

    // Match <model-viewer>'s tone mapping so the editor is a truthful preview of
    // what gets published, instead of showing raw untone-mapped colour.
    //
    // Both numbers are read off model-viewer 4.0.0 rather than guessed. Its
    // `tone-mapping` default of "auto" resolves to three's NeutralToneMapping (7),
    // and its renderer does:
    //
    //   c = toneMapping === 7 && ("neutral" === envImage || "legacy" === envImage
    //                             || (!envImage && !skyboxImage));
    //   threeRenderer.toneMappingExposure = (exposure ?? 1) * (c ? 1.3 : 1);
    //
    // We set neither environment-image nor skybox-image on the preview element
    // (see App.tsx), so that 1.3 boost is always in play and the editor has to
    // apply it too. The preview element pins `tone-mapping="neutral"` so this
    // pairing can't drift if a future model-viewer redefines "auto".
    //
    // NOTE: this only matches the tone *curve*. The editor still lights with an
    // AmbientLight while model-viewer lights with a generated environment map, so
    // the two are not yet identical — that gap needs a shared IBL environment.
    renderer.toneMapping = THREE.NeutralToneMapping;
    renderer.toneMappingExposure = MODEL_VIEWER_NEUTRAL_EXPOSURE;
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
      // Preview covers this canvas with the <model-viewer> overlay, so stop
      // rendering. The canvas stays laid out (never display:none) because the
      // overlay is pointer-events:none and the editor's OrbitControls still need
      // to receive the orbit/pan/zoom gestures through it.
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
