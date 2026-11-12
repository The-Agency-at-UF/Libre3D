/**
 * PURPOSE: What the Materials panel (MaterialsPanel.tsx) and its layer drawers (LayerSettings.tsx)
 * share: each layer type's and blend mode's name and icon, the rows the panel shows for the selected
 * objects, and the helpers their edits go through (one undo step for several objects).
 */

import * as THREE from "three";
import { useEditorStore, type BlendMode, type Entity, type MaterialLayer as MaterialLayerData, type MaterialLayerType } from "../../store/useEditorStore";
import { colorLayerOf, lightingLayerOf } from "../../scene/layers";
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
};

export const LAYER_TYPE_ICONS: Record<MaterialLayerType, string> = {
  color: "ti-palette",
  lighting: "ti-bulb",
  image: "ti-photo",
  depth: "ti-circles",
  gradient: "ti-color-filter",
  noise: "ti-grain",
  fresnel: "ti-circle-dot",
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
// scene (only a mesh takes depth paint). Undefined, for the default, while it isn't drawn yet.
export const liveDepthReach = (entityId: string): number | undefined => {
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

/** One row of the panel: the same layer on each selected object it edits. */
export interface LayerRowData {
  key: string;
  type: MaterialLayerType;
  pairs: Array<{ entity: Entity; layer: MaterialLayerData }>;
  // Where it is in the stack, when one object's stack (or several identical ones) is shown; null otherwise.
  index: number | null;
}

// Several selected objects are shown row by row when their stacks have the same types in the same
// order; otherwise their Lighting layers and top Color layers are.
export const rowsFor = (entities: Entity[]): LayerRowData[] => {
  const shape = (entity: Entity) => entity.materialLayers!.map((layer) => layer.type).join(",");
  if (entities.every((entity) => shape(entity) === shape(entities[0]))) {
    return entities[0].materialLayers!.map((layer, index) => ({
      key: entities.length === 1 ? layer.id : `${index}:${layer.type}`,
      type: layer.type,
      pairs: entities.map((entity) => ({ entity, layer: entity.materialLayers![index] })),
      index,
    }));
  }
  const byType = (key: string, find: (entity: Entity) => MaterialLayerData | undefined, type: MaterialLayerType): LayerRowData | null => {
    const pairs = entities.flatMap((entity) => {
      const layer = find(entity);
      return layer ? [{ entity, layer }] : [];
    });
    return pairs.length > 0 ? { key, type, pairs, index: null } : null;
  };
  return [byType("lighting", (e) => lightingLayerOf(e.materialLayers), "lighting"), byType("color", (e) => colorLayerOf(e.materialLayers), "color")].filter(
    (row): row is LayerRowData => row !== null,
  );
};

export const rowTitle = (row: LayerRowData): string => {
  return LAYER_TYPE_NAMES[row.type];
};

export function useRowUpdate(row: LayerRowData) {
  const updateMultipleEntityMaterialLayers = useEditorStore((state) => state.updateMultipleEntityMaterialLayers);
  return (updates: Partial<MaterialLayerData>) =>
    updateMultipleEntityMaterialLayers(
      Object.fromEntries(row.pairs.map(({ entity, layer }) => [entity.id, { layerId: layer.id, updates }])),
    );
}
