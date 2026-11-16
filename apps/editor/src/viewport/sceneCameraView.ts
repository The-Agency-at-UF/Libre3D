/**
 * PURPOSE: Looking through a scene camera (C6): puts a render camera where a scene camera object is
 * and gives it its lens, each frame.
 *
 * INPUT: The render camera (the editor's, through `cameraRef`, or Play's and the viewer's PlayCamera)
 *        and the scene camera's object (sceneCameraObject.ts), posed for this frame.
 * OUTPUT: The render camera moved and its projection updated, when the lens changed.
 *
 * A scene camera is a pose source, not a camera handed to the renderer: there is still one camera
 * per view, so nothing that holds it (the controls, the raycaster) has to be told. It reads the
 * object's world transform, so a camera in a group, or mid-transition, is followed as drawn.
 * Allocates nothing. Field of view is vertical. An orthographic camera keeps its own frustum and
 * zooms so its height is the scene camera's (`orthoSize` is half of it).
 */

import * as THREE from "three";
import type { SceneCameraObject } from "./sceneCameraObject";

export type ViewCamera = THREE.PerspectiveCamera | THREE.OrthographicCamera;

const scratchScale = new THREE.Vector3();

/** Gives `camera` the scene camera's near, far, and field of view or size; recomputes its projection only if one changed. */
export const applySceneCameraLens = (camera: ViewCamera, source: SceneCameraObject): void => {
  const { near, far, orthoSize } = source.lens;
  let changed = camera.near !== near || camera.far !== far;
  camera.near = near;
  camera.far = far;
  if (camera instanceof THREE.PerspectiveCamera) {
    changed ||= camera.fov !== source.fov || camera.zoom !== 1;
    camera.fov = source.fov;
    camera.zoom = 1;
  } else {
    const zoom = camera.top / Math.max(1e-3, orthoSize);
    changed ||= camera.zoom !== zoom;
    camera.zoom = zoom;
  }
  if (changed) camera.updateProjectionMatrix();
};

/** Puts `camera` where the scene camera is, looking its way, with its lens. */
export const followSceneCamera = (camera: ViewCamera, source: SceneCameraObject): void => {
  source.updateWorldMatrix(true, false);
  source.matrixWorld.decompose(camera.position, camera.quaternion, scratchScale);
  camera.updateMatrixWorld();
  applySceneCameraLens(camera, source);
};
