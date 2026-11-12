/**
 * PURPOSE: Draws an object's material layer stack (scene/layerStack.ts) where one colour won't do:
 * a Depth layer's ramp with layers blended under and over it, and Lighting's opacity (how much
 * shading shows). Also bakes that blend into the vertex colours for a glTF export.
 *
 * INPUT: An entity material (viewport/entityMaterials.ts) and its object's planned stack.
 * OUTPUT: TSL nodes for the node material three builds the material's shader from.
 *
 * The nodes never go on the material itself: three refreshes every uniform of a material that holds
 * a node on every frame (NodeMaterialObserver), which cost 3 ms a frame for 400 objects. So the
 * material only gets a record here; the canvas-output hook (canvasOutput.ts) asks for the nodes
 * when three builds a shader, and puts them on the stand-in it builds from. Colours and opacities
 * are uniforms, so dragging one changes a number; a change to the stack's shape (a blend mode, an
 * eye, the order) rebuilds the shader once.
 *
 * The blend runs per vertex, in the vertex shader, as the Depth layer's paint did before task D:
 * the ramp is the mesh's vertex colours, and the W3C formulas run on sRGB values. A stack that adds
 * up to one colour needs none of this: entityMaterials.ts sets that colour on the material.
 *
 * No store, React or DOM here: the share-link viewer draws with this too.
 */

import * as THREE from "three";
import type { Material } from "three";
import type { NodeMaterial } from "three/webgpu";
import { diffuseColor, float, materialColor, max, mix, output, sRGBTransferEOTF, sRGBTransferOETF, step, uniform, varying, vec4, vertexColor } from "three/tsl";
import { evaluatePlan, hexToRgb, type RGB, type StackPlan } from "../scene/layerStack";
import type { BlendMode } from "../scene/types";

type Node = ReturnType<typeof float>;
type Vec3Uniform = ReturnType<typeof uniform<THREE.Vector3>>;
type FloatUniform = ReturnType<typeof uniform<number>>;

interface LayerStackRecord {
  // The stack's shape, which the shader is built for: a change rebuilds it.
  shape: string;
  plan: StackPlan;
  under: { color: Vec3Uniform; alpha: FloatUniform };
  depth: { mode: BlendMode; opacity: FloatUniform } | null;
  over: Array<{ mode: BlendMode; color: Vec3Uniform; opacity: FloatUniform }>;
  // Lighting's opacity, while it's under 1; null at 1 (three's own lit result).
  strength: FloatUniform | null;
  // Built once per record, on the first shader build.
  colorNode?: Node;
}

const records = new WeakMap<Material, LayerStackRecord>();

// The key three's render objects take a node material's shader by goes over its own properties
// (getMaterialCacheKey), so the stack's shape is kept on the material as a string, where it changes
// the key: two shapes never share a shader.
const SHAPE_KEY = "libre3dLayerStack";

const shapeOf = (plan: StackPlan, strength: number): string | null => {
  if (!plan.depth && strength >= 1) return null;
  return [plan.depth ? `depth:${plan.depth.blendMode}` : "", ...plan.over.map((layer) => layer.blendMode), strength < 1 ? "lit" : ""].join("|");
};

const setVec3 = (target: Vec3Uniform, rgb: RGB): void => {
  target.value.set(rgb[0], rgb[1], rgb[2]);
};

/**
 * Brings `material`'s stack record up to date with `plan` and the shading strength (Lighting's
 * opacity). Returns true when the shader must be rebuilt (the caller sets `needsUpdate`).
 */
export const syncLayerNodes = (material: Material, plan: StackPlan, strength: number): boolean => {
  const shape = shapeOf(plan, strength);
  const existing = records.get(material);
  const keyed = material as unknown as Record<string, unknown>;

  if (!shape) {
    if (!existing) return false;
    records.delete(material);
    delete keyed[SHAPE_KEY];
    return true;
  }

  let record = existing;
  const rebuilt = !record || record.shape !== shape;
  if (!record || rebuilt) {
    record = {
      shape,
      plan,
      under: { color: uniform(new THREE.Vector3()), alpha: uniform(0) },
      depth: plan.depth ? { mode: plan.depth.blendMode, opacity: uniform(1) } : null,
      over: plan.over.map((layer) => ({ mode: layer.blendMode, color: uniform(new THREE.Vector3()), opacity: uniform(1) })),
      strength: strength < 1 ? uniform(1) : null,
    };
    records.set(material, record);
    keyed[SHAPE_KEY] = shape;
  }

  record.plan = plan;
  setVec3(record.under.color, plan.under.rgb);
  record.under.alpha.value = plan.under.alpha;
  if (record.depth && plan.depth) record.depth.opacity.value = plan.depth.opacity;
  plan.over.forEach((layer, index) => {
    setVec3(record.over[index].color, hexToRgb(layer.color));
    record.over[index].opacity.value = layer.opacity;
  });
  if (record.strength) record.strength.value = strength;
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
      return backdrop.mul(source);
    case "screen":
      return backdrop.add(source).sub(backdrop.mul(source));
    case "overlay": {
      const dark = backdrop.mul(source).mul(2);
      const light = float(1).sub(backdrop.oneMinus().mul(source.oneMinus()).mul(2));
      // step(0.5, b) is 1 from 0.5 up; at exactly 0.5 both formulas give the source.
      return mix(dark, light, step(0.5, backdrop));
    }
    case "normal":
    default:
      return source;
  }
};

// `source` (alpha `as`) over `backdrop` (alpha `ab`) with `mode` (layerStack.ts, compositeOver).
const compositeOver = (backdrop: Node, ab: Node, source: Node, as: Node, mode: BlendMode): { color: Node; alpha: Node } => {
  const mixed = source.mul(ab.oneMinus()).add(blend(mode, backdrop, source).mul(ab));
  const alpha = as.add(ab.mul(as.oneMinus()));
  const color = mixed.mul(as).add(backdrop.mul(ab).mul(as.oneMinus())).div(max(alpha, 1e-6));
  return { color, alpha };
};

// The stack's colour as the material's colour node: per vertex, linear, times the material's own
// colour (white) and map, as three would have multiplied them.
const buildColorNode = (record: LayerStackRecord): Node => {
  let color: Node = record.under.color as unknown as Node;
  let alpha: Node = record.under.alpha as unknown as Node;
  if (record.depth) {
    // The vertex colours hold the ramp in linear values; the blend works on sRGB ones.
    const ramp = sRGBTransferOETF(vertexColor().rgb) as unknown as Node;
    ({ color, alpha } = compositeOver(color, alpha, ramp, record.depth.opacity as unknown as Node, record.depth.mode));
  }
  for (const layer of record.over) {
    ({ color, alpha } = compositeOver(color, alpha, layer.color as unknown as Node, layer.opacity as unknown as Node, layer.mode));
  }
  const linear = varying(sRGBTransferEOTF(color as never)) as unknown as Node;
  // Without a colour node three takes the material's colour times its map (materialColor); with one
  // it doesn't, so that's multiplied in here. The material's colour is white while it has a record,
  // so this is the map, or white.
  return vec4(linear, 1).mul(vec4(materialColor as never)) as unknown as Node;
};

/**
 * Puts `material`'s stack nodes on `built`, the node material three builds its shader from
 * (canvasOutput.ts's hook), and returns what the canvas ending should start from: three's lit
 * colour mixed back toward the unlit one by Lighting's opacity, or null for three's own.
 */
export const applyLayerNodes = (material: Material, built: NodeMaterial): Node | null => {
  const record = records.get(material);
  if (!record) return null;
  if (record.depth) {
    record.colorNode ??= buildColorNode(record);
    built.colorNode = record.colorNode as never;
    // The ramp is read in the colour node; three mustn't multiply it in again.
    built.vertexColors = false;
  }
  if (!record.strength) return null;
  return vec4(mix(diffuseColor.rgb, output.rgb, record.strength), output.a) as unknown as Node;
};

/**
 * For a glTF export, which can't blend layers: each mesh drawn with a Depth stack gets vertex
 * colours with the whole stack baked in (the CPU twin of the shader above) for the length of the
 * export. Its material's colour is already white, so the file shows what the editor does. Returns
 * the undo.
 */
export const bakeLayerStacksForExport = (scene: THREE.Object3D): (() => void) => {
  const restores: Array<() => void> = [];
  const baked = new Set<THREE.BufferGeometry>();
  const linear = new THREE.Color();

  scene.traverse((object) => {
    if (!(object instanceof THREE.Mesh) || Array.isArray(object.material)) return;
    const record = records.get(object.material);
    const geometry = object.geometry as THREE.BufferGeometry;
    const ramp = geometry.getAttribute("color");
    if (!record?.depth || !ramp || baked.has(geometry)) return;
    baked.add(geometry);

    const colors = new THREE.BufferAttribute(new Float32Array(ramp.count * 3), 3);
    for (let i = 0; i < ramp.count; i += 1) {
      linear.setRGB(ramp.getX(i), ramp.getY(i), ramp.getZ(i)).convertLinearToSRGB();
      const paint = evaluatePlan(record.plan, [linear.r, linear.g, linear.b]);
      linear.setRGB(paint.rgb[0], paint.rgb[1], paint.rgb[2], THREE.SRGBColorSpace);
      colors.setXYZ(i, linear.r, linear.g, linear.b);
    }
    geometry.setAttribute("color", colors);
    restores.push(() => geometry.setAttribute("color", ramp));
  });

  return () => restores.forEach((restore) => restore());
};
