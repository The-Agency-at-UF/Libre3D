import * as THREE from "three";
import { describe, expect, it } from "vitest";
import { buildPathCurve } from "./pathGeometry";
import {
  curveToCubics,
  ellipseSweep,
  IMPORT_SIZE,
  MIN_IMPORT_RADIUS,
  svgShapesToItems,
  type Cubic,
  type ImportedPath,
  type ImportedShape,
  type SvgShape,
  type SvgStyle,
} from "./svgImport";

type Vector = [number, number, number];

const STROKE: SvgStyle = { fill: "none", stroke: "#000", strokeWidth: 2 };

// A shape as utils/importSvg.ts hands it over: a ShapePath's subpaths, the style in userData, and
// its filled areas (ShapePath.toShapes stands in for SVGLoader.createShapes, which needs the file).
const svgShape = (draw: (shape: THREE.ShapePath) => void, style: SvgStyle = STROKE): SvgShape => {
  const shapePath = new THREE.ShapePath();
  draw(shapePath);
  return { subPaths: shapePath.subPaths, userData: { style }, fills: shapePath.toShapes(true) };
};

const pathsOf = (shapes: SvgShape[]) => svgShapesToItems(shapes).filter((item): item is ImportedPath => item.kind === "path");
const shapesOf = (shapes: SvgShape[]) => svgShapesToItems(shapes).filter((item): item is ImportedShape => item.kind === "shape");

const importOne = (shape: SvgShape): ImportedPath => {
  const paths = pathsOf([shape]);
  expect(paths).toHaveLength(1);
  return paths[0];
};

const expectTuple = (actual: number[], expected: number[], digits = 6) => {
  expect(actual).toHaveLength(expected.length);
  actual.forEach((value, i) => expect(value).toBeCloseTo(expected[i], digits));
};

// Where each point is in the import (its path's origin plus its own position).
const placed = (imported: ImportedPath): Vector[] =>
  imported.path.points.map(({ position }) => position.map((value, i) => value + imported.position[i]) as Vector);

const cubicCurve = ([p0, c1, c2, p3]: Cubic) => new THREE.CubicBezierCurve(p0, c1, c2, p3);

describe("curveToCubics", () => {
  it("gives a line no handles", () => {
    const [cubic] = curveToCubics(new THREE.LineCurve(new THREE.Vector2(1, 2), new THREE.Vector2(5, 2)));

    expect(cubic.map((point) => point.toArray())).toEqual([
      [1, 2],
      [1, 2],
      [5, 2],
      [5, 2],
    ]);
  });

  it("turns a quadratic into the same curve as a cubic", () => {
    const quadratic = new THREE.QuadraticBezierCurve(new THREE.Vector2(0, 0), new THREE.Vector2(5, 10), new THREE.Vector2(10, 0));
    const cubics = curveToCubics(quadratic);

    expect(cubics).toHaveLength(1);
    for (const t of [0, 0.2, 0.5, 0.9, 1]) {
      expectTuple(cubicCurve(cubics[0]).getPoint(t).toArray(), quadratic.getPoint(t).toArray(), 9);
    }
  });

  it("keeps a cubic as it is, without sharing its vectors", () => {
    const cubic = new THREE.CubicBezierCurve(new THREE.Vector2(0, 0), new THREE.Vector2(0, 10), new THREE.Vector2(10, 10), new THREE.Vector2(10, 0));
    const [copy] = curveToCubics(cubic);

    expect(copy.map((point) => point.toArray())).toEqual([cubic.v0, cubic.v1, cubic.v2, cubic.v3].map((point) => point.toArray()));
    expect(copy[0]).not.toBe(cubic.v0);
  });

  // An ellipse is a stretched circle: undoing its rotation and radii puts an exact arc on the unit
  // circle, so the cubics' distance from it there is their error.
  const maxCircleError = (curve: THREE.EllipseCurve, cubics: Cubic[]) => {
    let worst = 0;
    cubics.forEach((cubic) => {
      for (let i = 0; i <= 20; i += 1) {
        const point = cubicCurve(cubic)
          .getPoint(i / 20)
          .sub(new THREE.Vector2(curve.aX, curve.aY))
          .rotateAround(new THREE.Vector2(), -curve.aRotation);
        worst = Math.max(worst, Math.abs(Math.hypot(point.x / curve.xRadius, point.y / curve.yRadius) - 1));
      }
    });
    return worst;
  };

  it.each([
    ["a quarter circle", new THREE.EllipseCurve(0, 0, 1, 1, 0, Math.PI / 2, false, 0), 1],
    ["a half circle the other way round", new THREE.EllipseCurve(3, 1, 2, 2, 0, Math.PI, true, 0), 2],
    ["three quarters of a turned ellipse", new THREE.EllipseCurve(0, 0, 2, 1, 0, (3 * Math.PI) / 2, false, Math.PI / 6), 3],
    ["a full circle", new THREE.EllipseCurve(50, 50, 10, 10, 0, Math.PI * 2, false, 0), 4],
    ["a small clockwise arc", new THREE.EllipseCurve(0, 0, 5, 3, 1, 0.5, true, 0.3), 1],
  ])("follows %s with a cubic per quarter turn or less", (_, curve, pieces) => {
    const cubics = curveToCubics(curve);

    expect(cubics).toHaveLength(pieces);
    expect(maxCircleError(curve, cubics)).toBeLessThan(3e-4);
    // Its ends, and where the pieces meet, are exactly on the arc, going the arc's way round.
    cubics.forEach((cubic, i) => {
      expectTuple(cubic[0].toArray(), curve.getPoint(i / pieces).toArray(), 9);
      expectTuple(cubic[3].toArray(), curve.getPoint((i + 1) / pieces).toArray(), 9);
    });
  });

  it("works out an arc's sweep as EllipseCurve does", () => {
    expect(ellipseSweep(new THREE.EllipseCurve(0, 0, 1, 1, 0, Math.PI, true, 0))).toBeCloseTo(-Math.PI, 12);
    expect(ellipseSweep(new THREE.EllipseCurve(0, 0, 1, 1, 0, Math.PI * 2, true, 0))).toBeCloseTo(-Math.PI * 2, 12);
    expect(ellipseSweep(new THREE.EllipseCurve(0, 0, 1, 1, 1, 0.5, false, 0))).toBeCloseTo(Math.PI * 2 - 0.5, 12);
    expect(ellipseSweep(new THREE.EllipseCurve(0, 0, 1, 1, 1, 1, false, 0))).toBe(0);
  });
});

describe("svgShapesToItems: strokes", () => {
  it("makes one straight path from a line, centred and scaled to the import size", () => {
    const imported = importOne(svgShape((shape) => shape.moveTo(0, 0).lineTo(10, 0)));

    expect(imported.position).toEqual([0, 0, 0]);
    expect(imported.path.closed).toBe(false);
    expect(imported.path.points).toEqual([
      { position: [-2, 0, 0], handleIn: [0, 0, 0], handleOut: [0, 0, 0], mode: "corner" },
      { position: [2, 0, 0], handleIn: [0, 0, 0], handleOut: [0, 0, 0], mode: "corner" },
    ]);
  });

  it("turns SVG's y (down) into ours (up)", () => {
    const imported = importOne(svgShape((shape) => shape.moveTo(0, 0).bezierCurveTo(0, 10, 10, 10, 10, 0)));

    // The curve bulges to y = 7.5 in the SVG, which is down: below its ends here.
    expect(imported.path.points[0].handleOut).toEqual([0, -4, 0]);
    expect(imported.path.points[1].handleIn).toEqual([0, -4, 0]);
    const curve = buildPathCurve(imported.path)!;
    const middle = curve.getPoint(0.5).add(new THREE.Vector3(...imported.position));
    expectTuple(placed(imported)[0], [-2, 1.5, 0]);
    expectTuple(middle.toArray(), [0, -1.5, 0], 3);
  });

  it("scales the longer side to the import size and centres the whole drawing", () => {
    const paths = pathsOf([
      svgShape((shape) => {
        shape.moveTo(100, 100).lineTo(300, 100);
        shape.moveTo(100, 200).lineTo(300, 200);
      }),
      svgShape((shape) => shape.moveTo(200, 120).lineTo(200, 180)),
    ]);

    expect(paths).toHaveLength(3);
    // 200 wide → 4 units: 0.02 per pixel, around the drawing's centre (200, 150).
    expectTuple(paths.flatMap((path) => path.position), [0, 1, 0, 0, -1, 0, 0, 0, 0]);
    expectTuple(placed(paths[2]).flat(), [0, 0.6, 0, 0, -0.6, 0]);

    const tall = importOne(svgShape((shape) => shape.moveTo(0, 0).lineTo(5, 50)));
    expectTuple(placed(tall).flat(), [-0.2, IMPORT_SIZE / 2, 0, 0.2, -IMPORT_SIZE / 2, 0]);
  });

  it("puts each path's origin at the centre of its own bounds", () => {
    const [left, right] = pathsOf([
      svgShape((shape) => {
        shape.moveTo(0, 0).lineTo(0, 10);
        shape.moveTo(20, 0).lineTo(30, 10);
      }),
    ]);

    // 30 wide → 4 units, around (15, 5).
    expectTuple(left.position, [-2, 0, 0]);
    expectTuple(right.position, [(10 / 30) * 4, 0, 0]);
    expectTuple(right.path.points[0].position, [-(5 / 30) * 4, (5 / 30) * 4, 0]);
  });

  it("measures the drawing by its curve, not its control points", () => {
    // The handles reach y = 40, the curve only 30.
    const imported = importOne(svgShape((shape) => shape.moveTo(0, 0).bezierCurveTo(0, 40, 40, 40, 40, 0)));

    expectTuple(placed(imported).flat(), [-2, 1.5, 0, 2, 1.5, 0]);
  });

  it("goes through every segment's end, whatever its kind", () => {
    const imported = importOne(
      svgShape((shape) => {
        shape.moveTo(0, 0).lineTo(10, 0).quadraticCurveTo(15, 0, 15, 5).bezierCurveTo(15, 10, 10, 15, 5, 15);
        shape.currentPath!.absarc(5, 20, 5, -Math.PI / 2, Math.PI / 2, true);
      }),
    );

    // The half circle is two quarter-turn cubics, bulging left to (0, 20).
    expect(imported.path.points).toHaveLength(6);
    // 15 wide, 25 tall → 0.16 per pixel, around (7.5, 12.5).
    const expected = [
      [0, 0],
      [10, 0],
      [15, 5],
      [5, 15],
      [0, 20],
      [5, 25],
    ].map(([x, y]) => [(x - 7.5) * 0.16, (12.5 - y) * 0.16, 0]);
    expectTuple(placed(imported).flat(), expected.flat());
  });

  it("closes a Z that doesn't end on the start with a straight segment", () => {
    const imported = importOne(
      svgShape((shape) => {
        shape.moveTo(0, 0).lineTo(10, 0).lineTo(10, 10);
        shape.currentPath!.autoClose = true;
      }),
    );

    expect(imported.path.closed).toBe(true);
    expect(imported.path.points).toHaveLength(3);
    expect(imported.path.points[0].handleIn).toEqual([0, 0, 0]);
    expect(imported.path.points[2].handleOut).toEqual([0, 0, 0]);
  });

  it("merges the end into the start when a closed shape gets back to it", () => {
    const withZ = importOne(
      svgShape((shape) => {
        shape.moveTo(0, 0).lineTo(10, 0).bezierCurveTo(10, 5, 5, 10, 0, 10).bezierCurveTo(0, 7, 0, 3, 0, 0);
        shape.currentPath!.autoClose = true;
      }),
    );
    // A circle from SVGLoader is one full arc with no Z.
    const circle = new THREE.Path();
    circle.absarc(50, 50, 10, 0, Math.PI * 2, false);
    const round = importOne({ subPaths: [circle], userData: { style: STROKE } });

    expect(withZ.path).toMatchObject({ closed: true });
    expect(withZ.path.points).toHaveLength(3);
    // The first point (0, 0) takes the last segment's handle in: 3 px down the SVG (+y), so 1.2 down here.
    expectTuple(withZ.path.points[0].handleIn, [0, -1.2, 0]);

    expect(round.path.closed).toBe(true);
    expect(round.path.points).toHaveLength(4);
    expect(round.path.points.every((point) => point.mode === "smooth")).toBe(true);
    placed(round).forEach((point) => expect(Math.hypot(...point)).toBeCloseTo(2, 6));
  });

  it("halves a closed loop that's a single segment, so it has two points", () => {
    const imported = importOne(
      svgShape((shape) => {
        shape.moveTo(0, 0).bezierCurveTo(10, -10, 10, 10, 0, 0);
        shape.currentPath!.autoClose = true;
      }),
    );

    // 7.5 wide (x = 30t(1 − t)), symmetric about y = 0.
    expect(imported.path.closed).toBe(true);
    expectTuple(placed(imported).flat(), [-2, 0, 0, 2, 0, 0]);
    expect(buildPathCurve(imported.path)!.getLength()).toBeGreaterThan(4);
  });

  it("drops segments with no length", () => {
    const imported = importOne(svgShape((shape) => shape.moveTo(0, 0).lineTo(0, 0).lineTo(10, 0).lineTo(10 + 1e-12, 0).lineTo(10, 10)));

    expect(imported.path.points).toHaveLength(3);
  });

  it("makes a point smooth when its handles are opposite, else a corner", () => {
    const imported = importOne(
      svgShape((shape) =>
        shape
          .moveTo(0, 0)
          .bezierCurveTo(0, 5, 5, 10, 10, 10) // into (10, 10) heading +x
          .bezierCurveTo(15, 10, 20, 5, 20, 0) // out of it heading +x: smooth
          .bezierCurveTo(20, 5, 25, 10, 30, 10) // out of (20, 0) heading +y after arriving heading −y: corner
          .lineTo(40, 10), // a line has no handle: corner
      ),
    );

    expect(imported.path.points.map((point) => point.mode)).toEqual(["corner", "smooth", "corner", "corner", "corner"]);
  });

  it("makes the tube as thick as the stroke, relative to the drawing", () => {
    const thick = importOne(svgShape((shape) => shape.moveTo(0, 0).lineTo(400, 0), { stroke: "black", strokeWidth: 24, fill: "none" }));
    const hairline = importOne(svgShape((shape) => shape.moveTo(0, 0).lineTo(4000, 0), { stroke: "black", strokeWidth: 1, fill: "none" }));

    expect(thick.stroke).toEqual({ radius: expect.closeTo(0.12, 9), caps: "round" });
    expect(hairline.stroke.radius).toBe(MIN_IMPORT_RADIUS);
  });

  it("brings in a stroke that's also filled as a path", () => {
    // SVG fills black by default, so a stroked path without fill="none" is filled too: still a stroke.
    const both = svgShapesToItems([svgShape((shape) => shape.moveTo(0, 0).lineTo(10, 0).lineTo(10, 10), { fill: "#000", stroke: "red", strokeWidth: 1 })]);

    expect(both.map((item) => item.kind)).toEqual(["path"]);
  });

  it("skips shapes that draw nothing", () => {
    const line = (shape: THREE.ShapePath) => shape.moveTo(0, 0).lineTo(10, 0);

    expect(pathsOf([svgShape(line, { fill: "none" })])).toEqual([]);
    expect(pathsOf([svgShape(line, { fill: "none", stroke: "#000", strokeWidth: 0 })])).toEqual([]);
    expect(pathsOf([svgShape(line, { ...STROKE, visibility: "hidden" })])).toEqual([]);
    expect(pathsOf([svgShape(line, {})])).toEqual([]);
  });

  it("is empty when there's nothing to draw", () => {
    expect(pathsOf([])).toEqual([]);
    expect(pathsOf([svgShape((shape) => shape.moveTo(5, 5))])).toEqual([]);
    expect(pathsOf([svgShape((shape) => shape.moveTo(5, 5).lineTo(5, 5))])).toEqual([]);
  });
});

describe("svgShapesToItems: fills", () => {
  const FILL: SvgStyle = { fill: "black" };
  // A 10-wide square with a 4-wide square hole, drawn the other way round (as fonts draw counters).
  const ring = (shape: THREE.ShapePath) => {
    shape.moveTo(0, 0).lineTo(10, 0).lineTo(10, 10).lineTo(0, 10).lineTo(0, 0);
    shape.moveTo(3, 3).lineTo(3, 7).lineTo(7, 7).lineTo(7, 3).lineTo(3, 3);
  };

  it("brings in a filled shape with no stroke as a shape, with its holes", () => {
    const [imported] = shapesOf([svgShape(ring, FILL)]);

    expect(imported.position).toEqual([0, 0, 0]);
    expect(imported.shape.regions).toHaveLength(1);
    const [{ outline, holes }] = imported.shape.regions;
    expect(outline.closed).toBe(true);
    expect(outline.points.map((point) => point.position)).toEqual(
      expect.arrayContaining([
        [-2, -2, 0],
        [2, 2, 0],
      ]),
    );
    expect(holes).toHaveLength(1);
    expect(holes[0].points.map((point) => point.position.map(Math.abs))).toEqual(
      Array.from({ length: 4 }, () => [expect.closeTo(0.8, 9), expect.closeTo(0.8, 9), 0]),
    );
  });

  it("keeps the fill colour", () => {
    const colour = (fill: string) => shapesOf([svgShape(ring, { fill })])[0].color;

    expect(colour("black")).toBe("#000000");
    expect(colour("#f80")).toBe("#ff8800");
    expect(colour("rgb(255, 0, 0)")).toBe("#ff0000");
    expect(colour("currentColor")).toBe("#000000");
  });

  it("gives a contour at least three points", () => {
    // A circle from two half arcs: two segments, split into four.
    const [imported] = shapesOf([
      svgShape((shape) => {
        shape.moveTo(5, 0);
        shape.currentPath!.absarc(0, 0, 5, 0, Math.PI, false);
        shape.currentPath!.absarc(0, 0, 5, Math.PI, Math.PI * 2, false);
      }, FILL),
    ]);

    expect(imported.shape.regions[0].outline.points.length).toBeGreaterThanOrEqual(3);
  });

  it("puts each shape's origin at its own centre, in drawing order with paths", () => {
    const items = svgShapesToItems([
      svgShape((shape) => shape.moveTo(0, 0).lineTo(10, 0).lineTo(10, 10).lineTo(0, 10).lineTo(0, 0), FILL),
      svgShape((shape) => shape.moveTo(30, 0).lineTo(40, 10)),
    ]);

    expect(items.map((item) => item.kind)).toEqual(["shape", "path"]);
    // 40 wide → 4 units around (20, 5).
    expectTuple(items[0].position, [-1.5, 0, 0]);
    expectTuple(items[1].position, [1.5, 0, 0]);
  });

  it("drops contours that enclose nothing", () => {
    expect(shapesOf([svgShape((shape) => shape.moveTo(0, 0).lineTo(10, 0).lineTo(0, 0), FILL)])).toEqual([]);
  });
});
