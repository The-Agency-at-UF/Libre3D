import { describe, expect, it, vi } from "vitest";
import type { SceneEvent } from "./events";
import type { ObjectState } from "./objectStates";
import { SceneRuntime, type RuntimeEntity } from "./sceneRuntime";
import type { MaterialLayer } from "../scene/types";
import type { TransitionAction } from "./transitions";

const DEG = Math.PI / 180;

const entity = (id: string, overrides: Partial<RuntimeEntity> = {}): RuntimeEntity => ({
  id,
  parentId: null,
  position: [0, 0, 0],
  rotation: [0, 0, 0],
  scale: [1, 1, 1],
  ...overrides,
});

const state = (id: string, targetId: string, values: ObjectState["values"]): ObjectState => ({
  id,
  targetId,
  name: id,
  order: 0,
  values,
});

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

const cubeScene = (events: SceneEvent[], extraEntities: RuntimeEntity[] = []) =>
  new SceneRuntime({
    entities: [entity("cube"), ...extraEntities],
    animation: {
      states: byId(state("up", "cube", { position: [0, 2, 0] }), state("big", "cube", { scale: [2, 2, 2] })),
      events: byId(...events),
    },
  });

const positionOf = (runtime: SceneRuntime, id = "cube") => runtime.poses().get(id)?.position;

describe("SceneRuntime: Start", () => {
  it("moves nothing until it starts, and puts row 1 on before the first frame", () => {
    const runtime = cubeScene([event("bob", { actions: [transition({ from: "up", steps: [{ to: "base", duration: 1, easing: "linear" }], delay: 2 })] })]);

    expect(runtime.poses().size).toBe(0);
    runtime.start();
    expect(positionOf(runtime)).toEqual([0, 2, 0]);
  });

  it("bobs a cube forever with an infinite ping-pong", () => {
    const runtime = cubeScene([
      event("bob", {
        actions: [transition({ steps: [{ to: "up", duration: 1, easing: "easeInOut" }], loop: "infinite", cycle: "pingPong" })],
      }),
    ]);
    runtime.start();

    runtime.tick(0.5);
    expect(positionOf(runtime)![1]).toBeCloseTo(1, 6);
    runtime.tick(0.5);
    expect(positionOf(runtime)).toEqual([0, 2, 0]);
    runtime.tick(1);
    expect(positionOf(runtime)).toEqual([0, 0, 0]);
    runtime.tick(1000.5);
    expect(positionOf(runtime)![1]).toBeCloseTo(1, 6);
    expect(runtime.isIdle).toBe(false);
  });

  it("keeps an object where its transition ended", () => {
    const runtime = cubeScene([event("rise")]);
    runtime.start();
    runtime.tick(5);

    expect(positionOf(runtime)).toEqual([0, 2, 0]);
    expect(runtime.isIdle).toBe(true);
  });

  it("fills in what a state doesn't set from Base", () => {
    const runtime = new SceneRuntime({
      entities: [entity("cube", { position: [5, 0, 0], rotation: [0, 1, 0] })],
      animation: { states: byId(state("up", "cube", { position: [5, 2, 0] })), events: byId(event("rise")) },
    });
    runtime.start();
    runtime.tick(0.5);

    expect(runtime.poses().get("cube")).toEqual({ position: [5, 1, 0], rotation: [0, 1, 0], scale: [1, 1, 1] });
  });

  it("turns per Euler angle, so +360° spins once and +270° turns three quarters, not the short way", () => {
    const runtime = new SceneRuntime({
      entities: [entity("cube"), entity("wheel")],
      animation: {
        states: byId(state("spun", "cube", { rotation: [0, 360 * DEG, 0] }), state("turned", "wheel", { rotation: [0, 270 * DEG, 0] })),
        events: byId(
          event("spin", { actions: [transition({ steps: [{ to: "spun", duration: 1, easing: "linear" }] })] }),
          event("turn", { ownerId: "wheel", actions: [transition({ targetId: "wheel", steps: [{ to: "turned", duration: 1, easing: "linear" }] })] }),
        ),
      },
    });
    runtime.start();
    runtime.tick(0.5);

    expect(runtime.poses().get("cube")!.rotation[1]).toBeCloseTo(180 * DEG, 9);
    expect(runtime.poses().get("wheel")!.rotation[1]).toBeCloseTo(135 * DEG, 9);
  });

  it("hands out poses that share nothing with its rows", () => {
    const runtime = cubeScene([event("rise")]);
    runtime.start();
    runtime.poses().get("cube")!.position[1] = 99;
    runtime.tick(0.5);

    expect(positionOf(runtime)).toEqual([0, 1, 0]);
  });
});

describe("SceneRuntime: clicks", () => {
  it("says a scene with only Start events, or none, has nothing to click", () => {
    const startOnly = cubeScene([event("bob", { actions: [transition({ from: "up", steps: [{ to: "base", duration: 1, easing: "linear" }] })] })]);

    expect(startOnly.hasClickEvents).toBe(false);
    expect(cubeScene([]).hasClickEvents).toBe(false);
  });

  const growOnClick = (from: TransitionAction["from"] = "current") =>
    cubeScene(
      [event("grow", { trigger: "mouseDown", actions: [transition({ from, steps: [{ to: "big", duration: 0.3, easing: "linear" }] })] })],
      [entity("handle", { parentId: "cube" }), entity("floor")],
    );

  it("fires on the clicked object, or its nearest ancestor with a Mouse Down event", () => {
    const runtime = growOnClick();

    expect(runtime.hasClickEvents).toBe(true);
    expect(runtime.clickOwnerOf("cube")).toBe("cube");
    expect(runtime.clickOwnerOf("handle")).toBe("cube");
    expect(runtime.clickOwnerOf("floor")).toBeNull();
    expect(runtime.click("floor")).toBe(false);
    expect(runtime.click("handle")).toBe(true);
    runtime.tick(0.3);
    expect(runtime.poses().get("cube")!.scale).toEqual([2, 2, 2]);
  });

  it("doesn't fire Mouse Down events on Start", () => {
    const runtime = growOnClick();
    runtime.start();
    runtime.tick(1);

    expect(runtime.poses().size).toBe(0);
  });

  it("doesn't jump when clicked again mid-move, even when row 1 is a state", () => {
    for (const from of ["current", "base"] as const) {
      const runtime = growOnClick(from);
      runtime.click("cube");
      runtime.tick(0.15);
      const halfway = runtime.poses().get("cube")!.scale[0];

      runtime.click("cube");
      expect(runtime.poses().get("cube")!.scale[0]).toBeCloseTo(halfway, 9);
      runtime.tick(0.15);
      expect(runtime.poses().get("cube")!.scale[0]).toBeCloseTo(halfway + (2 - halfway) / 2, 9);
    }
  });

  it("replays from row 1 when clicked again after it finished", () => {
    const runtime = growOnClick("base");
    runtime.click("cube");
    runtime.tick(1);
    runtime.click("cube");

    expect(runtime.poses().get("cube")!.scale).toEqual([1, 1, 1]);
  });

  it("starts from wherever the object is with Current", () => {
    const runtime = cubeScene([
      event("rise"),
      event("grow", { trigger: "mouseDown", actions: [transition({ from: "current", steps: [{ to: "big", duration: 1, easing: "linear" }] })] }),
    ]);
    runtime.start();
    runtime.tick(5);
    runtime.click("cube");

    expect(positionOf(runtime)).toEqual([0, 2, 0]);
    runtime.tick(1);
    // "big" sets only scale, so its position is Base's: a state is Base plus what it sets, not
    // wherever the object was plus what it sets.
    expect(runtime.poses().get("cube")).toEqual({ position: [0, 0, 0], rotation: [0, 0, 0], scale: [2, 2, 2] });
  });
});

describe("SceneRuntime: fire, the one way in", () => {
  const growOnClick = () =>
    cubeScene(
      [event("grow", { trigger: "mouseDown", actions: [transition({ from: "current", steps: [{ to: "big", duration: 0.3, easing: "linear" }] })] })],
      [entity("handle", { parentId: "cube" }), entity("floor")],
    );

  it("fires a pointer trigger on an object as click does", () => {
    const runtime = growOnClick();

    expect(runtime.fire("mouseDown", "floor")).toBe(false);
    expect(runtime.fire("mouseDown", "handle")).toBe(true);
    runtime.tick(0.3);
    expect(runtime.poses().get("cube")!.scale).toEqual([2, 2, 2]);
  });

  it("finds the nearest ancestor with the trigger, and survives a parent cycle", () => {
    const runtime = cubeScene(
      [event("grow", { trigger: "mouseDown", actions: [transition({ steps: [{ to: "big", duration: 1, easing: "linear" }] })] })],
      [entity("arm", { parentId: "cube" }), entity("hand", { parentId: "arm" }), entity("a", { parentId: "b" }), entity("b", { parentId: "a" })],
    );

    expect(runtime.ownerOf("mouseDown", "hand")).toBe("cube");
    expect(runtime.ownerOf("start", "hand")).toBeNull();
    expect(runtime.ownerOf("mouseDown", "a")).toBeNull();
    expect(runtime.fire("mouseDown", "a")).toBe(false);
  });

  it("fires every Start event without an object", () => {
    const runtime = cubeScene([event("rise")]);

    expect(runtime.fire("start")).toBe(true);
    runtime.tick(5);
    expect(positionOf(runtime)).toEqual([0, 2, 0]);
    expect(cubeScene([]).fire("start")).toBe(false);
  });

  it("fires nothing for an object that isn't in the scene", () => {
    const runtime = growOnClick();

    expect(runtime.fire("mouseDown", "ghost")).toBe(false);
    expect(runtime.poses().size).toBe(0);
  });

  it("fires an event only for its own trigger, through the ancestor rule, for every pointer trigger", () => {
    for (const trigger of ["mouseDown", "mouseUp", "mouseHover"] as const) {
      const runtime = cubeScene(
        [event("grow", { trigger, actions: [transition({ steps: [{ to: "big", duration: 1, easing: "linear" }] })] })],
        [entity("handle", { parentId: "cube" }), entity("floor")],
      );
      const others = (["mouseDown", "mouseUp", "mouseHover", "start"] as const).filter((other) => other !== trigger);

      expect(runtime.ownerOf(trigger, "handle")).toBe("cube");
      expect(runtime.ownerOf(trigger, "floor")).toBeNull();
      expect(others.map((other) => runtime.ownerOf(other, "handle"))).toEqual([null, null, null]);
      expect(others.map((other) => runtime.fire(other, "handle"))).toEqual([false, false, false]);
      expect(runtime.poses().size).toBe(0);
      expect(runtime.fire(trigger, "handle")).toBe(true);
      runtime.tick(1);
      expect(runtime.poses().get("cube")!.scale).toEqual([2, 2, 2]);
    }
  });

  it("skips a hover or release event whose owner is gone", () => {
    const runtime = cubeScene([event("hover", { ownerId: "deleted", trigger: "mouseHover" }), event("up", { ownerId: "deleted", trigger: "mouseUp" })]);

    expect(runtime.triggersInUse.size).toBe(0);
    expect(runtime.fire("mouseHover", "cube")).toBe(false);
    expect(runtime.fire("mouseUp", "deleted")).toBe(false);
  });

  it("knows which triggers the scene uses", () => {
    expect(cubeScene([event("rise")]).triggersInUse).toEqual(new Set(["start"]));
    expect(cubeScene([]).triggersInUse.size).toBe(0);
    expect(growOnClick().triggersInUse).toEqual(new Set(["mouseDown"]));
    expect(cubeScene([event("rise"), event("grow", { trigger: "mouseDown" })]).triggersInUse).toEqual(new Set(["start", "mouseDown"]));
  });
});

describe("SceneRuntime: keys", () => {
  const grow = transition({ steps: [{ to: "big", duration: 1, easing: "linear" }] });
  const rise = (targetId: string) => transition({ id: `rise-${targetId}`, targetId, steps: [{ to: `up-${targetId}`, duration: 1, easing: "linear" }] });
  const twoCubes = (events: SceneEvent[]) =>
    new SceneRuntime({
      entities: [entity("cube"), entity("other")],
      animation: {
        states: byId(state("up-cube", "cube", { position: [0, 2, 0] }), state("up-other", "other", { position: [0, 3, 0] })),
        events: byId(...events),
      },
    });

  it("fires only the events whose key matches, whatever the pointer is on", () => {
    const runtime = cubeScene([event("space", { trigger: "keyDown", key: "Space", actions: [grow] })], [entity("floor")]);

    expect(runtime.key("keyDown", "KeyW")).toBe(false);
    expect(runtime.poses().size).toBe(0);
    expect(runtime.key("keyDown", "Space")).toBe(true);
    runtime.tick(1);
    expect(runtime.poses().get("cube")!.scale).toEqual([2, 2, 2]);
  });

  it("never fires an event with no key picked, and lists only the keys picked", () => {
    const runtime = cubeScene([event("unset", { trigger: "keyDown" }), event("w", { trigger: "keyUp", key: "KeyW" })]);

    expect(runtime.keyCodes).toEqual(new Set(["KeyW"]));
    expect(runtime.key("keyDown", "")).toBe(false);
    expect(runtime.fire("keyDown")).toBe(false);
    expect(runtime.poses().size).toBe(0);
  });

  it("keeps Key Down and Key Up apart", () => {
    const runtime = cubeScene([event("up", { trigger: "keyUp", key: "Space", actions: [grow] })]);

    expect(runtime.key("keyDown", "Space")).toBe(false);
    expect(runtime.key("keyUp", "Space")).toBe(true);
  });

  it("fires every object listening for the same key, in scene order", () => {
    const runtime = twoCubes([
      event("b", { ownerId: "other", trigger: "keyDown", key: "KeyA", actions: [rise("other")] }),
      event("a", { ownerId: "cube", trigger: "keyDown", key: "KeyA", actions: [rise("cube")] }),
    ]);

    expect(runtime.key("keyDown", "KeyA")).toBe(true);
    runtime.tick(1);
    expect(positionOf(runtime, "cube")).toEqual([0, 2, 0]);
    expect(positionOf(runtime, "other")).toEqual([0, 3, 0]);
  });

  it("skips a key event whose owner is gone", () => {
    const runtime = cubeScene([event("gone", { ownerId: "deleted", trigger: "keyDown", key: "Space" })]);

    expect(runtime.keyCodes.size).toBe(0);
    expect(runtime.key("keyDown", "Space")).toBe(false);
  });
});

describe("SceneRuntime: scroll", () => {
  // Base → up (y 2, 1 s) → big (scale 2, 3 s): a quarter of the way is "up".
  const scrubbed = transition({
    from: "base",
    steps: [
      { to: "up", duration: 1, easing: "linear" },
      { to: "big", duration: 3, easing: "linear" },
    ],
    delay: 5,
    loop: "infinite",
    cycle: "pingPong",
  });
  const scrollScene = (events: SceneEvent[] = [event("scroll", { trigger: "scroll", actions: [scrubbed] })], extra: RuntimeEntity[] = []) =>
    new SceneRuntime({
      entities: [entity("cube"), ...extra],
      animation: {
        states: byId(
          state("up", "cube", { position: [0, 2, 0] }),
          state("big", "cube", { scale: [2, 2, 2] }),
          state("tall", "pole", { scale: [1, 3, 1] }),
        ),
        events: byId(...events),
      },
    });

  it("has no Scroll events in a scene without them", () => {
    expect(cubeScene([event("rise"), event("grow", { trigger: "mouseDown" })]).hasScrollEvents).toBe(false);
  });

  it("puts a scroll transition at progress 0 before the first frame, its Delay ignored", () => {
    const runtime = scrollScene();
    expect(runtime.hasScrollEvents).toBe(true);
    runtime.start();
    expect(runtime.poses().get("cube")).toMatchObject({ position: [0, 0, 0], scale: [1, 1, 1] });
  });

  it("is paced by the step durations and retraces exactly going back", () => {
    const runtime = scrollScene();
    runtime.start();

    runtime.setScrollProgress(0.125);
    expect(positionOf(runtime)).toEqual([0, 1, 0]);
    runtime.setScrollProgress(0.25);
    expect(positionOf(runtime)).toEqual([0, 2, 0]);
    runtime.setScrollProgress(0.625);
    const midway = runtime.poses().get("cube")!;
    expect(midway.scale).toEqual([1.5, 1.5, 1.5]);
    runtime.setScrollProgress(1);
    expect(runtime.poses().get("cube")!.scale).toEqual([2, 2, 2]);

    runtime.setScrollProgress(0.625);
    expect(runtime.poses().get("cube")).toEqual(midway);
    runtime.setScrollProgress(0);
    expect(runtime.poses().get("cube")).toMatchObject({ position: [0, 0, 0], scale: [1, 1, 1] });
  });

  it("isn't moved by time, and is idle meanwhile", () => {
    const runtime = scrollScene();
    runtime.start();
    runtime.setScrollProgress(0.25);
    runtime.tick(10);
    expect(positionOf(runtime)).toEqual([0, 2, 0]);
    expect(runtime.isIdle).toBe(true);
  });

  it("drives every scroll event from the one progress", () => {
    const runtime = scrollScene(
      [
        event("scroll", { trigger: "scroll", actions: [scrubbed] }),
        event("pole", { ownerId: "pole", trigger: "scroll", actions: [transition({ id: "grow-pole", targetId: "pole", steps: [{ to: "tall", duration: 2, easing: "linear" }] })] }),
      ],
      [entity("pole")],
    );
    runtime.start();
    runtime.setScrollProgress(0.5);
    expect(runtime.poses().get("pole")!.scale).toEqual([1, 2, 1]);
    expect(runtime.poses().get("cube")!.scale).toEqual([1 + 1 / 3, 1 + 1 / 3, 1 + 1 / 3]);
  });

  it("clamps out-of-range progress and reads NaN as 0", () => {
    const runtime = scrollScene();
    runtime.start();
    runtime.setScrollProgress(4);
    expect(runtime.poses().get("cube")!.scale).toEqual([2, 2, 2]);
    runtime.setScrollProgress(-1);
    expect(positionOf(runtime)).toEqual([0, 0, 0]);
    runtime.setScrollProgress(0.25);
    runtime.setScrollProgress(Number.NaN);
    expect(positionOf(runtime)).toEqual([0, 0, 0]);
  });

  it("writes nothing when the progress hasn't changed", () => {
    const runtime = scrollScene();
    runtime.start();
    runtime.setScrollProgress(0.25);
    const pose = runtime.poses().get("cube");
    runtime.setScrollProgress(0.25);
    expect(runtime.poses().get("cube")).toBe(pose);
  });

  it("lets the newest writer win: a click takes over, and the next scroll takes the object back", () => {
    const grow = event("grow", { trigger: "mouseDown", actions: [transition({ id: "grow", from: "current", steps: [{ to: "big", duration: 1, easing: "linear" }] })] });
    const runtime = scrollScene([event("scroll", { trigger: "scroll", actions: [scrubbed] }), grow]);
    runtime.start();
    runtime.setScrollProgress(0.25); // at "up": y 2, scale 1

    runtime.click("cube");
    runtime.tick(0.5);
    expect(runtime.poses().get("cube")).toMatchObject({ position: [0, 1, 0], scale: [1.5, 1.5, 1.5] });

    runtime.setScrollProgress(0.25 + 1e-9);
    expect(runtime.isIdle).toBe(true);
    runtime.tick(1);
    expect(positionOf(runtime)![1]).toBeCloseTo(2, 6);
    expect(runtime.poses().get("cube")!.scale[0]).toBeCloseTo(1, 6);
  });

  it("never fires a scroll event's transition by time", () => {
    const runtime = scrollScene();
    expect(runtime.fire("scroll")).toBe(false);
    expect(runtime.fire("scroll", "cube")).toBe(false);
    expect(runtime.isIdle).toBe(true);
  });

  it("reads Current in row 1 as Base", () => {
    const runtime = scrollScene([event("scroll", { trigger: "scroll", actions: [{ ...scrubbed, from: "current" }] })]);
    runtime.start();
    runtime.setScrollProgress(0.125);
    expect(positionOf(runtime)).toEqual([0, 1, 0]);
  });

  it("scrubs a path's trim", () => {
    const runtime = new SceneRuntime({
      entities: [entity("path", { trimStart: 0, trimEnd: 1 })],
      animation: {
        states: byId(state("hidden", "path", { trimEnd: 0 })),
        events: byId(event("write", { ownerId: "path", trigger: "scroll", actions: [transition({ targetId: "path", from: "hidden", steps: [{ to: "base", duration: 2, easing: "linear" }] })] })),
      },
    });
    runtime.start();
    expect(runtime.poses().get("path")!.trimEnd).toBe(0);
    runtime.setScrollProgress(0.75);
    expect(runtime.poses().get("path")!.trimEnd).toBeCloseTo(0.75, 6);
  });

  it("skips a scroll action whose target or state is missing, or whose owner is gone", () => {
    const runtime = scrollScene([
      event("gone", { ownerId: "deleted", trigger: "scroll", actions: [scrubbed] }),
      event("target", { trigger: "scroll", actions: [{ ...scrubbed, targetId: "deleted" }] }),
      event("state", { trigger: "scroll", actions: [{ ...scrubbed, steps: [{ to: "nope", duration: 1, easing: "linear" }] }] }),
    ]);
    expect(runtime.hasScrollEvents).toBe(false);
    expect(() => {
      runtime.start();
      runtime.setScrollProgress(0.5);
    }).not.toThrow();
    expect(runtime.poses().size).toBe(0);
  });
});

describe("SceneRuntime: effects", () => {
  const link = { id: "link", type: "openLink" as const, url: "https://example.com", newTab: true };
  const withLink = (trigger: SceneEvent["trigger"], onEffect?: (effect: unknown) => void) =>
    new SceneRuntime(
      {
        entities: [entity("cube")],
        animation: { states: byId(state("up", "cube", { position: [0, 2, 0] })), events: byId(event("e", { trigger, actions: [transition(), link] })) },
      },
      { onEffect },
    );

  it("runs the transition and hands the effect over once, inside the trigger", () => {
    const effects: unknown[] = [];
    const runtime = withLink("mouseDown", (effect) => effects.push(effect));

    runtime.click("cube");
    expect(effects).toEqual([{ type: "openLink", url: "https://example.com", newTab: true }]);
    runtime.tick(1);
    expect(positionOf(runtime)).toEqual([0, 2, 0]);
    expect(effects).toHaveLength(1);
  });

  it("hands over Start events' effects too", () => {
    const effects: unknown[] = [];
    withLink("start", (effect) => effects.push(effect)).start();
    expect(effects).toHaveLength(1);
  });

  it("carries on without a host, or past a host that throws", () => {
    const quiet = withLink("start");
    expect(() => quiet.start()).not.toThrow();

    const error = vi.spyOn(console, "error").mockImplementation(() => {});
    const failing = withLink("start", () => {
      throw new Error("popup blocked");
    });
    failing.start();
    failing.tick(1);
    expect(positionOf(failing)).toEqual([0, 2, 0]);
    expect(error).toHaveBeenCalledOnce();
    error.mockRestore();
  });

  it("hands over nothing for an action with bad data", () => {
    const effects: unknown[] = [];
    const runtime = new SceneRuntime(
      { entities: [entity("cube")], animation: { events: byId(event("e", { actions: [{ ...link, url: "" }] })) } },
      { onEffect: (effect) => effects.push(effect) },
    );
    runtime.start();
    expect(effects).toEqual([]);
  });
});

describe("SceneRuntime: place", () => {
  it("starts a transition from Current where an object was placed, and from row 1 otherwise", () => {
    const runtime = cubeScene([]);
    const shown = { position: [0, 5, 0] as [number, number, number], rotation: [0, 0, 0] as [number, number, number], scale: [1, 1, 1] as [number, number, number] };
    runtime.place("cube", shown);
    runtime.place("deleted", shown);
    shown.position[1] = 99;

    runtime.run(transition({ from: "current" }));
    expect(positionOf(runtime)).toEqual([0, 5, 0]);
    runtime.tick(5);
    runtime.place("cube", { ...shown, position: [0, 7, 0] });
    runtime.run(transition());
    expect(positionOf(runtime)).toEqual([0, 0, 0]);
    expect(runtime.poses().has("deleted")).toBe(false);
  });
});

describe("SceneRuntime: dangling references", () => {
  it("skips an action whose target, or one of whose states, is gone, and runs the rest", () => {
    const runtime = new SceneRuntime({
      entities: [entity("cube"), entity("ball")],
      animation: {
        states: byId(state("up", "cube", { position: [0, 2, 0] }), state("ballUp", "ball", { position: [0, 3, 0] })),
        events: byId(
          event("all", {
            actions: [
              transition({ targetId: "deleted" }),
              transition({ steps: [{ to: "deletedState", duration: 1, easing: "linear" }] }),
              transition({ steps: [{ to: "ballUp", duration: 1, easing: "linear" }] }), // another object's state
              transition({ from: "", steps: [{ to: "up", duration: 1, easing: "linear" }] }), // no state picked
              transition({ targetId: "ball", steps: [{ to: "ballUp", duration: 1, easing: "linear" }] }),
            ],
          }),
        ),
      },
    });

    expect(() => runtime.start()).not.toThrow();
    runtime.tick(1);
    expect([...runtime.poses().keys()]).toEqual(["ball"]);
  });

  it("ignores events whose owner is gone, and damaged events and actions", () => {
    const runtime = new SceneRuntime({
      entities: [entity("cube")],
      animation: {
        states: byId(state("up", "cube", { position: [0, 2, 0] })),
        events: {
          orphan: event("orphan", { ownerId: "deleted" }),
          broken: { id: "broken", ownerId: "cube", trigger: "start", actions: [{ type: "sound" }, null, transition({ steps: "x" as never })] } as never,
          junk: "not an event" as never,
        },
      },
    });

    expect(() => runtime.start()).not.toThrow();
    expect(runtime.clickOwnerOf("cube")).toBeNull();
    expect(runtime.poses().size).toBe(0);
  });

  it("doesn't change anything when a run is refused", () => {
    const runtime = cubeScene([]);

    expect(runtime.run(transition({ targetId: "deleted" }))).toBe(false);
    expect(runtime.poses().size).toBe(0);
    expect(runtime.isIdle).toBe(true);
  });
});

describe("SceneRuntime: a path's trim", () => {
  const writeOn = () =>
    new SceneRuntime({
      entities: [entity("path", { trimStart: 0, trimEnd: 1 })],
      animation: {
        states: byId(state("hidden", "path", { trimEnd: 0 })),
        events: byId(
          event("write", {
            ownerId: "path",
            actions: [transition({ targetId: "path", from: "hidden", steps: [{ to: "base", duration: 2, easing: "linear" }] })],
          }),
        ),
      },
    });

  it("starts hidden before the first frame and writes itself on", () => {
    const runtime = writeOn();
    runtime.start();
    expect(runtime.poses().get("path")).toMatchObject({ trimStart: 0, trimEnd: 0 });

    runtime.tick(0.5);
    expect(runtime.poses().get("path")!.trimEnd).toBeCloseTo(0.25, 6);
    runtime.tick(1.5);
    expect(runtime.poses().get("path")).toMatchObject({ trimStart: 0, trimEnd: 1 });
    expect(runtime.isIdle).toBe(true);
  });

  it("gives objects without a trim no trim", () => {
    const runtime = cubeScene([event("bob")]);
    runtime.start();
    runtime.tick(0.5);

    expect(runtime.poses().get("cube")).not.toHaveProperty("trimEnd");
  });
});

describe("SceneRuntime: colour and opacity", () => {
  const layers = [{ id: "light", type: "lighting" }, { id: "top", type: "color", color: "#000000" }] as unknown as MaterialLayer[];
  const fade = (overrides: Partial<TransitionAction> = {}) =>
    transition({ steps: [{ to: "ghost", duration: 1, easing: "linear" }], ...overrides });
  const scene = (action: TransitionAction, extra: RuntimeEntity[] = []) =>
    new SceneRuntime({
      entities: [entity("cube", { materialLayers: layers }), ...extra],
      animation: {
        states: byId(state("ghost", "cube", { color: "#ffffff", opacity: 0.5 }), state("up", "cube", { position: [0, 2, 0] })),
        events: byId(event("fade", { actions: [action] })),
      },
    });

  it("fades opacity linearly and mixes colour in linear light, not on the sRGB values", () => {
    const runtime = scene(fade());
    runtime.start();
    expect(runtime.poses().get("cube")).toMatchObject({ color: "#000000", opacity: 1 });

    runtime.tick(0.5);
    const half = runtime.poses().get("cube")!;
    expect(half.opacity).toBeCloseTo(0.75, 6);
    expect(half.color).toBe("#bcbcbc"); // the sRGB midpoint would be #808080

    runtime.tick(0.5);
    expect(runtime.poses().get("cube")).toMatchObject({ color: "#ffffff", opacity: 0.5 });
  });

  it("returns exactly to each end on a ping-pong", () => {
    const runtime = scene(fade({ loop: "infinite", cycle: "pingPong" }));
    runtime.start();
    runtime.tick(1);
    expect(runtime.poses().get("cube")).toMatchObject({ color: "#ffffff", opacity: 0.5 });
    runtime.tick(1);
    expect(runtime.poses().get("cube")).toMatchObject({ color: "#000000", opacity: 1 });
  });

  it("carries Base's look through a transition that only moves", () => {
    const runtime = scene(transition());
    runtime.start();
    runtime.tick(0.5);
    expect(runtime.poses().get("cube")).toMatchObject({ position: [0, 1, 0], color: "#000000", opacity: 1 });
  });

  it("starts an interrupting fade from the look the object has", () => {
    const runtime = scene(fade());
    runtime.start();
    runtime.tick(0.5);
    runtime.run(transition({ from: "ghost", steps: [{ to: "base", duration: 1, easing: "linear" }] }));
    expect(runtime.poses().get("cube")!.opacity).toBeCloseTo(0.75, 6);
    expect(runtime.poses().get("cube")!.color).toBe("#bcbcbc");
  });

  it("gives an object without a material no look, and one without a Color layer no colour", () => {
    const noColor = [{ id: "noise", type: "noise" }] as unknown as MaterialLayer[];
    const runtime = new SceneRuntime({
      entities: [entity("group"), entity("blob", { materialLayers: noColor, opacity: 0.8 })],
      animation: {
        states: byId(state("g", "group", { color: "#ffffff", opacity: 0 }), state("b", "blob", { color: "#ffffff", opacity: 0 })),
        events: byId(
          event("e", {
            ownerId: "group",
            actions: [
              transition({ id: "a1", targetId: "group", steps: [{ to: "g", duration: 1, easing: "linear" }] }),
              transition({ id: "a2", targetId: "blob", steps: [{ to: "b", duration: 1, easing: "linear" }] }),
            ],
          }),
        ),
      },
    });
    runtime.start();
    runtime.tick(0.5);

    expect(runtime.poses().get("group")).toEqual({ position: [0, 0, 0], rotation: [0, 0, 0], scale: [1, 1, 1] });
    expect(runtime.poses().get("blob")).not.toHaveProperty("color");
    expect(runtime.poses().get("blob")!.opacity).toBeCloseTo(0.4, 6);
  });

  it("neither fades nor recolours an object on a material asset", () => {
    const runtime = new SceneRuntime({
      // As drawn: with its asset's layers and opacity.
      entities: [entity("cube", { materialLayers: layers, materialAssetId: "m", opacity: 0.8 })],
      animation: { states: byId(state("ghost", "cube", { color: "#ffffff", opacity: 0.5, position: [0, 2, 0] })), events: byId(event("fade", { actions: [fade()] })) },
    });
    runtime.start();
    runtime.tick(0.5);

    expect(runtime.poses().get("cube")).toMatchObject({ position: [0, 1, 0], color: "#000000", opacity: 0.8 });
  });

  it("leaves other objects out of it", () => {
    const runtime = scene(fade(), [entity("other", { materialLayers: layers })]);
    runtime.start();
    runtime.tick(0.5);
    expect(runtime.poses().has("other")).toBe(false);
  });
});
