import { describe, expect, it } from "vitest";
import type { Entity } from "../../scene/types";
import { findVisibleIds, flattenRows } from "./hierarchyRows";

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

//   group
//   ├── inner          (a group with one child)
//   │   └── leaf
//   └── sibling
//   solo
const scene: Entity[] = [
  makeEntity("group", { type: "group", name: "Group" }),
  makeEntity("inner", { type: "group", name: "Inner", parentId: "group" }),
  makeEntity("leaf", { type: "sphere", name: "Leaf", parentId: "inner" }),
  makeEntity("sibling", { name: "Sibling", parentId: "group" }),
  makeEntity("solo", { type: "torus", name: "Solo" }),
];

const none = new Set<string>();
const ids = (rows: { id: string }[]) => rows.map((row) => row.id);

describe("findVisibleIds", () => {
  it("is null without a search", () => {
    expect(findVisibleIds(scene, "")).toBeNull();
  });

  it("shows a match and its ancestors", () => {
    expect([...findVisibleIds(scene, "leaf")!].sort()).toEqual(["group", "inner", "leaf"]);
  });

  it("matches the type as well as the name", () => {
    expect([...findVisibleIds(scene, "torus")!]).toEqual(["solo"]);
  });

  it("ignores the case of names", () => {
    expect([...findVisibleIds(scene, "sib")!].sort()).toEqual(["group", "sibling"]);
  });

  it("is empty when nothing matches", () => {
    expect(findVisibleIds(scene, "zzz")!.size).toBe(0);
  });
});

describe("flattenRows", () => {
  it("lists the tree top to bottom when everything is expanded", () => {
    expect(ids(flattenRows(scene, null, none, false))).toEqual(["group", "inner", "leaf", "sibling", "solo"]);
  });

  it("leaves out what is under a collapsed row", () => {
    const rows = flattenRows(scene, null, new Set(["group"]), false);
    expect(ids(rows)).toEqual(["group", "solo"]);
    expect(rows[0]).toEqual({ id: "group", depth: 1, hasChildren: true, isExpanded: false });
  });

  it("says which rows have children and which are expanded", () => {
    const rows = flattenRows(scene, null, new Set(["inner", "leaf"]), false);
    expect(rows).toEqual([
      { id: "group", depth: 1, hasChildren: true, isExpanded: true },
      { id: "inner", depth: 2, hasChildren: true, isExpanded: false },
      { id: "sibling", depth: 2, hasChildren: false, isExpanded: true },
      { id: "solo", depth: 1, hasChildren: false, isExpanded: true },
    ]);
  });

  it("keeps an only child at its parent's indent", () => {
    const rows = flattenRows(scene, null, none, false);
    const depth = Object.fromEntries(rows.map((row) => [row.id, row.depth]));
    // Two roots, so they indent once; "inner" has one child, which stays at inner's depth.
    expect(depth).toEqual({ group: 1, inner: 2, leaf: 2, sibling: 2, solo: 1 });
  });

  it("puts a single root at depth 0", () => {
    const rows = flattenRows([makeEntity("only", { type: "group" }), makeEntity("a", { parentId: "only" }), makeEntity("b", { parentId: "only" })], null, none, false);
    expect(rows.map((row) => row.depth)).toEqual([0, 1, 1]);
  });

  it("expands every branch while searching, whatever is collapsed", () => {
    const visible = findVisibleIds(scene, "leaf");
    const rows = flattenRows(scene, visible, new Set(["group", "inner"]), true);
    expect(ids(rows)).toEqual(["group", "inner", "leaf"]);
    expect(rows.every((row) => row.isExpanded)).toBe(true);
  });

  it("is empty for an empty scene", () => {
    expect(flattenRows([], null, none, false)).toEqual([]);
  });
});
