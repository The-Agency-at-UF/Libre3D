import { useEditorStore, type Entity } from "../../store/useEditorStore";
import { PanelSection } from "../ui/PanelSection";
import { Vector3Input } from "../ui/Vector3Input";

interface TransformPanelProps {
  selectedEntities: Entity[];
}

export function TransformPanel({ selectedEntities }: TransformPanelProps) {
  const updateMultipleEntityTransforms = useEditorStore((state) => state.updateMultipleEntityTransforms);

  if (selectedEntities.length === 0) return null;

  // Compute mixed state for values
  const getMixedValue = (field: "position" | "rotation" | "scale", index: number): number | null => {
    if (selectedEntities.length === 1) return selectedEntities[0][field][index];
    const firstVal = selectedEntities[0][field][index];
    for (let i = 1; i < selectedEntities.length; i++) {
      if (Math.abs(selectedEntities[i][field][index] - firstVal) > 0.001) return null;
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
    const updates: Record<string, any> = {};
    selectedEntities.forEach(entity => {
      const current = [...entity[field]] as [number, number, number];
      current[index] = value;
      updates[entity.id] = { [field]: current };
    });
    updateMultipleEntityTransforms(updates);
  };

  return (
    <PanelSection title="Transform" defaultOpen={true}>
      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        <Vector3Input
          label="Position"
          values={mixedPosition}
          onChange={(index, val) => handleTransformChange("position", index, val)}
        />
        <Vector3Input
          label="Rotation"
          values={mixedRotation}
          onChange={(index, val) => handleTransformChange("rotation", index, val)}
        />
        <Vector3Input
          label="Scale"
          values={mixedScale}
          onChange={(index, val) => handleTransformChange("scale", index, val)}
        />
      </div>
    </PanelSection>
  );
}
