import type { GlassLayer } from "../../../store/useEditorStore";
import { ColorField } from "../../ui/ColorField";
import { useRowUpdate, type LayerRowData } from "../materialRows";
import { NumberRow } from "./rows";

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
