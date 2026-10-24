/**
 * PURPOSE: Turns an SVG drawing into shapes and paths (notes/animation-plan.md, B3), the way Spline
 * imports one: a filled SVG shape comes in as a filled shape (Convert to Path then finds the tube
 * along the middle of its strokes: paths/centerLine.ts), and a stroked one, such as lettering drawn
 * in Figma or Illustrator as single-line strokes, as paths whose tubes follow the stroke.
 *
 * INPUT: The shapes three's SVGLoader parsed from the file: each with its subpaths (transforms
 * already applied), its style, and for a filled one its filled areas (SVGLoader.createShapes: each
 * outline with its holes, following the fill rule).
 * OUTPUT: In drawing order, one shape per filled SVG shape, or one path per subpath of a stroked
 * one, in the XY plane with Y up, the whole drawing centred on 0 and scaled so its longer side is
 * IMPORT_SIZE units. Each one's origin is the centre of its own bounds.
 *
 * Every segment becomes the cubic Bézier PathPoint holds: a line gets no handles, a quadratic its
 * exact cubic, and an elliptical arc one cubic per quarter turn at most. A stroked SVG shape is a
 * path even when it's also filled, since SVG fills black unless told `fill="none"`.
 *
 * SVGLoader.parse needs the DOM (DOMParser), so utils/importSvg.ts calls it; nothing here depends on
 * the store, React, or the DOM.
 */

import * as THREE from "three";
import type { PathData, PathPoint, PathStroke } from "./pathGeometry";
import type { ShapeData } from "./shapeGeometry";

type Vector = [number, number, number];

/** How big an imported drawing is: its longer side, in units. */
export const IMPORT_SIZE = 4;
/** The thinnest tube an SVG stroke makes (the Path panel's minimum radius), so a hairline shows. */
export const MIN_IMPORT_RADIUS = 0.01;

const SVG_DEFAULT_STROKE_WIDTH = 1;
const SVG_DEFAULT_FILL = "#000000";
const MAX_ARC_PIECE = Math.PI / 2; // an arc becomes one cubic per quarter turn at most
const SMOOTH_DOT = -Math.cos(Math.PI / 180); // handles within 1° of opposite make a smooth point
const BOUNDS_SAMPLES = 32; // per segment: the drawing is measured by its curves, not its control points
const DEGENERATE = 1e-6; // of the drawing's size: a segment this short is dropped

/** The part of SVGLoader's style the import reads. */
export interface SvgStyle {
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  visibility?: string;
}

/** An outline made of curves: a THREE.Shape, or one of its holes' THREE.Paths. */
export interface SvgContour {
  curves: THREE.Curve<THREE.Vector2>[];
}

/**
 * One shape SVGLoader found (its ShapePath): subpaths, and the style in `userData`. `fills` is its
 * filled areas, each an outline with its holes (SVGLoader.createShapes, which needs no DOM).
 */
export interface SvgShape {
  subPaths: { curves: THREE.Curve<THREE.Vector2>[]; autoClose: boolean }[];
  userData?: { style?: SvgStyle };
  fills?: (SvgContour & { holes: SvgContour[] })[];
}

export interface ImportedPath {
  kind: "path";
  position: Vector; // the path's origin: the centre of its bounds
  path: PathData; // points relative to `position`
  stroke: PathStroke;
}

export interface ImportedShape {
  kind: "shape";
  position: Vector; // the shape's origin: the centre of its bounds
  shape: ShapeData; // points relative to `position`
  color: string; // the SVG's fill, as #rrggbb
}

export type ImportedSvgItem = ImportedPath | ImportedShape;

/** A cubic Bézier in the SVG's coordinates: start, two control points, end. */
export type Cubic = [THREE.Vector2, THREE.Vector2, THREE.Vector2, THREE.Vector2];

const isPainted = (paint?: string) => paint !== undefined && paint !== "none";

/** The signed angle an EllipseCurve turns through, worked out the way EllipseCurve.getPoint does. */
export const ellipseSweep = (curve: THREE.EllipseCurve): number => {
  const twoPi = Math.PI * 2;
  let sweep = curve.aEndAngle - curve.aStartAngle;
  const samePoints = Math.abs(sweep) < Number.EPSILON;
  while (sweep < 0) sweep += twoPi;
  while (sweep > twoPi) sweep -= twoPi;
  if (sweep < Number.EPSILON) sweep = samePoints ? 0 : twoPi;
  if (curve.aClockwise && !samePoints) sweep = sweep === twoPi ? -twoPi : sweep - twoPi;
  return sweep;
};

// An elliptical arc as cubics of at most a quarter turn each. A cubic whose handles run along the
// arc's tangents, 4/3 · tan(angle / 4) of the derivative long, is off by under 0.03 % of the radius
// for a quarter turn. An ellipse is a stretched circle, so the same works on it per angle.
const ellipseToCubics = (curve: THREE.EllipseCurve): Cubic[] => {
  const sweep = ellipseSweep(curve);
  const pieces = Math.max(1, Math.ceil(Math.abs(sweep) / MAX_ARC_PIECE - 1e-9));
  const step = sweep / pieces;
  const handle = (4 / 3) * Math.tan(step / 4);
  const cos = Math.cos(curve.aRotation);
  const sin = Math.sin(curve.aRotation);
  const rotate = (x: number, y: number) => new THREE.Vector2(x * cos - y * sin, x * sin + y * cos);
  const pointAt = (angle: number) =>
    rotate(curve.xRadius * Math.cos(angle), curve.yRadius * Math.sin(angle)).add(new THREE.Vector2(curve.aX, curve.aY));
  const derivativeAt = (angle: number) => rotate(-curve.xRadius * Math.sin(angle), curve.yRadius * Math.cos(angle));

  return Array.from({ length: pieces }, (_, i) => {
    const from = curve.aStartAngle + i * step;
    const to = from + step;
    const start = pointAt(from);
    const end = pointAt(to);
    return [start, start.clone().addScaledVector(derivativeAt(from), handle), end.clone().addScaledVector(derivativeAt(to), -handle), end];
  });
};

/** A segment of an SVG path as cubics: lines, quadratics, cubics, and elliptical arcs (all SVGLoader makes). */
export const curveToCubics = (curve: THREE.Curve<THREE.Vector2>): Cubic[] => {
  if ((curve as THREE.CubicBezierCurve).isCubicBezierCurve) {
    const { v0, v1, v2, v3 } = curve as THREE.CubicBezierCurve;
    return [[v0.clone(), v1.clone(), v2.clone(), v3.clone()]];
  }
  if ((curve as THREE.QuadraticBezierCurve).isQuadraticBezierCurve) {
    // The same curve as a cubic: each control point 2/3 of the way to the quadratic's one.
    const { v0, v1, v2 } = curve as THREE.QuadraticBezierCurve;
    return [[v0.clone(), v0.clone().lerp(v1, 2 / 3), v2.clone().lerp(v1, 2 / 3), v2.clone()]];
  }
  if ((curve as THREE.EllipseCurve).isEllipseCurve) return ellipseToCubics(curve as THREE.EllipseCurve);
  // A line (or anything else): straight from its start to its end, no handles.
  const start = curve.getPoint(0);
  const end = curve.getPoint(1);
  return [[start, start.clone(), end.clone(), end]];
};

const cubicPoint = ([p0, c1, c2, p3]: Cubic, t: number) => {
  const u = 1 - t;
  return new THREE.Vector2()
    .addScaledVector(p0, u * u * u)
    .addScaledVector(c1, 3 * u * u * t)
    .addScaledVector(c2, 3 * u * t * t)
    .addScaledVector(p3, t * t * t);
};

/** Splits a cubic in two halves (de Casteljau). */
const splitCubic = ([p0, c1, c2, p3]: Cubic): [Cubic, Cubic] => {
  const a = p0.clone().lerp(c1, 0.5);
  const b = c1.clone().lerp(c2, 0.5);
  const c = c2.clone().lerp(p3, 0.5);
  const d = a.clone().lerp(b, 0.5);
  const e = b.clone().lerp(c, 0.5);
  const middle = d.clone().lerp(e, 0.5);
  return [
    [p0.clone(), a, d, middle],
    [middle.clone(), e, c, p3.clone()],
  ];
};

const boundsOf = (cubics: Cubic[], samples: number) => {
  const box = new THREE.Box2();
  cubics.forEach((cubic) => {
    for (let i = 0; i <= samples; i += 1) box.expandByPoint(cubicPoint(cubic, i / samples));
  });
  return box;
};

const isDegenerate = ([p0, c1, c2, p3]: Cubic, tolerance: number) =>
  p0.distanceTo(c1) <= tolerance && p0.distanceTo(c2) <= tolerance && p0.distanceTo(p3) <= tolerance;

interface SvgPoint {
  position: THREE.Vector2;
  handleIn: THREE.Vector2; // relative to position
  handleOut: THREE.Vector2;
}

// A subpath's points: each segment's start, plus the last one's end unless it closes onto the first
// point. A closed subpath that doesn't end on its start gets a straight closing segment (what SVG's
// Z draws): the first point's handle in and the last one's handle out stay at zero.
const subPathPoints = (cubics: Cubic[], closed: boolean, tolerance: number): SvgPoint[] => {
  const last = cubics[cubics.length - 1];
  const joinsStart = closed && last[3].distanceTo(cubics[0][0]) <= tolerance;
  const handleInFrom = (cubic: Cubic) => cubic[2].clone().sub(cubic[3]);

  const points = cubics.map((cubic, i) => ({
    position: cubic[0].clone(),
    handleIn: i > 0 ? handleInFrom(cubics[i - 1]) : joinsStart ? handleInFrom(last) : new THREE.Vector2(),
    handleOut: cubic[1].clone().sub(cubic[0]),
  }));
  if (!joinsStart) points.push({ position: last[3].clone(), handleIn: handleInFrom(last), handleOut: new THREE.Vector2() });
  return points;
};

// Smooth when both handles have a length and point (within 1°) in opposite directions, the way the
// pen tool's smooth points are, so editing one handle turns the other with it as it was drawn.
const pointMode = ({ handleIn, handleOut }: SvgPoint, tolerance: number): PathPoint["mode"] =>
  handleIn.length() > tolerance &&
  handleOut.length() > tolerance &&
  handleIn.clone().normalize().dot(handleOut.clone().normalize()) <= SMOOTH_DOT
    ? "smooth"
    : "corner";

// A fill as #rrggbb: SVG's colour names, #rgb, rgb() and hsl() (THREE.Color reads them all). Black
// when it can't be read (such as currentColor), as SVG's default fill is: setStyle leaves the colour
// as it was then.
const fillColor = (fill: string): string => {
  const color = new THREE.Color(NaN, NaN, NaN).setStyle(fill, THREE.SRGBColorSpace);
  return Number.isNaN(color.r) ? SVG_DEFAULT_FILL : `#${color.getHexString(THREE.SRGBColorSpace)}`;
};

// A closed contour needs three points, so its segments are halved until there are three.
const atLeastThreeSegments = (cubics: Cubic[]): Cubic[] => {
  let segments = cubics;
  while (segments.length > 0 && segments.length < 3) segments = segments.flatMap(splitCubic);
  return segments;
};

type Collected =
  | { kind: "path"; cubics: Cubic[]; autoClose: boolean; strokeWidth: number }
  | { kind: "shape"; regions: { outline: Cubic[]; holes: Cubic[][] }[]; color: string };

const allCubics = (item: Collected): Cubic[] =>
  item.kind === "path" ? item.cubics : item.regions.flatMap((region) => [...region.outline, ...region.holes.flat()]);

/**
 * The paths and shapes in an SVG drawing, in drawing order: a shape for each filled SVG shape with
 * no stroke, a path for each subpath of a stroked one. Empty when there's nothing to draw. A shape
 * that's neither stroked nor filled, or hidden, is skipped.
 */
export const svgShapesToItems = (shapes: SvgShape[]): ImportedSvgItem[] => {
  const collected: Collected[] = [];
  shapes.forEach((shape) => {
    const style = shape.userData?.style ?? {};
    const strokeWidth = style.strokeWidth ?? SVG_DEFAULT_STROKE_WIDTH;
    const stroked = isPainted(style.stroke) && strokeWidth > 0;
    if (style.visibility === "hidden" || (!stroked && !isPainted(style.fill))) return;
    if (stroked) {
      shape.subPaths.forEach((subPath) => {
        collected.push({ kind: "path", cubics: subPath.curves.flatMap(curveToCubics), autoClose: subPath.autoClose, strokeWidth });
      });
      return;
    }
    const regions = (shape.fills ?? []).map((fill) => ({
      outline: fill.curves.flatMap(curveToCubics),
      holes: fill.holes.map((hole) => hole.curves.flatMap(curveToCubics)),
    }));
    collected.push({ kind: "shape", regions, color: fillColor(style.fill!) });
  });

  // What counts as no length is relative to the drawing (pixels, points, millimetres…). SVGLoader
  // joins an arc to the point before it with a line that is only floating-point error long.
  const roughBox = new THREE.Box2();
  collected.forEach((item) => allCubics(item).forEach((cubic) => cubic.forEach((point) => roughBox.expandByPoint(point))));
  const roughSize = roughBox.isEmpty() ? 0 : Math.max(...roughBox.getSize(new THREE.Vector2()).toArray());
  if (!(roughSize > 0)) return [];
  const tolerance = roughSize * DEGENERATE;
  const keep = (cubics: Cubic[]) => cubics.filter((cubic) => !isDegenerate(cubic, tolerance));
  // A contour that's only a point or a line encloses nothing, so it goes.
  const enclosesArea = (cubics: Cubic[]) =>
    cubics.length > 0 && boundsOf(cubics, 4).getSize(new THREE.Vector2()).toArray().every((side) => side > tolerance);

  const kept = collected
    .map((item): Collected => {
      if (item.kind === "path") return { ...item, cubics: keep(item.cubics) };
      const regions = item.regions
        .map((region) => ({ outline: keep(region.outline), holes: region.holes.map(keep).filter(enclosesArea) }))
        .filter((region) => enclosesArea(region.outline));
      return { ...item, regions };
    })
    .filter((item) => (item.kind === "path" ? item.cubics.length > 0 : item.regions.length > 0));
  if (kept.length === 0) return [];

  const drawing = boundsOf(kept.flatMap(allCubics), BOUNDS_SAMPLES);
  const centre = drawing.getCenter(new THREE.Vector2());
  const size = Math.max(...drawing.getSize(new THREE.Vector2()).toArray());
  if (!(size > 0)) return [];
  const scale = IMPORT_SIZE / size;

  // SVG's y points down; ours up.
  const toPosition = (point: THREE.Vector2): Vector => [(point.x - centre.x) * scale, (centre.y - point.y) * scale, 0];
  const toHandle = (handle: THREE.Vector2): Vector => [handle.x * scale, (0 - handle.y) * scale, 0];
  // Points relative to `origin`, the item's position.
  const toPath = (points: SvgPoint[], closed: boolean, origin: Vector): PathData => ({
    points: points.map((point) => {
      const [x, y, z] = toPosition(point.position);
      return {
        position: [x - origin[0], y - origin[1], z - origin[2]] as Vector,
        handleIn: toHandle(point.handleIn),
        handleOut: toHandle(point.handleOut),
        mode: pointMode(point, tolerance),
      };
    }),
    closed,
  });

  return kept.map((item): ImportedSvgItem => {
    if (item.kind === "shape") {
      const position = toPosition(boundsOf(allCubics(item), BOUNDS_SAMPLES).getCenter(new THREE.Vector2()));
      const contour = (cubics: Cubic[]) => toPath(subPathPoints(atLeastThreeSegments(cubics), true, tolerance), true, position);
      return {
        kind: "shape",
        position,
        shape: { regions: item.regions.map((region) => ({ outline: contour(region.outline), holes: region.holes.map(contour) })) },
        color: item.color,
      };
    }

    const { cubics, autoClose, strokeWidth } = item;
    const endsOnStart = cubics[cubics.length - 1][3].distanceTo(cubics[0][0]) <= tolerance;
    // A shape that ends where it starts is closed even without a Z (SVGLoader's circles and rects).
    const closed = autoClose || (endsOnStart && cubics.length > 1);
    // A closed path needs two points, so a single segment that loops back to its start is halved.
    const segments = closed && endsOnStart && cubics.length === 1 ? splitCubic(cubics[0]) : cubics;
    const position = toPosition(boundsOf(segments, BOUNDS_SAMPLES).getCenter(new THREE.Vector2()));

    return {
      kind: "path",
      position,
      path: toPath(subPathPoints(segments, closed, tolerance), closed, position),
      stroke: { radius: Math.max(MIN_IMPORT_RADIUS, (strokeWidth / 2) * scale), caps: "round" },
    };
  });
};
