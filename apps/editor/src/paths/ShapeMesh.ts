/**
 * PURPOSE: A shape's Three object: its filled outline (paths/shapeGeometry.ts), flat or extruded.
 *
 * `rebuild` replaces the geometry (disposing the old) when the outline, extrusion or bevel changes,
 * which also gives it new bounds. The material belongs to whoever made the mesh (ObjectManager).
 * Nothing here depends on the store, React, or the DOM.
 */

import * as THREE from "three";
import { buildShapeGeometry, type ShapeData, type ShapeSolid } from "./shapeGeometry";

export class ShapeMesh extends THREE.Mesh {
  /** What it was last built from, so the caller can tell when to rebuild. */
  shape: ShapeData;
  solid: ShapeSolid;

  constructor(shape: ShapeData, solid: ShapeSolid, material: THREE.Material) {
    super(buildShapeGeometry(shape, solid), material);
    this.shape = shape;
    this.solid = solid;
    this.geometry.computeBoundingBox();
  }

  rebuild(shape: ShapeData, solid: ShapeSolid): void {
    this.geometry.dispose();
    this.shape = shape;
    this.solid = solid;
    this.geometry = buildShapeGeometry(shape, solid);
    this.geometry.computeBoundingBox();
  }

  /** Whether it was built from this outline, extrusion and bevel. */
  isBuiltFrom(shape: ShapeData, solid: ShapeSolid): boolean {
    return this.shape === shape && this.solid.extrusion === solid.extrusion && this.solid.bevel === solid.bevel;
  }
}
