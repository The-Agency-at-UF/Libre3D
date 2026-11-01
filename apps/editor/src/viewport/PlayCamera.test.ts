import * as THREE from "three";
import { describe, expect, it } from "vitest";
import type { PlayCameraSettings } from "../store/useEditorStore";
import { DEFAULT_PLAY_CAMERA, PlayCamera, resolvePlayCamera } from "./PlayCamera";

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

    expect(camera.camera.aspect).toBe(1);
  });
});
