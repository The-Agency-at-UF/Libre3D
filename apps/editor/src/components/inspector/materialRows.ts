/**
 * PURPOSE: What the layer stack (LayerStack.tsx: the Materials panel's and the Material Builder's)
 * and its layer drawers (layers/) share: each layer type's and blend mode's name and icon, whose
 * stacks are shown (`LayerOwner`: the selected objects, or a material asset), the rows for them, and
 * the helpers their edits go through (one undo step for several stacks).
 */

import * as THREE from "three";
import { useEditorStore, type BlendMode, type Entity, type MaterialAsset, type MaterialLayer as MaterialLayerData, type MaterialLayerType } from "../../store/useEditorStore";
import { colorLayerOf, lightingLayerOf } from "../../scene/layers";
import { DISPLACEABLE_ENTITY_TYPES } from "../../scene/layerStack";
import { assetOf } from "../../scene/materialAssets";
import { depthReach } from "../../utils/depthColors";
import { getLiveScene } from "../../viewport/liveViewport";

// ─── Names and icons ─────────────────────────────────────────────────────────

export const LAYER_TYPE_NAMES: Record<MaterialLayerType, string> = {
  color: "Color",
  lighting: "Lighting",
  image: "Image",
  depth: "Depth",
  gradient: "Gradient",
  noise: "Noise",
  fresnel: "Fresnel",
  normal: "Normal",
  matcap: "Matcap",
  rainbow: "Rainbow",
  glass: "Glass",
  displace: "Displace",
};

export const LAYER_TYPE_ICONS: Record<MaterialLayerType, string> = {
  color: "ti-palette",
  lighting: "ti-bulb",
  image: "ti-photo",
  depth: "ti-circles",
  gradient: "ti-color-filter",
  noise: "ti-grain",
  fresnel: "ti-circle-dot",
  normal: "ti-compass",
  matcap: "ti-sphere",
  rainbow: "ti-rainbow",
  glass: "ti-droplet",
  displace: "ti-blob",
};

export const BLEND_MODE_NAMES: Record<BlendMode, string> = {
  normal: "Normal",
  multiply: "Multiply",
  screen: "Screen",
  overlay: "Overlay",
};

// Multiply darkens, Screen lightens, Overlay does both.
export const BLEND_MODE_ICONS: Record<BlendMode, string> = {
  normal: "ti-circle",
  multiply: "ti-moon",
  screen: "ti-sun",
  overlay: "ti-contrast",
};


// How far a new Depth layer on `entityId` reaches: its mesh's farthest point, measured in the live
// scene (only a mesh takes depth paint). Undefined, for the default, while it isn't drawn yet or
// the stack is a material asset's that no selected object shows.
export const liveDepthReach = (entityId: string | undefined): number | undefined => {
  if (!entityId) return undefined;
  let mesh: THREE.Mesh | undefined;
  getLiveScene()?.traverse((object) => {
    if (!mesh && object instanceof THREE.Mesh && object.userData.entityId === entityId) mesh = object;
  });
  return (mesh && depthReach(mesh.geometry)) ?? undefined;
};

// Several store actions as one undo step: the first records it, the rest join it.
export const asOneUndoStep = (actions: Array<() => void>): void => {
  const [first, ...rest] = actions;
  if (!first) return;
  first();
  if (rest.length === 0) return;
  const history = useEditorStore.temporal.getState();
  history.pause();
  try {
    rest.forEach((action) => action());
  } finally {
    history.resume();
  }
};

// ─── Rows ────────────────────────────────────────────────────────────────────

/**
 * A stack the layer rows edit, and the ID the store's layer actions take for it: an object's own
 * layers (its entity ID), or a material asset's (the asset's ID), which every object using it shows.
 */
export interface LayerOwner {
  id: string;
  layers: MaterialLayerData[];
  /** The object whose stack this is, or the first selected object showing this asset; none for an asset on its own. */
  entityId?: string;
  /**
   * Every selected object showing this stack; none for an asset on its own (the Material Builder).
   * A colour edit goes to the state each of them is shown in (ColorSettings.tsx).
   */
  entityIds: string[];
  /** Whether a Displace layer may be added: only primitives can be displaced (scene/layerStack.ts). */
  displaceable: boolean;
}

/** A material asset's stack, as the Material Builder edits it. */
export const assetOwner = (asset: MaterialAsset): LayerOwner => ({ id: asset.id, layers: asset.layers, entityIds: [], displaceable: false });

/**
 * The stacks the selected objects show, each once: an object that uses a material asset shows the
 * asset's stack, so several objects on one asset are one owner and an edit reaches it once.
 */
export const ownersFor = (entities: Entity[], materials: Record<string, MaterialAsset>): LayerOwner[] => {
  const owners = new Map<string, LayerOwner>();
  for (const entity of entities) {
    if (!entity.materialLayers) continue;
    const asset = assetOf(entity, materials);
    const id = asset?.id ?? entity.id;
    const displaceable = DISPLACEABLE_ENTITY_TYPES.includes(entity.type);
    const shown = owners.get(id);
    if (shown) {
      shown.displaceable &&= displaceable;
      shown.entityIds.push(entity.id);
    } else owners.set(id, { id, layers: asset?.layers ?? entity.materialLayers, entityId: entity.id, entityIds: [entity.id], displaceable });
  }
  return [...owners.values()];
};

/** One row of the stack: the same layer in each stack it edits. */
export interface LayerRowData {
  key: string;
  type: MaterialLayerType;
  pairs: Array<{ owner: LayerOwner; layer: MaterialLayerData }>;
  // Where it is in the stack, when one stack (or several identical ones) is shown; null otherwise.
  index: number | null;
}

// Several stacks are shown row by row when they have the same types in the same order; otherwise
// their Lighting layers and top Color layers are.
export const rowsFor = (owners: LayerOwner[]): LayerRowData[] => {
  if (owners.length === 0) return [];
  const shape = (owner: LayerOwner) => owner.layers.map((layer) => layer.type).join(",");
  if (owners.every((owner) => shape(owner) === shape(owners[0]))) {
    return owners[0].layers.map((layer, index) => ({
      key: owners.length === 1 ? layer.id : `${index}:${layer.type}`,
      type: layer.type,
      pairs: owners.map((owner) => ({ owner, layer: owner.layers[index] })),
      index,
    }));
  }
  const byType = (key: string, find: (layers: MaterialLayerData[]) => MaterialLayerData | undefined, type: MaterialLayerType): LayerRowData | null => {
    const pairs = owners.flatMap((owner) => {
      const layer = find(owner.layers);
      return layer ? [{ owner, layer }] : [];
    });
    return pairs.length > 0 ? { key, type, pairs, index: null } : null;
  };
  return [byType("lighting", lightingLayerOf, "lighting"), byType("color", colorLayerOf, "color")].filter((row): row is LayerRowData => row !== null);
};

export const rowTitle = (row: LayerRowData): string => {
  return LAYER_TYPE_NAMES[row.type];
};

export function useRowUpdate(row: LayerRowData) {
  const updateMultipleEntityMaterialLayers = useEditorStore((state) => state.updateMultipleEntityMaterialLayers);
  return (updates: Partial<MaterialLayerData>) =>
    updateMultipleEntityMaterialLayers(
      Object.fromEntries(row.pairs.map(({ owner, layer }) => [owner.id, { layerId: layer.id, updates }])),
    );
}
