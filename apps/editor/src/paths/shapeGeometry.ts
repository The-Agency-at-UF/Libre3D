/**
 * PURPOSE: The math behind shapes: flat filled outlines, like Spline's Shape (SVG import draws
 * filled lettering as these, and Convert to Path turns one into a path along its middle).
 *
 * INPUT: A shape's regions, each a closed outline with its holes (the counter of an "o" or an "e"),
 * in the same Bézier points paths use, so the pen tool edits them the same way. Only X and Y count:
 * a shape is flat in its own XY plane. Plus an optional extrusion (depth) and bevel.
 * OUTPUT: The Three geometry: a flat ShapeGeometry facing +Z, or an ExtrudeGeometry centred on Z = 0.
 *
 * Nothing here depends on the store, React, or the DOM.
 */

import * as THREE from "three";
import { clonePath, type PathData } from "./pathGeometry";

export interface ShapeRegion {
  outline: PathData; // closed
  holes: PathData[]; // closed, inside the outline
}

export interface ShapeData {
  regions: ShapeRegion[];
}

/** How a shape is made solid: its thickness along Z, and how far the bevel rounds its edges. */
export interface ShapeSolid {
  extrusion: number;
  bevel: number;
}

export const DEFAULT_SOLID: ShapeSolid = { extrusion: 0, bevel: 0 };

const CURVE_SEGMENTS = 12; // per Bézier segment
const BEVEL_SEGMENTS = 4;

export const cloneShape = (shape: ShapeData): ShapeData => ({
  regions: shape.regions.map((region) => ({ outline: clonePath(region.outline), holes: region.holes.map(clonePath) })),
});

/** A copy of the shape in its own XY plane: every point's and handle's Z is 0. */
export const flattenShape = (shape: ShapeData): ShapeData => {
  const flat = cloneShape(shape);
  flat.regions.forEach((region) =>
    [region.outline, ...region.holes].forEach((contour) =>
      contour.points.forEach((point) => {
        point.position[2] = 0;
        point.handleIn[2] = 0;
        point.handleOut[2] = 0;
      }),
    ),
  );
  return flat;
};

/** Every closed outline in a shape, in order: each region's outline, then its holes. The pen tool edits them by this index. */
export const shapeContours = (shape: ShapeData): PathData[] => shape.regions.flatMap((region) => [region.outline, ...region.holes]);

/** The shape with contour `index` (as `shapeContours` counts) replaced. */
export const replaceContour = (shape: ShapeData, index: number, contour: PathData): ShapeData => {
  let at = 0;
  return {
    regions: shape.regions.map((region) => {
      const outline = at++ === index ? contour : region.outline;
      const holes = region.holes.map((hole) => (at++ === index ? contour : hole));
      return { outline, holes };
    }),
  };
};

/**
 * The shape without contour `index`: removing a region's outline removes its holes too. Null when
 * nothing would be left.
 */
export const removeContour = (shape: ShapeData, index: number): ShapeData | null => {
  let at = 0;
  const regions: ShapeRegion[] = [];
  shape.regions.forEach((region) => {
    const isOutline = at === index;
    const firstHole = at + 1;
    at += 1 + region.holes.length;
    if (!isOutline) regions.push({ outline: region.outline, holes: region.holes.filter((_, i) => firstHole + i !== index) });
  });
  return regions.length > 0 ? { regions } : null;
};

// A closed contour as a Three path in XY, one bezierCurveTo per segment (a segment with no handles
// draws straight).
const contourToPath = <T extends THREE.Path>(contour: PathData, target: T): T => {
  const { points } = contour;
  if (points.length === 0) return target;
  target.moveTo(points[0].position[0], points[0].position[1]);
  const segments = contour.closed ? points.length : points.length - 1;
  for (let i = 0; i < segments; i += 1) {
    const from = points[i];
    const to = points[(i + 1) % points.length];
    target.bezierCurveTo(
      from.position[0] + from.handleOut[0],
      from.position[1] + from.handleOut[1],
      to.position[0] + to.handleIn[0],
      to.position[1] + to.handleIn[1],
      to.position[0],
      to.position[1],
    );
  }
  return target;
};

/** The shape as Three shapes (outline + holes), for ShapeGeometry and ExtrudeGeometry. */
export const toThreeShapes = (shape: ShapeData): THREE.Shape[] =>
  shape.regions
    .filter((region) => region.outline.points.length >= 3)
    .map((region) => {
      const threeShape = contourToPath(region.outline, new THREE.Shape());
      threeShape.holes = region.holes.filter((hole) => hole.points.length >= 3).map((hole) => contourToPath(hole, new THREE.Path()));
      return threeShape;
    });

/**
 * The shape's geometry: flat when it has no extrusion or bevel, otherwise extruded `extrusion`
 * deep with the bevel rounding its edges outwards (Three's bevel grows the outline by its size),
 * centred on Z = 0 so it turns about its middle.
 */
export const buildShapeGeometry = (shape: ShapeData, solid: ShapeSolid = DEFAULT_SOLID): THREE.BufferGeometry => {
  const shapes = toThreeShapes(shape);
  const extrusion = Math.max(0, solid.extrusion);
  const bevel = Math.max(0, solid.bevel);
  if (extrusion === 0 && bevel === 0) return new THREE.ShapeGeometry(shapes, CURVE_SEGMENTS);

  const geometry = new THREE.ExtrudeGeometry(shapes, {
    depth: extrusion,
    curveSegments: CURVE_SEGMENTS,
    bevelEnabled: bevel > 0,
    bevelThickness: bevel,
    bevelSize: bevel,
    bevelSegments: BEVEL_SEGMENTS,
  });
  geometry.translate(0, 0, -extrusion / 2);
  return geometry;
};
