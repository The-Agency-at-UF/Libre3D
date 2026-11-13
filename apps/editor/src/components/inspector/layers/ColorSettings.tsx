import type { ColorLayer } from "../../../store/useEditorStore";
import { ColorPicker } from "../../ui/ColorPicker";
import { useRowUpdate, type LayerRowData } from "../materialRows";

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
