/**
 * PURPOSE: The keys a Key Down or Key Up event can listen for (decision tree B3): a key's name as
 * the inspector shows it, and which keys no event may take, with why.
 *
 * INPUT: A `KeyboardEvent.code` ("KeyW", "Space", "ArrowLeft"): the physical key, so an event keeps
 *        its key whatever the visitor's keyboard layout.
 * OUTPUT: A short readable name ("W", "Space", "←"), or the reason a key is refused.
 *
 * It doesn't listen for keys (viewport/playInput.ts does) or capture them (KeyCaptureField). Nothing
 * here depends on the store, React, or the DOM.
 */

// Codes whose name isn't the code itself with its prefix taken off.
const NAMED_KEYS: Record<string, string> = {
  ArrowLeft: "←",
  ArrowRight: "→",
  ArrowUp: "↑",
  ArrowDown: "↓",
  PageUp: "Page Up",
  PageDown: "Page Down",
  CapsLock: "Caps Lock",
  Minus: "-",
  Equal: "=",
  BracketLeft: "[",
  BracketRight: "]",
  Backslash: "\\",
  Semicolon: ";",
  Quote: "'",
  Comma: ",",
  Period: ".",
  Slash: "/",
  Backquote: "`",
  NumpadAdd: "Num +",
  NumpadSubtract: "Num -",
  NumpadMultiply: "Num *",
  NumpadDivide: "Num /",
  NumpadDecimal: "Num .",
  NumpadEnter: "Num Enter",
  ShiftLeft: "Left Shift",
  ShiftRight: "Right Shift",
  AltLeft: "Left Alt",
  AltRight: "Right Alt",
};

/** A key's name as the inspector shows it: "W", "7", "Space", "←", "Num 4". An unknown code shows as itself. */
export const keyLabel = (code: string): string => {
  if (NAMED_KEYS[code]) return NAMED_KEYS[code];
  const letterOrDigit = /^(?:Key|Digit)(.)$/.exec(code);
  if (letterOrDigit) return letterOrDigit[1];
  const numpad = /^Numpad(\d)$/.exec(code);
  if (numpad) return `Num ${numpad[1]}`;
  return code;
};

/**
 * Why a key can't be an event's key, or null when it can. Escape stops Play in the editor, and
 * Play leaves every key pressed with Ctrl or Cmd to the browser and the editor (zoom), so those
 * keys themselves could never fire.
 */
export const reservedKeyReason = (code: string): string | null => {
  if (code === "Escape") return "Escape stops Play, so it can't start an event.";
  if (/^(?:Control|Meta)(?:Left|Right)$/.test(code)) return "Ctrl and Cmd are kept for shortcuts, so they can't start an event.";
  return null;
};
