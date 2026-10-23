import type { CSSProperties, ReactNode } from "react";
import { getViewedState, resolveState } from "../../animation/objectStates";
import { DEFAULT_STROKE, type CapStyle, type PathPoint } from "../../paths/pathGeometry";
import { movePoint, setPointMode } from "../../paths/pathEditing";
import { useEditorStore, type Entity } from "../../store/useEditorStore";
import { PanelSection } from "../ui/PanelSection";
import { Select } from "../ui/Select";
import { Vector3Input } from "../ui/Vector3Input";
import { StateValueExtra } from "./StateValueExtra";

const CAP_OPTIONS: { label: string; value: CapStyle }[] = [
  { label: "Round", value: "round" },
  { label: "Flat", value: "flat" },
];

const POINT_MODE_OPTIONS: { label: string; value: PathPoint["mode"] }[] = [
  { label: "Smooth", value: "smooth" },
  { label: "Corner", value: "corner" },
];

// A label (with room for a state marker) over its control, like the Transform panel's fields.
function PathField({ label, extra, children }: { label: string; extra?: ReactNode; children: ReactNode }) {
  return (
    <div className="path-field">
      <div className="path-field-header">
        <span>{label}</span>
        {extra}
      </div>
      {children}
    </div>
  );
}

interface RangeRowProps {
  label: string;
  min: number;
  max: number;
  step: number;
  value: number;
  format: (value: number) => string;
  onChange: (value: number) => void;
}

// A slider with its value beside it. `--value-percent` fills the track up to the thumb.
function RangeRow({ label, min, max, step, value, format, onChange }: RangeRowProps) {
  const percent = Math.min(100, Math.max(0, ((value - min) / (max - min)) * 100));
  return (
    <div className="slider-row">
      <input
        type="range"
        aria-label={label}
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(parseFloat(event.target.value))}
        style={{ "--value-percent": `${percent}%` } as CSSProperties}
      />
      <span className="slider-val">{format(value)}</span>
    </div>
  );
}

interface PathPanelProps {
  entity: Entity; // a path
}

/**
 * The selected path's stroke and trim (notes/animation-plan.md, B1). Trim shows as 0–100 % and is
 * stored as 0–1. Its edits go to the state the path is shown in, like the Transform panel's (a
 * "Hidden" state is trim end 0); radius and caps belong to the path itself, in every state.
 *
 * While its points are being edited (B2), the picked point's position (in the path's own space, from
 * its origin) and smooth / corner: typing a depth is easier than dragging the gizmo's Z arrow, which
 * points straight at you in front view. Points belong to the path too, in every state.
 */
export function PathPanel({ entity }: PathPanelProps) {
  const updatePathStroke = useEditorStore((state) => state.updatePathStroke);
  const updatePath = useEditorStore((state) => state.updatePath);
  const updateShownTransforms = useEditorStore((state) => state.updateShownTransforms);
  const viewedStates = useEditorStore((state) => state.viewedStates);
  const objectStates = useEditorStore((state) => state.animation.states);
  const editedPoint = useEditorStore((state) =>
    state.penTool?.mode === "edit" && state.penTool.pathId === entity.id ? state.penTool.selectedPoint : null,
  );

  const objectState = getViewedState(viewedStates, objectStates, entity.id);
  const shown = resolveState(entity, objectState);
  const stroke = entity.stroke ?? DEFAULT_STROKE;
  const path = entity.path;
  const point = path && editedPoint !== null ? path.points[editedPoint] : undefined;

  const trimField = (field: "trimStart" | "trimEnd", label: string, value: number) => (
    <PathField label={label} extra={<StateValueExtra objectState={objectState} field={field} />}>
      <RangeRow
        label={label}
        min={0}
        max={100}
        step={1}
        value={Math.round(value * 100)}
        format={(percent) => `${percent}%`}
        onChange={(percent) => updateShownTransforms({ [entity.id]: { [field]: percent / 100 } })}
      />
    </PathField>
  );

  return (
    <PanelSection title="Path">
      <PathField label="Radius">
        <RangeRow
          label="Radius"
          min={0.01}
          max={1}
          step={0.01}
          value={stroke.radius}
          format={(radius) => radius.toFixed(2)}
          onChange={(radius) => updatePathStroke(entity.id, { radius })}
        />
      </PathField>
      <PathField label="Caps">
        <Select
          className=""
          options={CAP_OPTIONS}
          value={stroke.caps}
          onChange={(caps) => updatePathStroke(entity.id, { caps: caps as CapStyle })}
        />
      </PathField>
      {trimField("trimStart", "Trim Start", shown.trimStart ?? 0)}
      {trimField("trimEnd", "Trim End", shown.trimEnd ?? 1)}
      {path && point && editedPoint !== null && (
        <>
          <Vector3Input
            label={`Point ${editedPoint + 1}`}
            values={point.position}
            onChange={(axis, value) => {
              // Typing "0." on the way to "0.3" changes nothing: no undo step for it.
              if (value === point.position[axis]) return;
              const position: [number, number, number] = [...point.position];
              position[axis] = value;
              updatePath(entity.id, movePoint(path, editedPoint, position));
            }}
          />
          <PathField label="Point Type">
            <Select
              className=""
              options={POINT_MODE_OPTIONS}
              value={point.mode}
              onChange={(mode) => updatePath(entity.id, setPointMode(path, editedPoint, mode as PathPoint["mode"]))}
            />
          </PathField>
        </>
      )}
    </PanelSection>
  );
}
