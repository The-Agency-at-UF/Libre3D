import { useState, useRef, useMemo } from "react";
import { useEditorStore } from "../../store/useEditorStore";
import { useStableCallback } from "../../hooks/useStableCallback";
import { isEffectivelyLocked } from "../../scene/entityIndex";
import { BatchRenameDialog } from "./BatchRenameDialog";
import { HierarchyContextMenu } from "./HierarchyContextMenu";
import { MemoizedHierarchyItem } from "./HierarchyItem";
import type { ContextMenuState } from "./hierarchyTypes";
import { useHierarchyDragDrop } from "./useHierarchyDragDrop";
import { useHierarchyRows } from "./useHierarchyRows";
import { useRowWindow } from "./useRowWindow";

export function HierarchyPanel({ searchQuery = "" }: { searchQuery?: string }) {
  const entities = useEditorStore((state) => state.entities) ?? [];
  // Each row gets `isSelected` from this set, so a click re-renders the rows whose answer changed.
  const selectedEntityIds = useEditorStore((state) => state.selectedEntityIds);
  const selectedIdSet = useMemo(() => new Set(selectedEntityIds), [selectedEntityIds]);
  const selectEntity = useEditorStore((state) => state.selectEntity);
  const selectEntities = useEditorStore((state) => state.selectEntities);
  const { flatRows, trimmedQuery, collapsedIds, toggleExpand, setSubtreeCollapsed, expandRow } = useHierarchyRows(entities, searchQuery);
  // Keyboard cursor + range anchor. `activeId` follows every click and arrow
  // move; `anchorId` only follows non-shift clicks, so successive Shift+Clicks
  // extend from the same origin (standard file-browser / Blender behavior).
  const [activeId, setActiveId] = useState<string | null>(null);
  const [anchorId, setAnchorId] = useState<string | null>(null);
  const pendingImportCount = useEditorStore((state) => state.pendingImportCount);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [contextMenu, setContextMenu] = useState<ContextMenuState | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [batchRenameOpen, setBatchRenameOpen] = useState(false);
  const { treeRef, mountedRows, spacerAbove, spacerBelow, scrollRowIntoView } = useRowWindow(flatRows, containerRef);

  // Replace-select every visible row between the two ids (inclusive).
  const selectRange = (fromId: string, toId: string): boolean => {
    const fromIndex = flatRows.findIndex((row) => row.id === fromId);
    const toIndex = flatRows.findIndex((row) => row.id === toId);
    if (fromIndex === -1 || toIndex === -1) return false;

    const [lo, hi] = fromIndex < toIndex ? [fromIndex, toIndex] : [toIndex, fromIndex];
    selectEntities(flatRows.slice(lo, hi + 1).map((row) => row.id), "replace");
    return true;
  };

  // One row becomes the whole selection, the keyboard's row, and the range's start.
  const selectOnly = (id: string) => {
    selectEntity(id, false);
    setActiveId(id);
    setAnchorId(id);
  };

  const {
    dropTarget,
    handleRowDragStart,
    handleRowDragOver,
    handleRowDrop,
    clearDrag,
    handleContainerDragOver,
    handleContainerDrop,
    handleContainerDragLeave,
  } = useHierarchyDragDrop({ entities, flatRows, collapsedIds, expandRow, containerRef, selectOnly });

  // The handlers passed to a row go through useStableCallback: rows are memoized, and a handler
  // that was a new function on every render would re-render all of them on every edit.
  //
  // Right-clicking an unselected row selects it first (Blender/Spline
  // behavior); right-clicking inside the selection keeps it, so menu actions
  // operate on the whole multi-selection.
  const handleRowContextMenu = useStableCallback((id: string, event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    if (!useEditorStore.getState().selectedEntityIds.includes(id)) selectOnly(id);
    setContextMenu({ x: event.clientX, y: event.clientY, targetId: id });
  });

  const handleRowClick = useStableCallback((id: string, event: React.MouseEvent) => {
    if (event.shiftKey && anchorId && selectRange(anchorId, id)) {
      setActiveId(id);
      return;
    }
    if (event.ctrlKey || event.metaKey) {
      selectEntity(id, true);
    } else {
      selectEntity(id, false);
    }
    setActiveId(id);
    setAnchorId(id);
  });

  const requestRename = useStableCallback((id: string) => {
    setRenamingId(id);
    setActiveId(id);
  });

  const finishRename = useStableCallback(() => setRenamingId(null));

  // Outliner-scoped keys — deliberately NOT in the global useHotkeys: they
  // should only fire while the panel (or a row inside it) has focus.
  const handleKeyDown = (event: React.KeyboardEvent) => {
    const target = event.target as HTMLElement;
    if (target.tagName === "INPUT") return; // rename input owns its keys

    const activeIndex = activeId ? flatRows.findIndex((row) => row.id === activeId) : -1;
    const activeRow = activeIndex !== -1 ? flatRows[activeIndex] : null;

    switch (event.key) {
      case "ArrowDown":
      case "ArrowUp": {
        event.preventDefault();
        if (flatRows.length === 0) return;

        const delta = event.key === "ArrowDown" ? 1 : -1;
        const nextIndex = activeIndex === -1
          ? (delta === 1 ? 0 : flatRows.length - 1)
          : Math.min(flatRows.length - 1, Math.max(0, activeIndex + delta));
        const nextId = flatRows[nextIndex].id;

        if (event.shiftKey && anchorId && selectRange(anchorId, nextId)) {
          // extended the range; anchor stays put
        } else {
          selectEntity(nextId, false);
          setAnchorId(nextId);
        }
        setActiveId(nextId);
        scrollRowIntoView(nextId);
        break;
      }
      case "ArrowRight":
      case "ArrowLeft": {
        if (!activeRow || !activeRow.hasChildren) return;
        event.preventDefault();

        const collapse = event.key === "ArrowLeft";
        if (event.shiftKey) {
          setSubtreeCollapsed(activeRow.id, collapse);
        } else if (collapse === activeRow.isExpanded) {
          toggleExpand(activeRow.id);
        }
        break;
      }
      case "F2": {
        if (!activeId) return;
        if (
          !entities.some((e) => e.id === activeId) ||
          isEffectivelyLocked(entities, activeId) ||
          useEditorStore.getState().readOnlyReason
        ) {
          return;
        }
        event.preventDefault();
        setRenamingId(activeId);
        break;
      }
      default:
        break;
    }
  };

  return (
    <div
      ref={containerRef}
      style={{ display: "grid", gap: "0.85rem", minHeight: "100%", outline: "none" }}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      onClick={(e) => {
        if (!e.shiftKey && !e.ctrlKey && !e.metaKey) selectEntity(null);
      }}
      onContextMenu={(e) => {
        e.preventDefault();
        setContextMenu({ x: e.clientX, y: e.clientY, targetId: null });
      }}
      onDragOver={handleContainerDragOver}
      onDrop={handleContainerDrop}
      onDragLeave={handleContainerDragLeave}
    >
      <div className="editor-tree" aria-label="Scene hierarchy" ref={treeRef}>
        {pendingImportCount > 0 && (
          <div className="hierarchy-status-note" role="status">
            <i className="ti ti-loader-2 hierarchy-status-spinner" aria-hidden="true" />
            Importing {pendingImportCount > 1 ? `${pendingImportCount} models` : "model"}…
          </div>
        )}
        {flatRows.length === 0 && pendingImportCount === 0 && (
          <div className="hierarchy-empty-state">
            {trimmedQuery
              ? `No objects match “${searchQuery.trim()}”.`
              : "Scene is empty. Add a shape with the + button, or drop a .glb or .svg file into the viewport."}
          </div>
        )}
        {spacerAbove !== null && <div style={{ height: spacerAbove, flexShrink: 0 }} aria-hidden="true" />}
        {mountedRows.map((row) => (
          <MemoizedHierarchyItem
            key={row.id}
            entityId={row.id}
            depth={row.depth}
            hasChildren={row.hasChildren}
            isExpanded={row.isExpanded}
            isSelected={selectedIdSet.has(row.id)}
            isActive={row.id === activeId}
            isRenaming={row.id === renamingId}
            dropIndicator={
              !dropTarget
                ? null
                : dropTarget.kind === "onto"
                  ? (row.id === dropTarget.targetId ? "onto" : null)
                  : (row.id === dropTarget.indicatorRowId ? dropTarget.edge : null)
            }
            dropDepth={dropTarget?.kind === "between" ? dropTarget.depth : 0}
            onToggleExpand={toggleExpand}
            onRowClick={handleRowClick}
            onRowContextMenu={handleRowContextMenu}
            onRowDragStart={handleRowDragStart}
            onRowDragOver={handleRowDragOver}
            onRowDrop={handleRowDrop}
            onRowDragEnd={clearDrag}
            onRequestRename={requestRename}
            onFinishRename={finishRename}
          />
        ))}
        {spacerBelow !== null && <div style={{ height: spacerBelow, flexShrink: 0 }} aria-hidden="true" />}
      </div>

      {contextMenu && (
        <HierarchyContextMenu
          menu={contextMenu}
          onClose={() => setContextMenu(null)}
          onRename={requestRename}
          onBatchRename={() => setBatchRenameOpen(true)}
        />
      )}
      {batchRenameOpen && <BatchRenameDialog onClose={() => setBatchRenameOpen(false)} />}
    </div>
  );
}
