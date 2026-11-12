/**
 * PURPOSE: Reads an entity's material layers: its Lighting layer (one at most, holding the surface
 * settings), its first Color layer, and the roughness and metalness a Lighting layer starts with.
 * The rules of the stack itself are in layerStack.ts.
 *
 * INPUT: An entity's `materialLayers` (top first), which is missing on groups, lights, and imported
 * meshes whose layers haven't been derived yet. OUTPUT: The layer or setting.
 *
 * No store, React, or Three.js import, so the viewer, the store, and the inspector can all use it.
 */

import type { ColorLayer, LightingLayer, MaterialLayer } from "./types";

/** A new Lighting layer's roughness, and what a layer without one is drawn and shown with. */
export const DEFAULT_ROUGHNESS = 0.45;
/** A new Lighting layer's metalness, and what a layer without one is drawn and shown with. */
export const DEFAULT_METALNESS = 0.08;

/** The topmost Color layer. */
export const colorLayerOf = (layers: MaterialLayer[] | undefined): ColorLayer | undefined =>
  layers?.find((layer): layer is ColorLayer => layer.type === "color");

export const lightingLayerOf = (layers: MaterialLayer[] | undefined): LightingLayer | undefined =>
  layers?.find((layer): layer is LightingLayer => layer.type === "lighting");

/** The settings of the whole surface, kept on the Lighting layer, with glTF's defaults. */
export interface Surface {
  alphaMode: "OPAQUE" | "MASK" | "BLEND";
  alphaCutoff: number;
  doubleSided: boolean;
}

export const surfaceOf = (layers: MaterialLayer[] | undefined): Surface => {
  const lighting = lightingLayerOf(layers);
  return {
    alphaMode: lighting?.alphaMode ?? "OPAQUE",
    alphaCutoff: lighting?.alphaCutoff ?? 0.5,
    doubleSided: lighting?.doubleSided ?? false,
  };
};
