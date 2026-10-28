import { describe, expect, it, vi } from "vitest";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

// A fresh copy of the module, as a newly loaded page gets.
const loadPage = async () => {
  vi.resetModules();
  return import("./editorSession");
};

describe("getEditorSessionId", () => {
  it("makes one random ID per page and keeps it", async () => {
    const page = await loadPage();
    const id = page.getEditorSessionId();

    expect(id).toMatch(UUID);
    expect(page.getEditorSessionId()).toBe(id);
  });

  it("gives every page (a tab, a duplicated tab, a reload) its own ID", async () => {
    const first = (await loadPage()).getEditorSessionId();
    const second = (await loadPage()).getEditorSessionId();

    expect(second).not.toBe(first);
  });
});
