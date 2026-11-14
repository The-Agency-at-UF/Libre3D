import { describe, expect, it } from "vitest";
import type { Entity } from "../../scene/types";
import { inspectSelection } from "./inspectedSelection";

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

// Scene used by every test:
//
//   cube
//   logo             (group, as an SVG import makes)
//   ├── letterA      (shape)
//   └── inner        (group)
//       └── letterB  (shape)
//   looseShape       (shape)
//   sphere
const buildScene = (): Entity[] => [
  makeEntity("cube"),
  makeEntity("logo", { type: "group" }),
  makeEntity("letterA", { type: "shape", parentId: "logo" }),
  makeEntity("inner", { type: "group", parentId: "logo" }),
  makeEntity("letterB", { type: "shape", parentId: "inner" }),
  makeEntity("looseShape", { type: "shape" }),
  makeEntity("sphere", { type: "sphere" }),
];

const ids = (list: Entity[]) => list.map((entity) => entity.id);

describe("inspectSelection: selected", () => {
  it("lists the selected entities in scene order, whatever order they were selected in", () => {
    const { selected } = inspectSelection(buildScene(), ["sphere", "cube"]);
    expect(ids(selected)).toEqual(["cube", "sphere"]);
  });

  it("skips ids that match no entity", () => {
    const { selected } = inspectSelection(buildScene(), ["gone", "cube"]);
    expect(ids(selected)).toEqual(["cube"]);
  });

  it("is empty for an empty selection", () => {
    expect(inspectSelection(buildScene(), [])).toEqual({ selected: [], reachedShapes: [] });
  });
});

describe("inspectSelection: reachedShapes", () => {
  it("reaches the shapes inside a selected group, at any depth", () => {
    const { reachedShapes } = inspectSelection(buildScene(), ["logo"]);
    expect(ids(reachedShapes)).toEqual(["letterA", "letterB"]);
  });

  it("includes shapes selected directly, in scene order", () => {
    const { reachedShapes } = inspectSelection(buildScene(), ["looseShape", "inner"]);
    expect(ids(reachedShapes)).toEqual(["letterB", "looseShape"]);
  });

  it("is empty when anything else is selected too", () => {
    const { reachedShapes } = inspectSelection(buildScene(), ["logo", "cube"]);
    expect(reachedShapes).toEqual([]);
  });

  it("is empty for a group with no shapes in it", () => {
    const entities = [makeEntity("group", { type: "group" }), makeEntity("child", { parentId: "group" })];
    expect(inspectSelection(entities, ["group"]).reachedShapes).toEqual([]);
  });
});

describe("inspectSelection: what a re-render check sees", () => {
  it("returns the same result while neither array is replaced", () => {
    const entities = buildScene();
    const selectedIds = ["cube"];
    expect(inspectSelection(entities, selectedIds)).toBe(inspectSelection(entities, selectedIds));
  });

  it("keeps the selected entity objects when another entity changes", () => {
    const entities = buildScene();
    const selectedIds = ["cube"];
    const before = inspectSelection(entities, selectedIds).selected;

    const moved = entities.map((entity) => (entity.id === "sphere" ? { ...entity, position: [5, 0, 0] as Entity["position"] } : entity));
    const after = inspectSelection(moved, selectedIds).selected;

    // A new array holding the same objects: a shallow comparison calls it unchanged.
    expect(after).not.toBe(before);
    expect(after).toHaveLength(1);
    expect(after[0]).toBe(before[0]);
  });

  it("follows a selected entity that changes, and a new selection", () => {
    const entities = buildScene();
    const selectedIds = ["cube"];
    const before = inspectSelection(entities, selectedIds).selected;

    const moved = entities.map((entity) => (entity.id === "cube" ? { ...entity, position: [5, 0, 0] as Entity["position"] } : entity));
    expect(inspectSelection(moved, selectedIds).selected[0]).not.toBe(before[0]);
    expect(ids(inspectSelection(moved, ["sphere"]).selected)).toEqual(["sphere"]);
  });
});
