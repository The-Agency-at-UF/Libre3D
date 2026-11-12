/**
 * PURPOSE: The settings of each kind of material layer, as the Materials panel's drawer shows them
 * (MaterialsPanel.tsx, LayerDrawer): one component per layer type, and the label / control rows
 * they're made of.
 */

import { useEffect, useState } from "react";
import { useEditorStore, type ColorLayer, type DepthLayer, type Entity, type ImageLayer, type LightingLayer, type LightingModel } from "../../store/useEditorStore";
import { DEFAULT_METALNESS, DEFAULT_ROUGHNESS } from "../../scene/layers";
import { loadTextureForScene } from "../../utils/assetTransfers";
import { editDepth } from "../../viewport/hooks/useViewportDepthGizmo";
import { ColorField } from "../ui/ColorField";
import { ColorPicker } from "../ui/ColorPicker";
import { NumberField } from "../ui/NumberField";
import { Select } from "../ui/Select";
import { Slider } from "../ui/Slider";
import { Switch } from "../ui/Switch";
import { Vector3Input } from "../ui/Vector3Input";
import { DepthRamp } from "./DepthRamp";
import { IMAGE_SLOT_LABELS, useRowUpdate, type LayerRowData } from "./materialRows";

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

// ─── Fields ──────────────────────────────────────────────────────────────────

// Two or three choices side by side, in a label/control row.
export function SegmentedRow<T extends string>({
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

export function NumberRow({ label, value, min, onChange }: { label: string; value: number; min?: number; onChange: (value: number) => void }) {
  return (
    <div className="prop">
      <span className="prop-label">{label}</span>
      <NumberField label={label} value={value} min={min} onChange={onChange} />
    </div>
  );
}

// ─── Settings drawers ────────────────────────────────────────────────────────

// The Color layer's drawer is the colour picker; its opacity is the layer's (the row's number).
export function ColorSettings({ row }: { row: LayerRowData }) {
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

export function LightingSettings({ row }: { row: LayerRowData }) {
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
export function DepthSettings({ entity, layer }: { entity: Entity; layer: DepthLayer }) {
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
export function ImageSettings({ layer }: { layer: ImageLayer }) {
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
