/**
 * PURPOSE: What the pen tool draws over the viewport (notes/animation-plan.md, B2): a path's points
 * and handles as dots that keep their size on screen, the lines out to the handles, a thin line
 * along the whole curve (also where a trim hides the tube), the next segment while drawing, the dot
 * where a click would add a point, and the dot under the cursor where the pen's next click puts one.
 *
 * The dots and lines live in the path's own space, in a group that takes the path object's world
 * matrix, so they follow the object as it's shown (its state, its parents). They're drawn over
 * the scene without a depth test: a path's points are inside its tube. `editorOnly`, so exports,
 * thumbnails and Play leave all of it out.
 */

import * as THREE from "three";
import { MeshBasicNodeMaterial } from "three/webgpu";
import { attribute, cameraProjectionMatrix, length, modelViewMatrix, positionGeometry, screenSize, select, uniform, uv, vec4 } from "three/tsl";
import { buildPathCurve, type PathData } from "../paths/pathGeometry";
import type { HandleSide } from "../paths/pathEditing";

/** What to show for one path. Positions are in the path's own space. */
export interface PathOverlayView {
  path: PathData;
  matrixWorld: THREE.Matrix4; // the path object's
  selectedPoints: number[];
  handles: { index: number; side: HandleSide }[];
  preview: THREE.Vector3 | null; // drawing: where the next point would land
  insertAt: THREE.Vector3 | null; // editing: where a click on the curve would add a point
}

const ANCHOR_SIZE = 10; // pixels
const HANDLE_SIZE = 7;
const INSERT_SIZE = 8;
const CURSOR_HIGHLIGHT_SIZE = 14; // the cursor's dot on a point a click would close or finish the path at
const LINE_SEGMENTS_PER_CURVE = 24;
const ACCENT = new THREE.Color(0x0a84ff); // --accent
const WHITE = new THREE.Color(0xffffff);
const RENDER_ORDER = 1000; // after the scene

// A round dot with a ring, `size` pixels across whatever the distance: a quad per dot (WebGPU has
// no sized points), placed at the dot's position and sized on the screen by the vertex stage.
// Written in TSL, which three compiles for WebGPU and for WebGL 2.
const dotMaterial = (pixelRatio: ReturnType<typeof uniform<number>>): MeshBasicNodeMaterial => {
  const material = new MeshBasicNodeMaterial({ depthTest: false, depthWrite: false, toneMapped: false });
  const center = cameraProjectionMatrix.mul(modelViewMatrix).mul(vec4(attribute("center", "vec3"), 1));
  // The quad's corners are half a unit out; clip space is two units across the screen.
  const corner = positionGeometry.xy.mul(attribute("size", "float")).mul(pixelRatio).mul(2).div(screenSize);
  material.vertexNode = vec4(center.xy.add(corner.mul(center.w)), center.zw);
  const radius = length(uv().sub(0.5)).mul(2);
  material.colorNode = vec4(select(radius.greaterThan(0.6), attribute("ring", "vec3"), attribute("fill", "vec3")), radius.lessThanEqual(1));
  material.alphaTest = 0.5; // nothing outside the circle
  return material;
};

// The colour's components as the dot's shader takes them.
const rgb = (color: THREE.Color): number[] => color.toArray();

const overlayLineMaterial = (color: THREE.Color, opacity: number) =>
  new THREE.LineBasicMaterial({ color, transparent: true, opacity, depthTest: false, depthWrite: false, toneMapped: false });

const toVector3 = (vector: [number, number, number]) => new THREE.Vector3(...vector);

const LINE_ATTRIBUTES = { position: 3 };
const DOT_ATTRIBUTES = { center: 3, fill: 3, ring: 3, size: 1 };

type Dots = THREE.Mesh<THREE.InstancedBufferGeometry, MeshBasicNodeMaterial>;

// Makes room for `count` dots and draws just that many: as `reserve` below, with a value per dot
// (per instance of the quad) instead of per vertex.
const reserveDots = (dots: Dots, count: number): THREE.InstancedBufferGeometry => {
  const capacity = dots.geometry.getAttribute("center")?.count ?? 0;
  if (capacity < count) {
    dots.geometry.dispose();
    const size = Math.max(count, 2 * capacity, 16);
    const geometry = new THREE.InstancedBufferGeometry().copy(new THREE.PlaneGeometry(1, 1) as unknown as THREE.InstancedBufferGeometry);
    for (const [name, itemSize] of Object.entries(DOT_ATTRIBUTES)) {
      geometry.setAttribute(name, new THREE.InstancedBufferAttribute(new Float32Array(size * itemSize), itemSize).setUsage(THREE.DynamicDrawUsage));
    }
    dots.geometry = geometry;
  }
  dots.geometry.instanceCount = count;
  return dots.geometry;
};

// Makes room for `count` vertices in a part's geometry and draws just that many. Three can't grow a
// buffer it has uploaded (setFromPoints keeps the old size), so a full one is swapped for a new
// geometry twice as big, and the old one disposed so its GPU buffers go too.
const reserve = (part: THREE.Line, count: number, attributes: Record<string, number>): THREE.BufferGeometry => {
  const position = part.geometry.getAttribute("position");
  const capacity = position?.count ?? 0;
  if (!position || capacity < count) {
    part.geometry.dispose();
    const size = Math.max(count, 2 * capacity, 16);
    const geometry = new THREE.BufferGeometry();
    for (const [name, itemSize] of Object.entries(attributes)) {
      geometry.setAttribute(name, new THREE.BufferAttribute(new Float32Array(size * itemSize), itemSize).setUsage(THREE.DynamicDrawUsage));
    }
    part.geometry = geometry;
  }
  part.geometry.setDrawRange(0, count);
  return part.geometry;
};

const write = (geometry: THREE.BufferGeometry, name: string, values: number[]) => {
  const attribute = geometry.getAttribute(name) as THREE.BufferAttribute;
  (attribute.array as Float32Array).set(values);
  attribute.needsUpdate = true;
};

const writePoints = (part: THREE.Line, points: THREE.Vector3[]) =>
  write(reserve(part, points.length, LINE_ATTRIBUTES), "position", points.flatMap((point) => point.toArray()));

// As writePoints, for a line that is simply not drawn while it has no points (WebGPU warns about
// a draw of nothing).
const writeLine = (part: THREE.Line, points: THREE.Vector3[]) => {
  part.visible = points.length > 0;
  writePoints(part, points);
};

export class PathEditOverlay {
  /** Add this to the scene. */
  readonly object = new THREE.Group();
  private readonly pathSpace = new THREE.Group();
  private readonly dots: Dots;
  private readonly pixelRatio = uniform(1);
  private readonly handleLines: THREE.LineSegments<THREE.BufferGeometry, THREE.LineBasicMaterial>;
  private readonly curveLine: THREE.Line<THREE.BufferGeometry, THREE.LineBasicMaterial>;
  private readonly previewLine: THREE.Line<THREE.BufferGeometry, THREE.LineBasicMaterial>;
  // In the world, not the path's space: before a path's first point there's no path.
  private readonly cursorDot: Dots;
  // What was last shown, so a frame with nothing new does nothing.
  private shownPath: PathData | null = null;
  private shownKey = "";

  constructor() {
    this.object.userData.editorOnly = true; // never exported — see hideEditorOnlyObjects
    this.object.visible = false;
    this.pathSpace.matrixAutoUpdate = false;

    this.dots = new THREE.Mesh(new THREE.InstancedBufferGeometry(), dotMaterial(this.pixelRatio));
    this.handleLines = new THREE.LineSegments(new THREE.BufferGeometry(), overlayLineMaterial(ACCENT, 0.9));
    this.curveLine = new THREE.Line(new THREE.BufferGeometry(), overlayLineMaterial(ACCENT, 0.7));
    this.previewLine = new THREE.Line(new THREE.BufferGeometry(), overlayLineMaterial(WHITE, 0.6));
    // Lines first, then the dots on top of them.
    [this.curveLine, this.previewLine, this.handleLines].forEach((line) => (line.renderOrder = RENDER_ORDER));
    this.dots.renderOrder = RENDER_ORDER + 1;
    // The geometry changes every edit, so its bounds would be stale: never cull these.
    [this.dots, this.handleLines, this.curveLine, this.previewLine].forEach((part) => (part.frustumCulled = false));
    this.pathSpace.add(this.curveLine, this.previewLine, this.handleLines, this.dots);

    this.cursorDot = new THREE.Mesh(new THREE.InstancedBufferGeometry(), this.dots.material);
    this.cursorDot.renderOrder = RENDER_ORDER + 2;
    this.cursorDot.frustumCulled = false;
    this.cursorDot.visible = false;

    this.object.add(this.pathSpace, this.cursorDot);
  }

  private updateVisible(): void {
    this.object.visible = this.pathSpace.visible || this.cursorDot.visible;
  }

  /** Shows a path's points (or nothing, with null). Cheap to call every frame. */
  show(view: PathOverlayView | null, pixelRatio: number): void {
    this.pathSpace.visible = !!view;
    this.updateVisible();
    if (!view) return;

    this.pathSpace.matrix.copy(view.matrixWorld);
    this.pathSpace.matrixWorldNeedsUpdate = true;
    this.pixelRatio.value = pixelRatio;

    const pathChanged = view.path !== this.shownPath;
    const key = JSON.stringify([view.selectedPoints, view.handles, view.preview?.toArray(), view.insertAt?.toArray()]);
    if (!pathChanged && key === this.shownKey) return;
    this.shownKey = key;
    if (pathChanged) {
      this.shownPath = view.path;
      writeLine(this.curveLine, buildPathCurve(view.path)?.getPoints(LINE_SEGMENTS_PER_CURVE) ?? []);
    }

    const { points } = view.path;
    const handleTip = ({ index, side }: { index: number; side: HandleSide }) =>
      toVector3(points[index].position).add(toVector3(side === "in" ? points[index].handleIn : points[index].handleOut));

    // Dots: handles, then points (drawn after, so a point wins where they overlap), then the insert dot.
    const positions: THREE.Vector3[] = [];
    const fills: number[][] = [];
    const rings: number[][] = [];
    const sizes: number[] = [];
    const addDot = (position: THREE.Vector3, fill: THREE.Color, ring: THREE.Color, size: number) => {
      positions.push(position);
      fills.push(rgb(fill));
      rings.push(rgb(ring));
      sizes.push(size);
    };
    view.handles.forEach((handle) => addDot(handleTip(handle), ACCENT, WHITE, HANDLE_SIZE));
    points.forEach((point, index) =>
      view.selectedPoints.includes(index)
        ? addDot(toVector3(point.position), ACCENT, WHITE, ANCHOR_SIZE)
        : addDot(toVector3(point.position), WHITE, ACCENT, ANCHOR_SIZE),
    );
    if (view.insertAt) addDot(view.insertAt, WHITE, ACCENT, INSERT_SIZE);

    const geometry = reserveDots(this.dots, positions.length);
    write(geometry, "center", positions.flatMap((position) => position.toArray()));
    write(geometry, "fill", fills.flat());
    write(geometry, "ring", rings.flat());
    write(geometry, "size", sizes);

    writeLine(this.handleLines, view.handles.flatMap((handle) => [toVector3(points[handle.index].position), handleTip(handle)]));

    // The next segment: from the last point, leaving along its out handle, straight into the cursor.
    const last = points[points.length - 1];
    this.previewLine.visible = !!view.preview && !!last && !view.path.closed;
    if (view.preview && last) {
      const start = toVector3(last.position);
      const segment = new THREE.CubicBezierCurve3(start, start.clone().add(toVector3(last.handleOut)), view.preview, view.preview);
      writePoints(this.previewLine, segment.getPoints(LINE_SEGMENTS_PER_CURVE));
    }
  }

  /**
   * Shows the dot where the pen's next click puts a point, in the world, or hides it. `highlight`:
   * the click closes or finishes the path there instead, so the dot is the point's, picked.
   */
  showCursor(position: THREE.Vector3 | null, highlight: boolean, pixelRatio: number): void {
    this.cursorDot.visible = !!position;
    this.updateVisible();
    if (!position) return;
    this.pixelRatio.value = pixelRatio;
    const geometry = reserveDots(this.cursorDot, 1);
    write(geometry, "center", position.toArray());
    write(geometry, "fill", rgb(highlight ? ACCENT : WHITE));
    write(geometry, "ring", rgb(highlight ? WHITE : ACCENT));
    write(geometry, "size", [highlight ? CURSOR_HIGHLIGHT_SIZE : ANCHOR_SIZE]);
  }

  dispose(): void {
    this.cursorDot.geometry.dispose(); // its material is the dots'
    [this.dots, this.handleLines, this.curveLine, this.previewLine].forEach((part) => {
      part.geometry.dispose();
      (part.material as THREE.Material).dispose();
    });
  }
}
