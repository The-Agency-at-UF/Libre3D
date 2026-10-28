import * as THREE from "three";
import { describe, expect, it } from "vitest";
import { maskCenterLines, shapeCenterLines, type Mask } from "./centerLine";
import { buildPathCurve, type PathData, type PathPoint } from "./pathGeometry";
import type { ShapeData } from "./shapeGeometry";

type P = [number, number];

const HALF_WIDTH = 0.1;
const CELL = HALF_WIDTH / 4;

// A grid with every cell within `halfWidth` of one of the strokes (polylines) filled: what a font
// draws with a round pen.
const strokeMask = (strokes: P[][], halfWidth = HALF_WIDTH): Mask => {
  const points = strokes.flat();
  const pad = halfWidth + 4 * CELL;
  const originX = Math.min(...points.map((p) => p[0])) - pad;
  const originY = Math.min(...points.map((p) => p[1])) - pad;
  const cols = Math.ceil((Math.max(...points.map((p) => p[0])) + pad - originX) / CELL);
  const rows = Math.ceil((Math.max(...points.map((p) => p[1])) + pad - originY) / CELL);
  const cells = new Uint8Array(cols * rows);
  const segments = strokes.flatMap((stroke) => stroke.slice(1).map((b, i) => [stroke[i], b] as const));
  for (let r = 0; r < rows; r += 1) {
    for (let c = 0; c < cols; c += 1) {
      const x = originX + (c + 0.5) * CELL;
      const y = originY + (r + 0.5) * CELL;
      const near = segments.some(([a, b]) => {
        const dx = b[0] - a[0];
        const dy = b[1] - a[1];
        const t = Math.max(0, Math.min(1, ((x - a[0]) * dx + (y - a[1]) * dy) / (dx * dx + dy * dy)));
        return Math.hypot(x - a[0] - t * dx, y - a[1] - t * dy) <= halfWidth;
      });
      if (near) cells[r * cols + c] = 1;
    }
  }
  return { cells, cols, rows, cell: CELL, originX, originY };
};

// A curve sampled as a polyline.
const sampled = (count: number, at: (t: number) => P): P[] => Array.from({ length: count + 1 }, (_, i) => at(i / count));

// Points along a fitted path, to check where it runs.
const along = (path: PathData, count = 200): THREE.Vector3[] => {
  const curve = buildPathCurve(path)!;
  return Array.from({ length: count + 1 }, (_, i) => curve.getPointAt(i / count));
};

const ends = (path: PathData) => [path.points[0].position, path.points[path.points.length - 1].position];

const corner = (x: number, y: number): PathPoint => ({ position: [x, y, 0], handleIn: [0, 0, 0], handleOut: [0, 0, 0], mode: "corner" });
const polygon = (points: P[]): PathData => ({ points: points.map(([x, y]) => corner(x, y)), closed: true });
// A circle as four quarter-turn cubics.
const circle = (radius: number): PathData => {
  const k = 0.5523 * radius;
  return {
    points: [
      { position: [radius, 0, 0], handleIn: [0, -k, 0], handleOut: [0, k, 0], mode: "smooth" },
      { position: [0, radius, 0], handleIn: [k, 0, 0], handleOut: [-k, 0, 0], mode: "smooth" },
      { position: [-radius, 0, 0], handleIn: [0, k, 0], handleOut: [0, -k, 0], mode: "smooth" },
      { position: [0, -radius, 0], handleIn: [-k, 0, 0], handleOut: [k, 0, 0], mode: "smooth" },
    ],
    closed: true,
  };
};

describe("maskCenterLines", () => {
  it("follows a straight stroke along its middle, from its left end", () => {
    const paths = maskCenterLines(strokeMask([[[-2, 0.3], [2, 0.3]]]), HALF_WIDTH);

    expect(paths).toHaveLength(1);
    expect(paths[0].closed).toBe(false);
    along(paths[0]).forEach((p) => expect(Math.abs(p.y - 0.3)).toBeLessThan(0.2 * HALF_WIDTH));
    const [start, end] = ends(paths[0]);
    expect(start[0]).toBeCloseTo(-2, 0);
    expect(end[0]).toBeCloseTo(2, 0);
    expect(start[0]).toBeLessThan(end[0]);
    // A straight stroke needs no more than a few points.
    expect(paths[0].points.length).toBeLessThanOrEqual(3);
  });

  it("keeps a curved stroke within a fraction of its width of the true middle", () => {
    const arc = sampled(120, (t) => [1.5 * Math.cos(Math.PI * t), 1.5 * Math.sin(Math.PI * t)]);
    const paths = maskCenterLines(strokeMask([arc]), HALF_WIDTH);

    expect(paths).toHaveLength(1);
    along(paths[0]).forEach((p) => expect(Math.abs(Math.hypot(p.x, p.y) - 1.5)).toBeLessThan(0.3 * HALF_WIDTH));
    expect(paths[0].points.slice(1, -1).every((point) => point.mode === "smooth")).toBe(true);
  });

  it("makes a ring with no ends one closed path", () => {
    const ring = sampled(160, (t) => [Math.cos(2 * Math.PI * t), Math.sin(2 * Math.PI * t)]);
    const paths = maskCenterLines(strokeMask([ring]), HALF_WIDTH);

    expect(paths).toHaveLength(1);
    expect(paths[0].closed).toBe(true);
    along(paths[0]).forEach((p) => expect(Math.abs(Math.hypot(p.x, p.y) - 1)).toBeLessThan(0.3 * HALF_WIDTH));
  });

  it("takes two crossing strokes straight through the crossing", () => {
    const paths = maskCenterLines(
      strokeMask([
        [
          [-2, -2],
          [2, 2],
        ],
        [
          [-2, 2],
          [2, -2],
        ],
      ]),
      HALF_WIDTH,
    );

    expect(paths).toHaveLength(2);
    // Each runs along one diagonal (y = x or y = -x), all the way across.
    const diagonals = paths.map((path) => {
      const points = along(path);
      const rising = points.every((p) => Math.abs(p.y - p.x) < 0.5 * HALF_WIDTH);
      const falling = points.every((p) => Math.abs(p.y + p.x) < 0.5 * HALF_WIDTH);
      expect(Math.abs(points[0].x - points[points.length - 1].x)).toBeGreaterThan(3.5);
      return rising ? "rising" : falling ? "falling" : "neither";
    });
    expect(diagonals.sort()).toEqual(["falling", "rising"]);
  });

  it("keeps a loop that crosses itself as one stroke", () => {
    // A nodal cubic: it crosses itself at the origin, with a loop on the left.
    const loop = sampled(200, (s) => {
      const t = -1.6 + 3.2 * s;
      return [t * t - 1, t * (t * t - 1)];
    });
    const paths = maskCenterLines(strokeMask([loop]), HALF_WIDTH);

    expect(paths).toHaveLength(1);
    expect(paths[0].closed).toBe(false);
    // It goes round the loop: through its far left end at (-1, 0)…
    expect(Math.min(...along(paths[0]).map((p) => p.x))).toBeCloseTo(-1, 1);
    // …and its ends are the curve's two tails.
    ends(paths[0]).forEach(([x, y]) => {
      expect(x).toBeGreaterThan(1.3);
      expect(Math.abs(y)).toBeGreaterThan(1.8);
    });
  });

  it("continues a stroke into a loop it runs into, rather than closing the loop on itself", () => {
    // A tail along y = 0 into a circle that leaves and comes back to (0, 0) heading +x.
    const tail: P[] = [
      [-2, 0],
      [0, 0],
    ];
    const loop = sampled(120, (t) => [Math.sin(2 * Math.PI * t), 1 - Math.cos(2 * Math.PI * t)]);
    const paths = maskCenterLines(strokeMask([tail, loop]), HALF_WIDTH);

    expect(paths).toHaveLength(1);
    expect(paths[0].closed).toBe(false);
    expect(Math.max(...along(paths[0]).map((p) => p.y))).toBeCloseTo(2, 1);
  });

  it("ends a stroke that ends on another, and keeps the other one whole", () => {
    const paths = maskCenterLines(
      strokeMask([
        [
          [-2, 0],
          [2, 0],
        ],
        [
          [0, 0],
          [0, 2],
        ],
      ]),
      HALF_WIDTH,
    );

    expect(paths).toHaveLength(2);
    const across = paths.find((path) => Math.abs(ends(path)[0][0] - ends(path)[1][0]) > 3.5)!;
    const up = paths.find((path) => path !== across)!;
    along(across).forEach((p) => expect(Math.abs(p.y)).toBeLessThan(0.5 * HALF_WIDTH));
    along(up).forEach((p) => expect(Math.abs(p.x)).toBeLessThan(0.5 * HALF_WIDTH));
    // It reaches the other stroke's middle.
    expect(Math.min(...ends(up).map(([, y]) => y))).toBeLessThan(HALF_WIDTH);
  });

  it("makes a sharp turn a corner point", () => {
    const paths = maskCenterLines(
      strokeMask([
        [
          [-2, 0],
          [0, 2],
          [2, 0],
        ],
      ]),
      HALF_WIDTH,
    );

    expect(paths).toHaveLength(1);
    const peak = paths[0].points.reduce((top, point) => (point.position[1] > top.position[1] ? point : top));
    expect(peak.mode).toBe("corner");
    expect(peak.position[1]).toBeGreaterThan(2 - HALF_WIDTH);
  });

  it("finds nothing in an empty grid", () => {
    expect(maskCenterLines({ cells: new Uint8Array(100), cols: 10, rows: 10, cell: 1, originX: 0, originY: 0 }, 1)).toEqual([]);
  });
});

describe("shapeCenterLines", () => {
  it("finds a bar's middle and its half-width", () => {
    const bar: ShapeData = { regions: [{ outline: polygon([[-2, -0.2], [2, -0.2], [2, 0.2], [-2, 0.2]]), holes: [] }] };
    const { paths, radius } = shapeCenterLines(bar);

    expect(paths).toHaveLength(1);
    expect(radius).toBeCloseTo(0.2, 2);
    along(paths[0]).forEach((p) => expect(Math.abs(p.y)).toBeLessThan(0.02));
    // The square ends' corners don't make extra branches, and the round cap reaches the end.
    const [start, end] = ends(paths[0]);
    expect(start[0]).toBeLessThan(-1.6);
    expect(end[0]).toBeGreaterThan(1.6);
  });

  it("turns a ring (an outline with a hole) into one closed path through the middle", () => {
    const ring: ShapeData = { regions: [{ outline: circle(2), holes: [circle(1.6)] }] };
    const { paths, radius } = shapeCenterLines(ring);

    expect(paths).toHaveLength(1);
    expect(paths[0].closed).toBe(true);
    expect(radius).toBeCloseTo(0.2, 2);
    along(paths[0]).forEach((p) => expect(Math.abs(Math.hypot(p.x, p.y) - 1.8)).toBeLessThan(0.03));
  });

  it("finds each region's strokes", () => {
    const two: ShapeData = {
      regions: [
        { outline: polygon([[-3, -0.1], [-1, -0.1], [-1, 0.1], [-3, 0.1]]), holes: [] },
        { outline: polygon([[1, -0.1], [3, -0.1], [3, 0.1], [1, 0.1]]), holes: [] },
      ],
    };
    const { paths } = shapeCenterLines(two);

    expect(paths).toHaveLength(2);
    // Left to right.
    expect(paths[0].points[0].position[0]).toBeLessThan(paths[1].points[0].position[0]);
  });

  it("is empty for a shape with no area", () => {
    expect(shapeCenterLines({ regions: [] })).toEqual({ paths: [], radius: 0 });
  });
});
