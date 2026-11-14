import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { useSliderUndoStep } from "../../hooks/useSliderUndoStep";
import { hslToRgb, hsvToRgb, parseHex, rgbToHsl, rgbToHsv, toHex, type Hsv } from "../../utils/colorSpaces";
import { NumberField } from "./NumberField";

/** A change the picker makes: a new colour, a new opacity, or both. */
export interface ColorChange {
  color?: string;
  alpha?: number;
}

type Format = "hex" | "rgb" | "hsl";

// The browser's eyedropper (Chromium only); the button is left out elsewhere.
interface EyeDropperApi {
  open(): Promise<{ sRGBHex: string }>;
}
const EyeDropper = (window as unknown as { EyeDropper?: new () => EyeDropperApi }).EyeDropper;

const clamp01 = (value: number) => Math.min(1, Math.max(0, value));

/**
 * The editor's colour picker (task D4), as Spline's: a saturation / brightness square, an
 * eyedropper, a hue slider with the opacity slider right under it, and the value as Hex, RGB or
 * HSL with its opacity in %. Without `alpha` there's no opacity slider or %.
 *
 * Colours are "#rrggbb", sRGB as picked. A drag on the square or a slider is one undo step, as a
 * slider's is. The hue is kept while the colour is grey or black, where the colour alone forgets it.
 */
export function ColorPicker({
  color,
  alpha,
  onChange,
}: {
  color: string;
  alpha?: number;
  onChange: (change: ColorChange) => void;
}) {
  const [hsv, setHsv] = useState<Hsv>(() => rgbToHsv(parseHex(color) ?? [255, 255, 255]));
  const [format, setFormat] = useState<Format>("hex");
  const undoStep = useSliderUndoStep();

  // A colour from outside (undo, another object) moves the picker; its own changes don't.
  useEffect(() => {
    const rgb = parseHex(color);
    if (rgb && toHex(hsvToRgb(hsv)) !== color.toLowerCase()) setHsv(rgbToHsv(rgb));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [color]);

  const setColor = (next: Hsv) => {
    setHsv(next);
    const hex = toHex(hsvToRgb(next));
    if (hex !== color.toLowerCase()) onChange({ color: hex });
  };

  // A drag on one of the picker's areas: `pick` turns the pointer's place (0-1 across, 0-1 down) into
  // a change. The area keeps the pointer while it drags, so the drag can leave it.
  const dragging = useRef<number | null>(null);
  const dragHandlers = (pick: (x: number, y: number) => void) => {
    const at = (event: ReactPointerEvent<HTMLDivElement>) => {
      const rect = event.currentTarget.getBoundingClientRect();
      pick(clamp01((event.clientX - rect.left) / rect.width), clamp01((event.clientY - rect.top) / rect.height));
      undoStep.changed();
    };
    const end = () => {
      dragging.current = null;
      undoStep.endProps.onPointerUp();
    };
    return {
      onPointerDown: (event: ReactPointerEvent<HTMLDivElement>) => {
        dragging.current = event.pointerId;
        try {
          event.currentTarget.setPointerCapture(event.pointerId);
        } catch {
          // A pointer the browser doesn't track (a scripted one) can't be held; the drag still works over the area.
        }
        at(event);
      },
      onPointerMove: (event: ReactPointerEvent<HTMLDivElement>) => {
        if (dragging.current === event.pointerId) at(event);
      },
      onPointerUp: end,
      onLostPointerCapture: end,
    };
  };

  const rgb = hsvToRgb(hsv);
  const hex = toHex(rgb);
  const pure = toHex(hsvToRgb({ h: hsv.h, s: 1, v: 1 }));

  // A grey keeps the hue it had.
  const setRgb = (next: [number, number, number]) => {
    const picked = rgbToHsv(next);
    setColor(picked.s === 0 ? { ...picked, h: hsv.h } : picked);
  };

  return (
    <div className="color-picker">
      <div
        className="color-picker-square"
        style={{ backgroundColor: pure }}
        role="slider"
        aria-label="Saturation and brightness"
        aria-valuetext={hex}
        {...dragHandlers((x, y) => setColor({ h: hsv.h, s: x, v: 1 - y }))}
      >
        <span className="color-picker-thumb" style={{ left: `${hsv.s * 100}%`, top: `${(1 - hsv.v) * 100}%`, background: hex }} />
      </div>

      <div className="color-picker-sliders">
        {EyeDropper && (
          <button
            type="button"
            className="mat-icon-btn color-picker-eyedropper"
            title="Pick a colour from the screen"
            aria-label="Pick a colour from the screen"
            onClick={() => {
              new EyeDropper()
                .open()
                .then(({ sRGBHex }) => {
                  const picked = parseHex(sRGBHex);
                  if (picked) setRgb(picked);
                })
                .catch(() => {
                  /* Escape: nothing picked */
                });
            }}
          >
            <i className="ti ti-color-picker"></i>
          </button>
        )}
        <div className="color-picker-bars">
          <div className="color-picker-hue" role="slider" aria-label="Hue" aria-valuenow={Math.round(hsv.h)} {...dragHandlers((x) => setColor({ ...hsv, h: x * 360 }))}>
            <span className="color-picker-handle" style={{ left: `${(hsv.h / 360) * 100}%`, background: pure }} />
          </div>
          {alpha !== undefined && (
            <div
              className="color-picker-alpha"
              role="slider"
              aria-label="Opacity"
              aria-valuenow={Math.round(alpha * 100)}
              {...dragHandlers((x) => onChange({ alpha: Math.round(x * 100) / 100 }))}
            >
              <span className="color-picker-alpha-fill" style={{ background: `linear-gradient(to right, transparent, ${hex})` }} />
              <span className="color-picker-handle" style={{ left: `${alpha * 100}%` }} />
            </div>
          )}
        </div>
      </div>

      <div className="color-picker-values">
        <select className="color-picker-format" aria-label="Colour format" value={format} onChange={(event) => setFormat(event.target.value as Format)}>
          <option value="hex">Hex</option>
          <option value="rgb">RGB</option>
          <option value="hsl">HSL</option>
        </select>
        {format === "hex" && <HexInput value={hex} onChange={(next) => setRgb(next)} />}
        {format === "rgb" &&
          rgb.map((channel, index) => (
            <NumberField
              key={index}
              className="color-picker-channel"
              label={["Red", "Green", "Blue"][index]}
              value={Math.round(channel)}
              min={0}
              max={255}
              step={1}
              integer
              onChange={(value) => setRgb(rgb.map((each, i) => (i === index ? value : each)) as [number, number, number])}
            />
          ))}
        {format === "hsl" &&
          rgbToHsl(rgb).map((channel, index) => (
            <NumberField
              key={index}
              className="color-picker-channel"
              label={["Hue", "Saturation (%)", "Lightness (%)"][index]}
              value={Math.round(index === 0 ? hsv.h : channel)}
              min={0}
              max={index === 0 ? 360 : 100}
              step={1}
              integer
              onChange={(value) => {
                const hsl = rgbToHsl(rgb);
                hsl[0] = hsv.h;
                hsl[index] = value;
                const next = rgbToHsv(hslToRgb(hsl));
                setColor({ ...next, h: index === 0 ? value % 360 : hsv.h });
              }}
            />
          ))}
        {alpha !== undefined && (
          <NumberField
            className="color-picker-percent"
            label="Opacity (%)"
            value={Math.round(alpha * 100)}
            min={0}
            max={100}
            step={1}
            integer
            onChange={(percent) => onChange({ alpha: percent / 100 })}
          />
        )}
      </div>
    </div>
  );
}

/**
 * A hex value being typed: it changes the colour once it's a whole one ("#abc" or "#aabbcc", with
 * or without "#"), and goes back to the colour when left half-typed.
 */
export function HexInput({ value, onChange, className = "color-picker-hex" }: { value: string; onChange: (rgb: [number, number, number]) => void; className?: string }) {
  const [draft, setDraft] = useState<string | null>(null);
  return (
    <input
      type="text"
      className={`hex-input ${className}`}
      aria-label="Hex value"
      spellCheck={false}
      value={draft ?? value.replace(/^#/, "").toUpperCase()}
      onFocus={(event) => event.currentTarget.select()}
      onChange={(event) => {
        setDraft(event.target.value);
        const rgb = parseHex(event.target.value);
        if (rgb) onChange(rgb);
      }}
      onBlur={() => setDraft(null)}
      onKeyDown={(event) => {
        if (event.key === "Enter") event.currentTarget.blur();
      }}
    />
  );
}
