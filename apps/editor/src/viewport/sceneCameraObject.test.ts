import * as THREE from "three";
import { describe, expect, it } from "vitest";

import { DEFAULT_SCENE_CAMERA } from "../scene/defaults";
import { pickEntityAt } from "./pickEntity";
import { frustumSegments, GIZMO_ASPECT, GIZMO_DEPTH, SceneCameraObject } from "./sceneCameraObject";

const lens = (changes = {}) => ({ ...DEFAULT_SCENE_CAMERA, ...changes });
const deepest = (points: THREE.Vector3[]) => Math.max(...points.map((point) => -point.z));
const highest = (points: THREE.Vector3[], depth: number) => Math.max(...points.filter((point) => Math.abs(point.z + depth) < 1e-9).map((point) => point.y));

describe("frustumSegments", () => {
  it("draws a perspective camera's frustum to a fixed depth, as wide as its field of view, looking down -Z", () => {
    const points = frustumSegments(lens({ fov: 90 }));
    expect(points.length % 2).toBe(0);
    expect(deepest(points)).toBeCloseTo(GIZMO_DEPTH);
    // 90° high: the far rectangle is as tall as it is deep (half each way), and 16:9 wide.
    const halfWidth = Math.max(...points.map((point) => point.x));
    expect(halfWidth).toBeCloseTo(GIZMO_DEPTH * GIZMO_ASPECT);
    expect(points.every((point) => point.z <= 0)).toBe(true);
  });

  it("stops at a far distance nearer than that, and draws the near plane", () => {
    expect(deepest(frustumSegments(lens({ far: 0.8 })))).toBeCloseTo(0.8);
    const points = frustumSegments(lens({ near: 0.5 }));
    expect(points.some((point) => Math.abs(point.z + 0.5) < 1e-9)).toBe(true);
  });

  it("draws an orthographic camera as a box its real size", () => {
    const points = frustumSegments(lens({ projection: "orthographic", orthoSize: 3, near: 0.1 }));
    expect(highest(points, 0.1)).toBeCloseTo(3);
    expect(highest(points, 0.1 + GIZMO_DEPTH)).toBeGreaterThan(3); // the up triangle sits above the far edge
  });
});

describe("SceneCameraObject", () => {
  it("is picked through its frustum in the editor, and not in Play", () => {
    const scene = new THREE.Scene();
    const camera = new SceneCameraObject(lens(), true);
    camera.userData.entityId = "cam";
    scene.add(camera);
    scene.updateMatrixWorld(true);
    const view = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
    view.position.set(0, 0, 5);
    view.updateMatrixWorld(true);
    const canvas = { getBoundingClientRect: () => ({ left: 0, top: 0, width: 100, height: 100 }) } as HTMLCanvasElement;

    expect(pickEntityAt(new THREE.Raycaster(), view, canvas, [camera], 50, 50)).toBe("cam");
    expect(pickEntityAt(new THREE.Raycaster(), view, canvas, [camera], 50, 50, true)).toBeNull();
  });

  it("has nothing to pick or show without its gizmo (the share-link viewer)", () => {
    const camera = new SceneCameraObject(lens(), false);
    expect(camera.gizmo).toBeNull();
    expect(camera.children).toEqual([]);
    camera.setSettings(lens({ fov: 10 }));
    camera.setSelected(true);
    camera.dispose();
  });
});
