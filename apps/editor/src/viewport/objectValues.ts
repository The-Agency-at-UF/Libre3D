/**
 * PURPOSE: Values a layer stack's shader reads per object (layerSources.ts, layerNodes.ts).
 *
 * three builds one shader for every material with the same cache key, and our stacks' key is their
 * shape (layerNodes.ts), so objects whose stacks have the same shape share one shader and its
 * nodes. A plain `uniform` in it would draw every one of those objects with the first one's values
 * (its colours, its Near and Far, its picture). So each stack keeps its own values in slots, and
 * the shader's uniforms read, for each object they draw, the slots of that object's material.
 *
 * `objectUniform(value)` gives a stack its own uniform to set `.value` on, as a plain uniform; put
 * it in a shader through `shaderNode(it)`, which is the shared uniform reading the drawn object's
 * slot. `objectTexture(slot, uv)` does the same for a picture. Slots are numbered in the order a
 * stack makes them, which is the same for every stack of one shape.
 *
 * three only refreshes an object's uniforms when it sees the object or its material change
 * (NodeMaterialObserver), so layerNodes.ts marks a material changed when its values do.
 */

import type { Material } from "three";
import * as THREE from "three";
import { texture, uniform } from "three/tsl";

type UniformNode = ReturnType<typeof uniform>;

/** A value a stack holds for its shader. */
export interface Slot<T> {
  value: T;
}

let collecting: Slot<unknown>[] | null = null;
let slotsOf: (material: Material) => Slot<unknown>[] | undefined = () => undefined;

/** Tells this module where a material's slots are (layerNodes.ts's records). */
export const setSlotLookup = (lookup: (material: Material) => Slot<unknown>[] | undefined): void => {
  slotsOf = lookup;
};

/** Runs `make` (which builds a stack's sources), collecting the slots they make into `slots`. */
export const collectSlots = <T>(slots: Slot<unknown>[], make: () => T): T => {
  const outer = collecting;
  collecting = slots;
  try {
    return make();
  } finally {
    collecting = outer;
  }
};

const register = <T>(slot: Slot<T>): number => {
  if (!collecting) throw new Error("A layer value was made outside a stack (collectSlots).");
  collecting.push(slot as Slot<unknown>);
  return collecting.length - 1;
};

const SHADER_NODE = Symbol("shaderNode");

/**
 * A uniform this stack sets (`.value`), as `uniform(value)` gives; its shader node (`shaderNode`)
 * reads the drawn object's own.
 */
export const objectUniform = <T>(value: T): ReturnType<typeof uniform<T>> => {
  const own = uniform(value);
  const index = register(own as unknown as Slot<T>);
  const shared = uniform(value).onObjectUpdate(({ material }) => (slotsOf(material as Material)?.[index] as Slot<T> | undefined)?.value);
  (own as unknown as Record<symbol, UniformNode>)[SHADER_NODE] = shared as unknown as UniformNode;
  return own;
};

/** What goes in the shader for `node`: an objectUniform's shared node, anything else as it is. */
export const shaderNode = <N>(node: N): N => ((node as unknown as Record<symbol, N>)?.[SHADER_NODE] ?? node);

/** A slot holding a picture (an Image or Matcap layer's). */
export const objectSlot = <T>(value: T): Slot<T> & { index: number } => {
  const slot = { value, index: -1 };
  slot.index = register(slot);
  return slot;
};

/** The picture in `slot`, sampled at `at`, for the drawn object's own picture. */
export const objectTexture = (slot: Slot<THREE.Texture> & { index: number }, at: unknown) =>
  texture(slot.value, at as never).onObjectUpdate(
    ({ material }) => (slotsOf(material as Material)?.[slot.index] as Slot<THREE.Texture> | undefined)?.value,
  );
