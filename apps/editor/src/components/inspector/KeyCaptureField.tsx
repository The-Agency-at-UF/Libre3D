/**
 * PURPOSE: Picks the key a Key Down or Key Up event listens for: a button showing the key by name
 * (animation/keys.ts); click it, and the next key pressed becomes the key.
 *
 * INPUT: The current key (a `KeyboardEvent.code`, or none yet), what to do with a new one, and
 *        whether the field is disabled (a view-only scene).
 * OUTPUT: `onChange(code)` once per key captured, so each is one undo step; nothing when the key
 *         pressed is the one already set.
 *
 * While it listens, it takes the keypress before anything else on the page sees it (a capturing
 * listener on the window), so the editor's hotkeys (Delete, Space) and the Edit Event panel's
 * Escape-to-close don't also act on it. Escape and blur cancel. A reserved key (Escape, Ctrl, Cmd)
 * is refused with its reason. It doesn't store anything itself.
 */

import { useEffect, useState } from "react";
import { keyLabel, reservedKeyReason } from "../../animation/keys";

interface KeyCaptureFieldProps {
  value: string | undefined;
  onChange: (code: string) => void;
  disabled?: boolean;
}

export function KeyCaptureField({ value, onChange, disabled }: KeyCaptureFieldProps) {
  const [isCapturing, setIsCapturing] = useState(false);
  const [refusal, setRefusal] = useState<string | null>(null);

  useEffect(() => {
    if (!isCapturing) return;
    const onKeyDown = (event: KeyboardEvent) => {
      event.preventDefault();
      event.stopImmediatePropagation();
      if (event.code === "Escape") {
        setIsCapturing(false);
        return;
      }
      const reason = reservedKeyReason(event.code);
      if (reason || !event.code) {
        setRefusal(reason);
        return;
      }
      setIsCapturing(false);
      if (event.code !== value) onChange(event.code);
    };
    window.addEventListener("keydown", onKeyDown, true);
    return () => window.removeEventListener("keydown", onKeyDown, true);
  }, [isCapturing, value, onChange]);

  // A view-only switch mid-capture ends it.
  useEffect(() => {
    if (disabled) setIsCapturing(false);
  }, [disabled]);

  const label = isCapturing ? "Press a key…" : value ? keyLabel(value) : "Pick a key";

  return (
    <div className="key-capture">
      <button
        type="button"
        className={`key-capture-button${isCapturing ? " is-capturing" : ""}${value ? "" : " is-empty"}`}
        disabled={disabled}
        aria-pressed={isCapturing}
        title={isCapturing ? "Press the key for this event (Esc cancels)" : "Click, then press the key for this event"}
        onClick={() => {
          setRefusal(null);
          setIsCapturing((capturing) => !capturing);
        }}
        onBlur={() => setIsCapturing(false)}
      >
        <i className="ti ti-keyboard"></i>
        <span>{label}</span>
      </button>
      {isCapturing && refusal && <p className="state-hint">{refusal}</p>}
    </div>
  );
}
