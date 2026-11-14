import { useState } from "react";
import type { GradientLayer } from "../../../store/useEditorStore";
import { NumberField } from "../../ui/NumberField";
import { Select } from "../../ui/Select";
import { useRowUpdate, type LayerRowData } from "../materialRows";
import { RampEditor } from "../RampEditor";
import { BLENDING_OPTIONS } from "./options";
import { AxesRow, ModeRow, SegmentedRow } from "./rows";

const GRADIENT_TYPE_OPTIONS: { label: string; value: GradientLayer["gradientType"] }[] = [
  { label: "Linear", value: "linear" },
  { label: "Radial", value: "radial" },
  { label: "Polar", value: "polar" },
];

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
