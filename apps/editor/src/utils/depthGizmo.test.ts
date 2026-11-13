import { describe, expect, it } from "vitest";
import * as THREE from "three";
import type { DepthLayer } from "../store/useEditorStore";
import { SPREAD_CIRCLE_POINTS, depthAxis, distanceAlongAxis, dragFar, dragNear, dragStop, pointOnAxis, spreadCircle, stopDistance } from "./depthGizmo";

const depth = (overrides: Partial<DepthLayer> = {}): DepthLayer => ({
  id: "depth",
  type: "depth",
  blendMode: "normal",
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

describe("a radial layer's spread circles", () => {
  const points = (out: Float32Array) => Array.from({ length: out.length / 3 }, (_, i) => new THREE.Vector3(out[i * 3], out[i * 3 + 1], out[i * 3 + 2]));

  it("are around the origin at far", () => {
    const layer = depth({ origin: [1, 2, 3], direction: [1, 1, 0], far: 4 });
    for (const which of ["flat", "upright"] as const) {
      const circle = points(spreadCircle(layer, which));
      expect(circle).toHaveLength(SPREAD_CIRCLE_POINTS);
      for (const point of circle) expect(point.distanceTo(new THREE.Vector3(1, 2, 3))).toBeCloseTo(4);
    }
  });

  it("lie flat on the XZ plane, and upright through the axis", () => {
    const layer = depth({ origin: [1, 2, 3], direction: [1, 1, 1], far: 4 });
    for (const point of points(spreadCircle(layer, "flat"))) expect(point.y).toBeCloseTo(2);
    // The upright circle's plane holds straight up and the axis, so nothing of it lies to the side.
    const side = new THREE.Vector3(1, 0, -1).normalize();
    const upright = points(spreadCircle(layer, "upright"));
    for (const point of upright) expect(point.clone().sub(new THREE.Vector3(1, 2, 3)).dot(side)).toBeCloseTo(0);
    // The far handle sits on it.
    const far = pointOnAxis(layer, layer.far);
    expect(Math.min(...upright.map((point) => point.distanceTo(far)))).toBeLessThan(0.3);
  });

  it("stand on x when the axis points straight up", () => {
    const upright = points(spreadCircle(depth({ origin: [0, 0, 0], direction: [0, 1, 0], far: 2 }), "upright"));
    for (const point of upright) expect(point.z).toBeCloseTo(0);
  });

  it("fill the buffer they're given", () => {
    const out = new Float32Array(SPREAD_CIRCLE_POINTS * 3);
    expect(spreadCircle(depth(), "flat", out)).toBe(out);
  });
});
