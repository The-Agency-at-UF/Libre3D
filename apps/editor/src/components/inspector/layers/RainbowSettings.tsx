import type { RainbowLayer } from "../../../store/useEditorStore";
import { useRowUpdate, type LayerRowData } from "../materialRows";
import { AxesRow, ModeRow, NumberRow } from "./rows";

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
