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

// A round dot with a ring, `size` pixels across whatever the distance. Colours are written as is
// (no tone mapping), so they match the UI's.
const DOT_VERTEX_SHADER = /* glsl */ `
  attribute vec3 fill;
  attribute vec3 ring;
  attribute float size;
  uniform float pixelRatio;
  varying vec3 vFill;
  varying vec3 vRing;
  void main() {
    vFill = fill;
    vRing = ring;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = size * pixelRatio;
  }
`;

const DOT_FRAGMENT_SHADER = /* glsl */ `
  varying vec3 vFill;
  varying vec3 vRing;
  void main() {
    float radius = length(gl_PointCoord - 0.5) * 2.0;
    if (radius > 1.0) discard;
    gl_FragColor = vec4(radius > 0.6 ? vRing : vFill, 1.0);
  }
`;

// The colour's sRGB components, as the dot shader writes them out unconverted.
const srgb = (color: THREE.Color): number[] => {
  const { r, g, b } = color.getRGB({ r: 0, g: 0, b: 0 }, THREE.SRGBColorSpace);
  return [r, g, b];
};

const overlayLineMaterial = (color: THREE.Color, opacity: number) =>
  new THREE.LineBasicMaterial({ color, transparent: true, opacity, depthTest: false, depthWrite: false, toneMapped: false });

const toVector3 = (vector: [number, number, number]) => new THREE.Vector3(...vector);

const LINE_ATTRIBUTES = { position: 3 };
const DOT_ATTRIBUTES = { position: 3, fill: 3, ring: 3, size: 1 };

// Makes room for `count` vertices in a part's geometry and draws just that many. Three can't grow a
// buffer it has uploaded (setFromPoints keeps the old size), so a full one is swapped for a new
// geometry twice as big, and the old one disposed so its GPU buffers go too.
const reserve = (part: THREE.Points | THREE.Line, count: number, attributes: Record<string, number>): THREE.BufferGeometry => {
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

export class PathEditOverlay {
  /** Add this to the scene. */
  readonly object = new THREE.Group();
  private readonly pathSpace = new THREE.Group();
  private readonly dots: THREE.Points<THREE.BufferGeometry, THREE.ShaderMaterial>;
  private readonly handleLines: THREE.LineSegments<THREE.BufferGeometry, THREE.LineBasicMaterial>;
  private readonly curveLine: THREE.Line<THREE.BufferGeometry, THREE.LineBasicMaterial>;
  private readonly previewLine: THREE.Line<THREE.BufferGeometry, THREE.LineBasicMaterial>;
  // In the world, not the path's space: before a path's first point there's no path.
  private readonly cursorDot: THREE.Points<THREE.BufferGeometry, THREE.ShaderMaterial>;
  // What was last shown, so a frame with nothing new does nothing.
  private shownPath: PathData | null = null;
  private shownKey = "";

  constructor() {
    this.object.userData.editorOnly = true; // never exported — see hideEditorOnlyObjects
    this.object.visible = false;
    this.pathSpace.matrixAutoUpdate = false;

    this.dots = new THREE.Points(
      new THREE.BufferGeometry(),
      new THREE.ShaderMaterial({
        uniforms: { pixelRatio: { value: 1 } },
        vertexShader: DOT_VERTEX_SHADER,
        fragmentShader: DOT_FRAGMENT_SHADER,
        depthTest: false,
        depthWrite: false,
      }),
    );
    this.handleLines = new THREE.LineSegments(new THREE.BufferGeometry(), overlayLineMaterial(ACCENT, 0.9));
    this.curveLine = new THREE.Line(new THREE.BufferGeometry(), overlayLineMaterial(ACCENT, 0.7));
    this.previewLine = new THREE.Line(new THREE.BufferGeometry(), overlayLineMaterial(WHITE, 0.6));
    // Lines first, then the dots on top of them.
    [this.curveLine, this.previewLine, this.handleLines].forEach((line) => (line.renderOrder = RENDER_ORDER));
    this.dots.renderOrder = RENDER_ORDER + 1;
    // The geometry changes every edit, so its bounds would be stale: never cull these.
    [this.dots, this.handleLines, this.curveLine, this.previewLine].forEach((part) => (part.frustumCulled = false));
    this.pathSpace.add(this.curveLine, this.previewLine, this.handleLines, this.dots);

    this.cursorDot = new THREE.Points(new THREE.BufferGeometry(), this.dots.material);
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
    this.dots.material.uniforms.pixelRatio.value = pixelRatio;

    const pathChanged = view.path !== this.shownPath;
    const key = JSON.stringify([view.selectedPoints, view.handles, view.preview?.toArray(), view.insertAt?.toArray()]);
    if (!pathChanged && key === this.shownKey) return;
    this.shownKey = key;
    if (pathChanged) {
      this.shownPath = view.path;
      writePoints(this.curveLine, buildPathCurve(view.path)?.getPoints(LINE_SEGMENTS_PER_CURVE) ?? []);
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
      fills.push(srgb(fill));
      rings.push(srgb(ring));
      sizes.push(size);
    };
    view.handles.forEach((handle) => addDot(handleTip(handle), ACCENT, WHITE, HANDLE_SIZE));
    points.forEach((point, index) =>
      view.selectedPoints.includes(index)
        ? addDot(toVector3(point.position), ACCENT, WHITE, ANCHOR_SIZE)
        : addDot(toVector3(point.position), WHITE, ACCENT, ANCHOR_SIZE),
    );
    if (view.insertAt) addDot(view.insertAt, WHITE, ACCENT, INSERT_SIZE);

    const geometry = reserve(this.dots, positions.length, DOT_ATTRIBUTES);
    write(geometry, "position", positions.flatMap((position) => position.toArray()));
    write(geometry, "fill", fills.flat());
    write(geometry, "ring", rings.flat());
    write(geometry, "size", sizes);

    writePoints(this.handleLines, view.handles.flatMap((handle) => [toVector3(points[handle.index].position), handleTip(handle)]));

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
    this.dots.material.uniforms.pixelRatio.value = pixelRatio;
    const geometry = reserve(this.cursorDot, 1, DOT_ATTRIBUTES);
    write(geometry, "position", position.toArray());
    write(geometry, "fill", srgb(highlight ? ACCENT : WHITE));
    write(geometry, "ring", srgb(highlight ? WHITE : ACCENT));
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
