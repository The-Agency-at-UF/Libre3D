import { describe, expect, it } from "vitest";
import {
  createEvent,
  createTransition,
  duplicateEvents,
  getObjectEvents,
  normalizeEvents,
  removeEventsOf,
  type SceneEvent,
} from "./events";
import type { ObjectState } from "./objectStates";
import type { TransitionAction } from "./transitions";

const state = (id: string, targetId: string, order = 0): ObjectState => ({ id, targetId, name: id, order, values: {} });

const transition = (overrides: Partial<TransitionAction> = {}): TransitionAction => ({
  id: "action",
  type: "transition",
  targetId: "cube",
  from: "base",
  steps: [{ to: "up", duration: 1, easing: "linear" }],
  delay: 0,
  delayRepeat: "none",
  loop: 0,
  cycle: "restart",
  ...overrides,
});

const event = (id: string, overrides: Partial<SceneEvent> = {}): SceneEvent => ({
  id,
  ownerId: "cube",
  trigger: "start",
  order: 0,
  actions: [transition()],
  ...overrides,
});

const byId = <T extends { id: string }>(...items: T[]) => Object.fromEntries(items.map((item) => [item.id, item]));

describe("creating events", () => {
  it("lists an object's events in order and adds new ones last", () => {
    const events = byId(event("b", { order: 3 }), event("a", { order: 1 }), event("other", { ownerId: "ball" }));

    expect(getObjectEvents(events, "cube").map((e) => e.id)).toEqual(["a", "b"]);
    expect(createEvent(events, {}, "cube", "mouseDown")).toMatchObject({ ownerId: "cube", trigger: "mouseDown", order: 4 });
    expect(createEvent({}, {}, "cube", "start").order).toBe(0);
  });

  it("starts a transition from Base to the object's first state, or with no state picked", () => {
    const states = byId(state("second", "cube", 2), state("first", "cube", 1), state("ballState", "ball"));

    expect(createTransition(states, "cube")).toMatchObject({
      type: "transition",
      targetId: "cube",
      from: "base",
      steps: [{ to: "first", duration: 1, easing: "easeInOut" }],
      delay: 0,
      delayRepeat: "none",
      loop: 0,
      cycle: "restart",
    });
    expect(createTransition({}, "cube").steps[0].to).toBe("");
  });

  it("gives every new event and action its own ID", () => {
    const a = createEvent({}, {}, "cube", "start");
    const b = createEvent({}, {}, "cube", "start");

    expect(a.id).not.toBe(b.id);
    expect(a.actions[0].id).not.toBe(b.actions[0].id);
  });
});

describe("removeEventsOf", () => {
  it("drops removed objects' events and other events' actions that move them, keeping emptied events", () => {
    const events = byId(
      event("own", { ownerId: "sphere" }),
      event("click", { ownerId: "button", actions: [transition({ targetId: "sphere" }), transition({ targetId: "cube" })] }),
      event("only", { ownerId: "button", actions: [transition({ targetId: "sphere" })] }),
      event("untouched"),
    );

    const next = removeEventsOf(events, new Set(["sphere"]));

    expect(Object.keys(next).sort()).toEqual(["click", "only", "untouched"]);
    expect(next.click.actions.map((a) => a.targetId)).toEqual(["cube"]);
    expect(next.only.actions).toEqual([]);
    expect(next.untouched).toBe(events.untouched);
    expect(events.click.actions).toHaveLength(2);
  });

  it("returns the same events when nothing involved the removed objects", () => {
    const events = byId(event("e"));

    expect(removeEventsOf(events, new Set(["ball"]))).toBe(events);
  });
});

describe("duplicateEvents", () => {
  it("copies an original's events onto its copy, moving the copy through the copy's states", () => {
    const events = byId(
      event("self", { actions: [transition({ from: "down", steps: [{ to: "up", duration: 1, easing: "linear" }, { to: "base", duration: 1, easing: "linear" }] })] }),
      event("other", { actions: [transition({ id: "ballAction", targetId: "ball", steps: [{ to: "ballUp", duration: 1, easing: "linear" }] })] }),
      event("elsewhere", { ownerId: "ball" }),
    );

    const next = duplicateEvents(events, new Map([["cube", "cube-copy"]]), new Map([["up", "up-copy"], ["down", "down-copy"]]));
    const copies = Object.values(next).filter((e) => e.ownerId === "cube-copy");

    expect(Object.keys(next)).toHaveLength(5);
    expect(copies).toHaveLength(2);
    expect(copies.every((copy) => !(copy.id in events))).toBe(true);

    const self = copies.find((copy) => copy.actions[0].targetId === "cube-copy")!;
    expect(self.actions[0].from).toBe("down-copy");
    expect(self.actions[0].steps.map((step) => step.to)).toEqual(["up-copy", "base"]);
    expect(self.actions[0].id).not.toBe(events.self.actions[0].id);

    // An action moving an object that wasn't duplicated still moves it.
    const other = copies.find((copy) => copy.actions[0].targetId === "ball")!;
    expect(other.actions[0].steps[0].to).toBe("ballUp");
  });

  it("shares nothing with the originals, and returns the same events when there's nothing to copy", () => {
    const events = byId(event("e"));
    const next = duplicateEvents(events, new Map([["cube", "copy"]]), new Map());
    const copy = Object.values(next).find((e) => e.ownerId === "copy")!;

    copy.actions[0].steps[0].duration = 99;
    expect(events.e.actions[0].steps[0].duration).toBe(1);
    expect(duplicateEvents(events, new Map([["ball", "copy"]]), new Map())).toBe(events);
  });
});

describe("normalizeEvents", () => {
  it("keeps well-formed events as they are", () => {
    const events = byId(event("e", { trigger: "mouseDown", order: 2 }));

    expect(normalizeEvents(events)).toEqual(events);
    expect(normalizeEvents(events).e).not.toBe(events.e);
  });

  it("drops what isn't an event or a transition and fills in missing settings", () => {
    expect(normalizeEvents(null)).toEqual({});
    expect(normalizeEvents([event("e")])).toEqual({});
    expect(
      normalizeEvents({
        bad: { id: "bad", ownerId: "cube", trigger: "hover", actions: [] },
        ok: { id: "ok", ownerId: "cube", trigger: "start", actions: [{ type: "sound", id: "s" }, { id: "t", type: "transition", targetId: "cube", from: "base", steps: [{ to: "up", duration: -2, easing: "bounce" }], loop: 2.7 }] },
      }),
    ).toEqual({
      ok: {
        id: "ok",
        ownerId: "cube",
        trigger: "start",
        order: 0,
        actions: [
          transition({ id: "t", steps: [{ to: "up", duration: 0, easing: "easeInOut" }], loop: 2 }),
        ],
      },
    });
  });
});
