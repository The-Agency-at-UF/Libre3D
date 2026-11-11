import { useEffect, useRef, useState, type RefObject } from "react";
import type { FlatRow } from "./hierarchyTypes";

// Above this many visible rows the tree windows its rendering: only rows in
// (and near) the scroll viewport mount, with spacer divs standing in for the
// rest. Below it, plain full rendering — simpler and plenty fast.
const VIRTUALIZE_THRESHOLD = 200;
const VIRTUALIZE_OVERSCAN = 12;

// The distance from one row's top to the next, in pixels, until two mounted rows have been measured.
const DEFAULT_ROW_PITCH = 26;
// The tree's gap between rows, in pixels: a spacer stands in for rows, less the one gap it adds.
const ROW_GAP = 2;

/**
 * Which of the hierarchy's rows are mounted. A long list mounts only the rows in and near the
 * scrolled view, and the heights returned here are for the two spacers that stand in for the rest
 * (null: no spacer). A short list mounts everything.
 *
 * `treeRef` goes on the element holding the rows; `containerRef` is the panel, which
 * `scrollRowIntoView` searches for a mounted row.
 */
export function useRowWindow(flatRows: FlatRow[], containerRef: RefObject<HTMLDivElement | null>) {
  const treeRef = useRef<HTMLDivElement | null>(null);
  const scrollParentRef = useRef<HTMLElement | null>(null);
  const rowPitchRef = useRef(DEFAULT_ROW_PITCH);
  // The mounted rows' indices in flatRows (null = render everything).
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

  const rowPitch = rowPitchRef.current;
  return {
    treeRef,
    mountedRows: rowWindow ? flatRows.slice(rowWindow.start, rowWindow.end) : flatRows,
    spacerAbove: rowWindow && rowWindow.start > 0 ? rowWindow.start * rowPitch - ROW_GAP : null,
    spacerBelow: rowWindow && rowWindow.end < flatRows.length ? (flatRows.length - rowWindow.end) * rowPitch - ROW_GAP : null,
    scrollRowIntoView,
  };
}
