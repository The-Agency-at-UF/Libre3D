/**
 * PURPOSE: The settings of each kind of material layer, as the Materials panel's drawer shows them
 * (MaterialsPanel.tsx, LayerDrawer): one component per layer type, and the label / control rows
 * they're made of.
 */

import { useEffect, useRef, useState } from "react";
import {
  useEditorStore,
  type ColorLayer,
  type DepthLayer,
  type Entity,
  type FresnelLayer,
  type GlassLayer,
  type GradientLayer,
  type ImageLayer,
  type ImageProjection,
  type LightingLayer,
  type LightingMapSlot,
  type LightingModel,
  type MatcapLayer,
  type NoiseLayer,
  type NoiseType,
  type NormalLayer,
  type RainbowLayer,
  type TextureRef,
  type VoronoiStyle,
} from "../../store/useEditorStore";
import { DEFAULT_METALNESS, DEFAULT_ROUGHNESS } from "../../scene/layers";
import { loadTextureForScene } from "../../utils/assetTransfers";
import { importMapFile } from "../../utils/importImage";
import { MATCAP_PRESETS, matcapPixels } from "../../viewport/matcaps";
import { editDepth } from "../../viewport/hooks/useViewportDepthGizmo";
import { ColorField } from "../ui/ColorField";
import { ColorPicker, type ColorChange } from "../ui/ColorPicker";
import { NumberField } from "../ui/NumberField";
import { Select } from "../ui/Select";
import { Slider } from "../ui/Slider";
import { Switch } from "../ui/Switch";
import { RampEditor } from "./RampEditor";
import { useRowUpdate, type LayerRowData } from "./materialRows";

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

// A Lighting layer, as Spline's drawer has it: the type, then what that type has (Phong's
// specular; Physical's roughness, metalness, reflectivity, clearcoat, sheen, iridescence and IOR),
// the emissive glow, the maps (pictures for roughness, metalness, normals, AO, emissive light and
// bumps), and the surface (alpha mode, cutoff, double sided).
export function LightingSettings({ row }: { row: LayerRowData }) {
  const update = useRowUpdate(row);
  const layers = row.pairs.map(({ layer }) => layer as LightingLayer);
  const first = layers[0];
  const mixed = (read: (layer: LightingLayer) => unknown) => layers.some((layer) => read(layer) !== read(first));
  const model = mixed((layer) => layer.model) ? null : first.model;
  const lit = model !== null && model !== "none";
  const physical = model === "physical";
  const alphaMode: AlphaMode = first.alphaMode ?? "OPAQUE";
  const alphaModeMixed = mixed((layer) => layer.alphaMode ?? "OPAQUE");

  return (
    <>
      <Select
        label="Type"
        options={model === null ? [{ label: "Mixed", value: "" }, ...LIGHTING_MODEL_OPTIONS] : LIGHTING_MODEL_OPTIONS}
        value={model ?? ""}
        onChange={(val) => {
          if (val) update({ model: val as LightingModel });
        }}
      />
      {physical && (
        <>
          <MapSelect row={row} slot="roughness" label="Rough Map" />
          <Slider label="Roughness" min={0} max={1} step={0.01} value={first.roughness ?? DEFAULT_ROUGHNESS} onChange={(roughness) => update({ roughness })} />
          <Slider label="Metalness" min={0} max={1} step={0.01} value={first.metalness ?? DEFAULT_METALNESS} onChange={(metalness) => update({ metalness })} />
          <Slider label="Reflectivity" min={0} max={1} step={0.01} value={first.reflectivity ?? 1} onChange={(reflectivity) => update({ reflectivity })} />
          <MapSelect row={row} slot="metalness" label="Metal Map" />
        </>
      )}
      {model === "phong" && (
        <>
          <ColorField label="Specular" color={first.specular ?? "#111111"} mixed={mixed((layer) => layer.specular)} onChange={({ color }) => color && update({ specular: color })} />
          <Slider label="Shininess" min={0} max={100} step={1} value={first.shininess ?? 30} onChange={(shininess) => update({ shininess })} />
        </>
      )}
      {lit && (
        <>
          <MapSelect row={row} slot="normal" label="Normal Map" />
          <MapSelect row={row} slot="ao" label="AO Map" />
          <ColorField label="Emissive" color={first.emissive ?? "#000000"} mixed={mixed((layer) => layer.emissive)} onChange={({ color }) => color && update({ emissive: color })} />
          <MapSelect row={row} slot="emissive" label="Emissive Map" />
          <Slider label="Emissive Int." min={0} max={5} step={0.1} value={first.emissiveIntensity ?? 1} onChange={(emissiveIntensity) => update({ emissiveIntensity })} />
        </>
      )}
      {physical && (
        <>
          <Slider label="Clearcoat" min={0} max={1} step={0.01} value={first.clearcoat ?? 0} onChange={(clearcoat) => update({ clearcoat })} />
          {(first.clearcoat ?? 0) > 0 && (
            <Slider label="Coat Rough." min={0} max={1} step={0.01} value={first.clearcoatRoughness ?? 0} onChange={(clearcoatRoughness) => update({ clearcoatRoughness })} />
          )}
          <Slider label="Sheen" min={0} max={1} step={0.01} value={first.sheen ?? 0} onChange={(sheen) => update({ sheen })} />
          <Slider label="Iridescence" min={0} max={1} step={0.01} value={first.iridescence ?? 0} onChange={(iridescence) => update({ iridescence })} />
          <NumberRow label="IOR" value={first.ior ?? 1.5} min={1} max={2.333} step={0.01} onChange={(ior) => update({ ior })} />
        </>
      )}
      {lit && (
        <>
          <div className="mat-drawer-divider" />
          <MapSelect row={row} slot="bump" label="Bump Map" />
          {first.maps?.bump && <NumberRow label="Bump Strength" value={first.bumpScale ?? 1} min={0} step={0.1} onChange={(bumpScale) => update({ bumpScale })} />}
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

// The pictures objects in the scene use (Image layers and Lighting maps), each once, named for the
// map dropdowns: by its own name (an upload's file name), else the object it's on.
const scenePictures = (entities: Entity[]): Array<TextureRef & { name: string }> => {
  const pictures = new Map<string, TextureRef & { name: string }>();
  for (const entity of entities) {
    for (const layer of entity.materialLayers ?? []) {
      if (layer.type === "image" && !pictures.has(layer.textureAssetId)) {
        pictures.set(layer.textureAssetId, { textureAssetId: layer.textureAssetId, wrapS: layer.wrapS, wrapT: layer.wrapT, flipY: layer.flipY, name: layer.name ?? entity.name });
      }
      if (layer.type !== "lighting") continue;
      for (const [slot, ref] of Object.entries(layer.maps ?? {})) {
        if (ref && !pictures.has(ref.textureAssetId)) pictures.set(ref.textureAssetId, { ...ref, name: ref.name ?? `${entity.name} (${slot})` });
      }
    }
  }
  return [...pictures.values()];
};

const UPLOAD = "upload";

/**
 * One of a Lighting layer's maps: None, a picture already in the scene, or Upload (a PNG or JPEG
 * from the computer, kept with the scene). Every selected object gets the same picture.
 */
function MapSelect({ row, slot, label }: { row: LayerRowData; slot: LightingMapSlot; label: string }) {
  const updateMultipleEntityMaterialLayers = useEditorStore((state) => state.updateMultipleEntityMaterialLayers);
  const entities = useEditorStore((state) => state.entities);
  const file = useRef<HTMLInputElement>(null);
  const current = (row.pairs[0].layer as LightingLayer).maps?.[slot];
  const pictures = scenePictures(entities);

  const setMap = (ref: TextureRef | null) =>
    updateMultipleEntityMaterialLayers(
      Object.fromEntries(
        row.pairs.map(({ entity, layer }) => {
          const maps = { ...(layer as LightingLayer).maps };
          if (ref) maps[slot] = ref;
          else delete maps[slot];
          return [entity.id, { layerId: layer.id, updates: { maps } }];
        }),
      ),
    );

  return (
    <div className="prop">
      <span className="prop-label">{label}</span>
      <div className="select-wrap" style={{ flex: 1, width: "100%" }}>
        <select
          aria-label={label}
          style={{ width: "100%" }}
          value={current?.textureAssetId ?? ""}
          onChange={(event) => {
            const value = event.target.value;
            if (value === UPLOAD) {
              file.current?.click();
              return;
            }
            const picked = pictures.find((picture) => picture.textureAssetId === value);
            setMap(picked ? { textureAssetId: picked.textureAssetId, name: picked.name, wrapS: picked.wrapS, wrapT: picked.wrapT, ...(picked.flipY ? { flipY: true } : null) } : null);
          }}
        >
          <option value="">None</option>
          {pictures.map((picture) => (
            <option key={picture.textureAssetId} value={picture.textureAssetId}>
              {picture.name}
            </option>
          ))}
          <option value={UPLOAD}>Upload…</option>
        </select>
      </div>
      <input
        ref={file}
        type="file"
        accept=".png,.jpg,.jpeg,image/png,image/jpeg"
        hidden
        onChange={(event) => {
          const picked = event.target.files?.[0];
          event.target.value = "";
          if (picked) void importMapFile(picked).then((ref) => ref && setMap(ref));
        }}
      />
    </div>
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

// A Normal layer, as Spline's: which of the surface direction's X, Y and Z colour it (red, green, blue).
export function NormalSettings({ row }: { row: LayerRowData }) {
  const update = useRowUpdate(row);
  const layer = row.pairs[0].layer as NormalLayer;
  return (
    <div className="prop">
      <span className="prop-label">Direction</span>
      <div className="mat-toggles">
        {["X", "Y", "Z"].map((axis, index) => (
          <button
            key={axis}
            type="button"
            className={`seg-btn ${layer.axes[index] ? "on" : ""}`}
            aria-pressed={layer.axes[index]}
            title={`${layer.axes[index] ? "Leave out" : "Use"} the surface's ${axis} direction (${["red", "green", "blue"][index]})`}
            onClick={() => update({ axes: layer.axes.map((on, i) => (i === index ? !on : on)) as NormalLayer["axes"] })}
          >
            {axis}
          </button>
        ))}
      </div>
    </div>
  );
}

// Each matcap preset's thumbnail, drawn once (viewport/matcaps.ts gives its pixels bottom row first).
const matcapThumbnails = new Map<string, string>();
const matcapThumbnail = (id: string): string => {
  let url = matcapThumbnails.get(id);
  if (!url) {
    const size = 96;
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = size;
    const pixels = matcapPixels(id, size);
    const image = new ImageData(size, size);
    for (let row = 0; row < size; row++) image.data.set(pixels.subarray(row * size * 4, (row + 1) * size * 4), (size - 1 - row) * size * 4);
    canvas.getContext("2d")?.putImageData(image, 0, 0);
    url = canvas.toDataURL();
    matcapThumbnails.set(id, url);
  }
  return url;
};

// A Matcap layer, as Spline's drawer: Assets (Libre3D's own matcaps) or Custom (a picture of the
// person's own, uploaded; on /try it stays in the browser), Rotation, and Mode.
export function MatcapSettings({ row }: { row: LayerRowData }) {
  const update = useRowUpdate(row);
  const layer = row.pairs[0].layer as MatcapLayer;
  const [tab, setTab] = useState<"custom" | "assets">(layer.textureAssetId ? "custom" : "assets");
  return (
    <>
      <DrawerTabs
        tabs={[
          { value: "custom", label: "Custom" },
          { value: "assets", label: "Assets" },
        ]}
        value={tab}
        onChange={setTab}
      />
      <NumberRow label="Rotation" value={layer.rotation} step={1} onChange={(rotation) => update({ rotation })} />
      <ModeRow row={row} />
      {tab === "custom" ? (
        <PictureFrame
          textureAssetId={layer.textureAssetId ?? ""}
          label="Upload Image"
          onUpload={(picture) => update({ textureAssetId: picture.textureAssetId, name: picture.name } as Partial<MatcapLayer>)}
        />
      ) : (
        <div className="mat-picture-grid">
          {Object.entries(MATCAP_PRESETS).map(([id, look]) => {
            const on = !layer.textureAssetId && layer.preset === id;
            return (
              <button
                key={id}
                type="button"
                className={`mat-picture-choice round ${on ? "on" : ""}`}
                title={look.name}
                aria-label={look.name}
                aria-pressed={on}
                style={{ backgroundImage: `url(${matcapThumbnail(id)})` }}
                onClick={() => update({ preset: id, textureAssetId: undefined, name: undefined } as Partial<MatcapLayer>)}
              />
            );
          })}
        </div>
      )}
    </>
  );
}

// A Rainbow layer, as Spline's drawer: Mode, Frequency, Movement, Color (a shift per band), Noise,
// Noise Scale and Offset.
export function RainbowSettings({ row }: { row: LayerRowData }) {
  const update = useRowUpdate(row);
  const layer = row.pairs[0].layer as RainbowLayer;
  const setAxis = (key: "color" | "offset", axis: number, value: number) => {
    if (value === layer[key][axis]) return;
    const next: [number, number, number] = [...layer[key]];
    next[axis] = value;
    update({ [key]: next });
  };
  return (
    <>
      <ModeRow row={row} />
      <NumberRow label="Frequency" value={layer.frequency} min={0} step={1} onChange={(frequency) => update({ frequency })} />
      <NumberRow label="Movement" value={layer.movement} step={0.1} onChange={(movement) => update({ movement })} />
      <AxesRow label="Color" axes={["R", "G", "B"]} values={layer.color} step={0.05} onChange={(axis, value) => setAxis("color", axis, value)} />
      <NumberRow label="Noise" value={layer.noise} min={0} step={0.1} onChange={(noise) => update({ noise })} />
      <NumberRow label="Noise Scale" value={layer.noiseScale} min={0} step={0.1} onChange={(noiseScale) => update({ noiseScale })} />
      <AxesRow label="Offset" axes={["X", "Y", "Z"]} values={layer.offset} step={0.1} onChange={(axis, value) => setAxis("offset", axis, value)} />
    </>
  );
}

// A Glass layer, as Spline's drawer ("Transmission"): Blur, Thickness, Refraction (the index of
// refraction), Absorption (the colour light takes on deep in the glass) and Absorb Distance (how deep
// it reaches that colour; 0 = never).
export function GlassSettings({ row }: { row: LayerRowData }) {
  const update = useRowUpdate(row);
  const layer = row.pairs[0].layer as GlassLayer;
  return (
    <>
      <NumberRow label="Blur" value={layer.blur} min={0} max={10} step={0.1} onChange={(blur) => update({ blur })} />
      <NumberRow label="Thickness" value={layer.thickness} min={0} step={1} onChange={(thickness) => update({ thickness })} />
      <NumberRow label="Refraction" value={layer.ior} min={1} max={3} step={0.01} onChange={(ior) => update({ ior })} />
      <ColorField label="Absorption" color={layer.absorption} onChange={({ color }) => color && update({ absorption: color })} />
      <NumberRow label="Absorb Distance" value={layer.absorbDistance} min={0} step={1} onChange={(absorbDistance) => update({ absorbDistance })} />
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
      {/* No bounds: a negative bias pulls the rim in, leaving more of the middle clear. */}
      <NumberRow label="Bias" value={layer.bias} step={0.01} onChange={(bias) => update({ bias })} />
      <NumberRow label="Scale" value={layer.scale} step={0.1} onChange={(scale) => update({ scale })} />
      <NumberRow label="Intensity" value={layer.intensity} min={0} step={0.1} onChange={(intensity) => update({ intensity })} />
      <NumberRow label="Factor" value={layer.factor} min={0} step={0.1} onChange={(factor) => update({ factor })} />
    </>
  );
}

// A picture from the texture store as an object URL, for a thumbnail, while it shows; null while it
// loads (or when it can't be had).
function usePictureUrl(textureAssetId: string): string | null {
  const [url, setUrl] = useState<string | null>(null);
  useEffect(() => {
    setUrl(null);
    if (!textureAssetId) return;
    let objectUrl: string | null = null;
    let cancelled = false;
    loadTextureForScene(textureAssetId)
      .then((blob) => {
        if (cancelled || !blob) return;
        objectUrl = URL.createObjectURL(blob);
        setUrl(objectUrl);
      })
      .catch(() => {
        /* a thumbnail is best-effort; a missing picture just shows the empty frame */
      });
    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [textureAssetId]);
  return url;
}

/** Custom / Assets at the top of a picture drawer (Image, Matcap), as Spline's. */
export function DrawerTabs<T extends string>({ tabs, value, onChange }: { tabs: { value: T; label: string }[]; value: T; onChange: (value: T) => void }) {
  return (
    <div className="mat-drawer-tabs" role="tablist">
      {tabs.map((tab) => (
        <button key={tab.value} type="button" role="tab" aria-selected={tab.value === value} className={tab.value === value ? "on" : ""} onClick={() => onChange(tab.value)}>
          {tab.label}
        </button>
      ))}
    </div>
  );
}

/** A picture's frame: its thumbnail, with an Upload button over it (a PNG or JPEG from the computer). */
function PictureFrame({ textureAssetId, label, onUpload }: { textureAssetId: string; label: string; onUpload: (ref: TextureRef) => void }) {
  const url = usePictureUrl(textureAssetId);
  const file = useRef<HTMLInputElement>(null);
  return (
    <div className="mat-picture-frame" style={{ backgroundImage: url ? `url(${url})` : undefined }}>
      <button type="button" className="mat-picture-upload" onClick={() => file.current?.click()}>
        {label}
      </button>
      <input
        ref={file}
        type="file"
        accept=".png,.jpg,.jpeg,image/png,image/jpeg"
        hidden
        aria-label={label}
        onChange={(event) => {
          const picked = event.target.files?.[0];
          event.target.value = "";
          if (picked) void importMapFile(picked).then((ref) => ref && onUpload(ref));
        }}
      />
    </div>
  );
}

/** The scene's pictures as thumbnails to pick from (a picture drawer's Assets tab). */
function PictureGrid({ current, onPick }: { current: string; onPick: (picture: TextureRef & { name: string }) => void }) {
  const entities = useEditorStore((state) => state.entities);
  const pictures = scenePictures(entities);
  if (pictures.length === 0) return <p className="mat-drawer-note">No pictures in the scene yet: upload one under Custom.</p>;
  return (
    <div className="mat-picture-grid">
      {pictures.map((picture) => (
        <PictureChoice key={picture.textureAssetId} picture={picture} on={picture.textureAssetId === current} onPick={() => onPick(picture)} />
      ))}
    </div>
  );
}

function PictureChoice({ picture, on, onPick }: { picture: TextureRef & { name: string }; on: boolean; onPick: () => void }) {
  const url = usePictureUrl(picture.textureAssetId);
  return (
    <button
      type="button"
      className={`mat-picture-choice ${on ? "on" : ""}`}
      title={picture.name}
      aria-label={picture.name}
      aria-pressed={on}
      style={{ backgroundImage: url ? `url(${url})` : undefined }}
      onClick={onPick}
    />
  );
}

const PROJECTION_OPTIONS: { label: string; value: ImageProjection }[] = [
  { label: "UV", value: "uv" },
  { label: "Planar", value: "planar" },
  { label: "Spherical", value: "spherical" },
  { label: "Cylindrical", value: "cylindrical" },
  { label: "Triplanar", value: "triplanar" },
];

const AXIS_OPTIONS = [
  { label: "X", value: "x" },
  { label: "Y", value: "y" },
  { label: "Z", value: "z" },
];

// three's wrap constants: Repeat, Clamp (to the edge), Mirror (repeat mirrored).
const WRAPPING_OPTIONS = [
  { label: "Repeat", value: "1000" },
  { label: "Clamp", value: "1001" },
  { label: "Mirror", value: "1002" },
];

const SHARPNESS_OPTIONS = [
  { label: "Smooth", value: "smooth" },
  { label: "Pixelated", value: "pixelated" },
];

const YES_NO = [
  { label: "Yes", value: "yes" },
  { label: "No", value: "no" },
];

// An Image layer, as Spline's Texture drawer: Custom (its picture, Upload) or Assets (the scene's
// pictures), Mode, and how it's placed. An uploaded or picked picture is drawn the way up it was
// made on three's primitives (flipY); an image plane's and an import's own keep glTF's way.
export function ImageSettings({ row }: { row: LayerRowData }) {
  const update = useRowUpdate(row);
  const layer = row.pairs[0].layer as ImageLayer;
  const [tab, setTab] = useState<"custom" | "assets">("custom");
  const setPicture = (picture: TextureRef) =>
    update({ textureAssetId: picture.textureAssetId, name: picture.name, flipY: true } as Partial<ImageLayer>);
  const setPair = (key: "scale" | "offset", axis: number, value: number) => {
    if (value === layer[key][axis]) return;
    const next: [number, number] = [...layer[key]];
    next[axis] = value;
    update({ [key]: next });
  };
  const axial = layer.projection === "planar" || layer.projection === "cylindrical";
  return (
    <>
      <DrawerTabs
        tabs={[
          { value: "custom", label: "Custom" },
          { value: "assets", label: "Assets" },
        ]}
        value={tab}
        onChange={setTab}
      />
      <ModeRow row={row} />
      {tab === "custom" ? (
        <PictureFrame textureAssetId={layer.textureAssetId} label="Upload" onUpload={setPicture} />
      ) : (
        <PictureGrid current={layer.textureAssetId} onPick={setPicture} />
      )}
      <Select label="Projection" options={PROJECTION_OPTIONS} value={layer.projection} onChange={(value) => update({ projection: value as ImageProjection })} />
      {axial && <Select label="Axis" options={AXIS_OPTIONS} value={layer.axis} onChange={(value) => update({ axis: value as ImageLayer["axis"] })} />}
      <Select
        label="Wrapping"
        options={WRAPPING_OPTIONS}
        value={String(layer.wrapS)}
        onChange={(value) => update({ wrapS: Number(value), wrapT: Number(value) })}
      />
      <Select label="Sharpness" options={SHARPNESS_OPTIONS} value={layer.sharpness} onChange={(value) => update({ sharpness: value as ImageLayer["sharpness"] })} />
      <SegmentedRow label="Crop" options={YES_NO} value={layer.crop ? "yes" : "no"} onChange={(value) => update({ crop: value === "yes" })} />
      <AxesRow label="Scale" axes={["X", "Y"]} values={layer.scale} step={0.1} onChange={(axis, value) => setPair("scale", axis, value)} />
      <AxesRow label="Offset" axes={["X", "Y"]} values={layer.offset} step={0.01} onChange={(axis, value) => setPair("offset", axis, value)} />
      <NumberRow label="Rotation" value={layer.rotation} step={1} onChange={(rotation) => update({ rotation })} />
    </>
  );
}
