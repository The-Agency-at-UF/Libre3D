import * as THREE from "three";
import { describe, expect, it } from "vitest";
import { buildPathCurve, type PathData, type PathPoint } from "./pathGeometry";
import {
  appendPoint,
  deletePoint,
  deletePoints,
  dragOutHandles,
  drawingPlane,
  insertPoint,
  mirrorHandle,
  moveHandle,
  movePoint,
  nearestAxis,
  nearestOnCurve,
  nearestScreenPoint,
  projectOntoPlane,
  setPointMode,
  setPointModes,
  shiftPoints,
  visibleHandles,
} from "./pathEditing";

const corner = (position: [number, number, number]): PathPoint => ({ position, handleIn: [0, 0, 0], handleOut: [0, 0, 0], mode: "corner" });

const smooth = (position: [number, number, number], handleOut: [number, number, number]): PathPoint => ({
  position,
  handleIn: [-handleOut[0], -handleOut[1], -handleOut[2]],
  handleOut,
  mode: "smooth",
});

const expectTuple = (actual: number[], expected: number[]) => {
  expect(actual).toHaveLength(expected.length);
  actual.forEach((value, index) => expect(value).toBeCloseTo(expected[index], 6));
};

const expectVector = (actual: THREE.Vector3, expected: [number, number, number]) => expectTuple(actual.toArray(), expected);

// An S: two arcs, like the Add menu's sample.
const wave = (): PathData => ({
  points: [smooth([-1, 0, 0], [0, 0.8, 0]), smooth([0, 0, 0], [0, -0.8, 0]), smooth([1, 0, 0], [0, 0.8, 0])],
  closed: false,
});

describe("nearestAxis / drawingPlane", () => {
  it("faces the world axis nearest the view", () => {
    // The default camera at (0, 5, 10) looking at the origin: mostly along -Z, so front (XY).
    const front = new THREE.Vector3(0, -5, -10).normalize();
    expectVector(nearestAxis(front), [0, 0, 1]);
    expectVector(nearestAxis(new THREE.Vector3(0.1, -1, 0.2).normalize()), [0, 1, 0]); // top
    expectVector(nearestAxis(new THREE.Vector3(-1, 0.3, 0.3).normalize()), [1, 0, 0]); // side
  });

  it("uses a path's own axes when given its rotation", () => {
    // Turned 90° about Y, the path's own Z points along world X: looking along X faces it.
    const rotation = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI / 2);
    expectVector(nearestAxis(new THREE.Vector3(-1, 0, 0), rotation), [1, 0, 0]);
  });

  it("puts the plane through the given point", () => {
    const plane = drawingPlane(new THREE.Vector3(0, 0, -1), new THREE.Vector3(2, 3, 4));
    expectVector(plane.normal, [0, 0, 1]);
    expect(plane.distanceToPoint(new THREE.Vector3(-7, 9, 4))).toBeCloseTo(0, 9);
  });
});

describe("projectOntoPlane", () => {
  it("finds where the cursor's ray meets the plane", () => {
    const plane = drawingPlane(new THREE.Vector3(0, 0, -1), new THREE.Vector3(0, 0, 1));
    const ray = new THREE.Ray(new THREE.Vector3(0, 0, 10), new THREE.Vector3(0.1, 0.2, -1).normalize());
    expectVector(projectOntoPlane(ray, plane)!, [0.9, 1.8, 1]);
  });

  it("is null for a plane behind the camera", () => {
    const plane = drawingPlane(new THREE.Vector3(0, 0, -1), new THREE.Vector3(0, 0, 20));
    expect(projectOntoPlane(new THREE.Ray(new THREE.Vector3(0, 0, 10), new THREE.Vector3(0, 0, -1)), plane)).toBeNull();
  });
});

describe("drawing edits", () => {
  it("appends corner points without changing the path passed in", () => {
    const path: PathData = { points: [corner([0, 0, 0])], closed: false };
    const next = appendPoint(path, [1, 2, 0]);

    expect(path.points).toHaveLength(1);
    expect(next.points[1]).toEqual(corner([1, 2, 0]));
  });

  it("drags out mirrored handles of equal length, and back to a corner", () => {
    const path: PathData = { points: [corner([0, 0, 0]), corner([1, 0, 0])], closed: false };
    const dragged = dragOutHandles(path, 1, [0.5, 0.5, 0]);

    expect(dragged.points[1]).toEqual({ position: [1, 0, 0], handleIn: [-0.5, -0.5, -0], handleOut: [0.5, 0.5, 0], mode: "smooth" });
    expect(path.points[1].mode).toBe("corner");
    expect(dragOutHandles(dragged, 1, [0, 0, 0]).points[1]).toEqual(corner([1, 0, 0]));
  });

  it("moves a point with its handles", () => {
    const moved = movePoint(wave(), 1, [0, 0, 0.3]);
    expect(moved.points[1]).toEqual({ ...wave().points[1], position: [0, 0, 0.3] });
  });
});

describe("handle mirroring", () => {
  it("keeps the other handle opposite, at its own length", () => {
    expectTuple(mirrorHandle([2, 0, 0], [0, 0.5, 0]), [-0.5, 0, 0]);
  });

  it("gives an other handle with no length the moved one's", () => {
    expectTuple(mirrorHandle([0, 0.3, 0.4], [0, 0, 0]), [0, -0.3, -0.4]);
  });

  it("leaves the other handle alone when the moved one has no length", () => {
    expectTuple(mirrorHandle([0, 0, 0], [0.2, 0, 0]), [0.2, 0, 0]);
  });

  it("moves a smooth point's other handle with it", () => {
    const next = moveHandle(wave(), 1, "in", [-1, 0, 0]);
    expect(next.points[1].handleIn).toEqual([-1, 0, 0]);
    expectTuple(next.points[1].handleOut, [0.8, 0, 0]);
    expect(next.points[1].mode).toBe("smooth");
  });

  it("breaks the mirror on Alt: only that handle moves, and the point becomes a corner", () => {
    const next = moveHandle(wave(), 1, "out", [1, 0, 0], true);
    expect(next.points[1]).toEqual({ position: [0, 0, 0], handleIn: [-0, 0.8, -0], handleOut: [1, 0, 0], mode: "corner" });
  });

  it("moves only that handle on a corner", () => {
    const path = moveHandle(wave(), 1, "out", [1, 0, 0], true);
    const next = moveHandle(path, 1, "in", [0, 1, 0]);
    expect(next.points[1].handleOut).toEqual([1, 0, 0]);
    expect(next.points[1].mode).toBe("corner");
  });
});

describe("deletePoint", () => {
  it("joins the neighbours, keeping their handles", () => {
    const next = deletePoint(wave(), 1);
    expect(next.points).toEqual([wave().points[0], wave().points[2]]);
    expect(wave().points).toHaveLength(3);
  });

  it("opens a closed path left with fewer than three points", () => {
    const closed: PathData = { points: [corner([0, 0, 0]), corner([1, 0, 0]), corner([0, 1, 0])], closed: true };
    expect(deletePoint(closed, 0).closed).toBe(false);
    expect(deletePoint({ ...closed, points: [...closed.points, corner([1, 1, 0])] }, 0).closed).toBe(true);
  });
});

describe("insertPoint", () => {
  const samplesOf = (path: PathData) => buildPathCurve(path)!.getSpacedPoints(64);

  it("splits a segment without changing the curve's shape", () => {
    const { path, index } = insertPoint(wave(), 0, 0.3);
    expect(index).toBe(1);
    expect(path.points).toHaveLength(4);
    expect(path.points[1].mode).toBe("smooth");
    // The same curve, sampled by length.
    samplesOf(path).forEach((point, i) => expect(point.distanceTo(samplesOf(wave())[i])).toBeLessThan(1e-3));
  });

  it("puts the new point on the curve, with its handles on one line", () => {
    const original = buildPathCurve(wave())!.curves[1].getPoint(0.5);
    const { path } = insertPoint(wave(), 1, 0.5);
    const point = path.points[2];
    expectTuple(point.position, original.toArray());
    const handleIn = new THREE.Vector3(...point.handleIn);
    const handleOut = new THREE.Vector3(...point.handleOut);
    expect(handleIn.clone().normalize().dot(handleOut.clone().normalize())).toBeCloseTo(-1, 6);
  });

  it("splits a straight segment into a straight line", () => {
    const line: PathData = { points: [corner([0, 0, 0]), corner([3, 0, 0])], closed: false };
    const { path } = insertPoint(line, 0, 0.5);
    expectTuple(path.points[1].position, [1.5, 0, 0]);
    expectTuple(path.points[1].handleIn.map((value) => (Math.abs(value) < 1e-9 ? 0 : Math.sign(value))), [-1, 0, 0]);
    expect(path.points[0].handleOut).toEqual([0, 0, 0]);
  });

  it("splits a closed path's last segment, back to the first point", () => {
    const square: PathData = { points: [corner([0, 0, 0]), corner([1, 0, 0]), corner([1, 1, 0]), corner([0, 1, 0])], closed: true };
    const { path, index } = insertPoint(square, 3, 0.5);
    expect(index).toBe(4);
    expectTuple(path.points[4].position, [0, 0.5, 0]);
  });

  it("ignores a segment that isn't there", () => {
    expect(insertPoint(wave(), 2, 0.5)).toEqual({ path: wave(), index: -1 });
  });
});

describe("setPointMode", () => {
  it("pulls a corner's handles in", () => {
    expect(setPointMode(wave(), 1, "corner").points[1]).toEqual(corner([0, 0, 0]));
  });

  it("gives a point with no handles smooth ones, from its previous neighbour to its next", () => {
    const zigzag: PathData = { points: [corner([0, 0, 0]), corner([1, 1, 0]), corner([3, 0, 0])], closed: false };
    const point = setPointMode(zigzag, 1, "smooth").points[1];
    expect(point.mode).toBe("smooth");
    // From (0, 0) to (3, 0): along X, each handle a third of the way to its neighbour.
    expectTuple(point.handleOut, [Math.sqrt(5) / 3, 0, 0]);
    expectTuple(point.handleIn, [-Math.SQRT2 / 3, 0, 0]);
  });

  it("gives an open path's end handles toward its one neighbour", () => {
    const line: PathData = { points: [corner([0, 0, 0]), corner([3, 0, 0])], closed: false };
    const point = setPointMode(line, 0, "smooth").points[0];
    expectTuple(point.handleOut, [1, 0, 0]);
    expectTuple(point.handleIn, [-1, 0, 0]);
  });

  it("lines up a broken corner's handles, keeping their lengths", () => {
    const broken: PathData = { points: [corner([-1, 0, 0]), { position: [0, 0, 0], handleIn: [0, 2, 0], handleOut: [2, 0, 0], mode: "corner" }], closed: false };
    const point = setPointMode(broken, 1, "smooth").points[1];
    const direction = new THREE.Vector3(1, -1, 0).normalize();
    expectVector(new THREE.Vector3(...point.handleOut), direction.clone().multiplyScalar(2).toArray());
    expectVector(new THREE.Vector3(...point.handleIn), direction.clone().multiplyScalar(-2).toArray());
  });
});

describe("visibleHandles", () => {
  it("shows the handles of the segments on each side of the picked point", () => {
    expect(visibleHandles(wave(), [1])).toEqual([
      { index: 0, side: "out" },
      { index: 1, side: "in" },
      { index: 1, side: "out" },
      { index: 2, side: "in" },
    ]);
  });

  it("shows one segment's handles at an open path's ends, and wraps round a closed one", () => {
    expect(visibleHandles(wave(), [0])).toEqual([
      { index: 0, side: "out" },
      { index: 1, side: "in" },
    ]);
    expect(visibleHandles({ ...wave(), closed: true }, [0])).toEqual([
      { index: 2, side: "out" },
      { index: 0, side: "in" },
      { index: 0, side: "out" },
      { index: 1, side: "in" },
    ]);
  });

  it("leaves out handles with no length, and shows nothing with no point picked", () => {
    expect(visibleHandles(setPointMode(wave(), 0, "corner"), [0])).toEqual([{ index: 1, side: "in" }]);
    expect(visibleHandles(wave(), [])).toEqual([]);
  });

  it("shows the handles of every picked point, each one once", () => {
    const shown = visibleHandles(wave(), [1, 2]);
    const keys = shown.map(({ index, side }) => `${index}-${side}`);
    expect(new Set(keys).size).toBe(keys.length);
    expect(shown).toEqual(expect.arrayContaining([...visibleHandles(wave(), [1]), ...visibleHandles(wave(), [2])]));
  });
});

describe("editing a selection of points", () => {
  it("moves each picked point by the same delta, with its handles, and leaves the rest alone", () => {
    const path = wave();
    const next = shiftPoints(path, [0, 2], [1, 0, -1]);
    const [x, y, z] = path.points[0].position;
    expect(next.points[0].position).toEqual([x + 1, y, z - 1]);
    expect(next.points[0].handleOut).toEqual(path.points[0].handleOut);
    expect(next.points[1]).toEqual(path.points[1]);
    expect(path.points[0].position).toEqual([x, y, z]);
  });

  it("deletes every picked point at once", () => {
    const path = wave();
    expect(deletePoints(path, [0, 1]).points).toEqual(path.points.slice(2));
  });

  it("sets every picked point to the same mode", () => {
    const next = setPointModes(wave(), [0, 1], "corner");
    expect(next.points[0].mode).toBe("corner");
    expect(next.points[1].mode).toBe("corner");
  });
});

describe("picking on screen", () => {
  it("finds the nearest point within the radius", () => {
    const points = [new THREE.Vector2(0, 0), null, new THREE.Vector2(10, 0), new THREE.Vector2(13, 0)];
    expect(nearestScreenPoint(points, new THREE.Vector2(12, 1), 6)).toBe(3);
    expect(nearestScreenPoint(points, new THREE.Vector2(40, 0), 6)).toBeNull();
  });

  it("finds the place on the curve under the cursor", () => {
    // Seen from the front, 100 pixels a unit, Y down.
    const toScreen = (point: THREE.Vector3) => new THREE.Vector2(point.x * 100, -point.y * 100);
    const onCurve = buildPathCurve(wave())!.curves[1].getPoint(0.37);
    const hit = nearestOnCurve(wave(), toScreen, toScreen(onCurve), 6)!;
    expect(hit.segment).toBe(1);
    expect(hit.t).toBeCloseTo(0.37, 3);
    expect(hit.point.distanceTo(onCurve)).toBeLessThan(1e-4);
    expect(hit.distance).toBeLessThan(0.01);
    expect(nearestOnCurve(wave(), toScreen, new THREE.Vector2(0, -300), 6)).toBeNull();
  });
});
