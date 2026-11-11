/**
 * PURPOSE: Reads an entity's material layers: the Color layer and the Lighting layer an object has
 * (one of each, at most), and the roughness and metalness a Lighting layer starts with.
 *
 * INPUT: An entity's `materialLayers`, which is missing on groups, lights, and imported meshes whose
 * layers haven't been derived yet. OUTPUT: The layer, or undefined.
 *
 * No store, React, or Three.js import, so the viewer, the store, and the inspector can all use it.
 */

import type { ColorLayer, LightingLayer, MaterialLayer } from "./types";

/** A new Lighting layer's roughness, and what a layer without one is drawn and shown with. */
export const DEFAULT_ROUGHNESS = 0.45;
/** A new Lighting layer's metalness, and what a layer without one is drawn and shown with. */
export const DEFAULT_METALNESS = 0.08;

export const colorLayerOf = (layers: MaterialLayer[] | undefined): ColorLayer | undefined =>
  layers?.find((layer): layer is ColorLayer => layer.type === "color");

export const lightingLayerOf = (layers: MaterialLayer[] | undefined): LightingLayer | undefined =>
  layers?.find((layer): layer is LightingLayer => layer.type === "lighting");
