/**
 * PURPOSE: Which rows the hierarchy panel shows, and in what order: the scene's tree flattened to
 * a list, with collapsed branches left out and a search narrowing it.
 *
 * INPUT: The entities, the search text, and the ids of collapsed rows.
 * OUTPUT: `FlatRow[]`, top to bottom.
 *
 * Plain functions: no React, no store, no DOM.
 */

import type { Entity } from "../../scene/types";
import { getAncestorIds, getChildren } from "../../scene/entityIndex";
import type { FlatRow } from "./hierarchyTypes";

/**
 * The ids a search shows, or null for "no search, show everything". `query` is already trimmed and
 * lower case. A node is shown if its name or type matches, or if it's an ancestor of a match:
 * otherwise a matching leaf deep in the tree would have no parent rows above it.
 */
export function findVisibleIds(entities: Entity[], query: string): Set<string> | null {
  if (!query) return null;

  const visible = new Set<string>();
  entities.forEach((entity) => {
    if (entity.name.toLowerCase().includes(query) || entity.type.toLowerCase().includes(query)) {
      visible.add(entity.id);
      getAncestorIds(entities, entity.id).forEach((ancestorId) => visible.add(ancestorId));
    }
  });
  return visible;
}

/**
 * The tree as the list of rows on show. While searching, every branch counts as expanded.
 */
export function flattenRows(
  entities: Entity[],
  visibleIds: Set<string> | null,
  collapsedIds: Set<string>,
  isSearching: boolean,
): FlatRow[] {
  const rows: FlatRow[] = [];

  // Single-child "pass-through" nodes (near-universal in imported glTF —
  // wrapper groups that exist only to carry a name/compensation transform,
  // e.g. RootNode > Object_4 > _rootJoint) render at the same indent as
  // their parent instead of each claiming their own level. Indent only
  // advances at an actual branch point (a node with 2+ children) or a leaf.
  // This is purely a rendering choice — it doesn't touch entity data, so
  // selection/rename/delete/nodePath hydration are unaffected.
  const walk = (parentId: string | null, depth: number) => {
    const siblings = getChildren(entities, parentId);
    const childDepth = siblings.length === 1 ? depth : depth + 1;

    for (const child of siblings) {
      if (visibleIds && !visibleIds.has(child.id)) continue;

      const hasChildren = getChildren(entities, child.id).length > 0;
      const isExpanded = isSearching || !collapsedIds.has(child.id);

      rows.push({ id: child.id, depth: childDepth, hasChildren, isExpanded });
      if (hasChildren && isExpanded) walk(child.id, childDepth);
    }
  };

  walk(null, 0);
  return rows;
}
