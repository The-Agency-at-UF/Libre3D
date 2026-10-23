import * as THREE from "three";
import { describe, expect, it } from "vitest";
import { composeLocalMatrix, solveLocalFromWorld } from "../utils/entityTransforms";
import type { SceneEvent } from "./events";
import {
  cloneAnimation,
  cloneStateValues,
  createObjectState,
  duplicateStates,
  getObjectStates,
  getViewedState,
  nextStateName,
  pruneViewedStates,
  removeStatesOf,
  reparentStates,
  resolveState,
  unwrapRotation,
  type ObjectState,
  type Pose,
} from "./objectStates";

const DEG = Math.PI / 180;

const makeEntity = (id: string, overrides: Partial<Pose> = {}) => ({
  id,
  position: [1, 2, 3] as [number, number, number],
  rotation: [0, 0.5, 0] as [number, number, number],
  scale: [1, 1, 1] as [number, number, number],
  ...overrides,
});

const makeState = (id: string, targetId: string, overrides: Partial<ObjectState> = {}): ObjectState => ({
  id,
  targetId,
  name: "State",
  order: 0,
  values: {},
  ...overrides,
});

const statesById = (...states: ObjectState[]) => Object.fromEntries(states.map((state) => [state.id, state]));

describe("resolveState", () => {
  it("is the object's own values in Base", () => {
    expect(resolveState(makeEntity("cube"))).toEqual({ position: [1, 2, 3], rotation: [0, 0.5, 0], scale: [1, 1, 1] });
  });

  it("puts the state's values over Base and leaves the rest to follow Base", () => {
    const state = makeState("up", "cube", { values: { position: [1, 5, 3] } });

    expect(resolveState(makeEntity("cube", { rotation: [0, 1, 0] }), state)).toEqual({
      position: [1, 5, 3],
      rotation: [0, 1, 0],
      scale: [1, 1, 1],
    });
  });

  it("hands out copies, never the entity's or the state's own vectors", () => {
    const entity = makeEntity("cube");
    const state = makeState("up", "cube", { values: { position: [1, 5, 3] } });
    const pose = resolveState(entity, state);

    pose.position[0] = 99;
    pose.rotation[0] = 99;

    expect(state.values.position).toEqual([1, 5, 3]);
    expect(entity.rotation).toEqual([0, 0.5, 0]);
  });
});

describe("naming and order", () => {
  it("names states State, State 2, State 3, filling the first gap", () => {
    expect(nextStateName([])).toBe("State");
    expect(nextStateName([makeState("a", "cube")])).toBe("State 2");
    expect(nextStateName([makeState("a", "cube"), makeState("b", "cube", { name: "State 3" })])).toBe("State 2");
    expect(nextStateName([makeState("a", "cube", { name: "Up" })])).toBe("State");
  });

  it("lists an object's states in order and adds new ones last", () => {
    const states = statesById(
      makeState("b", "cube", { order: 3, name: "State 2" }),
      makeState("a", "cube", { order: 1 }),
      makeState("other", "sphere"),
    );

    expect(getObjectStates(states, "cube").map((state) => state.id)).toEqual(["a", "b"]);
    expect(createObjectState(states, "cube")).toMatchObject({ targetId: "cube", name: "State 3", order: 4, values: {} });
    expect(createObjectState(states, "torus")).toMatchObject({ name: "State", order: 0 });
  });
});

describe("unwrapRotation", () => {
  it("keeps a turn past 180° instead of the wrapped angle the gizmo reports", () => {
    const rotation = unwrapRotation([0, 0, -170 * DEG], [0, 0, 175 * DEG]);

    expect(rotation[2]).toBeCloseTo(190 * DEG);
  });

  it("keeps counting whole turns", () => {
    const rotation = unwrapRotation([10 * DEG, 0, 0], [350 * DEG, 0, 0]);

    expect(rotation[0]).toBeCloseTo(370 * DEG);
  });

  it("turns about Y past 90° without flipping X and Z by 180°", () => {
    // What the quaternion → XYZ Euler conversion gives for a 100° turn about Y.
    const euler = new THREE.Euler().setFromQuaternion(
      new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), 100 * DEG),
    );
    const rotation = unwrapRotation([euler.x, euler.y, euler.z], [0, 95 * DEG, 0]);

    expect(rotation[0]).toBeCloseTo(0);
    expect(rotation[1]).toBeCloseTo(100 * DEG);
    expect(rotation[2]).toBeCloseTo(0);
  });

  it("leaves a rotation alone when it's already nearest", () => {
    expect(unwrapRotation([0.1, 0.2, 0.3], [0, 0, 0])).toEqual([0.1, 0.2, 0.3]);
  });
});

describe("entity lifecycle", () => {
  it("drops the states of removed objects and keeps the rest", () => {
    const states = statesById(makeState("a", "cube"), makeState("b", "sphere"));

    expect(Object.keys(removeStatesOf(states, new Set(["cube"])))).toEqual(["b"]);
  });

  it("returns the same states when nothing removed had any, so nothing looks changed", () => {
    const states = statesById(makeState("a", "cube"));

    expect(removeStatesOf(states, new Set(["sphere"]))).toBe(states);
  });

  it("gives copies their own states with new IDs, moved with the copy", () => {
    const original = makeState("a", "cube", { values: { position: [0, 2, 0], rotation: [0, 1, 0] } });
    const child = makeState("b", "child", { values: { position: [1, 1, 1] } });
    const states = statesById(original, child);

    const { states: next, stateIdMap } = duplicateStates(
      states,
      new Map([["cube", "cube-copy"], ["child", "child-copy"]]),
      new Map([["cube", [0.5, 0, 0.5]]]),
    );
    const copies = Object.values(next).filter((state) => state.id !== "a" && state.id !== "b");

    expect(copies).toHaveLength(2);
    expect(next[stateIdMap.get("a")!]).toMatchObject({ targetId: "cube-copy", values: { position: [0.5, 2, 0.5], rotation: [0, 1, 0] } });
    // A child copy sits where the original child does, relative to its (moved) parent.
    expect(next[stateIdMap.get("b")!]).toMatchObject({ targetId: "child-copy", values: { position: [1, 1, 1] } });
    expect(next.a).toBe(original);
    expect(original.values.position).toEqual([0, 2, 0]);
  });

  it("returns the same states when no duplicated object had any", () => {
    const states = statesById(makeState("a", "sphere"));

    expect(duplicateStates(states, new Map([["cube", "cube-copy"]]), new Map()).states).toBe(states);
  });
});

describe("viewed states", () => {
  const states = statesById(makeState("up", "cube"), makeState("big", "sphere"));

  it("finds the state an object is shown in", () => {
    expect(getViewedState({ cube: "up" }, states, "cube")?.id).toBe("up");
    expect(getViewedState({ cube: "up" }, states, "sphere")).toBeNull();
  });

  it("shows Base for a state that's gone or belongs to another object", () => {
    expect(getViewedState({ cube: "deleted" }, states, "cube")).toBeNull();
    expect(getViewedState({ cube: "big" }, states, "cube")).toBeNull();
  });

  it("prunes the entries that show Base anyway", () => {
    expect(pruneViewedStates({ cube: "up", sphere: "deleted", torus: "big" }, states)).toEqual({ cube: "up" });
  });
});

describe("reparentStates", () => {
  const parentWorld = composeLocalMatrix({ position: [4, 0, 0], rotation: [0, 90 * DEG, 0], scale: [2, 2, 2] });

  it("keeps a state where it was in the world when its object moves under a new parent", () => {
    const entity = makeEntity("cube");
    const state = makeState("up", "cube", { values: { position: [1, 5, 3], rotation: [0.2, 0, 0] } });

    const moved = reparentStates(statesById(state), [{ entity, from: null, to: parentWorld }]).up;
    // The store re-solves the object's own values the same way; the state's scale follows them.
    const entityAfter = { id: "cube", ...solveLocalFromWorld(composeLocalMatrix(entity), parentWorld) };
    const worldBefore = composeLocalMatrix(resolveState(entity, state));
    const worldAfter = composeLocalMatrix(resolveState(entityAfter, moved)).premultiply(parentWorld);

    worldAfter.elements.forEach((value, index) => expect(value).toBeCloseTo(worldBefore.elements[index], 6));
  });

  it("keeps setting only what the state set", () => {
    const state = makeState("up", "cube", { values: { position: [1, 5, 3] } });

    const moved = reparentStates(statesById(state), [{ entity: makeEntity("cube"), from: parentWorld, to: null }]).up;

    expect(Object.keys(moved.values)).toEqual(["position"]);
  });

  it("keeps a whole turn when the parents differ only by position", () => {
    const state = makeState("spin", "cube", { values: { rotation: [0, 360 * DEG, 0] } });
    const shift = new THREE.Matrix4().makeTranslation(3, 0, 0);

    const moved = reparentStates(statesById(state), [{ entity: makeEntity("cube"), from: null, to: shift }]).spin;

    moved.values.rotation!.forEach((angle, axis) => expect(angle).toBeCloseTo([0, 360 * DEG, 0][axis]));
  });

  it("returns the same states when no moved object has any", () => {
    const states = statesById(makeState("up", "sphere", { values: { position: [0, 1, 0] } }));

    expect(reparentStates(states, [{ entity: makeEntity("cube"), from: null, to: parentWorld }])).toBe(states);
  });

  it("leaves a state that sets nothing as it is: it follows Base, which the store re-solves", () => {
    const empty = makeState("empty", "cube");

    expect(reparentStates(statesById(empty), [{ entity: makeEntity("cube"), from: null, to: parentWorld }]).empty).toBe(empty);
  });
});

describe("cloneAnimation", () => {
  it("copies states and events without sharing vectors, and fills a missing section", () => {
    const state = makeState("up", "cube", { values: { position: [0, 1, 0] } });
    const event = (): SceneEvent => ({ id: "e1", ownerId: "cube", trigger: "start", order: 0, actions: [] });
    const events = { e1: event() };
    const copy = cloneAnimation({ states: statesById(state), events });

    state.values.position![1] = 99;
    events.e1.ownerId = "other";

    expect(copy.states.up.values.position).toEqual([0, 1, 0]);
    expect(copy.events).toEqual({ e1: event() });
    expect(cloneAnimation(undefined)).toEqual({ states: {}, events: {} });
  });
});

describe("trim (paths)", () => {
  const path = (overrides: Partial<Pose> = {}) => makeEntity("path", { trimStart: 0, trimEnd: 1, ...overrides });

  it("is part of a path's pose, with the state's trim over its own", () => {
    const hidden = makeState("hidden", "path", { values: { trimEnd: 0 } });

    expect(resolveState(path())).toMatchObject({ trimStart: 0, trimEnd: 1 });
    expect(resolveState(path({ trimStart: 0.2 }), hidden)).toMatchObject({ trimStart: 0.2, trimEnd: 0 });
  });

  it("isn't part of a pose for an object without one", () => {
    expect(resolveState(makeEntity("cube"))).not.toHaveProperty("trimStart");
    expect(resolveState(makeEntity("cube"))).not.toHaveProperty("trimEnd");
  });

  it("survives copying, a trim of 0 included", () => {
    expect(cloneStateValues({ trimStart: 0, trimEnd: 0.5, position: [1, 2, 3] })).toEqual({
      trimStart: 0,
      trimEnd: 0.5,
      position: [1, 2, 3],
    });
    expect(cloneAnimation({ states: statesById(makeState("hidden", "path", { values: { trimEnd: 0 } })) }).states.hidden.values).toEqual({
      trimEnd: 0,
    });
  });

  it("goes with a duplicated path's states", () => {
    const states = statesById(makeState("hidden", "path", { values: { trimEnd: 0 } }));
    const { states: next, stateIdMap } = duplicateStates(states, new Map([["path", "path-copy"]]), new Map([["path", [0.5, 0, 0.5]]]));

    expect(next[stateIdMap.get("hidden")!].values).toEqual({ trimEnd: 0 });
  });

  it("stays in a state when its path moves to another parent", () => {
    const parentWorld = composeLocalMatrix({ position: [4, 0, 0], rotation: [0, 0, 0], scale: [2, 2, 2] });
    const states = statesById(
      makeState("hidden", "path", { values: { trimEnd: 0 } }),
      makeState("raised", "path", { values: { position: [1, 5, 3], trimStart: 0.5 } }),
    );

    const moved = reparentStates(states, [{ entity: path(), from: null, to: parentWorld }]);

    expect(moved.hidden).toBe(states.hidden); // a trim doesn't depend on the parent
    expect(moved.raised.values.trimStart).toBe(0.5);
    expect(Object.keys(moved.raised.values).sort()).toEqual(["position", "trimStart"]);
  });
});
