import * as THREE from "three";
import type { Entity } from "../store/useEditorStore";
import { getEntityIndex, getAncestorIds } from "../store/entityIndex";

// Pure-math world/local transform solving over the *stored* entity tree.
// Reparenting must preserve an entity's world-space placement, and it must do
// so inside a single store `set()` (one undo step) — so it can't reach into
// the live THREE scene graph for world matrices. Instead the world matrix is
// composed by walking the stored parent chain. For imported glTF nodes the
// stored TRS mirrors the file's local transforms and the stored parent chain
// mirrors the file's nesting (gltf.scene itself is an identity wrapper), so
// this composition matches the rendered world transform.

export interface EntityTRS {
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
}

const composeLocalMatrix = (entity: Entity): THREE.Matrix4 =>
  new THREE.Matrix4().compose(
    new THREE.Vector3(...entity.position),
    new THREE.Quaternion().setFromEuler(new THREE.Euler(...entity.rotation, "XYZ")),
    new THREE.Vector3(...entity.scale),
  );

export function getEntityWorldMatrix(entities: Entity[], id: string): THREE.Matrix4 {
  const { byId } = getEntityIndex(entities);
  // getAncestorIds returns nearest-first; reverse to compose root-down.
  const chain = [...getAncestorIds(entities, id)].reverse();
  chain.push(id);

  const world = new THREE.Matrix4();
  for (const chainId of chain) {
    const entity = byId.get(chainId);
    if (entity) world.multiply(composeLocalMatrix(entity));
  }
  return world;
}

export function makeTranslationMatrix(position: [number, number, number]): THREE.Matrix4 {
  return new THREE.Matrix4().makeTranslation(...position);
}

export function getWorldPosition(world: THREE.Matrix4): [number, number, number] {
  const position = new THREE.Vector3().setFromMatrixPosition(world);
  return [position.x, position.y, position.z];
}

// Solve the local TRS that keeps `world` unchanged under `parentWorld`
// (null = scene root). Note: decompose can't represent shear, so a parent
// with non-uniform scale + rotation loses that residue — same limitation
// Blender's re-parenting has.
export function solveLocalFromWorld(world: THREE.Matrix4, parentWorld: THREE.Matrix4 | null): EntityTRS {
  const local = world.clone();
  if (parentWorld) {
    local.premultiply(parentWorld.clone().invert());
  }

  const position = new THREE.Vector3();
  const quaternion = new THREE.Quaternion();
  const scale = new THREE.Vector3();
  local.decompose(position, quaternion, scale);
  const euler = new THREE.Euler().setFromQuaternion(quaternion, "XYZ");

  return {
    position: [position.x, position.y, position.z],
    rotation: [euler.x, euler.y, euler.z],
    scale: [scale.x, scale.y, scale.z],
  };
}
