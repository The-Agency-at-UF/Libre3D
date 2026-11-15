import { describe, expect, it } from "vitest";
import {
  ACTION_INFO,
  OFFERED_ACTIONS,
  actionEffect,
  actionTargetId,
  cloneAction,
  createAction,
  normalizeAction,
  type SoundAction,
} from "./actions";
import type { ObjectState } from "./objectStates";
import type { TransitionAction } from "./transitions";

const states: Record<string, ObjectState> = { up: { id: "up", targetId: "cube", name: "Up", order: 0, values: {} } };

describe("normalizeAction", () => {
  it("fills in an Open Link's defaults and drops a url that isn't a string", () => {
    expect(normalizeAction({ id: "l", type: "openLink" })).toEqual({ id: "l", type: "openLink", url: "", newTab: true });
    expect(normalizeAction({ id: "l", type: "openLink", url: 42, newTab: false })).toEqual({ id: "l", type: "openLink", url: "", newTab: false });
  });

  it("fills in a Sound's defaults and clamps its volume to 0–1", () => {
    expect(normalizeAction({ id: "s", type: "sound" })).toEqual({ id: "s", type: "sound", assetId: "", volume: 1, loop: false, mode: "play" });
    expect(normalizeAction({ id: "s", type: "sound", assetId: "abc", volume: 3, loop: true, mode: "stop" })).toMatchObject({ volume: 1, loop: true, mode: "stop" });
    expect(normalizeAction({ id: "s", type: "sound", volume: -1 })).toMatchObject({ volume: 0 });
    expect(normalizeAction({ id: "s", type: "sound", volume: Number.NaN, mode: "shuffle" })).toMatchObject({ volume: 1, mode: "play" });
    // The file's name is kept when it's a string, and left out otherwise.
    expect(normalizeAction({ id: "s", type: "sound", name: "chime.ogg" })).toMatchObject({ name: "chime.ogg" });
    expect(normalizeAction({ id: "s", type: "sound", name: 7 })).not.toHaveProperty("name");
  });

  it("puts a transition into shape as normalizeTransition does", () => {
    expect(normalizeAction({ id: "t", type: "transition", targetId: "cube", from: "base", steps: [{ to: "up", duration: 2 }] })).toMatchObject({
      type: "transition",
      steps: [{ to: "up", duration: 2, easing: "easeInOut" }],
      loop: 0,
    });
  });

  it("drops an unknown type, a built-in property name, and what isn't an action", () => {
    expect(normalizeAction({ id: "x", type: "teleport" })).toBeNull();
    expect(normalizeAction({ id: "x", type: "constructor" })).toBeNull();
    expect(normalizeAction({ type: "openLink" })).toBeNull();
    expect(normalizeAction("openLink")).toBeNull();
  });
});

describe("the other helpers", () => {
  it("copies an action sharing nothing with it", () => {
    const transition = createAction("transition", { states, ownerId: "cube" });
    const copy = cloneAction(transition);
    copy.steps[0].duration = 9;
    expect(transition.steps[0].duration).toBe(1);

    const sound = createAction("sound", { states, ownerId: "cube" });
    expect(cloneAction(sound)).toEqual(sound);
    expect(cloneAction(sound)).not.toBe(sound);
  });

  it("makes a new action of each type, a transition moving the event's own object", () => {
    expect(createAction("transition", { states, ownerId: "cube" })).toMatchObject({ type: "transition", targetId: "cube", steps: [{ to: "up" }] });
    expect(createAction("openLink", { states, ownerId: "cube" })).toMatchObject({ type: "openLink", url: "", newTab: true });
    expect(createAction("sound", { states, ownerId: "cube" })).toMatchObject({ type: "sound", volume: 1, mode: "play" });
  });

  it("names a transition's target, and none for the others", () => {
    expect(actionTargetId(createAction("transition", { states, ownerId: "cube" }))).toBe("cube");
    expect(actionTargetId(createAction("openLink", { states, ownerId: "cube" }))).toBeNull();
  });

  it("asks for an effect only for a non-transition action with what it needs", () => {
    const sound: SoundAction = { id: "s", type: "sound", assetId: "abc", volume: 0.5, loop: true, mode: "play" };
    expect(actionEffect(sound)).toEqual({ type: "sound", assetId: "abc", volume: 0.5, loop: true, mode: "play" });
    expect(actionEffect({ ...sound, assetId: "" })).toBeNull();
    expect(actionEffect({ id: "l", type: "openLink", url: " https://Example.com", newTab: false })).toEqual({ type: "openLink", url: "https://example.com/", newTab: false });
    expect(actionEffect({ id: "l", type: "openLink", url: "javascript:alert(1)", newTab: true })).toBeNull();
    expect(actionEffect({ id: "l", type: "openLink", url: "example.com", newTab: true })).toBeNull();
    expect(actionEffect({ id: "l", type: "openLink", url: "", newTab: true })).toBeNull();
    expect(actionEffect(createAction("transition", { states, ownerId: "cube" }) as TransitionAction)).toBeNull();
  });

  it("offers every type, and names each", () => {
    expect(OFFERED_ACTIONS).toEqual(["transition", "openLink", "sound"]);
    expect(Object.keys(ACTION_INFO)).toEqual(["transition", "openLink", "sound"]);
  });
});
