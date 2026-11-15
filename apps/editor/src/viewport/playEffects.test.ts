import { describe, expect, it, vi } from "vitest";
import { createPlayEffects } from "./playEffects";

describe("playEffects: Open Link", () => {
  it("opens a link as the action says, always without opener or referrer", () => {
    const open = vi.fn();
    const { onEffect } = createPlayEffects({ open });
    onEffect({ type: "openLink", url: "https://example.com/", newTab: true });
    onEffect({ type: "openLink", url: "https://example.com/b", newTab: false });
    expect(open.mock.calls).toEqual([
      ["https://example.com/", "_blank", "noopener,noreferrer"],
      ["https://example.com/b", "_self", "noopener,noreferrer"],
    ]);
  });

  it("opens every link in a new tab in the editor's Play", () => {
    const open = vi.fn();
    createPlayEffects({ open, alwaysNewTab: true }).onEffect({ type: "openLink", url: "https://example.com/", newTab: false });
    expect(open).toHaveBeenCalledWith("https://example.com/", "_blank", "noopener,noreferrer");
  });

  it("hands links to onOpenLink instead of opening them, when given", () => {
    const open = vi.fn();
    const onOpenLink = vi.fn();
    createPlayEffects({ open, onOpenLink }).onEffect({ type: "openLink", url: "mailto:a@example.com", newTab: false });
    expect(onOpenLink).toHaveBeenCalledWith("mailto:a@example.com", false);
    expect(open).not.toHaveBeenCalled();
  });
});
