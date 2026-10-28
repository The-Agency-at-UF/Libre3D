import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { stubBrowserGlobals, type BrowserStubs } from "../testing/browserStubs";
import {
  clearAllSceneCaches,
  clearSceneCache,
  readSceneCache,
  resolveSceneToOpen,
  writeSceneCache,
  type SceneCacheEntry,
} from "./sceneCache";

const sceneDocument = (marker: string) => ({ format: "libre3d.scene", schemaVersion: 1, scene: { entities: [{ id: marker }] } });

const entry = (overrides: Partial<SceneCacheEntry> = {}): SceneCacheEntry => ({
  ownerId: "alice",
  sceneId: "scene-1",
  baseRevision: 3,
  document: sceneDocument("local edit"),
  ...overrides,
});

let browser: BrowserStubs;

beforeEach(() => {
  browser = stubBrowserGlobals();
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("reading and writing the local copy", () => {
  it("gives the same user their unsaved edits back", () => {
    writeSceneCache(entry());

    expect(readSceneCache("alice", "scene-1")).toEqual(entry());
  });

  it("never hands another user's edits to the next person on the browser, and removes them", () => {
    writeSceneCache(entry({ ownerId: "alice" }));

    expect(readSceneCache("bob", "scene-1")).toBeNull();
    expect(browser.localStorage.getItem("libre3d-scene-cache:scene-1")).toBeNull();
  });

  it("keeps each scene's edits separate", () => {
    writeSceneCache(entry({ sceneId: "scene-1" }));
    writeSceneCache(entry({ sceneId: "scene-2", document: sceneDocument("other scene") }));

    expect(readSceneCache("alice", "scene-1")?.document).toEqual(sceneDocument("local edit"));
    expect(readSceneCache("alice", "scene-2")?.document).toEqual(sceneDocument("other scene"));
  });

  it.each([
    ["unreadable JSON", "{not json"],
    ["an entry for a different scene", JSON.stringify(entry({ sceneId: "scene-9" }))],
    ["an entry without a revision", JSON.stringify({ ...entry(), baseRevision: undefined })],
  ])("drops %s", (_label, stored) => {
    browser.localStorage.setItem("libre3d-scene-cache:scene-1", stored);

    expect(readSceneCache("alice", "scene-1")).toBeNull();
    expect(browser.localStorage.getItem("libre3d-scene-cache:scene-1")).toBeNull();
  });

  it("clears one scene, or every scene's copy on sign-out, leaving other keys alone", () => {
    writeSceneCache(entry({ sceneId: "scene-1" }));
    writeSceneCache(entry({ sceneId: "scene-2" }));
    writeSceneCache(entry({ sceneId: "scene-3" }));
    browser.localStorage.setItem("libre3d-theme", "dark");

    clearSceneCache("scene-1");
    expect(readSceneCache("alice", "scene-1")).toBeNull();
    expect(readSceneCache("alice", "scene-2")).not.toBeNull();

    clearAllSceneCaches();
    expect(Object.keys(browser.localStorage)).toEqual(["libre3d-theme"]);
  });

  it("doesn't throw when storage is full; the cloud save is unaffected", () => {
    vi.spyOn(console, "warn").mockImplementation(() => undefined);
    vi.spyOn(browser.localStorage, "setItem").mockImplementation(() => {
      throw new DOMException("Quota exceeded", "QuotaExceededError");
    });

    expect(() => writeSceneCache(entry())).not.toThrow();
  });
});

describe("resolveSceneToOpen", () => {
  it("restores unsaved local edits made on top of the cloud's current revision", () => {
    const toOpen = resolveSceneToOpen({ document: sceneDocument("cloud"), revision: 3 }, entry({ baseRevision: 3 }));

    expect(toOpen).toMatchObject({ status: "ready", hasRecoveredEdits: true, discardCache: false });
    expect(toOpen.status === "ready" && toOpen.content?.entities).toEqual([{ id: "local edit" }]);
  });

  it("opens the cloud copy and discards local edits once the scene was saved from somewhere else", () => {
    const toOpen = resolveSceneToOpen({ document: sceneDocument("cloud"), revision: 4 }, entry({ baseRevision: 3 }));

    expect(toOpen).toMatchObject({ status: "ready", hasRecoveredEdits: false, discardCache: true });
    expect(toOpen.status === "ready" && toOpen.content?.entities).toEqual([{ id: "cloud" }]);
  });

  it("opens the cloud copy and discards a local copy that can't be read", () => {
    const toOpen = resolveSceneToOpen({ document: sceneDocument("cloud"), revision: 3 }, entry({ document: { broken: true } }));

    expect(toOpen).toMatchObject({ status: "ready", hasRecoveredEdits: false, discardCache: true });
  });

  it("opens a never-saved scene as a new scene", () => {
    expect(resolveSceneToOpen({ document: null, revision: 0 }, null)).toEqual({
      status: "ready",
      content: null,
      hasRecoveredEdits: false,
      discardCache: false,
    });
  });

  it("restores local edits to a scene that was never saved to the cloud", () => {
    const toOpen = resolveSceneToOpen({ document: null, revision: 0 }, entry({ baseRevision: 0 }));

    expect(toOpen).toMatchObject({ status: "ready", hasRecoveredEdits: true });
  });

  it("reports a cloud document from a newer version or a damaged one instead of opening it", () => {
    expect(resolveSceneToOpen({ document: { ...sceneDocument("x"), schemaVersion: 99 }, revision: 1 }, null)).toEqual({
      status: "newer",
      discardCache: false,
    });
    expect(resolveSceneToOpen({ document: { garbage: true }, revision: 1 }, null)).toEqual({
      status: "invalid",
      discardCache: false,
    });
  });
});
