import { describe, expect, it } from "vitest";
import type { SceneEvent } from "./events";
import type { ObjectState } from "./objectStates";
import { SceneRuntime, type RuntimeEntity } from "./sceneRuntime";
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
