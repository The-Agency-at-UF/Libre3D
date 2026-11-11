import { useRef, useState, type RefObject } from "react";
import { useEditorStore } from "../../store/useEditorStore";
import type { Entity } from "../../scene/types";
import { canReparentEntities, filterMoveRoots, isEffectivelyLocked } from "../../scene/entityIndex";
import { useStableCallback } from "../../hooks/useStableCallback";
import { computeDropTarget, insertionIndex } from "./hierarchyDrop";
import { ROW_INDENT_BASE_REM, ROW_INDENT_STEP_REM, type DropTarget, type FlatRow } from "./hierarchyTypes";

// How long a drag hovers on a collapsed branch before it opens, in milliseconds.
const AUTO_EXPAND_DELAY_MS = 650;

interface HierarchyDragDropOptions {
  entities: Entity[];
  flatRows: FlatRow[];
  collapsedIds: Set<string>;
  expandRow: (id: string) => void;
  /** The panel's element: a drag that leaves it clears the drop mark. */
  containerRef: RefObject<HTMLDivElement | null>;
  /** Makes an unselected row the whole selection when a drag starts on it. */
  selectOnly: (id: string) => void;
}

/**
 * Dragging rows in the hierarchy to reorder and re-parent them. Returns the handlers for a row and
 * for the panel (the empty space under the rows), and `dropTarget`, where the drag would land, for
 * drawing the mark. Where a pointer position lands is worked out in hierarchyDrop.ts; whether the
 * move is allowed is `canReparentEntities`, and the move itself is the store's `reparentEntities`.
 */
export function useHierarchyDragDrop({ entities, flatRows, collapsedIds, expandRow, containerRef, selectOnly }: HierarchyDragDropOptions) {
  const reparentEntities = useEditorStore((state) => state.reparentEntities);
  // The ids being dragged live in a ref, not dataTransfer — browsers hide
  // dataTransfer contents during dragover, and we need them there to compute
  // legality (blocked cursor) per hovered row.
  const draggedIdsRef = useRef<string[]>([]);
  const [dropTarget, setDropTarget] = useState<DropTarget | null>(null);
  const dragExpandTimer = useRef<{ id: string; timer: number } | null>(null);

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
      }, AUTO_EXPAND_DELAY_MS),
    };
  };

  // Where the pointer is on the hovered row, for hierarchyDrop's math.
  const dropTargetAt = (rowId: string, event: React.DragEvent): DropTarget | null => {
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    return computeDropTarget(flatRows, entities, draggedIdsRef.current, rowId, {
      ratio: (event.clientY - rect.top) / Math.max(rect.height, 1),
      getCursorDepth: () => {
        const rem = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
        return Math.round(((event.clientX - rect.left) / rem - ROW_INDENT_BASE_REM) / ROW_INDENT_STEP_REM);
      },
    });
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
      selectOnly(id);
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

    const target = dropTargetAt(id, event);
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
    const target = dropTargetAt(id, event);
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
      index: insertionIndex(entities, draggedIdsRef.current, null, null, false),
      indicatorRowId: lastRow?.id ?? "",
      edge: "bottom",
      depth: flatRows[0]?.depth ?? 0,
    });
  };

  const handleContainerDrop = (event: React.DragEvent) => {
    event.preventDefault();
    const ids = draggedIdsRef.current;
    if (ids.length > 0 && canReparentEntities(entities, ids, null)) {
      reparentEntities(ids, null, insertionIndex(entities, ids, null, null, false));
    }
    clearDrag();
  };

  const handleContainerDragLeave = (event: React.DragEvent) => {
    // Only clear when the drag actually leaves the panel, not when moving
    // between child rows.
    if (!containerRef.current?.contains(event.relatedTarget as Node)) setDropTarget(null);
  };

  return {
    dropTarget,
    handleRowDragStart,
    handleRowDragOver,
    handleRowDrop,
    clearDrag,
    handleContainerDragOver,
    handleContainerDrop,
    handleContainerDragLeave,
  };
}
