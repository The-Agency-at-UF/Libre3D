/**
 * PURPOSE: Material assets (the scene's `materials` section): which layers an object is drawn with
 * when it uses one, and the copies made when one is created from an object or detached from it.
 *
 * INPUT: Entities and the scene's material assets by ID. OUTPUT: An object's layers (`layersOf`),
 * the entities as the viewport draws them (`resolveEntities`), and new layer stacks.
 *
 * An object that uses an asset names it in `materialAssetId` and is drawn with the asset's layers.
 * Applying an asset discards the object's own layers: its `materialLayers` stays as an empty list,
 * which still says "this object has a material" to everything that asks. Detaching copies the
 * asset's layers back. If the asset is ever missing (a damaged file), the object is drawn from its
 * own list, so with a plain default material, and never fails.
 *
 * No store, React, or Three.js import, so the viewer, the store, and the inspector can all use it.
 */

import { cloneMaterialLayer, createColorLayer, createEntityId, createLightingLayer } from "./entityFactories";
import type { Entity, MaterialAsset, MaterialLayer } from "./types";

export type MaterialAssets = Record<string, MaterialAsset>;

/** The asset an object uses, or undefined when it uses none or names one that isn't there. */
export const assetOf = (entity: Pick<Entity, "materialAssetId">, materials: MaterialAssets | undefined): MaterialAsset | undefined => {
  const asset = entity.materialAssetId ? materials?.[entity.materialAssetId] : undefined;
  // A document can hold anything: an asset without a layer list is treated as missing.
  return asset && Array.isArray(asset.layers) ? asset : undefined;
};

/** The layers an object is drawn with: its asset's, or its own when it has no asset. */
export const layersOf = (entity: Pick<Entity, "materialAssetId" | "materialLayers">, materials: MaterialAssets | undefined): MaterialLayer[] | undefined =>
  // Only what has layers of its own takes an asset: never a group or a light.
  (entity.materialLayers && assetOf(entity, materials)?.layers) || entity.materialLayers;

/** Whether an object may use a material asset: it has layers, and isn't part of an imported model. */
export const canUseMaterialAsset = (entity: Entity): boolean => !!entity.materialLayers && entity.type !== "importedModel";

/** The objects that use an asset. */
export const usersOfMaterialAsset = (entities: Entity[], assetId: string): Entity[] =>
  entities.filter((entity) => entity.materialAssetId === assetId);

/** A copy of a stack that shares nothing with it, each layer under a new ID. */
export const copyLayers = (layers: MaterialLayer[]): MaterialLayer[] => layers.map((layer) => ({ ...cloneMaterialLayer(layer), id: createEntityId() }));

/** What a new material starts with: Lighting over a white Color layer, as a new 3D object does. */
export const createMaterialAssetLayers = (): MaterialLayer[] => [createLightingLayer(), createColorLayer("#ffffff")];

/** "Material", "Material 2", …: the first name no asset has yet. */
export const nextMaterialAssetName = (materials: MaterialAssets): string => {
  const taken = new Set(Object.values(materials).map((asset) => asset.name));
  for (let n = 1; ; n++) {
    const name = n === 1 ? "Material" : `Material ${n}`;
    if (!taken.has(name)) return name;
  }
};

// ─── The entities as they are drawn ──────────────────────────────────────────

// An entity that uses an asset, as it was last resolved: reused while the entity and the asset's
// layer list are the same objects, so ObjectManager's sync still skips what didn't change.
const resolved = new WeakMap<Entity, { layers: MaterialLayer[]; entity: Entity }>();
// The last list resolved, so the same entities and assets give the same array (entityIndex.ts
// caches by it).
let last: { entities: Entity[]; materials: MaterialAssets | undefined; result: Entity[] } | null = null;

/**
 * The entities with each asset user's `materialLayers` replaced by its asset's layers: what the
 * viewport, the viewer and export draw. Entities without an asset come back as they are, and the
 * list itself does when none uses one.
 */
export const resolveEntities = (entities: Entity[], materials: MaterialAssets | undefined): Entity[] => {
  if (last && last.entities === entities && last.materials === materials) return last.result;

  let changed = false;
  const result = entities.map((entity) => {
    const layers = layersOf(entity, materials);
    if (layers === entity.materialLayers) return entity;
    changed = true;
    const before = resolved.get(entity);
    if (before && before.layers === layers) return before.entity;
    const drawn = { ...entity, materialLayers: layers };
    resolved.set(entity, { layers: layers!, entity: drawn });
    return drawn;
  });

  last = { entities, materials, result: changed ? result : entities };
  return last.result;
};
