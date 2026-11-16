import { useEditorStore } from "../../store/useEditorStore";
import { PanelSection } from "../ui/PanelSection";
import { Switch } from "../ui/Switch";
import { CameraDropdown } from "./CameraDropdown";

export function ViewportSettingsPanel() {
  const activeProfileId = useEditorStore((state) => state.activeProfileId);
  const setActiveProfile = useEditorStore((state) => state.setActiveProfile);
  // The same action the toolbar's + Camera uses: a scene camera at the current view, in the hierarchy.
  const addEntity = useEditorStore((state) => state.addEntity);
  const deleteCameraProfile = useEditorStore((state) => state.deleteCameraProfile);
  const cameraProfiles = useEditorStore((state) => state.cameraProfiles);
  // The frame-rate panel in the viewport's corner (useViewportRenderer builds it while this is on).
  // A preference of this browser, not part of the scene, so it works in a view-only tab too.
  const showFpsPanel = useEditorStore((state) => state.hudOverlay === "Stats");
  const setEditorState = useEditorStore((state) => state.setEditorState);

  const cameraProfileEntries = [
    cameraProfiles.personal,
    ...Object.values(cameraProfiles).filter((profile) => profile.id !== "personal"),
  ].filter(Boolean);

  return (
    <PanelSection title="Viewport Settings" defaultOpen={true}>
      <div className="prop" style={{ width: "100%" }}>
        <span className="prop-label">Camera</span>
        <CameraDropdown
          value={activeProfileId}
          options={cameraProfileEntries.map((profile) => ({ id: profile.id, name: profile.name }))}
          onSelect={setActiveProfile}
          onAddNew={() => addEntity("camera")}
          onDelete={deleteCameraProfile}
        />
      </div>
      <Switch label="FPS Panel" checked={showFpsPanel} onChange={(on) => setEditorState({ hudOverlay: on ? "Stats" : "None" })} />
    </PanelSection>
  );
}
