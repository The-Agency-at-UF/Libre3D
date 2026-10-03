import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { stubBrowserGlobals, type BrowserStubs } from "../testing/browserStubs";
import { parseSceneDocument, toSceneDocument } from "../utils/sceneDocument";
import type { Entity } from "./useEditorStore";

const EDITOR_KEY = "libre3d-scene-state";
const LEGACY_KEY = "libre3d-legacy-scene";
const PREFERENCE_KEYS = ["activeTransformTool", "hudOverlay", "projectionMode", "transformSpace", "viewportZoom"];

let browser: BrowserStubs;

// The store hydrates from localStorage (and migrates) while its module loads, so each test seeds
// storage first and then loads a fresh copy.
const loadStore = async () => {
  vi.resetModules();
  return import("./useEditorStore");
};

const persisted = () => JSON.parse(browser.localStorage.getItem(EDITOR_KEY) ?? "null");
const legacyScene = () => JSON.parse(browser.localStorage.getItem(LEGACY_KEY) ?? "null");

const entity = (id: string, overrides: Partial<Entity> = {}): Entity => ({
  id,
  type: "cube",
  name: "Cube",
  position: [0, 0, 0],
  rotation: [0, 0, 0],
  scale: [1, 1, 1],
  visible: true,
  locked: false,
  parentId: null,
  ...overrides,
});

const light = entity("directional-light-1", { type: "directionalLight", name: "Directional Light", position: [5, 8, 4], color: "#ffffff" });

const seedEditorState = (state: Record<string, unknown>, version: number) =>
  browser.localStorage.setItem(EDITOR_KEY, JSON.stringify({ state, version }));

beforeEach(() => {
  browser = stubBrowserGlobals();
  // The migration has a leftover diagnostic log; keep test output clean.
  vi.spyOn(console, "log").mockImplementation(() => undefined);
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("persist v17 migration", () => {
  it("moves a v16 scene with content to the legacy key and keeps only editor preferences", async () => {
    seedEditorState(
      {
        entities: [entity("cube-1", { position: [1, 2, 3] }), light, entity("sphere-1", { type: "sphere", name: "Sphere" })],
        selectedEntityIds: ["cube-1"],
        currentPublishId: "publish-1",
        sceneSettings: { bgColor: "#123456" },
        cameraProfiles: { personal: { id: "personal", name: "Personal Camera", position: [1, 1, 1], target: [0, 0, 0], fov: 50, near: 0.1, far: 500, zoom: 1 } },
        activeProfileId: "personal",
        projectionMode: "orthographic",
        viewportZoom: 66,
      },
      16,
    );

    const { useEditorStore } = await loadStore();

    expect(persisted().version).toBe(17);
    expect(Object.keys(persisted().state).sort()).toEqual(PREFERENCE_KEYS);
    expect(useEditorStore.getState()).toMatchObject({ projectionMode: "orthographic", viewportZoom: 66, currentPublishId: null });

    const stashed = parseSceneDocument(legacyScene());
    expect(stashed.ok && stashed.content.entities.map((e) => e.name)).toEqual(["Cube", "Directional Light", "Sphere"]);
    expect(stashed.ok && stashed.content.sceneSettings?.bgColor).toBe("#123456");
    expect(stashed.ok && stashed.content.cameraProfiles?.personal.fov).toBe(50);
  });

  it("drops an untouched starter scene instead of offering it for upload", async () => {
    seedEditorState({ entities: [entity("cube-1"), light], viewportZoom: 100 }, 16);

    await loadStore();

    expect(persisted().version).toBe(17);
    expect(legacyScene()).toBeNull();
  });

  it("never replaces a scene that's already set aside", async () => {
    browser.localStorage.setItem(LEGACY_KEY, JSON.stringify({ kept: true }));
    seedEditorState({ entities: [entity("sphere-1", { type: "sphere", name: "Sphere" })] }, 16);

    await loadStore();

    expect(legacyScene()).toEqual({ kept: true });
  });

  it("runs an old blob (v11) through every earlier migration before setting the scene aside", async () => {
    seedEditorState(
      {
        entities: [
          { id: "box", type: "cube", name: "Box", position: [0, 1, 0], rotation: [0, 0, 0], scale: [1, 1, 1], color: "#ff0000" },
          { ...light, parentId: undefined },
        ],
        selectedEntityId: "box",
      },
      11,
    );

    await loadStore();

    const stashed = parseSceneDocument(legacyScene());
    const box = stashed.ok ? stashed.content.entities.find((e) => e.id === "box") : undefined;

    // v12: a color becomes material layers; v14: parentId defaults to null.
    expect(box?.color).toBeUndefined();
    expect(box?.materialLayers?.map((layer) => layer.type)).toEqual(["color", "lighting"]);
    expect(box?.parentId).toBeNull();
    expect(persisted().version).toBe(17);
  });

  it("writes the migrated state back right away, so the next load doesn't migrate again", async () => {
    seedEditorState({ entities: [entity("sphere-1", { type: "sphere", name: "Sphere" })] }, 16);

    const { useEditorStore } = await loadStore();

    expect(useEditorStore.persist.hasHydrated()).toBe(true);
    expect(persisted().version).toBe(17);
    expect(useEditorStore.temporal.getState().pastStates).toHaveLength(0);
  });

  it("starts from defaults in a browser with nothing saved", async () => {
    const { useEditorStore } = await loadStore();

    expect(useEditorStore.persist.hasHydrated()).toBe(true);
    expect(useEditorStore.getState().entities.map((e) => e.type)).toEqual(["cube", "directionalLight"]);
    expect(legacyScene()).toBeNull();
  });

  it("saves only editor preferences while editing; the scene goes to the cloud instead", async () => {
    const { useEditorStore } = await loadStore();

    useEditorStore.getState().addEntity("torus");
    useEditorStore.getState().setEditorState({ viewportZoom: 150 });

    expect(Object.keys(persisted().state).sort()).toEqual(PREFERENCE_KEYS);
    expect(persisted().state.viewportZoom).toBe(150);
  });
});

describe("loadScene", () => {
  it("opens a new scene with the starter content and clears selection, publish link, preview, and undo history", async () => {
    const { useEditorStore } = await loadStore();
    useEditorStore.getState().addEntity("torus");
    useEditorStore.getState().setCurrentPublishId("publish-1");
    useEditorStore.getState().setPreviewMode(true, "blob:preview");

    useEditorStore.getState().loadScene(null);

    const state = useEditorStore.getState();
    expect(state.entities.map((e) => e.type)).toEqual(["cube", "directionalLight"]);
    expect(state).toMatchObject({ selectedEntityIds: [], currentPublishId: null, isPreviewMode: false, previewGlbUrl: null });
    expect(useEditorStore.temporal.getState().pastStates).toHaveLength(0);
  });

  it("gives every new scene a fresh cube ID", async () => {
    const { useEditorStore } = await loadStore();

    useEditorStore.getState().loadScene(null);
    const firstCube = useEditorStore.getState().entities[0].id;
    useEditorStore.getState().loadScene(null);

    expect(useEditorStore.getState().entities[0].id).not.toBe(firstCube);
  });

  it("deep-merges saved settings over the current defaults, so settings added since keep their defaults", async () => {
    const { initialSceneDefaults, initialPostProcessingDefaults, initialFrameDefaults, useEditorStore } = await loadStore();

    useEditorStore.getState().loadScene({
      entities: [light],
      sceneSettings: { bgColor: "#123456", lights: { intensity: 2 } },
      postProcessing: { bloom: { enabled: false } },
    });

    const state = useEditorStore.getState();
    expect(state.sceneSettings).toEqual({
      ...initialSceneDefaults,
      bgColor: "#123456",
      lights: { ...initialSceneDefaults.lights, intensity: 2 },
    });
    expect(state.postProcessing.bloom).toEqual({ ...initialPostProcessingDefaults.bloom, enabled: false });
    expect(state.frame).toEqual(initialFrameDefaults);
  });

  it("always keeps the personal camera, and falls back to it from an unknown active profile", async () => {
    const { useEditorStore } = await loadStore();
    const wide = { id: "wide", name: "Wide", position: [0, 10, 20] as [number, number, number], target: [0, 0, 0] as [number, number, number], fov: 70, near: 0.1, far: 1000, zoom: 1 };

    useEditorStore.getState().loadScene({ entities: [light], cameraProfiles: { wide }, activeProfileId: "wide" });
    expect(Object.keys(useEditorStore.getState().cameraProfiles).sort()).toEqual(["personal", "wide"]);
    expect(useEditorStore.getState().activeProfileId).toBe("wide");

    useEditorStore.getState().loadScene({ entities: [light], cameraProfiles: { wide }, activeProfileId: "deleted-camera" });
    expect(useEditorStore.getState().activeProfileId).toBe("personal");
  });

  it("copies what it loads, so the caller's objects never become live store state", async () => {
    const { useEditorStore } = await loadStore();
    const saved = [entity("cube-1", { position: [1, 2, 3] })];

    useEditorStore.getState().loadScene({ entities: saved });
    saved[0].position[0] = 99;

    expect(useEditorStore.getState().entities[0].position).toEqual([1, 2, 3]);
  });

  it("starts undo history over: Ctrl+Z can't reach back into the previous scene", async () => {
    const { useEditorStore } = await loadStore();
    useEditorStore.getState().addEntity("torus");
    useEditorStore.getState().addEntity("sphere");

    useEditorStore.getState().loadScene({ entities: [light] });
    useEditorStore.temporal.getState().undo();

    expect(useEditorStore.getState().entities.map((e) => e.id)).toEqual(["directional-light-1"]);
  });
});

describe("read-only (the scene is open for editing elsewhere)", () => {
  const viewOnlyStore = async () => {
    const { useEditorStore } = await loadStore();
    useEditorStore.getState().loadScene({ entities: [entity("cube-1"), light] });
    useEditorStore.getState().setReadOnly("openElsewhere");
    return useEditorStore;
  };

  it("drops every action that would change the scene's content", async () => {
    const useEditorStore = await viewOnlyStore();
    const before = useEditorStore.getState();
    const store = useEditorStore.getState();

    store.addEntity("torus");
    store.removeEntity(["cube-1"]);
    store.duplicateEntity(["cube-1"]);
    store.groupEntities(["cube-1", "directional-light-1"]);
    store.renameEntity("cube-1", "Renamed");
    store.toggleVisibility("cube-1");
    store.updateEntityTransform("cube-1", { position: [5, 5, 5] });
    store.updateSceneSettings({ bgColor: "#ff0000" });
    store.updatePostProcessing({ bloom: { enabled: false } });
    store.updateFrameSettings({ mode: "fixed" });
    store.addMaterialLayer("cube-1", "color");
    store.setEditorState({ sceneSettings: { ...before.sceneSettings, bgColor: "#00ff00" } });

    const after = useEditorStore.getState();
    expect(after.entities).toBe(before.entities);
    expect(after.sceneSettings).toBe(before.sceneSettings);
    expect(after.postProcessing).toBe(before.postProcessing);
    expect(after.frame).toBe(before.frame);
  });

  it("drops a mixed update whole rather than applying part of it", async () => {
    const useEditorStore = await viewOnlyStore();
    const before = useEditorStore.getState();

    useEditorStore.getState().setEditorState({ viewportZoom: 140, frame: { ...before.frame, width: 640 } });

    expect(useEditorStore.getState()).toMatchObject({ viewportZoom: before.viewportZoom, frame: before.frame });
  });

  it("still lets you select, move the camera, and change editor preferences", async () => {
    const useEditorStore = await viewOnlyStore();

    useEditorStore.getState().selectEntity("cube-1");
    useEditorStore.getState().updateProfileData("personal", { position: [9, 9, 9] });
    useEditorStore.getState().setEditorState({ viewportZoom: 140, activeTransformTool: "rotate" });

    expect(useEditorStore.getState()).toMatchObject({ selectedEntityIds: ["cube-1"], viewportZoom: 140, activeTransformTool: "rotate" });
    expect(useEditorStore.getState().cameraProfiles.personal.position).toEqual([9, 9, 9]);
  });

  it("still shows the latest saved scene through loadScene", async () => {
    const useEditorStore = await viewOnlyStore();

    useEditorStore.getState().loadScene({ entities: [entity("sphere-1", { type: "sphere" })] });

    expect(useEditorStore.getState().entities.map((e) => e.id)).toEqual(["sphere-1"]);
    expect(useEditorStore.getState().readOnlyReason).toBe("openElsewhere");
  });

  it("clears undo history on entering it, so Ctrl+Z can't step the scene back either", async () => {
    const { useEditorStore } = await loadStore();
    useEditorStore.getState().loadScene({ entities: [light] });
    useEditorStore.getState().addEntity("torus");

    useEditorStore.getState().setReadOnly("openElsewhere");
    useEditorStore.temporal.getState().undo();

    expect(useEditorStore.temporal.getState().pastStates).toHaveLength(0);
    expect(useEditorStore.getState().entities.map((e) => e.type)).toEqual(["directionalLight", "torus"]);
  });

  it("edits again once it's lifted, and is never persisted", async () => {
    const useEditorStore = await viewOnlyStore();

    expect(persisted().state.readOnlyReason).toBeUndefined();
    useEditorStore.getState().setReadOnly(null);
    useEditorStore.getState().addEntity("torus");

    expect(useEditorStore.getState().entities.map((e) => e.type)).toContain("torus");
  });
});

describe("store → document → cloud → store", () => {
  it("brings back exactly the scene that was saved", async () => {
    const { selectSceneContent, useEditorStore } = await loadStore();
    const store = useEditorStore.getState();
    const torusId = store.addEntity("torus");
    store.updateEntityTransform(torusId, { position: [1, 2, 3], rotation: [0, 0.5, 0] });
    store.renameEntity(torusId, "Donut");
    const groupId = store.groupEntities([torusId]);
    store.updateSceneSettings({ bgColor: "#abcdef", fogEnabled: true });
    store.updatePostProcessing({ vignette: { intensity: 40 } });
    store.updateFrameSettings({ mode: "fixed", preset: "1080x1080", width: 1080, height: 1080 });
    store.addCameraProfile("closeup", { position: [0, 2, 3], fov: 35 });

    const saved = selectSceneContent(useEditorStore.getState());
    const overTheWire = JSON.parse(JSON.stringify(toSceneDocument(saved)));

    const reopened = await loadStore();
    const parsed = parseSceneDocument(overTheWire);
    expect(parsed.ok).toBe(true);
    reopened.useEditorStore.getState().loadScene(parsed.ok ? parsed.content : null);

    // Compared as JSON carries it: JSON has no -0 (the grouping math produces some), so those come
    // back as 0, which renders identically.
    expect(reopened.selectSceneContent(reopened.useEditorStore.getState())).toEqual(JSON.parse(JSON.stringify(saved)));
    expect(reopened.useEditorStore.getState().entities.find((e) => e.id === torusId)?.parentId).toBe(groupId);
  });
});
