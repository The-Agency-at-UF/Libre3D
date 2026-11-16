import { useShallow } from "zustand/shallow";
import { useEditorStore } from "../../store/useEditorStore";
import { resolveActiveCamera } from "../../scene/activeCamera";
import { PanelSection } from "../ui/PanelSection";
import { Switch } from "../ui/Switch";
import { CameraDropdown } from "./CameraDropdown";

export function ViewportSettingsPanel() {
  const setActiveProfile = useEditorStore((state) => state.setActiveProfile);
  // The same action the toolbar's + Camera uses: a scene camera at the current view, in the hierarchy.
  const addEntity = useEditorStore((state) => state.addEntity);
  const deleteCameraProfile = useEditorStore((state) => state.deleteCameraProfile);
  const cameraProfiles = useEditorStore((state) => state.cameraProfiles);
  // The scene cameras, listed after the profiles (C6): picking one looks through it, here and in Play.
  const sceneCameras = useEditorStore(useShallow((state) => state.entities.filter((entity) => entity.type === "camera")));
  // What the editor looks through: an ID naming nothing (a deleted camera) is the personal camera.
  const activeId = useEditorStore((state) => resolveActiveCamera(state).id);
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
          value={activeId}
          options={[
            ...cameraProfileEntries.map((profile) => ({ id: profile.id, name: profile.name })),
            ...sceneCameras.map((camera) => ({ id: camera.id, name: camera.name, deletable: false })),
          ]}
          onSelect={setActiveProfile}
          onAddNew={() => addEntity("camera")}
          onDelete={deleteCameraProfile}
        />
      </div>
      <Switch label="FPS Panel" checked={showFpsPanel} onChange={(on) => setEditorState({ hudOverlay: on ? "Stats" : "None" })} />
    </PanelSection>
  );
}
