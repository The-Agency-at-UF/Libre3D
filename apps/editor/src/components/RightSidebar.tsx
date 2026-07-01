import { useEditorStore } from "../store/useEditorStore";
import { Select } from "./ui/Select";
import { PanelSection } from "./ui/PanelSection";
import { InspectorTopbar } from "./inspector/InspectorTopbar";
import { TransformPanel } from "./inspector/TransformPanel";
import { ScenePanel } from "./inspector/ScenePanel";
import { CameraPanel } from "./inspector/CameraPanel";

export interface RightSidebarProps {
  setIsModalOpen: (open: boolean) => void;
  setActiveTab: (tab: "export" | "share") => void;
}

export function RightSidebar({ setIsModalOpen, setActiveTab }: RightSidebarProps) {
  const viewportZoom = useEditorStore((state) => state.viewportZoom);
  const selectedEntityId = useEditorStore((state) => state.selectedEntityId);
  const entities = useEditorStore((state) => state.entities) ?? [];
  const activeProfileId = useEditorStore((state) => state.activeProfileId);
  const setActiveProfile = useEditorStore((state) => state.setActiveProfile);
  const addCameraProfile = useEditorStore((state) => state.addCameraProfile);
  const cameraProfiles = useEditorStore((state) => state.cameraProfiles);
  const isPreviewMode = useEditorStore((state) => state.isPreviewMode);

  const cameraProfileEntries = Object.values(cameraProfiles);
  const selectedEntity = entities.find((e) => e.id === selectedEntityId);

  return (
    <aside className="right-sidebar panel" aria-label="Properties inspector">
      <InspectorTopbar
        setIsModalOpen={setIsModalOpen}
        setActiveTab={setActiveTab}
        viewportZoom={viewportZoom}
        selectedEntityId={selectedEntityId}
      />

      {/* SCROLLABLE BODY */}
      <div className="panel-body" style={isPreviewMode ? { opacity: 0.5, pointerEvents: "none" } : undefined}>
        <PanelSection title="Viewport Settings" defaultOpen={true}>
          <Select
            label="Camera"
            options={[
              ...cameraProfileEntries.map((profile) => ({ label: profile.name, value: profile.id })),
              { label: "➕ Add New Camera...", value: "__ADD_NEW__" },
            ]}
            value={activeProfileId}
            onChange={(val) => {
              if (val === "__ADD_NEW__") {
                const nextIndex = cameraProfileEntries.filter((profile) => profile.id !== "personal").length + 1;
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
              } else {
                setActiveProfile(val);
              }
            }}
          />
        </PanelSection>

        <ScenePanel />

        {selectedEntity ? (
          <>
            <TransformPanel selectedEntity={selectedEntity} />
          </>
        ) : (
          <CameraPanel />
        )}
      </div>
    </aside>
  );
}
