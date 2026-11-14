import { useEffect, useMemo, useRef, useState } from "react";
import type { Entity } from "../../scene/types";
import { getDescendantIds } from "../../scene/entityIndex";
import { useStableCallback } from "../../hooks/useStableCallback";
import { findVisibleIds, flattenRows } from "./hierarchyRows";

/**
 * The rows the hierarchy panel shows (`flatRows`, see hierarchyRows.ts) and which branches are
 * collapsed. Collapse state lives here and nowhere else: it isn't saved, so a reload shows the
 * tree fully closed again.
 */
export function useHierarchyRows(entities: Entity[], searchQuery: string) {
  // Nodes populate fully closed: a node is expanded only if the user opened it.
  // collapsedIds seeds with every entity present at mount, and the effect below
  // adds any that appear later (e.g. a freshly imported model's whole subtree),
  // so importing a 500-node model shows one collapsed root row instead of
  // flooding the panel. Still non-persisted — resets to fully closed on reload.
  const [collapsedIds, setCollapsedIds] = useState<Set<string>>(() => new Set(entities.map((entity) => entity.id)));
  // Ids we've already assigned the collapsed default to, so the user manually
  // expanding a node isn't undone when unrelated entities are later added.
  const seededCollapseIdsRef = useRef<Set<string>>(undefined as unknown as Set<string>);
  if (seededCollapseIdsRef.current === undefined) {
    seededCollapseIdsRef.current = new Set(entities.map((entity) => entity.id));
  }

  // Passed to every row, so it keeps its identity (rows are memoized; see HierarchyPanel).
  const toggleExpand = useStableCallback((id: string) => {
    setCollapsedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  });

  /** Collapses or expands a row and everything under it. */
  const setSubtreeCollapsed = (id: string, collapsed: boolean) => {
    setCollapsedIds((prev) => {
      const next = new Set(prev);
      const targets = [id, ...getDescendantIds(entities, id)];
      targets.forEach((targetId) => {
        if (collapsed) {
          next.add(targetId);
        } else {
          next.delete(targetId);
        }
      });
      return next;
    });
  };

  /** Expands one row. */
  const expandRow = (id: string) => {
    setCollapsedIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  };

  // Default every newly-appearing entity to collapsed. Runs after mount too,
  // but the mount-time seed already covers the initial entities, so on mount
  // there are no fresh ids and this is a no-op (no expanded-then-collapsed
  // flash for a persisted import).
  useEffect(() => {
    const seeded = seededCollapseIdsRef.current;
    const freshIds: string[] = [];
    for (const entity of entities) {
      if (!seeded.has(entity.id)) {
        seeded.add(entity.id);
        freshIds.push(entity.id);
      }
    }
    if (freshIds.length === 0) return;
    setCollapsedIds((prev) => {
      const next = new Set(prev);
      freshIds.forEach((id) => next.add(id));
      return next;
    });
  }, [entities]);

  const trimmedQuery = searchQuery.trim().toLowerCase();
  const visibleIds = useMemo(() => findVisibleIds(entities, trimmedQuery), [entities, trimmedQuery]);
  const flatRows = useMemo(
    () => flattenRows(entities, visibleIds, collapsedIds, trimmedQuery.length > 0),
    [entities, visibleIds, collapsedIds, trimmedQuery],
  );

  return { flatRows, trimmedQuery, collapsedIds, toggleExpand, setSubtreeCollapsed, expandRow };
}
