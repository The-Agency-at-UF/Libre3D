import { useEditorStore } from "../store/useEditorStore";
import { InspectorTopbar } from "./inspector/InspectorTopbar";
import { TransformPanel } from "./inspector/TransformPanel";
import { ScenePanel } from "./inspector/ScenePanel";
import { CameraPanel } from "./inspector/CameraPanel";
import { FramePanel } from "./inspector/FramePanel";
import { ViewportSettingsPanel } from "./inspector/ViewportSettingsPanel";

export interface RightSidebarProps {
  setIsModalOpen: (open: boolean) => void;
  setActiveTab: (tab: "export" | "share") => void;
}

export function RightSidebar({ setIsModalOpen, setActiveTab }: RightSidebarProps) {
  const viewportZoom = useEditorStore((state) => state.viewportZoom);
  const selectedEntityId = useEditorStore((state) => state.selectedEntityId);
  const entities = useEditorStore((state) => state.entities) ?? [];
  const isPreviewMode = useEditorStore((state) => state.isPreviewMode);

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
        <FramePanel />
        <ViewportSettingsPanel />
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
