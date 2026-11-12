/**
 * PURPOSE: Inspector panel for the selected objects' material: their opacity and their layer stack
 * (scene/layerStack.ts), one row per layer, top of the stack first.
 *
 * A row, left to right: the layer's type (a dropdown switches Color ↔ Depth), its icon (opens the
 * layer's settings in a drawer beside the sidebar; dragging it reorders the stack), its opacity,
 * its blend mode, its eye, and ×. The stack's rules decide what can be removed, switched or moved:
 * Lighting stays on top and can't be removed; a Color layer goes only while another colour layer
 * stays; an imported model's Image layers fill their texture slots and stay at the bottom.
 *
 * Several selected objects with the same layers in the same order are edited row by row; with
 * different stacks, their Lighting and top Color layers are.
 */

import { useState, useEffect, useRef, useLayoutEffect, type DragEvent, type ReactNode } from "react";
import { createPortal } from "react-dom";
import * as THREE from "three";
import {
  useEditorStore,
  type BlendMode,
  type ColorLayer,
  type Entity,
  type LightingLayer,
  type LightingModel,
  type MaterialLayer as MaterialLayerData,
  type MaterialLayerType,
  type ImageLayer,
  type ImageSlot,
  type DepthLayer,
} from "../../store/useEditorStore";
import { colorLayerOf, lightingLayerOf, DEFAULT_METALNESS, DEFAULT_ROUGHNESS } from "../../scene/layers";
import type { PaintLayerType } from "../../scene/entityFactories";
import { BLEND_MODES, canSwitchLayerType, movableRange, removeBlockedReason, SWITCHABLE_LAYER_TYPES } from "../../scene/layerStack";
import { loadTextureForScene } from "../../utils/assetTransfers";
import { depthReach } from "../../utils/depthColors";
import { getLiveScene } from "../../viewport/liveViewport";
import { ColorField } from "../ui/ColorField";
import { ColorPicker } from "../ui/ColorPicker";
import { NumberField } from "../ui/NumberField";
import { PanelSection } from "../ui/PanelSection";
import { Slider } from "../ui/Slider";
import { Select } from "../ui/Select";
import { Switch } from "../ui/Switch";
import { Vector3Input } from "../ui/Vector3Input";
import { DepthRamp } from "./DepthRamp";
import { editDepth } from "../../viewport/hooks/useViewportDepthGizmo";

// ─── Names and icons ─────────────────────────────────────────────────────────

const LAYER_TYPE_NAMES: Record<MaterialLayerType, string> = {
  color: "Color",
  lighting: "Lighting",
  image: "Image",
  depth: "Depth",
  gradient: "Gradient",
  noise: "Noise",
  fresnel: "Fresnel",
};

const LAYER_TYPE_ICONS: Record<MaterialLayerType, string> = {
  color: "ti-palette",
  lighting: "ti-bulb",
  image: "ti-photo",
  depth: "ti-circles",
  gradient: "ti-color-filter",
  noise: "ti-grain",
  fresnel: "ti-circle-dot",
};

const BLEND_MODE_NAMES: Record<BlendMode, string> = {
  normal: "Normal",
  multiply: "Multiply",
  screen: "Screen",
  overlay: "Overlay",
};

// Multiply darkens, Screen lightens, Overlay does both.
const BLEND_MODE_ICONS: Record<BlendMode, string> = {
  normal: "ti-circle",
  multiply: "ti-moon",
  screen: "ti-sun",
  overlay: "ti-contrast",
};

// Labelled "Base Color" (not "Color") so an image row reads distinctly from a Color layer.
const IMAGE_SLOT_LABELS: Record<ImageSlot, string> = {
  color: "Base Color",
  normal: "Normal",
  metallicRoughness: "Metallic / Roughness",
  emissive: "Emissive",
  ao: "Ambient Occlusion",
};

const LIGHTING_MODEL_OPTIONS: { label: string; value: LightingModel }[] = [
  { label: "None", value: "none" },
  { label: "Lambert", value: "lambert" },
  { label: "Phong", value: "phong" },
  { label: "Physical", value: "physical" },
  { label: "Toon", value: "toon" },
];

type AlphaMode = NonNullable<LightingLayer["alphaMode"]>;

// Mirrors glTF's alphaMode. Opaque ignores alpha; Mask is a hard alpha-tested
// cutout (writes depth, so it sorts correctly); Blend is true translucency
// (disables depth-write). Exporters frequently mis-flag a hard-edged cutout as
// Blend, which then clips against opaque geometry behind it -- switching such a
// material to Mask is the fix.
const ALPHA_MODE_OPTIONS: { label: string; value: AlphaMode }[] = [
  { label: "Opaque", value: "OPAQUE" },
  { label: "Mask", value: "MASK" },
  { label: "Blend", value: "BLEND" },
];

const DEPTH_TYPE_OPTIONS: { label: string; value: DepthLayer["gradientType"] }[] = [
  { label: "Radial", value: "radial" },
  { label: "Linear", value: "linear" },
];

const BLENDING_OPTIONS: { label: string; value: "linear" | "smooth" }[] = [
  { label: "Linear", value: "linear" },
  { label: "Smooth", value: "smooth" },
];

// How far a new Depth layer on `entityId` reaches: its mesh's farthest point, measured in the live
// scene (only a mesh takes depth paint). Undefined, for the default, while it isn't drawn yet.
const liveDepthReach = (entityId: string): number | undefined => {
  let mesh: THREE.Mesh | undefined;
  getLiveScene()?.traverse((object) => {
    if (!mesh && object instanceof THREE.Mesh && object.userData.entityId === entityId) mesh = object;
  });
  return (mesh && depthReach(mesh.geometry)) ?? undefined;
};

// Several store actions as one undo step: the first records it, the rest join it.
const asOneUndoStep = (actions: Array<() => void>): void => {
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

// ─── Fields ──────────────────────────────────────────────────────────────────

// Two or three choices side by side, in a label/control row.
function SegmentedRow<T extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: { label: string; value: T }[];
  value: T;
  onChange: (value: T) => void;
}) {
  return (
    <div className="prop">
      <span className="prop-label">{label}</span>
      <div className="seg" style={{ flex: 1 }}>
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            className={`seg-btn ${option.value === value ? "on" : ""}`}
            onClick={() => onChange(option.value)}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function NumberRow({ label, value, min, onChange }: { label: string; value: number; min?: number; onChange: (value: number) => void }) {
  return (
    <div className="prop">
      <span className="prop-label">{label}</span>
      <NumberField label={label} value={value} min={min} onChange={onChange} />
    </div>
  );
}

// A small menu under a row control: a list of choices, the current one marked. Closes on a choice,
// a click outside it, or Escape.
function RowMenu<T extends string>({
  label,
  trigger,
  triggerClassName,
  title,
  disabled,
  options,
  value,
  onSelect,
}: {
  label: string;
  trigger: ReactNode;
  triggerClassName: string;
  title: string;
  disabled?: boolean;
  options: { value: T; label: string; icon?: string; disabled?: boolean }[];
  value: T | null;
  onSelect: (value: T) => void;
}) {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!root.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div className="mat-row-menu" ref={root}>
      <button
        type="button"
        className={triggerClassName}
        title={title}
        aria-label={label}
        aria-haspopup="menu"
        aria-expanded={open}
        disabled={disabled}
        onClick={() => setOpen((was) => !was)}
      >
        {trigger}
      </button>
      {open && (
        <div className="mat-row-menu-popover" role="menu">
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              role="menuitemradio"
              aria-checked={option.value === value}
              className={`mat-row-menu-item ${option.value === value ? "on" : ""}`}
              disabled={option.disabled}
              onClick={() => {
                setOpen(false);
                if (option.value !== value) onSelect(option.value);
              }}
            >
              {option.icon && <i className={`ti ${option.icon}`}></i>}
              <span>{option.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Rows ────────────────────────────────────────────────────────────────────

/** One row of the panel: the same layer on each selected object it edits. */
interface LayerRowData {
  key: string;
  type: MaterialLayerType;
  pairs: Array<{ entity: Entity; layer: MaterialLayerData }>;
  // Where it is in the stack, when one object's stack (or several identical ones) is shown; null otherwise.
  index: number | null;
}

// Several selected objects are shown row by row when their stacks have the same types in the same
// order; otherwise their Lighting layers and top Color layers are.
const rowsFor = (entities: Entity[]): LayerRowData[] => {
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

const rowTitle = (row: LayerRowData): string => {
  const layer = row.pairs[0].layer;
  return layer.type === "image" ? IMAGE_SLOT_LABELS[layer.slot] : LAYER_TYPE_NAMES[row.type];
};

function LayerRow({
  row,
  drawerOpen,
  onToggleDrawer,
  draggable,
  dropEdge,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
}: {
  row: LayerRowData;
  drawerOpen: boolean;
  onToggleDrawer: (element: HTMLElement) => void;
  draggable: boolean;
  dropEdge: "above" | "below" | null;
  onDragStart: () => void;
  onDragOver: (event: DragEvent<HTMLDivElement>) => void;
  onDrop: () => void;
  onDragEnd: () => void;
}) {
  const updateMultipleEntityMaterialLayers = useEditorStore((state) => state.updateMultipleEntityMaterialLayers);
  const removeMaterialLayer = useEditorStore((state) => state.removeMaterialLayer);
  const switchMaterialLayerType = useEditorStore((state) => state.switchMaterialLayerType);
  const rowRef = useRef<HTMLDivElement>(null);

  const first = row.pairs[0].layer;
  const isImage = row.type === "image";
  const isLighting = row.type === "lighting";
  const mixed = (read: (layer: MaterialLayerData) => unknown) => row.pairs.some(({ layer }) => read(layer) !== read(first));

  const update = (updates: Partial<MaterialLayerData>) =>
    updateMultipleEntityMaterialLayers(
      Object.fromEntries(row.pairs.map(({ entity, layer }) => [entity.id, { layerId: layer.id, updates }])),
    );

  const blocked = row.pairs.map(({ entity, layer }) => removeBlockedReason(entity.materialLayers!, layer)).find((reason) => reason !== null);
  const canSwitchTo = (type: MaterialLayerType) => row.pairs.every(({ entity, layer }) => canSwitchLayerType(entity.materialLayers!, layer, type));
  const switchable = SWITCHABLE_LAYER_TYPES.includes(row.type);
  const enabled = !mixed((layer) => layer.enabled) ? first.enabled : true;
  const name = rowTitle(row);

  return (
    <div
      ref={rowRef}
      className={`mat-row ${drawerOpen ? "open" : ""} ${enabled ? "" : "off"} ${dropEdge ? `drop-${dropEdge}` : ""}`}
      data-layer-type={row.type}
      onDragOver={onDragOver}
      onDrop={(event) => {
        event.preventDefault();
        onDrop();
      }}
    >
      {switchable ? (
        <RowMenu
          label={`${name} layer type`}
          title="Change the layer's type"
          triggerClassName="mat-row-type"
          trigger={
            <>
              <span className="mat-row-name">{name}</span>
              <i className="ti ti-chevron-down"></i>
            </>
          }
          value={row.type}
          options={SWITCHABLE_LAYER_TYPES.map((type) => ({
            value: type,
            label: LAYER_TYPE_NAMES[type],
            icon: LAYER_TYPE_ICONS[type],
            disabled: !canSwitchTo(type),
          }))}
          onSelect={(type) =>
            asOneUndoStep(
              row.pairs.map(({ entity, layer }) => () =>
                switchMaterialLayerType(entity.id, layer.id, type as PaintLayerType, type === "depth" ? liveDepthReach(entity.id) : undefined),
              ),
            )
          }
        />
      ) : (
        <span className="mat-row-type static" title={isImage ? "Comes with the imported model" : undefined}>
          <span className="mat-row-name">{name}</span>
        </span>
      )}

      <button
        type="button"
        className={`mat-icon-btn mat-row-icon ${drawerOpen ? "on" : ""}`}
        title={draggable ? `${name} settings (drag to move the layer)` : `${name} settings`}
        aria-label={`${name} settings`}
        aria-expanded={drawerOpen}
        draggable={draggable}
        onDragStart={(event) => {
          event.dataTransfer.effectAllowed = "move";
          event.dataTransfer.setData("text/plain", first.id);
          onDragStart();
        }}
        onDragEnd={onDragEnd}
        onClick={() => rowRef.current && onToggleDrawer(rowRef.current)}
      >
        <i className={`ti ${LAYER_TYPE_ICONS[row.type]}`}></i>
      </button>

      <NumberField
        className="mat-row-opacity"
        label={`${name} opacity (%)`}
        value={isImage ? 100 : mixed((layer) => layer.opacity) ? null : Math.round(first.opacity * 100)}
        min={0}
        max={100}
        step={1}
        integer
        disabled={isImage}
        onChange={(percent) => update({ opacity: percent / 100 })}
      />

      <RowMenu
        label={`${name} blend mode`}
        title={isLighting ? "Lighting shades everything under it" : isImage ? "Comes with the imported model" : `Blend mode: ${mixed((layer) => layer.blendMode) ? "mixed" : BLEND_MODE_NAMES[first.blendMode]}`}
        triggerClassName="mat-icon-btn"
        trigger={<i className={`ti ${mixed((layer) => layer.blendMode) ? "ti-blend-mode" : BLEND_MODE_ICONS[first.blendMode]}`}></i>}
        disabled={isLighting || isImage}
        value={mixed((layer) => layer.blendMode) ? null : first.blendMode}
        options={BLEND_MODES.map((mode) => ({ value: mode, label: BLEND_MODE_NAMES[mode], icon: BLEND_MODE_ICONS[mode] }))}
        onSelect={(blendMode) => update({ blendMode })}
      />

      <button
        type="button"
        className="mat-icon-btn"
        title={enabled ? `Hide the ${name} layer` : `Show the ${name} layer`}
        aria-label={`${name} layer visible`}
        aria-pressed={enabled}
        onClick={() => update({ enabled: !enabled })}
      >
        <i className={`ti ${enabled ? "ti-eye" : "ti-eye-off"}`}></i>
      </button>

      <button
        type="button"
        className="mat-icon-btn"
        disabled={!!blocked}
        title={blocked ?? `Remove the ${name} layer`}
        aria-label={`Remove the ${name} layer`}
        onClick={() => asOneUndoStep(row.pairs.map(({ entity, layer }) => () => removeMaterialLayer(entity.id, layer.id)))}
      >
        <i className="ti ti-x"></i>
      </button>
    </div>
  );
}

// ─── Settings drawers ────────────────────────────────────────────────────────

// The Color layer's drawer is the colour picker; its opacity is the layer's (the row's number).
function ColorSettings({ row }: { row: LayerRowData }) {
  const update = useRowUpdate(row);
  const first = row.pairs[0].layer as ColorLayer;
  return (
    <ColorPicker
      color={first.color}
      alpha={first.opacity}
      onChange={({ color, alpha }) => update({ ...(color !== undefined ? { color } : null), ...(alpha !== undefined ? { opacity: alpha } : null) })}
    />
  );
}

function LightingSettings({ row }: { row: LayerRowData }) {
  const update = useRowUpdate(row);
  const layers = row.pairs.map(({ layer }) => layer as LightingLayer);
  const first = layers[0];
  const mixed = (read: (layer: LightingLayer) => unknown) => layers.some((layer) => read(layer) !== read(first));
  const modelMixed = mixed((layer) => layer.model);
  const alphaMode: AlphaMode = first.alphaMode ?? "OPAQUE";
  const alphaModeMixed = mixed((layer) => layer.alphaMode ?? "OPAQUE");

  return (
    <>
      <Select
        label="Model"
        options={modelMixed ? [{ label: "Mixed", value: "" }, ...LIGHTING_MODEL_OPTIONS] : LIGHTING_MODEL_OPTIONS}
        value={modelMixed ? "" : first.model}
        onChange={(val) => {
          if (val) update({ model: val as LightingModel });
        }}
      />

      {!modelMixed && first.model !== "none" && (
        <>
          {first.model === "physical" && (
            <>
              <Slider label="Roughness" min={0} max={1} step={0.01} value={first.roughness ?? DEFAULT_ROUGHNESS} onChange={(roughness) => update({ roughness })} />
              <Slider label="Metalness" min={0} max={1} step={0.01} value={first.metalness ?? DEFAULT_METALNESS} onChange={(metalness) => update({ metalness })} />
              <Slider label="Clearcoat" min={0} max={1} step={0.01} value={first.clearcoat ?? 0} onChange={(clearcoat) => update({ clearcoat })} />
              {(first.clearcoat ?? 0) > 0 && (
                <Slider
                  label="Coat Rough."
                  min={0}
                  max={1}
                  step={0.01}
                  value={first.clearcoatRoughness ?? 0}
                  onChange={(clearcoatRoughness) => update({ clearcoatRoughness })}
                />
              )}
            </>
          )}
          {first.model === "phong" && (
            <Slider label="Shininess" min={0} max={100} step={1} value={first.shininess ?? 30} onChange={(shininess) => update({ shininess })} />
          )}
          <ColorField label="Emissive" color={first.emissive ?? "#000000"} mixed={mixed((layer) => layer.emissive)} onChange={({ color }) => color && update({ emissive: color })} />
          <Slider
            label="Emissive Int."
            min={0}
            max={5}
            step={0.1}
            value={first.emissiveIntensity ?? 1}
            onChange={(emissiveIntensity) => update({ emissiveIntensity })}
          />
        </>
      )}

      <div className="mat-drawer-heading">Surface</div>
      <Select
        label="Alpha Mode"
        options={alphaModeMixed ? [{ label: "Mixed", value: "" }, ...ALPHA_MODE_OPTIONS] : ALPHA_MODE_OPTIONS}
        value={alphaModeMixed ? "" : alphaMode}
        onChange={(val) => {
          if (!val) return;
          // Seed a sensible cutoff when entering Mask so an alpha-tested cutout has something to test against.
          update(val === "MASK" ? { alphaMode: "MASK", alphaCutoff: first.alphaCutoff ?? 0.5 } : { alphaMode: val as AlphaMode });
        }}
      />
      {!alphaModeMixed && alphaMode === "MASK" && (
        <Slider label="Alpha Cutoff" min={0} max={1} step={0.01} value={first.alphaCutoff ?? 0.5} onChange={(alphaCutoff) => update({ alphaCutoff })} />
      )}
      <Switch
        label="Double Sided"
        checked={mixed((layer) => layer.doubleSided ?? false) ? false : (first.doubleSided ?? false)}
        onChange={(doubleSided) => update({ doubleSided })}
      />
    </>
  );
}

// The Depth layer of one object (utils/depthColors.ts says how it colours). The picked stop is this
// drawer's own state; it starts on the first stop for each layer (the drawer is keyed by layer).
function DepthSettings({ entity, layer }: { entity: Entity; layer: DepthLayer }) {
  const updateMaterialLayer = useEditorStore((state) => state.updateMaterialLayer);
  const depthEdit = useEditorStore((state) => state.depthEdit);
  const setDepthEdit = useEditorStore((state) => state.setDepthEdit);
  const onUpdate = (updates: Partial<DepthLayer>) => updateMaterialLayer(entity.id, layer.id, updates);
  const isEditing = depthEdit === entity.id;
  const [selected, setSelected] = useState(0);
  const index = Math.min(selected, layer.stops.length - 1);
  const stop = layer.stops[index];

  const setVector = (key: "origin" | "direction", axis: number, value: number) => {
    if (value === layer[key][axis]) return;
    const next: [number, number, number] = [...layer[key]];
    next[axis] = value;
    onUpdate({ [key]: next });
  };

  const setStop = (updates: Partial<DepthLayer["stops"][number]>) =>
    onUpdate({ stops: layer.stops.map((each, i) => (i === index ? { ...each, ...updates } : each)) });

  return (
    <>
      <div className="prop">
        <span className="prop-label">Viewport</span>
        <button
          type="button"
          className={`mat-drawer-btn ${isEditing ? "on" : ""}`}
          title={isEditing ? "Stop editing in the viewport (Enter)" : "Edit in the viewport: the gizmo moves the origin"}
          aria-pressed={isEditing}
          onClick={() => (isEditing ? setDepthEdit(null) : editDepth(entity.id))}
        >
          <i className="ti ti-pointer"></i>
          <span>{isEditing ? "Editing" : "Edit"}</span>
        </button>
      </div>
      <SegmentedRow label="Type" options={DEPTH_TYPE_OPTIONS} value={layer.gradientType} onChange={(gradientType) => onUpdate({ gradientType })} />
      <SegmentedRow
        label="Blending"
        options={BLENDING_OPTIONS}
        value={layer.smooth ? "smooth" : "linear"}
        onChange={(value) => onUpdate({ smooth: value === "smooth" })}
      />
      <DepthRamp layer={layer} selected={index} onSelect={setSelected} onChange={(stops) => onUpdate({ stops })} />
      {stop && (
        <>
          <ColorField label="Stop Color" color={stop.color} alpha={stop.alpha ?? 1} onChange={(change) => setStop(change.color !== undefined ? { color: change.color } : { alpha: change.alpha })} />
          <div className="prop">
            <span className="prop-label">Stop Position</span>
            <NumberField
              label="Stop position"
              min={0}
              max={100}
              step={1}
              integer
              value={Math.round(stop.position * 100)}
              onChange={(percent) => setStop({ position: percent / 100 })}
            />
            <button
              type="button"
              className="mat-icon-btn"
              disabled={layer.stops.length <= 2}
              title={layer.stops.length <= 2 ? "A ramp needs two stops" : "Remove this stop"}
              aria-label="Remove this stop"
              onClick={() => {
                onUpdate({ stops: layer.stops.filter((_, i) => i !== index) });
                setSelected(Math.max(0, index - 1));
              }}
            >
              <i className="ti ti-trash"></i>
            </button>
          </div>
        </>
      )}
      <Vector3Input label="Origin" values={layer.origin} onChange={(axis, value) => setVector("origin", axis, value)} />
      {layer.gradientType === "linear" && (
        <Vector3Input label="Direction" values={layer.direction} onChange={(axis, value) => setVector("direction", axis, value)} />
      )}
      <NumberRow label="Near" value={layer.near} min={0} onChange={(near) => onUpdate({ near })} />
      <NumberRow label="Far" value={layer.far} min={0} onChange={(far) => onUpdate({ far })} />
    </>
  );
}

// An imported texture map: its thumbnail, loaded lazily from the texture store (the pixels never
// live in the store), so an object URL is made while it shows.
function ImageSettings({ layer }: { layer: ImageLayer }) {
  const [thumbUrl, setThumbUrl] = useState<string | null>(null);

  useEffect(() => {
    let objectUrl: string | null = null;
    let cancelled = false;
    loadTextureForScene(layer.textureAssetId)
      .then((blob) => {
        if (cancelled || !blob) return;
        objectUrl = URL.createObjectURL(blob);
        setThumbUrl(objectUrl);
      })
      .catch(() => {
        /* thumbnail is best-effort; a missing asset just shows the placeholder */
      });
    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [layer.textureAssetId]);

  return (
    <>
      <div className="mat-drawer-thumb" style={{ backgroundImage: thumbUrl ? `url(${thumbUrl})` : undefined }} />
      <p className="mat-drawer-note">
        From the imported model: fills its {IMAGE_SLOT_LABELS[layer.slot]} map. Its eye shows or hides the map.
      </p>
    </>
  );
}

function useRowUpdate(row: LayerRowData) {
  const updateMultipleEntityMaterialLayers = useEditorStore((state) => state.updateMultipleEntityMaterialLayers);
  return (updates: Partial<MaterialLayerData>) =>
    updateMultipleEntityMaterialLayers(
      Object.fromEntries(row.pairs.map(({ entity, layer }) => [entity.id, { layerId: layer.id, updates }])),
    );
}

/**
 * A layer's settings, in a drawer beside the right sidebar at its row's height. It stays open while
 * the viewport is used (a Depth layer is edited there too) and closes from its icon, its ×, Escape,
 * or when its layer goes.
 */
function LayerDrawer({ row, anchor, onClose }: { row: LayerRowData; anchor: HTMLElement; onClose: () => void }) {
  const isReadOnly = useEditorStore((state) => state.readOnlyReason !== null);
  const drawer = useRef<HTMLDivElement>(null);
  const [place, setPlace] = useState<{ top: number; right: number } | null>(null);

  useLayoutEffect(() => {
    const placeIt = () => {
      const sidebar = anchor.closest(".right-sidebar") ?? anchor;
      const sidebarRect = sidebar.getBoundingClientRect();
      const rowRect = anchor.getBoundingClientRect();
      const height = drawer.current?.offsetHeight ?? 0;
      const top = Math.max(8, Math.min(rowRect.top, window.innerHeight - height - 8));
      setPlace({ top, right: window.innerWidth - sidebarRect.left + 8 });
    };
    placeIt();
    window.addEventListener("resize", placeIt);
    const scroller = anchor.closest(".panel-body");
    scroller?.addEventListener("scroll", placeIt);
    return () => {
      window.removeEventListener("resize", placeIt);
      scroller?.removeEventListener("scroll", placeIt);
    };
  }, [anchor, row.key, row.type]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  const name = rowTitle(row);
  const single = row.pairs.length === 1 ? row.pairs[0] : null;

  return createPortal(
    <div
      ref={drawer}
      className="mat-drawer"
      role="dialog"
      aria-label={`${name} settings`}
      style={place ? { top: place.top, right: place.right } : { visibility: "hidden" }}
    >
      <div className="mat-drawer-header">
        <i className={`ti ${LAYER_TYPE_ICONS[row.type]}`}></i>
        <span>{name}</span>
        <button type="button" className="mat-icon-btn" title="Close" aria-label="Close the layer settings" onClick={onClose}>
          <i className="ti ti-x"></i>
        </button>
      </div>
      <fieldset className="mat-drawer-body inspector-fieldset" disabled={isReadOnly}>
        {row.type === "color" && <ColorSettings row={row} />}
        {row.type === "lighting" && <LightingSettings row={row} />}
        {row.type === "depth" &&
          (single ? (
            <DepthSettings key={single.layer.id} entity={single.entity} layer={single.layer as DepthLayer} />
          ) : (
            <p className="mat-drawer-note">Select one object to edit its Depth layer.</p>
          ))}
        {row.type === "image" && <ImageSettings layer={row.pairs[0].layer as ImageLayer} />}
      </fieldset>
    </div>,
    document.body,
  );
}

// ─── Panel ───────────────────────────────────────────────────────────────────

interface MaterialsPanelProps {
  selectedEntities: Entity[];
}

export function MaterialsPanel({ selectedEntities: allSelectedEntities }: MaterialsPanelProps) {
  const addMaterialLayer = useEditorStore((state) => state.addMaterialLayer);
  const moveMaterialLayer = useEditorStore((state) => state.moveMaterialLayer);
  const setEntityOpacity = useEditorStore((state) => state.setEntityOpacity);
  const isReadOnly = useEditorStore((state) => state.readOnlyReason !== null);
  const [drawer, setDrawer] = useState<{ key: string; anchor: HTMLElement } | null>(null);
  const [dragging, setDragging] = useState<number | null>(null);
  const [dropAt, setDropAt] = useState<{ index: number; edge: "above" | "below" } | null>(null);

  // Imported meshes carry derived materialLayers too: only the stack existing matters. Directional
  // lights (no material) and import nodes still awaiting their layers are left out.
  const selectedEntities = allSelectedEntities.filter((e) => e.type !== "directionalLight" && e.materialLayers);
  const rows = selectedEntities.length > 0 ? rowsFor(selectedEntities) : [];
  const openRow = drawer ? rows.find((row) => row.key === drawer.key) : undefined;

  // A drawer whose layer went (removed, undone, another selection) closes.
  useEffect(() => {
    if (drawer && !openRow) setDrawer(null);
  }, [drawer, openRow]);

  if (selectedEntities.length === 0) return null;

  // Rows move one object's stack (or several identical ones, as one undo step).
  const [min, max] = movableRange(selectedEntities[0].materialLayers!);
  const canMove = (row: LayerRowData) => !isReadOnly && row.index !== null && row.index >= min && row.index <= max;

  const opacities = selectedEntities.map((entity) => entity.opacity ?? 1);
  const opacityMixed = opacities.some((opacity) => opacity !== opacities[0]);

  const finishDrag = () => {
    setDragging(null);
    setDropAt(null);
  };

  const drop = () => {
    if (dragging === null || !dropAt) return finishDrag();
    // Where the dragged layer lands in the stack once it's taken out of its old place.
    let to = dropAt.edge === "above" ? dropAt.index : dropAt.index + 1;
    if (dragging < to) to -= 1;
    const moves = selectedEntities.map((entity) => () => moveMaterialLayer(entity.id, entity.materialLayers![dragging].id, to));
    finishDrag();
    asOneUndoStep(moves);
  };

  return (
    <PanelSection
      title="Materials"
      defaultOpen={true}
      action={
        <button
          type="button"
          className="mat-icon-btn"
          title="Add a Color layer (its type can be changed in its row)"
          aria-label="Add a layer"
          disabled={isReadOnly}
          onClick={() => asOneUndoStep(selectedEntities.map((entity) => () => addMaterialLayer(entity.id, "color")))}
        >
          <i className="ti ti-plus"></i>
        </button>
      }
    >
      <div className="material-layer-stack">
        <div className="prop mat-object-opacity">
          <span className="prop-label">Opacity</span>
          <NumberField
            label="Object opacity (%)"
            value={opacityMixed ? null : Math.round(opacities[0] * 100)}
            min={0}
            max={100}
            step={1}
            integer
            onChange={(percent) => setEntityOpacity(Object.fromEntries(selectedEntities.map((entity) => [entity.id, percent / 100])))}
          />
        </div>

        <div className="mat-rows" onDragLeave={(event) => !event.currentTarget.contains(event.relatedTarget as Node) && setDropAt(null)}>
          {rows.map((row) => (
            <LayerRow
              key={row.key}
              row={row}
              drawerOpen={drawer?.key === row.key}
              onToggleDrawer={(anchor) => setDrawer((open) => (open?.key === row.key ? null : { key: row.key, anchor }))}
              draggable={canMove(row)}
              dropEdge={dragging !== null && dropAt?.index === row.index ? dropAt.edge : null}
              onDragStart={() => setDragging(row.index)}
              onDragOver={(event) => {
                if (dragging === null || row.index === null) return;
                const rect = event.currentTarget.getBoundingClientRect();
                let edge: "above" | "below" = event.clientY < rect.top + rect.height / 2 ? "above" : "below";
                // Nothing lands above Lighting or below the Image layers.
                if (row.index < min) edge = "below";
                if (row.index > max) edge = "above";
                if (row.index < min - 1 || row.index > max + 1) return;
                event.preventDefault();
                event.dataTransfer.dropEffect = "move";
                if (dropAt?.index !== row.index || dropAt.edge !== edge) setDropAt({ index: row.index, edge });
              }}
              onDrop={drop}
              onDragEnd={finishDrag}
            />
          ))}
        </div>
      </div>

      {drawer && openRow && <LayerDrawer key={openRow.key} row={openRow} anchor={drawer.anchor} onClose={() => setDrawer(null)} />}
    </PanelSection>
  );
}
