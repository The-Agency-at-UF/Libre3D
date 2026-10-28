import { describe, expect, it } from "vitest";
import { applyEasing, cubicBezier, EASINGS } from "./easing";

describe("cubicBezier", () => {
  it("starts at 0 and ends at 1", () => {
    const curve = cubicBezier(0.42, 0, 0.58, 1);

    expect(curve(0)).toBe(0);
    expect(curve(1)).toBe(1);
    expect(curve(-1)).toBe(0);
    expect(curve(2)).toBe(1);
  });

  it("is the identity for the straight line", () => {
    const curve = cubicBezier(0, 0, 1, 1);

    for (const time of [0.1, 0.25, 0.5, 0.9]) {
      expect(curve(time)).toBeCloseTo(time, 6);
    }
  });

  it("matches CSS's ease-in-out: symmetric about the middle", () => {
    const curve = cubicBezier(0.42, 0, 0.58, 1);

    expect(curve(0.5)).toBeCloseTo(0.5, 6);
    for (const time of [0.1, 0.2, 0.3, 0.4]) {
      expect(curve(time) + curve(1 - time)).toBeCloseTo(1, 6);
    }
  });

  it("matches known values of CSS's curves", () => {
    // Reference values from the CSS cubic-bezier definition.
    expect(cubicBezier(0.42, 0, 1, 1)(0.5)).toBeCloseTo(0.3153, 3); // ease-in
    expect(cubicBezier(0, 0, 0.58, 1)(0.5)).toBeCloseTo(0.6847, 3); // ease-out
    expect(cubicBezier(0.25, 0.1, 0.25, 1)(0.5)).toBeCloseTo(0.8024, 3); // ease
  });

  it("never goes backwards", () => {
    for (const { value } of EASINGS) {
      let previous = 0;
      for (let i = 1; i <= 100; i += 1) {
        const current = applyEasing(value, i / 100);
        expect(current).toBeGreaterThanOrEqual(previous - 1e-9);
        previous = current;
      }
    }
  });
});

describe("applyEasing", () => {
  it("eases in slowly and out quickly, and the reverse", () => {
    expect(applyEasing("easeIn", 0.25)).toBeLessThan(0.25);
    expect(applyEasing("easeOut", 0.25)).toBeGreaterThan(0.25);
  });

  it("clamps the time and treats an unknown easing as linear", () => {
    expect(applyEasing("easeInOut", 1.5)).toBe(1);
    expect(applyEasing("easeInOut", -0.5)).toBe(0);
    expect(applyEasing("bounce" as never, 0.3)).toBeCloseTo(0.3, 9);
  });
});
