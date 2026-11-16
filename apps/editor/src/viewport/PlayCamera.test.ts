import * as THREE from "three";
import { describe, expect, it } from "vitest";
import type { PlayCameraSettings } from "../store/useEditorStore";
import type { SceneCameraSettings } from "../scene/types";
import { DEFAULT_PLAY_CAMERA, PlayCamera, resolvePlayCamera } from "./PlayCamera";
import { SceneCameraObject } from "./sceneCameraObject";

// The scene camera: 10 in front of a target at (0, 1, 0), level with it.
const start = { position: [0, 1, 10] as [number, number, number], target: [0, 1, 0] as [number, number, number], fov: 45, near: 0.1, far: 1000 };
const target = new THREE.Vector3(0, 1, 0);

const make = (settings: Partial<PlayCameraSettings>, options?: { reduceMotion?: boolean }) =>
  new PlayCamera(start, { ...DEFAULT_PLAY_CAMERA, ...settings }, 16 / 9, options);

// Many small frames, so easing has settled.
const run = (camera: PlayCamera, seconds: number) => {
  for (let t = 0; t < seconds; t += 1 / 60) camera.update(1 / 60);
};

// Degrees around the up axis from the scene camera (towards +X is positive), and above the target.
const yawOf = (camera: PlayCamera) => {
  const offset = camera.camera.position.clone().sub(target);
  return THREE.MathUtils.radToDeg(Math.atan2(offset.x, offset.z));
};
const pitchOf = (camera: PlayCamera) => {
  const offset = camera.camera.position.clone().sub(target);
  return THREE.MathUtils.radToDeg(Math.asin(offset.y / offset.length()));
};
const looksAtTarget = (camera: PlayCamera) => {
  const forward = camera.camera.getWorldDirection(new THREE.Vector3());
  const toTarget = target.clone().sub(camera.camera.position).normalize();
  return forward.dot(toTarget) > 0.9999;
};

describe("resolvePlayCamera", () => {
  it("fills what's missing with the defaults, and keeps damaged values out", () => {
    expect(resolvePlayCamera(undefined)).toEqual(DEFAULT_PLAY_CAMERA);
    expect(resolvePlayCamera({ mode: "softOrbit", range: 12 })).toEqual({ ...DEFAULT_PLAY_CAMERA, mode: "softOrbit", range: 12 });
    expect(resolvePlayCamera({ mode: "spin" as never, range: 500, smoothness: -1, speed: Number.NaN })).toEqual({
      ...DEFAULT_PLAY_CAMERA,
      range: 45,
      smoothness: 0,
    });
  });
});

describe("PlayCamera", () => {
  it("starts where the scene's camera is, looking at its target, and leaves the scene's values alone", () => {
    const camera = make({ mode: "fixed" });

    expect(camera.camera.position.toArray().map((n) => +n.toFixed(6))).toEqual([0, 1, 10]);
    expect(looksAtTarget(camera)).toBe(true);
    expect(start.position).toEqual([0, 1, 10]);
  });

  it("stays put when Fixed, whatever the pointer does", () => {
    const camera = make({ mode: "fixed" });
    camera.setPointer(1, 1);
    camera.beginDrag(0, 0);
    camera.dragTo(500, 0, 500);
    run(camera, 2);

    expect(yawOf(camera)).toBeCloseTo(0);
    expect(pitchOf(camera)).toBeCloseTo(0);
  });

  it("turns towards the pointer when Soft Orbit, up to its range, and settles back when it leaves", () => {
    const camera = make({ mode: "softOrbit", range: 10 });

    camera.setPointer(1, 1); // top right corner
    run(camera, 0.05);
    const early = yawOf(camera);
    run(camera, 5);

    expect(early).toBeGreaterThan(0);
    expect(early).toBeLessThan(10); // eases rather than jumping
    expect(yawOf(camera)).toBeCloseTo(10, 1);
    expect(pitchOf(camera)).toBeCloseTo(6, 1); // less up and down than sideways
    expect(camera.camera.position.distanceTo(target)).toBeCloseTo(10);
    expect(looksAtTarget(camera)).toBe(true);

    camera.setPointer(null);
    run(camera, 5);
    expect(yawOf(camera)).toBeCloseTo(0, 2);
    expect(pitchOf(camera)).toBeCloseTo(0, 2);
  });

  it("keeps still with reduce motion on, except for drags", () => {
    const soft = make({ mode: "softOrbit" }, { reduceMotion: true });
    soft.setPointer(1, 0);
    const rotating = make({ mode: "autoRotate" }, { reduceMotion: true });
    const orbit = make({ mode: "orbit" }, { reduceMotion: true });
    orbit.beginDrag(0, 0);
    orbit.dragTo(-100, 0, 400);
    run(soft, 2);
    run(rotating, 2);
    run(orbit, 5);

    expect(yawOf(soft)).toBeCloseTo(0);
    expect(yawOf(rotating)).toBeCloseTo(0);
    expect(yawOf(orbit)).toBeCloseTo(90, 1);
  });

  it("turns by dragging when Orbit (a full height drag is a full turn), never over the top", () => {
    const camera = make({ mode: "orbit" });

    expect(camera.beginDrag(100, 100)).toBe(true);
    camera.dragTo(0, 100, 400); // a quarter of the height to the left
    camera.endDrag();
    run(camera, 5);
    expect(yawOf(camera)).toBeCloseTo(90, 1);

    camera.beginDrag(0, 0);
    camera.dragTo(0, 4000, 400); // ten turns down
    run(camera, 5);
    expect(pitchOf(camera)).toBeLessThan(90);
    expect(pitchOf(camera)).toBeGreaterThan(85);
    expect(looksAtTarget(camera)).toBe(true);
  });

  it("only takes drags when Orbit", () => {
    expect(make({ mode: "softOrbit" }).beginDrag(0, 0)).toBe(false);
    expect(make({ mode: "autoRotate" }).beginDrag(0, 0)).toBe(false);
  });

  it("turns at its speed when Auto-Rotate", () => {
    const camera = make({ mode: "autoRotate", speed: 10 });
    run(camera, 3);

    expect(yawOf(camera)).toBeCloseTo(30, 0);
    expect(pitchOf(camera)).toBeCloseTo(0);
  });

  it("follows the canvas's shape", () => {
    const camera = make({ mode: "fixed" });
    camera.setAspect(1);

    expect((camera.camera as THREE.PerspectiveCamera).aspect).toBe(1);
  });
});

describe("PlayCamera following a scene camera (C6)", () => {
  const lens: SceneCameraSettings = { projection: "perspective", fov: 50, orthoSize: 4, near: 0.2, far: 300 };
  const start = { position: [0, 5, 10] as [number, number, number], target: [0, 0, 0] as [number, number, number], fov: 45, near: 0.1, far: 1000 };

  // A scene camera in a group moved and turned, itself turned: its world transform is what's followed.
  const parented = (settings = lens) => {
    const group = new THREE.Group();
    group.position.set(4, 0, 0);
    group.rotation.set(0, Math.PI / 2, 0);
    const camera = new SceneCameraObject(settings, false);
    camera.position.set(0, 2, 3);
    camera.rotation.set(-0.3, 0, 0);
    group.add(camera);
    return { group, camera };
  };

  it("is where the scene camera is in the world, looking its way, with its lens, as Fixed", () => {
    const { camera } = parented();
    const play = new PlayCamera(start, { mode: "orbit", range: 8, smoothness: 0.5, speed: 6 }, 2, { follow: camera });
    camera.updateWorldMatrix(true, false);
    const world = new THREE.Vector3().setFromMatrixPosition(camera.matrixWorld);
    const looks = new THREE.Vector3(0, 0, -1).transformDirection(camera.matrixWorld);

    expect(play.isFollowing).toBe(true);
    expect(play.mode).toBe("fixed");
    expect(play.beginDrag(10, 10)).toBe(false);
    expect(play.camera.position.distanceTo(world)).toBeLessThan(1e-9);
    expect(play.camera.getWorldDirection(new THREE.Vector3()).distanceTo(looks)).toBeLessThan(1e-9);
    expect(play.camera).toBeInstanceOf(THREE.PerspectiveCamera);
    expect(play.camera).toMatchObject({ fov: 50, near: 0.2, far: 300, aspect: 2 });
  });

  it("moves with the object and its posed field of view on each update", () => {
    const { group, camera } = parented();
    const play = new PlayCamera(start, resolvePlayCamera(undefined), 1, { follow: camera });

    group.position.set(0, 7, 0);
    camera.setPosedFov(80);
    play.update(0.016);

    camera.updateWorldMatrix(true, false);
    expect(play.camera.position.distanceTo(new THREE.Vector3().setFromMatrixPosition(camera.matrixWorld))).toBeLessThan(1e-9);
    expect((play.camera as THREE.PerspectiveCamera).fov).toBe(80);
  });

  it("is orthographic for an orthographic scene camera, as tall as its size, as wide as the canvas", () => {
    const { camera } = parented({ ...lens, projection: "orthographic" });
    const play = new PlayCamera(start, resolvePlayCamera(undefined), 2, { follow: camera });
    const ortho = play.camera as THREE.OrthographicCamera;

    expect(ortho).toBeInstanceOf(THREE.OrthographicCamera);
    expect((ortho.top - ortho.bottom) / ortho.zoom).toBeCloseTo(8);
    expect((ortho.right - ortho.left) / ortho.zoom).toBeCloseTo(16);
    play.setAspect(0.5);
    expect((ortho.right - ortho.left) / ortho.zoom).toBeCloseTo(4);
    expect((ortho.top - ortho.bottom) / ortho.zoom).toBeCloseTo(8);
  });

  it("keeps a profile's camera as before when it follows nothing", () => {
    const play = new PlayCamera(start, resolvePlayCamera({ mode: "orbit" }), 1.5);
    expect(play.isFollowing).toBe(false);
    expect(play.mode).toBe("orbit");
    expect((play.camera as THREE.PerspectiveCamera).aspect).toBe(1.5);
  });
});
