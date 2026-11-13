import type { DisplaceLayer, DisplaceType, VoronoiStyle } from "../../../store/useEditorStore";
import { Select } from "../../ui/Select";
import { useRowUpdate, type LayerRowData } from "../materialRows";
import { NOISE_TYPE_OPTIONS, VORONOI_STYLE_OPTIONS } from "./options";
import { PictureFrame } from "./pictures";
import { AxesRow, NumberRow, SegmentedRow } from "./rows";

const DISPLACE_TYPE_OPTIONS: { label: string; value: DisplaceType }[] = [...NOISE_TYPE_OPTIONS, { label: "Image", value: "image" }];

const QUALITY_OPTIONS: { label: string; value: DisplaceLayer["quality"] }[] = [
  { label: "Low", value: "low" },
  { label: "Medium", value: "medium" },
  { label: "High", value: "high" },
];

// A Displace layer, as Spline's drawer: Type (a noise, or a picture's lightness), Scale, Movement and
// Offset; Spline's other noise settings show for the noises that use them (as the Noise drawer's).
// Intensity is the row's number, as in Spline. Quality is how finely the object is built for it.
export function DisplaceSettings({ row }: { row: LayerRowData }) {
  const update = useRowUpdate(row);
  const layer = row.pairs[0].layer as DisplaceLayer;
  const image = layer.displaceType === "image";
  const voronoi = layer.displaceType === "voronoi";
  const setOffset = (axis: number, value: number) => {
    if (value === layer.offset[axis]) return;
    const offset: [number, number, number] = [...layer.offset];
    offset[axis] = value;
    update({ offset });
  };
  return (
    <>
      <Select label="Type" options={DISPLACE_TYPE_OPTIONS} value={layer.displaceType} onChange={(value) => update({ displaceType: value as DisplaceType })} />
      {image ? (
        <PictureFrame
          textureAssetId={layer.textureAssetId ?? ""}
          label="Upload Image"
          onUpload={(picture) => update({ textureAssetId: picture.textureAssetId, name: picture.name } as Partial<DisplaceLayer>)}
        />
      ) : (
        <>
          {voronoi && <Select label="Style" options={VORONOI_STYLE_OPTIONS} value={layer.voronoiStyle} onChange={(value) => update({ voronoiStyle: value as VoronoiStyle })} />}
          <NumberRow label="Scale" value={layer.scale} min={0} step={0.5} onChange={(scale) => update({ scale })} />
          <NumberRow label="Movement" value={layer.movement} step={0.1} onChange={(movement) => update({ movement })} />
          <AxesRow label="Offset" axes={["X", "Y", "Z"]} values={layer.offset} step={0.1} onChange={setOffset} />
          {voronoi && <NumberRow label="Smoothness" value={layer.smoothness} min={0} max={1} step={0.05} onChange={(smoothness) => update({ smoothness })} />}
          <NumberRow label="Seed" value={layer.seed} step={1} onChange={(seed) => update({ seed })} />
        </>
      )}
      <NumberRow label="Low Cut" value={layer.lowCut} min={0} max={1} step={0.05} onChange={(lowCut) => update({ lowCut })} />
      <NumberRow label="High Cut" value={layer.highCut} min={0} max={1} step={0.05} onChange={(highCut) => update({ highCut })} />
      <SegmentedRow label="Quality" options={QUALITY_OPTIONS} value={layer.quality} onChange={(quality) => update({ quality })} />
    </>
  );
}
