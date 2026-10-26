/**
 * PURPOSE: The geometry behind the Depth layer's viewport gizmo (viewport/hooks/useViewportDepthGizmo.ts),
 * in the object's own space: where its handles sit, and what dragging each one does to the layer.
 *
 * The gizmo lies along the layer's axis (its direction, from its origin; a radial layer shows its
 * rings along it too): the near and far handles at those distances, and each stop between them at
 * its place on the ramp. Dragging the origin moves it; dragging far turns the axis toward the
 * cursor and sets far; near and the stops slide along the axis.
 */

import * as THREE from "three";
import type { DepthLayer } from "../store/useEditorStore";

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

/** Near, dragged to `distance` along the axis: from 0 up to far. */
export const dragNear = (layer: DepthLayer, distance: number): number => Math.min(Math.max(distance, 0), layer.far);

/** A stop, dragged to `distance` along the axis: its ramp position, 0-1. */
export const dragStop = (layer: DepthLayer, distance: number): number => {
  const span = layer.far - layer.near;
  return span > 0 ? Math.min(1, Math.max(0, (distance - layer.near) / span)) : 0;
};
