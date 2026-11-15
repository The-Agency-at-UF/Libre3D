/**
 * PURPOSE: Play's pointer input, shared by the editor's Play (hooks/useViewportPlay.ts) and the
 * share-link viewer (SceneViewer.ts): the pointer listeners on the canvas, the pointer triggers
 * (Mouse Down on a left press, Mouse Up on the release, Mouse Hover on entering an object) fired
 * on the object under the pointer, and a pointer cursor over what has any of them.
 *
 * INPUT: The canvas to listen on, the element the cursor goes on, how to pick the entity under a
 *        point of the canvas, where to find the running runtime, and the host's own reasons to
 *        ignore a press or release.
 * OUTPUT: `frame()`, which the host calls once per rendered frame, and `detach()`, which removes
 *         every listener `attachPlayInput` added and clears the cursor.
 *
 * It never picks on a move itself: a hover is noted and tested at most once, on the next frame, so
 * dragging across the canvas costs one raycast a frame however many move events arrive, and none
 * when the scene has no pointer trigger. Mouse Hover is enter-only (decision tree B2): it fires
 * when the hover's owner (the object, or its nearest ancestor with a Mouse Hover event) becomes a
 * different one, so sliding between two parts of one model is not a re-entry, leaving and coming
 * back is, and there is no hover-out. Touch has no hover; a tap is a press and a release. It knows
 * nothing of when Play starts or stops: `getRuntime` returns null when nothing is playing, and
 * then input does nothing. Nothing here loads the store, React, or the editor's UI
 * (runtimeBoundary.test.ts checks).
 */

import { POINTER_TRIGGERS } from "../animation/events";
import type { SceneRuntime } from "../animation/sceneRuntime";

/** What the input needs of a runtime: the triggers its scene uses, and `fire` and `ownerOf` for them. */
export type PlayInputRuntime = Pick<SceneRuntime, "fire" | "ownerOf" | "triggersInUse">;

type PointerListener = (event: PointerEvent) => void;

/** What the input needs of the canvas (a real one, or a fake in a test). */
type PointerEventType = "pointerdown" | "pointerup" | "pointermove" | "pointerleave";

export interface PlayInputCanvas {
  addEventListener(type: PointerEventType, listener: PointerListener): void;
  removeEventListener(type: PointerEventType, listener: PointerListener): void;
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
  /** The host's own reasons to ignore a press or release (the editor's: Alt or Space held, which orbit). Another button is always ignored. */
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
  // The owner of the last hover's Mouse Hover events (null over nothing with any), to fire on a change.
  let hoverOwner: string | null = null;

  const setCursor = (cursor: string) => {
    if (cursorElement && cursorElement.style.cursor !== cursor) cursorElement.style.cursor = cursor;
  };

  const usesPointerTriggers = (runtime: PlayInputRuntime) => POINTER_TRIGGERS.some((trigger) => runtime.triggersInUse.has(trigger));

  /** Whether the pointer is over something with a pointer trigger: when the cursor is a pointer. */
  const hasPointerOwner = (runtime: PlayInputRuntime, entityId: string) =>
    POINTER_TRIGGERS.some((trigger) => runtime.triggersInUse.has(trigger) && runtime.ownerOf(trigger, entityId) !== null);

  // A press and a release each pick where they happen: Mouse Up fires on what is under the pointer
  // at the release, whatever was pressed.
  const onPointerButton = (event: PointerEvent, trigger: "mouseDown" | "mouseUp") => {
    const runtime = getRuntime();
    if (!runtime || event.button !== LEFT_BUTTON || shouldIgnore?.(event) || !runtime.triggersInUse.has(trigger)) return;
    const entityId = pick(event.clientX, event.clientY);
    if (entityId) runtime.fire(trigger, entityId);
  };
  const onPointerDown = (event: PointerEvent) => onPointerButton(event, "mouseDown");
  const onPointerUp = (event: PointerEvent) => onPointerButton(event, "mouseUp");

  const onPointerMove = (event: PointerEvent) => {
    if (!getRuntime()) return;
    hoverPending = true;
    hoverX = event.clientX;
    hoverY = event.clientY;
  };

  const onPointerLeave = () => {
    hoverPending = false;
    hoverOwner = null;
    setCursor("");
  };

  canvas.addEventListener("pointerdown", onPointerDown);
  canvas.addEventListener("pointerup", onPointerUp);
  canvas.addEventListener("pointermove", onPointerMove);
  canvas.addEventListener("pointerleave", onPointerLeave);

  return {
    frame() {
      const runtime = getRuntime();
      if (!runtime) {
        // Play stopped since the last frame: the cursor it set goes with it.
        hoverPending = false;
        hoverOwner = null;
        setCursor("");
        return;
      }
      if (!hoverPending) return;
      hoverPending = false;
      const entityId = usesPointerTriggers(runtime) ? pick(hoverX, hoverY) : null;
      setCursor(entityId && hasPointerOwner(runtime, entityId) ? "pointer" : "");

      if (!runtime.triggersInUse.has("mouseHover")) return;
      const owner = entityId ? runtime.ownerOf("mouseHover", entityId) : null;
      if (owner === hoverOwner) return;
      hoverOwner = owner;
      if (owner) runtime.fire("mouseHover", owner);
    },
    detach() {
      canvas.removeEventListener("pointerdown", onPointerDown);
      canvas.removeEventListener("pointerup", onPointerUp);
      canvas.removeEventListener("pointermove", onPointerMove);
      canvas.removeEventListener("pointerleave", onPointerLeave);
      hoverPending = false;
      hoverOwner = null;
      setCursor("");
    },
  };
};
