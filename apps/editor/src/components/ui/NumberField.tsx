import { useState, type CSSProperties } from "react";
import { useSliderUndoStep } from "../../hooks/useSliderUndoStep";

export interface NumberFieldProps {
  /** The number shown. Null when several selected things don't share one: the field reads "---". */
  value: number | null;
  /** Called with a finite number, already rounded (`integer`) and clamped (`min`, `max`). */
  onChange: (value: number) => void;
  /** Read by screen readers, and shown as the tooltip. */
  label: string;
  min?: number;
  max?: number;
  step?: number;
  /** Whole numbers only: what's typed is rounded. */
  integer?: boolean;
  /**
   * When `onChange` is called. "live" (the default): as you type, so the scene follows, and the
   * whole visit to the field is one undo step. "enter": once, on Enter or on leaving the field,
   * for a value with nothing to preview; Escape then puts the old value back.
   */
  commit?: "live" | "enter";
  disabled?: boolean;
  className?: string;
  style?: CSSProperties;
}

/**
 * The inspector's number input: Transform's X, Y and Z, a Depth layer's values, the frame's size,
 * an event's timings.
 *
 * While the field has focus it shows what was typed, not the stored number, so "1." on the way to
 * "1.5" or an empty field on the way to a new value isn't rewritten under the cursor. Text that
 * isn't a number yet changes nothing.
 *
 * A live field's edits are one undo step, as a slider's drag is: the first change records the step
 * and history pauses until the field loses focus (or Enter, which leaves it).
 */
export function NumberField({
  value,
  onChange,
  label,
  min,
  max,
  step = 0.1,
  integer = false,
  commit = "live",
  disabled = false,
  className,
  style,
}: NumberFieldProps) {
  // What's being typed, while the field has focus and has been changed. Null shows the value.
  const [draft, setDraft] = useState<string | null>(null);
  const undoStep = useSliderUndoStep();

  const parse = (text: string): number | null => {
    const parsed = parseFloat(text);
    if (!Number.isFinite(parsed)) return null;
    let next = integer ? Math.round(parsed) : parsed;
    if (min !== undefined) next = Math.max(min, next);
    if (max !== undefined) next = Math.min(max, next);
    return next;
  };

  const apply = (text: string) => {
    const next = parse(text);
    if (next === null || next === value) return;
    onChange(next);
    if (commit === "live") undoStep.changed();
  };

  const leave = () => {
    if (commit === "enter" && draft !== null) apply(draft);
    setDraft(null);
    undoStep.endProps.onBlur();
  };

  return (
    <input
      type="number"
      aria-label={label}
      title={label}
      className={className}
      style={style}
      min={min}
      max={max}
      step={step}
      disabled={disabled}
      placeholder={value === null ? "---" : undefined}
      value={draft ?? (value === null ? "" : String(Number(value.toFixed(2))))}
      onChange={(event) => {
        setDraft(event.target.value);
        if (commit === "live") apply(event.target.value);
      }}
      onBlur={leave}
      onKeyDown={(event) => {
        if (event.key === "Enter") {
          event.currentTarget.blur();
        } else if (event.key === "Escape" && commit === "enter") {
          // Puts the old value back, and keeps the Escape from also closing the panel.
          setDraft(null);
          event.stopPropagation();
        }
      }}
    />
  );
}
