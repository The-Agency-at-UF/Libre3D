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
  const isReadOnly = useEditorStore((state) => state.readOnlyReason !== null);

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

      {/* SCROLLABLE BODY. View only: the panels that edit the scene are disabled; the
          camera ones stay usable, since looking around is what view only is for. */}
      <div className="panel-body">
        <fieldset className="inspector-fieldset" disabled={isReadOnly}>
          <FramePanel />
        </fieldset>
        <ViewportSettingsPanel />
        <fieldset className="inspector-fieldset" disabled={isReadOnly}>
          <ScenePanel />
        </fieldset>

        {selectedEntities.length > 0 ? (
          <fieldset className="inspector-fieldset" disabled={isReadOnly}>
            <TransformPanel selectedEntities={selectedEntities} />
            <MaterialsPanel selectedEntities={selectedEntities} />
          </fieldset>
        ) : (
          <CameraPanel />
        )}
      </div>
    </aside>
  );
}
