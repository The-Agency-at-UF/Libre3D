import { memo, useState, useRef, useEffect } from "react";
import { useEditorStore, type Entity } from "../../store/useEditorStore";
import { getEntityIndex, isLockedByAncestor } from "../../scene/entityIndex";
import { EyeIcon, LockIcon } from "../ui/Icons";
import { ROW_INDENT_BASE_REM, ROW_INDENT_STEP_REM } from "./hierarchyTypes";

interface HierarchyItemProps {
  entityId: string;
  depth: number;
  hasChildren: boolean;
  isExpanded: boolean;
  isSelected: boolean;
  isActive: boolean;
  isRenaming: boolean;
  dropIndicator: "onto" | "top" | "bottom" | null;
  dropDepth: number;
  onToggleExpand: (id: string) => void;
  onRowClick: (id: string, event: React.MouseEvent) => void;
  onRowContextMenu: (id: string, event: React.MouseEvent) => void;
  onRowDragStart: (id: string, event: React.DragEvent) => void;
  onRowDragOver: (id: string, event: React.DragEvent) => void;
  onRowDrop: (id: string, event: React.DragEvent) => void;
  onRowDragEnd: () => void;
  onRequestRename: (id: string) => void;
  onFinishRename: () => void;
}

// Tabler webfont classes (already loaded via CDN in index.html) — the
// glanceable replacement for the removed text type badge.
const iconClassForEntity = (entity: Entity): string => {
  switch (entity.type) {
    case "cube":
      return "ti ti-cube";
    case "sphere":
      return "ti ti-sphere";
    case "torus":
      return "ti ti-torus";
    case "plane":
      return "ti ti-square";
    case "path":
      return "ti ti-vector-spline";
    case "shape":
      return "ti ti-vector-bezier";
    case "image":
      return "ti ti-photo";
    case "directionalLight":
      return "ti ti-sun";
    case "group":
      return "ti ti-folder";
    case "importedModel":
      // The import root carries the asset; inner nodes are plain glTF nodes.
      return entity.assetId ? "ti ti-package" : "ti ti-point";
    default:
      return "ti ti-point";
  }
};

function HierarchyItem({
  entityId,
  depth,
  hasChildren,
  isExpanded,
  isSelected,
  isActive,
  isRenaming,
  dropIndicator,
  dropDepth,
  onToggleExpand,
  onRowClick,
  onRowContextMenu,
  onRowDragStart,
  onRowDragOver,
  onRowDrop,
  onRowDragEnd,
  onRequestRename,
  onFinishRename,
}: HierarchyItemProps) {
  // Through the index: selectors run on every store write, so a search of `entities` here would
  // cost every mounted row a pass over the scene each time.
  const entity = useEditorStore((state) => getEntityIndex(state.entities).byId.get(entityId));
  // True when a locked ancestor locks this row; its own `locked` flag is kept.
  const inheritedLock = useEditorStore((state) => isLockedByAncestor(state.entities, entityId));
  const removeEntity = useEditorStore((state) => state.removeEntity);
  const toggleVisibility = useEditorStore((state) => state.toggleVisibility);
  const toggleLock = useEditorStore((state) => state.toggleLock);
  const renameEntity = useEditorStore((state) => state.renameEntity);
  const isReadOnly = useEditorStore((state) => state.readOnlyReason !== null);

  const [editName, setEditName] = useState("");
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Rename can start from double-click or F2 — either way the panel owns
  // `renamingId`, and this effect seeds/focuses the input when it points here.
  // Focus is deferred a frame so select() runs against the seeded value, not
  // the input's initial empty string.
  const entityName = entity?.name ?? "";
  useEffect(() => {
    if (!isRenaming) return;
    setEditName(entityName);
    const frame = requestAnimationFrame(() => {
      inputRef.current?.focus();
      inputRef.current?.select();
    });
    return () => cancelAnimationFrame(frame);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRenaming]);

  if (!entity) return null;

  const isLocked = entity.locked || inheritedLock;

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isLocked || isReadOnly) return; // Cannot rename locked elements, or in a view-only scene
    onRequestRename(entity.id);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      saveRename();
    } else if (e.key === "Escape") {
      onFinishRename();
    }
  };

  const saveRename = () => {
    const trimmed = editName.trim();
    if (trimmed) {
      renameEntity(entity.id, trimmed);
    }
    onFinishRename();
  };

  // Depth is already compressed by the caller so single-child "pass-through"
  // chains (common in imported glTF: RootNode > Object_4 > _rootJoint, etc.)
  // don't each consume their own indent level. This cap is just a last-resort
  // safety net for genuinely wide/deep branching trees so a row can never be
  // indented so far that its label and controls get clipped.
  const visualDepth = Math.min(depth, 24);

  return (
    <div
      className={`editor-tree-item${isSelected ? " editor-tree-item--selected" : ""}${isActive ? " editor-tree-item--active" : ""}${isLocked ? " editor-tree-item--locked" : ""}${dropIndicator === "onto" ? " editor-tree-item--drop-onto" : ""}`}
      style={{ paddingLeft: `${ROW_INDENT_BASE_REM + visualDepth * ROW_INDENT_STEP_REM}rem` }}
      data-entity-id={entity.id}
      onContextMenu={(e) => onRowContextMenu(entity.id, e)}
      draggable={!isRenaming && !isReadOnly}
      onDragStart={(e) => onRowDragStart(entity.id, e)}
      onDragOver={(e) => onRowDragOver(entity.id, e)}
      onDrop={(e) => onRowDrop(entity.id, e)}
      onDragEnd={onRowDragEnd}
    >
      {(dropIndicator === "top" || dropIndicator === "bottom") && (
        <div
          className={`hierarchy-drop-line hierarchy-drop-line--${dropIndicator}`}
          style={{ left: `${ROW_INDENT_BASE_REM + Math.min(dropDepth, 24) * ROW_INDENT_STEP_REM}rem` }}
        />
      )}
      {/* One vertical connector per ancestor indent level, centered under the
          ancestor's expand arrow; -2px top bridges the tree's row gap. */}
      {Array.from({ length: visualDepth }, (_, level) => (
        <span
          key={level}
          className="hierarchy-depth-guide"
          style={{ left: `${ROW_INDENT_BASE_REM + level * ROW_INDENT_STEP_REM + 0.32}rem` }}
        />
      ))}
      <div className="editor-tree-main-row">
        {hasChildren ? (
          <button
            className="hierarchy-expand-btn"
            type="button"
            aria-label={isExpanded ? "Collapse" : "Expand"}
            onClick={(e) => {
              e.stopPropagation();
              onToggleExpand(entity.id);
            }}
          >
            {isExpanded ? "▾" : "▸"}
          </button>
        ) : (
          <span className="hierarchy-expand-spacer" />
        )}
        {isRenaming ? (
          <input
            ref={inputRef}
            className="hierarchy-rename-input"
            type="text"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            onBlur={saveRename}
            onKeyDown={handleKeyDown}
          />
        ) : (
          <button
            className="editor-tree-select"
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onRowClick(entity.id, e);
            }}
            onDoubleClick={handleDoubleClick}
          >
            <i className={`editor-tree-icon ${iconClassForEntity(entity)}`} aria-hidden="true" />
            <span className="editor-tree-name">{entity.name}</span>
          </button>
        )}

        <div className="hierarchy-item-actions">
          <button
            className={`hierarchy-action-btn${entity.visible ? "" : " inactive"}`}
            type="button"
            aria-label={entity.visible ? "Hide entity" : "Show entity"}
            disabled={isReadOnly}
            onClick={(e) => {
              e.stopPropagation();
              toggleVisibility(entity.id);
            }}
          >
            <EyeIcon visible={entity.visible} />
          </button>
          <button
            className={`hierarchy-action-btn${entity.locked ? " active-locked" : inheritedLock ? " inherited-locked" : ""}`}
            type="button"
            aria-label={entity.locked ? "Unlock entity" : inheritedLock ? "Locked by parent" : "Lock entity"}
            title={inheritedLock && !entity.locked ? "Locked by parent — unlock the parent to edit" : undefined}
            disabled={isReadOnly || (inheritedLock && !entity.locked)}
            onClick={(e) => {
              e.stopPropagation();
              toggleLock(entity.id);
            }}
          >
            <LockIcon locked={isLocked} />
          </button>
          <button
            className="editor-tree-delete"
            type="button"
            aria-label={`Delete ${entity.name}`}
            disabled={isLocked || isReadOnly}
            onClick={(event) => {
              event.stopPropagation();
              removeEntity([entity.id]);
            }}
          >
            ×
          </button>
        </div>
      </div>
    </div>
  );
}

// What the panel renders: a row re-renders when its own entity, inherited lock, or props change,
// not on every edit to the scene. That depends on the panel passing handlers that keep their
// identity (`useStableCallback` below) and on `isSelected` coming in as a prop, so that a row
// doesn't read the whole selection.
export const MemoizedHierarchyItem = memo(HierarchyItem);
