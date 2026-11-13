import type { FresnelLayer } from "../../../store/useEditorStore";
import { ColorField } from "../../ui/ColorField";
import { useRowUpdate, type LayerRowData } from "../materialRows";
import { ModeRow, NumberRow } from "./rows";

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
