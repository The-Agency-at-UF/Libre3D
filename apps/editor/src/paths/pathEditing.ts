/**
 * PURPOSE: The math behind the pen tool (notes/animation-plan.md, B2): where a click lands in 3D,
 * and the edits a path's points take (add, move, delete, insert on the curve, smooth ↔ corner).
 *
 * INPUT: A path, and what was done to it: a point index, a position, a handle, a curve parameter.
 * OUTPUT: The edited path, or which point / handle / part of the curve is under the cursor.
 *
 * Every edit returns a new path and leaves the one passed in alone, so the store sees a new object
 * (ObjectManager rebuilds a tube when its `path` changes by reference). Positions are in the path's
 * own space and handles are relative to their point, as in PathPoint.
 *
 * Nothing here depends on the store, React, or the DOM.
 */

import * as THREE from "three";
import { buildPathCurve, clonePath, type PathData, type PathPoint } from "./pathGeometry";

type Vector = [number, number, number];

/** One of a point's two handles. */
export type HandleSide = "in" | "out";

/** Where the cursor is on a path's curve: segment `segment` (from point `segment` on), at `t`. */
export interface CurveHit {
  segment: number;
  t: number; // 0–1 along the segment's Bézier (its parameter, not its length)
  point: THREE.Vector3; // there, in the path's space
  distance: number; // pixels from the cursor
}

const EPSILON = 1e-9;
const CURVE_SAMPLES_PER_SEGMENT = 48;
const CURVE_REFINE_STEPS = 24;

const toVector3 = (vector: Vector) => new THREE.Vector3(...vector);
const toTuple = (vector: THREE.Vector3): Vector => [vector.x, vector.y, vector.z];
const lengthOf = (vector: Vector) => Math.hypot(vector[0], vector[1], vector[2]);
const handleKey = (side: HandleSide) => (side === "in" ? "handleIn" : "handleOut");
const otherSide = (side: HandleSide): HandleSide => (side === "in" ? "out" : "in");

// ---------------------------------------------------------------------------------------------
// Where a click lands
// ---------------------------------------------------------------------------------------------

/**
 * The axis nearest the view direction (front view → Z), as a unit vector in the world. The axes are
 * the world's, or those of `rotation` (a path's own, so a turned path is edited in its own plane).
 * The nearest of three perpendicular axes is never more than ~55° off the view, so a plane facing
 * it is never seen edge-on.
 */
export const nearestAxis = (viewDirection: THREE.Vector3, rotation?: THREE.Quaternion): THREE.Vector3 => {
  const axes = [new THREE.Vector3(1, 0, 0), new THREE.Vector3(0, 1, 0), new THREE.Vector3(0, 0, 1)];
  if (rotation) axes.forEach((axis) => axis.applyQuaternion(rotation));
  return axes.reduce((best, axis) => (Math.abs(axis.dot(viewDirection)) > Math.abs(best.dot(viewDirection)) ? axis : best));
};

/** The plane points are drawn and dragged on: through `point`, facing the axis nearest the view. */
export const drawingPlane = (viewDirection: THREE.Vector3, point: THREE.Vector3, rotation?: THREE.Quaternion): THREE.Plane =>
  new THREE.Plane().setFromNormalAndCoplanarPoint(nearestAxis(viewDirection, rotation), point);

/** Where a ray from the camera through the cursor meets a plane, or null when it doesn't. */
export const projectOntoPlane = (ray: THREE.Ray, plane: THREE.Plane): THREE.Vector3 | null =>
  ray.intersectPlane(plane, new THREE.Vector3());

// ---------------------------------------------------------------------------------------------
// Edits
// ---------------------------------------------------------------------------------------------

/** Adds a corner point (no handles) at the end of the path. */
export const appendPoint = (path: PathData, position: Vector): PathData => {
  const next = clonePath(path);
  next.points.push({ position: [...position], handleIn: [0, 0, 0], handleOut: [0, 0, 0], mode: "corner" });
  return next;
};

/** Moves a point; its handles come with it (they're relative to it). */
export const movePoint = (path: PathData, index: number, position: Vector): PathData => {
  if (!path.points[index]) return path;
  const next = clonePath(path);
  next.points[index].position = [...position];
  return next;
};

/**
 * The pen's click-and-drag: the point becomes smooth with `handleOut` (the way the path goes on) and
 * the opposite handle in, the same length. A drag back to the point makes it a corner again.
 */
export const dragOutHandles = (path: PathData, index: number, handleOut: Vector): PathData => {
  if (!path.points[index]) return path;
  const next = clonePath(path);
  const point = next.points[index];
  if (lengthOf(handleOut) < EPSILON) {
    Object.assign(point, { handleIn: [0, 0, 0], handleOut: [0, 0, 0], mode: "corner" });
  } else {
    Object.assign(point, { handleIn: [-handleOut[0], -handleOut[1], -handleOut[2]], handleOut: [...handleOut], mode: "smooth" });
  }
  return next;
};

/**
 * Where a smooth point's other handle goes when one is moved: opposite it, keeping its own length,
 * so the segment on the other side turns with it but isn't stretched. An other handle with no
 * length takes the moved one's.
 */
export const mirrorHandle = (moved: Vector, other: Vector): Vector => {
  const length = lengthOf(moved);
  if (length < EPSILON) return [...other];
  const otherLength = lengthOf(other);
  const scale = -(otherLength > EPSILON ? otherLength : length) / length;
  return [moved[0] * scale, moved[1] * scale, moved[2] * scale];
};

/**
 * Moves one of a point's handles. A smooth point's other handle stays opposite (mirrorHandle), unless
 * `breakMirror` (Alt-drag), which makes the point a corner whose handles move on their own.
 */
export const moveHandle = (path: PathData, index: number, side: HandleSide, handle: Vector, breakMirror = false): PathData => {
  if (!path.points[index]) return path;
  const next = clonePath(path);
  const point = next.points[index];
  point[handleKey(side)] = [...handle];
  if (point.mode === "smooth" && !breakMirror) {
    point[handleKey(otherSide(side))] = mirrorHandle(handle, point[handleKey(otherSide(side))]);
  } else {
    point.mode = "corner";
  }
  return next;
};

/**
 * Removes a point; its neighbours join, keeping their handles. A closed path needs three points, so
 * one left with fewer opens. (Deleting the path when fewer than two are left is the caller's call.)
 */
export const deletePoint = (path: PathData, index: number): PathData => {
  if (!path.points[index]) return path;
  const next = clonePath(path);
  next.points.splice(index, 1);
  if (next.points.length < 3) next.closed = false;
  return next;
};

/**
 * Adds a point on segment `segment` at `t` without changing the curve's shape: the segment's Bézier
 * is split in two there (de Casteljau). The new point is smooth (its handles lie on the curve's
 * tangent), and the neighbours' handles toward it shorten to match. Returns the path and the new
 * point's index.
 */
export const insertPoint = (path: PathData, segment: number, t: number): { path: PathData; index: number } => {
  const count = path.points.length;
  const segmentCount = path.closed ? count : count - 1;
  if (count < 2 || segment < 0 || segment >= segmentCount) return { path, index: -1 };

  const next = clonePath(path);
  const from = next.points[segment];
  const to = next.points[(segment + 1) % count];
  const p0 = toVector3(from.position);
  const p1 = p0.clone().add(toVector3(from.handleOut));
  const p3 = toVector3(to.position);
  const p2 = p3.clone().add(toVector3(to.handleIn));

  const lerp = (a: THREE.Vector3, b: THREE.Vector3) => new THREE.Vector3().lerpVectors(a, b, t);
  const a = lerp(p0, p1);
  const b = lerp(p1, p2);
  const c = lerp(p2, p3);
  const d = lerp(a, b);
  const e = lerp(b, c);
  const split = lerp(d, e);

  const point: PathPoint = {
    position: toTuple(split),
    handleIn: toTuple(d.sub(split)),
    handleOut: toTuple(e.sub(split)),
    mode: "smooth",
  };
  from.handleOut = toTuple(a.sub(p0));
  to.handleIn = toTuple(c.sub(p3));
  next.points.splice(segment + 1, 0, point);
  return { path: next, index: segment + 1 };
};

/**
 * Makes a point a corner (its handles pulled in: a sharp point) or smooth. A smooth point keeps the
 * handles it has, turned to lie on one line (the way from its in handle to its out handle); a
 * handle with no length gets a third of the way to its neighbour. A point with no handles faces
 * from its previous neighbour to its next.
 */
export const setPointMode = (path: PathData, index: number, mode: PathPoint["mode"]): PathData => {
  const point = path.points[index];
  if (!point) return path;
  const next = clonePath(path);
  const edited = next.points[index];

  if (mode === "corner") {
    Object.assign(edited, { handleIn: [0, 0, 0], handleOut: [0, 0, 0], mode });
    return next;
  }

  const count = path.points.length;
  const previous = index > 0 ? path.points[index - 1] : path.closed ? path.points[count - 1] : null;
  const following = index < count - 1 ? path.points[index + 1] : path.closed ? path.points[0] : null;
  const position = toVector3(point.position);
  const toPrevious = previous && previous !== point ? toVector3(previous.position).sub(position) : new THREE.Vector3();
  const toNext = following && following !== point ? toVector3(following.position).sub(position) : new THREE.Vector3();

  let direction = toVector3(point.handleOut).sub(toVector3(point.handleIn));
  if (direction.lengthSq() < EPSILON) direction = toNext.clone().sub(toPrevious);
  edited.mode = "smooth";
  if (direction.lengthSq() < EPSILON) return next;
  direction.normalize();

  const autoIn = toPrevious.length() / 3;
  const autoOut = toNext.length() / 3;
  const inLength = lengthOf(point.handleIn) || autoIn || autoOut;
  const outLength = lengthOf(point.handleOut) || autoOut || autoIn;
  edited.handleIn = toTuple(direction.clone().multiplyScalar(-inLength));
  edited.handleOut = toTuple(direction.clone().multiplyScalar(outLength));
  return next;
};

// ---------------------------------------------------------------------------------------------
// What's under the cursor
// ---------------------------------------------------------------------------------------------

/**
 * The handles shown when point `selected` is picked: the ones that shape the segments on each side
 * of it (its own, and its neighbours' facing it). An open path's end has one segment, so one of its
 * handles shapes nothing and isn't shown. Handles with no length are left out (they'd sit on their
 * point).
 */
export const visibleHandles = (path: PathData, selected: number | null): { index: number; side: HandleSide }[] => {
  const count = path.points.length;
  if (selected === null || !path.points[selected] || count < 2) return [];
  const handles: { index: number; side: HandleSide }[] = [];
  if (selected > 0 || path.closed) {
    handles.push({ index: (selected - 1 + count) % count, side: "out" }, { index: selected, side: "in" });
  }
  if (selected < count - 1 || path.closed) {
    handles.push({ index: selected, side: "out" }, { index: (selected + 1) % count, side: "in" });
  }
  return handles.filter(({ index, side }) => lengthOf(path.points[index][handleKey(side)]) > EPSILON);
};

/** The point nearest `cursor` within `radius` pixels (null entries are off screen), or null. */
export const nearestScreenPoint = (points: (THREE.Vector2 | null)[], cursor: THREE.Vector2, radius: number): number | null => {
  let nearest: number | null = null;
  let nearestDistance = radius;
  points.forEach((point, index) => {
    const distance = point ? point.distanceTo(cursor) : Infinity;
    if (distance <= nearestDistance) {
      nearest = index;
      nearestDistance = distance;
    }
  });
  return nearest;
};

/**
 * The place on the path's curve nearest `cursor` on screen, if it's within `radius` pixels. `toScreen`
 * takes a point in the path's space to the screen (null when it's off screen). Each segment is
 * sampled, then the nearest sample is narrowed down to well under a pixel.
 */
export const nearestOnCurve = (
  path: PathData,
  toScreen: (point: THREE.Vector3) => THREE.Vector2 | null,
  cursor: THREE.Vector2,
  radius: number,
): CurveHit | null => {
  const curve = buildPathCurve(path);
  if (!curve) return null;

  const distanceAt = (segment: number, t: number) => {
    const screen = toScreen(curve.curves[segment].getPoint(t));
    return screen ? screen.distanceTo(cursor) : Infinity;
  };

  let best = { segment: 0, t: 0, distance: Infinity };
  for (let segment = 0; segment < curve.curves.length; segment += 1) {
    for (let sample = 0; sample <= CURVE_SAMPLES_PER_SEGMENT; sample += 1) {
      const t = sample / CURVE_SAMPLES_PER_SEGMENT;
      const distance = distanceAt(segment, t);
      if (distance < best.distance) best = { segment, t, distance };
    }
  }
  if (best.distance === Infinity) return null;

  // The curve's distance to the cursor has one dip around the nearest sample, so a ternary search
  // between its neighbours finds the bottom.
  let low = Math.max(0, best.t - 1 / CURVE_SAMPLES_PER_SEGMENT);
  let high = Math.min(1, best.t + 1 / CURVE_SAMPLES_PER_SEGMENT);
  for (let step = 0; step < CURVE_REFINE_STEPS; step += 1) {
    const third = (high - low) / 3;
    if (distanceAt(best.segment, low + third) < distanceAt(best.segment, high - third)) high -= third;
    else low += third;
  }
  const t = (low + high) / 2;
  const distance = distanceAt(best.segment, t);
  return distance <= radius ? { segment: best.segment, t, point: curve.curves[best.segment].getPoint(t), distance } : null;
};
