import { useEffect } from "react";
import { useEditorStore, type Entity } from "../../store/useEditorStore";
import { filterMoveRoots, canReparentEntities, isEffectivelyLocked } from "../../scene/entityIndex";
import type { ContextMenuState } from "./hierarchyTypes";

// Right-click menu. Every action operates on the whole current selection
// (Blender's convention); enablement mirrors the same store guards the
// actions themselves enforce, so a disabled item is never a lie.
export function HierarchyContextMenu({
  menu,
  onClose,
  onRename,
  onBatchRename,
}: {
  menu: ContextMenuState;
  onClose: () => void;
  onRename: (id: string) => void;
  onBatchRename: () => void;
}) {
  const entities = useEditorStore((state) => state.entities);
  const selectedEntityIds = useEditorStore((state) => state.selectedEntityIds);
  const duplicateEntity = useEditorStore((state) => state.duplicateEntity);
  const removeEntity = useEditorStore((state) => state.removeEntity);
  const groupEntities = useEditorStore((state) => state.groupEntities);
  const ungroupEntity = useEditorStore((state) => state.ungroupEntity);
  // View only: everything but Frame Selected would change the scene.
  const isReadOnly = useEditorStore((state) => state.readOnlyReason !== null);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const byId = new Map(entities.map((entity) => [entity.id, entity]));
  const selected = selectedEntityIds
    .map((id) => byId.get(id))
    .filter((entity): entity is Entity => !!entity);
  const targetEntity = menu.targetId ? byId.get(menu.targetId) : undefined;

  const canRename = !isReadOnly && !!targetEntity && !isEffectivelyLocked(entities, targetEntity.id);

  const moveRoots = filterMoveRoots(entities, selectedEntityIds);
  const parentIds = new Set(moveRoots.map((id) => byId.get(id)?.parentId ?? null));
  const groupParentId = parentIds.size === 1 ? [...parentIds][0] : null;
  const canGroup = moveRoots.length > 0 && canReparentEntities(entities, moveRoots, groupParentId);

  const selectedGroups = selected.filter(
    (entity) => entity.type === "group" || (entity.type === "importedModel" && entity.id !== entity.rootEntityId),
  );
  const deletableIds = selected
    .filter((entity) => !isEffectivelyLocked(entities, entity.id))
    .map((entity) => entity.id);
  const hasSelection = selected.length > 0;

  // Keep the menu on-screen when invoked near the viewport edge.
  const MENU_WIDTH = 190;
  const MENU_HEIGHT = 230;
  const x = Math.max(4, Math.min(menu.x, window.innerWidth - MENU_WIDTH - 8));
  const y = Math.max(4, Math.min(menu.y, window.innerHeight - MENU_HEIGHT - 8));

  const run = (action: () => void) => {
    action();
    onClose();
  };

  return (
    <>
      <div
        className="hierarchy-context-overlay"
        onClick={onClose}
        onContextMenu={(event) => {
          event.preventDefault();
          onClose();
        }}
      />
      <div className="hierarchy-context-menu" style={{ left: x, top: y }}>
        <button
          className="hamburger-dropdown-btn"
          type="button"
          disabled={!canRename}
          onClick={() => run(() => onRename(menu.targetId!))}
        >
          <span>Rename</span>
          <span className="hamburger-dropdown-shortcut">F2</span>
        </button>
        <button
          className="hamburger-dropdown-btn"
          type="button"
          disabled={isReadOnly || selected.length < 2}
          onClick={() => run(onBatchRename)}
        >
          <span>Batch Rename…</span>
        </button>
        <button
          className="hamburger-dropdown-btn"
          type="button"
          disabled={isReadOnly || !hasSelection}
          onClick={() => run(() => duplicateEntity(useEditorStore.getState().selectedEntityIds))}
        >
          <span>Duplicate</span>
          <span className="hamburger-dropdown-shortcut">Ctrl+D</span>
        </button>
        <div style={{ height: "1px", background: "var(--border)", margin: "4px 0" }} />
        <button
          className="hamburger-dropdown-btn"
          type="button"
          disabled={isReadOnly || !canGroup}
          onClick={() => run(() => groupEntities(useEditorStore.getState().selectedEntityIds))}
        >
          <span>Group Selection</span>
          <span className="hamburger-dropdown-shortcut">Ctrl+G</span>
        </button>
        <button
          className="hamburger-dropdown-btn"
          type="button"
          disabled={isReadOnly || selectedGroups.length === 0}
          onClick={() => run(() => selectedGroups.forEach((group) => ungroupEntity(group.id)))}
        >
          <span>Ungroup</span>
        </button>
        <div style={{ height: "1px", background: "var(--border)", margin: "4px 0" }} />
        <button
          className="hamburger-dropdown-btn"
          type="button"
          disabled={!hasSelection}
          onClick={() =>
            run(() => {
              window.dispatchEvent(new CustomEvent("libre3d-center-on-selected"));
              window.dispatchEvent(new CustomEvent("libre3d-orientate-to-selected"));
            })
          }
        >
          <span>Frame Selected</span>
          <span className="hamburger-dropdown-shortcut">F</span>
        </button>
        <div style={{ height: "1px", background: "var(--border)", margin: "4px 0" }} />
        <button
          className="hamburger-dropdown-btn"
          type="button"
          disabled={isReadOnly || deletableIds.length === 0}
          onClick={() => run(() => removeEntity(deletableIds))}
        >
          <span>Delete</span>
          <span className="hamburger-dropdown-shortcut">Del</span>
        </button>
      </div>
    </>
  );
}
