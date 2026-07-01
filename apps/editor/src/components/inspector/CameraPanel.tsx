import { useEditorStore } from "../../store/useEditorStore";
import { PanelSection } from "../ui/PanelSection";
import { Slider } from "../ui/Slider";

export function CameraPanel() {
  const activeProfileId = useEditorStore((state) => state.activeProfileId);
  const activeProfile = useEditorStore(
    (state) => state.cameraProfiles[state.activeProfileId] ?? state.cameraProfiles.personal
  );
  const updateProfileData = useEditorStore((state) => state.updateProfileData);
  const projectionMode = useEditorStore((state) => state.projectionMode);

  const cameraProperties = activeProfile;

  const handlePropertyChange = (field: "fov" | "near" | "far" | "zoom", value: number) => {
    updateProfileData(activeProfileId, {
      [field]: value,
    } as Partial<typeof cameraProperties>);
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
