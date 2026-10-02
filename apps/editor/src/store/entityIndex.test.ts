import { describe, expect, it } from "vitest";
import type { Entity } from "./useEditorStore";
import {
  canReparentEntities,
  filterMoveRoots,
  getAncestorIds,
  getChildren,
  getDescendantIds,
} from "./entityIndex";

const makeEntity = (id: string, overrides: Partial<Entity> = {}): Entity => ({
  id,
  type: "cube",
  name: id,
  position: [0, 0, 0],
  rotation: [0, 0, 0],
  scale: [1, 1, 1],
  visible: true,
  locked: false,
  parentId: null,
  ...overrides,
});

// Scene used by most tests:
//
//   groupA
//   ├── a1
//   │   └── a1x
//   │       └── a1xDeep
//   └── a2
//   groupB
//   └── b1
//   loose            (parentId undefined — legacy entities predate parenting)
//   model            (imported model's synthetic root, rootEntityId === id)
//   ├── modelMesh
//   └── modelArm
//       └── modelHand
const buildScene = (): Entity[] => [
  makeEntity("groupA", { type: "group" }),
  makeEntity("a1", { parentId: "groupA" }),
  makeEntity("a1x", { parentId: "a1" }),
  makeEntity("a1xDeep", { parentId: "a1x" }),
  makeEntity("a2", { parentId: "groupA" }),
  makeEntity("groupB", { type: "group" }),
  makeEntity("b1", { parentId: "groupB" }),
  makeEntity("loose", { parentId: undefined }),
  makeEntity("model", { type: "importedModel", rootEntityId: "model" }),
  makeEntity("modelMesh", { type: "importedModel", parentId: "model", rootEntityId: "model", nodePath: [0] }),
  makeEntity("modelArm", { type: "importedModel", parentId: "model", rootEntityId: "model", nodePath: [1] }),
  makeEntity("modelHand", { type: "importedModel", parentId: "modelArm", rootEntityId: "model", nodePath: [1, 0] }),
];

describe("getChildren", () => {
  it("returns only direct children, in store order", () => {
    const entities = buildScene();
    expect(getChildren(entities, "groupA").map((entity) => entity.id)).toEqual(["a1", "a2"]);
  });

  it("treats a missing parentId the same as null (scene root)", () => {
    const entities = buildScene();
    expect(getChildren(entities, null).map((entity) => entity.id)).toEqual(["groupA", "groupB", "loose", "model"]);
  });

  it("returns an empty array for leaves and unknown parents", () => {
    const entities = buildScene();
    expect(getChildren(entities, "a2")).toEqual([]);
    expect(getChildren(entities, "does-not-exist")).toEqual([]);
  });

  it("reflects a new entities array rather than a stale memoized index", () => {
    const entities = buildScene();
    expect(getChildren(entities, "groupB").map((entity) => entity.id)).toEqual(["b1"]);

    const next = [...entities, makeEntity("b2", { parentId: "groupB" })];
    expect(getChildren(next, "groupB").map((entity) => entity.id)).toEqual(["b1", "b2"]);
  });
});

describe("getDescendantIds", () => {
  it("returns every descendant in pre-order, excluding the root itself", () => {
    const entities = buildScene();
    expect(getDescendantIds(entities, "groupA")).toEqual(["a1", "a1x", "a1xDeep", "a2"]);
  });

  it("returns an empty array for leaves and unknown ids", () => {
    const entities = buildScene();
    expect(getDescendantIds(entities, "a1xDeep")).toEqual([]);
    expect(getDescendantIds(entities, "does-not-exist")).toEqual([]);
  });

  it("does not leak into sibling subtrees", () => {
    const entities = buildScene();
    expect(getDescendantIds(entities, "a1")).toEqual(["a1x", "a1xDeep"]);
    expect(getDescendantIds(entities, "a1")).not.toContain("a2");
  });

  it("terminates on a parent cycle from corrupted persisted state", () => {
    const entities = [
      makeEntity("x", { parentId: "y" }),
      makeEntity("y", { parentId: "x" }),
    ];
    expect(getDescendantIds(entities, "x")).toEqual(["y"]);
  });
});

describe("getAncestorIds", () => {
  it("returns ancestors nearest-first", () => {
    const entities = buildScene();
    expect(getAncestorIds(entities, "a1xDeep")).toEqual(["a1x", "a1", "groupA"]);
    expect(getAncestorIds(entities, "groupA")).toEqual([]);
  });

  it("terminates on a parent cycle from corrupted persisted state", () => {
    const entities = [
      makeEntity("x", { parentId: "y" }),
      makeEntity("y", { parentId: "x" }),
    ];
    expect(getAncestorIds(entities, "x")).toEqual(["y", "x"]);
  });
});

describe("filterMoveRoots", () => {
  it("drops direct children of an already-selected node", () => {
    const entities = buildScene();
    expect(filterMoveRoots(entities, ["groupA", "a1", "a2"])).toEqual(["groupA"]);
  });

  it("drops deep descendants even when the intermediate parent isn't selected", () => {
    const entities = buildScene();
    expect(filterMoveRoots(entities, ["a1xDeep", "groupA"])).toEqual(["groupA"]);
  });

  it("keeps unrelated nodes and siblings, preserving selection order", () => {
    const entities = buildScene();
    expect(filterMoveRoots(entities, ["b1", "a2", "a1", "loose"])).toEqual(["b1", "a2", "a1", "loose"]);
  });

  it("drops unknown ids and duplicate ids", () => {
    const entities = buildScene();
    expect(filterMoveRoots(entities, ["a2", "ghost", "a2"])).toEqual(["a2"]);
  });

  it("returns an empty array for an empty selection", () => {
    expect(filterMoveRoots(buildScene(), [])).toEqual([]);
  });
});

describe("canReparentEntities", () => {
  describe("cycle prevention", () => {
    it("rejects reparenting a node onto itself", () => {
      expect(canReparentEntities(buildScene(), ["groupA"], "groupA")).toBe(false);
    });

    it("rejects reparenting a node into its direct child", () => {
      expect(canReparentEntities(buildScene(), ["groupA"], "a1")).toBe(false);
    });

    it("rejects reparenting a node into a deep descendant", () => {
      expect(canReparentEntities(buildScene(), ["groupA"], "a1xDeep")).toBe(false);
    });

    it("rejects when a selected ancestor would land in its own subtree, even if the descendant is also selected", () => {
      // filterMoveRoots reduces this to ["a1"], whose subtree contains the target.
      expect(canReparentEntities(buildScene(), ["a1", "a1x"], "a1xDeep")).toBe(false);
    });

    it("rejects the whole batch if any one move root would create a cycle", () => {
      expect(canReparentEntities(buildScene(), ["b1", "a1"], "a1x")).toBe(false);
    });
  });

  describe("ordinary entities", () => {
    it("allows moving into an unrelated group", () => {
      expect(canReparentEntities(buildScene(), ["a1"], "groupB")).toBe(true);
    });

    it("allows moving a descendant up to one of its ancestors", () => {
      expect(canReparentEntities(buildScene(), ["a1xDeep"], "groupA")).toBe(true);
    });

    it("allows moving to the scene root", () => {
      expect(canReparentEntities(buildScene(), ["a1x", "b1"], null)).toBe(true);
    });

    it("allows a multi-selection into a target outside all of their subtrees", () => {
      expect(canReparentEntities(buildScene(), ["a2", "b1", "loose"], "a1x")).toBe(true);
    });

    it("rejects a target that doesn't exist", () => {
      expect(canReparentEntities(buildScene(), ["a1"], "ghost")).toBe(false);
    });

    it("rejects an empty or entirely unknown selection", () => {
      expect(canReparentEntities(buildScene(), [], "groupB")).toBe(false);
      expect(canReparentEntities(buildScene(), ["ghost"], "groupB")).toBe(false);
    });
  });

  describe("imported-model boundary", () => {
    it("allows an internal node to move elsewhere inside its own model", () => {
      expect(canReparentEntities(buildScene(), ["modelHand"], "model")).toBe(true);
      expect(canReparentEntities(buildScene(), ["modelMesh"], "modelHand")).toBe(true);
    });

    it("rejects an internal node leaving its model for the scene root", () => {
      expect(canReparentEntities(buildScene(), ["modelHand"], null)).toBe(false);
    });

    it("rejects an internal node leaving its model for an unrelated group", () => {
      expect(canReparentEntities(buildScene(), ["modelMesh"], "groupA")).toBe(false);
    });

    it("rejects a mixed batch where only the internal node would leave its model", () => {
      expect(canReparentEntities(buildScene(), ["a2", "modelMesh"], "groupB")).toBe(false);
    });

    it("lets the model's synthetic root move freely", () => {
      expect(canReparentEntities(buildScene(), ["model"], "groupA")).toBe(true);
      expect(canReparentEntities(buildScene(), ["model"], null)).toBe(true);
    });

    it("still rejects moving the model root into its own subtree", () => {
      expect(canReparentEntities(buildScene(), ["model"], "modelHand")).toBe(false);
    });

    it("allows an ordinary entity to be parented under an imported node", () => {
      expect(canReparentEntities(buildScene(), ["b1"], "modelArm")).toBe(true);
    });
  });
});
