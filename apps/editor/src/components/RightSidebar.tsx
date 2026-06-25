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
  const activeCameraId = useEditorStore((state) => state.activeCameraId);
  const setActiveCameraId = useEditorStore((state) => state.setActiveCameraId);
  const entities = useEditorStore((state) => state.entities) ?? [];
  const addEntity = useEditorStore((state) => state.addEntity);
  const isPreviewMode = useEditorStore((state) => state.isPreviewMode);
  const personalCameraProperties = useEditorStore((state) => state.personalCameraProperties);

  const cameraEntities = entities.filter((e) => e.type === "camera");
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
              { label: "Personal Camera (Orbit View)", value: "default" },
              ...cameraEntities.map((cam) => ({ label: cam.name, value: cam.id })),
              { label: "➕ Add New Camera...", value: "__ADD_NEW__" },
            ]}
            value={activeCameraId}
            onChange={(val) => {
              if (val === "__ADD_NEW__") {
                const newId = addEntity("camera");
                setActiveCameraId(newId);
              } else {
                setActiveCameraId(val);
              }
            }}
          />
        </PanelSection>

        <ScenePanel />

        {selectedEntity ? (
          <>
            <TransformPanel selectedEntity={selectedEntity} />
            {selectedEntity.type === "camera" && (
              <CameraPanel selectedEntity={selectedEntity} />
            )}
          </>
        ) : (
          <CameraPanel
            selectedEntity={{
              id: "default",
              type: "camera",
              name: "Personal Camera",
              position: [0, 0, 0],
              rotation: [0, 0, 0],
              scale: [1, 1, 1],
              color: "#ffffff",
              visible: true,
              locked: false,
              cameraProperties: personalCameraProperties,
            }}
          />
        )}
      </div>
    </aside>
  );
}
