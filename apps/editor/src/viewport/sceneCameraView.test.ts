import * as THREE from "three";
import { describe, expect, it, vi } from "vitest";

import { DEFAULT_SCENE_CAMERA } from "../scene/defaults";
import { SceneCameraObject } from "./sceneCameraObject";
import { applySceneCameraLens, followSceneCamera } from "./sceneCameraView";

describe("followSceneCamera", () => {
  it("puts a perspective camera at the scene camera's world pose with its lens", () => {
    const source = new SceneCameraObject({ ...DEFAULT_SCENE_CAMERA, fov: 30, near: 1, far: 50 }, true);
    const parent = new THREE.Group();
    parent.position.set(1, 2, 3);
    parent.add(source);
    source.rotation.set(0, 0.7, 0);
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 1000);

    followSceneCamera(camera, source);

    expect(camera.position.toArray()).toEqual([1, 2, 3]);
    expect(camera.quaternion.angleTo(new THREE.Quaternion().setFromEuler(new THREE.Euler(0, 0.7, 0)))).toBeLessThan(1e-9);
    expect(camera).toMatchObject({ fov: 30, near: 1, far: 50, zoom: 1 });
  });

  it("zooms an orthographic camera to the scene camera's size, keeping its own frustum", () => {
    const source = new SceneCameraObject({ ...DEFAULT_SCENE_CAMERA, projection: "orthographic", orthoSize: 2.5 }, false);
    const camera = new THREE.OrthographicCamera(-10, 10, 5, -5, 0.1, 1000); // the editor's: half-height 5

    followSceneCamera(camera, source);

    expect(camera.top).toBe(5);
    expect(camera.zoom).toBe(2);
  });

  it("recomputes the projection only when the lens changed", () => {
    const source = new SceneCameraObject(DEFAULT_SCENE_CAMERA, false);
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 1000);
    const update = vi.spyOn(camera, "updateProjectionMatrix");

    applySceneCameraLens(camera, source);
    applySceneCameraLens(camera, source);
    expect(update).not.toHaveBeenCalled();
    source.setPosedFov(60);
    applySceneCameraLens(camera, source);
    expect(update).toHaveBeenCalledTimes(1);
  });
});
