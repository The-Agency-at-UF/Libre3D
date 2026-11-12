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
import { createLayerSource, layerSourceShape, type LayerSource, type PictureSource, type SourceColor, type SourceContext } from "./layerSources";
import { collectSlots, objectUniform, setSlotLookup, shaderNode, type Slot } from "./objectValues";

type Node = ReturnType<typeof float>;
type FloatUniform = ReturnType<typeof uniform<number>>;

// A node for the shader: a stack's own value goes in as the shared node reading the drawn object's
// (objectValues.ts).
const n = (node: unknown): Node => shaderNode(node) as Node;

interface StepNodes {
  layerId: string;
  source: LayerSource;
  mask: { layerId: string; source: LayerSource; opacity: FloatUniform } | null;
  opacity: FloatUniform;
  mode: BlendMode;
  // A Glass layer: what's behind the object, which isn't shaded again (buildColorNode).
  glass: boolean;
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
  space: THREE.Object3D | null;
  // The values this stack's shader reads for its object, as the sources and steps made them
  // (objectValues.ts): materials with the same shape share one shader, each with its own values.
  slots: Slot<unknown>[];
  // Built once per record, on the first shader build: the colour under Lighting, and (with a Glass
  // under it) the light its glass adds on top of the shading, linear.
  colorNode?: Node;
  glassLight?: Node | null;
}

const records = new WeakMap<Material, LayerStackRecord>();
setSlotLookup((material) => records.get(material)?.slots);

// The drawn object's path's space (LayerStackRecord.space), turned into its own: read per object,
// as the shader is shared.
const toPathSpace = new THREE.Matrix4();
const pathSpace = uniform(new THREE.Matrix4()).onObjectUpdate(({ material }) => {
  const space = records.get(material as Material)?.space;
  return space ? toPathSpace.copy(space.matrixWorld).invert() : toPathSpace.identity();
});

// three only refreshes an object's uniforms when its matrix or one of the material properties it
// watches changed (NodeMaterialObserver), and a stack's values are none of those. lightMapIntensity
// is one it watches that these materials never use (they have no light map), so a change of values
// nudges it.
const markValuesChanged = (material: Material): void => {
  const watched = material as Material & { lightMapIntensity?: number; lightMap?: unknown };
  if (watched.lightMapIntensity === undefined || watched.lightMap) return;
  watched.lightMapIntensity = watched.lightMapIntensity === 1 ? 1.0000001 : 1;
};

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

const stepNodes = (step: PlanStep, pictures: PictureSource): StepNodes => ({
  layerId: step.layer.id,
  source: createLayerSource(step.layer, pictures),
  mask: step.mask ? { layerId: step.mask.id, source: createLayerSource(step.mask, pictures), opacity: objectUniform(1) } : null,
  opacity: objectUniform(1),
  mode: step.layer.blendMode,
  glass: step.layer.type === "glass",
});

// True when a picture changed (an Image layer's): its shader's bindings must be remade.
const updateStep = (nodes: StepNodes, step: PlanStep, pictures: PictureSource): boolean => {
  let pictureChanged = nodes.source.update(step.layer, pictures) === true;
  nodes.opacity.value = Math.min(1, Math.max(0, step.layer.opacity));
  if (nodes.mask && step.mask) {
    pictureChanged = nodes.mask.source.update(step.mask, pictures) === true || pictureChanged;
    nodes.mask.opacity.value = Math.min(1, Math.max(0, step.mask.opacity));
  }
  return pictureChanged;
};

const NO_PICTURES: PictureSource = () => null;

/**
 * Brings `material`'s stack record up to date with `plan`. `space` is the object whose own space
 * Depth and Noise use when it isn't the mesh drawn (a path, for its end caps); `pictures` gives
 * Image layers their textures. Returns true when the shader must be rebuilt, or a picture changed
 * (the caller sets `needsUpdate`).
 */
export const syncLayerNodes = (
  material: Material,
  plan: StackPlan,
  space: THREE.Object3D | null = null,
  pictures: PictureSource = NO_PICTURES,
): boolean => {
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
  const rebuilt = !record || record.shape !== shape || record.space !== space;
  if (!record || rebuilt) {
    const slots: Slot<unknown>[] = [];
    record = collectSlots(slots, () => ({
      shape,
      under: plan.folded ? null : plan.under.map((step) => stepNodes(step, pictures)),
      over: plan.over.map((step) => stepNodes(step, pictures)),
      strength: plan.strength < 1 ? objectUniform(1) : null,
      space,
      slots,
    }));
    records.set(material, record);
    keyed[SHAPE_KEY] = shape;
  }

  let pictureChanged = false;
  if (record.under) plan.under.forEach((step, index) => (pictureChanged = updateStep(record.under![index], step, pictures) || pictureChanged));
  plan.over.forEach((step, index) => (pictureChanged = updateStep(record.over[index], step, pictures) || pictureChanged));
  if (record.strength) record.strength.value = plan.strength;
  markValuesChanged(material);
  return rebuilt || pictureChanged;
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

// Each step's colour and its mask's, worked out once for both blends buildColorNode makes.
interface StepColors {
  step: StepNodes;
  source: SourceColor;
  mask: SourceColor | null;
}

const colorsOf = (steps: StepNodes[], context: SourceContext): StepColors[] =>
  steps.map((step) => ({ step, source: step.source.node(context), mask: step.mask ? step.mask.source.node(context) : null }));

// The steps blended over `base`, bottom first (layerStack.ts, evaluateSteps). `glassDark`: Glass
// layers paint black (with their alpha), for the part of the colour that gets shaded.
const blendSteps = (colors: StepColors[], base: Paint, glassDark = false): Paint => {
  let result = base;
  for (const { step, source, mask } of colors) {
    let alpha = n(source.a.mul(n(step.opacity)));
    if (step.mask && mask) {
      const shown = maskValue(mask);
      alpha = n(alpha.mul(float(1).sub(n(step.mask.opacity).mul(shown.oneMinus()))));
    }
    result = compositeOver(result, glassDark && step.glass ? n(vec3(0, 0, 0)) : source.rgb, alpha, step.mode);
  }
  return result;
};

const contextOf = (record: LayerStackRecord): SourceContext => ({
  objectPosition: record.space ? n(n(pathSpace).mul(vec4(positionWorld, 1)).xyz) : n(positionLocal),
});

// The layers under Lighting as the material's colour node: linear, times the material's own colour
// (white while it has one of these) and map, as three would have multiplied them. Where nothing
// paints, the object is see-through (the stack's alpha). A Glass among them paints what's behind
// the object, which was shaded already: so the colour is shaded with the glass painting black, and
// the difference the glass makes is added after the shading (`glassLight`), which keeps the glass's
// highlights and leaves what's behind it as it was.
const buildColorNode = (record: LayerStackRecord, steps: StepNodes[]): { color: Node; glassLight: Node | null } => {
  const nothing: Paint = { rgb: n(vec3(0, 0, 0)), a: float(0) };
  const white: Paint = { rgb: n(vec3(1, 1, 1)), a: float(1) };
  const colors = colorsOf(steps, contextOf(record));
  const hasGlass = steps.some((step) => step.glass);
  const shaded = steps.length > 0 ? blendSteps(colors, nothing, hasGlass) : white;
  // Without a colour node three takes the material's colour times its map (materialColor); with one
  // it doesn't, so that's multiplied in here.
  const color = n(vec4(sRGBTransferEOTF(n(shaded.rgb.clamp(0, 1))), shaded.a).mul(vec4(materialColor as never)));
  if (!hasGlass) return { color, glassLight: null };
  // Glass colours run past 1 (a bright backdrop, before tone mapping), so these aren't clamped.
  const withGlass = blendSteps(colors, nothing);
  const glassLight = n(sRGBTransferEOTF(n(max(withGlass.rgb, vec3(0, 0, 0)))).sub(sRGBTransferEOTF(n(max(shaded.rgb, vec3(0, 0, 0))))));
  return { color, glassLight };
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
    if (!record.colorNode) {
      const { color, glassLight } = buildColorNode(record, record.under);
      record.colorNode = color;
      record.glassLight = glassLight;
    }
    built.colorNode = record.colorNode as never;
  }
  if (!record.strength && record.over.length === 0 && !record.glassLight) return null;

  let lit: Paint = { rgb: n(output.rgb), a: n(output.a) };
  if (record.strength) lit = { rgb: n(mix(diffuseColor.rgb, output.rgb, n(record.strength))), a: lit.a };
  if (record.glassLight) lit = { rgb: n(lit.rgb.add(record.glassLight)), a: lit.a };
  if (record.over.length > 0) {
    // On sRGB values, as the colours are picked; a lit colour can be over 1, which tone mapping brings back.
    const shaded: Paint = { rgb: n(sRGBTransferOETF(n(max(lit.rgb, vec3(0, 0, 0))))), a: lit.a };
    const painted = blendSteps(colorsOf(record.over, contextOf(record)), shaded);
    lit = { rgb: n(sRGBTransferEOTF(painted.rgb)), a: painted.a };
  }
  return n(vec4(lit.rgb, lit.a));
};
