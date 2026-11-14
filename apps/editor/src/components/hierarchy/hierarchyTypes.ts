// Types and layout numbers the hierarchy panel's files share.

// One entry per row the tree is currently showing, in visual (top-to-bottom)
// order. Range select, arrow-key navigation, drag-and-drop indices, and
// virtualization all index into this same list.
export interface FlatRow {
  id: string;
  depth: number;
  hasChildren: boolean;
  isExpanded: boolean;
}

export interface ContextMenuState {
  x: number;
  y: number;
  targetId: string | null;
}

// Where the current drag would land. "onto" reparents under the row; "between"
// inserts as a sibling at `index` under `parentId` — the indicator line renders
// on `indicatorRowId`'s top/bottom edge at `depth`'s indent.
export type DropTarget =
  | { kind: "onto"; targetId: string }
  | {
    kind: "between";
    parentId: string | null;
    index: number;
    indicatorRowId: string;
    edge: "top" | "bottom";
    depth: number;
  };

export const ROW_INDENT_BASE_REM = 0.85;
export const ROW_INDENT_STEP_REM = 0.85;
