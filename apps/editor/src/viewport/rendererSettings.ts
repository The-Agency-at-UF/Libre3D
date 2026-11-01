import * as THREE from "three";

// The exposure the scene is tone-mapped with. It was read off <model-viewer> 4.0.0 when that played
// published scenes (Neutral tone mapping, boosted 1.3x with no environment image) so the editor was
// a truthful preview of them. Kept now that the share link plays scenes itself (SceneViewer.ts), so
// scenes look as they always have, in the editor and published alike.
const SCENE_EXPOSURE = 1.3;

/**
 * A renderer set up the way scenes are drawn everywhere: the editor's viewport
 * (useViewportRenderer) and the share-link viewer (SceneViewer.ts). Its canvas fills its container.
 */
export const createSceneRenderer = (): THREE.WebGLRenderer => {
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(window.devicePixelRatio || 1);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.NeutralToneMapping;
  renderer.toneMappingExposure = SCENE_EXPOSURE;
  renderer.domElement.style.width = "100%";
  renderer.domElement.style.height = "100%";
  renderer.domElement.style.display = "block";
  return renderer;
};

type LiveRendererWindow = Window & { __libre3dRenderer?: THREE.WebGLRenderer | null };

/**
 * Makes `renderer` the one non-component code reaches (utils/createGltfLoader.ts: KTX2Loader needs a
 * real renderer to probe GPU texture support), and returns a function that undoes it if it's still
 * this one.
 */
export const exposeLiveRenderer = (renderer: THREE.WebGLRenderer): (() => void) => {
  (window as LiveRendererWindow).__libre3dRenderer = renderer;
  return () => {
    if ((window as LiveRendererWindow).__libre3dRenderer === renderer) (window as LiveRendererWindow).__libre3dRenderer = null;
  };
};
