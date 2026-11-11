/**
 * PURPOSE: Where a drag over the hierarchy would land: onto a row (it becomes the parent) or
 * between rows (a place among one parent's children).
 *
 * INPUT: The rows on show, the entities, the ids being dragged, and where the pointer is on a row.
 * OUTPUT: A `DropTarget`, or null. Whether the move is allowed is a separate question
 * (`canReparentEntities`).
 *
 * Plain functions: no React, no store, no DOM. The hook that reads the pointer is
 * useHierarchyDragDrop.ts.
 */

import type { Entity } from "../../scene/types";
import { getChildren, getEntityIndex } from "../../scene/entityIndex";
import type { DropTarget, FlatRow } from "./hierarchyTypes";

// The top and bottom quarters of a row drop before and after it; the middle half drops onto it.
const EDGE_ZONE = 0.25;

/**
 * Insertion index among `parentId`'s children with the dragged entities
 * removed — exactly the semantics reparentEntities expects. With no reference
 * row (or one that isn't a child of `parentId`), the end.
 */
export function insertionIndex(
  entities: Entity[],
  draggedIds: string[],
  parentId: string | null,
  referenceId: string | null,
  after: boolean,
): number {
  const dragged = new Set(draggedIds);
  const siblings = getChildren(entities, parentId).filter((sibling) => !dragged.has(sibling.id));
  if (!referenceId) return siblings.length;
  const referenceIndex = siblings.findIndex((sibling) => sibling.id === referenceId);
  if (referenceIndex === -1) return siblings.length;
  return after ? referenceIndex + 1 : referenceIndex;
}

export interface RowPointer {
  /** How far down the row the pointer is: 0 at its top edge, 1 at its bottom. */
  ratio: number;
  /** The indent level under the pointer. Only asked for when several levels share the gap. */
  getCursorDepth: () => number;
}

/** Where a drag hovering over the row `rowId` would land. Null when the row isn't on show. */
export function computeDropTarget(
  flatRows: FlatRow[],
  entities: Entity[],
  draggedIds: string[],
  rowId: string,
  pointer: RowPointer,
): DropTarget | null {
  const rowIndex = flatRows.findIndex((row) => row.id === rowId);
  if (rowIndex === -1) return null;
  const row = flatRows[rowIndex];
  const { byId } = getEntityIndex(entities);
  const entity = byId.get(row.id);
  if (!entity) return null;

  // Top quarter: insert before this row among its siblings.
  if (pointer.ratio < EDGE_ZONE) {
    const parentId = entity.parentId ?? null;
    return {
      kind: "between",
      parentId,
      index: insertionIndex(entities, draggedIds, parentId, row.id, false),
      indicatorRowId: row.id,
      edge: "top",
      depth: row.depth,
    };
  }

  // Bottom quarter: insert after. An expanded branch's "after" slot is its
  // first-child position; at the end of a subtree the same gap visually
  // belongs to several ancestors, so cursor X picks the indent level
  // (Blender's drop-indicator indent snap).
  if (pointer.ratio > 1 - EDGE_ZONE) {
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

    const cursorDepth = pointer.getCursorDepth();
    let best = candidates[0];
    for (const candidate of candidates) {
      if (Math.abs(candidate.depth - cursorDepth) < Math.abs(best.depth - cursorDepth)) best = candidate;
    }
    return {
      kind: "between",
      parentId: best.parentId,
      index: insertionIndex(entities, draggedIds, best.parentId, best.refId, true),
      indicatorRowId: row.id,
      edge: "bottom",
      depth: best.depth,
    };
  }

  return { kind: "onto", targetId: row.id };
}
