/**
 * PURPOSE: Scroll progress for Scroll events (decision tree B4): where a scroller is between its top
 * and bottom, and the shown progress easing toward it a frame at a time.
 *
 * INPUT: A scroller's scroll position and sizes; the shown and scrolled progress, the frame's time,
 *        and whether the scene asks for smoothing.
 * OUTPUT: A progress from 0 to 1.
 *
 * Shared by the share page (SceneViewer, PublishedSceneView) and the editor's Play scrubber
 * (useViewportPlay), so both feel the same. Pure: no DOM reads here, so the callers decide when
 * to measure (on a scroll event, never in the frame loop).
 */

import { clampProgress } from "../animation/transitions";

/** Scroll length's range in the Scene panel, in screen heights (1 = 100%). */
export const SCROLL_LENGTH_LIMITS = { min: 1, max: 10 };

/**
 * How quickly smoothing closes the gap: by `1 - e^(-rate·dt)` of it a frame, which is 10% a frame
 * at 60 fps, and the same over a second at any frame rate.
 */
const SMOOTHING_RATE = -Math.log(0.9) * 60;

/** Closer than this, the shown progress takes the scrolled one, so easing ends instead of creeping forever. */
const SETTLED = 1e-4;

/**
 * Where a scroller is from its top (0) to its bottom (1): `scrollTop / (scrollHeight - clientHeight)`,
 * clamped. 0 when it can't scroll.
 */
export const scrollProgressOf = (scrollTop: number, scrollHeight: number, clientHeight: number): number => {
  const range = scrollHeight - clientHeight;
  return range > 0 ? clampProgress(scrollTop / range) : 0;
};

/**
 * The shown progress one frame of `dt` seconds later: `target` at once without smoothing (or once
 * it's close enough), else part of the way there. Never past the target.
 */
export const easeScrollProgress = (shown: number, target: number, dt: number, smooth: boolean): number => {
  if (!smooth || Math.abs(target - shown) < SETTLED) return target;
  const share = 1 - Math.exp(-SMOOTHING_RATE * Math.max(0, Number.isFinite(dt) ? dt : 0));
  return shown + (target - shown) * share;
};
