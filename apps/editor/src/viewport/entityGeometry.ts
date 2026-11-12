/**
 * PURPOSE: Builds the geometry of a primitive entity (cube, sphere, torus, plane, image).
 *
 * INPUT: An entity. OUTPUT: A new geometry in the entity's own space, at unit size; the entity's
 * scale sizes it.
 *
 * A primitive with a Displace layer is built finer (its `quality`), so the surface has points to
 * move, with what the Displace shader needs (displaceNodes.ts): a push direction per point that is
 * the same wherever points meet (a cube's faces would crack apart along their normals), and
 * tangents.
 *
 * Not here: paths and shapes, whose geometry follows their points (paths/PathMesh.ts,
 * paths/ShapeMesh.ts), and imported models, which bring their own (importedModels.ts). A new
 * primitive type's builder goes here.
 */

import * as THREE from "three";
import { DISPLACEABLE_ENTITY_TYPES } from "../scene/layerStack";
import type { DisplaceQuality, Entity } from "../scene/types";
import { createImagePlaneGeometry } from "../utils/imagePlane";
import { DISPLACE_DIRECTION } from "./displaceNodes";

// Segments for each quality: a cube's per face edge, a plane's per edge, a sphere's around (and
// half that from pole to pole), a torus's around its ring (and a quarter that around its tube).
const DETAIL: Record<DisplaceQuality, number> = { low: 32, medium: 64, high: 128 };

/** How finely `entity` is built for its Displace layers: their quality (the finest asked), or null without one. */
export const displaceDetail = (entity: Entity): DisplaceQuality | null => {
  if (!DISPLACEABLE_ENTITY_TYPES.includes(entity.type)) return null;
  const qualities = (entity.materialLayers ?? []).flatMap((layer) => (layer.type === "displace" && layer.enabled ? [layer.quality] : []));
  if (qualities.length === 0) return null;
  return qualities.includes("high") ? "high" : qualities.includes("medium") ? "medium" : "low";
};

// A cube's push direction: the average of the faces' normals a point lies on, so a point on an
// edge or a corner, which each face has its own copy of, moves the same way on every face.
const cubeDirections = (geometry: THREE.BufferGeometry): Float32Array => {
  const position = geometry.getAttribute("position");
  const directions = new Float32Array(position.count * 3);
  const onFace = (value: number): number => (Math.abs(value) >= 0.5 - 1e-6 ? Math.sign(value) : 0);
  const point = new THREE.Vector3();
  for (let i = 0; i < position.count; i++) {
    point.set(onFace(position.getX(i)), onFace(position.getY(i)), onFace(position.getZ(i))).normalize();
    point.toArray(directions, i * 3);
  }
  return directions;
};

const displacedGeometry = (entity: Entity, quality: DisplaceQuality): THREE.BufferGeometry => {
  const detail = DETAIL[quality];
  let geometry: THREE.BufferGeometry;
  switch (entity.type) {
    case "sphere":
      geometry = new THREE.SphereGeometry(0.5, detail * 4, detail * 2);
      break;
    case "torus":
      geometry = new THREE.TorusGeometry(0.55, 0.2, detail, detail * 4);
      break;
    case "plane":
      geometry = new THREE.PlaneGeometry(1, 1, detail * 4, detail * 4);
      break;
    case "cube":
    default:
      geometry = new THREE.BoxGeometry(1, 1, 1, detail, detail, detail);
  }
  const directions = entity.type === "cube" ? cubeDirections(geometry) : (geometry.getAttribute("normal").array as Float32Array).slice();
  geometry.setAttribute(DISPLACE_DIRECTION, new THREE.BufferAttribute(directions, 3));
  geometry.computeTangents();
  return geometry;
};

export function createPrimitiveGeometry(entity: Entity): THREE.BufferGeometry {
  const quality = displaceDetail(entity);
  if (quality) return displacedGeometry(entity, quality);
  switch (entity.type) {
    case "sphere":
      // 64 × 64 segments, as Spline's default sphere, so big spheres keep a round outline.
      return new THREE.SphereGeometry(0.5, 64, 64);
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
