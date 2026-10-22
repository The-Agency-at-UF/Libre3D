import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { stubBrowserGlobals, type BrowserStubs } from "../testing/browserStubs";
import { parseSceneDocument, toSceneDocument } from "../utils/sceneDocument";
import type { Entity } from "./useEditorStore";

const EDITOR_KEY = "libre3d-scene-state";
const PREFERENCE_KEYS = ["activeTransformTool", "hudOverlay", "projectionMode", "transformSpace", "viewportZoom"];

let browser: BrowserStubs;

// The store hydrates from localStorage (and migrates) while its module loads, so each test seeds
// storage first and then loads a fresh copy.
const loadStore = async () => {
  vi.resetModules();
  return import("./useEditorStore");
};

const persisted = () => JSON.parse(browser.localStorage.getItem(EDITOR_KEY) ?? "null");

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
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("persist v17 migration", () => {
  it("keeps only editor preferences from an older blob; the scene saved there is dropped", async () => {
    seedEditorState(
      {
        entities: [entity("cube-1", { position: [1, 2, 3] }), light, entity("sphere-1", { type: "sphere", name: "Sphere" })],
        selectedEntityIds: ["cube-1"],
        sceneSettings: { bgColor: "#123456" },
        projectionMode: "orthographic",
        viewportZoom: 66,
      },
      16,
    );

    const { useEditorStore } = await loadStore();
    const state = useEditorStore.getState();

    expect(persisted().version).toBe(17);
    expect(Object.keys(persisted().state).sort()).toEqual(PREFERENCE_KEYS);
    expect(state).toMatchObject({ projectionMode: "orthographic", viewportZoom: 66, selectedEntityIds: [] });
    // The starter scene, not the old one: scenes are opened from the cloud.
    expect(state.entities.map((e) => e.type)).toEqual(["cube", "directionalLight"]);
    expect(state.sceneSettings.bgColor).not.toBe("#123456");
  });

  it("drops the stray keys of a much older blob (v11) instead of merging them into the store", async () => {
    seedEditorState({ selectedEntityId: "box", bgColor: "#ff0000", toneMap: "ACES Filmic", viewportZoom: 80 }, 11);

    const { useEditorStore } = await loadStore();
    const state = useEditorStore.getState() as unknown as Record<string, unknown>;

    expect(state.viewportZoom).toBe(80);
    expect(state).not.toHaveProperty("selectedEntityId");
    expect(state).not.toHaveProperty("bgColor");
    expect(state).not.toHaveProperty("toneMap");
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
  it("opens a new scene with the starter content and clears selection, preview, and undo history", async () => {
    const { useEditorStore } = await loadStore();
    useEditorStore.getState().addEntity("torus");
    useEditorStore.getState().setPreviewMode(true, "blob:preview");

    useEditorStore.getState().loadScene(null);

    const state = useEditorStore.getState();
    expect(state.entities.map((e) => e.type)).toEqual(["cube", "directionalLight"]);
    expect(state).toMatchObject({ selectedEntityIds: [], isPreviewMode: false, previewGlbUrl: null });
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

describe("undo history", () => {
  it("records a step only when the scene changed, not for selecting or viewing a state", async () => {
    const { useEditorStore } = await loadStore();
    useEditorStore.getState().loadScene({ entities: [entity("cube-1"), light] });
    const store = useEditorStore.getState();

    store.selectEntity("cube-1");
    const stateId = store.addState("cube-1");
    store.setViewedState("cube-1", null);
    store.setViewedState("cube-1", stateId);
    store.setEditorState({ viewportZoom: 140 });
    store.selectEntity("directional-light-1");

    expect(useEditorStore.temporal.getState().pastStates).toHaveLength(1);
  });
});

describe("read-only (the scene is open for editing elsewhere)", () => {
  const viewOnlyStore = async () => {
    const { useEditorStore } = await loadStore();
    useEditorStore.getState().loadScene({
      entities: [entity("cube-1"), light],
      animation: { states: { up: { id: "up", targetId: "cube-1", name: "Up", order: 0, values: { position: [0, 2, 0] } } } },
    });
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
    store.addState("cube-1");
    store.renameState("up", "Renamed");
    store.setStateValues("up", { position: [5, 5, 5] });
    store.clearStateValue("up", "position");
    store.removeState("up");

    const after = useEditorStore.getState();
    expect(after.entities).toBe(before.entities);
    expect(after.sceneSettings).toBe(before.sceneSettings);
    expect(after.postProcessing).toBe(before.postProcessing);
    expect(after.frame).toBe(before.frame);
    expect(after.animation).toBe(before.animation);
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

  it("still lets you look at an object's states", async () => {
    const useEditorStore = await viewOnlyStore();
    const { selectViewedObjectState } = await import("./useEditorStore");

    useEditorStore.getState().setViewedState("cube-1", "up");

    expect(selectViewedObjectState(useEditorStore.getState(), "cube-1")?.name).toBe("Up");
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
    const stateId = store.addState(torusId);
    store.setStateValues(stateId, { position: [1, 4, 3], rotation: [0, 2 * Math.PI, 0] });

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
    expect(reopened.useEditorStore.getState().animation.states[stateId].targetId).toBe(torusId);
  });
});

describe("object states", () => {
  // A cube at (2, 0, 0) with a child sphere, and the light.
  const storeWithCube = async () => {
    const module = await loadStore();
    module.useEditorStore.getState().loadScene({
      entities: [entity("cube-1", { position: [2, 0, 0] }), entity("sphere-1", { type: "sphere", parentId: "cube-1" }), light],
    });
    module.useEditorStore.getState().selectEntity("cube-1");
    return module;
  };

  it("adds State, then State 2, each viewed as it's added and set to nothing yet", async () => {
    const { useEditorStore, selectViewedObjectState } = await storeWithCube();

    const first = useEditorStore.getState().addState("cube-1");
    const second = useEditorStore.getState().addState("cube-1");

    const { states } = useEditorStore.getState().animation;
    expect([states[first].name, states[second].name]).toEqual(["State", "State 2"]);
    expect(states[second]).toMatchObject({ targetId: "cube-1", values: {} });
    expect(selectViewedObjectState(useEditorStore.getState(), "cube-1")?.id).toBe(second);
  });

  it("sets values in a state without sharing vectors, and resets one to Base", async () => {
    const { useEditorStore } = await storeWithCube();
    const stateId = useEditorStore.getState().addState("cube-1");
    const position: [number, number, number] = [2, 3, 0];

    useEditorStore.getState().setStateValues(stateId, { position });
    useEditorStore.getState().setStateValues(stateId, { rotation: [0, 1, 0] });
    position[1] = 99;
    expect(useEditorStore.getState().animation.states[stateId].values).toEqual({ position: [2, 3, 0], rotation: [0, 1, 0] });

    useEditorStore.getState().clearStateValue(stateId, "position");
    expect(useEditorStore.getState().animation.states[stateId].values).toEqual({ rotation: [0, 1, 0] });
  });

  it("renames a state, ignoring a blank name", async () => {
    const { useEditorStore } = await storeWithCube();
    const stateId = useEditorStore.getState().addState("cube-1");

    useEditorStore.getState().renameState(stateId, "  Up ");
    useEditorStore.getState().renameState(stateId, "   ");

    expect(useEditorStore.getState().animation.states[stateId].name).toBe("Up");
  });

  it("removes a state and shows the object in Base, until an undo brings the state back", async () => {
    const { useEditorStore, selectViewedObjectState } = await storeWithCube();
    const stateId = useEditorStore.getState().addState("cube-1");

    useEditorStore.getState().removeState(stateId);
    expect(useEditorStore.getState().animation.states).toEqual({});
    expect(selectViewedObjectState(useEditorStore.getState(), "cube-1")).toBeNull();

    useEditorStore.temporal.getState().undo();
    expect(selectViewedObjectState(useEditorStore.getState(), "cube-1")?.id).toBe(stateId);
  });

  it("undoes state edits", async () => {
    const { useEditorStore } = await storeWithCube();
    const stateId = useEditorStore.getState().addState("cube-1");
    useEditorStore.getState().setStateValues(stateId, { position: [2, 3, 0] });

    useEditorStore.temporal.getState().undo();

    expect(useEditorStore.getState().animation.states[stateId].values).toEqual({});
  });

  it("keeps each object in the state it's shown in when something else is selected", async () => {
    const { useEditorStore, selectViewedObjectState } = await storeWithCube();
    const cubeState = useEditorStore.getState().addState("cube-1");
    useEditorStore.getState().selectEntity("sphere-1");
    const sphereState = useEditorStore.getState().addState("sphere-1");

    useEditorStore.getState().selectEntity(null);

    expect(selectViewedObjectState(useEditorStore.getState(), "cube-1")?.id).toBe(cubeState);
    expect(selectViewedObjectState(useEditorStore.getState(), "sphere-1")?.id).toBe(sphereState);

    useEditorStore.getState().setViewedState("cube-1", null);
    expect(selectViewedObjectState(useEditorStore.getState(), "cube-1")).toBeNull();
    expect(selectViewedObjectState(useEditorStore.getState(), "sphere-1")?.id).toBe(sphereState);
  });

  it("shows Base when the viewed state is undone away", async () => {
    const { useEditorStore, selectViewedObjectState } = await storeWithCube();
    useEditorStore.getState().addState("cube-1");

    useEditorStore.temporal.getState().undo();

    expect(selectViewedObjectState(useEditorStore.getState(), "cube-1")).toBeNull();
  });

  it("opens a scene in the states it was saved in", async () => {
    const { useEditorStore, selectViewedObjectState } = await storeWithCube();
    useEditorStore.getState().addState("cube-1");

    useEditorStore.getState().loadScene({
      entities: [entity("cube-2"), light],
      animation: { states: { big: { id: "big", targetId: "cube-2", name: "Big", order: 0, values: { scale: [2, 2, 2] } } } },
      viewedStates: { "cube-2": "big" },
    });

    expect(useEditorStore.getState().viewedStates).toEqual({ "cube-2": "big" });
    expect(selectViewedObjectState(useEditorStore.getState(), "cube-2")?.name).toBe("Big");

    useEditorStore.getState().loadScene({ entities: [light] });
    expect(useEditorStore.getState()).toMatchObject({ viewedStates: {}, animation: { states: {}, events: {} } });
  });

  it("sends transform edits to the state each object is shown in, or to Base, in one undo step", async () => {
    const { useEditorStore } = await storeWithCube();
    const stateId = useEditorStore.getState().addState("cube-1");
    const stepsBefore = useEditorStore.temporal.getState().pastStates.length;

    useEditorStore.getState().updateShownTransforms({ "cube-1": { position: [2, 5, 0] }, "sphere-1": { scale: [3, 3, 3] } });

    const state = useEditorStore.getState();
    expect(state.animation.states[stateId].values).toEqual({ position: [2, 5, 0] });
    expect(state.entities.find((e) => e.id === "cube-1")?.position).toEqual([2, 0, 0]);
    expect(state.entities.find((e) => e.id === "sphere-1")?.scale).toEqual([3, 3, 3]);
    expect(useEditorStore.temporal.getState().pastStates.length).toBe(stepsBefore + 1);
  });

  it("removes an object's states, and its children's, with it; one undo brings them all back", async () => {
    const { useEditorStore } = await storeWithCube();
    const cubeState = useEditorStore.getState().addState("cube-1");
    const sphereState = useEditorStore.getState().addState("sphere-1");

    useEditorStore.getState().removeEntity(["cube-1"]);
    expect(useEditorStore.getState().animation.states).toEqual({});

    useEditorStore.temporal.getState().undo();
    expect(Object.keys(useEditorStore.getState().animation.states).sort()).toEqual([cubeState, sphereState].sort());
    expect(useEditorStore.getState().entities.map((e) => e.id)).toContain("cube-1");
  });

  it("gives a duplicate its own copy of the states, moved with it and shown the same way", async () => {
    const { useEditorStore, selectViewedObjectState } = await storeWithCube();
    const stateId = useEditorStore.getState().addState("cube-1");
    useEditorStore.getState().setStateValues(stateId, { position: [2, 3, 0] });

    useEditorStore.getState().duplicateEntity(["cube-1"]);

    const copyId = useEditorStore.getState().selectedEntityIds[0];
    const copies = Object.values(useEditorStore.getState().animation.states).filter((state) => state.targetId === copyId);
    expect(copies).toHaveLength(1);
    expect(copies[0]).toMatchObject({ name: "State", values: { position: [2.5, 3, 0.5] } });
    expect(copies[0].id).not.toBe(stateId);
    expect(selectViewedObjectState(useEditorStore.getState(), copyId)?.id).toBe(copies[0].id);
  });

  it("keeps a state in place when its object is grouped and ungrouped", async () => {
    const { useEditorStore } = await storeWithCube();
    const stateId = useEditorStore.getState().addState("cube-1");
    useEditorStore.getState().setStateValues(stateId, { position: [2, 3, 0] });

    const groupId = useEditorStore.getState().groupEntities(["cube-1"]);
    // The group sits at the cube, so the cube is at its origin and the state 3 above it.
    expect(useEditorStore.getState().animation.states[stateId].values.position).toEqual([0, 3, 0]);

    useEditorStore.getState().ungroupEntity(groupId);
    expect(useEditorStore.getState().animation.states[stateId].values.position).toEqual([2, 3, 0]);
  });

  it("drops a group's own states when it's ungrouped", async () => {
    const { useEditorStore } = await storeWithCube();
    const groupId = useEditorStore.getState().groupEntities(["cube-1"]);
    useEditorStore.getState().addState(groupId);

    useEditorStore.getState().ungroupEntity(groupId);

    expect(useEditorStore.getState().animation.states).toEqual({});
  });
});
