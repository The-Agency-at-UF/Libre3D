import * as THREE from "three";

export interface PrunableNode {
  id: string;
  parentId: string | null;
  hasMesh: boolean;
  isProtected: boolean;
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
}

export interface PruneOutcome {
  keptById: Map<string, PrunableNode>;
  removedIds: Set<string>;
}

// Collapses pass-through wrappers (no mesh, exactly one child) into their
// single child -- baking the wrapper's local transform into the child's via
// matrix composition -- and drops dead leaves (no mesh, no children)
// entirely. Both are lossless: a wrapper contributes nothing visually on its
// own, and a dead leaf renders nothing and has nothing depending on it.
// isProtected (bones) and the root (parentId === null) are never touched.
// Deliberately conservative: a no-mesh node with *more than one* child is left
// alone even though collapsing it would still be lossless, since it's more
// likely a meaningful, user-authored organizational group than export cruft
// (see the plan doc for the full reasoning) -- revisit case-by-case, not here.
// Runs as a fixed-point loop since removing one node can make its former
// parent newly eligible (e.g. a 2-child parent losing a dead-leaf child
// becomes a 1-child wrapper candidate); import hierarchies are small enough
// that this is cheap despite not being linear time.
export function pruneImportNodes(nodes: PrunableNode[]): PruneOutcome {
  const byId = new Map<string, PrunableNode>(nodes.map((node) => [node.id, { ...node }]));
  const removedIds = new Set<string>();

  let changed = true;
  while (changed) {
    changed = false;
    for (const node of byId.values()) {
      if (node.parentId === null || node.isProtected || node.hasMesh) continue;

      const children = [...byId.values()].filter((candidate) => candidate.parentId === node.id);

      if (children.length === 0) {
        byId.delete(node.id);
        removedIds.add(node.id);
        changed = true;
        break;
      }

      if (children.length === 1) {
        const child = children[0];
        const composed = composeLocalTransform(node, child);
        child.position = composed.position;
        child.rotation = composed.rotation;
        child.scale = composed.scale;
        child.parentId = node.parentId;
        byId.delete(node.id);
        removedIds.add(node.id);
        changed = true;
        break;
      }
    }
  }

  return { keptById: byId, removedIds };
}

function composeLocalTransform(
  parent: PrunableNode,
  child: PrunableNode,
): Pick<PrunableNode, "position" | "rotation" | "scale"> {
  const parentMatrix = new THREE.Matrix4().compose(
    new THREE.Vector3(...parent.position),
    new THREE.Quaternion().setFromEuler(new THREE.Euler(...parent.rotation, "XYZ")),
    new THREE.Vector3(...parent.scale),
  );
  const childMatrix = new THREE.Matrix4().compose(
    new THREE.Vector3(...child.position),
    new THREE.Quaternion().setFromEuler(new THREE.Euler(...child.rotation, "XYZ")),
    new THREE.Vector3(...child.scale),
  );
  const composed = parentMatrix.multiply(childMatrix);

  const position = new THREE.Vector3();
  const quaternion = new THREE.Quaternion();
  const scale = new THREE.Vector3();
  composed.decompose(position, quaternion, scale);
  const rotation = new THREE.Euler().setFromQuaternion(quaternion, "XYZ");

  return {
    position: [position.x, position.y, position.z],
    rotation: [rotation.x, rotation.y, rotation.z],
    scale: [scale.x, scale.y, scale.z],
  };
}
