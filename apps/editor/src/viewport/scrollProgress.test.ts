import { describe, expect, it } from "vitest";
import { easeScrollProgress, scrollProgressOf } from "./scrollProgress";

const run = (fps: number, seconds: number, target = 1) => {
  let shown = 0;
  for (let frame = 0; frame < fps * seconds; frame += 1) shown = easeScrollProgress(shown, target, 1 / fps, true);
  return shown;
};

describe("easeScrollProgress", () => {
  it("jumps to the target without smoothing", () => {
    expect(easeScrollProgress(0, 0.7, 1 / 60, false)).toBe(0.7);
  });

  it("closes 10% of the gap in a 60 fps frame, and reaches the target", () => {
    expect(easeScrollProgress(0, 1, 1 / 60, true)).toBeCloseTo(0.1, 10);
    expect(run(60, 2)).toBe(1);
  });

  it("eases the same at 30 and 120 fps", () => {
    expect(run(30, 0.5)).toBeCloseTo(run(120, 0.5), 6);
  });

  it("never overshoots, going either way, even after a long frame", () => {
    expect(easeScrollProgress(0.2, 0.6, 5, true)).toBeLessThanOrEqual(0.6);
    expect(easeScrollProgress(0.9, 0.3, 1 / 60, true)).toBeGreaterThan(0.3);
    expect(easeScrollProgress(0.9, 0.3, 1 / 60, true)).toBeLessThan(0.9);
  });

  it("doesn't move on a frame with no time or a bad time", () => {
    expect(easeScrollProgress(0.4, 1, 0, true)).toBe(0.4);
    expect(easeScrollProgress(0.4, 1, Number.NaN, true)).toBe(0.4);
  });
});

describe("scrollProgressOf", () => {
  it("is the share of the scroll range scrolled, clamped", () => {
    expect(scrollProgressOf(0, 4000, 1000)).toBe(0);
    expect(scrollProgressOf(1500, 4000, 1000)).toBe(0.5);
    expect(scrollProgressOf(3000, 4000, 1000)).toBe(1);
    expect(scrollProgressOf(3100, 4000, 1000)).toBe(1); // overscroll bounce
    expect(scrollProgressOf(-50, 4000, 1000)).toBe(0);
  });

  it("is 0 for a scroller that can't scroll", () => {
    expect(scrollProgressOf(0, 1000, 1000)).toBe(0);
  });
});
