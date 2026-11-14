/**
 * PURPOSE: The editor's live Three.js scene and renderer, for editor code that runs outside the
 * viewport's components and can't be handed them: export and the Depth layer's reach measurement
 * read the scene; the `.glb` importer and ObjectManager's model loading need the renderer (KTX2
 * textures need a real one to find out which compressed formats this GPU takes).
 *
 * INPUT: The viewport sets each when it mounts (ViewportCanvas, useViewportRenderer) and clears it
 * when it unmounts.
 * OUTPUT: `getLiveScene` and `getLiveRenderer`, null while no viewport is mounted.
 *
 * There is one editor viewport at a time, so one module-level reference each is enough. They hold
 * Three.js objects, not editor state: that all lives in the store. Editor-only: the share-link
 * viewer hands its own scene and renderer to what needs them (SceneViewer.ts) and never loads this
 * file, so two viewers on one page can't take each other's.
 *
 * Each value is also put on `window` as a console handle (`__libre3dScene`, `__libre3dRenderer`),
 * for inspection only.
 */

import type * as THREE from "three";
import type { SceneRenderer } from "./rendererSettings";
import { exposeConsoleHandle } from "../utils/consoleHandle";

let liveScene: THREE.Scene | null = null;
let liveRenderer: SceneRenderer | null = null;

export const getLiveScene = (): THREE.Scene | null => liveScene;

/** Makes `scene` the live one. Returns a function that clears it, if it's still this one. */
export const setLiveScene = (scene: THREE.Scene): (() => void) => {
  liveScene = scene;
  const removeHandle = exposeConsoleHandle("__libre3dScene", scene);
  return () => {
    if (liveScene === scene) liveScene = null;
    removeHandle();
  };
};

export const getLiveRenderer = (): SceneRenderer | null => liveRenderer;

/** Makes `renderer` the live one. Returns a function that clears it, if it's still this one. */
export const setLiveRenderer = (renderer: SceneRenderer): (() => void) => {
  liveRenderer = renderer;
  const removeHandle = exposeConsoleHandle("__libre3dRenderer", renderer);
  return () => {
    if (liveRenderer === renderer) liveRenderer = null;
    removeHandle();
  };
};
