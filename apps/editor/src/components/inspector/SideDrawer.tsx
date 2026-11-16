/**
 * PURPOSE: The small settings drawer that opens beside a panel at the height of the row it belongs
 * to: a material layer's settings (LayerStack.tsx) and an effect's (EffectsPanel.tsx).
 *
 * INPUT: The row it belongs to (`anchor`), a title and icon, and its settings as children.
 * OUTPUT: The drawer, in the page's body, beside the anchor's panel (the right sidebar or the
 *         Material Assets drawer). `onClose` is called from its × and on Escape.
 *
 * It stays open while the viewport is used (a Depth layer is edited there too). Its settings are
 * disabled while the scene is view only.
 */

import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { useEditorStore } from "../../store/useEditorStore";

export function SideDrawer({
  anchor,
  title,
  icon,
  onClose,
  children,
}: {
  anchor: HTMLElement;
  title: string;
  /** A Tabler icon class ("ti-sun"). */
  icon: string;
  onClose: () => void;
  children: ReactNode;
}) {
  const isReadOnly = useEditorStore((state) => state.readOnlyReason !== null);
  const drawer = useRef<HTMLDivElement>(null);
  const [place, setPlace] = useState<{ top: number; right: number } | null>(null);

  useLayoutEffect(() => {
    const placeIt = () => {
      const panel = anchor.closest(".mat-assets, .right-sidebar") ?? anchor;
      const sidebarRect = panel.getBoundingClientRect();
      const rowRect = anchor.getBoundingClientRect();
      const height = drawer.current?.offsetHeight ?? 0;
      const top = Math.max(8, Math.min(rowRect.top, window.innerHeight - height - 8));
      setPlace({ top, right: window.innerWidth - sidebarRect.left + 8 });
    };
    placeIt();
    window.addEventListener("resize", placeIt);
    const scroller = anchor.closest(".mat-assets-body, .panel-body");
    scroller?.addEventListener("scroll", placeIt);
    return () => {
      window.removeEventListener("resize", placeIt);
      scroller?.removeEventListener("scroll", placeIt);
    };
  }, [anchor]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  return createPortal(
    <div
      ref={drawer}
      className="mat-drawer"
      role="dialog"
      aria-label={`${title} settings`}
      style={place ? { top: place.top, right: place.right } : { visibility: "hidden" }}
    >
      <div className="mat-drawer-header">
        <i className={`ti ${icon}`}></i>
        <span>{title}</span>
        <button type="button" className="mat-icon-btn" title="Close" aria-label={`Close the ${title} settings`} onClick={onClose}>
          <i className="ti ti-x"></i>
        </button>
      </div>
      <fieldset className="mat-drawer-body inspector-fieldset" disabled={isReadOnly}>
        {children}
      </fieldset>
    </div>,
    document.body,
  );
}
