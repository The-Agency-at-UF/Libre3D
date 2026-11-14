import type { NoiseLayer, NoiseType, VoronoiStyle } from "../../../store/useEditorStore";
import { ColorField } from "../../ui/ColorField";
import type { ColorChange } from "../../ui/ColorPicker";
import { Select } from "../../ui/Select";
import { useRowUpdate, type LayerRowData } from "../materialRows";
import { NOISE_TYPE_OPTIONS, VORONOI_STYLE_OPTIONS } from "./options";
import { AxesRow, ModeRow, NumberRow } from "./rows";

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
