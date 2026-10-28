/**
 * PURPOSE: The easing curves a transition step can use (notes/animation-plan.md, A3).
 *
 * The same five curves as CSS, with the same control points, which is also what Spline uses, so a
 * scene eases the way it would there. Each is a cubic Bézier from (0, 0) to (1, 1); `cubicBezier`
 * turns one into a function of time. Spring and custom Bézier curves aren't offered yet; a custom
 * curve would only need its own control points.
 */

export type Easing = "linear" | "ease" | "easeIn" | "easeOut" | "easeInOut";

/** The curves in the order the easing dropdown lists them, with their names there. */
export const EASINGS: { value: Easing; label: string }[] = [
  { value: "linear", label: "Linear" },
  { value: "ease", label: "Ease" },
  { value: "easeIn", label: "Ease In" },
  { value: "easeOut", label: "Ease Out" },
  { value: "easeInOut", label: "Ease In Out" },
];

// The two inner control points (x1, y1, x2, y2), as in CSS's `cubic-bezier()`.
const CONTROL_POINTS: Record<Easing, [number, number, number, number]> = {
  linear: [0, 0, 1, 1],
  ease: [0.25, 0.1, 0.25, 1],
  easeIn: [0.42, 0, 1, 1],
  easeOut: [0, 0, 0.58, 1],
  easeInOut: [0.42, 0, 0.58, 1],
};

/**
 * A CSS-style timing function: for a time from 0 to 1, how far along (0 to 1) the value is. The
 * curve is given by its x (time) and y (progress) as polynomials of a parameter t, so finding y
 * for a time means solving x(t) = time first: Newton's method, which converges in a few steps
 * almost everywhere, with bisection as the fallback where the curve is too flat for it.
 */
export const cubicBezier = (x1: number, y1: number, x2: number, y2: number): ((time: number) => number) => {
  const cx = 3 * x1;
  const bx = 3 * (x2 - x1) - cx;
  const ax = 1 - cx - bx;
  const cy = 3 * y1;
  const by = 3 * (y2 - y1) - cy;
  const ay = 1 - cy - by;

  const sampleX = (t: number) => ((ax * t + bx) * t + cx) * t;
  const sampleY = (t: number) => ((ay * t + by) * t + cy) * t;
  const slopeX = (t: number) => (3 * ax * t + 2 * bx) * t + cx;

  const solveT = (time: number): number => {
    let t = time;
    for (let i = 0; i < 8; i += 1) {
      const error = sampleX(t) - time;
      if (Math.abs(error) < 1e-7) return t;
      const slope = slopeX(t);
      if (Math.abs(slope) < 1e-6) break;
      t -= error / slope;
    }

    let low = 0;
    let high = 1;
    t = time;
    for (let i = 0; i < 40; i += 1) {
      const x = sampleX(t);
      if (Math.abs(x - time) < 1e-7) break;
      if (x < time) low = t;
      else high = t;
      t = (low + high) / 2;
    }
    return t;
  };

  return (time) => (time <= 0 ? 0 : time >= 1 ? 1 : sampleY(solveT(time)));
};

const CURVES = Object.fromEntries(
  Object.entries(CONTROL_POINTS).map(([easing, points]) => [easing, cubicBezier(...points)]),
) as Record<Easing, (time: number) => number>;

/** How far along a step is (0 to 1) at `time` (0 to 1) with this easing. Unknown easings are linear. */
export const applyEasing = (easing: Easing, time: number): number => {
  const clamped = Math.min(1, Math.max(0, time));
  return easing === "linear" || !(easing in CURVES) ? clamped : CURVES[easing](clamped);
};
