/**
 * PURPOSE: Draws an object's material layer stack (scene/layerStack.ts) where the material's own
 * colour won't do: layers that paint per pixel (Depth, Gradient, Noise, Fresnel), masks, layers over
 * Lighting, and Lighting's opacity (how much shading shows).
 *
 * INPUT: An entity material (viewport/entityMaterials.ts) and its object's planned stack.
 * OUTPUT: TSL nodes for the node material three builds the material's shader from.
 *
 * The nodes never go on the material itself: three refreshes every uniform of a material that holds
 * a node on every frame (NodeMaterialObserver), which cost 3 ms a frame for 400 objects. So the
 * material only gets a record here; the canvas-output hook (canvasOutput.ts) asks for the nodes when
 * three builds a shader, and puts them on the stand-in it builds from. Colours, opacities and every
 * setting are uniforms, so dragging one changes a number; a change to the stack's shape (a type, a
 * blend mode, an eye, a mask, the order, a ramp's stop count) rebuilds the shader once.
 *
 * Each layer's colour is worked out per pixel (layerSources.ts) and blended over the layers under
 * it with the W3C formulas on sRGB values, as picked. The layers under Lighting are the material's
 * colour node and get shaded; the layers over it go on the shaded colour before the canvas ending
 * tone-maps it, as an unlit object's colour does. A stack that is only Color layers under Lighting
 * needs none of this: entityMaterials.ts sets that colour on the material.
 *
 * No store, React or DOM here: the share-link viewer draws with this too.
 */

import * as THREE from "three";
import type { Material } from "three";
import type { NodeMaterial } from "three/webgpu";
import { diffuseColor, dot, float, materialColor, max, mix, output, positionLocal, positionWorld, sRGBTransferEOTF, sRGBTransferOETF, step, uniform, vec3, vec4 } from "three/tsl";
import { isPlainPlan, type PlanStep, type StackPlan } from "../scene/layerStack";
import type { BlendMode } from "../scene/types";
import { createLayerSource, layerSourceShape, type LayerSource, type SourceContext } from "./layerSources";

type Node = ReturnType<typeof float>;
type FloatUniform = ReturnType<typeof uniform<number>>;

const n = (node: unknown): Node => node as Node;

interface StepNodes {
  layerId: string;
  source: LayerSource;
  mask: { layerId: string; source: LayerSource; opacity: FloatUniform } | null;
  opacity: FloatUniform;
  mode: BlendMode;
}

interface LayerStackRecord {
  // The stack's shape, which the shader is built for: a change rebuilds it.
  shape: string;
  // Null when the layers under Lighting are the material's own colour (Color layers alone).
  under: StepNodes[] | null;
  over: StepNodes[];
  // Lighting's opacity, while it's under 1; null at 1 (three's own lit result).
  strength: FloatUniform | null;
  // The object whose own space Depth and Noise work in, when it isn't the mesh's: a path, whose end
  // caps are meshes of their own inside it.
  space: { object: THREE.Object3D; inverse: ReturnType<typeof uniform<THREE.Matrix4>> } | null;
  // Built once per record, on the first shader build.
  colorNode?: Node;
}

const records = new WeakMap<Material, LayerStackRecord>();

// The key three's render objects take a node material's shader by goes over its own properties
// (getMaterialCacheKey), so the stack's shape is kept on the material as a string, where it changes
// the key: two shapes never share a shader.
const SHAPE_KEY = "libre3dLayerStack";

const stepShape = (step: PlanStep): string =>
  `${layerSourceShape(step.layer)}/${step.layer.blendMode}${step.mask ? `/mask:${layerSourceShape(step.mask)}` : ""}`;

const shapeOf = (plan: StackPlan, space: THREE.Object3D | null): string | null => {
  if (isPlainPlan(plan)) return null;
  return [
    plan.folded ? "under:plain" : `under:${plan.under.map(stepShape).join(",")}`,
    `over:${plan.over.map(stepShape).join(",")}`,
    plan.strength < 1 ? "lit" : "",
    space ? "space" : "",
  ].join("|");
};

const stepNodes = (step: PlanStep): StepNodes => ({
  layerId: step.layer.id,
  source: createLayerSource(step.layer),
  mask: step.mask ? { layerId: step.mask.id, source: createLayerSource(step.mask), opacity: uniform(1) } : null,
  opacity: uniform(1),
  mode: step.layer.blendMode,
});

const updateStep = (nodes: StepNodes, step: PlanStep): void => {
  nodes.source.update(step.layer);
  nodes.opacity.value = Math.min(1, Math.max(0, step.layer.opacity));
  if (nodes.mask && step.mask) {
    nodes.mask.source.update(step.mask);
    nodes.mask.opacity.value = Math.min(1, Math.max(0, step.mask.opacity));
  }
};

/**
 * Brings `material`'s stack record up to date with `plan`. `space` is the object whose own space
 * Depth and Noise use when it isn't the mesh drawn (a path, for its end caps). Returns true when the
 * shader must be rebuilt (the caller sets `needsUpdate`).
 */
export const syncLayerNodes = (material: Material, plan: StackPlan, space: THREE.Object3D | null = null): boolean => {
  const shape = shapeOf(plan, space);
  const existing = records.get(material);
  const keyed = material as unknown as Record<string, unknown>;

  if (!shape) {
    if (!existing) return false;
    records.delete(material);
    delete keyed[SHAPE_KEY];
    return true;
  }

  let record = existing;
  const rebuilt = !record || record.shape !== shape || record.space?.object !== (space ?? undefined);
  if (!record || rebuilt) {
    const inverse = new THREE.Matrix4();
    record = {
      shape,
      under: plan.folded ? null : plan.under.map(stepNodes),
      over: plan.over.map(stepNodes),
      strength: plan.strength < 1 ? uniform(1) : null,
      space: space ? { object: space, inverse: uniform(inverse).onRenderUpdate(() => inverse.copy(space.matrixWorld).invert()) } : null,
    };
    records.set(material, record);
    keyed[SHAPE_KEY] = shape;
  }

  if (record.under) plan.under.forEach((step, index) => updateStep(record.under![index], step));
  plan.over.forEach((step, index) => updateStep(record.over[index], step));
  if (record.strength) record.strength.value = plan.strength;
  return rebuilt;
};

/** Forgets a material's record (it's being thrown away). */
export const dropLayerNodes = (material: Material): void => {
  records.delete(material);
};

// B(backdrop, source) per channel (layerStack.ts, blendChannel), on sRGB values.
const blend = (mode: BlendMode, backdrop: Node, source: Node): Node => {
  switch (mode) {
    case "multiply":
      return n(backdrop.mul(source));
    case "screen":
      return n(backdrop.add(source).sub(backdrop.mul(source)));
    case "overlay": {
      const dark = backdrop.mul(source).mul(2);
      const light = float(1).sub(backdrop.oneMinus().mul(source.oneMinus()).mul(2));
      // step(0.5, b) is 1 from 0.5 up; at exactly 0.5 both formulas give the source.
      return n(mix(dark, light, step(0.5, backdrop)));
    }
    case "normal":
    default:
      return source;
  }
};

interface Paint {
  rgb: Node;
  a: Node;
}

// `source` (alpha `as`) over `backdrop` with `mode` (layerStack.ts, compositeOver).
const compositeOver = (backdrop: Paint, source: Node, as: Node, mode: BlendMode): Paint => {
  const ab = backdrop.a;
  const mixed = source.mul(ab.oneMinus()).add(blend(mode, backdrop.rgb, source).mul(ab));
  const a = n(as.add(ab.mul(as.oneMinus())));
  const rgb = n(mixed.mul(as).add(backdrop.rgb.mul(ab).mul(as.oneMinus())).div(max(a, 1e-6)));
  return { rgb, a };
};

// How light a mask is (layerStack.ts, maskValue): Rec. 709 weights on sRGB, times its alpha.
const maskValue = (paint: { rgb: Node; a: Node }): Node => n(dot(paint.rgb, vec3(0.2126, 0.7152, 0.0722)).mul(paint.a).clamp(0, 1));

// The steps blended over `base`, bottom first (layerStack.ts, evaluateSteps).
const blendSteps = (steps: StepNodes[], base: Paint, context: SourceContext): Paint => {
  let result = base;
  for (const step of steps) {
    const source = step.source.node(context);
    let alpha = n(source.a.mul(n(step.opacity)));
    if (step.mask) {
      const shown = maskValue(step.mask.source.node(context));
      alpha = n(alpha.mul(float(1).sub(n(step.mask.opacity).mul(shown.oneMinus()))));
    }
    result = compositeOver(result, source.rgb, alpha, step.mode);
  }
  return result;
};

const contextOf = (record: LayerStackRecord): SourceContext => ({
  objectPosition: record.space ? n(n(record.space.inverse).mul(vec4(positionWorld, 1)).xyz) : n(positionLocal),
});

// The layers under Lighting as the material's colour node: linear, times the material's own colour
// (white while it has one of these) and map, as three would have multiplied them. Where nothing
// paints, the object is see-through (the stack's alpha).
const buildColorNode = (record: LayerStackRecord, steps: StepNodes[]): Node => {
  const nothing: Paint = { rgb: n(vec3(0, 0, 0)), a: float(0) };
  const white: Paint = { rgb: n(vec3(1, 1, 1)), a: float(1) };
  const painted = steps.length > 0 ? blendSteps(steps, nothing, contextOf(record)) : white;
  // Without a colour node three takes the material's colour times its map (materialColor); with one
  // it doesn't, so that's multiplied in here.
  return n(vec4(sRGBTransferEOTF(n(painted.rgb.clamp(0, 1))), painted.a).mul(vec4(materialColor as never)));
};

/**
 * Puts `material`'s stack nodes on `built`, the node material three builds its shader from
 * (canvasOutput.ts's hook), and returns what the canvas ending should start from: three's lit
 * colour mixed back toward the unlit one by Lighting's opacity, with the layers over Lighting on it;
 * or null for three's own.
 */
export const applyLayerNodes = (material: Material, built: NodeMaterial): Node | null => {
  const record = records.get(material);
  if (!record) return null;
  if (record.under) {
    record.colorNode ??= buildColorNode(record, record.under);
    built.colorNode = record.colorNode as never;
  }
  if (!record.strength && record.over.length === 0) return null;

  let lit: Paint = { rgb: n(output.rgb), a: n(output.a) };
  if (record.strength) lit = { rgb: n(mix(diffuseColor.rgb, output.rgb, record.strength)), a: lit.a };
  if (record.over.length > 0) {
    // On sRGB values, as the colours are picked; a lit colour can be over 1, which tone mapping brings back.
    const shaded: Paint = { rgb: n(sRGBTransferOETF(n(max(lit.rgb, vec3(0, 0, 0))))), a: lit.a };
    const painted = blendSteps(record.over, shaded, contextOf(record));
    lit = { rgb: n(sRGBTransferEOTF(painted.rgb)), a: painted.a };
  }
  return n(vec4(lit.rgb, lit.a));
};
