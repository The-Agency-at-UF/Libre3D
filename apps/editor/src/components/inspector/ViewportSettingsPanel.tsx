import { useEditorStore } from "../../store/useEditorStore";
import { PanelSection } from "../ui/PanelSection";
import { CameraDropdown } from "./CameraDropdown";

export function ViewportSettingsPanel() {
  const activeProfileId = useEditorStore((state) => state.activeProfileId);
  const setActiveProfile = useEditorStore((state) => state.setActiveProfile);
  const addCameraProfile = useEditorStore((state) => state.addCameraProfile);
  const deleteCameraProfile = useEditorStore((state) => state.deleteCameraProfile);
  const cameraProfiles = useEditorStore((state) => state.cameraProfiles);

  const cameraProfileEntries = [
    cameraProfiles.personal,
    ...Object.values(cameraProfiles).filter((profile) => profile.id !== "personal"),
  ].filter(Boolean);

  const handleAddCamera = () => {
    const nextIndex =
      cameraProfileEntries.reduce((highest, profile) => {
        const match = profile.id.match(/^camera_(\d+)$/);
        if (!match) {
          return highest;
        }

        return Math.max(highest, Number(match[1]));
      }, 0) + 1;

    const nextId = `camera_${nextIndex}`;
    addCameraProfile(nextId, {
      id: nextId,
      name: `Camera ${nextIndex}`,
      position: [5, 5, 5],
      target: [0, 0, 0],
      fov: 45,
      near: 0.5,
      far: 1000,
      zoom: 1,
    });
  };

  return (
    <PanelSection title="Viewport Settings" defaultOpen={true}>
      <div className="prop" style={{ width: "100%" }}>
        <span className="prop-label">Camera</span>
        <CameraDropdown
          value={activeProfileId}
          options={cameraProfileEntries.map((profile) => ({ id: profile.id, name: profile.name }))}
          onSelect={setActiveProfile}
          onAddNew={handleAddCamera}
          onDelete={deleteCameraProfile}
        />
      </div>
    </PanelSection>
  );
}
