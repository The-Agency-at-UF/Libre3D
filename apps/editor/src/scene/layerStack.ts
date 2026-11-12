/**
 * PURPOSE: The rules of an object's material layer stack (task D2): which layers make colour, which
 * can be removed or switched to another type, how one layer blends over the layers under it, and
 * what colour and opacity the stack adds up to.
 *
 * INPUT: An entity's `materialLayers`, top first (`layers[0]` is the top of the stack, as the panel
 * lists it). OUTPUT: Plain answers and plain sRGB numbers.
 *
 * The stack is drawn bottom to top. Each layer goes over what is under it with its blend mode and
 * its opacity, by the W3C compositing formulas (Compositing and Blending Level 1), on sRGB values
 * as the colours are picked. Lighting shades the result and sits on top. Image layers only fill
 * their texture slots for now (they come from imported models), so they take no part here.
 *
 * The viewport draws the same blend in TSL (viewport/layerNodes.ts); an export bakes it with these
 * functions. No store, React or Three.js, so everything can use it and Vitest can check it.
 */

import type { BlendMode, ColorLayer, DepthLayer, LightingLayer, MaterialLayer, MaterialLayerType } from "./types";

export type RGB = [number, number, number];

/** A colour (sRGB, 0-1) and how much of it there is (0-1, not premultiplied). */
export interface Paint {
  rgb: RGB;
  alpha: number;
}

export const BLEND_MODES: BlendMode[] = ["normal", "multiply", "screen", "overlay"];

/** Layer types that make colour. An object keeps at least one of them (so Color can go once another is there). */
export const COLOR_LAYER_TYPES: readonly MaterialLayerType[] = ["color", "depth"];

/** Layer types a layer's type dropdown can switch it to, and what "+" can add. */
export const SWITCHABLE_LAYER_TYPES: readonly MaterialLayerType[] = ["color", "depth"];

export const isColorLayerType = (type: MaterialLayerType): boolean => COLOR_LAYER_TYPES.includes(type);

/** What the shading of a stack with no colour layer starts from: white, as a material does. */
const WHITE: Paint = { rgb: [1, 1, 1], alpha: 1 };
const NOTHING: Paint = { rgb: [0, 0, 0], alpha: 0 };

/**
 * Whether `layer` can be removed from `layers`: never Lighting; a colour layer only while another
 * colour layer stays. Image layers come with an imported model and stay with it.
 */
export const canRemoveLayer = (layers: MaterialLayer[], layer: MaterialLayer): boolean => {
  if (layer.type === "lighting" || layer.type === "image") return false;
  if (!isColorLayerType(layer.type)) return true;
  return layers.some((each) => each.id !== layer.id && isColorLayerType(each.type));
};

/** Why `layer` can't be removed, for the × button's tooltip; null when it can. */
export const removeBlockedReason = (layers: MaterialLayer[], layer: MaterialLayer): string | null => {
  if (canRemoveLayer(layers, layer)) return null;
  if (layer.type === "lighting") return "Lighting can't be removed";
  if (layer.type === "image") return "Comes with the imported model";
  return "Add another colour layer first";
};

/**
 * Whether `layer` can become a layer of type `to`. Lighting and Image layers keep their type;
 * an object has at most one Depth layer (it's the mesh's vertex colours); and an object keeps a
 * colour layer (every switchable type makes colour, so that holds).
 */
export const canSwitchLayerType = (layers: MaterialLayer[], layer: MaterialLayer, to: MaterialLayerType): boolean => {
  if (layer.type === to) return true;
  if (!SWITCHABLE_LAYER_TYPES.includes(layer.type) || !SWITCHABLE_LAYER_TYPES.includes(to)) return false;
  if (to === "depth" && layers.some((each) => each.type === "depth" && each.id !== layer.id)) return false;
  return true;
};

/** Where a dragged layer may go: below Lighting, above the Image layers. Returns the index range (inclusive). */
export const movableRange = (layers: MaterialLayer[]): [number, number] => {
  const first = layers.findIndex((layer) => layer.type !== "lighting");
  let last = layers.length - 1;
  while (last >= 0 && layers[last].type === "image") last -= 1;
  return [first < 0 ? layers.length : first, last];
};

/** Moves the layer `layerId` to `toIndex`, kept inside movableRange. The same array when nothing moves. */
export const moveLayer = (layers: MaterialLayer[], layerId: string, toIndex: number): MaterialLayer[] => {
  const from = layers.findIndex((layer) => layer.id === layerId);
  if (from < 0) return layers;
  const [min, max] = movableRange(layers);
  if (from < min || from > max) return layers;
  const to = Math.min(max, Math.max(min, toIndex));
  if (to === from) return layers;
  const moved = [...layers];
  const [layer] = moved.splice(from, 1);
  moved.splice(to, 0, layer);
  return moved;
};

/** Where a new layer goes: just under Lighting (or on top, without one). */
export const newLayerIndex = (layers: MaterialLayer[]): number => {
  const lighting = layers.findIndex((layer) => layer.type === "lighting");
  return lighting < 0 ? 0 : lighting + 1;
};

/** One channel of the blend function B(backdrop, source), sRGB 0-1. */
export const blendChannel = (mode: BlendMode, backdrop: number, source: number): number => {
  switch (mode) {
    case "multiply":
      return backdrop * source;
    case "screen":
      return backdrop + source - backdrop * source;
    case "overlay":
      return backdrop <= 0.5 ? 2 * backdrop * source : 1 - 2 * (1 - backdrop) * (1 - source);
    case "normal":
    default:
      return source;
  }
};

/**
 * `source` over `backdrop` with `mode`. The source's alpha is the layer's colour alpha times its
 * opacity. Where the backdrop is opaque this is mix(backdrop, B(backdrop, source), source alpha).
 */
export const compositeOver = (backdrop: Paint, source: Paint, mode: BlendMode): Paint => {
  const as = source.alpha;
  const ab = backdrop.alpha;
  const alpha = as + ab * (1 - as);
  if (alpha <= 0) return { rgb: [0, 0, 0], alpha: 0 };
  const rgb = [0, 1, 2].map((c) => {
    const cs = source.rgb[c];
    const cb = backdrop.rgb[c];
    const mixed = (1 - ab) * cs + ab * blendChannel(mode, cb, cs);
    return (as * mixed + ab * (1 - as) * cb) / alpha;
  }) as RGB;
  return { rgb, alpha };
};

/** A "#rrggbb" colour as sRGB 0-1, as it was picked. */
export const hexToRgb = (hex: string): RGB => {
  const value = Number.parseInt(hex.replace("#", "").slice(0, 6), 16);
  if (!Number.isFinite(value)) return [1, 1, 1];
  return [((value >> 16) & 255) / 255, ((value >> 8) & 255) / 255, (value & 255) / 255];
};

const clamp01 = (value: number): number => Math.min(1, Math.max(0, value));

/** The layers that make colour and are on, bottom first (the order they're drawn in). */
export const colorLayersBottomUp = (layers: MaterialLayer[] | undefined): Array<ColorLayer | DepthLayer> =>
  (layers ?? [])
    .filter((layer): layer is ColorLayer | DepthLayer => (layer.type === "color" || layer.type === "depth") && layer.enabled)
    .reverse();

/**
 * What a stack of colour layers adds up to at one point. A Depth layer's colour there is `depthRgb`
 * (its ramp, sRGB); without one given, a Depth layer is skipped. A stack with no colour layer on is
 * white, the colour a material starts from.
 */
export const evaluateStack = (layers: Array<ColorLayer | DepthLayer>, depthRgb?: RGB): Paint => {
  if (layers.length === 0) return WHITE;
  let result = NOTHING;
  for (const layer of layers) {
    const rgb = layer.type === "color" ? hexToRgb(layer.color) : depthRgb;
    if (!rgb) continue;
    result = compositeOver(result, { rgb, alpha: clamp01(layer.opacity) }, layer.blendMode);
  }
  return result.alpha > 0 ? result : WHITE;
};

/**
 * How a stack is drawn: what the colour layers under the Depth layer add up to (one colour), the
 * Depth layer, and the Color layers over it, each blended on in turn. Without a Depth layer
 * everything is in `under` and the object is one colour; `alpha` is then the stack's alpha too.
 */
export interface StackPlan {
  under: Paint;
  depth: DepthLayer | null;
  over: ColorLayer[]; // bottom first
  alpha: number; // the stack's alpha, the same at every point (no layer has a colour alpha of its own yet)
}

export const planStack = (layers: MaterialLayer[] | undefined): StackPlan => {
  const bottomUp = colorLayersBottomUp(layers);
  const depthIndex = bottomUp.findIndex((layer) => layer.type === "depth");
  if (depthIndex < 0) {
    const under = evaluateStack(bottomUp);
    return { under, depth: null, over: [], alpha: under.alpha };
  }
  const below = bottomUp.slice(0, depthIndex);
  const depth = bottomUp[depthIndex] as DepthLayer;
  const over = bottomUp.slice(depthIndex + 1) as ColorLayer[];
  // Whatever colour the ramp has, the alpha comes out the same: every layer's alpha is its opacity.
  const alpha = evaluateStack(bottomUp, [0, 0, 0]).alpha;
  return { under: below.length > 0 ? evaluateStack(below) : NOTHING, depth, over, alpha };
};

/** The planned stack's colour at a point whose Depth ramp colour is `depthRgb` (sRGB). */
export const evaluatePlan = (plan: StackPlan, depthRgb: RGB): Paint => {
  let result = plan.under;
  if (plan.depth) result = compositeOver(result, { rgb: depthRgb, alpha: clamp01(plan.depth.opacity) }, plan.depth.blendMode);
  for (const layer of plan.over) {
    result = compositeOver(result, { rgb: hexToRgb(layer.color), alpha: clamp01(layer.opacity) }, layer.blendMode);
  }
  return result;
};

/**
 * How much shading shows, 0-1: the Lighting layer's opacity, 0 with its eye off. 1 without a
 * Lighting layer (the material's lighting model then applies as it is).
 */
export const lightingStrength = (lighting: LightingLayer | undefined): number =>
  lighting ? (lighting.enabled ? clamp01(lighting.opacity) : 0) : 1;
