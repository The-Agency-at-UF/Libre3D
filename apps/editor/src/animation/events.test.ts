import { describe, expect, it } from "vitest";
import {
  createEvent,
  createTransition,
  duplicateEvents,
  getEventsUsingState,
  getObjectEvents,
  normalizeEvents,
  removeEventsOf,
  transitionProblem,
  EVENT_TRIGGERS,
  TRIGGER_INFO,
  type EventTrigger,
  type SceneEvent,
} from "./events";
import type { ObjectState } from "./objectStates";
import type { TransitionAction } from "./transitions";
import type { OpenLinkAction, SoundAction } from "./actions";

/** An event's actions, as the transitions these tests give it. */
const transitions = (event: SceneEvent) => event.actions as TransitionAction[];

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

describe("transitionProblem", () => {
  const states = byId(state("up", "cube"), state("ballUp", "ball"));
  const exists = (id: string) => id === "cube" || id === "ball";

  it("finds nothing wrong with Base, Current in row 1, and the target's own states", () => {
    expect(transitionProblem(transition(), exists, states)).toBeNull();
    expect(transitionProblem(transition({ from: "current" }), exists, states)).toBeNull();
  });

  it("finds a missing target first, then a row with no state of the target", () => {
    expect(transitionProblem(transition({ targetId: "gone" }), exists, states)).toBe("target");
    expect(transitionProblem(transition({ from: "" }), exists, states)).toBe("state");
    expect(transitionProblem(transition({ steps: [{ to: "ballUp", duration: 1, easing: "linear" }] }), exists, states)).toBe("state");
    expect(transitionProblem(transition({ steps: [{ to: "current", duration: 1, easing: "linear" }] }), exists, states)).toBe("state");
    expect(transitionProblem(transition({ steps: [] }), exists, states)).toBe("state");
  });
});

describe("getEventsUsingState", () => {
  it("finds the events going through a state, in row 1 or a later row", () => {
    const events = byId(
      event("from", { actions: [transition({ from: "up", steps: [{ to: "base", duration: 1, easing: "linear" }] })] }),
      event("to"),
      event("other", { actions: [transition({ steps: [{ to: "big", duration: 1, easing: "linear" }] })] }),
    );

    expect(getEventsUsingState(events, "up").map((e) => e.id).sort()).toEqual(["from", "to"]);
    expect(getEventsUsingState(events, "gone")).toEqual([]);
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
    expect(transitions(next.click).map((a) => a.targetId)).toEqual(["cube"]);
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

    const self = copies.find((copy) => transitions(copy)[0].targetId === "cube-copy")!;
    expect(transitions(self)[0].from).toBe("down-copy");
    expect(transitions(self)[0].steps.map((step) => step.to)).toEqual(["up-copy", "base"]);
    expect(transitions(self)[0].id).not.toBe(transitions(events.self)[0].id);

    // An action moving an object that wasn't duplicated still moves it.
    const other = copies.find((copy) => transitions(copy)[0].targetId === "ball")!;
    expect(transitions(other)[0].steps[0].to).toBe("ballUp");
  });

  it("shares nothing with the originals, and returns the same events when there's nothing to copy", () => {
    const events = byId(event("e"));
    const next = duplicateEvents(events, new Map([["cube", "copy"]]), new Map());
    const copy = Object.values(next).find((e) => e.ownerId === "copy")!;

    transitions(copy)[0].steps[0].duration = 99;
    expect(transitions(events.e)[0].steps[0].duration).toBe(1);
    expect(duplicateEvents(events, new Map([["ball", "copy"]]), new Map())).toBe(events);
  });
});

describe("normalizeEvents", () => {
  it("keeps every trigger the document may hold, offered in the dropdown or not", () => {
    const triggers = Object.keys(TRIGGER_INFO) as EventTrigger[];
    const events = byId(...triggers.map((trigger) => event(trigger, { trigger })));

    expect(triggers).toEqual(["start", "mouseDown", "mouseUp", "mouseHover", "keyDown", "keyUp", "scroll"]);
    expect(normalizeEvents(events)).toEqual(events);
    expect(EVENT_TRIGGERS.map((option) => option.value)).toEqual(["start", "mouseDown", "mouseUp", "mouseHover", "keyDown", "keyUp", "scroll"]);
    expect(EVENT_TRIGGERS.map((option) => option.label)).toEqual(["Start", "Mouse Down", "Mouse Up", "Mouse Hover", "Key Down", "Key Up", "Scroll"]);
  });

  it("drops an unknown trigger, and a trigger that is a built-in object property", () => {
    expect(normalizeEvents(byId(event("e", { trigger: "hover" as EventTrigger }), event("f", { trigger: "constructor" as EventTrigger })))).toEqual({});
  });

  it("keeps an event's key when it's a string and drops it otherwise", () => {
    const keyed = event("k", { trigger: "keyDown", key: "KeyW" });

    expect(normalizeEvents(byId(keyed))).toEqual(byId(keyed));
    expect(normalizeEvents({ k: { ...keyed, key: 87 } })).toEqual(byId(event("k", { trigger: "keyDown" })));
    expect(normalizeEvents(byId(keyed)).k).not.toHaveProperty("key", undefined);
  });

  it("keeps well-formed events as they are", () => {
    const events = byId(event("e", { trigger: "mouseDown", order: 2 }));

    expect(normalizeEvents(events)).toEqual(events);
    expect(normalizeEvents(events).e).not.toBe(events.e);
  });

  it("drops what isn't an event or an action this build knows, and fills in missing settings", () => {
    expect(normalizeEvents(null)).toEqual({});
    expect(normalizeEvents([event("e")])).toEqual({});
    expect(
      normalizeEvents({
        bad: { id: "bad", ownerId: "cube", trigger: "hover", actions: [] },
        ok: { id: "ok", ownerId: "cube", trigger: "start", actions: [{ type: "teleport", id: "s" }, { id: "t", type: "transition", targetId: "cube", from: "base", steps: [{ to: "up", duration: -2, easing: "bounce" }], loop: 2.7 }] },
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

  it("keeps a mixed list of actions in order", () => {
    const link = { id: "l", type: "openLink", url: "https://example.com", newTab: false };
    const sound = { id: "s", type: "sound", assetId: "abc", volume: 0.5, loop: true, mode: "stop" };
    const events = normalizeEvents({ e: { ...event("e"), actions: [link, transition({ id: "t" }), sound] } });

    expect(events.e.actions).toEqual([link, transition({ id: "t" }), sound]);
  });
});

describe("events with Open Link and Sound actions", () => {
  const link: OpenLinkAction = { id: "link", type: "openLink", url: "https://example.com", newTab: true };
  const sound: SoundAction = { id: "sound", type: "sound", assetId: "abc", volume: 1, loop: false, mode: "play" };

  it("keeps link and sound actions when a deleted object's transitions go", () => {
    const events = byId(event("click", { ownerId: "button", actions: [link, transition({ targetId: "sphere" }), sound] }));

    expect(removeEventsOf(events, new Set(["sphere"])).click.actions).toEqual([link, sound]);
  });

  it("copies all three kinds onto a duplicate, each with a new ID", () => {
    const events = byId(event("e", { actions: [transition(), link, sound] }));
    const next = duplicateEvents(events, new Map([["cube", "cube-copy"]]), new Map());
    const copy = Object.values(next).find((e) => e.ownerId === "cube-copy")!;

    expect(copy.actions.map((action) => action.type)).toEqual(["transition", "openLink", "sound"]);
    expect(copy.actions.every((action, i) => action.id !== events.e.actions[i].id)).toBe(true);
    expect(copy.actions[1]).toMatchObject({ url: "https://example.com", newTab: true });
    expect(copy.actions[1]).not.toBe(link);
  });
});

