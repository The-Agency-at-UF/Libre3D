import { describe, expect, it } from "vitest";
import { linearToSrgb, mixHexLinear, srgbToLinear } from "./colorSpaces";

describe("sRGB and linear light", () => {
  it("keeps black and white", () => {
    expect(srgbToLinear(0)).toBe(0);
    expect(srgbToLinear(1)).toBeCloseTo(1, 10);
    expect(linearToSrgb(0)).toBe(0);
    expect(linearToSrgb(1)).toBeCloseTo(1, 10);
  });

  it("turns mid-grey into its known linear value", () => {
    // sRGB 0.5 is 0.21404 in linear light (IEC 61966-2-1).
    expect(srgbToLinear(0.5)).toBeCloseTo(0.21404, 5);
    expect(linearToSrgb(0.21404)).toBeCloseTo(0.5, 4);
  });

  it("round-trips every 8-bit value", () => {
    for (let value = 0; value <= 255; value++) {
      expect(Math.round(linearToSrgb(srgbToLinear(value / 255)) * 255)).toBe(value);
    }
  });
});

describe("mixHexLinear", () => {
  it("gives the ends as they were given", () => {
    expect(mixHexLinear("#FF0000", "#0000ff", 0)).toBe("#FF0000");
    expect(mixHexLinear("#FF0000", "#0000FF", 1)).toBe("#0000FF");
  });

  it("mixes in linear light, not on the sRGB values", () => {
    expect(mixHexLinear("#000000", "#ffffff", 0.5)).toBe("#bcbcbc");
    expect(mixHexLinear("#ff0000", "#0000ff", 0.5)).toBe("#bc00bc");
  });

  it("stays put between the same colour", () => {
    expect(mixHexLinear("#336699", "#336699", 0.3)).toBe("#336699");
  });

  it("takes the other colour when one isn't a colour", () => {
    expect(mixHexLinear("nope", "#112233", 0.5)).toBe("#112233");
    expect(mixHexLinear("#112233", "nope", 0.5)).toBe("#112233");
  });
});
