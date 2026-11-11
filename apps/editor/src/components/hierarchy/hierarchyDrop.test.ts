import { describe, expect, it } from "vitest";
import type { Entity } from "../../scene/types";
import { computeDropTarget, insertionIndex } from "./hierarchyDrop";
import { flattenRows } from "./hierarchyRows";

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

//   a                depth 1
//   group            depth 1
//   ├── c            depth 2
//   └── inner        depth 2
//       ├── d        depth 3
//       └── e        depth 3
//   z                depth 1
const scene: Entity[] = [
  makeEntity("a"),
  makeEntity("group", { type: "group" }),
  makeEntity("c", { parentId: "group" }),
  makeEntity("inner", { type: "group", parentId: "group" }),
  makeEntity("d", { parentId: "inner" }),
  makeEntity("e", { parentId: "inner" }),
  makeEntity("z"),
];

const expanded = flattenRows(scene, null, new Set(), false);
const collapsed = flattenRows(scene, null, new Set(["group", "inner"]), false);

const at = (ratio: number, cursorDepth = 0) => ({ ratio, getCursorDepth: () => cursorDepth });
const neverAsked = (ratio: number) => ({
  ratio,
  getCursorDepth: (): number => {
    throw new Error("the indent under the pointer should not be needed here");
  },
});

describe("insertionIndex", () => {
  it("is the reference row's place, or the place after it", () => {
    expect(insertionIndex(scene, ["z"], null, "group", false)).toBe(1);
    expect(insertionIndex(scene, ["z"], null, "group", true)).toBe(2);
  });

  it("counts the siblings without the dragged rows", () => {
    // Dragging "a" away: "group" is then the first root.
    expect(insertionIndex(scene, ["a"], null, "group", false)).toBe(0);
    expect(insertionIndex(scene, ["a"], null, "group", true)).toBe(1);
  });

  it("is the end with no reference row, or one that isn't a child of that parent", () => {
    expect(insertionIndex(scene, [], null, null, false)).toBe(3);
    expect(insertionIndex(scene, ["a"], null, null, false)).toBe(2);
    expect(insertionIndex(scene, [], "group", "z", false)).toBe(2);
  });
});

describe("computeDropTarget", () => {
  it("is null for a row that isn't on show", () => {
    expect(computeDropTarget(collapsed, scene, ["a"], "d", at(0.5))).toBeNull();
    expect(computeDropTarget(expanded, scene, ["a"], "missing", at(0.5))).toBeNull();
  });

  it("drops onto a row from its middle half", () => {
    expect(computeDropTarget(expanded, scene, ["a"], "group", neverAsked(0.5))).toEqual({ kind: "onto", targetId: "group" });
    expect(computeDropTarget(expanded, scene, ["a"], "group", neverAsked(0.25))).toEqual({ kind: "onto", targetId: "group" });
    expect(computeDropTarget(expanded, scene, ["a"], "group", neverAsked(0.75))).toEqual({ kind: "onto", targetId: "group" });
  });

  it("drops before a row from its top quarter", () => {
    expect(computeDropTarget(expanded, scene, ["z"], "inner", neverAsked(0.1))).toEqual({
      kind: "between", parentId: "group", index: 1, indicatorRowId: "inner", edge: "top", depth: 2,
    });
  });

  it("drops before a root row, not counting the dragged row", () => {
    expect(computeDropTarget(expanded, scene, ["a"], "z", neverAsked(0))).toEqual({
      kind: "between", parentId: null, index: 1, indicatorRowId: "z", edge: "top", depth: 1,
    });
  });

  it("drops in as the first child from the bottom quarter of an expanded branch", () => {
    expect(computeDropTarget(expanded, scene, ["a"], "group", neverAsked(0.9))).toEqual({
      kind: "between", parentId: "group", index: 0, indicatorRowId: "group", edge: "bottom", depth: 2,
    });
  });

  it("drops after a collapsed branch, as its sibling", () => {
    expect(computeDropTarget(collapsed, scene, ["a"], "group", at(0.9, 1))).toEqual({
      kind: "between", parentId: null, index: 1, indicatorRowId: "group", edge: "bottom", depth: 1,
    });
  });

  it("drops after a row that has a sibling below it, whatever the pointer's indent", () => {
    for (const cursorDepth of [0, 1, 2, 3, 9]) {
      expect(computeDropTarget(expanded, scene, ["a"], "d", at(0.9, cursorDepth))).toEqual({
        kind: "between", parentId: "inner", index: 1, indicatorRowId: "d", edge: "bottom", depth: 3,
      });
    }
  });

  describe("after the last row of a subtree, the pointer's indent picks the level", () => {
    // "e" ends "inner" and "group"; the next row, "z", is at depth 1.
    it("at e's own indent: after e, inside inner", () => {
      expect(computeDropTarget(expanded, scene, ["a"], "e", at(0.9, 3))).toEqual({
        kind: "between", parentId: "inner", index: 2, indicatorRowId: "e", edge: "bottom", depth: 3,
      });
    });

    it("one level out: after inner, inside group", () => {
      expect(computeDropTarget(expanded, scene, ["a"], "e", at(0.9, 2))).toEqual({
        kind: "between", parentId: "group", index: 2, indicatorRowId: "e", edge: "bottom", depth: 2,
      });
    });

    it("two levels out: after group, at the root", () => {
      // "a" is being dragged, so "group" is the first root and the place after it is 1.
      expect(computeDropTarget(expanded, scene, ["a"], "e", at(0.9, 1))).toEqual({
        kind: "between", parentId: null, index: 1, indicatorRowId: "e", edge: "bottom", depth: 1,
      });
    });

    it("further left than any level: the outermost one", () => {
      expect(computeDropTarget(expanded, scene, ["a"], "e", at(0.9, -4))).toMatchObject({ parentId: null, depth: 1 });
    });

    it("further right than any level: the row's own", () => {
      expect(computeDropTarget(expanded, scene, ["a"], "e", at(0.9, 12))).toMatchObject({ parentId: "inner", depth: 3 });
    });
  });

  it("after the very last row, the levels go out to the first row's depth", () => {
    expect(computeDropTarget(expanded, scene, ["a"], "z", at(0.9, 0))).toEqual({
      kind: "between", parentId: null, index: 2, indicatorRowId: "z", edge: "bottom", depth: 1,
    });
  });
});
