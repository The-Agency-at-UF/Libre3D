/**
 * PURPOSE: Finds the strokes a filled shape was drawn with (Convert to Path): the line along the
 * middle of each stroke, as paths, and how thick the strokes are, as a tube radius. Lettering
 * converted to outlines becomes a tube along each stroke that writes on in the pen's direction.
 *
 * INPUT: A shape's regions (paths/shapeGeometry.ts), in its own XY plane.
 * OUTPUT: Open or closed paths in the same space (Z = 0), and the strokes' half-width.
 *
 * How:
 * 1. Rasterise the filled outline (even-odd, so holes stay empty) on a grid about eight cells across
 *    a stroke. The stroke's half-width is first estimated as area / perimeter, which is exact for a
 *    long even stroke (area = 2w · length, perimeter = 2 · length).
 * 2. Thin it to a one-cell skeleton (Zhang–Suen), which runs along the middle of every stroke.
 * 3. Make the skeleton a graph: ends, junctions, and the branches between them. Short spurs (the
 *    thinning forks into the corners of a square end) are pruned, and junctions closer than a stroke
 *    width are merged: a crossing thins into two nearby forks, which become one X again.
 * 4. Pair the branches at each junction that continue each other (the most nearly opposite
 *    directions, measured away from the junction where the thinning is bent), so a stroke goes
 *    straight through a crossing: a cursive loop stays one stroke. A branch left over (a stroke
 *    ending on another) ends there.
 * 5. Follow the pairs into strokes, each starting at its left end (where writing starts), smooth
 *    away the grid's staircase, and fit cubic Béziers to them (Schneider's algorithm), splitting at
 *    sharp turns, which become corner points.
 * 6. The radius is the median distance from the strokes to the outline, away from ends and
 *    junctions. A tube has one radius, so a stroke whose width varies gets its typical width.
 *
 * Nothing here depends on the store, React, or the DOM.
 */

import * as THREE from "three";
import type { PathData, PathPoint } from "./pathGeometry";
import type { ShapeData } from "./shapeGeometry";

type Vector = [number, number, number];

export interface CenterLines {
  paths: PathData[];
  radius: number; // the strokes' half-width
}

const SAMPLES_PER_SEGMENT = 16; // when the outline is turned into a polygon
const CELLS_PER_HALF_WIDTH = 4;
const MAX_CELLS = 1_500_000;
const PAD = 2; // empty cells around the shape, so the thinning never reaches the edge of the grid
const SPUR_LENGTH = 2.5; // half-widths: a dead end this short off a junction is a thinning artefact
const MERGE_LENGTH = 2.5; // half-widths: junctions this close are one crossing
const DIRECTION_FROM = 1.5; // half-widths from a junction where a branch's direction is measured…
const DIRECTION_TO = 5; // …to here, past where the thinning bends into the junction
const PAIR_DOT = -0.35; // branches pair only when they leave a junction this nearly opposite (about 110°)
const JUNCTION_GAP = 2; // half-widths of skeleton dropped either side of a crossing (the node stays)
const SMOOTHING_PASSES = 4;
const FIT_TOLERANCE = 0.12; // half-widths a fitted curve may stray from the stroke
const CORNER_ANGLE = (75 * Math.PI) / 180; // a turn sharper than this over two stroke widths may be a corner…
const CORNER_CONCENTRATION = 0.65; // …when this much of it is within one stroke width
const CORNER_SPAN = 2; // half-widths either side over which a turn is measured (and twice that)
const SMOOTH_DOT = -Math.cos((3 * Math.PI) / 180);
const MAX_RECENTRE = 0.6; // half-widths: recentring never moves a point further (it'd be another stroke)
const MAX_WIDTH_RATIO = 1.8; // a point measures at most this many half-widths across, or it's not mid-stroke

// -- The outline as polygons -------------------------------------------------------------------

type Point = { x: number; y: number };

const contourPolygon = (contour: PathData): Point[] => {
  const { points } = contour;
  const polygon: Point[] = [];
  points.forEach((from, i) => {
    const to = points[(i + 1) % points.length];
    const p0 = from.position;
    const c1: Vector = [p0[0] + from.handleOut[0], p0[1] + from.handleOut[1], 0];
    const p3 = to.position;
    const c2: Vector = [p3[0] + to.handleIn[0], p3[1] + to.handleIn[1], 0];
    for (let s = 0; s < SAMPLES_PER_SEGMENT; s += 1) {
      const t = s / SAMPLES_PER_SEGMENT;
      const u = 1 - t;
      const a = u * u * u;
      const b = 3 * u * u * t;
      const c = 3 * u * t * t;
      const d = t * t * t;
      polygon.push({ x: a * p0[0] + b * c1[0] + c * c2[0] + d * p3[0], y: a * p0[1] + b * c1[1] + c * c2[1] + d * p3[1] });
    }
  });
  return polygon;
};

const polygonArea = (polygon: Point[]) => {
  let twice = 0;
  polygon.forEach((p, i) => {
    const q = polygon[(i + 1) % polygon.length];
    twice += p.x * q.y - q.x * p.y;
  });
  return Math.abs(twice) / 2;
};

const polygonPerimeter = (polygon: Point[]) =>
  polygon.reduce((sum, p, i) => {
    const q = polygon[(i + 1) % polygon.length];
    return sum + Math.hypot(q.x - p.x, q.y - p.y);
  }, 0);

// -- The grid ------------------------------------------------------------------------------------

/** A filled grid: cell (c, r) has its centre at (originX + (c + 0.5) · cell, originY + (r + 0.5) · cell). */
export interface Mask {
  cells: Uint8Array; // 1 = filled, row by row
  cols: number;
  rows: number;
  cell: number;
  originX: number;
  originY: number;
}

// Even-odd scanline fill at each row's centre line, so holes (and overlaps drawn as holes) stay empty.
const rasterise = (polygons: Point[][], cell: number): Mask => {
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  polygons.flat().forEach(({ x, y }) => {
    minX = Math.min(minX, x);
    minY = Math.min(minY, y);
    maxX = Math.max(maxX, x);
    maxY = Math.max(maxY, y);
  });
  const originX = minX - PAD * cell;
  const originY = minY - PAD * cell;
  const cols = Math.ceil((maxX - minX) / cell) + 2 * PAD + 1;
  const rows = Math.ceil((maxY - minY) / cell) + 2 * PAD + 1;
  const cells = new Uint8Array(cols * rows);

  const edges = polygons.flatMap((polygon) => polygon.map((a, i) => [a, polygon[(i + 1) % polygon.length]] as const));
  for (let r = 0; r < rows; r += 1) {
    const y = originY + (r + 0.5) * cell;
    const crossings: number[] = [];
    edges.forEach(([a, b]) => {
      if ((a.y <= y && b.y > y) || (b.y <= y && a.y > y)) crossings.push(a.x + ((y - a.y) / (b.y - a.y)) * (b.x - a.x));
    });
    crossings.sort((p, q) => p - q);
    for (let i = 0; i + 1 < crossings.length; i += 2) {
      const from = Math.max(0, Math.ceil((crossings[i] - originX) / cell - 0.5));
      const to = Math.min(cols - 1, Math.floor((crossings[i + 1] - originX) / cell - 0.5));
      for (let c = from; c <= to; c += 1) cells[r * cols + c] = 1;
    }
  }
  return { cells, cols, rows, cell, originX, originY };
};

// The eight neighbours, clockwise from north, as (dc, dr).
const NEIGHBOURS = [
  [0, 1],
  [1, 1],
  [1, 0],
  [1, -1],
  [0, -1],
  [-1, -1],
  [-1, 0],
  [-1, 1],
] as const;

/** Zhang–Suen thinning, in place: what's left is one cell wide, along the middle of each stroke. */
const thin = ({ cells, cols, rows }: Mask) => {
  const at = (c: number, r: number) => cells[r * cols + c];
  let changed = true;
  const remove: number[] = [];
  while (changed) {
    changed = false;
    for (const pass of [0, 1]) {
      remove.length = 0;
      for (let r = 1; r < rows - 1; r += 1) {
        for (let c = 1; c < cols - 1; c += 1) {
          if (!at(c, r)) continue;
          const n = NEIGHBOURS.map(([dc, dr]) => at(c + dc, r + dr));
          const count = n[0] + n[1] + n[2] + n[3] + n[4] + n[5] + n[6] + n[7];
          if (count < 2 || count > 6) continue;
          let transitions = 0;
          for (let i = 0; i < 8; i += 1) if (!n[i] && n[(i + 1) % 8]) transitions += 1;
          if (transitions !== 1) continue;
          // n[0] = N, n[2] = E, n[4] = S, n[6] = W.
          if (pass === 0 ? n[0] * n[2] * n[4] || n[2] * n[4] * n[6] : n[0] * n[2] * n[6] || n[0] * n[4] * n[6]) continue;
          remove.push(r * cols + c);
        }
      }
      remove.forEach((index) => {
        cells[index] = 0;
      });
      if (remove.length > 0) changed = true;
    }
  }

  // The thinning leaves L-shaped steps (a cell whose only neighbours are two side by side at a right
  // angle, which already touch diagonally). They'd read as tiny junctions, so they go.
  for (let r = 1; r < rows - 1; r += 1) {
    for (let c = 1; c < cols - 1; c += 1) {
      if (!at(c, r)) continue;
      const n = NEIGHBOURS.map(([dc, dr]) => at(c + dc, r + dr));
      const count = n.reduce<number>((sum, value) => sum + value, 0);
      if (count !== 2) continue;
      if ((n[0] && n[2]) || (n[2] && n[4]) || (n[4] && n[6]) || (n[6] && n[0])) cells[r * cols + c] = 0;
    }
  }
};

// -- The skeleton as a graph -----------------------------------------------------------------------

interface GraphNode {
  position: Point;
  weight: number; // how many cells it was made from, for merging
}

interface GraphEdge {
  a: number; // node indices; -1 for a closed loop with no node
  b: number;
  points: Point[]; // between the nodes, from a towards b (not including the nodes)
  closed: boolean;
}

interface Graph {
  nodes: (GraphNode | null)[]; // null once merged away
  edges: GraphEdge[];
}

const skeletonGraph = (mask: Mask): Graph => {
  const { cells, cols, rows, cell, originX, originY } = mask;
  const centre = (index: number): Point => ({ x: originX + ((index % cols) + 0.5) * cell, y: originY + (Math.floor(index / cols) + 0.5) * cell });
  const neighbours = (index: number) => {
    const c = index % cols;
    const r = Math.floor(index / cols);
    const found: number[] = [];
    NEIGHBOURS.forEach(([dc, dr]) => {
      const nc = c + dc;
      const nr = r + dr;
      if (nc >= 0 && nr >= 0 && nc < cols && nr < rows && cells[nr * cols + nc]) found.push(nr * cols + nc);
    });
    return found;
  };

  // Cells that aren't the middle of a branch (ends and junctions); touching ones are one node.
  const nodeOf = new Int32Array(cells.length).fill(-1);
  const nodes: GraphNode[] = [];
  for (let index = 0; index < cells.length; index += 1) {
    if (!cells[index] || nodeOf[index] !== -1 || neighbours(index).length === 2) continue;
    const id = nodes.length;
    const stack = [index];
    nodeOf[index] = id;
    let sumX = 0;
    let sumY = 0;
    let weight = 0;
    while (stack.length > 0) {
      const current = stack.pop()!;
      const { x, y } = centre(current);
      sumX += x;
      sumY += y;
      weight += 1;
      neighbours(current).forEach((next) => {
        if (nodeOf[next] === -1 && neighbours(next).length !== 2) {
          nodeOf[next] = id;
          stack.push(next);
        }
      });
    }
    nodes.push({ position: { x: sumX / weight, y: sumY / weight }, weight });
  }

  // Branches: walk from each node through the middle cells to the next node.
  const visited = new Uint8Array(cells.length);
  const edges: GraphEdge[] = [];
  for (let index = 0; index < cells.length; index += 1) {
    if (nodeOf[index] === -1) continue;
    neighbours(index).forEach((first) => {
      if (nodeOf[first] !== -1 || visited[first]) return;
      const points: Point[] = [];
      let previous = index;
      let current = first;
      let end = -1;
      for (;;) {
        visited[current] = 1;
        points.push(centre(current));
        const around = neighbours(current).filter((n) => n !== previous);
        const middle = around.find((n) => nodeOf[n] === -1 && !visited[n]);
        if (middle !== undefined) {
          previous = current;
          current = middle;
          continue;
        }
        const node = around.find((n) => nodeOf[n] !== -1);
        if (node !== undefined) end = nodeOf[node];
        break;
      }
      if (end !== -1) edges.push({ a: nodeOf[index], b: end, points, closed: false });
    });
  }

  // Whatever's left is a loop with no ends or junctions, such as an "o".
  for (let index = 0; index < cells.length; index += 1) {
    if (!cells[index] || visited[index] || nodeOf[index] !== -1) continue;
    const points: Point[] = [];
    let previous = -1;
    let current = index;
    while (current !== -1 && !visited[current]) {
      visited[current] = 1;
      points.push(centre(current));
      const next = neighbours(current).find((n) => n !== previous && !visited[n]);
      previous = current;
      current = next ?? -1;
    }
    if (points.length >= 3) edges.push({ a: -1, b: -1, points, closed: true });
  }

  return { nodes, edges };
};

const edgePolyline = (graph: Graph, edge: GraphEdge): Point[] => {
  if (edge.closed) return [...edge.points, edge.points[0]];
  return [graph.nodes[edge.a]!.position, ...edge.points, graph.nodes[edge.b]!.position];
};

const polylineLength = (points: Point[]) =>
  points.reduce((sum, p, i) => (i === 0 ? 0 : sum + Math.hypot(p.x - points[i - 1].x, p.y - points[i - 1].y)), 0);

const degrees = (graph: Graph) => {
  const degree = new Map<number, number>();
  graph.edges.forEach((edge) => {
    if (edge.closed) return;
    degree.set(edge.a, (degree.get(edge.a) ?? 0) + 1);
    degree.set(edge.b, (degree.get(edge.b) ?? 0) + 1);
  });
  return degree;
};

// Prunes spurs, merges junctions that are one crossing, and joins branches through nodes that are
// no longer junctions, until nothing changes.
const simplify = (graph: Graph, halfWidth: number) => {
  let changed = true;
  while (changed) {
    changed = false;
    let degree = degrees(graph);

    // Spurs: short dead ends off a junction.
    const spur = graph.edges.findIndex((edge) => {
      if (edge.closed || edge.a === edge.b) return false;
      const [da, db] = [degree.get(edge.a)!, degree.get(edge.b)!];
      return ((da === 1 && db >= 3) || (db === 1 && da >= 3)) && polylineLength(edgePolyline(graph, edge)) < SPUR_LENGTH * halfWidth;
    });
    if (spur !== -1) {
      const edge = graph.edges[spur];
      graph.nodes[degree.get(edge.a) === 1 ? edge.a : edge.b] = null;
      graph.edges.splice(spur, 1);
      changed = true;
      continue;
    }

    // Two junctions close together: one crossing.
    const short = graph.edges.findIndex(
      (edge) =>
        !edge.closed &&
        edge.a !== edge.b &&
        degree.get(edge.a)! >= 3 &&
        degree.get(edge.b)! >= 3 &&
        polylineLength(edgePolyline(graph, edge)) < MERGE_LENGTH * halfWidth,
    );
    if (short !== -1) {
      const { a, b } = graph.edges[short];
      const [na, nb] = [graph.nodes[a]!, graph.nodes[b]!];
      const weight = na.weight + nb.weight;
      graph.nodes[a] = {
        position: { x: (na.position.x * na.weight + nb.position.x * nb.weight) / weight, y: (na.position.y * na.weight + nb.position.y * nb.weight) / weight },
        weight,
      };
      graph.nodes[b] = null;
      graph.edges.splice(short, 1);
      graph.edges.forEach((edge) => {
        if (edge.a === b) edge.a = a;
        if (edge.b === b) edge.b = a;
      });
      changed = true;
      continue;
    }

    // A node with two branches is the middle of one branch.
    degree = degrees(graph);
    const through = [...degree.entries()].find(([, count]) => count === 2)?.[0];
    if (through !== undefined) {
      const incident = graph.edges.filter((edge) => !edge.closed && (edge.a === through || edge.b === through));
      const node = graph.nodes[through]!.position;
      if (incident.length === 1) {
        // A loop back to itself: a closed branch.
        const [edge] = incident;
        graph.edges.splice(graph.edges.indexOf(edge), 1, { a: -1, b: -1, points: [node, ...edge.points], closed: true });
      } else {
        const [first, second] = incident;
        // first's points run into the node, second's out of it.
        const into = first.b === through ? first.points : [...first.points].reverse();
        const from = first.b === through ? first.a : first.b;
        const outOf = second.a === through ? second.points : [...second.points].reverse();
        const to = second.a === through ? second.b : second.a;
        graph.edges = graph.edges.filter((edge) => edge !== first && edge !== second);
        graph.edges.push({ a: from, b: to, points: [...into, node, ...outOf], closed: false });
      }
      graph.nodes[through] = null;
      changed = true;
    }
  }
  // Nodes left with no branches (a single dot of skeleton) draw nothing.
};

// -- Strokes ---------------------------------------------------------------------------------------

/** One end of a branch: the branch and which end (0 = at `a`, 1 = at `b`). */
type End = { edge: number; side: 0 | 1 };
const endKey = ({ edge, side }: End) => edge * 2 + side;

// The point `distance` along a polyline from its start (its end when it's shorter).
const pointAlong = (points: Point[], distance: number): Point => {
  let travelled = 0;
  for (let i = 1; i < points.length; i += 1) {
    const step = Math.hypot(points[i].x - points[i - 1].x, points[i].y - points[i - 1].y);
    if (travelled + step >= distance && step > 0) {
      const t = (distance - travelled) / step;
      return { x: points[i - 1].x + t * (points[i].x - points[i - 1].x), y: points[i - 1].y + t * (points[i].y - points[i - 1].y) };
    }
    travelled += step;
  }
  return points[points.length - 1];
};

// Which branch ends continue each other at each junction: the most nearly opposite first.
const pairEnds = (graph: Graph, halfWidth: number): Map<number, End> => {
  const pairs = new Map<number, End>();
  const atNode = new Map<number, (End & { direction: Point })[]>();
  graph.edges.forEach((edge, index) => {
    if (edge.closed) return;
    const line = edgePolyline(graph, edge);
    ([0, 1] as const).forEach((side) => {
      const fromNode = side === 0 ? line : [...line].reverse();
      const near = pointAlong(fromNode, DIRECTION_FROM * halfWidth);
      const far = pointAlong(fromNode, DIRECTION_TO * halfWidth);
      const dx = far.x - near.x;
      const dy = far.y - near.y;
      const length = Math.hypot(dx, dy);
      const fallback = fromNode[fromNode.length - 1];
      const direction =
        length > 1e-12
          ? { x: dx / length, y: dy / length }
          : { x: fallback.x - fromNode[0].x, y: fallback.y - fromNode[0].y };
      const node = side === 0 ? edge.a : edge.b;
      atNode.set(node, [...(atNode.get(node) ?? []), { edge: index, side, direction }]);
    });
  });

  atNode.forEach((ends) => {
    if (ends.length < 3) return;
    const candidates: [number, number, number][] = [];
    for (let i = 0; i < ends.length; i += 1) {
      for (let j = i + 1; j < ends.length; j += 1) {
        const [p, q] = [ends[i].direction, ends[j].direction];
        const norm = Math.hypot(p.x, p.y) * Math.hypot(q.x, q.y) || 1;
        candidates.push([(p.x * q.x + p.y * q.y) / norm, i, j]);
      }
    }
    candidates.sort((p, q) => p[0] - q[0]);
    const used = new Set<number>();
    candidates.forEach(([dot, i, j]) => {
      if (dot > PAIR_DOT || used.has(i) || used.has(j)) return;
      // A branch looping back to the same junction can't continue into itself at the same end.
      if (ends[i].edge === ends[j].edge && ends[i].side === ends[j].side) return;
      used.add(i);
      used.add(j);
      pairs.set(endKey(ends[i]), ends[j]);
      pairs.set(endKey(ends[j]), ends[i]);
    });
  });
  return pairs;
};

// Joins branches into strokes through their paired ends. A stroke's points pass through a crossing
// at the junction itself, leaving out the skeleton within JUNCTION_GAP of it, which the thinning bends.
const traceStrokes = (graph: Graph, pairs: Map<number, End>, halfWidth: number): { points: Point[]; closed: boolean }[] => {
  const used = new Set<number>();
  const strokes: { points: Point[]; closed: boolean }[] = [];
  const gap = JUNCTION_GAP * halfWidth;
  const distance = (p: Point, q: Point) => Math.hypot(p.x - q.x, p.y - q.y);

  // The branch from end `side`, with the skeleton next to a crossing it passes through left out.
  const branchPoints = (index: number, side: 0 | 1, trimStart: boolean, trimEnd: boolean) => {
    const edge = graph.edges[index];
    const ordered = side === 0 ? edge.points : [...edge.points].reverse();
    const start = graph.nodes[side === 0 ? edge.a : edge.b]!.position;
    const end = graph.nodes[side === 0 ? edge.b : edge.a]!.position;
    return ordered.filter((p) => !(trimStart && distance(p, start) < gap) && !(trimEnd && distance(p, end) < gap));
  };

  const follow = (start: End, closedLoop: boolean) => {
    const points: Point[] = [];
    let current: End | undefined = start;
    let enteredThroughPair = closedLoop;
    while (current && !used.has(current.edge)) {
      used.add(current.edge);
      const edge = graph.edges[current.edge];
      const farSide = (1 - current.side) as 0 | 1;
      const next = pairs.get(endKey({ edge: current.edge, side: farSide }));
      const startNode = graph.nodes[current.side === 0 ? edge.a : edge.b]!.position;
      if (points.length === 0) points.push(startNode);
      points.push(...branchPoints(current.edge, current.side, enteredThroughPair, !!next));
      const farNode = graph.nodes[farSide === 0 ? edge.a : edge.b]!.position;
      if (!(closedLoop && next && next.edge === start.edge && next.side === start.side)) points.push(farNode);
      enteredThroughPair = !!next;
      current = next;
    }
    return points;
  };

  // Open strokes, from each end that isn't paired (a stroke's end, or a branch ending on another).
  graph.edges.forEach((edge, index) => {
    if (edge.closed || used.has(index)) return;
    ([0, 1] as const).forEach((side) => {
      if (!used.has(index) && !pairs.has(endKey({ edge: index, side }))) strokes.push({ points: follow({ edge: index, side }, false), closed: false });
    });
  });
  // What's left goes round: loops through crossings, and loops with no junction at all.
  graph.edges.forEach((edge, index) => {
    if (used.has(index)) return;
    if (edge.closed) {
      used.add(index);
      strokes.push({ points: [...edge.points], closed: true });
    } else {
      strokes.push({ points: follow({ edge: index, side: 0 }, true), closed: true });
    }
  });

  return strokes.filter((stroke) => stroke.points.length >= 2);
};

// -- Smoothing and fitting -----------------------------------------------------------------------

const resample = (points: Point[], closed: boolean, spacing: number): Point[] => {
  const line = closed ? [...points, points[0]] : points;
  const length = polylineLength(line);
  const count = Math.max(closed ? 3 : 1, Math.round(length / spacing));
  const result: Point[] = [];
  const last = closed ? count - 1 : count;
  for (let i = 0; i <= last; i += 1) result.push(pointAlong(line, (i / count) * length));
  return result;
};

// Moving average over neighbours, which takes out the grid's staircase. Open strokes keep their ends,
// and corners stay sharp.
const smooth = (points: Point[], closed: boolean, corners: number[], passes = SMOOTHING_PASSES): Point[] => {
  const pinned = new Set(corners);
  let current = points;
  for (let pass = 0; pass < passes; pass += 1) {
    current = current.map((p, i) => {
      if (pinned.has(i) || (!closed && (i === 0 || i === current.length - 1))) return p;
      const before = current[(i - 1 + current.length) % current.length];
      const after = current[(i + 1) % current.length];
      return { x: (before.x + 2 * p.x + after.x) / 4, y: (before.y + 2 * p.y + after.y) / 4 };
    });
  }
  return current;
};

type V2 = THREE.Vector2;
type CubicV = [V2, V2, V2, V2];

const bezier = ([p0, c1, c2, p3]: CubicV, t: number) => {
  const u = 1 - t;
  return new THREE.Vector2()
    .addScaledVector(p0, u * u * u)
    .addScaledVector(c1, 3 * u * u * t)
    .addScaledVector(c2, 3 * u * t * t)
    .addScaledVector(p3, t * t * t);
};
const bezierPrime = ([p0, c1, c2, p3]: CubicV, t: number) => {
  const u = 1 - t;
  return new THREE.Vector2()
    .addScaledVector(c1.clone().sub(p0), 3 * u * u)
    .addScaledVector(c2.clone().sub(c1), 6 * u * t)
    .addScaledVector(p3.clone().sub(c2), 3 * t * t);
};
const bezierSecond = ([p0, c1, c2, p3]: CubicV, t: number) =>
  new THREE.Vector2()
    .addScaledVector(c2.clone().sub(c1.clone().multiplyScalar(2)).add(p0), 6 * (1 - t))
    .addScaledVector(p3.clone().sub(c2.clone().multiplyScalar(2)).add(c1), 6 * t);

const chordLengths = (points: V2[]) => {
  const u = [0];
  for (let i = 1; i < points.length; i += 1) u.push(u[i - 1] + points[i].distanceTo(points[i - 1]));
  const total = u[u.length - 1] || 1;
  return u.map((value) => value / total);
};

// Least-squares handle lengths along the given end tangents (Schneider, "An Algorithm for
// Automatically Fitting Digitized Curves", Graphics Gems 1990).
const generateBezier = (points: V2[], u: number[], tangent1: V2, tangent2: V2): CubicV => {
  const first = points[0];
  const last = points[points.length - 1];
  let c00 = 0;
  let c01 = 0;
  let c11 = 0;
  let x0 = 0;
  let x1 = 0;
  points.forEach((point, i) => {
    const t = u[i];
    const v = 1 - t;
    const b0 = v * v * v;
    const b1 = 3 * v * v * t;
    const b2 = 3 * v * t * t;
    const b3 = t * t * t;
    const a1 = tangent1.clone().multiplyScalar(b1);
    const a2 = tangent2.clone().multiplyScalar(b2);
    c00 += a1.dot(a1);
    c01 += a1.dot(a2);
    c11 += a2.dot(a2);
    const rest = point.clone().sub(first.clone().multiplyScalar(b0 + b1)).sub(last.clone().multiplyScalar(b2 + b3));
    x0 += a1.dot(rest);
    x1 += a2.dot(rest);
  });
  const det = c00 * c11 - c01 * c01;
  let alpha1 = det === 0 ? 0 : (x0 * c11 - x1 * c01) / det;
  let alpha2 = det === 0 ? 0 : (c00 * x1 - c01 * x0) / det;
  const chord = first.distanceTo(last);
  if (alpha1 < 1e-6 * chord || alpha2 < 1e-6 * chord) {
    alpha1 = chord / 3;
    alpha2 = chord / 3;
  }
  return [first.clone(), first.clone().addScaledVector(tangent1, alpha1), last.clone().addScaledVector(tangent2, alpha2), last.clone()];
};

const maxError = (points: V2[], cubic: CubicV, u: number[]) => {
  let worst = 0;
  let split = Math.floor(points.length / 2);
  for (let i = 1; i < points.length - 1; i += 1) {
    const error = bezier(cubic, u[i]).distanceToSquared(points[i]);
    if (error >= worst) {
      worst = error;
      split = i;
    }
  }
  return { worst, split };
};

const reparameterize = (points: V2[], cubic: CubicV, u: number[]) =>
  u.map((t, i) => {
    const offset = bezier(cubic, t).sub(points[i]);
    const prime = bezierPrime(cubic, t);
    const denominator = prime.dot(prime) + offset.dot(bezierSecond(cubic, t));
    return denominator === 0 ? t : Math.max(0, Math.min(1, t - offset.dot(prime) / denominator));
  });

const fitCubics = (points: V2[], tangent1: V2, tangent2: V2, toleranceSq: number, depth = 0): CubicV[] => {
  if (points.length === 2) {
    const chord = points[0].distanceTo(points[1]) / 3;
    return [[points[0].clone(), points[0].clone().addScaledVector(tangent1, chord), points[1].clone().addScaledVector(tangent2, chord), points[1].clone()]];
  }
  let u = chordLengths(points);
  let cubic = generateBezier(points, u, tangent1, tangent2);
  let { worst, split } = maxError(points, cubic, u);
  if (worst < toleranceSq || depth > 32) return [cubic];
  if (worst < toleranceSq * 4) {
    for (let i = 0; i < 20; i += 1) {
      u = reparameterize(points, cubic, u);
      cubic = generateBezier(points, u, tangent1, tangent2);
      ({ worst, split } = maxError(points, cubic, u));
      if (worst < toleranceSq) return [cubic];
    }
  }
  const centre = points[split - 1].clone().sub(points[split + 1]);
  if (centre.lengthSq() === 0) centre.copy(points[split - 1]).sub(points[split]);
  centre.normalize();
  return [
    ...fitCubics(points.slice(0, split + 1), tangent1, centre, toleranceSq, depth + 1),
    ...fitCubics(points.slice(split), centre.clone().negate(), tangent2, toleranceSq, depth + 1),
  ];
};

// The direction the stroke leaves `points[0]`, from a few points along (one step is grid noise).
const leaving = (points: V2[], reach: number) => {
  const index = Math.min(points.length - 1, Math.max(1, reach));
  const direction = points[index].clone().sub(points[0]);
  return direction.lengthSq() > 0 ? direction.normalize() : new THREE.Vector2(1, 0);
};

// How much a stroke turns at each point: the angle between where it comes from `span` points back and
// where it goes `span` points on.
const turnsOver = (points: Point[], closed: boolean, span: number): number[] => {
  const n = points.length;
  return points.map((p, i) => {
    if (!closed && (i < span || i >= n - span)) return 0;
    const before = points[(i - span + n) % n];
    const after = points[(i + span) % n];
    const ax = p.x - before.x;
    const ay = p.y - before.y;
    const bx = after.x - p.x;
    const by = after.y - p.y;
    const norm = Math.hypot(ax, ay) * Math.hypot(bx, by);
    return norm > 0 ? Math.acos(Math.max(-1, Math.min(1, (ax * bx + ay * by) / norm))) : 0;
  });
};

// Where a stroke turns sharply. A corner turns by more than CORNER_ANGLE over twice the span, and most
// of that within the span; a curve turns half as much over half the length. (The thinning flattens a
// corner's tip, so a corner's turn is spread over a few points: the sharpest is the corner.)
const findCorners = (points: Point[], closed: boolean, span: number): number[] => {
  const n = points.length;
  const narrow = turnsOver(points, closed, span);
  const wide = turnsOver(points, closed, 2 * span);
  const score = narrow.map((turn, i) => (wide[i] > CORNER_ANGLE && turn > CORNER_CONCENTRATION * wide[i] ? turn : 0));
  return score
    .map((turn, i) => ({ turn, i }))
    .filter(({ turn, i }) => {
      if (turn === 0) return false;
      for (let k = 1; k <= span; k += 1) {
        const before = closed || i - k >= 0 ? score[(i - k + n) % n] : 0;
        const after = closed || i + k < n ? score[(i + k) % n] : 0;
        if (before > turn || after >= turn) return false;
      }
      return true;
    })
    .map(({ i }) => i);
};

const toTuple = (v: V2): Vector => [v.x, v.y, 0];

// Cubics end to end as path points: a join is smooth when its handles are opposite.
const cubicsToPath = (cubics: CubicV[], closed: boolean): PathData => {
  const mode = (handleIn: V2, handleOut: V2): PathPoint["mode"] =>
    handleIn.lengthSq() > 0 && handleOut.lengthSq() > 0 && handleIn.clone().normalize().dot(handleOut.clone().normalize()) <= SMOOTH_DOT
      ? "smooth"
      : "corner";
  const points: PathPoint[] = cubics.map((cubic, i) => {
    const previous = i > 0 ? cubics[i - 1] : closed ? cubics[cubics.length - 1] : null;
    const handleIn = previous ? previous[2].clone().sub(cubic[0]) : new THREE.Vector2();
    const handleOut = cubic[1].clone().sub(cubic[0]);
    return { position: toTuple(cubic[0]), handleIn: toTuple(handleIn), handleOut: toTuple(handleOut), mode: mode(handleIn, handleOut) };
  });
  if (!closed) {
    const last = cubics[cubics.length - 1];
    points.push({ position: toTuple(last[3]), handleIn: toTuple(last[2].clone().sub(last[3])), handleOut: [0, 0, 0], mode: "corner" });
  }
  return { points, closed };
};

// A stroke's points as Bézier path points: split at corners, each piece fitted with its own end
// tangents, and smooth (shared tangents) everywhere else.
const fitStroke = (stroke: Point[], closed: boolean, halfWidth: number, spacing: number, recentre?: Recentre): PathData | null => {
  const resampled = resample(stroke, closed, spacing);
  if (resampled.length < 2) return null;
  const span = Math.max(1, Math.round((CORNER_SPAN * halfWidth) / spacing));
  const toleranceSq = (FIT_TOLERANCE * halfWidth) ** 2;
  // Corners are found before smoothing, which would round them off.
  let corners = findCorners(resampled, closed, span);
  let points = smooth(resampled, closed, corners);
  if (recentre) points = smooth(recentreStroke(points, closed, corners, halfWidth, recentre), closed, corners, 1);

  // A closed stroke with a corner is fitted as an open one from that corner round to it again.
  if (closed && corners.length > 0) {
    const n = points.length;
    const start = corners[0];
    points = [...points.slice(start), ...points.slice(0, start), points[start]];
    corners = corners
      .map((corner) => (corner - start + n) % n)
      .filter((corner) => corner > 0)
      .sort((a, b) => a - b);
    const cubics = fitPieces(points, [0, ...corners, n], span, toleranceSq);
    return cubicsToPath(cubics.length >= 2 ? cubics : cubics.flatMap(splitInTwo), true);
  }
  if (closed) {
    // Smooth all round: fitted from point 0 back to it, with one tangent at the join.
    const loop = [...points, points[0]].map((p) => new THREE.Vector2(p.x, p.y));
    const tangent = loop[Math.min(span, loop.length - 2)].clone().sub(loop[loop.length - 1 - Math.min(span, loop.length - 2)]);
    if (tangent.lengthSq() === 0) tangent.set(1, 0);
    tangent.normalize();
    const cubics = fitCubics(loop, tangent, tangent.clone().negate(), toleranceSq);
    // A closed path needs two points.
    return cubics.length >= 2 ? cubicsToPath(cubics, true) : cubicsToPath(splitInTwo(cubics[0]), true);
  }
  return cubicsToPath(fitPieces(points, [0, ...corners, points.length - 1], span, toleranceSq), false);
};

const splitInTwo = (cubic: CubicV): CubicV[] => {
  const [p0, c1, c2, p3] = cubic;
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

const fitPieces = (points: Point[], breaks: number[], span: number, toleranceSq: number): CubicV[] =>
  breaks.slice(1).flatMap((end, i) => {
    const piece = points.slice(breaks[i], end + 1).map((p) => new THREE.Vector2(p.x, p.y));
    if (piece.length < 2) return [];
    const reach = Math.min(span, piece.length - 1);
    return fitCubics(piece, leaving(piece, reach), leaving([...piece].reverse(), reach), toleranceSq);
  });

// -- Putting it together -------------------------------------------------------------------------

/**
 * Moves a point on a stroke's middle to halfway between the stroke's two edges, along `normal`
 * (unit length), and gives the stroke's half-width there. Null where there aren't two edges close
 * by: at a stroke's end, or where it crosses another.
 */
export type Recentre = (point: Point, normal: Point) => { point: Point; halfWidth: number } | null;

// The thinning is only as good as the grid (about an eighth of a stroke off); the outline itself
// says where the middle is.
const recentreStroke = (points: Point[], closed: boolean, corners: number[], halfWidth: number, recentre: Recentre): Point[] => {
  const pinned = new Set(corners);
  const n = points.length;
  return points.map((p, i) => {
    if (pinned.has(i) || (!closed && (i === 0 || i === n - 1))) return p;
    const before = points[(i - 1 + n) % n];
    const after = points[(i + 1) % n];
    const dx = after.x - before.x;
    const dy = after.y - before.y;
    const length = Math.hypot(dx, dy);
    if (length === 0) return p;
    const result = recentre(p, { x: -dy / length, y: dx / length });
    if (!result || Math.hypot(result.point.x - p.x, result.point.y - p.y) > MAX_RECENTRE * halfWidth) return p;
    return result.point;
  });
};

/**
 * The strokes in a mask (filled cells), as paths, for strokes `halfWidth` wide. `recentre` puts the
 * thinned middle back between the outline's edges. Exposed for tests, which draw strokes straight
 * into a grid. The mask is thinned in place.
 */
export const maskCenterLines = (mask: Mask, halfWidth: number, recentre?: Recentre): PathData[] => {
  thin(mask);
  const graph = skeletonGraph(mask);
  simplify(graph, halfWidth);
  const pairs = pairEnds(graph, halfWidth);
  const strokes = traceStrokes(graph, pairs, halfWidth);
  const spacing = Math.max(mask.cell, halfWidth / 2);

  return strokes
    .map((stroke) => {
      // Writing starts on the left: an open stroke runs from its left end.
      const points = !stroke.closed && stroke.points[stroke.points.length - 1].x < stroke.points[0].x ? [...stroke.points].reverse() : stroke.points;
      // A stroke shorter than its width is a dot: too short to be a path.
      if (polylineLength(points) < halfWidth && !stroke.closed) return null;
      return fitStroke(points, stroke.closed, halfWidth, spacing, recentre);
    })
    .filter((path): path is PathData => !!path && path.points.length >= 2)
    .sort((p, q) => leftmost(p) - leftmost(q));
};

const leftmost = (path: PathData) => (path.closed ? Math.min(...path.points.map((point) => point.position[0])) : path.points[0].position[0]);

// How far along `direction` (unit length) a ray from `from` first meets the outline; Infinity if never.
const rayToOutline = (from: Point, direction: Point, polygons: Point[][]) => {
  let nearest = Infinity;
  polygons.forEach((polygon) => {
    polygon.forEach((a, i) => {
      const b = polygon[(i + 1) % polygon.length];
      const ex = b.x - a.x;
      const ey = b.y - a.y;
      const denominator = direction.x * ey - direction.y * ex;
      if (Math.abs(denominator) < 1e-15) return;
      const ax = a.x - from.x;
      const ay = a.y - from.y;
      const t = (ax * ey - ay * ex) / denominator; // along the ray
      const s = (ax * direction.y - ay * direction.x) / denominator; // along the edge
      if (t > 0 && s >= 0 && s <= 1) nearest = Math.min(nearest, t);
    });
  });
  return nearest;
};

/** The strokes a filled shape was drawn with, and their half-width. Empty when it has no area. */
export const shapeCenterLines = (shape: ShapeData): CenterLines => {
  const outlines = shape.regions.filter((region) => region.outline.points.length >= 3);
  const polygons = outlines.flatMap((region) => [region.outline, ...region.holes.filter((hole) => hole.points.length >= 3)]).map(contourPolygon);
  const area = outlines.reduce(
    (sum, region) =>
      sum +
      polygonArea(contourPolygon(region.outline)) -
      region.holes.filter((hole) => hole.points.length >= 3).reduce((holes, hole) => holes + polygonArea(contourPolygon(hole)), 0),
    0,
  );
  const perimeter = polygons.reduce((sum, polygon) => sum + polygonPerimeter(polygon), 0);
  if (!(area > 0) || !(perimeter > 0)) return { paths: [], radius: 0 };
  const halfWidth = area / perimeter;

  const xs = polygons.flat().map((p) => p.x);
  const ys = polygons.flat().map((p) => p.y);
  const boxArea = (Math.max(...xs) - Math.min(...xs) + 2 * halfWidth) * (Math.max(...ys) - Math.min(...ys) + 2 * halfWidth);
  const cell = Math.max(halfWidth / CELLS_PER_HALF_WIDTH, Math.sqrt(boxArea / MAX_CELLS));

  // Across the stroke both ways: an edge on each side, about a stroke width apart in all (further is
  // a crossing or an end, where the ray runs along a stroke).
  const widths: number[] = [];
  const recentre: Recentre = (point, normal) => {
    const ahead = rayToOutline(point, normal, polygons);
    const behind = rayToOutline(point, { x: -normal.x, y: -normal.y }, polygons);
    const half = (ahead + behind) / 2;
    if (!Number.isFinite(half) || half > MAX_WIDTH_RATIO * halfWidth) return null;
    widths.push(half);
    const shift = (ahead - behind) / 2;
    return { point: { x: point.x + normal.x * shift, y: point.y + normal.y * shift }, halfWidth: half };
  };

  const paths = maskCenterLines(rasterise(polygons, cell), halfWidth, recentre);

  // The radius is the strokes' typical half-width: the median of what was measured across them.
  widths.sort((a, b) => a - b);
  const radius = widths.length > 0 ? widths[Math.floor(widths.length / 2)] : halfWidth;
  return { paths, radius };
};
