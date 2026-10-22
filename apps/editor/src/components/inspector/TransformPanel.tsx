import { selectViewedObjectState, useEditorStore, type Entity } from "../../store/useEditorStore";
import { resolveState, type Pose, type StateValueKey } from "../../animation/objectStates";
import { PanelSection } from "../ui/PanelSection";
import { Vector3Input } from "../ui/Vector3Input";

interface TransformPanelProps {
  selectedEntities: Entity[];
}

export function TransformPanel({ selectedEntities }: TransformPanelProps) {
  const updateMultipleEntityTransforms = useEditorStore((state) => state.updateMultipleEntityTransforms);
  const setStateValues = useEditorStore((state) => state.setStateValues);
  const clearStateValue = useEditorStore((state) => state.clearStateValue);
  const viewedState = useEditorStore(selectViewedObjectState);

  if (selectedEntities.length === 0) return null;

  // While one of the object's states is viewed, the fields show that state and edits go to it.
  const objectState =
    selectedEntities.length === 1 && viewedState?.targetId === selectedEntities[0].id ? viewedState : null;
  const shown: Pose[] = objectState ? [resolveState(selectedEntities[0], objectState)] : selectedEntities;

  // Compute mixed state for values
  const getMixedValue = (field: "position" | "rotation" | "scale", index: number): number | null => {
    if (shown.length === 1) return shown[0][field][index];
    const firstVal = shown[0][field][index];
    for (let i = 1; i < shown.length; i++) {
      if (Math.abs(shown[i][field][index] - firstVal) > 0.001) return null;
    }
    return firstVal;
  };

  const mixedPosition: [number | null, number | null, number | null] = [
    getMixedValue("position", 0), getMixedValue("position", 1), getMixedValue("position", 2)
  ];
  const mixedRotation: [number | null, number | null, number | null] = [
    getMixedValue("rotation", 0), getMixedValue("rotation", 1), getMixedValue("rotation", 2)
  ];
  const mixedScale: [number | null, number | null, number | null] = [
    getMixedValue("scale", 0), getMixedValue("scale", 1), getMixedValue("scale", 2)
  ];

  const handleTransformChange = (
    field: "position" | "rotation" | "scale",
    index: number,
    value: number
  ) => {
    if (objectState) {
      const current = [...shown[0][field]] as [number, number, number];
      current[index] = value;
      setStateValues(objectState.id, { [field]: current });
      return;
    }

    const updates: Record<string, any> = {};
    selectedEntities.forEach(entity => {
      const current = [...entity[field]] as [number, number, number];
      current[index] = value;
      updates[entity.id] = { [field]: current };
    });
    updateMultipleEntityTransforms(updates);
  };

  // A field the viewed state sets: a marker, and a way to make it follow Base again.
  const stateValueExtra = (field: StateValueKey) =>
    objectState?.values[field] ? (
      <>
        <span className="state-value-marker" title={`Set in ${objectState.name}`} />
        <button
          type="button"
          className="state-reset-btn"
          title={`Stop setting this in ${objectState.name}, so it follows Base`}
          onClick={() => clearStateValue(objectState.id, field)}
        >
          <i className="ti ti-arrow-back-up"></i>
          <span>Reset to Base</span>
        </button>
      </>
    ) : null;

  return (
    <PanelSection title="Transform" defaultOpen={true}>
      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        <Vector3Input
          label="Position"
          values={mixedPosition}
          onChange={(index, val) => handleTransformChange("position", index, val)}
          labelExtra={stateValueExtra("position")}
        />
        <Vector3Input
          label="Rotation"
          values={mixedRotation}
          onChange={(index, val) => handleTransformChange("rotation", index, val)}
          labelExtra={stateValueExtra("rotation")}
        />
        <Vector3Input
          label="Scale"
          values={mixedScale}
          onChange={(index, val) => handleTransformChange("scale", index, val)}
          labelExtra={stateValueExtra("scale")}
        />
      </div>
    </PanelSection>
  );
}
