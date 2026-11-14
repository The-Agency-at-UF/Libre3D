import { useState } from "react";
import { useEditorStore, type DepthLayer } from "../../../store/useEditorStore";
import { editDepth } from "../../../viewport/hooks/useViewportDepthGizmo";
import { Select } from "../../ui/Select";
import { useRowUpdate, type LayerRowData } from "../materialRows";
import { RampEditor } from "../RampEditor";
import { BLENDING_OPTIONS } from "./options";
import { AxesRow, ModeRow, NumberRow, SegmentedRow } from "./rows";

const DEPTH_TYPE_OPTIONS: { label: string; value: DepthLayer["gradientType"] }[] = [
  { label: "Radial", value: "radial" },
  { label: "Linear", value: "linear" },
];

const ORIGIN_OPTIONS: { label: string; value: "vector" | "camera" }[] = [
  { label: "Vector", value: "vector" },
  { label: "Camera", value: "camera" },
];

const SPACE_OPTIONS: { label: string; value: "local" | "world" }[] = [
  { label: "Local", value: "local" },
  { label: "World", value: "world" },
];

// A Depth layer, as Spline's drawer has it. The picked ramp stop is this drawer's own state; it
// starts on the first stop for each layer (the drawer is keyed by layer). Several objects with the
// same stack take the first one's values for what's changed; the viewport's handles are one
// object's.
export function DepthSettings({ row }: { row: LayerRowData }) {
  const update = useRowUpdate(row);
  const depthEdit = useEditorStore((state) => state.depthEdit);
  const setDepthEdit = useEditorStore((state) => state.setDepthEdit);
  const layer = row.pairs[0].layer as DepthLayer;
  // The object whose viewport handles edit this layer: the one object showing the stack.
  const singleId = row.pairs.length === 1 ? row.pairs[0].owner.entityId : undefined;
  const [selected, setSelected] = useState(0);
  const camera = layer.originType === "camera";
  const isEditing = !!singleId && depthEdit === singleId;

  const setAxis = (key: "origin" | "direction", axis: number, value: number) => {
    if (value === layer[key][axis]) return;
    const next: [number, number, number] = [...layer[key]];
    next[axis] = value;
    update({ [key]: next });
  };

  return (
    <>
      <ModeRow row={row} />
      <SegmentedRow
        label="Origin"
        options={ORIGIN_OPTIONS}
        value={camera ? "camera" : "vector"}
        onChange={(originType) => {
          if (originType === "camera" && isEditing) setDepthEdit(null);
          update({ originType });
        }}
      />
      <SegmentedRow label="Blending" options={BLENDING_OPTIONS} value={layer.smooth ? "smooth" : "linear"} onChange={(value) => update({ smooth: value === "smooth" })} />
      <RampEditor stops={layer.stops} smooth={layer.smooth} selected={selected} onSelect={setSelected} onChange={(stops) => update({ stops })} />
      <Select label="Type" options={DEPTH_TYPE_OPTIONS} value={layer.gradientType} onChange={(value) => update({ gradientType: value as DepthLayer["gradientType"] })} />
      {!camera && (
        <>
          <SegmentedRow label="Position" options={SPACE_OPTIONS} value={layer.space ?? "local"} onChange={(space) => update({ space })} />
          <AxesRow label="Origin" axes={["X", "Y", "Z"]} values={layer.origin} onChange={(axis, value) => setAxis("origin", axis, value)} />
          {layer.gradientType === "linear" && (
            <AxesRow label="Direction" axes={["X", "Y", "Z"]} values={layer.direction} onChange={(axis, value) => setAxis("direction", axis, value)} />
          )}
        </>
      )}
      <NumberRow label="Near" value={layer.near} min={0} onChange={(near) => update({ near })} />
      <NumberRow label="Far" value={layer.far} min={0} onChange={(far) => update({ far })} />
      {!camera && singleId && (
        <div className="prop">
          <span className="prop-label">Viewport</span>
          <button
            type="button"
            className={`mat-drawer-btn ${isEditing ? "on" : ""}`}
            title={isEditing ? "Stop editing in the viewport (Enter)" : "Edit in the viewport: the gizmo moves the origin"}
            aria-pressed={isEditing}
            onClick={() => (isEditing ? setDepthEdit(null) : editDepth(singleId, layer.id))}
          >
            <i className="ti ti-pointer"></i>
            <span>{isEditing ? "Editing" : "Edit"}</span>
          </button>
        </div>
      )}
    </>
  );
}
