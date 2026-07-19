import { useState, useRef, useEffect, useMemo } from "react";
import { useEditorStore } from "../store/useEditorStore";
import { getChildren, getAncestorIds } from "../store/entityIndex";

import { EyeIcon, LockIcon } from "./ui/Icons";

interface HierarchyItemProps {
  entityId: string;
  depth: number;
  hasChildren: boolean;
  isExpanded: boolean;
  onToggleExpand: (id: string) => void;
}

function HierarchyItem({ entityId, depth, hasChildren, isExpanded, onToggleExpand }: HierarchyItemProps) {
  const entity = useEditorStore((state) =>
    state.entities.find((e) => e.id === entityId)
  );
  const selectedEntityIds = useEditorStore((state) => state.selectedEntityIds);
  const selectEntity = useEditorStore((state) => state.selectEntity);
  const removeEntity = useEditorStore((state) => state.removeEntity);
  const toggleVisibility = useEditorStore((state) => state.toggleVisibility);
  const toggleLock = useEditorStore((state) => state.toggleLock);
  const renameEntity = useEditorStore((state) => state.renameEntity);

  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  if (!entity) return null;

  const isSelected = selectedEntityIds.includes(entity.id);

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (entity.locked) return; // Cannot rename locked elements
    setEditName(entity.name);
    setIsEditing(true);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      saveRename();
    } else if (e.key === "Escape") {
      setIsEditing(false);
    }
  };

  const saveRename = () => {
    const trimmed = editName.trim();
    if (trimmed) {
      renameEntity(entity.id, trimmed);
    }
    setIsEditing(false);
  };

  return (
    <div
      className={`editor-tree-item${isSelected ? " editor-tree-item--selected" : ""}${entity.locked ? " editor-tree-item--locked" : ""}`}
      style={{ paddingLeft: `${0.85 + depth * 0.85}rem` }}
    >
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
        {isEditing ? (
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
              selectEntity(entity.id, e.shiftKey);
            }}
            onDoubleClick={handleDoubleClick}
          >
            <span className="editor-tree-name">{entity.name}</span>
            <span className="editor-tree-type">{entity.type}</span>
          </button>
        )}

        <div className="hierarchy-item-actions">
          <button
            className={`hierarchy-action-btn${entity.visible ? "" : " inactive"}`}
            type="button"
            aria-label={entity.visible ? "Hide entity" : "Show entity"}
            onClick={(e) => {
              e.stopPropagation();
              toggleVisibility(entity.id);
            }}
          >
            <EyeIcon visible={entity.visible} />
          </button>
          <button
            className={`hierarchy-action-btn${entity.locked ? " active-locked" : ""}`}
            type="button"
            aria-label={entity.locked ? "Unlock entity" : "Lock entity"}
            onClick={(e) => {
              e.stopPropagation();
              toggleLock(entity.id);
            }}
          >
            <LockIcon locked={entity.locked} />
          </button>
          <button
            className="editor-tree-delete"
            type="button"
            aria-label={`Delete ${entity.name}`}
            disabled={entity.locked}
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

export function HierarchyPanel({ searchQuery = "" }: { searchQuery?: string }) {
  const entities = useEditorStore((state) => state.entities) ?? [];
  const selectEntity = useEditorStore((state) => state.selectEntity);
  const [collapsedIds, setCollapsedIds] = useState<Set<string>>(new Set());

  const toggleExpand = (id: string) => {
    setCollapsedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const trimmedQuery = searchQuery.trim().toLowerCase();

  // null means "no filter, show everything". When searching, a node is visible
  // if it matches directly or is an ancestor of a match — otherwise a matching
  // leaf deep in the tree would render with no parent rows above it.
  const visibleIds = useMemo(() => {
    if (!trimmedQuery) return null;

    const visible = new Set<string>();
    entities.forEach((entity) => {
      if (entity.name.toLowerCase().includes(trimmedQuery) || entity.type.toLowerCase().includes(trimmedQuery)) {
        visible.add(entity.id);
        getAncestorIds(entities, entity.id).forEach((ancestorId) => visible.add(ancestorId));
      }
    });
    return visible;
  }, [entities, trimmedQuery]);

  const renderChildren = (parentId: string | null, depth: number): React.ReactNode[] => {
    const rows: React.ReactNode[] = [];

    for (const child of getChildren(entities, parentId)) {
      if (visibleIds && !visibleIds.has(child.id)) continue;

      const hasChildren = getChildren(entities, child.id).length > 0;
      const isExpanded = trimmedQuery.length > 0 || !collapsedIds.has(child.id);

      rows.push(
        <HierarchyItem
          key={child.id}
          entityId={child.id}
          depth={depth}
          hasChildren={hasChildren}
          isExpanded={isExpanded}
          onToggleExpand={toggleExpand}
        />
      );

      if (hasChildren && isExpanded) {
        rows.push(...renderChildren(child.id, depth + 1));
      }
    }

    return rows;
  };

  return (
    <div
      style={{ display: "grid", gap: "0.85rem", minHeight: "100%" }}
      onClick={(e) => selectEntity(null, e.shiftKey)}
    >
      <div className="editor-tree" aria-label="Scene hierarchy">
        {renderChildren(null, 0)}
      </div>
    </div>
  );
}
