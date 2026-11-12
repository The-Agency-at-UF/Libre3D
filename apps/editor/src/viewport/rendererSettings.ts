import * as THREE from "three";
import { WebGPURenderer } from "three/webgpu";
import { installCanvasOutput } from "./canvasOutput";

/**
 * The renderer every scene is drawn with: three's WebGPURenderer, which draws with WebGPU where the
 * browser has it and with WebGL 2 where it doesn't. Materials are node materials either way (three
 * turns the built-in ones into theirs itself), so a shader is written once, in TSL, for both.
 */
export type SceneRenderer = WebGPURenderer;

// `?webgl` in the page's address draws with WebGL 2 even where WebGPU is there: for checking the
// fallback, and a way out for a browser whose WebGPU misbehaves.
const forceWebGL = (): boolean => new URLSearchParams(window.location.search).has("webgl");

/**
 * A renderer set up the way scenes are drawn everywhere: the editor's viewport
 * (useViewportRenderer) and the share-link viewer (SceneViewer.ts). Its canvas fills its container.
 *
 * The canvas is there at once, but nothing can be drawn (and nothing that asks the GPU a question
 * answered: an environment map, compressed-texture support) until `whenRendererReady` resolves.
 */
export const createSceneRenderer = (): SceneRenderer => {
  const renderer = new WebGPURenderer({ antialias: true, alpha: true, forceWebGL: forceWebGL() });
  renderer.setPixelRatio(window.devicePixelRatio || 1);
  // Tone mapping and the conversion to sRGB are each material's own last step (canvasOutput.ts),
  // not the renderer's pass over the finished picture.
  renderer.outputColorSpace = THREE.LinearSRGBColorSpace;
  renderer.toneMapping = THREE.NoToneMapping;
  installCanvasOutput(renderer);
  renderer.domElement.style.width = "100%";
  renderer.domElement.style.height = "100%";
  renderer.domElement.style.display = "block";
  return renderer;
};

const starting = new WeakMap<SceneRenderer, Promise<void>>();

/**
 * Starts the renderer (it asks the browser for a GPU device, falling back to WebGL 2) and resolves
 * when it can draw. Every caller for one renderer gets the same promise: three's own `init()`
 * throws when called again after it has finished.
 */
export const whenRendererReady = (renderer: SceneRenderer): Promise<void> => {
  let ready = starting.get(renderer);
  if (!ready) {
    ready = renderer.init().then(() => undefined);
    starting.set(renderer, ready);
  }
  return ready;
};

/**
 * Frees a renderer and takes its canvas off the page. Under WebGL 2 this also gives the context
 * back (a page gets only so many).
 *
 * Safe while the renderer is still starting: it's freed once it has started, since three can't
 * free a backend that is half made.
 */
export const disposeSceneRenderer = (renderer: SceneRenderer): void => {
  renderer.domElement.remove();
  void starting.get(renderer)?.then(
    () => renderer.dispose(),
    () => undefined,
  );
};
