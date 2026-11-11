import { useState, useRef, useEffect, useMemo } from "react";
import { useEditorStore } from "../../store/useEditorStore";
import { useStableCallback } from "../../hooks/useStableCallback";
import {
  getChildren,
  getEntityIndex,
  filterMoveRoots,
  canReparentEntities,
  isEffectivelyLocked,
} from "../../scene/entityIndex";
import { BatchRenameDialog } from "./BatchRenameDialog";
import { HierarchyContextMenu } from "./HierarchyContextMenu";
import { MemoizedHierarchyItem } from "./HierarchyItem";
import { ROW_INDENT_BASE_REM, ROW_INDENT_STEP_REM, type ContextMenuState, type DropTarget } from "./hierarchyTypes";
import { useHierarchyRows } from "./useHierarchyRows";

// Above this many visible rows the tree windows its rendering: only rows in
// (and near) the scroll viewport mount, with spacer divs standing in for the
// rest. Below it, plain full rendering — simpler and plenty fast.
const VIRTUALIZE_THRESHOLD = 200;
const VIRTUALIZE_OVERSCAN = 12;

export function HierarchyPanel({ searchQuery = "" }: { searchQuery?: string }) {
  const entities = useEditorStore((state) => state.entities) ?? [];
  // Each row gets `isSelected` from this set, so a click re-renders the rows whose answer changed.
  const selectedEntityIds = useEditorStore((state) => state.selectedEntityIds);
  const selectedIdSet = useMemo(() => new Set(selectedEntityIds), [selectedEntityIds]);
  const selectEntity = useEditorStore((state) => state.selectEntity);
  const selectEntities = useEditorStore((state) => state.selectEntities);
  const reparentEntities = useEditorStore((state) => state.reparentEntities);
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
  // The ids being dragged live in a ref, not dataTransfer — browsers hide
  // dataTransfer contents during dragover, and we need them there to compute
  // legality (blocked cursor) per hovered row.
  const draggedIdsRef = useRef<string[]>([]);
  const [dropTarget, setDropTarget] = useState<DropTarget | null>(null);
  const dragExpandTimer = useRef<{ id: string; timer: number } | null>(null);
  const [batchRenameOpen, setBatchRenameOpen] = useState(false);
  // Virtualization: mounted row window (null = render everything).
  const treeRef = useRef<HTMLDivElement | null>(null);
  const scrollParentRef = useRef<HTMLElement | null>(null);
  const rowPitchRef = useRef(26);
  const [rowWindow, setRowWindow] = useState<{ start: number; end: number } | null>(null);

  // Window the mounted rows to the scroll viewport once the tree is large.
  useEffect(() => {
    if (flatRows.length <= VIRTUALIZE_THRESHOLD) {
      scrollParentRef.current = null;
      setRowWindow(null);
      return;
    }
    const treeEl = treeRef.current;
    if (!treeEl) return;

    let scroller: HTMLElement | null = treeEl.parentElement;
    while (scroller && scroller !== document.body) {
      const { overflowY } = getComputedStyle(scroller);
      if (overflowY === "auto" || overflowY === "scroll") break;
      scroller = scroller.parentElement;
    }
    if (scroller === document.body) scroller = null;
    scrollParentRef.current = scroller;

    const update = () => {
      // Pitch (row height + tree gap) measured from two mounted neighbors.
      const rows = treeEl.querySelectorAll("[data-entity-id]");
      if (rows.length >= 2) {
        const pitch = rows[1].getBoundingClientRect().top - rows[0].getBoundingClientRect().top;
        if (pitch > 8) rowPitchRef.current = pitch;
      }
      const pitch = rowPitchRef.current;
      const viewTop = scroller ? scroller.getBoundingClientRect().top : 0;
      const viewHeight = scroller ? scroller.clientHeight : window.innerHeight;
      const scrolledPast = viewTop - treeEl.getBoundingClientRect().top;
      const start = Math.max(0, Math.floor(scrolledPast / pitch) - VIRTUALIZE_OVERSCAN);
      const count = Math.ceil(viewHeight / pitch) + VIRTUALIZE_OVERSCAN * 2;
      setRowWindow((prev) => {
        const next = { start, end: Math.min(flatRows.length, start + count) };
        return prev && prev.start === next.start && prev.end === next.end ? prev : next;
      });
    };

    update();
    const target: HTMLElement | Window = scroller ?? window;
    target.addEventListener("scroll", update, { passive: true });
    const resizeObserver = new ResizeObserver(update);
    if (scroller) resizeObserver.observe(scroller);
    return () => {
      target.removeEventListener("scroll", update);
      resizeObserver.disconnect();
    };
  }, [flatRows.length]);

  const scrollRowIntoView = (id: string) => {
    const el = containerRef.current?.querySelector(`[data-entity-id="${CSS.escape(id)}"]`);
    if (el) {
      el.scrollIntoView({ block: "nearest" });
      return;
    }
    // Virtualized and not mounted: jump the scroll container to the row's
    // computed offset; the window effect mounts it on the resulting scroll.
    const rowIndex = flatRows.findIndex((row) => row.id === id);
    const scroller = scrollParentRef.current;
    const treeEl = treeRef.current;
    if (rowIndex === -1 || !scroller || !treeEl) return;
    const treeTopInScroller =
      treeEl.getBoundingClientRect().top - scroller.getBoundingClientRect().top + scroller.scrollTop;
    scroller.scrollTop = treeTopInScroller + rowIndex * rowPitchRef.current - scroller.clientHeight / 2;
  };

  // Replace-select every visible row between the two ids (inclusive).
  const selectRange = (fromId: string, toId: string): boolean => {
    const fromIndex = flatRows.findIndex((row) => row.id === fromId);
    const toIndex = flatRows.findIndex((row) => row.id === toId);
    if (fromIndex === -1 || toIndex === -1) return false;

    const [lo, hi] = fromIndex < toIndex ? [fromIndex, toIndex] : [toIndex, fromIndex];
    selectEntities(flatRows.slice(lo, hi + 1).map((row) => row.id), "replace");
    return true;
  };

  // --- Drag and drop ---

  const cancelAutoExpand = () => {
    if (dragExpandTimer.current) {
      clearTimeout(dragExpandTimer.current.timer);
      dragExpandTimer.current = null;
    }
  };

  const clearDrag = useStableCallback(() => {
    draggedIdsRef.current = [];
    setDropTarget(null);
    cancelAutoExpand();
  });

  // Hovering "onto" a collapsed branch expands it after a short dwell so the
  // user can dive into subtrees mid-drag (standard file-tree behavior).
  const scheduleAutoExpand = (id: string) => {
    if (!collapsedIds.has(id) || dragExpandTimer.current?.id === id) return;
    cancelAutoExpand();
    dragExpandTimer.current = {
      id,
      timer: window.setTimeout(() => {
        dragExpandTimer.current = null;
        expandRow(id);
      }, 650),
    };
  };

  // Insertion index among `parentId`'s children with the dragged entities
  // removed — exactly the semantics reparentEntities expects.
  const insertionIndex = (parentId: string | null, referenceId: string | null, after: boolean): number => {
    const dragged = new Set(draggedIdsRef.current);
    const siblings = getChildren(entities, parentId).filter((sibling) => !dragged.has(sibling.id));
    if (!referenceId) return siblings.length;
    const referenceIndex = siblings.findIndex((sibling) => sibling.id === referenceId);
    if (referenceIndex === -1) return siblings.length;
    return after ? referenceIndex + 1 : referenceIndex;
  };

  const computeDropTarget = (rowId: string, event: React.DragEvent): DropTarget | null => {
    const rowIndex = flatRows.findIndex((row) => row.id === rowId);
    if (rowIndex === -1) return null;
    const row = flatRows[rowIndex];
    const { byId } = getEntityIndex(entities);
    const entity = byId.get(row.id);
    if (!entity) return null;

    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    const ratio = (event.clientY - rect.top) / Math.max(rect.height, 1);

    // Top quarter: insert before this row among its siblings.
    if (ratio < 0.25) {
      const parentId = entity.parentId ?? null;
      return {
        kind: "between",
        parentId,
        index: insertionIndex(parentId, row.id, false),
        indicatorRowId: row.id,
        edge: "top",
        depth: row.depth,
      };
    }

    // Bottom quarter: insert after. An expanded branch's "after" slot is its
    // first-child position; at the end of a subtree the same gap visually
    // belongs to several ancestors, so cursor X picks the indent level
    // (Blender's drop-indicator indent snap).
    if (ratio > 0.75) {
      if (row.hasChildren && row.isExpanded) {
        return {
          kind: "between",
          parentId: row.id,
          index: 0,
          indicatorRowId: row.id,
          edge: "bottom",
          depth: row.depth + 1,
        };
      }

      const nextRow = flatRows[rowIndex + 1] ?? null;
      const minDepth = nextRow ? nextRow.depth : (flatRows[0]?.depth ?? 0);

      const candidates = [{ parentId: entity.parentId ?? null, refId: entity.id, depth: row.depth }];
      let current = entity;
      while (current.parentId && candidates[candidates.length - 1].depth > minDepth) {
        const parent = byId.get(current.parentId);
        if (!parent) break;
        const parentRow = flatRows.find((r) => r.id === parent.id);
        const parentDepth = parentRow?.depth ?? 0;
        if (parentDepth < minDepth) break;
        candidates.push({ parentId: parent.parentId ?? null, refId: parent.id, depth: parentDepth });
        current = parent;
      }

      const rem = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
      const cursorDepth = Math.round(
        ((event.clientX - rect.left) / rem - ROW_INDENT_BASE_REM) / ROW_INDENT_STEP_REM,
      );
      let best = candidates[0];
      for (const candidate of candidates) {
        if (Math.abs(candidate.depth - cursorDepth) < Math.abs(best.depth - cursorDepth)) best = candidate;
      }
      return {
        kind: "between",
        parentId: best.parentId,
        index: insertionIndex(best.parentId, best.refId, true),
        indicatorRowId: row.id,
        edge: "bottom",
        depth: best.depth,
      };
    }

    return { kind: "onto", targetId: row.id };
  };

  const handleRowDragStart = useStableCallback((id: string, event: React.DragEvent) => {
    const state = useEditorStore.getState();
    const entity = state.entities.find((e) => e.id === id);
    if (!entity || isEffectivelyLocked(state.entities, id)) {
      event.preventDefault();
      return;
    }

    // Dragging a selected row moves the whole selection (its move roots);
    // dragging an unselected row selects and moves just that row.
    let ids: string[];
    if (state.selectedEntityIds.includes(id)) {
      ids = filterMoveRoots(state.entities, state.selectedEntityIds).filter((rootId) => {
        return !isEffectivelyLocked(state.entities, rootId);
      });
    } else {
      selectEntity(id, false);
      setActiveId(id);
      setAnchorId(id);
      ids = [id];
    }
    if (ids.length === 0) {
      event.preventDefault();
      return;
    }

    draggedIdsRef.current = ids;
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", "libre3d-entities"); // Firefox needs data to start a drag

    if (ids.length > 1) {
      const ghost = document.createElement("div");
      ghost.className = "hierarchy-drag-ghost";
      ghost.textContent = `${ids.length} objects`;
      document.body.appendChild(ghost);
      event.dataTransfer.setDragImage(ghost, 12, 12);
      setTimeout(() => ghost.remove(), 0); // only needs to exist for the capture
    }
  });

  const handleRowDragOver = useStableCallback((id: string, event: React.DragEvent) => {
    event.stopPropagation();
    if (draggedIdsRef.current.length === 0) return; // foreign drag (files, etc.)

    const target = computeDropTarget(id, event);
    const newParentId = target ? (target.kind === "onto" ? target.targetId : target.parentId) : null;
    const legal = !!target && canReparentEntities(entities, draggedIdsRef.current, newParentId);

    if (legal) {
      // Without preventDefault the browser shows the blocked cursor and
      // refuses the drop — exactly what an illegal target should do.
      event.preventDefault();
      event.dataTransfer.dropEffect = "move";
    }
    setDropTarget(legal ? target : null);

    if (legal && target!.kind === "onto") {
      const row = flatRows.find((r) => r.id === id);
      if (row?.hasChildren && !row.isExpanded) scheduleAutoExpand(id);
    } else {
      cancelAutoExpand();
    }
  });

  const handleRowDrop = useStableCallback((id: string, event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
    const ids = draggedIdsRef.current;
    const target = computeDropTarget(id, event);
    if (ids.length > 0 && target) {
      const newParentId = target.kind === "onto" ? target.targetId : target.parentId;
      if (canReparentEntities(entities, ids, newParentId)) {
        if (target.kind === "onto") {
          reparentEntities(ids, target.targetId);
        } else {
          reparentEntities(ids, target.parentId, target.index);
        }
      }
    }
    clearDrag();
  });

  // Empty space below the rows: move to the end of the scene root.
  const handleContainerDragOver = (event: React.DragEvent) => {
    if (draggedIdsRef.current.length === 0) return;
    const legal = canReparentEntities(entities, draggedIdsRef.current, null);
    if (!legal) {
      setDropTarget(null);
      return;
    }
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
    const lastRow = flatRows[flatRows.length - 1];
    setDropTarget({
      kind: "between",
      parentId: null,
      index: insertionIndex(null, null, false),
      indicatorRowId: lastRow?.id ?? "",
      edge: "bottom",
      depth: flatRows[0]?.depth ?? 0,
    });
  };

  const handleContainerDrop = (event: React.DragEvent) => {
    event.preventDefault();
    const ids = draggedIdsRef.current;
    if (ids.length > 0 && canReparentEntities(entities, ids, null)) {
      reparentEntities(ids, null, insertionIndex(null, null, false));
    }
    clearDrag();
  };

  // The handlers passed to a row go through useStableCallback: rows are memoized, and a handler
  // that was a new function on every render would re-render all of them on every edit.
  //
  // Right-clicking an unselected row selects it first (Blender/Spline
  // behavior); right-clicking inside the selection keeps it, so menu actions
  // operate on the whole multi-selection.
  const handleRowContextMenu = useStableCallback((id: string, event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    if (!useEditorStore.getState().selectedEntityIds.includes(id)) {
      selectEntity(id, false);
      setActiveId(id);
      setAnchorId(id);
    }
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
      onDragLeave={(e) => {
        // Only clear when the drag actually leaves the panel, not when moving
        // between child rows.
        if (!containerRef.current?.contains(e.relatedTarget as Node)) setDropTarget(null);
      }}
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
        {rowWindow && rowWindow.start > 0 && (
          <div style={{ height: rowWindow.start * rowPitchRef.current - 2, flexShrink: 0 }} aria-hidden="true" />
        )}
        {(rowWindow ? flatRows.slice(rowWindow.start, rowWindow.end) : flatRows).map((row) => (
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
        {rowWindow && rowWindow.end < flatRows.length && (
          <div
            style={{ height: (flatRows.length - rowWindow.end) * rowPitchRef.current - 2, flexShrink: 0 }}
            aria-hidden="true"
          />
        )}
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
