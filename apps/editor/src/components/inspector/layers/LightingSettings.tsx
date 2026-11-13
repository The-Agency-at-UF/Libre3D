import { useRef } from "react";
import { useEditorStore, type LightingLayer, type LightingMapSlot, type LightingModel, type TextureRef } from "../../../store/useEditorStore";
import { DEFAULT_METALNESS, DEFAULT_ROUGHNESS } from "../../../scene/layers";
import { importMapFile } from "../../../utils/importImage";
import { ColorField } from "../../ui/ColorField";
import { Select } from "../../ui/Select";
import { Slider } from "../../ui/Slider";
import { Switch } from "../../ui/Switch";
import type { LayerRowData } from "../materialRows";
import { useRowUpdate } from "../materialRows";
import { scenePictures } from "./pictures";
import { NumberRow } from "./rows";

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
