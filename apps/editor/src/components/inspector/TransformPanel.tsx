import { useEditorStore, type Entity } from "../../store/useEditorStore";
import { PanelSection } from "../ui/PanelSection";
import { Vector3Input } from "../ui/Vector3Input";

interface TransformPanelProps {
  selectedEntity: Entity;
}

export function TransformPanel({ selectedEntity }: TransformPanelProps) {
  const updateEntityTransform = useEditorStore((state) => state.updateEntityTransform);

  const handleTransformChange = (
    field: "position" | "rotation" | "scale",
    index: number,
    value: number
  ) => {
    const current = [...selectedEntity[field]] as [number, number, number];
    current[index] = value;
    updateEntityTransform(selectedEntity.id, {
      [field]: current,
    });
  };

  return (
    <PanelSection title="Transform" defaultOpen={true}>
      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        <Vector3Input
          label="Position"
          values={selectedEntity.position}
          onChange={(index, val) => handleTransformChange("position", index, val)}
        />
        <Vector3Input
          label="Rotation"
          values={selectedEntity.rotation}
          onChange={(index, val) => handleTransformChange("rotation", index, val)}
        />
        <Vector3Input
          label="Scale"
          values={selectedEntity.scale}
          onChange={(index, val) => handleTransformChange("scale", index, val)}
        />
      </div>
    </PanelSection>
  );
}
