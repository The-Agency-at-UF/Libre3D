/**
 * PURPOSE: The settings of each kind of material layer, as the Materials panel's drawer shows them
 * (MaterialsPanel.tsx, LayerDrawer): one component per layer type, and the label / control rows
 * they're made of.
 */

import { useEffect, useState } from "react";
import { useEditorStore, type ColorLayer, type DepthLayer, type FresnelLayer, type GradientLayer, type ImageLayer, type NoiseLayer, type NoiseType, type VoronoiStyle, type LightingLayer, type LightingModel } from "../../store/useEditorStore";
import { DEFAULT_METALNESS, DEFAULT_ROUGHNESS } from "../../scene/layers";
import { loadTextureForScene } from "../../utils/assetTransfers";
import { editDepth } from "../../viewport/hooks/useViewportDepthGizmo";
import { ColorField } from "../ui/ColorField";
import { ColorPicker, type ColorChange } from "../ui/ColorPicker";
import { NumberField } from "../ui/NumberField";
import { Select } from "../ui/Select";
import { Slider } from "../ui/Slider";
import { Switch } from "../ui/Switch";
import { RampEditor } from "./RampEditor";
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

const GRADIENT_TYPE_OPTIONS: { label: string; value: GradientLayer["gradientType"] }[] = [
  { label: "Linear", value: "linear" },
  { label: "Radial", value: "radial" },
  { label: "Polar", value: "polar" },
];

const NOISE_TYPE_OPTIONS: { label: string; value: NoiseType }[] = [
  { label: "Simplex", value: "simplex" },
  { label: "Simplex Fractal", value: "simplexFractal" },
  { label: "Perlin", value: "perlin" },
  { label: "FBM", value: "fbm" },
  { label: "Voronoi", value: "voronoi" },
];

const VORONOI_STYLE_OPTIONS: { label: string; value: VoronoiStyle }[] = [
  { label: "F1", value: "f1" },
  { label: "F2", value: "f2" },
  { label: "F2 − F1", value: "f2MinusF1" },
  { label: "Smooth Blend", value: "smoothBlend" },
  { label: "Edge", value: "edge" },
];

const ORIGIN_OPTIONS: { label: string; value: "vector" | "camera" }[] = [
  { label: "Vector", value: "vector" },
  { label: "Camera", value: "camera" },
];

const SPACE_OPTIONS: { label: string; value: "local" | "world" }[] = [
  { label: "Local", value: "local" },
  { label: "World", value: "world" },
];

const MODE_OPTIONS: { label: string; value: "mask" | "color" }[] = [
  { label: "Mask", value: "mask" },
  { label: "Color", value: "color" },
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

export function NumberRow({
  label,
  value,
  min,
  max,
  step,
  onChange,
}: {
  label: string;
  value: number | null;
  min?: number;
  max?: number;
  step?: number;
  onChange: (value: number) => void;
}) {
  return (
    <div className="prop">
      <span className="prop-label">{label}</span>
      <NumberField className="drawer-number" label={label} value={value} min={min} max={max} step={step} onChange={onChange} />
    </div>
  );
}

/** Two or three numbers in a row, each with its letter (X Y Z, as Spline's), in a label/control row. */
export function AxesRow({
  label,
  axes,
  values,
  step,
  onChange,
}: {
  label: string;
  axes: string[];
  values: readonly number[];
  step?: number;
  onChange: (axis: number, value: number) => void;
}) {
  return (
    <div className="prop">
      <span className="prop-label">{label}</span>
      <div className="axes-row">
        {axes.map((axis, index) => (
          <label key={index} className="axes-row-field">
            <span>{axis}</span>
            <NumberField label={`${label} ${axis}`} value={values[index]} step={step} onChange={(value) => onChange(index, value)} />
          </label>
        ))}
      </div>
    </div>
  );
}

/**
 * A maskable layer's Mode (Spline's Layer Masking): Color paints; Mask paints nothing and shows the
 * one layer right under it only where this one is light.
 */
export function ModeRow({ row }: { row: LayerRowData }) {
  const update = useRowUpdate(row);
  const masked = row.pairs[0].layer.mask === true;
  return (
    <>
      <SegmentedRow label="Mode" options={MODE_OPTIONS} value={masked ? "mask" : "color"} onChange={(mode) => update({ mask: mode === "mask" })} />
      <div className="mat-drawer-divider" />
    </>
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

// A Depth layer, as Spline's drawer has it. The picked ramp stop is this drawer's own state; it
// starts on the first stop for each layer (the drawer is keyed by layer). Several objects with the
// same stack take the first one's values for what's changed; the viewport's handles are one
// object's.
export function DepthSettings({ row }: { row: LayerRowData }) {
  const update = useRowUpdate(row);
  const depthEdit = useEditorStore((state) => state.depthEdit);
  const setDepthEdit = useEditorStore((state) => state.setDepthEdit);
  const layer = row.pairs[0].layer as DepthLayer;
  const single = row.pairs.length === 1 ? row.pairs[0].entity : null;
  const [selected, setSelected] = useState(0);
  const camera = layer.originType === "camera";
  const isEditing = !!single && depthEdit === single.id;

  const setAxis = (key: "origin" | "direction", axis: number, value: number) => {
    if (value === layer[key][axis]) return;
    const next: [number, number, number] = [...layer[key]];
    next[axis] = value;
    update({ [key]: next });
  };

  return (
    <>
      <ModeRow row={row} />
      <SegmentedRow
        label="Origin"
        options={ORIGIN_OPTIONS}
        value={camera ? "camera" : "vector"}
        onChange={(originType) => {
          if (originType === "camera" && isEditing) setDepthEdit(null);
          update({ originType });
        }}
      />
      <SegmentedRow label="Blending" options={BLENDING_OPTIONS} value={layer.smooth ? "smooth" : "linear"} onChange={(value) => update({ smooth: value === "smooth" })} />
      <RampEditor stops={layer.stops} smooth={layer.smooth} selected={selected} onSelect={setSelected} onChange={(stops) => update({ stops })} />
      <Select label="Type" options={DEPTH_TYPE_OPTIONS} value={layer.gradientType} onChange={(value) => update({ gradientType: value as DepthLayer["gradientType"] })} />
      {!camera && (
        <>
          <SegmentedRow label="Position" options={SPACE_OPTIONS} value={layer.space ?? "local"} onChange={(space) => update({ space })} />
          <AxesRow label="Origin" axes={["X", "Y", "Z"]} values={layer.origin} onChange={(axis, value) => setAxis("origin", axis, value)} />
          {layer.gradientType === "linear" && (
            <AxesRow label="Direction" axes={["X", "Y", "Z"]} values={layer.direction} onChange={(axis, value) => setAxis("direction", axis, value)} />
          )}
        </>
      )}
      <NumberRow label="Near" value={layer.near} min={0} onChange={(near) => update({ near })} />
      <NumberRow label="Far" value={layer.far} min={0} onChange={(far) => update({ far })} />
      {!camera && single && (
        <div className="prop">
          <span className="prop-label">Viewport</span>
          <button
            type="button"
            className={`mat-drawer-btn ${isEditing ? "on" : ""}`}
            title={isEditing ? "Stop editing in the viewport (Enter)" : "Edit in the viewport: the gizmo moves the origin"}
            aria-pressed={isEditing}
            onClick={() => (isEditing ? setDepthEdit(null) : editDepth(single.id, layer.id))}
          >
            <i className="ti ti-pointer"></i>
            <span>{isEditing ? "Editing" : "Edit"}</span>
          </button>
        </div>
      )}
    </>
  );
}

// A Gradient layer, as Spline's: a ramp across the object's UVs (scene/layerStack.ts, gradientPosition).
export function GradientSettings({ row }: { row: LayerRowData }) {
  const update = useRowUpdate(row);
  const layer = row.pairs[0].layer as GradientLayer;
  const [selected, setSelected] = useState(0);
  const setPair = (key: "offset" | "morph", axis: number, value: number) => {
    if (value === layer[key][axis]) return;
    const next: [number, number] = [...layer[key]];
    next[axis] = value;
    update({ [key]: next });
  };
  return (
    <>
      <ModeRow row={row} />
      <Select label="Type" options={GRADIENT_TYPE_OPTIONS} value={layer.gradientType} onChange={(value) => update({ gradientType: value as GradientLayer["gradientType"] })} />
      <SegmentedRow label="Blending" options={BLENDING_OPTIONS} value={layer.smooth ? "smooth" : "linear"} onChange={(value) => update({ smooth: value === "smooth" })} />
      <RampEditor stops={layer.stops} smooth={layer.smooth} selected={selected} onSelect={setSelected} onChange={(stops) => update({ stops })} />
      <div className="prop">
        <span className="prop-label ramp-label">
          Angle
          <button
            type="button"
            className="mat-icon-btn ramp-reverse"
            title="Turn it a quarter turn"
            aria-label="Turn the gradient a quarter turn"
            onClick={() => update({ angle: (Math.round(layer.angle / 90) * 90 + 90) % 360 })}
          >
            <i className="ti ti-rotate-clockwise"></i>
          </button>
        </span>
        <div className="axes-row">
          <label className="axes-row-field">
            <span>A</span>
            <NumberField label="Angle (degrees)" value={layer.angle} step={1} onChange={(angle) => update({ angle })} />
          </label>
        </div>
      </div>
      <AxesRow label="↳ Offset" axes={["X", "Y"]} values={layer.offset} step={0.01} onChange={(axis, value) => setPair("offset", axis, value)} />
      <AxesRow label="↳ Morph" axes={["X", "Y"]} values={layer.morph} step={0.01} onChange={(axis, value) => setPair("morph", axis, value)} />
    </>
  );
}

// A Noise layer, as Spline's: a warped 3D noise in the object's own space, coloured between four
// colours (viewport/layerSources.ts says how). Voronoi has its cells' style, smoothness and seed.
export function NoiseSettings({ row }: { row: LayerRowData }) {
  const update = useRowUpdate(row);
  const layer = row.pairs[0].layer as NoiseLayer;
  const setAxis = <K extends "size" | "distortion" | "factorA" | "factorB">(key: K, axis: number, value: number) => {
    if (value === layer[key][axis]) return;
    const next = [...layer[key]] as NoiseLayer[K];
    next[axis] = value;
    update({ [key]: next });
  };
  const setColor = (index: number, change: ColorChange) => {
    const colors = layer.colors.map((each, i) => (i === index ? { ...each, ...(change.color !== undefined ? { color: change.color } : { alpha: change.alpha }) } : each));
    update({ colors: colors as NoiseLayer["colors"] });
  };
  const voronoi = layer.noiseType === "voronoi";
  return (
    <>
      <ModeRow row={row} />
      <Select label="Type" options={NOISE_TYPE_OPTIONS} value={layer.noiseType} onChange={(value) => update({ noiseType: value as NoiseType })} />
      {voronoi && <Select label="Style" options={VORONOI_STYLE_OPTIONS} value={layer.voronoiStyle} onChange={(value) => update({ voronoiStyle: value as VoronoiStyle })} />}
      <AxesRow label="Size" axes={["X", "Y", "Z"]} values={layer.size} step={0.1} onChange={(axis, value) => setAxis("size", axis, value)} />
      <AxesRow label="Scale" axes={["S"]} values={[layer.scale]} step={0.1} onChange={(_, scale) => update({ scale })} />
      <AxesRow label="Movement" axes={["M"]} values={[layer.movement]} step={0.1} onChange={(_, movement) => update({ movement })} />
      {layer.colors.map((color, index) => (
        <ColorField key={index} label="Color" color={color.color} alpha={color.alpha ?? 1} onChange={(change) => setColor(index, change)} />
      ))}
      <AxesRow label="Distortion" axes={["X", "Y"]} values={layer.distortion} step={0.1} onChange={(axis, value) => setAxis("distortion", axis, value)} />
      <AxesRow label="FactorA" axes={["X", "Y"]} values={layer.factorA} step={0.1} onChange={(axis, value) => setAxis("factorA", axis, value)} />
      <AxesRow label="FactorB" axes={["X", "Y"]} values={layer.factorB} step={0.1} onChange={(axis, value) => setAxis("factorB", axis, value)} />
      {voronoi && <NumberRow label="Smoothness" value={layer.smoothness} min={0} max={1} step={0.05} onChange={(smoothness) => update({ smoothness })} />}
      <NumberRow label="Seed" value={layer.seed} step={1} onChange={(seed) => update({ seed })} />
      <NumberRow label="Low Cut" value={layer.lowCut} min={0} max={1} step={0.05} onChange={(lowCut) => update({ lowCut })} />
      <NumberRow label="High Cut" value={layer.highCut} min={0} max={1} step={0.05} onChange={(highCut) => update({ highCut })} />
    </>
  );
}

// A Fresnel layer, as Spline's: its colour where the surface turns away from the camera, as much as
// clamp(bias + scale * (1 - |N·V|)^intensity) * factor. Over Lighting it glows.
export function FresnelSettings({ row }: { row: LayerRowData }) {
  const update = useRowUpdate(row);
  const layer = row.pairs[0].layer as FresnelLayer;
  return (
    <>
      <ModeRow row={row} />
      <ColorField label="Color" color={layer.color} alpha={layer.alpha ?? 1} onChange={(change) => update(change.color !== undefined ? { color: change.color } : { alpha: change.alpha })} />
      <Slider label="Bias" min={0} max={1} step={0.01} value={layer.bias} onChange={(bias) => update({ bias })} />
      <NumberRow label="Scale" value={layer.scale} step={0.1} onChange={(scale) => update({ scale })} />
      <NumberRow label="Intensity" value={layer.intensity} min={0} step={0.1} onChange={(intensity) => update({ intensity })} />
      <NumberRow label="Factor" value={layer.factor} min={0} step={0.1} onChange={(factor) => update({ factor })} />
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
