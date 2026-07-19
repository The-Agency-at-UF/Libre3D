import { useState, useRef, useEffect, useMemo } from "react";
import { useEditorStore, type Entity } from "../store/useEditorStore";
import {
  getChildren,
  getAncestorIds,
  getDescendantIds,
  filterMoveRoots,
  canReparentEntities,
} from "../store/entityIndex";

import { EyeIcon, LockIcon } from "./ui/Icons";

// One entry per row the tree is currently showing, in visual (top-to-bottom)
// order. Range select, arrow-key navigation, drag-and-drop indices, and
// virtualization all index into this same list.
interface FlatRow {
  id: string;
  depth: number;
  hasChildren: boolean;
  isExpanded: boolean;
}

interface HierarchyItemProps {
  entityId: string;
  depth: number;
  hasChildren: boolean;
  isExpanded: boolean;
  isActive: boolean;
  isRenaming: boolean;
  onToggleExpand: (id: string) => void;
  onRowClick: (id: string, event: React.MouseEvent) => void;
  onRowContextMenu: (id: string, event: React.MouseEvent) => void;
  onRequestRename: (id: string) => void;
  onFinishRename: () => void;
}

interface ContextMenuState {
  x: number;
  y: number;
  targetId: string | null;
}

// Right-click menu. Every action operates on the whole current selection
// (Blender's convention); enablement mirrors the same store guards the
// actions themselves enforce, so a disabled item is never a lie.
function HierarchyContextMenu({
  menu,
  onClose,
  onRename,
}: {
  menu: ContextMenuState;
  onClose: () => void;
  onRename: (id: string) => void;
}) {
  const entities = useEditorStore((state) => state.entities);
  const selectedEntityIds = useEditorStore((state) => state.selectedEntityIds);
  const duplicateEntity = useEditorStore((state) => state.duplicateEntity);
  const removeEntity = useEditorStore((state) => state.removeEntity);
  const groupEntities = useEditorStore((state) => state.groupEntities);
  const ungroupEntity = useEditorStore((state) => state.ungroupEntity);

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

  const canRename = !!targetEntity && !targetEntity.locked;

  const moveRoots = filterMoveRoots(entities, selectedEntityIds);
  const parentIds = new Set(moveRoots.map((id) => byId.get(id)?.parentId ?? null));
  const groupParentId = parentIds.size === 1 ? [...parentIds][0] : null;
  const canGroup = moveRoots.length > 0 && canReparentEntities(entities, moveRoots, groupParentId);

  const selectedGroups = selected.filter((entity) => entity.type === "group");
  const deletableIds = selected.filter((entity) => !entity.locked).map((entity) => entity.id);
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
          disabled={!hasSelection}
          onClick={() => run(() => duplicateEntity(useEditorStore.getState().selectedEntityIds))}
        >
          <span>Duplicate</span>
          <span className="hamburger-dropdown-shortcut">Ctrl+D</span>
        </button>
        <div style={{ height: "1px", background: "var(--border)", margin: "4px 0" }} />
        <button
          className="hamburger-dropdown-btn"
          type="button"
          disabled={!canGroup}
          onClick={() => run(() => groupEntities(useEditorStore.getState().selectedEntityIds))}
        >
          <span>Group Selection</span>
        </button>
        <button
          className="hamburger-dropdown-btn"
          type="button"
          disabled={selectedGroups.length === 0}
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
          disabled={deletableIds.length === 0}
          onClick={() => run(() => removeEntity(deletableIds))}
        >
          <span>Delete</span>
          <span className="hamburger-dropdown-shortcut">Del</span>
        </button>
      </div>
    </>
  );
}

function HierarchyItem({
  entityId,
  depth,
  hasChildren,
  isExpanded,
  isActive,
  isRenaming,
  onToggleExpand,
  onRowClick,
  onRowContextMenu,
  onRequestRename,
  onFinishRename,
}: HierarchyItemProps) {
  const entity = useEditorStore((state) =>
    state.entities.find((e) => e.id === entityId)
  );
  const selectedEntityIds = useEditorStore((state) => state.selectedEntityIds);
  const removeEntity = useEditorStore((state) => state.removeEntity);
  const toggleVisibility = useEditorStore((state) => state.toggleVisibility);
  const toggleLock = useEditorStore((state) => state.toggleLock);
  const renameEntity = useEditorStore((state) => state.renameEntity);

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

  const isSelected = selectedEntityIds.includes(entity.id);

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (entity.locked) return; // Cannot rename locked elements
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
      className={`editor-tree-item${isSelected ? " editor-tree-item--selected" : ""}${isActive ? " editor-tree-item--active" : ""}${entity.locked ? " editor-tree-item--locked" : ""}`}
      style={{ paddingLeft: `${0.85 + visualDepth * 0.85}rem` }}
      data-entity-id={entity.id}
      onContextMenu={(e) => onRowContextMenu(entity.id, e)}
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
            <span className="editor-tree-name">{entity.name}</span>
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
  const selectEntities = useEditorStore((state) => state.selectEntities);
  const [collapsedIds, setCollapsedIds] = useState<Set<string>>(new Set());
  // Keyboard cursor + range anchor. `activeId` follows every click and arrow
  // move; `anchorId` only follows non-shift clicks, so successive Shift+Clicks
  // extend from the same origin (standard file-browser / Blender behavior).
  const [activeId, setActiveId] = useState<string | null>(null);
  const [anchorId, setAnchorId] = useState<string | null>(null);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [contextMenu, setContextMenu] = useState<ContextMenuState | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

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

  const flatRows = useMemo(() => {
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
        const isExpanded = trimmedQuery.length > 0 || !collapsedIds.has(child.id);

        rows.push({ id: child.id, depth: childDepth, hasChildren, isExpanded });
        if (hasChildren && isExpanded) walk(child.id, childDepth);
      }
    };

    walk(null, 0);
    return rows;
  }, [entities, visibleIds, collapsedIds, trimmedQuery]);

  const scrollRowIntoView = (id: string) => {
    containerRef.current
      ?.querySelector(`[data-entity-id="${CSS.escape(id)}"]`)
      ?.scrollIntoView({ block: "nearest" });
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

  // Right-clicking an unselected row selects it first (Blender/Spline
  // behavior); right-clicking inside the selection keeps it, so menu actions
  // operate on the whole multi-selection.
  const handleRowContextMenu = (id: string, event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    if (!useEditorStore.getState().selectedEntityIds.includes(id)) {
      selectEntity(id, false);
      setActiveId(id);
      setAnchorId(id);
    }
    setContextMenu({ x: event.clientX, y: event.clientY, targetId: id });
  };

  const handleRowClick = (id: string, event: React.MouseEvent) => {
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
  };

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
        const entity = entities.find((e) => e.id === activeId);
        if (!entity || entity.locked) return;
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
    >
      <div className="editor-tree" aria-label="Scene hierarchy">
        {flatRows.map((row) => (
          <HierarchyItem
            key={row.id}
            entityId={row.id}
            depth={row.depth}
            hasChildren={row.hasChildren}
            isExpanded={row.isExpanded}
            isActive={row.id === activeId}
            isRenaming={row.id === renamingId}
            onToggleExpand={toggleExpand}
            onRowClick={handleRowClick}
            onRowContextMenu={handleRowContextMenu}
            onRequestRename={(id) => {
              setRenamingId(id);
              setActiveId(id);
            }}
            onFinishRename={() => setRenamingId(null)}
          />
        ))}
      </div>

      {contextMenu && (
        <HierarchyContextMenu
          menu={contextMenu}
          onClose={() => setContextMenu(null)}
          onRename={(id) => {
            setRenamingId(id);
            setActiveId(id);
          }}
        />
      )}
    </div>
  );
}
