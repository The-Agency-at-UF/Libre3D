// How a fixed-size frame (Frame settings: a width and a height in pixels) is scaled to fit the space
// it's shown in. Plain math: no store, React, or DOM, so the share-link viewer can fit a frame the
// same way the editor does.

export interface Size {
  width: number;
  height: number;
}

/** Space at the edges of a container that the frame must stay clear of, in pixels. */
export interface FrameInsets {
  left: number;
  right: number;
  top: number;
}

/** A frame is never drawn smaller than this share of its size, however little room there is. */
export const MIN_FRAME_SCALE = 0.1;

/** The room a container has for a frame once the insets are taken off: at least 1 pixel each way. */
export function availableFrameArea(container: Size, insets: FrameInsets): Size {
  return {
    width: Math.max(1, container.width - insets.left - insets.right),
    height: Math.max(1, container.height - insets.top),
  };
}

/**
 * The scale at which a frame fits the room it's given, keeping its shape. A frame that fits is
 * shown at its own size (1), never enlarged; one that doesn't is shrunk, down to MIN_FRAME_SCALE.
 * A frame whose size isn't a number gets 1.
 */
export function fitFrameScale(frame: Size, available: Size): number {
  const scale = Math.min(1, available.width / frame.width, available.height / frame.height);
  return Number.isFinite(scale) ? Math.max(scale, MIN_FRAME_SCALE) : 1;
}
