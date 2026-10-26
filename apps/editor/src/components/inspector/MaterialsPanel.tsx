import { useState, useEffect, type ReactNode } from "react";
import {
  useEditorStore,
  type Entity,
  type ColorLayer,
  type LightingLayer,
  type LightingModel,
  type MaterialLayer as MaterialLayerData,
  type ImageLayer,
  type ImageSlot,
  type DepthLayer,
} from "../../store/useEditorStore";
import { loadTextureForScene } from "../../utils/assetTransfers";
import { PanelSection } from "../ui/PanelSection";
import { Slider } from "../ui/Slider";
import { Select } from "../ui/Select";
import { Switch } from "../ui/Switch";
import { Vector3Input } from "../ui/Vector3Input";
import { DepthRamp } from "./DepthRamp";
import { editDepth } from "../../viewport/hooks/useViewportDepthGizmo";

// ─── Layer chrome ────────────────────────────────────────────────────────────
// Each material category (Color, Lighting, texture maps) renders as a compact
// "layer": a one-line header (chevron · icon · name · trailing action) with its
// property rows indented directly beneath it. The header toggle and the trailing
// action are sibling buttons rather than nested, so clicking the action can never
// bubble into a collapse — no stopPropagation needed.

function MaterialLayer({
  icon,
  name,
  action,
  defaultOpen = true,
  children,
}: {
  icon: ReactNode;
  name: string;
  action?: ReactNode;
  defaultOpen?: boolean;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="mat-layer" data-open={open}>
      <div className="mat-layer-header">
        <button
          type="button"
          className="mat-layer-toggle"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
        >
          <i className="ti ti-chevron-right chevron"></i>
          <span className="mat-layer-icon">{icon}</span>
          <span className="mat-layer-name">{name}</span>
        </button>
        {action && <div className="mat-layer-action">{action}</div>}
      </div>
      {open && <div className="mat-layer-body">{children}</div>}
    </div>
  );
}

// Trash affordance on a layer header. Color and Lighting are mandatory in the
// store (removeMaterialLayer refuses them), so the button stays disabled with an
// explanatory tooltip — same behaviour as before, just restyled.
function LayerDeleteButton({ title }: { title: string }) {
  return (
    <button type="button" className="mat-icon-btn" disabled title={title} aria-label={title}>
      <i className="ti ti-trash"></i>
    </button>
  );
}

// Compound swatch + hex control that sits in the control column of a standard
// label/control row (the shared Slider/Select/Switch render the same `.prop` row,
// so everything lines up on the shared label width).
function ColorSwatchField({
  label,
  value,
  mixed,
  onChange,
}: {
  label: string;
  value: string;
  mixed: boolean;
  onChange: (color: string) => void;
}) {
  const [localValue, setLocalValue] = useState(value);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const hexRegex = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/;

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/^#+/, "");
    val = val.length > 0 ? "#" + val : "#";
    setLocalValue(val);
    if (hexRegex.test(val)) onChange(val);
  };

  const handleBlur = () => {
    if (!hexRegex.test(localValue)) setLocalValue(value);
  };

  return (
    <div className="prop">
      <span className="prop-label">{label}</span>
      <div className="inspector-color-field">
        <div
          className="inspector-color-swatch"
          style={{ background: mixed ? "repeating-linear-gradient(45deg, #444 0 4px, #666 4px 8px)" : value }}
        >
          <input
            type="color"
            value={mixed ? "#ffffff" : value}
            onChange={(e) => {
              setLocalValue(e.target.value);
              onChange(e.target.value);
            }}
            aria-label={`${label} picker`}
          />
        </div>
        <input
          type="text"
          className="hex-input"
          value={mixed ? "Mixed" : localValue}
          onChange={handleTextChange}
          onBlur={handleBlur}
          onFocus={(e) => e.currentTarget.select()}
          aria-label={`${label} hex value`}
        />
      </div>
    </div>
  );
}

// ─── Image layers ────────────────────────────────────────────────────────────

// Labelled "Base Color" (not "Color") so an image row reads distinctly from the
// Color layer above it in the stack.
const IMAGE_SLOT_LABELS: Record<ImageSlot, string> = {
  color: "Base Color",
  normal: "Normal",
  metallicRoughness: "Metallic / Roughness",
  emissive: "Emissive",
  ao: "Ambient Occlusion",
};

const getImageLayers = (entity: Entity): ImageLayer[] =>
  entity.materialLayers?.filter((layer): layer is ImageLayer => layer.type === "image") ?? [];

// One layer per imported texture map. The thumbnail is loaded lazily from the OPFS
// texture store (the pixels never live in the store), so an object URL is created
// on mount and revoked on unmount. MVP surfacing of what import derived — enabled
// toggle + opacity slider, no from-scratch authoring or projection modes yet.
function ImageLayerRow({
  layer,
  onToggle,
  onOpacity,
}: {
  layer: ImageLayer;
  onToggle: (enabled: boolean) => void;
  onOpacity: (opacity: number) => void;
}) {
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

  const name = IMAGE_SLOT_LABELS[layer.slot];

  return (
    <MaterialLayer
      name={name}
      defaultOpen={false}
      icon={
        <span
          className="mat-layer-thumb"
          style={{ backgroundImage: thumbUrl ? `url(${thumbUrl})` : undefined }}
        />
      }
      action={
        <label className="toggle" title={layer.enabled ? "Hide this map" : "Show this map"}>
          <input
            type="checkbox"
            checked={layer.enabled}
            onChange={(e) => onToggle(e.target.checked)}
            aria-label={`${name} map enabled`}
          />
          <span className="toggle-track" />
        </label>
      }
    >
      <Slider
        label="Opacity"
        min={0}
        max={100}
        step={1}
        value={Math.round(layer.opacity * 100)}
        onChange={(val) => onOpacity(val / 100)}
      />
    </MaterialLayer>
  );
}

// ─── Depth layer ─────────────────────────────────────────────────────────────

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
      <input
        type="number"
        step="0.1"
        min={min}
        value={Number(value.toFixed(2))}
        onChange={(e) => {
          const next = parseFloat(e.target.value);
          if (Number.isFinite(next) && next !== value) onChange(min === undefined ? next : Math.max(min, next));
        }}
        aria-label={label}
      />
    </div>
  );
}

const DEPTH_TYPE_OPTIONS: { label: string; value: DepthLayer["gradientType"] }[] = [
  { label: "Radial", value: "radial" },
  { label: "Linear", value: "linear" },
];

const BLENDING_OPTIONS: { label: string; value: "linear" | "smooth" }[] = [
  { label: "Linear", value: "linear" },
  { label: "Smooth", value: "smooth" },
];

// The Depth layer of one object (utils/depthColors.ts says how it colours). The picked stop is this
// panel's own state; it starts on the first stop for each layer (MaterialsPanel keys it by layer).
function DepthLayerSection({
  layer,
  isEditing,
  onToggleEditing,
  onUpdate,
  onRemove,
}: {
  layer: DepthLayer;
  isEditing: boolean;
  onToggleEditing: () => void;
  onUpdate: (updates: Partial<DepthLayer>) => void;
  onRemove: () => void;
}) {
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
    <MaterialLayer
      name="Depth"
      icon={<i className="ti ti-circles"></i>}
      action={
        <>
          <button
            type="button"
            className={`mat-icon-btn ${isEditing ? "on" : ""}`}
            title={isEditing ? "Stop editing in the viewport (Enter)" : "Edit in the viewport: the gizmo moves the origin"}
            aria-label="Edit the Depth layer in the viewport"
            aria-pressed={isEditing}
            onClick={onToggleEditing}
          >
            <i className="ti ti-pointer"></i>
          </button>
          <button type="button" className="mat-icon-btn" title="Remove the Depth layer" aria-label="Remove the Depth layer" onClick={onRemove}>
            <i className="ti ti-trash"></i>
          </button>
        </>
      }
    >
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
          <ColorSwatchField label="Stop Color" value={stop.color} mixed={false} onChange={(color) => setStop({ color })} />
          <div className="prop">
            <span className="prop-label">Stop Position</span>
            <input
              type="number"
              min={0}
              max={100}
              step={1}
              value={Math.round(stop.position * 100)}
              onChange={(e) => setStop({ position: Math.min(1, Math.max(0, (parseFloat(e.target.value) || 0) / 100)) })}
              aria-label="Stop position"
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
      <Slider
        label="Opacity"
        min={0}
        max={100}
        step={1}
        value={Math.round(layer.opacity * 100)}
        onChange={(val) => onUpdate({ opacity: val / 100 })}
      />
    </MaterialLayer>
  );
}

// ─── Panel ───────────────────────────────────────────────────────────────────

interface MaterialsPanelProps {
  selectedEntities: Entity[];
}

const LIGHTING_MODEL_OPTIONS: { label: string; value: LightingModel }[] = [
  { label: "None", value: "none" },
  { label: "Lambert", value: "lambert" },
  { label: "Phong", value: "phong" },
  { label: "Physical", value: "physical" },
  { label: "Toon", value: "toon" },
];

type AlphaMode = NonNullable<ColorLayer["alphaMode"]>;

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

const getColorLayer = (entity: Entity): ColorLayer | undefined =>
  entity.materialLayers?.find((layer): layer is ColorLayer => layer.type === "color");

const getLightingLayer = (entity: Entity): LightingLayer | undefined =>
  entity.materialLayers?.find((layer): layer is LightingLayer => layer.type === "lighting");

const getDepthLayer = (entity: Entity): DepthLayer | undefined =>
  entity.materialLayers?.find((layer): layer is DepthLayer => layer.type === "depth");

export function MaterialsPanel({ selectedEntities: allSelectedEntities }: MaterialsPanelProps) {
  const updateMultipleEntityMaterialLayers = useEditorStore((state) => state.updateMultipleEntityMaterialLayers);
  const updateMaterialLayer = useEditorStore((state) => state.updateMaterialLayer);
  const addMaterialLayer = useEditorStore((state) => state.addMaterialLayer);
  const removeMaterialLayer = useEditorStore((state) => state.removeMaterialLayer);
  const depthEdit = useEditorStore((state) => state.depthEdit);
  const setDepthEdit = useEditorStore((state) => state.setDepthEdit);

  // Imported meshes now carry derived materialLayers, so they belong here too —
  // only the layer stack existing matters, not the entity type. Directional lights
  // (no material) and import nodes still awaiting their backfill are excluded.
  const selectedEntities = allSelectedEntities.filter((e) => e.type !== "directionalLight" && e.materialLayers);
  if (selectedEntities.length === 0) return null;

  // Image layers are surfaced only on a single selection — one texture stack per
  // mesh, no meaningful "mixed" merge across a multi-select the way Color/Lighting has.
  const imageLayers = selectedEntities.length === 1 ? getImageLayers(selectedEntities[0]) : [];
  // The Depth layer too: its ramp and origin are one object's.
  const depthLayer = selectedEntities.length === 1 ? getDepthLayer(selectedEntities[0]) : undefined;
  const entitiesMissingDepth = selectedEntities.filter((e) => !getDepthLayer(e));

  const colorLayers = selectedEntities.map((e) => ({ entity: e, layer: getColorLayer(e) })).filter((x) => x.layer);
  const lightingLayers = selectedEntities.map((e) => ({ entity: e, layer: getLightingLayer(e) })).filter((x) => x.layer);

  // Every entity normally carries both mandatory layers, so these are empty and
  // the add buttons stay disabled; if a stack is ever missing one, the button
  // becomes the way to restore it.
  const entitiesMissingColor = selectedEntities.filter((e) => !getColorLayer(e));
  const entitiesMissingLighting = selectedEntities.filter((e) => !getLightingLayer(e));

  const firstColor = colorLayers[0]?.layer as ColorLayer | undefined;
  const firstLighting = lightingLayers[0]?.layer as LightingLayer | undefined;

  const colorMixed = colorLayers.some(({ layer }) => (layer as ColorLayer).color !== firstColor?.color);
  const colorOpacityMixed = colorLayers.some(({ layer }) => (layer as ColorLayer).opacity !== firstColor?.opacity);
  const modelMixed = lightingLayers.some(({ layer }) => (layer as LightingLayer).model !== firstLighting?.model);
  const emissiveMixed = lightingLayers.some(({ layer }) => (layer as LightingLayer).emissive !== firstLighting?.emissive);

  // alphaMode/doubleSided are optional (primitives predate them) -- fall back to
  // the glTF defaults (OPAQUE / single-sided) so the controls always show a value.
  const firstAlphaMode: AlphaMode = firstColor?.alphaMode ?? "OPAQUE";
  const firstDoubleSided = firstColor?.doubleSided ?? false;
  const alphaModeMixed = colorLayers.some(({ layer }) => ((layer as ColorLayer).alphaMode ?? "OPAQUE") !== firstAlphaMode);
  const doubleSidedMixed = colorLayers.some(({ layer }) => ((layer as ColorLayer).doubleSided ?? false) !== firstDoubleSided);

  const applyColorUpdate = (updates: Partial<ColorLayer>) => {
    const updatesMap: Record<string, { layerId: string; updates: Partial<MaterialLayerData> }> = {};
    colorLayers.forEach(({ entity, layer }) => {
      updatesMap[entity.id] = { layerId: (layer as ColorLayer).id, updates };
    });
    updateMultipleEntityMaterialLayers(updatesMap);
  };

  const applyLightingUpdate = (updates: Partial<LightingLayer>) => {
    const updatesMap: Record<string, { layerId: string; updates: Partial<MaterialLayerData> }> = {};
    lightingLayers.forEach(({ entity, layer }) => {
      updatesMap[entity.id] = { layerId: (layer as LightingLayer).id, updates };
    });
    updateMultipleEntityMaterialLayers(updatesMap);
  };

  return (
    <PanelSection title="Materials" defaultOpen={true}>
      <div className="material-layer-stack">
        {/* Color layer */}
        {firstColor && (
          <MaterialLayer
            name="Color"
            icon={<i className="ti ti-palette"></i>}
            action={<LayerDeleteButton title="Color is a mandatory layer" />}
          >
            <ColorSwatchField
              label="Color"
              value={firstColor.color ?? "#ffffff"}
              mixed={colorMixed}
              onChange={(color) => applyColorUpdate({ color })}
            />
            <Slider
              label="Opacity"
              min={0}
              max={100}
              step={1}
              value={Math.round((colorOpacityMixed ? 1 : firstColor.opacity ?? 1) * 100)}
              onChange={(val) => applyColorUpdate({ opacity: val / 100 })}
            />
            <Select
              label="Alpha Mode"
              options={alphaModeMixed ? [{ label: "Mixed", value: "" }, ...ALPHA_MODE_OPTIONS] : ALPHA_MODE_OPTIONS}
              value={alphaModeMixed ? "" : firstAlphaMode}
              onChange={(val) => {
                if (!val) return;
                // Seed a sensible cutoff when entering Mask so an alpha-tested
                // cutout has something to test against immediately.
                const updates: Partial<ColorLayer> =
                  val === "MASK"
                    ? { alphaMode: "MASK", alphaCutoff: firstColor.alphaCutoff ?? 0.5 }
                    : { alphaMode: val as AlphaMode };
                applyColorUpdate(updates);
              }}
            />
            {!alphaModeMixed && firstAlphaMode === "MASK" && (
              <Slider
                label="Alpha Cutoff"
                min={0}
                max={1}
                step={0.01}
                value={firstColor.alphaCutoff ?? 0.5}
                onChange={(val) => applyColorUpdate({ alphaCutoff: val })}
              />
            )}
            <Switch
              label="Double Sided"
              checked={doubleSidedMixed ? false : firstDoubleSided}
              onChange={(val) => applyColorUpdate({ doubleSided: val })}
            />
          </MaterialLayer>
        )}

        {/* Lighting layer */}
        {firstLighting && (
          <MaterialLayer
            name="Lighting"
            icon={<i className="ti ti-bulb"></i>}
            action={<LayerDeleteButton title="Lighting is a mandatory layer" />}
          >
            <Select
              label="Model"
              options={modelMixed ? [{ label: "Mixed", value: "" }, ...LIGHTING_MODEL_OPTIONS] : LIGHTING_MODEL_OPTIONS}
              value={modelMixed ? "" : (firstLighting.model ?? "physical")}
              onChange={(val) => {
                if (!val) return;
                applyLightingUpdate({ model: val as LightingModel });
              }}
            />

            {!modelMixed && firstLighting.model !== "none" && (
              <>
                {firstLighting.model === "physical" && (
                  <>
                    <Slider
                      label="Roughness"
                      min={0}
                      max={1}
                      step={0.01}
                      value={firstLighting.roughness ?? 0.45}
                      onChange={(val) => applyLightingUpdate({ roughness: val })}
                    />
                    <Slider
                      label="Metalness"
                      min={0}
                      max={1}
                      step={0.01}
                      value={firstLighting.metalness ?? 0.08}
                      onChange={(val) => applyLightingUpdate({ metalness: val })}
                    />
                    <Slider
                      label="Clearcoat"
                      min={0}
                      max={1}
                      step={0.01}
                      value={firstLighting.clearcoat ?? 0}
                      onChange={(val) => applyLightingUpdate({ clearcoat: val })}
                    />
                    {(firstLighting.clearcoat ?? 0) > 0 && (
                      <Slider
                        label="Coat Rough."
                        min={0}
                        max={1}
                        step={0.01}
                        value={firstLighting.clearcoatRoughness ?? 0}
                        onChange={(val) => applyLightingUpdate({ clearcoatRoughness: val })}
                      />
                    )}
                  </>
                )}

                {firstLighting.model === "phong" && (
                  <Slider
                    label="Shininess"
                    min={0}
                    max={100}
                    step={1}
                    value={firstLighting.shininess ?? 30}
                    onChange={(val) => applyLightingUpdate({ shininess: val })}
                  />
                )}

                <ColorSwatchField
                  label="Emissive"
                  value={firstLighting.emissive ?? "#000000"}
                  mixed={emissiveMixed}
                  onChange={(color) => applyLightingUpdate({ emissive: color })}
                />
                <Slider
                  label="Emissive Int."
                  min={0}
                  max={5}
                  step={0.1}
                  value={firstLighting.emissiveIntensity ?? 1}
                  onChange={(val) => applyLightingUpdate({ emissiveIntensity: val })}
                />
              </>
            )}
          </MaterialLayer>
        )}

        {depthLayer && (
          <DepthLayerSection
            key={depthLayer.id}
            layer={depthLayer}
            isEditing={depthEdit === selectedEntities[0].id}
            onToggleEditing={() => (depthEdit === selectedEntities[0].id ? setDepthEdit(null) : editDepth(selectedEntities[0].id))}
            onUpdate={(updates) => updateMaterialLayer(selectedEntities[0].id, depthLayer.id, updates)}
            onRemove={() => removeMaterialLayer(selectedEntities[0].id, depthLayer.id)}
          />
        )}

        {/* Image layers — one per texture map derived from an imported material */}
        {imageLayers.map((layer) => (
          <ImageLayerRow
            key={layer.id}
            layer={layer}
            onToggle={(enabled) => updateMaterialLayer(selectedEntities[0].id, layer.id, { enabled })}
            onOpacity={(opacity) => updateMaterialLayer(selectedEntities[0].id, layer.id, { opacity })}
          />
        ))}

        {/* Add-layer actions (scaffolding for future layer types) */}
        <div className="mat-layer-add">
          <button
            type="button"
            className="mat-add-btn"
            disabled={entitiesMissingColor.length === 0}
            title={entitiesMissingColor.length === 0 ? "Color layer already present" : "Add a Color layer"}
            onClick={() => entitiesMissingColor.forEach((e) => addMaterialLayer(e.id, "color"))}
          >
            <i className="ti ti-plus"></i>
            <span>Color</span>
          </button>
          <button
            type="button"
            className="mat-add-btn"
            disabled={entitiesMissingLighting.length === 0}
            title={entitiesMissingLighting.length === 0 ? "Lighting layer already present" : "Add a Lighting layer"}
            onClick={() => entitiesMissingLighting.forEach((e) => addMaterialLayer(e.id, "lighting"))}
          >
            <i className="ti ti-plus"></i>
            <span>Lighting</span>
          </button>
          <button
            type="button"
            className="mat-add-btn"
            disabled={entitiesMissingDepth.length === 0}
            title={entitiesMissingDepth.length === 0 ? "Depth layer already present" : "Add a Depth layer: colours by distance from a point"}
            onClick={() => {
              entitiesMissingDepth.forEach((e) => addMaterialLayer(e.id, "depth"));
              // One object's new layer opens for editing in the viewport.
              if (selectedEntities.length === 1) editDepth(selectedEntities[0].id);
            }}
          >
            <i className="ti ti-plus"></i>
            <span>Depth</span>
          </button>
        </div>
      </div>
    </PanelSection>
  );
}
