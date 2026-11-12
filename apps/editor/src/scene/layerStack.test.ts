import { describe, expect, it } from "vitest";
import {
  blendChannel,
  canRemoveLayer,
  canSwitchLayerType,
  compositeOver,
  depthRampPosition,
  evaluateSteps,
  fresnelAmount,
  gradientPosition,
  hexToRgb,
  isPlainPlan,
  lightingStrength,
  MASKABLE_LAYER_TYPES,
  maskTarget,
  maskValue,
  moveLayer,
  newLayerIndex,
  planStack,
  rampStopAt,
  removeBlockedReason,
  reverseStops,
  sampleRamp,
  type Paint,
  type PaintLayer,
} from "./layerStack";
import type { BlendMode, ColorLayer, DepthLayer, FresnelLayer, GradientLayer, ImageLayer, LightingLayer, MaterialLayer, NoiseLayer } from "./types";

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

const gradient = (overrides: Partial<GradientLayer> = {}): GradientLayer => ({
  id: "gradient",
  type: "gradient",
  enabled: true,
  opacity: 1,
  blendMode: "normal",
  gradientType: "linear",
  stops: [
    { color: "#000000", position: 0 },
    { color: "#ffffff", position: 1 },
  ],
  smooth: false,
  angle: 0,
  offset: [0, 0],
  morph: [0, 0],
  ...overrides,
});

const noise = (overrides: Partial<NoiseLayer> = {}): NoiseLayer => ({
  id: "noise",
  type: "noise",
  enabled: true,
  opacity: 1,
  blendMode: "normal",
  noiseType: "simplex",
  size: [1, 1, 1],
  scale: 1,
  movement: 0,
  colors: [{ color: "#666666" }, { color: "#666666" }, { color: "#ffffff" }, { color: "#ffffff" }],
  distortion: [1, 1],
  factorA: [1.7, 9.2],
  factorB: [8.3, 2.8],
  voronoiStyle: "f1",
  smoothness: 0.3,
  seed: 0,
  lowCut: 0,
  highCut: 1,
  ...overrides,
});

const fresnel = (overrides: Partial<FresnelLayer> = {}): FresnelLayer => ({
  id: "fresnel",
  type: "fresnel",
  enabled: true,
  opacity: 1,
  blendMode: "normal",
  color: "#ffffff",
  bias: 0.1,
  scale: 1,
  intensity: 2,
  factor: 1,
  ...overrides,
});

const image = (id: string): ImageLayer => ({
  id,
  type: "image",
  enabled: true,
  opacity: 1,
  blendMode: "normal",
  textureAssetId: "texture",
  wrapS: 1000,
  wrapT: 1000,
  projection: "uv",
  axis: "y",
  sharpness: "smooth",
  crop: false,
  scale: [1, 1],
  offset: [0, 0],
  rotation: 0,
});

const close = (actual: number[], expected: number[]) =>
  actual.forEach((value, i) => expect(value).toBeCloseTo(expected[i], 6));

const ids = (layers: MaterialLayer[]) => layers.map((layer) => layer.id);

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

describe("ramps", () => {
  it("blends each stop into the next, in sRGB, in position order", () => {
    const stops = [
      { color: "#0000ff", position: 1 },
      { color: "#ff0000", position: 0 },
      { color: "#00ff00", position: 0.5 },
    ];
    const at = (t: number) => sampleRamp(stops, false, t).rgb.map((c) => Number(c.toFixed(3)));
    expect(at(-1)).toEqual([1, 0, 0]);
    expect(at(0.25)).toEqual([0.5, 0.5, 0]);
    expect(at(2)).toEqual([0, 0, 1]);
    expect(rampStopAt(stops, false, 0.75)).toEqual({ color: "#008080", alpha: 1, position: 0.75 });
  });

  it("eases each blend when smooth", () => {
    const stops = depth().stops;
    expect(sampleRamp(stops, false, 0.25).rgb[0]).toBeCloseTo(0.25);
    expect(sampleRamp(stops, true, 0.25).rgb[0]).toBeCloseTo(0.15625); // 3t² − 2t³
    expect(sampleRamp(stops, true, 0.5).rgb[0]).toBeCloseTo(0.5);
  });

  it("blends the stops' alphas too", () => {
    const stops = [
      { color: "#ffffff", alpha: 0, position: 0 },
      { color: "#ffffff", position: 1 },
    ];
    expect(sampleRamp(stops, false, 0.25).alpha).toBeCloseTo(0.25);
  });

  it("turns around", () => {
    expect(reverseStops(depth().stops)).toEqual([
      { color: "#000000", position: 1 },
      { color: "#ffffff", position: 0 },
    ]);
  });
});

describe("depthRampPosition", () => {
  it("is the distance from the origin between near and far, clamped", () => {
    const layer = depth({ origin: [1, 0, 0], near: 1, far: 3 });
    expect(depthRampPosition(layer, 1, 0, 0)).toBe(0); // closer than near
    expect(depthRampPosition(layer, 1, 2, 0)).toBeCloseTo(0.5);
    expect(depthRampPosition(layer, 1, 0, 5)).toBe(1); // past far
  });

  it("measures along the direction when linear, whatever the direction's length", () => {
    const layer = depth({ gradientType: "linear", direction: [0, 10, 0], far: 4 });
    expect(depthRampPosition(layer, 5, 1, 5)).toBeCloseTo(0.25);
    expect(depthRampPosition(layer, 0, -3, 0)).toBe(0); // behind the origin
  });

  it("steps from first to last at near when near and far meet", () => {
    const layer = depth({ near: 1, far: 1 });
    expect(depthRampPosition(layer, 0.5, 0, 0)).toBe(0);
    expect(depthRampPosition(layer, 1.5, 0, 0)).toBe(1);
  });
});

describe("gradientPosition (Spline's maths)", () => {
  it("runs along u when linear at angle 0, and along v at 90°", () => {
    expect(gradientPosition(gradient(), 0.25, 0.9)).toBeCloseTo(0.25, 9);
    expect(gradientPosition(gradient(), 0.8, 0.1)).toBeCloseTo(0.8, 9);
    expect(gradientPosition(gradient({ angle: 90 }), 0.3, 0.6)).toBeCloseTo(0.6, 6);
  });

  it("moves with the offset", () => {
    expect(gradientPosition(gradient({ offset: [0.2, 0] }), 0.25, 0.5)).toBeCloseTo(0.45, 9);
  });

  it("is the distance from the middle when radial, 1 at the edges' middles", () => {
    const radial = gradient({ gradientType: "radial" });
    expect(gradientPosition(radial, 0.5, 0.5)).toBeCloseTo(0, 9);
    expect(gradientPosition(radial, 1, 0.5)).toBeCloseTo(1, 9);
    expect(gradientPosition(radial, 0.5, 0)).toBeCloseTo(1, 9);
  });

  it("goes once around the middle when polar", () => {
    const polar = gradient({ gradientType: "polar" });
    const around = [0.5, 0.75, 1].map((u) => gradientPosition(polar, u, 0.5));
    around.forEach((value) => expect(value).toBeGreaterThanOrEqual(0));
    around.forEach((value) => expect(value).toBeLessThan(1));
    expect(gradientPosition(polar, 0.5, 1)).toBeCloseTo(0, 9); // straight up from the middle: the start
    expect(gradientPosition(polar, 0.5, 0)).toBeCloseTo(0.5, 9); // straight down: halfway round
    expect(gradientPosition(polar, 1, 0.5)).toBeCloseTo(0.75, 9);
  });
});

describe("fresnelAmount", () => {
  it("is the bias facing the camera and bias + scale edge-on, clamped, times the factor", () => {
    expect(fresnelAmount(fresnel(), 1)).toBeCloseTo(0.1, 9);
    expect(fresnelAmount(fresnel(), 0)).toBe(1);
    expect(fresnelAmount(fresnel(), 0.5)).toBeCloseTo(0.35, 9); // 0.1 + 0.5²
    expect(fresnelAmount(fresnel({ factor: 0.5 }), 0)).toBe(0.5);
    expect(fresnelAmount(fresnel({ bias: 1 }), 1)).toBe(1); // a flat colour
    // A negative bias pulls the rim in: nothing facing the camera, less part way round.
    expect(fresnelAmount(fresnel({ bias: -0.5 }), 1)).toBe(0);
    expect(fresnelAmount(fresnel({ bias: -0.5 }), 0.5)).toBe(0); // -0.5 + 0.25
    expect(fresnelAmount(fresnel({ bias: -0.5 }), 0)).toBeCloseTo(0.5, 9);
  });
});

describe("masks", () => {
  it("mask the one painting layer right under them", () => {
    const layers: MaterialLayer[] = [gradient({ mask: true }), color("c", "#ff0000"), lighting(), noise({ mask: true }), color("b", "#ffffff")];
    expect(maskTarget(layers, 0)).toBe(1);
    expect(maskTarget(layers, 3)).toBe(4);
    expect(maskTarget(layers, 1)).toBeNull(); // not a mask
  });

  it("mask nothing over Lighting, another mask or nothing; a picture they do", () => {
    const layers: MaterialLayer[] = [fresnel({ mask: true }), lighting(), gradient({ id: "g", mask: true }), noise({ mask: true }), image("map"), image("last")];
    expect(maskTarget(layers, 0)).toBeNull();
    expect(maskTarget(layers, 2)).toBeNull();
    expect(maskTarget(layers, 3)).toBe(4);
    expect(maskTarget([image("m"), lighting()].map((layer, i) => (i === 0 ? { ...layer, mask: true } : layer)), 0)).toBeNull();
    expect(maskTarget([{ ...image("m"), mask: true }], 0)).toBeNull();
  });

  it("hide the masked layer where they're dark, and leave it where they're light", () => {
    const masked = (maskPaint: Paint, opacity = 1) => {
      const plan = planStack([lighting(), gradient({ mask: true, opacity }), color("top", "#ff0000"), color("base", "#0000ff")]);
      const sample = (layer: PaintLayer): Paint => (layer.type === "gradient" ? maskPaint : { rgb: hexToRgb((layer as ColorLayer).color), alpha: 1 });
      return evaluateSteps(plan.under, sample).rgb;
    };
    close(masked({ rgb: [1, 1, 1], alpha: 1 }), [1, 0, 0]);
    close(masked({ rgb: [0, 0, 0], alpha: 1 }), [0, 0, 1]);
    close(masked({ rgb: [0.5, 0.5, 0.5], alpha: 1 }), [0.5, 0, 0.5]);
    close(masked({ rgb: [0, 0, 0], alpha: 1 }, 0.5), [0.5, 0, 0.5]); // a half-strength mask
    expect(maskValue({ rgb: [1, 1, 1], alpha: 0.25 })).toBeCloseTo(0.25, 9);
  });
});

describe("planStack", () => {
  it("folds Color layers under Lighting into one colour: no nodes", () => {
    const plan = planStack([lighting(), color("top", "#ffffff", { blendMode: "multiply" }), color("bottom", "#808080")]);
    close(plan.folded!.rgb, hexToRgb("#808080"));
    expect(plan.folded!.alpha).toBe(1);
    expect(plan.opaque).toBe(true);
    expect(isPlainPlan(plan)).toBe(true);
  });

  it("is white with nothing painting, and see-through with only a part-opacity colour", () => {
    expect(planStack([lighting()]).folded).toEqual({ rgb: [1, 1, 1], alpha: 1 });
    const plan = planStack([lighting(), color("c", "#ffffff", { opacity: 0.4 })]);
    expect(plan.folded!.alpha).toBeCloseTo(0.4, 9);
    expect(plan.opaque).toBe(false);
  });

  it("splits the stack at Lighting, each part bottom first, eyes off left out", () => {
    const plan = planStack([fresnel(), color("glaze", "#ff0000", { enabled: false }), lighting(), gradient(), color("base", "#ffffff")]);
    expect(plan.over.map((step) => step.layer.id)).toEqual(["fresnel"]);
    expect(plan.under.map((step) => step.layer.id)).toEqual(["base", "gradient"]);
    expect(plan.folded).toBeNull();
    expect(plan.opaque).toBe(true);
    expect(isPlainPlan(plan)).toBe(false);
  });

  it("pairs each mask with the layer under it, and leaves masks out of the steps", () => {
    const plan = planStack([lighting(), noise({ mask: true }), color("top", "#ff0000"), color("base", "#0000ff")]);
    expect(plan.under.map((step) => [step.layer.id, step.mask?.id ?? null])).toEqual([
      ["base", null],
      ["top", "noise"],
    ]);
    expect(plan.folded).toBeNull(); // a masked Color layer is drawn per pixel
  });

  it("isn't opaque when no layer covers everything", () => {
    expect(planStack([lighting(), fresnel()]).opaque).toBe(false);
    expect(planStack([lighting(), gradient({ stops: [{ color: "#000000", alpha: 0.5, position: 0 }, { color: "#ffffff", position: 1 }] })]).opaque).toBe(false);
    expect(planStack([lighting(), fresnel(), noise()]).opaque).toBe(true);
  });

  it("isn't plain with a layer over Lighting, or Lighting under full opacity", () => {
    expect(isPlainPlan(planStack([color("glow", "#ffffff"), lighting(), color("c", "#000000")]))).toBe(false);
    expect(isPlainPlan(planStack([lighting({ opacity: 0.5 }), color("c", "#000000")]))).toBe(false);
    expect(planStack([lighting({ enabled: false })]).strength).toBe(0);
  });

  it("draws a Color layer over Lighting at full opacity as that colour, whatever the shading", () => {
    const plan = planStack([color("flat", "#336699"), lighting(), color("c", "#ffffff")]);
    const shaded: Paint = { rgb: [0.9, 0.1, 0.4], alpha: 1 };
    close(evaluateSteps(plan.over, (layer) => ({ rgb: hexToRgb((layer as ColorLayer).color), alpha: 1 }), shaded).rgb, hexToRgb("#336699"));
  });
});

describe("stack rules", () => {
  const stack: MaterialLayer[] = [lighting(), color("c", "#ffffff"), image("map")];

  it("never removes Lighting; a picture like any painting layer", () => {
    expect(canRemoveLayer(stack, stack[0])).toBe(false);
    expect(canRemoveLayer(stack, stack[2])).toBe(true);
    expect(removeBlockedReason(stack, stack[0])).toBe("Lighting can't be removed");
  });

  it("removes a painting layer only while another one stays; a mask always", () => {
    const one: MaterialLayer[] = [lighting(), image("only")];
    expect(canRemoveLayer(one, one[1])).toBe(false);
    expect(removeBlockedReason(one, one[1])).toBe("Add another colour layer first");
    expect(canRemoveLayer(stack, stack[1])).toBe(true); // the picture paints too
    const withNoise: MaterialLayer[] = [lighting(), noise(), color("c", "#ffffff")];
    expect(canRemoveLayer(withNoise, withNoise[2])).toBe(true);
    expect(canRemoveLayer(withNoise, withNoise[1])).toBe(true);
    const withMask: MaterialLayer[] = [lighting(), gradient({ mask: true }), color("c", "#ffffff")];
    expect(canRemoveLayer(withMask, withMask[2])).toBe(false); // a mask doesn't paint
    expect(canRemoveLayer(withMask, withMask[1])).toBe(true);
  });

  it("switches among the colour types (Image too), never Lighting", () => {
    const layers: MaterialLayer[] = [lighting(), depth(), color("c", "#ffffff")];
    for (const type of ["color", "image", "depth", "gradient", "noise", "fresnel", "normal", "matcap", "rainbow"] as const) {
      expect(canSwitchLayerType(layers, layers[2], type)).toBe(true);
    }
    expect(canSwitchLayerType(stack, stack[0], "color")).toBe(false);
    expect(canSwitchLayerType(stack, stack[2], "color")).toBe(true);
    expect(canSwitchLayerType(stack, stack[1], "lighting")).toBe(false);
  });

  it("puts pictures, matcaps, rainbows and the gradient kinds in Mask mode, but not Color or Normal", () => {
    for (const type of ["image", "matcap", "rainbow", "depth", "gradient", "noise", "fresnel"]) expect(MASKABLE_LAYER_TYPES).toContain(type);
    expect(MASKABLE_LAYER_TYPES).not.toContain("color");
    expect(MASKABLE_LAYER_TYPES).not.toContain("normal");
  });

  it("moves any layer anywhere, Lighting and pictures too", () => {
    const layers: MaterialLayer[] = [lighting(), color("a", "#ffffff"), depth(), image("map")];
    expect(ids(moveLayer(layers, "a", 2))).toEqual(["lighting", "depth", "a", "map"]);
    expect(ids(moveLayer(layers, "a", 0))).toEqual(["a", "lighting", "depth", "map"]);
    expect(ids(moveLayer(layers, "a", 9))).toEqual(["lighting", "depth", "map", "a"]);
    expect(ids(moveLayer(layers, "lighting", 2))).toEqual(["a", "depth", "lighting", "map"]);
    expect(ids(moveLayer(layers, "map", 1))).toEqual(["lighting", "map", "a", "depth"]);
  });

  it("adds new layers just under Lighting", () => {
    expect(newLayerIndex(stack)).toBe(1);
    expect(newLayerIndex([color("glow", "#ffffff"), ...stack])).toBe(2);
    expect(newLayerIndex([color("c", "#ffffff")])).toBe(0);
  });

  it("takes Lighting's opacity as the shading strength, 0 with its eye off", () => {
    expect(lightingStrength(lighting({ opacity: 0.3 }))).toBe(0.3);
    expect(lightingStrength(lighting({ enabled: false }))).toBe(0);
    expect(lightingStrength(undefined)).toBe(1);
  });
});
