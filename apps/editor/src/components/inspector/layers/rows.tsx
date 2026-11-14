/**
 * PURPOSE: The label / control rows the layer drawers are made of (layerDrawers.ts): a segmented
 * choice, a number, a row of numbers by axis, a maskable layer's Mode, and a drawer's tabs.
 */

import { NumberField } from "../../ui/NumberField";
import { useRowUpdate, type LayerRowData } from "../materialRows";

const MODE_OPTIONS: { label: string; value: "mask" | "color" }[] = [
  { label: "Mask", value: "mask" },
  { label: "Color", value: "color" },
];

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
