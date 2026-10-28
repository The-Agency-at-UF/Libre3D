import { describe, expect, it } from "vitest";
import * as THREE from "three";
import type { DepthLayer } from "../store/useEditorStore";
import { depthAxis, distanceAlongAxis, dragFar, dragNear, dragStop, pointOnAxis, stopDistance } from "./depthGizmo";

const depth = (overrides: Partial<DepthLayer> = {}): DepthLayer => ({
  id: "depth",
  type: "depth",
  enabled: true,
  opacity: 1,
  gradientType: "radial",
  origin: [1, 0, 0],
  direction: [0, 2, 0],
  near: 1,
  far: 3,
  stops: [
    { color: "#000000", position: 0 },
    { color: "#ffffff", position: 1 },
  ],
  smooth: false,
  ...overrides,
});

describe("the depth gizmo's handles", () => {
  it("sit along the axis from the origin", () => {
    expect(depthAxis(depth()).toArray()).toEqual([0, 1, 0]);
    expect(depthAxis(depth({ direction: [0, 0, 0] })).toArray()).toEqual([1, 0, 0]);
    expect(pointOnAxis(depth(), 3).toArray()).toEqual([1, 3, 0]);
    expect(stopDistance(depth(), 0.5)).toBe(2);
  });

  it("finds where a ray passes the axis", () => {
    const ray = new THREE.Ray(new THREE.Vector3(5, 2, 0), new THREE.Vector3(-1, 0, 0));
    expect(distanceAlongAxis(depth(), ray)).toBeCloseTo(2);
    const skew = new THREE.Ray(new THREE.Vector3(1, 1.5, 4), new THREE.Vector3(0, 0, -1));
    expect(distanceAlongAxis(depth(), skew)).toBeCloseTo(1.5);
    expect(distanceAlongAxis(depth(), new THREE.Ray(new THREE.Vector3(), new THREE.Vector3(0, 1, 0)))).toBeNull();
  });

  it("turn the axis toward a dragged far handle", () => {
    const dragged = dragFar(depth(), new THREE.Vector3(4, 0, 4));
    expect(dragged.direction.map((c) => Number(c.toFixed(6)))).toEqual([0.6, 0, 0.8]);
    expect(dragged.far).toBeCloseTo(5);
    expect(dragFar(depth(), new THREE.Vector3(1.5, 0, 0)).far).toBe(1); // not inside near
    expect(dragFar(depth(), new THREE.Vector3(1, 0, 0))).toEqual({ direction: [0, 2, 0], far: 3 });
  });

  it("keep near between 0 and far, and stops between near and far", () => {
    expect(dragNear(depth(), -1)).toBe(0);
    expect(dragNear(depth(), 5)).toBe(3);
    expect(dragStop(depth(), 2.5)).toBe(0.75);
    expect(dragStop(depth(), 9)).toBe(1);
    expect(dragStop(depth({ near: 2, far: 2 }), 9)).toBe(0);
  });
});
