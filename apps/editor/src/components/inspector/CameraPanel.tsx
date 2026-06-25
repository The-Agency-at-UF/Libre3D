import { useEditorStore, type Entity } from "../../store/useEditorStore";
import { PanelSection } from "../ui/PanelSection";
import { Slider } from "../ui/Slider";

interface CameraPanelProps {
  selectedEntity: Entity;
}

export function CameraPanel({ selectedEntity }: CameraPanelProps) {
  const updateEntityTransform = useEditorStore((state) => state.updateEntityTransform);
  const updatePersonalCameraProperties = useEditorStore((state) => state.updatePersonalCameraProperties);
  const projectionMode = useEditorStore((state) => state.projectionMode);

  const cameraProperties = selectedEntity.cameraProperties || {
    fov: 45,
    near: 0.5,
    far: 1000,
    zoom: 1,
  };

  const handlePropertyChange = (field: keyof Required<Entity>["cameraProperties"], value: number) => {
    if (selectedEntity.id === "default") {
      updatePersonalCameraProperties({ [field]: value });
    } else {
      updateEntityTransform(selectedEntity.id, {
        cameraProperties: {
          ...cameraProperties,
          [field]: value,
        },
      });
    }

    const activeCamera = (window as any).__libre3dActiveCamera;
    if (activeCamera && typeof activeCamera.updateProjectionMatrix === "function") {
      activeCamera.updateProjectionMatrix();
    }
  };

  return (
    <PanelSection title="Camera Settings" defaultOpen={true}>
      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        {projectionMode === "perspective" && (
          <Slider
            label="Field of View"
            min={10}
            max={150}
            step={1}
            value={cameraProperties.fov}
            onChange={(val) => handlePropertyChange("fov", val)}
          />
        )}
        <Slider
          label="Near Clip"
          min={0.1}
          max={20}
          step={0.1}
          value={cameraProperties.near}
          onChange={(val) => handlePropertyChange("near", val)}
        />
        <Slider
          label="Far Clip"
          min={10}
          max={2000}
          step={5}
          value={cameraProperties.far}
          onChange={(val) => handlePropertyChange("far", val)}
        />
        {projectionMode === "orthographic" && (
          <Slider
            label="Zoom"
            min={0.1}
            max={10}
            step={0.1}
            value={cameraProperties.zoom}
            onChange={(val) => handlePropertyChange("zoom", val)}
          />
        )}
      </div>
    </PanelSection>
  );
}
