/**
 * PURPOSE: Builds the geometry of a primitive entity (cube, sphere, torus, plane, image).
 *
 * INPUT: An entity. OUTPUT: A new geometry in the entity's own space, at unit size; the entity's
 * scale sizes it.
 *
 * Not here: paths and shapes, whose geometry follows their points (paths/PathMesh.ts,
 * paths/ShapeMesh.ts), and imported models, which bring their own (importedModels.ts). A new
 * primitive type's builder goes here.
 */

import * as THREE from "three";
import type { Entity } from "../scene/types";
import { createImagePlaneGeometry } from "../utils/imagePlane";

export function createPrimitiveGeometry(entity: Entity): THREE.BufferGeometry {
  switch (entity.type) {
    case "sphere":
      return new THREE.SphereGeometry(0.5, 32, 16);
    case "torus":
      return new THREE.TorusGeometry(0.55, 0.2, 16, 48);
    case "plane":
      // In its own XY plane, facing +Z (the default camera), like an image. Subdivided only so a
      // Depth layer, painted per vertex, blends smoothly across it.
      return new THREE.PlaneGeometry(1, 1, 32, 32);
    case "image":
      return createImagePlaneGeometry(entity.imageAspect);
    case "cube":
    default:
      return new THREE.BoxGeometry(1, 1, 1);
  }
}
