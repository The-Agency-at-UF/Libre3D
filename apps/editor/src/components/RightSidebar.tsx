import { useEditorStore } from "../store/useEditorStore";
import { InspectorTopbar } from "./inspector/InspectorTopbar";
import { TransformPanel } from "./inspector/TransformPanel";
import { MaterialsPanel } from "./inspector/MaterialsPanel";
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
  const selectedEntityIds = useEditorStore((state) => state.selectedEntityIds);
  const entities = useEditorStore((state) => state.entities) ?? [];
  const isPreviewMode = useEditorStore((state) => state.isPreviewMode);

  const selectedEntities = entities.filter((e) => selectedEntityIds.includes(e.id));

  // Hidden rather than unmounted while previewing so the inspector's own local
  // state (open panels, scroll position) is exactly where the user left it on Stop.
  return (
    <aside
      className="right-sidebar panel"
      aria-label="Properties inspector"
      style={isPreviewMode ? { display: "none" } : undefined}
    >
      <InspectorTopbar
        setIsModalOpen={setIsModalOpen}
        setActiveTab={setActiveTab}
        viewportZoom={viewportZoom}
        hasSelection={selectedEntityIds.length > 0}
      />

      {/* SCROLLABLE BODY */}
      <div className="panel-body">
        <FramePanel />
        <ViewportSettingsPanel />
        <ScenePanel />

        {selectedEntities.length > 0 ? (
          <>
            <TransformPanel selectedEntities={selectedEntities} />
            <MaterialsPanel selectedEntities={selectedEntities} />
          </>
        ) : (
          <CameraPanel />
        )}
      </div>
    </aside>
  );
}
