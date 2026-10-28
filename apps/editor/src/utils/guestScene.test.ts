import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { stubBrowserGlobals, type BrowserStubs } from "../testing/browserStubs";
import { readGuestScene, writeGuestScene } from "./guestScene";
import { CURRENT_SCENE_SCHEMA_VERSION, type SceneContent } from "./sceneDocument";

const KEY = "libre3d-guest-scene";

// Only the parts these tests look at; the document format itself is covered in sceneDocument.test.ts.
const content = (marker: string) =>
  ({
    entities: [{ id: marker, name: marker, position: { x: 1, y: 2, z: 3 } }],
    sceneSettings: { bgColor: "#123456" },
    postProcessing: {},
    frame: {},
    cameraProfiles: {},
    activeProfileId: "personal",
  }) as unknown as SceneContent;

let browser: BrowserStubs;

beforeEach(() => {
  browser = stubBrowserGlobals();
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("the guest scene", () => {
  it("starts from the default scene when nothing is kept", () => {
    expect(readGuestScene()).toEqual({ status: "ready", content: null });
  });

  it("gives back what was kept, as a versioned scene document", () => {
    expect(writeGuestScene(content("cube"))).toBe(true);

    const stored = JSON.parse(browser.localStorage.getItem(KEY) ?? "null");
    expect(stored).toMatchObject({ format: "libre3d.scene", schemaVersion: CURRENT_SCENE_SCHEMA_VERSION });

    const opened = readGuestScene();
    expect(opened.status).toBe("ready");
    expect(opened.status === "ready" && opened.content).toMatchObject({
      entities: [{ id: "cube", position: { x: 1, y: 2, z: 3 } }],
      sceneSettings: { bgColor: "#123456" },
      activeProfileId: "personal",
    });
  });

  it("keeps only the latest scene", () => {
    writeGuestScene(content("first"));
    writeGuestScene(content("second"));

    const opened = readGuestScene();
    expect(opened.status === "ready" && opened.content?.entities.map((entity) => entity.id)).toEqual(["second"]);
  });

  it("starts over from the default scene when what's kept is unreadable", () => {
    for (const stored of ["not json", "null", JSON.stringify({ format: "something else" })]) {
      browser.localStorage.setItem(KEY, stored);

      expect(readGuestScene(), stored).toEqual({ status: "ready", content: null });
    }
  });

  it("refuses a scene saved by a newer build rather than opening (and then overwriting) it", () => {
    const newer = { format: "libre3d.scene", schemaVersion: CURRENT_SCENE_SCHEMA_VERSION + 1, scene: { entities: [] } };
    browser.localStorage.setItem(KEY, JSON.stringify(newer));

    expect(readGuestScene()).toEqual({ status: "newer" });
  });

  it("reports a full or blocked storage instead of throwing", () => {
    vi.spyOn(console, "warn").mockImplementation(() => undefined);
    vi.spyOn(browser.localStorage, "setItem").mockImplementation(() => {
      throw new Error("QuotaExceededError");
    });

    expect(writeGuestScene(content("big"))).toBe(false);
  });
});
