/**
 * PURPOSE: Draws only the editor's own objects (anything tagged `userData.editorOnly`: the grid,
 * light helpers, selection outlines, the transform gizmo, the pen's overlays) onto the canvas, over
 * a picture that is already there.
 *
 * INPUT: The renderer, the scene and this frame's camera, after the scene's effect chain has drawn
 *        the scene (and its depth) to the canvas without them (postProcessing.ts, `keepDepth`).
 * OUTPUT: The canvas with the editor's objects on it: untouched by any effect, hidden behind the
 *         scene's objects where they are behind them, and on top where they ignore depth.
 *
 * Only what is on the editor's layer is drawn, so an editor object inside a scene object (a light's
 * helper, an outline) is drawn without its parent. Layers aren't inherited, so every object under a
 * tagged one is put on it here, each frame: nothing that makes an editor object has to know.
 *
 * Editor-only: the share-link viewer builds none of these objects and never loads this.
 */

import type * as THREE from "three";

import type { SceneRenderer } from "./rendererSettings";

// Layer 0 is three's default, which everything stays on (raycasts and normal renders use it).
const EDITOR_LAYER = 1;

const putOnEditorLayer = (object: THREE.Object3D): void => {
  object.layers.enable(EDITOR_LAYER);
};

export const drawEditorOnlyObjects = (renderer: SceneRenderer, scene: THREE.Scene, camera: THREE.Camera): void => {
  scene.traverse((object) => {
    if (object.userData?.editorOnly) object.traverse(putOnEditorLayer);
  });

  const background = scene.background;
  const cameraLayers = camera.layers.mask;
  const autoClear = renderer.autoClear;
  // Over what is on the canvas: no clearing, and no background painted across it.
  scene.background = null;
  camera.layers.set(EDITOR_LAYER);
  renderer.autoClear = false;
  try {
    renderer.render(scene, camera);
  } finally {
    scene.background = background;
    camera.layers.mask = cameraLayers;
    renderer.autoClear = autoClear;
  }
};
