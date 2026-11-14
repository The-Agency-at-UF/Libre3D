/**
 * PURPOSE: The geometry behind the Depth layer's viewport gizmo (viewport/hooks/useViewportDepthGizmo.ts),
 * in the object's own space: where its handles sit, and what dragging each one does to the layer.
 *
 * The gizmo lies along the layer's axis (its direction, from its origin): the near and far handles
 * at those distances, and each stop between them at its place on the ramp. Dragging the origin
 * moves it; dragging far turns the axis toward the cursor and sets far; near and the stops slide
 * along the axis. A radial layer also shows each stop's spread: two circles around the origin at
 * the stop's distance.
 */

import * as THREE from "three";
import type { DepthLayer } from "../scene/types";

type Vector = [number, number, number];

/** The axis's unit direction (x when the layer's direction is zero). */
export const depthAxis = (layer: DepthLayer): THREE.Vector3 => {
  const axis = new THREE.Vector3(...layer.direction);
  return axis.lengthSq() > 0 ? axis.normalize() : new THREE.Vector3(1, 0, 0);
};

/** The point `distance` along the axis from the origin. */
export const pointOnAxis = (layer: DepthLayer, distance: number): THREE.Vector3 =>
  new THREE.Vector3(...layer.origin).addScaledVector(depthAxis(layer), distance);

/** The distance along the axis at a stop's position. */
export const stopDistance = (layer: DepthLayer, position: number): number => layer.near + position * (layer.far - layer.near);

/**
 * How far along the axis (from the origin) a ray comes closest to it. The ray is in the object's
 * space. Null when the ray runs along the axis.
 */
export const distanceAlongAxis = (layer: DepthLayer, ray: THREE.Ray): number | null => {
  const origin = new THREE.Vector3(...layer.origin);
  const axis = depthAxis(layer);
  const between = new THREE.Vector3().subVectors(origin, ray.origin);
  const b = axis.dot(ray.direction);
  const denominator = 1 - b * b; // both unit length
  if (denominator < 1e-6) return null;
  const d = axis.dot(between);
  const e = ray.direction.dot(between);
  return (b * e - d) / denominator;
};

/** Far, dragged to `point`: the axis turns toward it, and far is its distance (at least near). */
export const dragFar = (layer: DepthLayer, point: THREE.Vector3): Pick<DepthLayer, "direction" | "far"> => {
  const offset = point.clone().sub(new THREE.Vector3(...layer.origin));
  const length = offset.length();
  if (length < 1e-6) return { direction: [...layer.direction] as Vector, far: layer.far };
  offset.divideScalar(length);
  return { direction: [offset.x, offset.y, offset.z], far: Math.max(length, layer.near) };
};

/**
 * Far on a radial layer, dragged to `distance` along the axis: only the spread grows or shrinks (at
 * least near). The axis keeps its direction, so the stops stay put on their spread circles.
 */
export const scaleFar = (layer: DepthLayer, distance: number): number => Math.max(distance, layer.near);

/** Near, dragged to `distance` along the axis: from 0 up to far. */
export const dragNear = (layer: DepthLayer, distance: number): number => Math.min(Math.max(distance, 0), layer.far);

/** A stop, dragged to `distance` along the axis: its ramp position, 0-1. */
export const dragStop = (layer: DepthLayer, distance: number): number => {
  const span = layer.far - layer.near;
  return span > 0 ? Math.min(1, Math.max(0, (distance - layer.near) / span)) : 0;
};

/**
 * The two circles that show a radial layer's spread at a distance (drawn at each stop's), both
 * around the origin: one flat on the layer's XZ plane, one upright through the axis (so the stop's
 * handle sits on it).
 */
export type SpreadCircle = "flat" | "upright";

export const SPREAD_CIRCLE_POINTS = 64;

// Each circle's plane, as two unit directions across it.
const SPREAD_PLANES: Record<SpreadCircle, (axis: THREE.Vector3) => [THREE.Vector3, THREE.Vector3]> = {
  flat: () => [new THREE.Vector3(1, 0, 0), new THREE.Vector3(0, 0, 1)],
  upright: (axis) => {
    const across = new THREE.Vector3(axis.x, 0, axis.z);
    // An axis straight up or down has no side to lean to: the circle stands on x.
    return [across.lengthSq() > 1e-12 ? across.normalize() : across.set(1, 0, 0), new THREE.Vector3(0, 1, 0)];
  },
};

/**
 * The points of one of a radial layer's spread circles at `distance` from the origin, in the
 * layer's space, as x, y, z triples in `out` (SPREAD_CIRCLE_POINTS of them; the caller keeps one
 * buffer and reuses it).
 */
export const spreadCircle = (
  layer: DepthLayer,
  which: SpreadCircle,
  distance: number,
  out = new Float32Array(SPREAD_CIRCLE_POINTS * 3),
): Float32Array => {
  const [u, v] = SPREAD_PLANES[which](depthAxis(layer));
  const [ox, oy, oz] = layer.origin;
  for (let i = 0; i < SPREAD_CIRCLE_POINTS; i++) {
    const angle = (i / SPREAD_CIRCLE_POINTS) * Math.PI * 2;
    const c = Math.cos(angle) * distance;
    const s = Math.sin(angle) * distance;
    out[i * 3] = ox + c * u.x + s * v.x;
    out[i * 3 + 1] = oy + c * u.y + s * v.y;
    out[i * 3 + 2] = oz + c * u.z + s * v.z;
  }
  return out;
};
