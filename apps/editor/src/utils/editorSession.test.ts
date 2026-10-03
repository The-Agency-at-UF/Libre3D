import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { stubBrowserGlobals, type BrowserStubs } from "../testing/browserStubs";

const HANDOFF_KEY = "libre3d-editor-session";
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

let browser: BrowserStubs;

// A fresh copy of the module, as a newly loaded page gets.
const loadPage = async () => {
  vi.resetModules();
  return import("./editorSession");
};

const pageTransition = (type: "pagehide" | "pageshow", persisted: boolean) =>
  Object.assign(new Event(type), { persisted });

beforeEach(() => {
  browser = stubBrowserGlobals();
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("getEditorSessionId", () => {
  it("makes one random ID per page and keeps it", async () => {
    const page = await loadPage();
    const id = page.getEditorSessionId();

    expect(id).toMatch(UUID);
    expect(page.getEditorSessionId()).toBe(id);
    // Nothing is left for a duplicated tab to copy while the page is open.
    expect(browser.sessionStorage.getItem(HANDOFF_KEY)).toBeNull();
  });

  it("gives two pages (tabs) different IDs", async () => {
    const first = (await loadPage()).getEditorSessionId();
    const second = (await loadPage()).getEditorSessionId();

    expect(second).not.toBe(first);
  });

  it("hands the ID to the next page on reload, so it reclaims its own lock", async () => {
    const id = (await loadPage()).getEditorSessionId();

    browser.window.dispatchEvent(pageTransition("pagehide", false));
    expect(browser.sessionStorage.getItem(HANDOFF_KEY)).toBe(id);

    const reloaded = await loadPage();
    expect(reloaded.getEditorSessionId()).toBe(id);
    expect(browser.sessionStorage.getItem(HANDOFF_KEY)).toBeNull();
  });

  it("takes the hand-off back when the page returns from the back/forward cache", async () => {
    const page = await loadPage();
    const id = page.getEditorSessionId();

    browser.window.dispatchEvent(pageTransition("pagehide", true));
    browser.window.dispatchEvent(pageTransition("pageshow", true));

    expect(browser.sessionStorage.getItem(HANDOFF_KEY)).toBeNull();
    expect(page.getEditorSessionId()).toBe(id);
  });

  it("ignores a malformed hand-off", async () => {
    browser.sessionStorage.setItem(HANDOFF_KEY, "not-a-session");

    expect((await loadPage()).getEditorSessionId()).toMatch(UUID);
    expect(browser.sessionStorage.getItem(HANDOFF_KEY)).toBeNull();
  });

  it("still works when sessionStorage throws", async () => {
    vi.stubGlobal("sessionStorage", {
      getItem: () => {
        throw new Error("SecurityError");
      },
      setItem: () => {
        throw new Error("SecurityError");
      },
      removeItem: () => undefined,
    });
    const page = await loadPage();

    expect(page.getEditorSessionId()).toMatch(UUID);
    expect(() => browser.window.dispatchEvent(pageTransition("pagehide", false))).not.toThrow();
  });
});
