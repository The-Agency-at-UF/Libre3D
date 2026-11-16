/**
 * PURPOSE: Play's input, shared by the editor's Play (hooks/useViewportPlay.ts) and the share-link
 * viewer (SceneViewer.ts): the pointer listeners on the canvas, the pointer triggers (Mouse Down
 * on a left press, Mouse Up on the release, Mouse Hover on entering an object) fired on the object
 * under the pointer, a pointer cursor over what has any of them, and the key triggers (Key Down,
 * Key Up) fired from the keyboard, whatever the pointer is over.
 *
 * INPUT: The canvas to listen on, the element the cursor goes on, how to pick the entity under a
 *        point of the canvas, where to find the running runtime, the host's own reasons to ignore a
 *        press or release, and where keys are listened for (`keyTarget`, the window by default).
 * OUTPUT: `frame()`, which the host calls once per rendered frame, and `detach()`, which removes
 *         every listener `attachPlayInput` added (the key ones too) and clears the cursor.
 *
 * It never picks on a move itself: a hover is noted and tested at most once, on the next frame, so
 * dragging across the canvas costs one raycast a frame however many move events arrive, and none
 * when the scene has no pointer trigger. Mouse Hover is enter-only (decision tree B2): it fires
 * when the hover's region (the object, or its nearest ancestor with a Mouse Hover or Mouse Leave event)
 * becomes a different one, so sliding between two parts of one model is not a re-entry, and leaving and
 * coming back is. Mouse Leave (its counterpart) fires on the region the pointer left: when it moves onto
 * another region (before that region's Mouse Hover), onto nothing, or off the canvas. Touch has no hover; a tap is a press and a release.
 *
 * Keys are listened for only while the playing scene has a Key event with a key picked (checked
 * each frame, so the editor's Play attaches them on its first frame and drops them on Stop). Auto-
 * repeat is ignored, so holding a key fires Key Down once. A key typed into a field is the field's.
 * Only the scene's own keys are claimed from the page (`preventDefault`, so Space and the arrows
 * don't scroll under a scene that uses them), and never with Ctrl or Cmd held, which keeps the
 * browser's and the editor's shortcuts (zoom) working; every other key is left alone. It knows
 * nothing of when Play starts or stops: `getRuntime` returns null when nothing is playing, and
 * then input does nothing. Nothing here loads the store, React, or the editor's UI
 * (runtimeBoundary.test.ts checks).
 */

import { POINTER_TRIGGERS } from "../animation/events";
import type { SceneRuntime } from "../animation/sceneRuntime";

/** What the input needs of a runtime: the triggers its scene uses, and `fire` and `ownerOf` for them. */
export type PlayInputRuntime = Pick<SceneRuntime, "fire" | "ownerOf" | "triggersInUse" | "key" | "keyCodes">;

type PointerListener = (event: PointerEvent) => void;
type KeyListener = (event: KeyboardEvent) => void;

/** What the input needs of the canvas (a real one, or a fake in a test). */
type PointerEventType = "pointerdown" | "pointerup" | "pointermove" | "pointerleave";

export interface PlayInputCanvas {
  addEventListener(type: PointerEventType, listener: PointerListener): void;
  removeEventListener(type: PointerEventType, listener: PointerListener): void;
}

/** What the input needs of where keys come from (the window, an embed's element, or a fake in a test). */
export interface PlayInputKeyTarget {
  addEventListener(type: "keydown" | "keyup", listener: KeyListener): void;
  removeEventListener(type: "keydown" | "keyup", listener: KeyListener): void;
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
  /** Where Key Down and Key Up are listened for. The window by default; the embed (item G) will scope keys to its element. */
  keyTarget?: PlayInputKeyTarget;
}

export interface PlayInput {
  /** Once per rendered frame, before the render: tests the hover noted since the last one, if any, and listens for keys if the scene has some. */
  frame(): void;
  /** Removes the listeners and clears the cursor. */
  detach(): void;
}

const LEFT_BUTTON = 0;

/** Whether a key went to something being typed in, which keeps it. */
const isTypingTarget = (target: EventTarget | null): boolean => {
  const element = target as { tagName?: string; isContentEditable?: boolean } | null;
  return !!element && (element.isContentEditable === true || ["INPUT", "TEXTAREA", "SELECT"].includes(element.tagName ?? ""));
};

export const attachPlayInput = ({
  canvas,
  cursorElement,
  pick,
  getRuntime,
  shouldIgnore,
  keyTarget = typeof window === "undefined" ? undefined : window,
}: PlayInputOptions): PlayInput => {
  // The last pointer position not yet tested, as two numbers and a flag so a move allocates nothing.
  let hoverPending = false;
  let hoverX = 0;
  let hoverY = 0;
  // The owner of the last hover's Mouse Hover events (null over nothing with any), to fire on a change.
  let hoverOwner: string | null = null;

  const setCursor = (cursor: string) => {
    if (cursorElement && cursorElement.style.cursor !== cursor) cursorElement.style.cursor = cursor;
  };

  const hoverRegionOf = (runtime: PlayInputRuntime, entityId: string) =>
    runtime.ownerOf("mouseHover", entityId) ?? runtime.ownerOf("mouseLeave", entityId);

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

  // The pointer left the canvas: whatever it was over is left too.
  const onPointerLeave = () => {
    const runtime = getRuntime();
    const left = hoverOwner;
    hoverPending = false;
    hoverOwner = null;
    setCursor("");
    if (runtime && left && runtime.triggersInUse.has("mouseLeave")) runtime.fire("mouseLeave", left);
  };

  const onKey = (event: KeyboardEvent, trigger: "keyDown" | "keyUp") => {
    const runtime = getRuntime();
    if (!runtime || !runtime.keyCodes.has(event.code) || event.ctrlKey || event.metaKey || isTypingTarget(event.target)) return;
    // A repeat is still the scene's key, so it still mustn't scroll the page; it just doesn't fire.
    event.preventDefault();
    if (!event.repeat) runtime.key(trigger, event.code);
  };
  const onKeyDown = (event: KeyboardEvent) => onKey(event, "keyDown");
  const onKeyUp = (event: KeyboardEvent) => onKey(event, "keyUp");

  let listeningForKeys = false;
  const listenForKeys = (listen: boolean) => {
    if (!keyTarget || listen === listeningForKeys) return;
    listeningForKeys = listen;
    if (listen) {
      keyTarget.addEventListener("keydown", onKeyDown);
      keyTarget.addEventListener("keyup", onKeyUp);
    } else {
      keyTarget.removeEventListener("keydown", onKeyDown);
      keyTarget.removeEventListener("keyup", onKeyUp);
    }
  };

  canvas.addEventListener("pointerdown", onPointerDown);
  canvas.addEventListener("pointerup", onPointerUp);
  canvas.addEventListener("pointermove", onPointerMove);
  canvas.addEventListener("pointerleave", onPointerLeave);

  return {
    frame() {
      const runtime = getRuntime();
      listenForKeys(!!runtime && runtime.keyCodes.size > 0);
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

      if (!runtime.triggersInUse.has("mouseHover") && !runtime.triggersInUse.has("mouseLeave")) return;
      // A region is an object with a hover or leave event (or its nearest ancestor with one).
      const owner = entityId ? hoverRegionOf(runtime, entityId) : null;
      if (owner === hoverOwner) return;
      const left = hoverOwner;
      hoverOwner = owner;
      if (left && runtime.triggersInUse.has("mouseLeave")) runtime.fire("mouseLeave", left);
      if (owner) runtime.fire("mouseHover", owner);
    },
    detach() {
      canvas.removeEventListener("pointerdown", onPointerDown);
      canvas.removeEventListener("pointerup", onPointerUp);
      canvas.removeEventListener("pointermove", onPointerMove);
      canvas.removeEventListener("pointerleave", onPointerLeave);
      listenForKeys(false);
      hoverPending = false;
      hoverOwner = null;
      setCursor("");
    },
  };
};
