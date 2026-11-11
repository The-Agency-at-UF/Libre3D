import { useEditorStore } from "../../store/useEditorStore";
import type { Entity } from "../../scene/types";
import { isEffectivelyLocked } from "../../scene/entityIndex";
import type { FlatRow } from "./hierarchyTypes";

interface HierarchyKeyboardOptions {
  entities: Entity[];
  flatRows: FlatRow[];
  /** The keyboard's row: where the arrows move from. */
  activeId: string | null;
  /** Makes one row the whole selection, the keyboard's row, and the range's start. */
  selectOnly: (id: string) => void;
  /** Selects from the range's start to this row and moves the keyboard there. False if it can't. */
  extendRangeTo: (id: string) => boolean;
  scrollRowIntoView: (id: string) => void;
  toggleExpand: (id: string) => void;
  setSubtreeCollapsed: (id: string, collapsed: boolean) => void;
  requestRename: (id: string) => void;
}

/**
 * The hierarchy panel's own keys: up and down move the selection (with Shift, extend it), left and
 * right collapse and expand a branch (with Shift, everything under it), F2 renames. Returns the
 * panel's `onKeyDown`.
 *
 * Outliner-scoped keys — deliberately NOT in the global useHotkeys: they
 * should only fire while the panel (or a row inside it) has focus.
 */
export function useHierarchyKeyboard({
  entities,
  flatRows,
  activeId,
  selectOnly,
  extendRangeTo,
  scrollRowIntoView,
  toggleExpand,
  setSubtreeCollapsed,
  requestRename,
}: HierarchyKeyboardOptions) {
  return (event: React.KeyboardEvent) => {
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

        // With Shift the range grows and its start stays put; otherwise the row becomes the selection.
        if (!(event.shiftKey && extendRangeTo(nextId))) selectOnly(nextId);
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
        requestRename(activeId);
        break;
      }
      default:
        break;
    }
  };
}
