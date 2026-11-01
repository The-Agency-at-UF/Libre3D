import { useCallback, useEffect, useState } from "react";
import { useEditorStore } from "../store/useEditorStore";
import { InspectorTopbar } from "./inspector/InspectorTopbar";
import { StatesPanel } from "./inspector/StatesPanel";
import { EventsPanel } from "./inspector/EventsPanel";
import { EditEventPanel } from "./inspector/EditEventPanel";
import { TransformPanel } from "./inspector/TransformPanel";
import { PathPanel } from "./inspector/PathPanel";
import { ShapePanel } from "./inspector/ShapePanel";
import { getDescendantIds } from "../store/entityIndex";
import { MaterialsPanel } from "./inspector/MaterialsPanel";
import { ScenePanel } from "./inspector/ScenePanel";
import { CameraPanel } from "./inspector/CameraPanel";
import { PlayCameraPanel } from "./inspector/PlayCameraPanel";
import { FramePanel } from "./inspector/FramePanel";
import { ViewportSettingsPanel } from "./inspector/ViewportSettingsPanel";

export interface RightSidebarProps {
  setIsModalOpen: (open: boolean) => void;
  setActiveTab: (tab: "export" | "share") => void;
  /** False hides the Share button (a guest's scene isn't in the cloud). */
  canShare: boolean;
}

export function RightSidebar({ setIsModalOpen, setActiveTab, canShare }: RightSidebarProps) {
  const viewportZoom = useEditorStore((state) => state.viewportZoom);
  const selectedEntityIds = useEditorStore((state) => state.selectedEntityIds);
  const entities = useEditorStore((state) => state.entities) ?? [];
  const isPreviewMode = useEditorStore((state) => state.isPreviewMode);
  const isReadOnly = useEditorStore((state) => state.readOnlyReason !== null);
  const events = useEditorStore((state) => state.animation.events);

  const selectedEntities = entities.filter((e) => selectedEntityIds.includes(e.id));
  // The Shape panel acts on selected shapes and on the shapes in selected groups (an SVG import
  // selects its group), when nothing else is selected.
  const reachedIds = new Set([...selectedEntityIds, ...selectedEntityIds.flatMap((id) => getDescendantIds(entities, id))]);
  const reachedShapes = selectedEntities.every((e) => e.type === "shape" || e.type === "group")
    ? entities.filter((e) => e.type === "shape" && reachedIds.has(e.id))
    : [];

  // The event open in the Edit Event panel. It shows only while its object is the one selected, and
  // closes when that changes or the event is gone (deleted, undone).
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const editingEvent = editingEventId ? events[editingEventId] : undefined;
  const showEventEditor =
    !!editingEvent && selectedEntities.length === 1 && selectedEntities[0].id === editingEvent.ownerId;
  const closeEventEditor = useCallback(() => setEditingEventId(null), []);

  useEffect(() => {
    if (editingEventId && !showEventEditor) setEditingEventId(null);
  }, [editingEventId, showEventEditor]);

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
        canShare={canShare}
        viewportZoom={viewportZoom}
        hasSelection={selectedEntityIds.length > 0}
      />

      {/* SCROLLABLE BODY. View only: the panels that edit the scene are disabled; the
          camera ones stay usable, since looking around is what view only is for. Hidden
          (not unmounted) while an event is being edited, for the same reason as above. */}
      <div className="panel-body" style={showEventEditor ? { display: "none" } : undefined}>
        <fieldset className="inspector-fieldset" disabled={isReadOnly}>
          <FramePanel />
        </fieldset>
        <ViewportSettingsPanel />
        <fieldset className="inspector-fieldset" disabled={isReadOnly}>
          <ScenePanel />
        </fieldset>

        {selectedEntities.length > 0 ? (
          <>
            {/* Outside the fieldset: a view-only scene can still view states and events (they disable their own edits). */}
            {selectedEntities.length === 1 && <StatesPanel entity={selectedEntities[0]} />}
            {selectedEntities.length === 1 && <EventsPanel entity={selectedEntities[0]} onEditEvent={setEditingEventId} />}
            <fieldset className="inspector-fieldset" disabled={isReadOnly}>
              <TransformPanel selectedEntities={selectedEntities} />
              {selectedEntities.every((entity) => entity.type === "path") && <PathPanel entities={selectedEntities} />}
              {reachedShapes.length > 0 && <ShapePanel shapes={reachedShapes} selectedIds={selectedEntityIds} />}
              <MaterialsPanel selectedEntities={selectedEntities} />
            </fieldset>
          </>
        ) : (
          <>
            <CameraPanel />
            {/* How Play moves the camera is part of the scene, so it's locked while view only. */}
            <fieldset className="inspector-fieldset" disabled={isReadOnly}>
              <PlayCameraPanel />
            </fieldset>
          </>
        )}
      </div>

      {showEventEditor && <EditEventPanel event={editingEvent} onClose={closeEventEditor} />}
    </aside>
  );
}
