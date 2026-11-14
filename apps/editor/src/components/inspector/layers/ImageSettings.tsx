import { useState } from "react";
import type { ImageLayer, ImageProjection, TextureRef } from "../../../store/useEditorStore";
import { Select } from "../../ui/Select";
import { useRowUpdate, type LayerRowData } from "../materialRows";
import { PictureFrame, PictureGrid } from "./pictures";
import { AxesRow, DrawerTabs, ModeRow, NumberRow, SegmentedRow } from "./rows";

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
