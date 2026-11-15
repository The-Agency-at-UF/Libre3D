import { describe, expect, it, vi } from "vitest";
import { attachPlayInput, type PlayInputRuntime } from "./playInput";

type Listener = (event: PointerEvent) => void;

/** A canvas that only keeps its listeners, so a test can fire them and see them removed. */
const fakeCanvas = () => {
  const listeners = new Map<string, Listener>();
  return {
    listeners,
    addEventListener: vi.fn((type: string, listener: Listener) => listeners.set(type, listener)),
    removeEventListener: vi.fn(),
    fire: (type: string, event: Partial<PointerEvent> = {}) => listeners.get(type)!({ button: 0, clientX: 10, clientY: 20, ...event } as PointerEvent),
  };
};

const fakeRuntime = (triggers: string[] = ["mouseDown"], ownerId: string | null = "cube"): PlayInputRuntime => ({
  triggersInUse: new Set(triggers) as PlayInputRuntime["triggersInUse"],
  fire: vi.fn(() => true),
  ownerOf: vi.fn(() => ownerId),
});

const setUp = (runtime: PlayInputRuntime | null, shouldIgnore?: (event: PointerEvent) => boolean) => {
  const canvas = fakeCanvas();
  const cursorElement = { style: { cursor: "" } } as HTMLElement;
  const pick = vi.fn((): string | null => "handle");
  const input = attachPlayInput({ canvas, cursorElement, pick, getRuntime: () => runtime, shouldIgnore });
  return { canvas, cursorElement, pick, input };
};

describe("attachPlayInput", () => {
  it("adds its listeners on attach and removes the same ones on detach, clearing the cursor", () => {
    const { canvas, cursorElement, input } = setUp(fakeRuntime());
    cursorElement.style.cursor = "pointer";

    expect([...canvas.listeners.keys()]).toEqual(["pointerdown", "pointermove", "pointerleave"]);
    input.detach();
    expect(canvas.removeEventListener.mock.calls).toEqual(canvas.addEventListener.mock.calls);
    expect(cursorElement.style.cursor).toBe("");
  });

  it("picks once on the frame after a move, however many moves there were, and not again", () => {
    const runtime = fakeRuntime();
    const { canvas, cursorElement, pick, input } = setUp(runtime);

    canvas.fire("pointermove", { clientX: 1, clientY: 2 });
    canvas.fire("pointermove", { clientX: 3, clientY: 4 });
    expect(pick).not.toHaveBeenCalled();

    input.frame();
    expect(pick).toHaveBeenCalledTimes(1);
    expect(pick).toHaveBeenCalledWith(3, 4);
    expect(runtime.ownerOf).toHaveBeenCalledWith("mouseDown", "handle");
    expect(cursorElement.style.cursor).toBe("pointer");

    input.frame();
    expect(pick).toHaveBeenCalledTimes(1);
  });

  it("shows no pointer over an object without a Mouse Down owner, and clears it when the pointer leaves", () => {
    const { canvas, cursorElement, input } = setUp(fakeRuntime(["mouseDown"], null));

    canvas.fire("pointermove");
    input.frame();
    expect(cursorElement.style.cursor).toBe("");

    cursorElement.style.cursor = "pointer";
    canvas.fire("pointerleave");
    expect(cursorElement.style.cursor).toBe("");
    input.frame();
    expect(cursorElement.style.cursor).toBe("");
  });

  it("fires Mouse Down on a left press, and nothing on another button or when the host says to ignore it", () => {
    const runtime = fakeRuntime();
    const { canvas, pick } = setUp(runtime, (event) => event.altKey);

    canvas.fire("pointerdown", { button: 1 });
    canvas.fire("pointerdown", { altKey: true });
    expect(pick).not.toHaveBeenCalled();
    expect(runtime.fire).not.toHaveBeenCalled();

    canvas.fire("pointerdown", { clientX: 5, clientY: 6 });
    expect(pick).toHaveBeenCalledWith(5, 6);
    expect(runtime.fire).toHaveBeenCalledWith("mouseDown", "handle");
  });

  it("fires nothing on a press that misses every object", () => {
    const runtime = fakeRuntime();
    const { canvas, pick } = setUp(runtime);
    pick.mockReturnValue(null);

    canvas.fire("pointerdown");
    expect(runtime.fire).not.toHaveBeenCalled();
  });

  it("never picks for a scene with no pointer triggers", () => {
    const { canvas, cursorElement, pick, input } = setUp(fakeRuntime(["start"]));

    canvas.fire("pointermove");
    input.frame();
    canvas.fire("pointerdown");
    expect(pick).toHaveBeenCalledTimes(1); // the press: a miss costs one pick, as before
    expect(cursorElement.style.cursor).toBe("");
  });

  it("does nothing while nothing is playing, and drops the cursor Play left", () => {
    const { canvas, cursorElement, pick, input } = setUp(null);
    cursorElement.style.cursor = "pointer";

    canvas.fire("pointermove");
    canvas.fire("pointerdown");
    input.frame();
    expect(pick).not.toHaveBeenCalled();
    expect(cursorElement.style.cursor).toBe("");
  });

  it("works without an element for the cursor", () => {
    const canvas = fakeCanvas();
    const input = attachPlayInput({ canvas, cursorElement: null, pick: () => "cube", getRuntime: () => fakeRuntime() });

    canvas.fire("pointermove");
    expect(() => input.frame()).not.toThrow();
    expect(() => input.detach()).not.toThrow();
  });
});
