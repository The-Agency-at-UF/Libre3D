/**
 * PURPOSE: A path's Three object (notes/animation-plan.md, B1): the tube, with its two end caps as
 * child meshes that share the tube's material.
 *
 * `setTrim` changes how much of the path shows by changing the tube's draw range and moving the
 * caps, so a write-on never rebuilds geometry. `rebuild` replaces the geometry (disposing the old)
 * when the path, radius or cap style changes, which also gives the tube new bounds. Raycasting
 * follows the trim: Mesh.raycast only tests the draw range, and a hidden cap isn't hit.
 *
 * The material belongs to whoever made the mesh (ObjectManager): after replacing `material`, call
 * `shareMaterialWithCaps`. Nothing here depends on the store, React, or the DOM.
 */

import * as THREE from "three";
import {
  buildPathCurve,
  capPose,
  createCapGeometry,
  drawRangeFor,
  hasCaps,
  RADIAL_SEGMENTS,
  trimToRings,
  tubeSegmentsFor,
  type PathData,
  type PathStroke,
} from "./pathGeometry";

// Raycasting doesn't look at `visible`, so a cap hidden at zero length would still be clickable.
class CapMesh extends THREE.Mesh {
  raycast(raycaster: THREE.Raycaster, intersects: THREE.Intersection[]): void {
    if (this.visible) super.raycast(raycaster, intersects);
  }
}

const createEmptyGeometry = (): THREE.BufferGeometry =>
  new THREE.BufferGeometry().setAttribute("position", new THREE.Float32BufferAttribute([], 3));

export class PathMesh extends THREE.Mesh {
  /** What it was last built from, so the caller can tell when to rebuild. */
  path: PathData;
  stroke: PathStroke;

  private tube: THREE.TubeGeometry | null = null; // null when the path has nothing to draw
  private segments = 0;
  private closed = false;
  private trim: [number, number] = [0, 1];
  private readonly startCap: CapMesh;
  private readonly endCap: CapMesh;

  constructor(path: PathData, stroke: PathStroke, material: THREE.Material) {
    super(createEmptyGeometry(), material);
    this.path = path;
    this.stroke = stroke;
    this.startCap = new CapMesh(createEmptyGeometry(), material);
    this.endCap = new CapMesh(this.startCap.geometry, material);
    this.add(this.startCap, this.endCap);
    this.rebuild(path, stroke);
  }

  /** Builds the tube and caps again for a new path or stroke, keeping the trim. */
  rebuild(path: PathData, stroke: PathStroke): void {
    this.geometry.dispose();
    this.startCap.geometry.dispose();
    this.path = path;
    this.stroke = stroke;
    this.closed = path.closed;

    const curve = buildPathCurve(path);
    this.segments = curve ? tubeSegmentsFor(curve.getLength()) : 0;
    this.tube = curve ? new THREE.TubeGeometry(curve, this.segments, stroke.radius, RADIAL_SEGMENTS, path.closed) : null;
    this.geometry = this.tube ?? createEmptyGeometry();
    this.geometry.computeBoundingBox();

    const capGeometry = createCapGeometry(stroke);
    this.startCap.geometry = capGeometry;
    this.endCap.geometry = capGeometry;

    this.applyTrim();
  }

  /** Shows the path from `start` to `end` (0–1 of its length). */
  setTrim(start: number, end: number): void {
    if (start === this.trim[0] && end === this.trim[1]) return;
    this.trim = [start, end];
    this.applyTrim();
  }

  getTrim(): [number, number] {
    return [this.trim[0], this.trim[1]];
  }

  /** Whether the trim leaves anything to draw. */
  get isDrawn(): boolean {
    const rings = trimToRings(this.trim[0], this.trim[1], this.segments);
    return rings.end > rings.start;
  }

  /** Gives the caps the tube's material again, after `material` was replaced. */
  shareMaterialWithCaps(): void {
    this.startCap.material = this.material;
    this.endCap.material = this.material;
  }

  /**
   * A copy of the tube for exporting, with only the trimmed part in its index (GLTFExporter ignores
   * the draw range). It shares the tube's vertices; dispose it after. Null when the whole tube is
   * drawn (export the tube itself) or nothing is.
   */
  createTrimmedGeometry(): THREE.BufferGeometry | null {
    const index = this.tube?.getIndex();
    if (!this.tube || !index) return null;
    const range = drawRangeFor(trimToRings(this.trim[0], this.trim[1], this.segments));
    if (range.count === 0 || range.count === index.count) return null;

    const trimmed = new THREE.BufferGeometry();
    for (const [name, attribute] of Object.entries(this.tube.attributes)) trimmed.setAttribute(name, attribute);
    trimmed.setIndex(new THREE.BufferAttribute(index.array.slice(range.start, range.start + range.count), 1));
    return trimmed;
  }

  /** Frees the tube and cap geometry (not the material, which isn't this mesh's). */
  disposeGeometry(): void {
    this.geometry.dispose();
    this.startCap.geometry.dispose();
  }

  private applyTrim(): void {
    const rings = trimToRings(this.trim[0], this.trim[1], this.segments);
    const range = drawRangeFor(rings);
    this.geometry.setDrawRange(range.start, range.count);

    const showCaps = !!this.tube && hasCaps(rings, this.segments, this.closed);
    this.startCap.visible = showCaps;
    this.endCap.visible = showCaps;
    if (!this.tube || !showCaps) return;

    for (const [cap, ring, isStart] of [
      [this.startCap, rings.start, true],
      [this.endCap, rings.end, false],
    ] as const) {
      const pose = capPose(this.tube, ring, isStart);
      cap.position.copy(pose.position);
      cap.quaternion.copy(pose.quaternion);
    }
  }
}
