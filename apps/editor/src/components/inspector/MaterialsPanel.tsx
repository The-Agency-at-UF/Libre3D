import { useState, useEffect } from "react";
import {
  useEditorStore,
  type Entity,
  type ColorLayer,
  type LightingLayer,
  type LightingModel,
  type MaterialLayer,
  type ImageLayer,
  type ImageSlot,
} from "../../store/useEditorStore";
import { loadTextureAsset } from "../../utils/textureAssetStore";
import { PanelSection } from "../ui/PanelSection";
import { Slider } from "../ui/Slider";
import { Select } from "../ui/Select";
import { Switch } from "../ui/Switch";

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

// One row per imported texture map. The thumbnail is loaded lazily from the OPFS
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
    loadTextureAsset(layer.textureAssetId)
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
    <details className="nested">
      <summary className="nested-header">
        <div className="nested-label">
          <i className="ti ti-chevron-right chevron"></i>
          <div
            className="inspector-color-swatch"
            style={{
              width: 20,
              height: 20,
              backgroundImage: thumbUrl ? `url(${thumbUrl})` : undefined,
              backgroundColor: thumbUrl ? undefined : "var(--bg-inset)",
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          />
          <span>{IMAGE_SLOT_LABELS[layer.slot]}</span>
        </div>
        <input
          type="checkbox"
          checked={layer.enabled}
          onChange={(e) => onToggle(e.target.checked)}
          onClick={(e) => e.stopPropagation()}
          title={layer.enabled ? "Hide this map" : "Show this map"}
          aria-label={`${IMAGE_SLOT_LABELS[layer.slot]} map enabled`}
        />
      </summary>
      <div className="nested-body">
        <Slider
          label="Opacity"
          min={0}
          max={100}
          step={1}
          value={Math.round(layer.opacity * 100)}
          onChange={(val) => onOpacity(val / 100)}
        />
      </div>
    </details>
  );
}

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
    <div className="prop prop--stacked">
      <span className="prop-label">{label}</span>
      <div className="inspector-color-field">
        <div className="inspector-color-swatch" style={{ background: mixed ? "repeating-linear-gradient(45deg, #444 0 4px, #666 4px 8px)" : value }}>
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
          style={{ padding: "5px 8px" }}
          aria-label={`${label} hex value`}
        />
      </div>
    </div>
  );
}

export function MaterialsPanel({ selectedEntities: allSelectedEntities }: MaterialsPanelProps) {
  const updateMultipleEntityMaterialLayers = useEditorStore((state) => state.updateMultipleEntityMaterialLayers);
  const updateMaterialLayer = useEditorStore((state) => state.updateMaterialLayer);

  // Imported meshes now carry derived materialLayers, so they belong here too —
  // only the layer stack existing matters, not the entity type. Directional lights
  // (no material) and import nodes still awaiting their backfill are excluded.
  const selectedEntities = allSelectedEntities.filter((e) => e.type !== "directionalLight" && e.materialLayers);
  if (selectedEntities.length === 0) return null;

  // Image layers are surfaced only on a single selection — one texture stack per
  // mesh, no meaningful "mixed" merge across a multi-select the way Color/Lighting has.
  const imageLayers = selectedEntities.length === 1 ? getImageLayers(selectedEntities[0]) : [];

  const colorLayers = selectedEntities.map((e) => ({ entity: e, layer: getColorLayer(e) })).filter((x) => x.layer);
  const lightingLayers = selectedEntities.map((e) => ({ entity: e, layer: getLightingLayer(e) })).filter((x) => x.layer);

  const firstColor = colorLayers[0]?.layer as ColorLayer | undefined;
  const firstLighting = lightingLayers[0]?.layer as LightingLayer | undefined;

  const colorMixed = colorLayers.some(({ layer }) => (layer as ColorLayer).color !== firstColor?.color);
  const colorOpacityMixed = colorLayers.some(({ layer }) => (layer as ColorLayer).opacity !== firstColor?.opacity);
  const modelMixed = lightingLayers.some(({ layer }) => (layer as LightingLayer).model !== firstLighting?.model);

  // alphaMode/doubleSided are optional (primitives predate them) -- fall back to
  // the glTF defaults (OPAQUE / single-sided) so the controls always show a value.
  const firstAlphaMode: AlphaMode = firstColor?.alphaMode ?? "OPAQUE";
  const firstDoubleSided = firstColor?.doubleSided ?? false;
  const alphaModeMixed = colorLayers.some(({ layer }) => ((layer as ColorLayer).alphaMode ?? "OPAQUE") !== firstAlphaMode);
  const doubleSidedMixed = colorLayers.some(({ layer }) => ((layer as ColorLayer).doubleSided ?? false) !== firstDoubleSided);

  const applyColorUpdate = (updates: Partial<ColorLayer>) => {
    const updatesMap: Record<string, { layerId: string; updates: Partial<MaterialLayer> }> = {};
    colorLayers.forEach(({ entity, layer }) => {
      updatesMap[entity.id] = { layerId: (layer as ColorLayer).id, updates };
    });
    updateMultipleEntityMaterialLayers(updatesMap);
  };

  const applyLightingUpdate = (updates: Partial<LightingLayer>) => {
    const updatesMap: Record<string, { layerId: string; updates: Partial<MaterialLayer> }> = {};
    lightingLayers.forEach(({ entity, layer }) => {
      updatesMap[entity.id] = { layerId: (layer as LightingLayer).id, updates };
    });
    updateMultipleEntityMaterialLayers(updatesMap);
  };

  return (
    <PanelSection title="Materials" defaultOpen={true}>
      <div className="material-layer-stack">
        {/* Color Layer */}
        <details className="nested" open>
          <summary className="nested-header">
            <div className="nested-label">
              <i className="ti ti-chevron-right chevron"></i>
              <i className="ti ti-palette"></i>
              <span>Color</span>
            </div>
            <button
              type="button"
              disabled
              title="Color is a mandatory layer"
              style={{
                background: "transparent",
                border: "none",
                color: "var(--text-tertiary)",
                cursor: "not-allowed",
                opacity: 0.4,
                padding: "2px 4px",
              }}
            >
              <i className="ti ti-trash"></i>
            </button>
          </summary>
          <div className="nested-body">
            <ColorSwatchField
              label="Color"
              value={firstColor?.color ?? "#ffffff"}
              mixed={colorMixed}
              onChange={(color) => applyColorUpdate({ color })}
            />
            <Slider
              label="Opacity"
              min={0}
              max={100}
              step={1}
              value={Math.round((colorOpacityMixed ? 1 : firstColor?.opacity ?? 1) * 100)}
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
                    ? { alphaMode: "MASK", alphaCutoff: firstColor?.alphaCutoff ?? 0.5 }
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
                value={firstColor?.alphaCutoff ?? 0.5}
                onChange={(val) => applyColorUpdate({ alphaCutoff: val })}
              />
            )}
            <Switch
              label="Double Sided"
              checked={doubleSidedMixed ? false : firstDoubleSided}
              onChange={(val) => applyColorUpdate({ doubleSided: val })}
            />
          </div>
        </details>

        {/* Lighting Layer */}
        <details className="nested" open>
          <summary className="nested-header">
            <div className="nested-label">
              <i className="ti ti-chevron-right chevron"></i>
              <i className="ti ti-bulb"></i>
              <span>Lighting</span>
            </div>
            <button
              type="button"
              disabled
              title="Lighting is a mandatory layer"
              style={{
                background: "transparent",
                border: "none",
                color: "var(--text-tertiary)",
                cursor: "not-allowed",
                opacity: 0.4,
                padding: "2px 4px",
              }}
            >
              <i className="ti ti-trash"></i>
            </button>
          </summary>
          <div className="nested-body">
            <Select
              label="Model"
              options={modelMixed ? [{ label: "Mixed", value: "" }, ...LIGHTING_MODEL_OPTIONS] : LIGHTING_MODEL_OPTIONS}
              value={modelMixed ? "" : (firstLighting?.model ?? "physical")}
              onChange={(val) => {
                if (!val) return;
                applyLightingUpdate({ model: val as LightingModel });
              }}
            />

            {!modelMixed && firstLighting?.model !== "none" && (
              <>
                {firstLighting?.model === "physical" && (
                  <>
                    <Slider
                      label="Roughness"
                      min={0}
                      max={1}
                      step={0.01}
                      value={firstLighting?.roughness ?? 0.45}
                      onChange={(val) => applyLightingUpdate({ roughness: val })}
                    />
                    <Slider
                      label="Metalness"
                      min={0}
                      max={1}
                      step={0.01}
                      value={firstLighting?.metalness ?? 0.08}
                      onChange={(val) => applyLightingUpdate({ metalness: val })}
                    />
                  </>
                )}

                {firstLighting?.model === "phong" && (
                  <Slider
                    label="Shininess"
                    min={0}
                    max={100}
                    step={1}
                    value={firstLighting?.shininess ?? 30}
                    onChange={(val) => applyLightingUpdate({ shininess: val })}
                  />
                )}

                <ColorSwatchField
                  label="Emissive"
                  value={firstLighting?.emissive ?? "#000000"}
                  mixed={lightingLayers.some(({ layer }) => (layer as LightingLayer).emissive !== firstLighting?.emissive)}
                  onChange={(color) => applyLightingUpdate({ emissive: color })}
                />
                <Slider
                  label="Emissive Intensity"
                  min={0}
                  max={5}
                  step={0.1}
                  value={firstLighting?.emissiveIntensity ?? 1}
                  onChange={(val) => applyLightingUpdate({ emissiveIntensity: val })}
                />
              </>
            )}
          </div>
        </details>

        {/* Image Layers — one per texture map derived from an imported material */}
        {imageLayers.map((layer) => (
          <ImageLayerRow
            key={layer.id}
            layer={layer}
            onToggle={(enabled) => updateMaterialLayer(selectedEntities[0].id, layer.id, { enabled })}
            onOpacity={(opacity) => updateMaterialLayer(selectedEntities[0].id, layer.id, { opacity })}
          />
        ))}

        {/* Add Layer affordance (scaffolding for future layer types) */}
        <div className="section-footer">
          <button className="footer-btn" disabled title="Color layer already present">
            <i className="ti ti-plus"></i>
            <span>Color</span>
          </button>
          <button className="footer-btn" disabled title="Lighting layer already present">
            <i className="ti ti-plus"></i>
            <span>Lighting</span>
          </button>
        </div>
      </div>
    </PanelSection>
  );
}
