import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { stubBrowserGlobals, type BrowserStubs } from "../testing/browserStubs";
import { clearLegacyScene, findLegacyScene, stashLegacyScene } from "./legacyScene";

const LEGACY_KEY = "libre3d-legacy-scene";
const EDITOR_KEY = "libre3d-scene-state";

const storeImports = vi.hoisted(() => ({ count: 0 }));

// Loading the real store runs its persist v17 migration, which moves an old scene to the legacy key.
// This stand-in does just that, so the gallery path can be tested without the editor.
vi.mock("../store/useEditorStore", () => {
  storeImports.count += 1;
  localStorage.setItem("libre3d-legacy-scene", JSON.stringify({ migrated: true }));
  return { useEditorStore: {} };
});

let browser: BrowserStubs;

beforeEach(() => {
  browser = stubBrowserGlobals();
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("stashLegacyScene", () => {
  it("keeps the first scene set aside and never replaces it", () => {
    stashLegacyScene({ first: true });
    stashLegacyScene({ second: true });

    expect(JSON.parse(browser.localStorage.getItem(LEGACY_KEY)!)).toEqual({ first: true });
  });
});

describe("findLegacyScene", () => {
  it("returns the scene set aside, without loading the editor when the migration already ran", async () => {
    browser.localStorage.setItem(EDITOR_KEY, JSON.stringify({ state: {}, version: 17 }));
    stashLegacyScene({ already: "stashed" });

    await expect(findLegacyScene()).resolves.toEqual({ already: "stashed" });
    expect(storeImports.count).toBe(0);
  });

  it("is null in a browser with nothing saved", async () => {
    await expect(findLegacyScene()).resolves.toBeNull();
    expect(storeImports.count).toBe(0);
  });

  it("loads the store once to run the migration when the editor hasn't been opened since the upgrade", async () => {
    browser.localStorage.setItem(EDITOR_KEY, JSON.stringify({ state: { entities: [] }, version: 16 }));

    await expect(findLegacyScene()).resolves.toEqual({ migrated: true });
    expect(storeImports.count).toBe(1);
  });

  it("is gone once cleared (added to the user's scenes or discarded)", async () => {
    stashLegacyScene({ some: "scene" });
    clearLegacyScene();

    await expect(findLegacyScene()).resolves.toBeNull();
  });
});
