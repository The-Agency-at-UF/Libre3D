import * as THREE from "three";
import { describe, expect, it } from "vitest";
import {
  buildPathCurve,
  capPose,
  clonePath,
  createCapGeometry,
  createSamplePath,
  drawRangeFor,
  hasCaps,
  MAX_SEGMENTS,
  pathsCenter,
  RADIAL_SEGMENTS,
  trimToRings,
  tubeSegmentsFor,
  type CapStyle,
  type PathData,
  type PathPoint,
} from "./pathGeometry";

const point = (position: [number, number, number], handleOut: [number, number, number] = [0, 0, 0]): PathPoint => ({
  position,
  handleIn: [-handleOut[0], -handleOut[1], -handleOut[2]],
  handleOut,
  mode: "smooth",
});

const expectVector = (actual: THREE.Vector3, expected: [number, number, number]) => {
  expect(actual.x).toBeCloseTo(expected[0], 6);
  expect(actual.y).toBeCloseTo(expected[1], 6);
  expect(actual.z).toBeCloseTo(expected[2], 6);
};

describe("buildPathCurve", () => {
  it("joins each point to the next with a cubic Bézier through its handles", () => {
    const path: PathData = { points: [point([0, 0, 0], [1, 0, 0]), point([3, 0, 0], [0, 1, 0])], closed: false };
    const curve = buildPathCurve(path)!;

    expect(curve.curves).toHaveLength(1);
    const segment = curve.curves[0] as THREE.CubicBezierCurve3;
    expectVector(segment.v0, [0, 0, 0]);
    expectVector(segment.v1, [1, 0, 0]); // the first point's handle out, from its position
    expectVector(segment.v2, [3, -1, 0]); // the second point's handle in
    expectVector(segment.v3, [3, 0, 0]);
  });

  it("adds a segment from the last point back to the first when closed", () => {
    const points = [point([0, 0, 0]), point([1, 0, 0]), point([1, 1, 0])];
    const open = buildPathCurve({ points, closed: false })!;
    const closed = buildPathCurve({ points, closed: true })!;

    expect(open.curves).toHaveLength(2);
    expect(closed.curves).toHaveLength(3);
    expectVector(closed.getPointAt(1), [0, 0, 0]);
    expect(closed.getLength()).toBeCloseTo(2 + Math.SQRT2, 6);
  });

  it("is null when there's nothing to draw", () => {
    expect(buildPathCurve({ points: [], closed: false })).toBeNull();
    expect(buildPathCurve({ points: [point([1, 2, 3])], closed: false })).toBeNull();
    expect(buildPathCurve({ points: [point([1, 2, 3]), point([1, 2, 3])], closed: false })).toBeNull();
  });

  it("draws the sample path as two half circles of radius 0.6", () => {
    const curve = buildPathCurve(createSamplePath())!;

    expectVector(curve.getPointAt(0), [-1.2, 0, 0]);
    expectVector(curve.getPointAt(1), [1.2, 0, 0]);
    expect(curve.getPointAt(0.25).y).toBeCloseTo(0.6, 2); // top of the first arc
    expect(curve.getPointAt(0.75).y).toBeCloseTo(-0.6, 2); // bottom of the second
    expect(curve.getLength()).toBeCloseTo(2 * Math.PI * 0.6, 1);
  });
});

describe("pathsCenter", () => {
  // An arch whose handles reach y = 1 but whose curve tops out at 0.75 (halfway along).
  const arch: PathData = { points: [point([0, 0, 0], [0, 1, 0]), point([2, 0, 0], [0, -1, 0])], closed: false };

  it("is the middle of the box round the curves, not their handles", () => {
    const [x, y, z] = pathsCenter([arch])!;
    expect([x, y, z]).toEqual([1, expect.closeTo(0.375, 6), 0]);
  });

  it("takes the box round all the paths", () => {
    const line: PathData = { points: [point([0, -1, 0]), point([4, -1, 0])], closed: false };
    const [x, y] = pathsCenter([arch, line])!;
    expect(x).toBeCloseTo(2, 6);
    expect(y).toBeCloseTo(-0.125, 6);
  });

  it("is null when nothing draws", () => {
    expect(pathsCenter([])).toBeNull();
    expect(pathsCenter([{ points: [point([1, 2, 3])], closed: false }])).toBeNull();
  });
});

describe("clonePath", () => {
  it("copies every point's vectors", () => {
    const path = createSamplePath();
    const copy = clonePath(path);

    expect(copy).toEqual(path);
    expect(copy.points[0].position).not.toBe(path.points[0].position);
    expect(copy.points[0].handleIn).not.toBe(path.points[0].handleIn);
    expect(copy.points[0].handleOut).not.toBe(path.points[0].handleOut);
  });
});

describe("tubeSegmentsFor", () => {
  it("gives longer paths more segments, within limits", () => {
    expect(tubeSegmentsFor(1)).toBe(64);
    expect(tubeSegmentsFor(2)).toBe(128);
    expect(tubeSegmentsFor(0.01)).toBe(8);
    expect(tubeSegmentsFor(1000)).toBe(MAX_SEGMENTS);
  });
});

describe("trimToRings", () => {
  it("draws every ring at 0–1", () => {
    expect(trimToRings(0, 1, 100)).toEqual({ start: 0, end: 100 });
  });

  it("snaps to the nearest ring", () => {
    expect(trimToRings(0.123, 0.876, 100)).toEqual({ start: 12, end: 88 });
  });

  it("clamps to 0–1 and treats a missing number as the whole path", () => {
    expect(trimToRings(-0.5, 2, 100)).toEqual({ start: 0, end: 100 });
    expect(trimToRings(Number.NaN, Number.NaN, 100)).toEqual({ start: 0, end: 100 });
  });

  it("draws nothing when the ends meet or the start is past the end", () => {
    expect(trimToRings(0, 0, 100)).toEqual({ start: 0, end: 0 });
    expect(trimToRings(0.7, 0.3, 100)).toEqual({ start: 70, end: 70 });
  });
});

describe("drawRangeFor", () => {
  it("covers six indices per quad, one ring of quads per segment", () => {
    expect(drawRangeFor({ start: 2, end: 5 })).toEqual({ start: 2 * RADIAL_SEGMENTS * 6, count: 3 * RADIAL_SEGMENTS * 6 });
    expect(drawRangeFor({ start: 4, end: 4 }).count).toBe(0);
  });

  it("matches how TubeGeometry lays out its index buffer", () => {
    const tube = new THREE.TubeGeometry(buildPathCurve(createSamplePath())!, 10, 0.1, RADIAL_SEGMENTS, false);
    const index = tube.getIndex()!;
    const range = drawRangeFor({ start: 3, end: 4 });
    const ringOf = (vertex: number) => Math.floor(vertex / (RADIAL_SEGMENTS + 1));

    const rings = new Set<number>();
    for (let i = range.start; i < range.start + range.count; i += 1) rings.add(ringOf(index.getX(i)));
    expect([...rings].sort()).toEqual([3, 4]); // segment 3 joins ring 3 to ring 4
    expect(drawRangeFor({ start: 0, end: 10 }).count).toBe(index.count);
  });
});

describe("hasCaps", () => {
  it("has caps while anything is drawn", () => {
    expect(hasCaps({ start: 0, end: 100 }, 100, false)).toBe(true);
    expect(hasCaps({ start: 0, end: 1 }, 100, false)).toBe(true);
    expect(hasCaps({ start: 50, end: 50 }, 100, false)).toBe(false);
  });

  it("has none on a closed path drawn all the way round, but does once it's trimmed", () => {
    expect(hasCaps({ start: 0, end: 100 }, 100, true)).toBe(false);
    expect(hasCaps({ start: 0, end: 60 }, 100, true)).toBe(true);
  });
});

describe("capPose and createCapGeometry", () => {
  const radius = 0.2;
  // A bent 3D path, so the frames aren't lined up with the axes.
  const path: PathData = {
    points: [point([0, 0, 0], [0.5, 0.5, 0.2]), point([1.5, 0.5, -0.5], [0.3, -0.6, 0.4]), point([2, -1, 1], [0, -0.5, 0.5])],
    closed: false,
  };
  const segments = 40;
  const tube = new THREE.TubeGeometry(buildPathCurve(path)!, segments, radius, RADIAL_SEGMENTS, false);

  const ringVertices = (ring: number) =>
    Array.from({ length: RADIAL_SEGMENTS }, (_, j) => ({
      position: new THREE.Vector3().fromBufferAttribute(tube.getAttribute("position"), ring * (RADIAL_SEGMENTS + 1) + j),
      normal: new THREE.Vector3().fromBufferAttribute(tube.getAttribute("normal"), ring * (RADIAL_SEGMENTS + 1) + j),
    }));

  // The cap's vertices on its rim (y = 0, at the radius), placed on the ring.
  const capRim = (style: CapStyle, ring: number, isStart: boolean) => {
    const geometry = createCapGeometry({ radius, caps: style });
    const pose = capPose(tube, ring, isStart);
    const matrix = new THREE.Matrix4().compose(pose.position, pose.quaternion, new THREE.Vector3(1, 1, 1));
    const normalMatrix = new THREE.Matrix3().getNormalMatrix(matrix);
    const rim = [];
    for (let i = 0; i < geometry.getAttribute("position").count; i += 1) {
      const local = new THREE.Vector3().fromBufferAttribute(geometry.getAttribute("position"), i);
      if (Math.abs(local.y) > 1e-6 || Math.abs(local.length() - radius) > 1e-6) continue; // float32 data
      rim.push({
        position: local.applyMatrix4(matrix),
        normal: new THREE.Vector3().fromBufferAttribute(geometry.getAttribute("normal"), i).applyMatrix3(normalMatrix).normalize(),
      });
    }
    return rim;
  };

  for (const style of ["round", "flat"] as const) {
    for (const [label, ring, isStart] of [
      ["start", 0, true],
      ["end", segments, false],
      ["trimmed end", 17, false],
      ["trimmed start", 23, true],
    ] as const) {
      it(`puts a ${style} cap's rim exactly on the ${label} ring`, () => {
        const ringPositions = ringVertices(ring).map((vertex) => vertex.position);
        const rim = capRim(style, ring, isStart);

        expect(rim.length).toBeGreaterThanOrEqual(RADIAL_SEGMENTS);
        for (const vertex of rim) {
          const nearest = Math.min(...ringPositions.map((position) => position.distanceTo(vertex.position)));
          expect(nearest).toBeLessThan(1e-5);
        }
      });
    }
  }

  it("points each cap out of the tube", () => {
    const tip = (ring: number, isStart: boolean) => {
      const pose = capPose(tube, ring, isStart);
      return new THREE.Vector3(0, radius, 0).applyQuaternion(pose.quaternion).add(pose.position);
    };
    const curve = buildPathCurve(path)!;

    // The start cap's tip is behind the path's start, the end cap's ahead of its end.
    expect(tip(0, true).sub(curve.getPointAt(0)).dot(curve.getTangentAt(0))).toBeCloseTo(-radius, 3);
    expect(tip(segments, false).sub(curve.getPointAt(1)).dot(curve.getTangentAt(1))).toBeCloseTo(radius, 3);
  });

  it("gives a round cap the tube's normals at the rim, so the join is smooth", () => {
    const ring = ringVertices(segments);
    for (const vertex of capRim("round", segments, false)) {
      const match = ring.find((candidate) => candidate.position.distanceTo(vertex.position) < 1e-5)!;
      expect(match.normal.dot(vertex.normal)).toBeCloseTo(1, 5);
    }
  });
});
