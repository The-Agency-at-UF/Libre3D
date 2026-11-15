/**
 * PURPOSE: Play's pointer input, shared by the editor's Play (hooks/useViewportPlay.ts) and the
 * share-link viewer (SceneViewer.ts): the pointer listeners on the canvas, a left-button press
 * firing the Mouse Down events of the object under it, and a pointer cursor over what has them.
 *
 * INPUT: The canvas to listen on, the element the cursor goes on, how to pick the entity under a
 *        point of the canvas, where to find the running runtime, and the host's own reasons to
 *        ignore a press.
 * OUTPUT: `frame()`, which the host calls once per rendered frame, and `detach()`, which removes
 *         every listener `attachPlayInput` added and clears the cursor.
 *
 * It never picks on a move itself: a hover is noted and tested at most once, on the next frame, so
 * dragging across the canvas costs one raycast a frame however many move events arrive, and none
 * when the scene has nothing to click. It knows nothing of when Play starts or stops: `getRuntime`
 * returns null when nothing is playing, and then a press and a move do nothing. Nothing here loads
 * the store, React, or the editor's UI (runtimeBoundary.test.ts checks).
 */

import type { SceneRuntime } from "../animation/sceneRuntime";

/** What the input needs of a runtime: the triggers its scene uses, and `fire` and `ownerOf` for them. */
export type PlayInputRuntime = Pick<SceneRuntime, "fire" | "ownerOf" | "triggersInUse">;

type PointerListener = (event: PointerEvent) => void;

/** What the input needs of the canvas (a real one, or a fake in a test). */
export interface PlayInputCanvas {
  addEventListener(type: "pointerdown" | "pointermove" | "pointerleave", listener: PointerListener): void;
  removeEventListener(type: "pointerdown" | "pointermove" | "pointerleave", listener: PointerListener): void;
}

export interface PlayInputOptions {
  /** The canvas the pointer events come from. */
  canvas: PlayInputCanvas;
  /**
   * Where the pointer cursor goes. The canvas's container, not the canvas, so the orbit controls'
   * own cursor on the canvas (grab while Space is held, in the editor) still wins. Null does nothing.
   */
  cursorElement: Pick<HTMLElement, "style"> | null;
  /** The entity under a point of the canvas (pickEntity.ts), or null on a miss. */
  pick: (clientX: number, clientY: number) => string | null;
  /** The runtime that's playing, or null when nothing is: then input does nothing. */
  getRuntime: () => PlayInputRuntime | null;
  /** The host's own reasons to ignore a press (the editor's: Alt or Space held). A press with another button is always ignored. */
  shouldIgnore?: (event: PointerEvent) => boolean;
}

export interface PlayInput {
  /** Once per rendered frame, before the render: tests the hover noted since the last one, if any. */
  frame(): void;
  /** Removes the listeners and clears the cursor. */
  detach(): void;
}

const LEFT_BUTTON = 0;

export const attachPlayInput = ({ canvas, cursorElement, pick, getRuntime, shouldIgnore }: PlayInputOptions): PlayInput => {
  // The last pointer position not yet tested, as two numbers and a flag so a move allocates nothing.
  let hoverPending = false;
  let hoverX = 0;
  let hoverY = 0;

  const setCursor = (cursor: string) => {
    if (cursorElement && cursorElement.style.cursor !== cursor) cursorElement.style.cursor = cursor;
  };

  const onPointerDown = (event: PointerEvent) => {
    const runtime = getRuntime();
    if (!runtime || event.button !== LEFT_BUTTON || shouldIgnore?.(event)) return;
    const entityId = pick(event.clientX, event.clientY);
    if (entityId) runtime.fire("mouseDown", entityId);
  };

  const onPointerMove = (event: PointerEvent) => {
    if (!getRuntime()) return;
    hoverPending = true;
    hoverX = event.clientX;
    hoverY = event.clientY;
  };

  const onPointerLeave = () => {
    hoverPending = false;
    setCursor("");
  };

  canvas.addEventListener("pointerdown", onPointerDown);
  canvas.addEventListener("pointermove", onPointerMove);
  canvas.addEventListener("pointerleave", onPointerLeave);

  return {
    frame() {
      const runtime = getRuntime();
      if (!runtime) {
        // Play stopped since the last frame: the cursor it set goes with it.
        hoverPending = false;
        setCursor("");
        return;
      }
      if (!hoverPending) return;
      hoverPending = false;
      const entityId = runtime.triggersInUse.has("mouseDown") ? pick(hoverX, hoverY) : null;
      setCursor(entityId && runtime.ownerOf("mouseDown", entityId) ? "pointer" : "");
    },
    detach() {
      canvas.removeEventListener("pointerdown", onPointerDown);
      canvas.removeEventListener("pointermove", onPointerMove);
      canvas.removeEventListener("pointerleave", onPointerLeave);
      hoverPending = false;
      setCursor("");
    },
  };
};
