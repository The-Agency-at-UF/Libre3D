/**
 * PURPOSE: The math behind paths (notes/animation-plan.md, B1): a Bézier curve drawn as a round
 * tube, and its trim, which says how much of the path shows (0 = its start, 1 = its end).
 *
 * INPUT: A path's points (each with Bézier handles), its stroke, and a trim.
 * OUTPUT: The curve and its tube, which part of the tube a trim draws, and where the end caps go.
 *
 * Trimming never rebuilds the tube. TubeGeometry puts ring k at k / segments of the path's length
 * and lays its triangles out one segment after another, so a trim is a range of rings, which is a
 * range of the index buffer (`drawRange`). The trim snaps to the nearest ring (about 1/64 of a unit
 * apart), so the caps always sit exactly on one.
 *
 * PathMesh.ts builds the Three object from this. Nothing here depends on the store, React, or the
 * DOM, so the share-link viewer can use it as is.
 */

import * as THREE from "three";

export interface PathPoint {
  position: [number, number, number];
  handleIn: [number, number, number]; // relative to position
  handleOut: [number, number, number]; // relative to position
  mode: "smooth" | "corner"; // smooth keeps the handles opposite each other (pen tool, B2)
}

export interface PathData {
  points: PathPoint[];
  closed: boolean; // the last point joins back to the first
}

export type CapStyle = "round" | "flat";

export interface PathStroke {
  radius: number;
  caps: CapStyle;
}

/** Which rings of a tube are drawn: from ring `start` to ring `end` (equal = nothing). */
export interface TrimRings {
  start: number;
  end: number;
}

/** Where an end cap goes: its +Y points out of the tube. */
export interface CapPose {
  position: THREE.Vector3;
  quaternion: THREE.Quaternion;
}

export const RADIAL_SEGMENTS = 24;
const SEGMENTS_PER_UNIT = 64;
const MIN_SEGMENTS = 8;
export const MAX_SEGMENTS = 2000;
const INDICES_PER_QUAD = 6; // two triangles
const MIN_LENGTH = 1e-6; // shorter is a point (Bézier sums aren't exactly 0 for one)
const BOUNDS_SAMPLES = 32; // per segment, where pathsCenter measures a curve

export const DEFAULT_STROKE: PathStroke = { radius: 0.12, caps: "round" };

const cloneVector = (vector: [number, number, number]): [number, number, number] => [vector[0], vector[1], vector[2]];

const clonePathPoint = (point: PathPoint): PathPoint => ({
  position: cloneVector(point.position),
  handleIn: cloneVector(point.handleIn),
  handleOut: cloneVector(point.handleOut),
  mode: point.mode,
});

export const clonePath = (path: PathData): PathData => ({ points: path.points.map(clonePathPoint), closed: path.closed });

/**
 * The path the Add menu makes until the pen tool (B2) can draw one: a wave of two half circles,
 * 2.4 wide, one arching up and one down, in the XY plane (facing the default camera).
 */
export const createSamplePath = (): PathData => ({
  points: [
    { position: [-1.2, 0, 0], handleIn: [0, -0.8, 0], handleOut: [0, 0.8, 0], mode: "smooth" },
    { position: [0, 0, 0], handleIn: [0, 0.8, 0], handleOut: [0, -0.8, 0], mode: "smooth" },
    { position: [1.2, 0, 0], handleIn: [0, -0.8, 0], handleOut: [0, 0.8, 0], mode: "smooth" },
  ],
  closed: false,
});

const toVector3 = (vector: [number, number, number]) => new THREE.Vector3(...vector);

/**
 * The path as one curve: a cubic Bézier from each point to the next (and from the last back to the
 * first when it's closed). Null when there's nothing to draw: fewer than two points, or no length.
 */
export const buildPathCurve = (path: PathData): THREE.CurvePath<THREE.Vector3> | null => {
  const { points } = path;
  if (points.length < 2) return null;

  const curve = new THREE.CurvePath<THREE.Vector3>();
  const segmentCount = path.closed ? points.length : points.length - 1;
  for (let i = 0; i < segmentCount; i += 1) {
    const from = points[i];
    const to = points[(i + 1) % points.length];
    const start = toVector3(from.position);
    const end = toVector3(to.position);
    curve.add(new THREE.CubicBezierCurve3(start, start.clone().add(toVector3(from.handleOut)), end.clone().add(toVector3(to.handleIn)), end));
  }

  return curve.getLength() > MIN_LENGTH ? curve : null;
};

/**
 * The middle of the box round these paths' curves, in their own space: measured along the curves,
 * so a handle reaching past the curve doesn't count. Null when none of them draws anything.
 */
export const pathsCenter = (paths: PathData[]): [number, number, number] | null => {
  const box = new THREE.Box3();
  paths.forEach((path) => buildPathCurve(path)?.getPoints(BOUNDS_SAMPLES).forEach((point) => box.expandByPoint(point)));
  if (box.isEmpty()) return null;
  const { x, y, z } = box.getCenter(new THREE.Vector3());
  return [x, y, z];
};

/** How many segments a tube of this length gets: enough that its bends look round. */
export const tubeSegmentsFor = (length: number): number =>
  Math.min(MAX_SEGMENTS, Math.max(MIN_SEGMENTS, Math.ceil(length * SEGMENTS_PER_UNIT)));

const clamp01 = (value: number, fallback: number) => (Number.isFinite(value) ? Math.min(1, Math.max(0, value)) : fallback);

/**
 * The rings a trim draws on a tube of `segments` segments. Trim values are clamped to 0–1 and
 * snapped to the nearest ring. A start past the end draws nothing (they aren't swapped).
 */
export const trimToRings = (trimStart: number, trimEnd: number, segments: number): TrimRings => {
  const start = Math.round(clamp01(trimStart, 0) * segments);
  const end = Math.round(clamp01(trimEnd, 1) * segments);
  return { start, end: Math.max(start, end) };
};

/** The part of a tube's index buffer that draws those rings. */
export const drawRangeFor = (rings: TrimRings, radialSegments = RADIAL_SEGMENTS): { start: number; count: number } => ({
  start: rings.start * radialSegments * INDICES_PER_QUAD,
  count: (rings.end - rings.start) * radialSegments * INDICES_PER_QUAD,
});

/**
 * Whether a tube trimmed to `rings` has end caps. Not when nothing is drawn, and not on a closed
 * path drawn all the way round, whose ends meet.
 */
export const hasCaps = (rings: TrimRings, segments: number, closed: boolean): boolean =>
  rings.end > rings.start && !(closed && rings.start === 0 && rings.end === segments);

/**
 * Where the cap on ring `ring` goes: at the ring's centre, its +Y along the tube's direction there
 * (against it for the start cap), so it points out of the tube. Its X and Z come from the ring's
 * own frame, which puts the rim of a cap made by `createCapGeometry` exactly on the ring's vertices,
 * so the cap and tube meet with no seam.
 */
export const capPose = (tube: THREE.TubeGeometry, ring: number, isStart: boolean): CapPose => {
  const tangent = tube.tangents[ring];
  const normal = tube.normals[ring];
  const binormal = tube.binormals[ring];

  // A ring's vertices are its centre plus radius × their normal, so the first one gives the centre.
  const vertex = ring * (tube.parameters.radialSegments + 1);
  const position = new THREE.Vector3()
    .fromBufferAttribute(tube.getAttribute("position"), vertex)
    .addScaledVector(new THREE.Vector3().fromBufferAttribute(tube.getAttribute("normal"), vertex), -tube.parameters.radius);

  // Frenet frames have binormal = tangent × normal, so these bases are rotations (not mirrors).
  const basis = isStart
    ? new THREE.Matrix4().makeBasis(normal, tangent.clone().negate(), binormal)
    : new THREE.Matrix4().makeBasis(normal, tangent, binormal.clone().negate());

  return { position, quaternion: new THREE.Quaternion().setFromRotationMatrix(basis) };
};

/**
 * A cap for a tube of this radius, pointing up +Y with its rim on the XZ plane: a half sphere
 * (round) or a disc (flat). Its rim has the tube's radial segment count, starting on the X axis.
 */
export const createCapGeometry = (stroke: PathStroke, radialSegments = RADIAL_SEGMENTS): THREE.BufferGeometry => {
  if (stroke.caps === "flat") {
    // CircleGeometry faces +Z; turned to face +Y, its rim starts on the X axis.
    return new THREE.CircleGeometry(stroke.radius, radialSegments).rotateX(-Math.PI / 2);
  }
  return new THREE.SphereGeometry(stroke.radius, radialSegments, Math.max(4, radialSegments / 3), 0, Math.PI * 2, 0, Math.PI / 2);
};
