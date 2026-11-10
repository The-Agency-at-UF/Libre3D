/**
 * PURPOSE: Works out what the inspector shows of the selection, so `RightSidebar` can select those
 * facts from the store and re-render only when one of them changes.
 *
 * INPUT: The store's `entities` and `selectedEntityIds`.
 * OUTPUT: The selected entities in scene order, and the shapes the Shape panel acts on.
 *
 * The result is kept for the last pair of arrays. The store replaces an array whenever its content
 * changes and runs every selector on every write, so a write that touches neither (a camera move)
 * costs two comparisons here, not a pass over the scene. No store or React import: plain data in,
 * plain data out.
 */

import type { Entity } from "../../scene/types";
import { getDescendantIds } from "../../scene/entityIndex";

export interface InspectedSelection {
  /** The selected entities, in the order of `entities`. An id that matches no entity is skipped. */
  selected: Entity[];
  /**
   * The selected shapes and the shapes inside selected groups (an SVG import selects its group),
   * in scene order. Empty unless everything selected is a shape or a group.
   */
  reachedShapes: Entity[];
}

let last: { entities: Entity[]; selectedIds: string[]; result: InspectedSelection } | null = null;

export function inspectSelection(entities: Entity[], selectedIds: string[]): InspectedSelection {
  if (last && last.entities === entities && last.selectedIds === selectedIds) return last.result;

  const selectedIdSet = new Set(selectedIds);
  const selected = selectedIds.length > 0 ? entities.filter((entity) => selectedIdSet.has(entity.id)) : [];

  let reachedShapes: Entity[] = [];
  if (selected.length > 0 && selected.every((entity) => entity.type === "shape" || entity.type === "group")) {
    const reachedIds = new Set([...selectedIds, ...selectedIds.flatMap((id) => getDescendantIds(entities, id))]);
    reachedShapes = entities.filter((entity) => entity.type === "shape" && reachedIds.has(entity.id));
  }

  const result = { selected, reachedShapes };
  last = { entities, selectedIds, result };
  return result;
}
