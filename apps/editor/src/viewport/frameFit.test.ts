import { describe, expect, it } from "vitest";
import { MIN_FRAME_SCALE, availableFrameArea, fitFrameScale } from "./frameFit";

const noInsets = { left: 0, right: 0, top: 0 };

describe("availableFrameArea", () => {
  it("is the whole container when nothing covers it", () => {
    expect(availableFrameArea({ width: 1280, height: 720 }, noInsets)).toEqual({ width: 1280, height: 720 });
  });

  it("takes the side insets off the width and the top inset off the height", () => {
    expect(availableFrameArea({ width: 1280, height: 720 }, { left: 280, right: 320, top: 60 })).toEqual({ width: 680, height: 660 });
  });

  it("never goes below one pixel", () => {
    expect(availableFrameArea({ width: 500, height: 40 }, { left: 280, right: 320, top: 60 })).toEqual({ width: 1, height: 1 });
  });
});

describe("fitFrameScale", () => {
  it("shows a frame that fits at its own size", () => {
    expect(fitFrameScale({ width: 400, height: 300 }, { width: 680, height: 660 })).toBe(1);
  });

  it("does not enlarge a small frame", () => {
    expect(fitFrameScale({ width: 10, height: 10 }, { width: 1000, height: 1000 })).toBe(1);
  });

  it("shrinks a frame that is too wide", () => {
    expect(fitFrameScale({ width: 1920, height: 1080 }, { width: 960, height: 1000 })).toBe(0.5);
  });

  it("shrinks a frame that is too tall", () => {
    expect(fitFrameScale({ width: 1080, height: 1920 }, { width: 2000, height: 480 })).toBe(0.25);
  });

  it("uses the tighter of the two directions", () => {
    expect(fitFrameScale({ width: 1000, height: 1000 }, { width: 500, height: 250 })).toBe(0.25);
  });

  it("stops shrinking at the smallest scale", () => {
    expect(fitFrameScale({ width: 1920, height: 1080 }, { width: 1, height: 1 })).toBe(MIN_FRAME_SCALE);
  });

  it("gives 1 for a frame with no size, or a size that isn't a number", () => {
    expect(fitFrameScale({ width: 0, height: 0 }, { width: 680, height: 660 })).toBe(1);
    expect(fitFrameScale({ width: Number.NaN, height: 1080 }, { width: 680, height: 660 })).toBe(1);
  });

  it("fits the editor's default frame between its sidebars", () => {
    const available = availableFrameArea({ width: 1280, height: 720 }, { left: 280, right: 320, top: 0 });
    expect(fitFrameScale({ width: 1920, height: 1080 }, available)).toBeCloseTo(680 / 1920, 10);
  });
});
