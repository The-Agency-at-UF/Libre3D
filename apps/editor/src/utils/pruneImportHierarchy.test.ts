import * as THREE from "three";
import { describe, expect, it } from "vitest";
import { pruneImportNodes, type PrunableNode } from "./pruneImportHierarchy";

const EPSILON = 1e-6;

const makeNode = (id: string, parentId: string | null, overrides: Partial<PrunableNode> = {}): PrunableNode => ({
  id,
  parentId,
  hasMesh: false,
  isProtected: false,
  position: [0, 0, 0],
  rotation: [0, 0, 0],
  scale: [1, 1, 1],
  ...overrides,
});

const mesh = (id: string, parentId: string | null, overrides: Partial<PrunableNode> = {}): PrunableNode =>
  makeNode(id, parentId, { hasMesh: true, ...overrides });

const worldMatrixOf = (nodesById: Map<string, PrunableNode>, id: string): THREE.Matrix4 => {
  const chain: PrunableNode[] = [];
  for (let node = nodesById.get(id); node; node = node.parentId ? nodesById.get(node.parentId) : undefined) {
    chain.unshift(node);
  }
  return chain.reduce(
    (world, node) =>
      world.multiply(
        new THREE.Matrix4().compose(
          new THREE.Vector3(...node.position),
          new THREE.Quaternion().setFromEuler(new THREE.Euler(...node.rotation, "XYZ")),
          new THREE.Vector3(...node.scale),
        ),
      ),
    new THREE.Matrix4(),
  );
};

const maxElementDifference = (a: THREE.Matrix4, b: THREE.Matrix4): number =>
  Math.max(...a.elements.map((value, index) => Math.abs(value - b.elements[index])));

// Every surviving node must render exactly where it did before pruning.
const expectWorldPreserved = (input: PrunableNode[], kept: Map<string, PrunableNode>) => {
  const inputById = new Map(input.map((node) => [node.id, node]));
  for (const id of kept.keys()) {
    const difference = maxElementDifference(worldMatrixOf(kept, id), worldMatrixOf(inputById, id));
    expect(difference, `world transform of "${id}"`).toBeLessThan(EPSILON);
  }
};

const sortedIds = (ids: Iterable<string>) => [...ids].sort();

describe("pruneImportNodes", () => {
  describe("nodes that always survive", () => {
    it("returns empty results for an empty hierarchy", () => {
      const { keptById, removedIds } = pruneImportNodes([]);
      expect(keptById.size).toBe(0);
      expect(removedIds.size).toBe(0);
    });

    it("never removes the root, even with no mesh and no children", () => {
      const { keptById, removedIds } = pruneImportNodes([makeNode("root", null)]);
      expect(sortedIds(keptById.keys())).toEqual(["root"]);
      expect(removedIds.size).toBe(0);
    });

    it("leaves mesh nodes and their transforms untouched", () => {
      const input = [
        makeNode("root", null),
        mesh("body", "root", { position: [1, 2, 3], rotation: [0.1, 0.2, 0.3], scale: [2, 2, 2] }),
        mesh("wheel", "root", { position: [-1, 0, 0] }),
      ];
      const { keptById, removedIds } = pruneImportNodes(input);
      expect(removedIds.size).toBe(0);
      expect(keptById.get("body")).toEqual(input[1]);
      expect(keptById.get("wheel")).toEqual(input[2]);
    });

    it("keeps a mesh node that has a single child (hasMesh wins over pass-through)", () => {
      const input = [makeNode("root", null), mesh("hull", "root"), mesh("turret", "hull")];
      const { keptById, removedIds } = pruneImportNodes(input);
      expect(removedIds.size).toBe(0);
      expect(keptById.get("turret")?.parentId).toBe("hull");
    });

    it("keeps a no-mesh group with multiple children as an organizational node", () => {
      const input = [
        makeNode("root", null),
        makeNode("wheels", "root", { position: [0, -1, 0] }),
        mesh("wheelLeft", "wheels", { position: [-1, 0, 0] }),
        mesh("wheelRight", "wheels", { position: [1, 0, 0] }),
      ];
      const { keptById, removedIds } = pruneImportNodes(input);
      expect(removedIds.size).toBe(0);
      expect(keptById.get("wheelLeft")?.parentId).toBe("wheels");
      expect(keptById.get("wheelRight")?.parentId).toBe("wheels");
    });

    it("never removes a protected (bone) node, even as a dead leaf", () => {
      const input = [makeNode("root", null), makeNode("boneTip", "root", { isProtected: true })];
      const { keptById, removedIds } = pruneImportNodes(input);
      expect(removedIds.size).toBe(0);
      expect(keptById.has("boneTip")).toBe(true);
    });

    it("never collapses a protected node that has a single child", () => {
      const input = [
        makeNode("root", null),
        makeNode("spine", "root", { isProtected: true, rotation: [0, 0, 0.5] }),
        makeNode("neck", "spine", { isProtected: true, position: [0, 1, 0] }),
      ];
      const { keptById, removedIds } = pruneImportNodes(input);
      expect(removedIds.size).toBe(0);
      expect(keptById.get("neck")).toEqual(input[2]);
    });
  });

  describe("dead leaves", () => {
    it("removes a no-mesh node with no children", () => {
      const input = [makeNode("root", null), mesh("body", "root"), makeNode("emptyLocator", "root")];
      const { keptById, removedIds } = pruneImportNodes(input);
      expect(sortedIds(removedIds)).toEqual(["emptyLocator"]);
      expect(sortedIds(keptById.keys())).toEqual(["body", "root"]);
    });

    it("removes an entire branch that bottoms out in nothing renderable", () => {
      const input = [
        makeNode("root", null),
        mesh("body", "root"),
        makeNode("w1", "root"),
        makeNode("w2", "w1"),
        makeNode("deadEnd", "w2"),
      ];
      const { keptById, removedIds } = pruneImportNodes(input);
      expect(sortedIds(removedIds)).toEqual(["deadEnd", "w1", "w2"]);
      expect(sortedIds(keptById.keys())).toEqual(["body", "root"]);
    });
  });

  describe("pass-through wrappers", () => {
    it("collapses a single-child wrapper into its child and preserves world transform", () => {
      const input = [
        makeNode("root", null, { position: [0, 0, 5] }),
        makeNode("wrapper", "root", { position: [2, 0, 0], rotation: [0, Math.PI / 2, 0], scale: [3, 3, 3] }),
        mesh("body", "wrapper", { position: [1, 0, 0], rotation: [0.2, 0, 0], scale: [1, 2, 1] }),
      ];
      const { keptById, removedIds } = pruneImportNodes(input);
      expect(sortedIds(removedIds)).toEqual(["wrapper"]);
      expect(keptById.get("body")?.parentId).toBe("root");
      expectWorldPreserved(input, keptById);
    });

    it("collapses a chain of stacked wrappers down to the meaningful node", () => {
      const input = [
        makeNode("root", null),
        makeNode("w1", "root", { rotation: [-Math.PI / 2, 0, 0] }),
        makeNode("w2", "w1", { scale: [0.01, 0.01, 0.01] }),
        makeNode("w3", "w2", { position: [0, 150, 0], rotation: [0, 0.3, 0] }),
        mesh("statue", "w3", { rotation: [0.4, -0.6, 0.8] }),
      ];
      const { keptById, removedIds } = pruneImportNodes(input);
      expect(sortedIds(removedIds)).toEqual(["w1", "w2", "w3"]);
      expect(sortedIds(keptById.keys())).toEqual(["root", "statue"]);
      expect(keptById.get("statue")?.parentId).toBe("root");
      expectWorldPreserved(input, keptById);
    });

    it("re-evaluates to a fixed point: a group left with one child after a dead leaf is dropped collapses too", () => {
      const input = [
        makeNode("root", null),
        makeNode("group", "root", { position: [0, 4, 0], rotation: [0, 1, 0] }),
        mesh("body", "group", { position: [1, 1, 1] }),
        makeNode("emptyHelper", "group"),
      ];
      const { keptById, removedIds } = pruneImportNodes(input);
      expect(sortedIds(removedIds)).toEqual(["emptyHelper", "group"]);
      expect(keptById.get("body")?.parentId).toBe("root");
      expectWorldPreserved(input, keptById);
    });

    it("collapses a wrapper above a bone: the bone survives, reparented, at the same world transform", () => {
      const input = [
        makeNode("root", null),
        makeNode("armature", "root", { rotation: [Math.PI / 2, 0, 0], scale: [0.5, 0.5, 0.5] }),
        makeNode("hips", "armature", { isProtected: true, position: [0, 1, 0] }),
      ];
      const { keptById, removedIds } = pruneImportNodes(input);
      expect(sortedIds(removedIds)).toEqual(["armature"]);
      expect(keptById.get("hips")?.parentId).toBe("root");
      expectWorldPreserved(input, keptById);
    });

    // The module comment calls collapsing "lossless", but baking a
    // non-uniformly scaled wrapper into a rotated child produces shear, which
    // a TRS can't hold. Marked `fails` so it flips if this is ever fixed.
    it.fails("known limitation: a non-uniformly scaled wrapper over a rotated child does not preserve world transform", () => {
      const input = [
        makeNode("root", null),
        makeNode("stretch", "root", { scale: [3, 1, 1] }),
        mesh("tilted", "stretch", { rotation: [0, 0, Math.PI / 4] }),
      ];
      const { keptById } = pruneImportNodes(input);
      expectWorldPreserved(input, keptById);
    });
  });

  describe("a realistic exporter hierarchy", () => {
    // Shaped like a typical Sketchfab/DCC export: several empty wrapper nodes
    // (axis conversion, unit scale, scene root) above the actual model, plus an
    // exported-but-empty light locator.
    const buildExport = (): PrunableNode[] => [
      makeNode("root", null),
      makeNode("Sketchfab_model", "root", { rotation: [-Math.PI / 2, 0, 0] }),
      makeNode("RootNode", "Sketchfab_model", { scale: [0.01, 0.01, 0.01] }),
      makeNode("GLTF_SceneRootNode", "RootNode", { position: [0, 20, 0], rotation: [Math.PI / 2, 0, 0] }),
      mesh("Body", "GLTF_SceneRootNode", { position: [0, 50, 0] }),
      makeNode("Wheels", "GLTF_SceneRootNode", { position: [0, 10, 0] }),
      mesh("Wheel_L", "Wheels", { position: [-80, 0, 0], rotation: [0, 0, Math.PI / 2] }),
      mesh("Wheel_R", "Wheels", { position: [80, 0, 0], rotation: [0, 0, -Math.PI / 2] }),
      makeNode("Light_Locator", "GLTF_SceneRootNode", { position: [0, 300, 100] }),
    ];

    it("strips wrappers and empty locators but keeps every mesh and the multi-child group", () => {
      const { keptById, removedIds } = pruneImportNodes(buildExport());
      expect(sortedIds(removedIds)).toEqual(["Light_Locator", "RootNode", "Sketchfab_model"]);
      expect(sortedIds(keptById.keys())).toEqual(["Body", "GLTF_SceneRootNode", "Wheel_L", "Wheel_R", "Wheels", "root"]);
      expect(keptById.get("GLTF_SceneRootNode")?.parentId).toBe("root");
      expect(keptById.get("Body")?.parentId).toBe("GLTF_SceneRootNode");
      expect(keptById.get("Wheel_L")?.parentId).toBe("Wheels");
    });

    it("keeps every surviving node at its original world transform", () => {
      const input = buildExport();
      const { keptById } = pruneImportNodes(input);
      expectWorldPreserved(input, keptById);
    });

    it("partitions the input: every id is either kept or removed, never both", () => {
      const input = buildExport();
      const { keptById, removedIds } = pruneImportNodes(input);
      expect(keptById.size + removedIds.size).toBe(input.length);
      for (const id of removedIds) expect(keptById.has(id)).toBe(false);
    });

    it("does not mutate the caller's nodes", () => {
      const input = buildExport();
      const snapshot = structuredClone(input);
      pruneImportNodes(input);
      expect(input).toEqual(snapshot);
    });
  });
});
