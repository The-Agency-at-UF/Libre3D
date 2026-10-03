import { useEffect, useRef, useState, type ReactNode } from "react";

interface MenuItemConfig {
  label: string;
  /** Tabler icon name without the `ti-` prefix. */
  icon?: string;
  onSelect: () => void;
}

interface MenuProps {
  /** Accessible name for the trigger button. */
  label: string;
  /** What the trigger button shows. */
  trigger: ReactNode;
  /** Non-interactive line above the items, e.g. the signed-in email. */
  header?: ReactNode;
  items: MenuItemConfig[];
}

/*
 * BLOCK: Menu (React Component)
 * PURPOSE: A button that opens a small dropdown of actions. Closes on choosing an item, on a click
 *          outside it, or on Escape.
 */
export function Menu({ label, trigger, header, items }: MenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handlePointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  return (
    <div className="ui-menu" ref={rootRef}>
      <button
        className="ui-menu-trigger"
        type="button"
        aria-label={label}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((open) => !open)}
      >
        {trigger}
      </button>

      {isOpen && (
        <div className="ui-menu-popover" role="menu">
          {header && <div className="ui-menu-header">{header}</div>}
          {items.map((item) => (
            <button
              key={item.label}
              className="ui-menu-item"
              type="button"
              role="menuitem"
              onClick={() => {
                setIsOpen(false);
                item.onSelect();
              }}
            >
              {item.icon && <i className={`ti ti-${item.icon}`} aria-hidden="true" />}
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
