/**
 * PURPOSE: The editor's live renderer, for editor code that runs outside the viewport's components
 * and can't be handed it: the `.glb` importer and ObjectManager's model loading (KTX2 textures need
 * a real renderer to find out which compressed formats this GPU takes).
 *
 * INPUT: The viewport sets it when it mounts (useViewportRenderer) and clears it when it unmounts.
 * OUTPUT: `getLiveRenderer`, null while no viewport is mounted.
 *
 * There is one editor viewport at a time, so one module-level reference is enough. Editor-only: the
 * share-link viewer hands its own renderer to what needs it (SceneViewer.ts) and never loads this
 * file, so two viewers on one page can't take each other's.
 *
 * Each value is also put on `window` as a console handle (`__libre3dRenderer`), for inspection only.
 */

import type * as THREE from "three";
import { exposeConsoleHandle } from "../utils/consoleHandle";

let liveRenderer: THREE.WebGLRenderer | null = null;

export const getLiveRenderer = (): THREE.WebGLRenderer | null => liveRenderer;

/** Makes `renderer` the live one. Returns a function that clears it, if it's still this one. */
export const setLiveRenderer = (renderer: THREE.WebGLRenderer): (() => void) => {
  liveRenderer = renderer;
  const removeHandle = exposeConsoleHandle("__libre3dRenderer", renderer);
  return () => {
    if (liveRenderer === renderer) liveRenderer = null;
    removeHandle();
  };
};
