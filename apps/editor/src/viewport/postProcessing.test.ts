import { describe, expect, it } from "vitest";

import { deepMerge } from "../scene/deepMerge";
import { initialPostProcessingDefaults } from "../scene/defaults";
import type { DeepPartial, PostProcessingConfig } from "../scene/types";
import { activeEffects, effectShare, effectValues, exposureStops } from "./postProcessing";

const config = (changes: DeepPartial<PostProcessingConfig> = {}): PostProcessingConfig => deepMerge(initialPostProcessingDefaults, changes);

describe("activeEffects", () => {
  it("holds nothing for a new scene: every effect starts off", () => {
    expect(activeEffects(config())).toEqual([]);
  });

  it("lists the effects that are on in the order they're applied, whatever order they were turned on in", () => {
    const on = config({ noise: { enabled: true }, vignette: { enabled: true }, bloom: { enabled: true }, brightness: { enabled: true }, hue: { enabled: true } });

    expect(activeEffects(on)).toEqual(["bloom", "hue", "brightness", "vignette", "noise"]);
  });

  it("holds nothing while the master switch is off", () => {
    expect(activeEffects(config({ enabled: false, bloom: { enabled: true } }))).toEqual([]);
  });

  it("leaves out the effects that aren't drawn yet", () => {
    expect(activeEffects(config({ dof: { enabled: true }, pixelation: { enabled: true }, aberration: { enabled: true } }))).toEqual([]);
  });
});

describe("exposureStops", () => {
  it("is the scene's exposure, and none while the master switch is off", () => {
    expect(exposureStops(config({ exposure: 1.5 }))).toBe(1.5);
    expect(exposureStops(config({ exposure: 1.5, enabled: false }))).toBe(0);
  });
});

describe("effectShare", () => {
  it("turns an amount in percent into a share, kept between none and all", () => {
    expect([0, 25, 100, 250, -10].map(effectShare)).toEqual([0, 0.25, 1, 1, 0]);
  });
});

describe("effectValues", () => {
  it("passes the panel's numbers through as they are", () => {
    const values = effectValues(
      config({
        bloom: { intensity: 2, blurScale: 0.5, threshold: 0.4, smoothing: 0.1 },
        hue: { hue: 3, saturation: -0.5 },
        brightness: { brightness: 0.25, contrast: 0.5 },
        vignette: { darkness: 1, offset: 0.3 },
      }),
    );

    expect(values.bloomStrength).toBeCloseTo(2 / 3);
    expect(values).toMatchObject({ bloomRadius: 0.5, bloomThreshold: 0.4, bloomSmoothing: 0.1, hueTurn: 3, saturation: -0.5, brightness: 0.25, contrast: 0.5, vignetteDarkness: 1, vignetteOffset: 0.3 });
  });

  it("scales bloom by its amount, since bloom is laid over the picture", () => {
    expect(effectValues(config({ bloom: { intensity: 2, amount: 25 } })).bloomStrength).toBeCloseTo(0.5 / 3);
    expect(effectValues(config({ bloom: { intensity: -1 } })).bloomStrength).toBe(0);
  });

  it("gives every other effect its amount as a share", () => {
    const values = effectValues(config({ hue: { amount: 10 }, brightness: { amount: 20 }, vignette: { amount: 30 }, noise: { amount: 40 } }));

    expect(values).toMatchObject({ hueShare: 0.1, brightnessShare: 0.2, vignetteShare: 0.3, noiseShare: 0.4 });
  });

  it("keeps values inside what the maths can take", () => {
    const values = effectValues(config({ brightness: { contrast: 1, brightness: 5 }, hue: { saturation: 3 }, bloom: { smoothing: 0, blurScale: 4, threshold: 2 }, vignette: { offset: 2, darkness: -1 } }));

    expect(values.contrast).toBeLessThan(1);
    expect(values).toMatchObject({ brightness: 1, saturation: 1, bloomRadius: 1, bloomThreshold: 1, vignetteOffset: 1, vignetteDarkness: 0 });
    expect(values.bloomSmoothing).toBeGreaterThan(0);
  });
});
