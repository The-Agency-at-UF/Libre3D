import { describe, expect, it } from "vitest";

import { DEFAULT_MATCAP, MATCAP_PRESETS, matcapPixels, matcapTexture } from "./matcaps";

// The sRGB colour at a point of the sphere (-1 to 1 across and up), from a preset's pixels (bottom row first).
const at = (pixels: Uint8ClampedArray, size: number, x: number, y: number) => {
  const column = Math.min(size - 1, Math.floor(((x + 1) / 2) * size));
  const row = Math.min(size - 1, Math.floor(((y + 1) / 2) * size));
  const i = (row * size + column) * 4;
  return [pixels[i], pixels[i + 1], pixels[i + 2], pixels[i + 3]];
};

describe("matcaps", () => {
  it("has Libre3D's eight", () => {
    expect(Object.keys(MATCAP_PRESETS)).toEqual(["clay", "chalk", "plastic", "jade", "pearl", "chrome", "gold", "toon"]);
    expect(MATCAP_PRESETS[DEFAULT_MATCAP].name).toBe("Clay");
  });

  it("draws the same pixels every time, and each preset its own", () => {
    expect(matcapPixels("jade", 32)).toEqual(matcapPixels("jade", 32));
    const middles = Object.keys(MATCAP_PRESETS).map((id) => at(matcapPixels(id, 32), 32, 0, 0).join(","));
    expect(new Set(middles).size).toBe(middles.length);
  });

  it("is lit from the top left, and opaque everywhere (past the sphere's edge too)", () => {
    const clay = matcapPixels("clay", 64);
    const brightness = (p: number[]) => p[0] + p[1] + p[2];
    expect(brightness(at(clay, 64, -0.4, 0.4))).toBeGreaterThan(brightness(at(clay, 64, 0.4, -0.4)));
    expect(at(clay, 64, 0, 0)[3]).toBe(255);
    expect(at(clay, 64, 0.99, 0.99)[3]).toBe(255);
  });

  it("falls back to the default for an unknown preset, and makes each texture once", () => {
    expect(matcapPixels("nope", 16)).toEqual(matcapPixels(DEFAULT_MATCAP, 16));
    expect(matcapTexture("gold")).toBe(matcapTexture("gold"));
    expect(matcapTexture("nope")).toBe(matcapTexture(DEFAULT_MATCAP));
  });
});
