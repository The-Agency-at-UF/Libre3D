import { describe, expect, it } from "vitest";
import {
  blendChannel,
  canRemoveLayer,
  canSwitchLayerType,
  colorLayersBottomUp,
  compositeOver,
  evaluatePlan,
  evaluateStack,
  hexToRgb,
  lightingStrength,
  moveLayer,
  newLayerIndex,
  planStack,
  removeBlockedReason,
} from "./layerStack";
import type { BlendMode, ColorLayer, DepthLayer, ImageLayer, LightingLayer, MaterialLayer } from "./types";

const color = (id: string, hex: string, overrides: Partial<ColorLayer> = {}): ColorLayer => ({
  id,
  type: "color",
  enabled: true,
  opacity: 1,
  blendMode: "normal",
  color: hex,
  ...overrides,
});

const lighting = (overrides: Partial<LightingLayer> = {}): LightingLayer => ({
  id: "lighting",
  type: "lighting",
  enabled: true,
  opacity: 1,
  blendMode: "normal",
  model: "phong",
  roughness: 0.45,
  metalness: 0.08,
  shininess: 30,
  emissive: "#000000",
  emissiveIntensity: 1,
  ...overrides,
});

const depth = (overrides: Partial<DepthLayer> = {}): DepthLayer => ({
  id: "depth",
  type: "depth",
  enabled: true,
  opacity: 1,
  blendMode: "normal",
  gradientType: "radial",
  origin: [0, 0, 0],
  direction: [1, 0, 0],
  near: 0,
  far: 2,
  stops: [
    { color: "#000000", position: 0 },
    { color: "#ffffff", position: 1 },
  ],
  smooth: false,
  ...overrides,
});

const image = (id: string): ImageLayer => ({
  id,
  type: "image",
  enabled: true,
  opacity: 1,
  blendMode: "normal",
  textureAssetId: "texture",
  slot: "color",
  wrapS: 1000,
  wrapT: 1000,
});

const close = (actual: number[], expected: number[]) =>
  actual.forEach((value, i) => expect(value).toBeCloseTo(expected[i], 6));

describe("blendChannel", () => {
  it.each<[BlendMode, number, number, number]>([
    ["normal", 0.2, 0.7, 0.7],
    ["multiply", 0.5, 0.4, 0.2],
    ["screen", 0.5, 0.4, 0.7],
    ["overlay", 0.25, 0.5, 0.25], // dark backdrop: 2·b·s
    ["overlay", 0.75, 0.5, 0.75], // light backdrop: 1 − 2(1−b)(1−s)
  ])("%s(%d, %d) = %d", (mode, backdrop, source, expected) => {
    expect(blendChannel(mode, backdrop, source)).toBeCloseTo(expected, 9);
  });
});

describe("compositeOver", () => {
  it("over an opaque backdrop, mixes the blend in by the source's alpha", () => {
    const result = compositeOver({ rgb: [0.5, 0.5, 0.5], alpha: 1 }, { rgb: [0.4, 0.4, 0.4], alpha: 0.5 }, "multiply");
    close(result.rgb, [0.35, 0.35, 0.35]); // mix(0.5, 0.2, 0.5)
    expect(result.alpha).toBe(1);
  });

  it("over nothing, keeps the source's colour and alpha whatever the mode", () => {
    const result = compositeOver({ rgb: [0, 0, 0], alpha: 0 }, { rgb: [0.2, 0.4, 0.6], alpha: 0.5 }, "multiply");
    close(result.rgb, [0.2, 0.4, 0.6]);
    expect(result.alpha).toBe(0.5);
  });

  it("adds alphas the Porter-Duff way", () => {
    const result = compositeOver({ rgb: [1, 0, 0], alpha: 0.5 }, { rgb: [0, 0, 1], alpha: 0.5 }, "normal");
    expect(result.alpha).toBeCloseTo(0.75, 9);
    close(result.rgb, [1 / 3, 0, 2 / 3]);
  });
});

describe("evaluateStack", () => {
  it("is white with no colour layer", () => {
    expect(evaluateStack([])).toEqual({ rgb: [1, 1, 1], alpha: 1 });
  });

  it("is a single opaque Color layer's own colour", () => {
    const result = evaluateStack([color("c", "#336699")]);
    close(result.rgb, hexToRgb("#336699"));
    expect(result.alpha).toBe(1);
  });

  it("draws bottom to top: the top layer (layers[0]) goes over the rest", () => {
    const layers: MaterialLayer[] = [color("top", "#ff0000", { opacity: 0.5 }), color("bottom", "#0000ff")];
    const result = evaluateStack(colorLayersBottomUp(layers));
    close(result.rgb, [0.5, 0, 0.5]);
  });

  it("leaves out layers with their eye off", () => {
    const layers: MaterialLayer[] = [color("top", "#ff0000", { enabled: false }), color("bottom", "#0000ff")];
    close(evaluateStack(colorLayersBottomUp(layers)).rgb, [0, 0, 1]);
  });

  it("makes the object see-through when the bottom layer is", () => {
    expect(evaluateStack([color("c", "#ffffff", { opacity: 0.4 })]).alpha).toBeCloseTo(0.4, 9);
  });
});

describe("planStack", () => {
  it("folds a stack without Depth into one colour", () => {
    const plan = planStack([lighting(), color("top", "#ffffff", { blendMode: "multiply" }), color("bottom", "#808080")]);
    expect(plan.depth).toBeNull();
    close(plan.under.rgb, hexToRgb("#808080"));
    expect(plan.alpha).toBe(1);
  });

  it("matches the pre-v5 Depth paint: Depth over Color by its opacity", () => {
    // Old documents had Depth painted as mix(base, ramp, opacity) in sRGB (utils/depthColors.ts).
    const base = hexToRgb("#4f8cff");
    const ramp: [number, number, number] = [1, 0.8, 0];
    const plan = planStack([lighting(), depth({ opacity: 0.6 }), color("c", "#4f8cff")]);
    const result = evaluatePlan(plan, ramp);
    close(result.rgb, base.map((b, i) => b + (ramp[i] - b) * 0.6));
    expect(result.alpha).toBe(1);
    expect(plan.alpha).toBe(1);
  });

  it("blends the Color layers over Depth onto the ramp", () => {
    const plan = planStack([color("tint", "#808080", { blendMode: "multiply" }), depth(), color("c", "#ffffff")]);
    expect(plan.over.map((layer) => layer.id)).toEqual(["tint"]);
    close(evaluatePlan(plan, [1, 1, 1]).rgb, hexToRgb("#808080"));
  });

  it("is see-through where only a part-opacity Depth layer is", () => {
    const plan = planStack([lighting(), depth({ opacity: 0.5 })]);
    expect(plan.under.alpha).toBe(0);
    expect(plan.alpha).toBe(0.5);
  });
});

describe("stack rules", () => {
  const stack: MaterialLayer[] = [lighting(), color("c", "#ffffff"), image("map")];

  it("never removes Lighting or an imported Image layer", () => {
    expect(canRemoveLayer(stack, stack[0])).toBe(false);
    expect(canRemoveLayer(stack, stack[2])).toBe(false);
    expect(removeBlockedReason(stack, stack[0])).toBe("Lighting can't be removed");
  });

  it("removes Color only while another colour layer stays", () => {
    expect(canRemoveLayer(stack, stack[1])).toBe(false);
    expect(removeBlockedReason(stack, stack[1])).toBe("Add another colour layer first");
    const withDepth: MaterialLayer[] = [lighting(), depth(), color("c", "#ffffff")];
    expect(canRemoveLayer(withDepth, withDepth[2])).toBe(true);
    expect(canRemoveLayer(withDepth, withDepth[1])).toBe(true);
    const twoColors: MaterialLayer[] = [lighting(), color("a", "#ffffff"), color("b", "#000000")];
    expect(canRemoveLayer(twoColors, twoColors[1])).toBe(true);
  });

  it("switches Color and Depth, keeps one Depth, never switches Lighting or Image", () => {
    const withDepth: MaterialLayer[] = [lighting(), depth(), color("c", "#ffffff")];
    expect(canSwitchLayerType(withDepth, withDepth[1], "color")).toBe(true);
    expect(canSwitchLayerType(withDepth, withDepth[2], "depth")).toBe(false);
    expect(canSwitchLayerType(stack, stack[1], "depth")).toBe(true);
    expect(canSwitchLayerType(stack, stack[0], "color")).toBe(false);
    expect(canSwitchLayerType(stack, stack[2], "color")).toBe(false);
  });

  it("moves layers between Lighting and the Image layers only", () => {
    const layers: MaterialLayer[] = [lighting(), color("a", "#ffffff"), depth(), image("map")];
    expect(moveLayer(layers, "a", 2).map((layer) => layer.id)).toEqual(["lighting", "depth", "a", "map"]);
    expect(moveLayer(layers, "a", 0).map((layer) => layer.id)).toEqual(["lighting", "a", "depth", "map"]);
    expect(moveLayer(layers, "a", 9).map((layer) => layer.id)).toEqual(["lighting", "depth", "a", "map"]);
    expect(moveLayer(layers, "lighting", 2)).toBe(layers);
    expect(moveLayer(layers, "map", 1)).toBe(layers);
  });

  it("adds new layers just under Lighting", () => {
    expect(newLayerIndex(stack)).toBe(1);
    expect(newLayerIndex([color("c", "#ffffff")])).toBe(0);
  });

  it("takes Lighting's opacity as the shading strength, 0 with its eye off", () => {
    expect(lightingStrength(lighting({ opacity: 0.3 }))).toBe(0.3);
    expect(lightingStrength(lighting({ enabled: false }))).toBe(0);
    expect(lightingStrength(undefined)).toBe(1);
  });
});
