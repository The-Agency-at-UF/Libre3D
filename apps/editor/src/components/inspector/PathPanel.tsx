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
export function PathField({ label, extra, children }: { label: string; extra?: ReactNode; children: ReactNode }) {
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
  mixed?: boolean; // several paths with different values: the slider shows the first one's
  format: (value: number) => string;
  onChange: (value: number) => void;
}

// A slider with its value beside it. `--value-percent` fills the track up to the thumb.
export function RangeRow({ label, min, max, step, value, mixed = false, format, onChange }: RangeRowProps) {
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
      <span className="slider-val">{mixed ? "Mixed" : format(value)}</span>
    </div>
  );
}

interface PathPanelProps {
  entities: Entity[]; // paths, at least one
}

/**
 * The selected paths' stroke and trim (notes/animation-plan.md, B1). Trim shows as 0–100 % and is
 * stored as 0–1. Its edits go to the state each path is shown in, like the Transform panel's (a
 * "Hidden" state is trim end 0); radius and caps belong to the path itself, in every state.
 *
 * Several paths (an imported SVG's strokes, B3) are changed together, in one undo step; a value
 * they don't share reads "Mixed" and the slider shows the first path's.
 *
 * While one path's points are being edited (B2), the picked point's position (in the path's own
 * space, from its origin) and smooth / corner: typing a depth is easier than dragging the gizmo's Z
 * arrow, which points straight at you in front view. Points belong to the path too, in every state.
 */
export function PathPanel({ entities }: PathPanelProps) {
  const updatePathStrokes = useEditorStore((state) => state.updatePathStrokes);
  const updatePath = useEditorStore((state) => state.updatePath);
  const updateShownTransforms = useEditorStore((state) => state.updateShownTransforms);
  const viewedStates = useEditorStore((state) => state.viewedStates);
  const objectStates = useEditorStore((state) => state.animation.states);
  const entity = entities[0];
  const editedPoint = useEditorStore((state) =>
    entities.length === 1 && state.penTool?.mode === "edit" && state.penTool.pathId === entity.id ? state.penTool.selectedPoint : null,
  );

  const ids = entities.map((path) => path.id);
  const shownStates = entities.map((path) => getViewedState(viewedStates, objectStates, path.id));
  const shown = entities.map((path, i) => resolveState(path, shownStates[i]));
  // One path shown in a state: its trim fields get a marker and a "Reset to Base".
  const objectState = entities.length === 1 ? shownStates[0] : null;
  const strokes = entities.map((path) => path.stroke ?? DEFAULT_STROKE);
  const stroke = strokes[0];
  const isMixed = (values: number[]) => values.some((value) => Math.abs(value - values[0]) > 1e-6);
  const path = entity.path;
  const point = path && editedPoint !== null ? path.points[editedPoint] : undefined;

  const trimField = (field: "trimStart" | "trimEnd", label: string, fallback: number) => {
    const values = shown.map((pose) => pose[field] ?? fallback);
    return (
      <PathField label={label} extra={<StateValueExtra objectState={objectState} field={field} />}>
        <RangeRow
          label={label}
          min={0}
          max={100}
          step={1}
          value={Math.round(values[0] * 100)}
          mixed={isMixed(values)}
          format={(percent) => `${percent}%`}
          onChange={(percent) => updateShownTransforms(Object.fromEntries(ids.map((id) => [id, { [field]: percent / 100 }])))}
        />
      </PathField>
    );
  };

  return (
    <PanelSection title="Path">
      <PathField label="Radius">
        <RangeRow
          label="Radius"
          min={0.01}
          max={1}
          step={0.01}
          value={stroke.radius}
          mixed={isMixed(strokes.map((each) => each.radius))}
          format={(radius) => radius.toFixed(2)}
          onChange={(radius) => updatePathStrokes(ids, { radius })}
        />
      </PathField>
      <PathField label="Caps">
        <Select
          className=""
          options={CAP_OPTIONS}
          value={stroke.caps}
          onChange={(caps) => updatePathStrokes(ids, { caps: caps as CapStyle })}
        />
      </PathField>
      {trimField("trimStart", "Trim Start", 0)}
      {trimField("trimEnd", "Trim End", 1)}
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
