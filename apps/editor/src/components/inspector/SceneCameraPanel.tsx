import { useEditorStore, type Entity } from "../../store/useEditorStore";
import { DEFAULT_SCENE_CAMERA } from "../../scene/defaults";
import type { SceneCameraSettings } from "../../scene/types";
import { PanelSection } from "../ui/PanelSection";
import { Select } from "../ui/Select";
import { PathField, RangeRow } from "./PathPanel";

interface SceneCameraPanelProps {
  cameras: Entity[]; // the selected scene cameras, at least one
}

const PROJECTIONS = [
  { label: "Perspective", value: "perspective" },
  { label: "Orthographic", value: "orthographic" },
];

/**
 * The selected scene cameras' lens (decision tree §C3): Projection, Field of View (perspective),
 * Size (orthographic: half the view's height), Near, Far, with CameraPanel's ranges. Not the
 * personal camera's panel (CameraPanel): that one is the view you orbit, which isn't in the scene.
 *
 * Several cameras are changed together, in one undo step (updateSceneCameras); a value they don't
 * share reads "Mixed" and the slider shows the first camera's. Field of View shows while any of
 * them is perspective, Size while any is orthographic. Disabled while view only by the sidebar's
 * fieldset.
 */
export function SceneCameraPanel({ cameras }: SceneCameraPanelProps) {
  const updateSceneCameras = useEditorStore((state) => state.updateSceneCameras);

  const ids = cameras.map((camera) => camera.id);
  const lenses = cameras.map((camera): SceneCameraSettings => ({ ...DEFAULT_SCENE_CAMERA, ...camera.camera }));
  const values = (field: keyof Omit<SceneCameraSettings, "projection">) => lenses.map((lens) => lens[field]);
  const isMixed = (list: number[]) => list.some((value) => Math.abs(value - list[0]) > 1e-6);
  const projections = new Set(lenses.map((lens) => lens.projection));
  const mixedProjection = projections.size > 1;

  const row = (field: keyof Omit<SceneCameraSettings, "projection">, label: string, min: number, max: number, step: number, digits: number) => {
    const list = values(field);
    return (
      <PathField label={label}>
        <RangeRow
          label={label}
          min={min}
          max={max}
          step={step}
          value={list[0]}
          mixed={isMixed(list)}
          format={(value) => value.toFixed(digits)}
          onChange={(value) => updateSceneCameras(ids, { [field]: value })}
        />
      </PathField>
    );
  };

  return (
    <PanelSection title="Camera">
      <Select
        label="Projection"
        className=""
        options={mixedProjection ? [{ label: "Mixed", value: "mixed" }, ...PROJECTIONS] : PROJECTIONS}
        value={mixedProjection ? "mixed" : lenses[0].projection}
        onChange={(value) => {
          if (value === "perspective" || value === "orthographic") updateSceneCameras(ids, { projection: value });
        }}
      />
      {projections.has("perspective") && row("fov", "Field of View", 10, 150, 1, 0)}
      {projections.has("orthographic") && row("orthoSize", "Size", 0.1, 50, 0.1, 1)}
      {row("near", "Near Clip", 0.1, 20, 0.1, 1)}
      {row("far", "Far Clip", 10, 2000, 5, 0)}
    </PanelSection>
  );
}
