import { describe, expect, it } from "vitest";
import { keyLabel, reservedKeyReason } from "./keys";

describe("keyLabel", () => {
  it("names letters and digits by the character", () => {
    expect(keyLabel("KeyW")).toBe("W");
    expect(keyLabel("Digit7")).toBe("7");
    expect(keyLabel("Numpad4")).toBe("Num 4");
  });

  it("names Space, the arrows, and punctuation readably", () => {
    expect(keyLabel("Space")).toBe("Space");
    expect([keyLabel("ArrowLeft"), keyLabel("ArrowRight"), keyLabel("ArrowUp"), keyLabel("ArrowDown")]).toEqual(["←", "→", "↑", "↓"]);
    expect(keyLabel("Slash")).toBe("/");
    expect(keyLabel("ShiftLeft")).toBe("Left Shift");
  });

  it("falls back to the code itself for a key it doesn't know", () => {
    expect(keyLabel("F5")).toBe("F5");
    expect(keyLabel("IntlBackslash")).toBe("IntlBackslash");
  });
});

describe("reservedKeyReason", () => {
  it("refuses Escape, Ctrl, and Cmd, with a reason", () => {
    expect(reservedKeyReason("Escape")).toMatch(/stops Play/);
    expect(reservedKeyReason("ControlLeft")).toMatch(/shortcuts/);
    expect(reservedKeyReason("MetaRight")).toMatch(/shortcuts/);
  });

  it("allows every other key", () => {
    expect(reservedKeyReason("Space")).toBeNull();
    expect(reservedKeyReason("KeyW")).toBeNull();
    expect(reservedKeyReason("ShiftLeft")).toBeNull();
  });
});
