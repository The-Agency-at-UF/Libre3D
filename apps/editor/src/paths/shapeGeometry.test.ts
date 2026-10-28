import * as THREE from "three";
import { describe, expect, it } from "vitest";
import type { PathData } from "./pathGeometry";
import { buildShapeGeometry, removeContour, replaceContour, shapeContours, type ShapeData } from "./shapeGeometry";

// A closed square of straight segments, centred on (cx, cy).
const square = (size: number, cx = 0, cy = 0): PathData => ({
  points: [
    [-1, -1],
    [1, -1],
    [1, 1],
    [-1, 1],
  ].map(([x, y]) => ({
    position: [cx + (x * size) / 2, cy + (y * size) / 2, 0] as [number, number, number],
    handleIn: [0, 0, 0] as [number, number, number],
    handleOut: [0, 0, 0] as [number, number, number],
    mode: "corner" as const,
  })),
  closed: true,
});

// The area a geometry's triangles cover in XY, for faces facing +Z.
const frontArea = (geometry: THREE.BufferGeometry) => {
  const position = geometry.getAttribute("position");
  const index = geometry.getIndex();
  const count = index ? index.count : position.count;
  const vertex = (i: number) => new THREE.Vector3().fromBufferAttribute(position, index ? index.getX(i) : i);
  let area = 0;
  for (let i = 0; i < count; i += 3) {
    const [a, b, c] = [vertex(i), vertex(i + 1), vertex(i + 2)];
    const cross = b.clone().sub(a).cross(c.clone().sub(a));
    if (cross.z > 1e-9) area += cross.z / 2;
  }
  return area;
};

const frame: ShapeData = { regions: [{ outline: square(4), holes: [square(2)] }] };

describe("buildShapeGeometry", () => {
  it("fills the outline and leaves its holes empty", () => {
    expect(frontArea(buildShapeGeometry(frame))).toBeCloseTo(16 - 4, 6);
  });

  it("fills each region", () => {
    const two: ShapeData = { regions: [{ outline: square(1, -3), holes: [] }, { outline: square(2, 3), holes: [] }] };
    expect(frontArea(buildShapeGeometry(two))).toBeCloseTo(1 + 4, 6);
  });

  it("is flat in XY without an extrusion or bevel", () => {
    const geometry = buildShapeGeometry(frame);
    geometry.computeBoundingBox();
    expect(geometry.boundingBox!.min.z).toBe(0);
    expect(geometry.boundingBox!.max.z).toBe(0);
  });

  it("extrudes centred on Z = 0", () => {
    const geometry = buildShapeGeometry(frame, { extrusion: 0.5, bevel: 0 });
    geometry.computeBoundingBox();
    expect(geometry.boundingBox!.min.z).toBeCloseTo(-0.25, 6);
    expect(geometry.boundingBox!.max.z).toBeCloseTo(0.25, 6);
    expect(geometry.boundingBox!.max.x).toBeCloseTo(2, 6);
  });

  it("grows the outline by the bevel", () => {
    const geometry = buildShapeGeometry(frame, { extrusion: 0.5, bevel: 0.1 });
    geometry.computeBoundingBox();
    expect(geometry.boundingBox!.max.x).toBeCloseTo(2.1, 6);
    expect(geometry.boundingBox!.max.z).toBeCloseTo(0.35, 6);
  });

  it("draws nothing for an outline under three points", () => {
    const thin: ShapeData = { regions: [{ outline: { ...square(1), points: square(1).points.slice(0, 2) }, holes: [] }] };
    expect(buildShapeGeometry(thin).getAttribute("position").count).toBe(0);
  });
});

describe("shape contours", () => {
  const shape: ShapeData = {
    regions: [
      { outline: square(4), holes: [square(1, -1), square(1, 1)] },
      { outline: square(1, 5), holes: [] },
    ],
  };

  it("counts each region's outline, then its holes", () => {
    expect(shapeContours(shape)).toEqual([square(4), square(1, -1), square(1, 1), square(1, 5)]);
  });

  it("replaces one contour by that index", () => {
    const replaced = replaceContour(shape, 2, square(3));
    expect(replaced.regions[0].holes[1]).toEqual(square(3));
    expect(replaced.regions[1].outline).toEqual(square(1, 5));
  });

  it("removes a hole, or an outline with its holes", () => {
    expect(removeContour(shape, 1)!.regions[0].holes).toEqual([square(1, 1)]);
    expect(removeContour(shape, 0)!.regions).toEqual([{ outline: square(1, 5), holes: [] }]);
    expect(removeContour({ regions: [{ outline: square(1), holes: [] }] }, 0)).toBeNull();
  });
});
