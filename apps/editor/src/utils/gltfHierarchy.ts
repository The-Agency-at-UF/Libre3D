import type * as THREE from "three";

// The single definition of how a parsed gltf.scene is walked into node paths.
// A nodePath is the child-index path from gltf.scene down to a node (e.g.
// [0, 2] = third child of the first top-level node). Both import-time
// extraction and render-time hydration DFS the same tree and must agree on
// this exact order and shape, or nodePath keys stop matching and nodes fail
// to hydrate silently — so the traversal lives here, in one place, and both
// sides call it instead of re-implementing it.
export function walkGltfScene(
  scene: THREE.Object3D,
  visit: (object: THREE.Object3D, nodePath: number[]) => void,
): void {
  const walk = (object: THREE.Object3D, nodePath: number[]) => {
    visit(object, nodePath);
    object.children.forEach((child, index) => walk(child, [...nodePath, index]));
  };

  scene.children.forEach((child, index) => walk(child, [index]));
}

// The canonical string key for a nodePath, used wherever paths index a Map.
export function nodePathKey(nodePath: number[]): string {
  return nodePath.join(",");
}

// Collects every Bone referenced by any SkinnedMesh's skeleton in the scene.
// Used to protect bones from the empty/pass-through pruning pass (see
// pruneImportHierarchy.ts) -- a bone often has no mesh and nothing else
// marking it as significant, but removing one breaks skinning.
export function collectSkinnedBones(scene: THREE.Object3D): Set<THREE.Object3D> {
  const bones = new Set<THREE.Object3D>();
  scene.traverse((object) => {
    if ((object as THREE.SkinnedMesh).isSkinnedMesh) {
      (object as THREE.SkinnedMesh).skeleton?.bones.forEach((bone) => bones.add(bone));
    }
  });
  return bones;
}
