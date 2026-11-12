/**
 * PURPOSE: The rules of an object's material layer stack (task D2): which layers paint, which can be
 * removed, switched to another type or moved, which layer a mask masks, how one layer blends over
 * the layers under it, and the plan the viewport draws a stack by.
 *
 * INPUT: An entity's `materialLayers`, top first (`layers[0]` is the top of the stack, as the panel
 * lists it). OUTPUT: Plain answers and plain sRGB numbers.
 *
 * The stack is drawn bottom to top. Each layer goes over what is under it with its blend mode and
 * its opacity, by the W3C compositing formulas (Compositing and Blending Level 1), on sRGB values as
 * the colours are picked. Lighting shades what's under it; what's over it is drawn on the shaded
 * result as it is (as in Spline). A layer in Mask mode paints nothing: its lightness shows the one
 * layer right under it (Spline's Layer Masking).
 *
 * The viewport draws the plan in TSL (viewport/layerNodes.ts, viewport/layerSources.ts); the CPU
 * twins here (the ramp, Depth's and Gradient's positions, Fresnel's amount) are what Vitest checks
 * the maths with. No store, React or Three.js, so everything can use it.
 */

import type {
  BlendMode,
  ColorLayer,
  DepthLayer,
  FresnelLayer,
  GradientLayer,
  ImageLayer,
  LightingLayer,
  MaterialLayer,
  MaterialLayerType,
  NoiseLayer,
  NormalLayer,
  PaintColor,
  RampStop,
} from "./types";

export type RGB = [number, number, number];

/** A colour (sRGB, 0-1) and how much of it there is (0-1, not premultiplied). */
export interface Paint {
  rgb: RGB;
  alpha: number;
}

/** A layer that makes colour: it paints, or in Mask mode masks the layer under it. */
export type PaintLayer = ColorLayer | DepthLayer | GradientLayer | NoiseLayer | FresnelLayer | ImageLayer | NormalLayer;
/** A layer that can be put in Mask mode. */
export type MaskableLayer = DepthLayer | GradientLayer | NoiseLayer | FresnelLayer | ImageLayer;

export const BLEND_MODES: BlendMode[] = ["normal", "multiply", "screen", "overlay"];

/** Layer types that make colour. An object keeps one that paints (so Color can go once another is there). */
export const COLOR_LAYER_TYPES: readonly MaterialLayerType[] = ["color", "image", "depth", "gradient", "noise", "fresnel", "normal"];

/** Layer types a layer's type dropdown can switch it to. "+" adds a Color layer. */
export const SWITCHABLE_LAYER_TYPES: readonly MaterialLayerType[] = COLOR_LAYER_TYPES;

/** Layer types with a Mask mode (Spline's list, of the types Libre3D has). */
export const MASKABLE_LAYER_TYPES: readonly MaterialLayerType[] = ["image", "depth", "gradient", "noise", "fresnel"];

/** A ramp holds 2 to this many stops. */
export const MAX_RAMP_STOPS = 10;

export const isColorLayerType = (type: MaterialLayerType): boolean => COLOR_LAYER_TYPES.includes(type);

export const isPaintLayer = (layer: MaterialLayer): layer is PaintLayer => isColorLayerType(layer.type);

/** A layer in Mask mode (only the maskable types can be). */
export const isMaskLayer = (layer: MaterialLayer): layer is MaskableLayer => MASKABLE_LAYER_TYPES.includes(layer.type) && layer.mask === true;

/** A layer that paints: a colour layer not in Mask mode. */
const paints = (layer: MaterialLayer): layer is PaintLayer => isPaintLayer(layer) && !isMaskLayer(layer);

/** What the shading of a stack with nothing painting starts from: white, as a material does. */
const WHITE: Paint = { rgb: [1, 1, 1], alpha: 1 };
const NOTHING: Paint = { rgb: [0, 0, 0], alpha: 0 };

/**
 * The index of the layer a mask at `index` masks: the one right under it, when that one paints.
 * Null when it masks nothing (it isn't a mask, or under it is Lighting, another mask, or nothing).
 * Eyes don't count here: the row shows the pairing either way.
 */
export const maskTarget = (layers: MaterialLayer[], index: number): number | null => {
  const layer = layers[index];
  const under = layers[index + 1];
  if (!layer || !isMaskLayer(layer) || !under || !paints(under)) return null;
  return index + 1;
};

/**
 * Whether `layer` can be removed from `layers`: never Lighting; a layer that paints only while
 * another one that paints stays. A mask can always go.
 */
export const canRemoveLayer = (layers: MaterialLayer[], layer: MaterialLayer): boolean => {
  if (layer.type === "lighting") return false;
  if (!paints(layer)) return true;
  return layers.some((each) => each.id !== layer.id && paints(each));
};

/** Why `layer` can't be removed, for the × button's tooltip; null when it can. */
export const removeBlockedReason = (layers: MaterialLayer[], layer: MaterialLayer): string | null => {
  if (canRemoveLayer(layers, layer)) return null;
  if (layer.type === "lighting") return "Lighting can't be removed";
  return "Add another colour layer first";
};

/** Whether `layer` can become a layer of type `to`: colour layers switch among the colour types. */
export const canSwitchLayerType = (_layers: MaterialLayer[], layer: MaterialLayer, to: MaterialLayerType): boolean => {
  if (layer.type === to) return true;
  return SWITCHABLE_LAYER_TYPES.includes(layer.type) && SWITCHABLE_LAYER_TYPES.includes(to);
};

/** Where a dragged layer may go: anywhere in the stack (Lighting moves too). Returns the index range (inclusive). */
export const movableRange = (layers: MaterialLayer[]): [number, number] => [0, layers.length - 1];

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

// ─── Blending ────────────────────────────────────────────────────────────────

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
 * opacity (and its mask). Where the backdrop is opaque this is mix(backdrop, B(backdrop, source), source alpha).
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

/** sRGB 0-1 as "#rrggbb". */
export const rgbToHex = (rgb: RGB): string =>
  `#${rgb.map((c) => Math.round(clamp01(c) * 255).toString(16).padStart(2, "0")).join("")}`;

export const clamp01 = (value: number): number => Math.min(1, Math.max(0, value));

/** A colour with its alpha as a Paint. */
export const paintOf = (color: PaintColor): Paint => ({ rgb: hexToRgb(color.color), alpha: clamp01(color.alpha ?? 1) });

/** How light a mask is at a point (Rec. 709 weights on the sRGB values) times its alpha: 1 shows the masked layer, 0 hides it. */
export const maskValue = (paint: Paint): number =>
  clamp01((0.2126 * paint.rgb[0] + 0.7152 * paint.rgb[1] + 0.0722 * paint.rgb[2]) * paint.alpha);

// ─── Ramps and positions (the CPU twins of viewport/layerSources.ts) ─────────

/** The stops in order along the ramp, at most MAX_RAMP_STOPS. */
export const sortedStops = (stops: RampStop[]): RampStop[] =>
  [...stops].sort((a, b) => a.position - b.position).slice(0, MAX_RAMP_STOPS);

/**
 * A ramp's colour at `t`, as Spline's: from the first stop, each next stop blended in over its own
 * span (clamped, eased when `smooth`), so a `t` before the first stop or past the last takes that
 * stop's colour. In sRGB, as the stops are picked; alpha blends the same way.
 */
export const sampleRamp = (stops: RampStop[], smooth: boolean, t: number): Paint => {
  const ordered = sortedStops(stops);
  if (ordered.length === 0) return WHITE;
  const first = paintOf(ordered[0]);
  const rgb: RGB = [...first.rgb];
  let alpha = first.alpha;
  for (let i = 1; i < ordered.length; i++) {
    const from = ordered[i - 1].position;
    const span = ordered[i].position - from;
    let amount = span !== 0 ? clamp01((t - from) / span) : t >= from ? 1 : 0;
    if (smooth) amount = amount * amount * (3 - 2 * amount);
    const next = paintOf(ordered[i]);
    for (let c = 0; c < 3; c++) rgb[c] += (next.rgb[c] - rgb[c]) * amount;
    alpha += (next.alpha - alpha) * amount;
  }
  return { rgb, alpha };
};

/** A new stop for a ramp at `t`: the colour the ramp has there. */
export const rampStopAt = (stops: RampStop[], smooth: boolean, t: number): RampStop => {
  const paint = sampleRamp(stops, smooth, t);
  return { color: rgbToHex(paint.rgb), alpha: Math.round(paint.alpha * 100) / 100, position: t };
};

/** The ramp turned around: each stop at 1 - its position. */
export const reverseStops = (stops: RampStop[]): RampStop[] => stops.map((stop) => ({ ...stop, position: 1 - stop.position }));

/** Where a distance falls between `near` (0) and `far` (1). */
export const nearFarPosition = (distance: number, near: number, far: number): number => {
  const span = far - near;
  if (span <= 0) return distance >= near ? 1 : 0;
  return clamp01((distance - near) / span);
};

/**
 * Where a point falls on a Depth layer's ramp, 0-1, for a "vector" origin: the point is in the
 * layer's space (the object's own, or the scene's with `space: "world"`).
 */
export const depthRampPosition = (layer: DepthLayer, x: number, y: number, z: number): number => {
  const [ox, oy, oz] = layer.origin;
  const dx = x - ox;
  const dy = y - oy;
  const dz = z - oz;
  let distance: number;
  if (layer.gradientType === "linear") {
    const [ax, ay, az] = layer.direction;
    const length = Math.hypot(ax, ay, az) || 1;
    distance = (dx * ax + dy * ay + dz * az) / length;
  } else {
    distance = Math.hypot(dx, dy, dz);
  }
  return nearFarPosition(distance, layer.near, layer.far);
};

/**
 * Where a UV point falls on a Gradient layer's ramp (before the ramp clamps it). Spline's own maths,
 * from its player (@splinetool/runtime 2.0.113), with the angle in radians there and in degrees
 * here. Linear runs along u at angle 0; Radial is the distance from the middle, 1 at the edges'
 * middles (the angle shifts it); Polar goes once around the middle (the angle turns it).
 */
export const gradientPosition = (layer: GradientLayer, u: number, v: number): number => {
  const angle = (layer.angle * Math.PI) / 180;
  const [ox, oy] = layer.offset;
  const [mx, my] = layer.morph;
  if (layer.gradientType === "radial") {
    return Math.hypot(3 * (u + mx) - (u + ox) - 1, 3 * (v + my) - (v + oy) - 1) + angle;
  }
  if (layer.gradientType === "polar") {
    const turn = -Math.atan2(u + mx - 0.5 + ox, v + my - 0.5 + oy);
    const position = angle / Math.PI / -2 + (0.5 * turn) / Math.PI;
    return position - Math.floor(position);
  }
  const e = 0.5 + mx / (u !== 0 ? u : 1e-6);
  const l = my / (v !== 0 ? v : 1e-6);
  const dx = Math.cos(angle) * e - Math.sin(angle) * l;
  const dy = Math.sin(angle) * e + Math.cos(angle) * l;
  const length = dx * dx + dy * dy;
  return length > 1e-12 ? (((u - 0.5 + ox) / 2 + dx / 2) * dx + ((v - 0.5 + oy) / 2 + dy / 2) * dy) / length : 0;
};

/** How much of a Fresnel layer's colour shows where the surface's normal and the view meet at `nDotV` (cosine). */
export const fresnelAmount = (layer: FresnelLayer, nDotV: number): number =>
  clamp01(clamp01(layer.bias + layer.scale * Math.pow(1 - Math.min(1, Math.abs(nDotV)), layer.intensity)) * layer.factor);

/** Whether a layer's own colour is opaque everywhere (its alpha never under 1). */
export const sourceIsOpaque = (layer: PaintLayer): boolean => {
  switch (layer.type) {
    case "color":
      return true;
    case "depth":
    case "gradient":
      return layer.stops.every((stop) => (stop.alpha ?? 1) >= 1);
    case "noise":
      return layer.colors.every((color) => (color.alpha ?? 1) >= 1);
    case "fresnel":
      return false;
    case "normal":
      return true;
    case "image":
      // A picture's own see-through parts make the object see-through only with the surface's
      // alpha mode Blend or Mask, as a glTF colour map's do; they still blend over the layers under it.
      return layer.textureAssetId !== "";
  }
};

// ─── The plan ────────────────────────────────────────────────────────────────

/** A layer that paints, with the mask over it (on, and masking it), if any. */
export interface PlanStep {
  layer: PaintLayer;
  mask: MaskableLayer | null;
}

/**
 * How a stack is drawn: the layers that paint under Lighting (bottom first; they're the material's
 * colour, and get shaded) and over it (bottom first; drawn on the shaded result), each with its
 * mask. Only layers whose eyes are on.
 */
export interface StackPlan {
  under: PlanStep[];
  over: PlanStep[];
  // `under` as one colour when it is Color layers alone, with no mask (a plain material colour, no
  // nodes); null when it needs drawing per pixel. With nothing under, white.
  folded: Paint | null;
  // Whether `under` covers every point fully: some step's alpha is 1 everywhere.
  opaque: boolean;
  // How much shading shows (Lighting's opacity, 0 with its eye off; 1 without Lighting).
  strength: number;
}

/**
 * How much shading shows, 0-1: the Lighting layer's opacity, 0 with its eye off. 1 without a
 * Lighting layer (the material's lighting model then applies as it is).
 */
export const lightingStrength = (lighting: LightingLayer | undefined): number =>
  lighting ? (lighting.enabled ? clamp01(lighting.opacity) : 0) : 1;

// The steps of `layers` (a slice of the stack, top first), bottom first.
const stepsOf = (layers: MaterialLayer[]): PlanStep[] => {
  const steps: PlanStep[] = [];
  for (let index = layers.length - 1; index >= 0; index--) {
    const layer = layers[index];
    if (!paints(layer) || !layer.enabled) continue;
    const above = layers[index - 1];
    const mask = above && isMaskLayer(above) && above.enabled ? above : null;
    steps.push({ layer, mask });
  }
  return steps;
};

export const planStack = (layers: MaterialLayer[] | undefined): StackPlan => {
  const all = layers ?? [];
  const lightingIndex = all.findIndex((layer) => layer.type === "lighting");
  const under = stepsOf(lightingIndex < 0 ? all : all.slice(lightingIndex + 1));
  const over = lightingIndex < 0 ? [] : stepsOf(all.slice(0, lightingIndex));
  const strength = lightingStrength(lightingIndex < 0 ? undefined : (all[lightingIndex] as LightingLayer));

  let folded: Paint | null = null;
  if (under.every((step) => step.layer.type === "color" && !step.mask)) {
    let paint = NOTHING;
    for (const step of under) {
      const color = step.layer as ColorLayer;
      paint = compositeOver(paint, { rgb: hexToRgb(color.color), alpha: clamp01(color.opacity) }, color.blendMode);
    }
    folded = under.length === 0 || paint.alpha <= 0 ? WHITE : paint;
  }
  const opaque = folded
    ? folded.alpha >= 1
    : under.some((step) => !step.mask && step.layer.opacity >= 1 && sourceIsOpaque(step.layer));
  return { under, over, folded, opaque, strength };
};

/** Whether the plan can be drawn as the material's own colour: no nodes at all. */
export const isPlainPlan = (plan: StackPlan): boolean => plan.folded !== null && plan.over.length === 0 && plan.strength >= 1;

/**
 * What the steps add up to at one point, over `base` (NOTHING under Lighting; the shaded colour
 * over it), given each layer's colour there (`sample`). The CPU twin of the shader's blend.
 */
export const evaluateSteps = (steps: PlanStep[], sample: (layer: PaintLayer) => Paint, base: Paint = NOTHING): Paint => {
  let result = base;
  for (const step of steps) {
    const source = sample(step.layer);
    let alpha = source.alpha * clamp01(step.layer.opacity);
    if (step.mask) alpha *= 1 - clamp01(step.mask.opacity) * (1 - maskValue(sample(step.mask)));
    result = compositeOver(result, { rgb: source.rgb, alpha }, step.layer.blendMode);
  }
  return result;
};
