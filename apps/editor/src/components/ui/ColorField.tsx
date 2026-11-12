import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { parseHex, toHex } from "../../utils/colorSpaces";
import { ColorPicker, HexInput, type ColorChange } from "./ColorPicker";
import { NumberField } from "./NumberField";

/**
 * A colour in a label / control row, as Spline's: its swatch (opens the colour picker beside it),
 * its hex value, and with `alpha` its opacity in %. `mixed`: several selected things don't share
 * one colour (the swatch is striped, the value reads "Mixed" until one is picked).
 */
export function ColorField({
  label,
  color,
  alpha,
  mixed = false,
  onChange,
}: {
  label: string;
  color: string;
  alpha?: number;
  mixed?: boolean;
  onChange: (change: ColorChange) => void;
}) {
  const [open, setOpen] = useState(false);
  const swatch = useRef<HTMLButtonElement>(null);
  const swatchBackground = mixed
    ? "repeating-linear-gradient(45deg, #444 0 4px, #666 4px 8px)"
    : `linear-gradient(${withAlpha(color, alpha ?? 1)}, ${withAlpha(color, alpha ?? 1)}), var(--checker)`;

  return (
    <div className="prop">
      <span className="prop-label">{label}</span>
      <div className="color-field">
        <button
          ref={swatch}
          type="button"
          className={`color-field-swatch ${open ? "on" : ""}`}
          style={{ background: swatchBackground }}
          title={`Pick the ${label.toLowerCase()}`}
          aria-label={`${label}: open the colour picker`}
          aria-expanded={open}
          onClick={() => setOpen((was) => !was)}
        />
        {mixed ? (
          <input type="text" className="hex-input color-field-hex" aria-label={`${label} hex value`} value="Mixed" readOnly onFocus={() => setOpen(true)} />
        ) : (
          <HexInput className="color-field-hex" value={color} onChange={(rgb) => onChange({ color: toHex(rgb) })} />
        )}
        {alpha !== undefined && (
          <NumberField
            className="color-field-percent"
            label={`${label} opacity (%)`}
            value={mixed ? null : Math.round(alpha * 100)}
            min={0}
            max={100}
            step={1}
            integer
            onChange={(percent) => onChange({ alpha: percent / 100 })}
          />
        )}
      </div>
      {open && swatch.current && (
        <ColorPopover anchor={swatch.current} onClose={() => setOpen(false)}>
          <ColorPicker color={mixed ? "#ffffff" : color} alpha={alpha} onChange={onChange} />
        </ColorPopover>
      )}
    </div>
  );
}

const withAlpha = (hex: string, alpha: number): string => {
  const rgb = parseHex(hex) ?? [255, 255, 255];
  return `rgba(${rgb.join(", ")}, ${alpha})`;
};

/**
 * The picker beside its swatch: to the left of the drawer or sidebar the swatch is in, at its
 * height. Closes on a click outside it or Escape (which then goes no further, so the drawer under
 * it stays open).
 */
function ColorPopover({ anchor, onClose, children }: { anchor: HTMLElement; onClose: () => void; children: React.ReactNode }) {
  const popover = useRef<HTMLDivElement>(null);
  const [place, setPlace] = useState<{ top: number; right: number } | null>(null);

  useLayoutEffect(() => {
    const container = anchor.closest(".mat-drawer, .right-sidebar") ?? anchor;
    const containerRect = container.getBoundingClientRect();
    const anchorRect = anchor.getBoundingClientRect();
    const height = popover.current?.offsetHeight ?? 0;
    setPlace({
      top: Math.max(8, Math.min(anchorRect.top - 8, window.innerHeight - height - 8)),
      right: window.innerWidth - containerRect.left + 8,
    });
  }, [anchor]);

  useEffect(() => {
    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Node;
      if (!popover.current?.contains(target) && !anchor.contains(target)) onClose();
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      event.stopImmediatePropagation();
      onClose();
    };
    document.addEventListener("pointerdown", onPointerDown);
    // Capture, so this Escape is seen (and stopped) before the drawer's.
    document.addEventListener("keydown", onKeyDown, true);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown, true);
    };
  }, [anchor, onClose]);

  return createPortal(
    <div
      ref={popover}
      className="color-popover"
      role="dialog"
      aria-label="Colour picker"
      style={place ? { top: place.top, right: place.right } : { visibility: "hidden" }}
    >
      {children}
    </div>,
    document.body,
  );
}
