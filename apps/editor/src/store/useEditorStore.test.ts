import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { stubBrowserGlobals, type BrowserStubs } from "../testing/browserStubs";
import { parseSceneDocument, toSceneDocument } from "../utils/sceneDocument";
import type { PathData, PathPoint } from "../paths/pathGeometry";
import type { ImportedPath, ImportedSvgItem } from "../paths/svgImport";
import type { ShapeData } from "../paths/shapeGeometry";
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
    useEditorStore.getState().setPreviewMode(true);

    useEditorStore.getState().loadScene(null);

    const state = useEditorStore.getState();
    expect(state.entities.map((e) => e.type)).toEqual(["cube", "directionalLight"]);
    expect(state).toMatchObject({ selectedEntityIds: [], isPreviewMode: false });
    expect(useEditorStore.temporal.getState().pastStates).toHaveLength(0);
  });

  it("lights a new scene with the environment, and an old one the way it was saved", async () => {
    const { useEditorStore, selectSceneContent } = await loadStore();
    const { parseSceneDocument, toSceneDocument } = await import("../utils/sceneDocument");

    useEditorStore.getState().loadScene(null);
    expect(useEditorStore.getState().sceneSettings.environment).toEqual({ enabled: true, intensity: 1 });

    const { environment: _environment, ...v3Settings } = useEditorStore.getState().sceneSettings;
    const v3 = { ...toSceneDocument({ ...selectSceneContent(useEditorStore.getState()), sceneSettings: v3Settings as never }), schemaVersion: 3 };
    const parsed = parseSceneDocument(JSON.parse(JSON.stringify(v3)));
    useEditorStore.getState().loadScene(parsed.ok ? parsed.content : null);

    expect(useEditorStore.getState().sceneSettings.environment).toEqual({ enabled: false, intensity: 1 });
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

describe("events", () => {
  // A cube at (2, 0, 0) with a child sphere, a separate button cube, and the light; the cube has a State.
  const storeWithCube = async () => {
    const module = await loadStore();
    module.useEditorStore.getState().loadScene({
      entities: [
        entity("cube-1", { position: [2, 0, 0] }),
        entity("sphere-1", { type: "sphere", parentId: "cube-1" }),
        entity("button-1"),
        light,
      ],
    });
    const stateId = module.useEditorStore.getState().addState("cube-1");
    return { ...module, stateId };
  };

  it("adds an event with a transition from Base to the object's state, undoably", async () => {
    const { useEditorStore, stateId } = await storeWithCube();

    const eventId = useEditorStore.getState().addEvent("cube-1", "start");

    expect(useEditorStore.getState().animation.events[eventId]).toMatchObject({
      ownerId: "cube-1",
      trigger: "start",
      actions: [{ type: "transition", targetId: "cube-1", from: "base", steps: [{ to: stateId }] }],
    });
    useEditorStore.temporal.getState().undo();
    expect(useEditorStore.getState().animation.events).toEqual({});
  });

  it("doesn't add an event to an object that isn't there", async () => {
    const { useEditorStore } = await storeWithCube();

    expect(useEditorStore.getState().addEvent("deleted", "start")).toBe("");
    expect(useEditorStore.getState().animation.events).toEqual({});
  });

  it("changes the trigger and replaces the actions without sharing them, one undo step each", async () => {
    const { useEditorStore } = await storeWithCube();
    const eventId = useEditorStore.getState().addEvent("cube-1", "start");
    const actions = useEditorStore.getState().animation.events[eventId].actions.map((action) => ({
      ...action,
      loop: "infinite" as const,
      steps: action.steps.map((step) => ({ ...step, duration: 2 })),
    }));

    useEditorStore.getState().updateEvent(eventId, { trigger: "mouseDown" });
    useEditorStore.getState().updateEvent(eventId, { actions });
    actions[0].steps[0].duration = 99;

    expect(useEditorStore.getState().animation.events[eventId]).toMatchObject({
      trigger: "mouseDown",
      actions: [{ loop: "infinite", steps: [{ duration: 2 }] }],
    });
    useEditorStore.temporal.getState().undo();
    expect(useEditorStore.getState().animation.events[eventId]).toMatchObject({ trigger: "mouseDown", actions: [{ loop: 0 }] });
  });

  it("removes an event", async () => {
    const { useEditorStore } = await storeWithCube();
    const eventId = useEditorStore.getState().addEvent("cube-1", "start");

    useEditorStore.getState().removeEvent(eventId);

    expect(useEditorStore.getState().animation.events).toEqual({});
  });

  it("can't change events in a view-only tab", async () => {
    const { useEditorStore } = await storeWithCube();
    const eventId = useEditorStore.getState().addEvent("cube-1", "start");
    useEditorStore.getState().setReadOnly("openElsewhere");

    useEditorStore.getState().addEvent("cube-1", "mouseDown");
    useEditorStore.getState().updateEvent(eventId, { trigger: "mouseDown" });
    useEditorStore.getState().removeEvent(eventId);

    expect(Object.values(useEditorStore.getState().animation.events)).toMatchObject([{ id: eventId, trigger: "start" }]);
  });

  it("removes a deleted object's events and other objects' actions that move it; one undo brings it all back", async () => {
    const { useEditorStore } = await storeWithCube();
    const own = useEditorStore.getState().addEvent("sphere-1", "start");
    const click = useEditorStore.getState().addEvent("button-1", "mouseDown");
    const clickActions = useEditorStore.getState().animation.events[click].actions;
    useEditorStore.getState().updateEvent(click, { actions: [{ ...clickActions[0], targetId: "sphere-1" }, clickActions[0]] });

    // Deleting the cube deletes its child sphere too.
    useEditorStore.getState().removeEntity(["cube-1"]);
    const { events } = useEditorStore.getState().animation;
    expect(Object.keys(events)).toEqual([click]);
    expect(events[click].actions.map((action) => action.targetId)).toEqual(["button-1"]);

    useEditorStore.temporal.getState().undo();
    const restored = useEditorStore.getState().animation.events;
    expect(Object.keys(restored).sort()).toEqual([own, click].sort());
    expect(restored[click].actions.map((action) => action.targetId)).toEqual(["sphere-1", "button-1"]);
  });

  it("gives a duplicate copies of the events, moving the copy through its own states", async () => {
    const { useEditorStore, stateId } = await storeWithCube();
    const eventId = useEditorStore.getState().addEvent("cube-1", "start");

    useEditorStore.getState().duplicateEntity(["cube-1"]);

    const copyId = useEditorStore.getState().selectedEntityIds[0];
    const { states, events } = useEditorStore.getState().animation;
    const copiedState = Object.values(states).find((state) => state.targetId === copyId)!;
    const copies = Object.values(events).filter((event) => event.ownerId === copyId);
    expect(copies).toHaveLength(1);
    expect(copies[0].id).not.toBe(eventId);
    expect(copies[0].actions[0]).toMatchObject({ targetId: copyId, from: "base", steps: [{ to: copiedState.id }] });
    expect(events[eventId].actions[0]).toMatchObject({ targetId: "cube-1", steps: [{ to: stateId }] });
  });

  it("drops a group's own events when it's ungrouped", async () => {
    const { useEditorStore } = await storeWithCube();
    const groupId = useEditorStore.getState().groupEntities(["button-1"]);
    useEditorStore.getState().addEvent(groupId, "start");
    const keep = useEditorStore.getState().addEvent("cube-1", "start");

    useEditorStore.getState().ungroupEntity(groupId);

    expect(Object.keys(useEditorStore.getState().animation.events)).toEqual([keep]);
  });

  it("previews an action in a view-only tab without an undo step, until Play or another scene", async () => {
    const { useEditorStore } = await storeWithCube();
    const eventId = useEditorStore.getState().addEvent("cube-1", "start");
    const actionId = useEditorStore.getState().animation.events[eventId].actions[0].id;
    useEditorStore.getState().setReadOnly("openElsewhere");

    useEditorStore.getState().setPreviewingAction(actionId);
    expect(useEditorStore.getState().previewingActionId).toBe(actionId);
    expect(useEditorStore.temporal.getState().pastStates).toHaveLength(0);

    useEditorStore.getState().setPreviewMode(true);
    expect(useEditorStore.getState().previewingActionId).toBeNull();

    useEditorStore.getState().setPreviewingAction(actionId);
    useEditorStore.getState().loadScene(null);
    expect(useEditorStore.getState().previewingActionId).toBeNull();
  });

  it("keeps events through save and reload", async () => {
    const { useEditorStore, selectSceneContent } = await storeWithCube();
    useEditorStore.getState().addEvent("cube-1", "mouseDown");
    const saved = parseSceneDocument(JSON.parse(JSON.stringify(toSceneDocument(selectSceneContent(useEditorStore.getState())))));
    const events = useEditorStore.getState().animation.events;

    useEditorStore.getState().loadScene(null);
    expect(useEditorStore.getState().animation.events).toEqual({});
    useEditorStore.getState().loadScene(saved.ok ? saved.content : null);
    expect(useEditorStore.getState().animation.events).toEqual(events);
  });
});

describe("paths", () => {
  const storeWithPath = async () => {
    const module = await loadStore();
    module.useEditorStore.getState().loadScene({ entities: [light] });
    const pathId = module.useEditorStore.getState().addEntity("path");
    return { ...module, pathId, path: () => module.useEditorStore.getState().entities.find((e) => e.id === pathId)! };
  };

  it("adds a sample path, drawn in full with round caps and the default material", async () => {
    const { path } = await storeWithPath();

    expect(path()).toMatchObject({ type: "path", name: "Path", trimStart: 0, trimEnd: 1, stroke: { radius: 0.12, caps: "round" } });
    expect(path().path?.points).toHaveLength(3);
    expect(path().materialLayers?.map((layer) => layer.type)).toEqual(["color", "lighting"]);
  });

  it("changes the stroke in one undo step each, ignoring a radius that draws nothing", async () => {
    const { useEditorStore, pathId, path } = await storeWithPath();
    const stepsBefore = useEditorStore.temporal.getState().pastStates.length;

    useEditorStore.getState().updatePathStrokes([pathId], { radius: 0.3 });
    useEditorStore.getState().updatePathStrokes([pathId], { caps: "flat" });
    useEditorStore.getState().updatePathStrokes([pathId], { radius: 0 });
    useEditorStore.getState().updatePathStrokes([pathId], { radius: Number.NaN });
    expect(path().stroke).toEqual({ radius: 0.3, caps: "flat" });

    useEditorStore.temporal.getState().undo();
    expect(path().stroke).toEqual({ radius: 0.3, caps: "round" });
    expect(useEditorStore.temporal.getState().pastStates.length).toBe(stepsBefore + 1);
  });

  it("changes the stroke of several paths in one undo step, and of nothing else", async () => {
    const { useEditorStore, pathId, path } = await storeWithPath();
    const otherId = useEditorStore.getState().addEntity("path");
    const other = () => useEditorStore.getState().entities.find((e) => e.id === otherId)!;
    const stepsBefore = useEditorStore.temporal.getState().pastStates.length;

    useEditorStore.getState().updatePathStrokes([pathId, otherId, "directional-light-1"], { radius: 0.05 });

    expect([path().stroke, other().stroke]).toEqual([
      { radius: 0.05, caps: "round" },
      { radius: 0.05, caps: "round" },
    ]);
    expect(useEditorStore.getState().entities.find((e) => e.id === "directional-light-1")!.stroke).toBeUndefined();
    expect(useEditorStore.temporal.getState().pastStates.length).toBe(stepsBefore + 1);

    const before = useEditorStore.getState().entities;
    useEditorStore.getState().updatePathStrokes(["directional-light-1"], { radius: 0.2 });
    expect(useEditorStore.getState().entities).toBe(before);
  });

  it("can't change a path's stroke or trim in a view-only tab", async () => {
    const { useEditorStore, pathId, path } = await storeWithPath();
    useEditorStore.getState().setReadOnly("openElsewhere");

    useEditorStore.getState().updatePathStrokes([pathId], { radius: 0.3 });
    useEditorStore.getState().updateShownTransforms({ [pathId]: { trimEnd: 0.5 } });

    expect(path()).toMatchObject({ stroke: { radius: 0.12 }, trimEnd: 1 });
  });

  it("sends a trim edit to the state the path is shown in, or to Base", async () => {
    const { useEditorStore, pathId, path } = await storeWithPath();

    useEditorStore.getState().updateShownTransforms({ [pathId]: { trimStart: 0.25 } });
    const hiddenId = useEditorStore.getState().addState(pathId);
    useEditorStore.getState().updateShownTransforms({ [pathId]: { trimEnd: 0 } });

    expect(path()).toMatchObject({ trimStart: 0.25, trimEnd: 1 });
    expect(useEditorStore.getState().animation.states[hiddenId].values).toEqual({ trimEnd: 0 });
  });

  it("gives a duplicate its own copy of the path", async () => {
    const { useEditorStore, pathId, path } = await storeWithPath();

    useEditorStore.getState().duplicateEntity([pathId]);
    const copy = useEditorStore.getState().entities.find((e) => e.id === useEditorStore.getState().selectedEntityIds[0])!;

    expect(copy.path).toEqual(path().path);
    expect(copy.path!.points[0].position).not.toBe(path().path!.points[0].position);
    expect(copy.stroke).not.toBe(path().stroke);
  });

  it("adds a drawn shape at its origin and turn, flat, filled from both sides, selected, in one undo step", async () => {
    const { useEditorStore } = await loadStore();
    useEditorStore.getState().loadScene({ entities: [light] });
    const corner = (position: [number, number, number]): PathPoint => ({ position, handleIn: [0, 0, 0], handleOut: [0, 0, 0], mode: "corner" });
    const drawn: PathData = { points: [corner([0, 0, 0]), corner([1, 1, 0]), corner([1, 0, 0.001])], closed: false };

    const shapeId = useEditorStore.getState().addShape([0, 1, 2], [0, Math.PI / 2, 0], drawn);
    const added = useEditorStore.getState().entities.find((e) => e.id === shapeId)!;

    expect(added).toMatchObject({ type: "shape", name: "Shape", position: [0, 1, 2], rotation: [0, Math.PI / 2, 0] });
    expect(added.shape!.regions).toHaveLength(1);
    expect(added.shape!.regions[0].holes).toEqual([]);
    expect(added.shape!.regions[0].outline.points.map((point) => point.position)).toEqual([
      [0, 0, 0],
      [1, 1, 0],
      [1, 0, 0], // flat: Z dropped
    ]);
    expect(added.shape!.regions[0].outline.points[1].position).not.toBe(drawn.points[1].position);
    expect(added.materialLayers![0]).toMatchObject({ type: "color", doubleSided: true });
    expect(useEditorStore.getState().selectedEntityIds).toEqual([shapeId]);
    useEditorStore.temporal.getState().undo();
    expect(useEditorStore.getState().entities.some((e) => e.id === shapeId)).toBe(false);
  });

  it("adds a drawn path at its origin, selected, in one undo step", async () => {
    const { useEditorStore } = await loadStore();
    useEditorStore.getState().loadScene({ entities: [light] });
    const corner = (position: [number, number, number]): PathPoint => ({ position, handleIn: [0, 0, 0], handleOut: [0, 0, 0], mode: "corner" });
    const drawn: PathData = { points: [corner([0, 0, 0]), corner([1, 1, 0])], closed: false };

    const pathId = useEditorStore.getState().addPath([0, 1, 2], drawn);
    const added = useEditorStore.getState().entities.find((e) => e.id === pathId)!;

    expect(added).toMatchObject({ type: "path", position: [0, 1, 2], path: drawn, trimStart: 0, trimEnd: 1 });
    expect(added.path!.points[1].position).not.toBe(drawn.points[1].position);
    expect(useEditorStore.getState().selectedEntityIds).toEqual([pathId]);
    useEditorStore.temporal.getState().undo();
    expect(useEditorStore.getState().entities.some((e) => e.id === pathId)).toBe(false);
  });

  it("replaces a path's points in one undo step, for every state", async () => {
    const { useEditorStore, pathId, path } = await storeWithPath();
    const before = path().path!;
    useEditorStore.getState().addState(pathId);
    const edited = { ...before, closed: true };

    useEditorStore.getState().updatePath(pathId, edited);
    useEditorStore.getState().updatePath("directional-light-1", edited);

    expect(path().path).toEqual(edited);
    expect(path().path).not.toBe(edited);
    expect(useEditorStore.getState().entities.find((e) => e.id === "directional-light-1")!.path).toBeUndefined();
    useEditorStore.temporal.getState().undo();
    expect(path().path).toBe(before);
  });

  it("can't draw a shape or edit a path's points in a view-only tab", async () => {
    const { useEditorStore, pathId, path } = await storeWithPath();
    const before = useEditorStore.getState().entities;
    useEditorStore.getState().setReadOnly("openElsewhere");

    useEditorStore.getState().addShape([0, 0, 0], [0, 0, 0], path().path!);
    useEditorStore.getState().addPath([0, 0, 0], path().path!);
    useEditorStore.getState().updatePath(pathId, { ...path().path!, closed: true });

    expect(useEditorStore.getState().entities).toBe(before);
  });

  describe("imported from an SVG", () => {
    const corner = (position: [number, number, number]): PathPoint => ({ position, handleIn: [0, 0, 0], handleOut: [0, 0, 0], mode: "corner" });
    const imported = (x: number): ImportedPath => ({
      kind: "path",
      position: [x, 0, 0],
      path: { points: [corner([0, -1, 0]), corner([0, 1, 0])], closed: false },
      stroke: { radius: 0.05, caps: "round" },
    });
    const storeWithLight = async () => {
      const module = await loadStore();
      module.useEditorStore.getState().loadScene({ entities: [light] });
      return module;
    };

    it("adds a single path named after the file, selected, with its own copy of the points", async () => {
      const { useEditorStore } = await storeWithLight();
      const source = imported(1);

      const id = useEditorStore.getState().addImportedSvg("hello", [source]);
      const added = useEditorStore.getState().entities.find((e) => e.id === id)!;

      expect(useEditorStore.getState().entities).toHaveLength(2);
      expect(added).toMatchObject({ type: "path", name: "hello", position: [1, 0, 0], path: source.path, stroke: source.stroke, trimEnd: 1 });
      expect(added.parentId ?? null).toBeNull();
      expect(added.path!.points[0].position).not.toBe(source.path.points[0].position);
      expect(added.stroke).not.toBe(source.stroke);
      expect(useEditorStore.getState().selectedEntityIds).toEqual([id]);
    });

    it("puts several paths in a group named after the file, all in one undo step", async () => {
      const { useEditorStore } = await storeWithLight();
      const stepsBefore = useEditorStore.temporal.getState().pastStates.length;

      const groupId = useEditorStore.getState().addImportedSvg("hello", [imported(-1), imported(0), imported(1)]);
      const entities = useEditorStore.getState().entities;
      const children = entities.filter((e) => e.parentId === groupId);

      expect(entities.find((e) => e.id === groupId)).toMatchObject({ type: "group", name: "hello", position: [0, 0, 0] });
      expect(children.map((e) => [e.type, e.name, e.position[0]])).toEqual([
        ["path", "Path 1", -1],
        ["path", "Path 2", 0],
        ["path", "Path 3", 1],
      ]);
      expect(useEditorStore.getState().selectedEntityIds).toEqual([groupId]);
      expect(useEditorStore.temporal.getState().pastStates.length).toBe(stepsBefore + 1);

      useEditorStore.temporal.getState().undo();
      expect(useEditorStore.getState().entities.map((e) => e.id)).toEqual(["directional-light-1"]);
    });

    it("adds a filled shape in its fill colour, shown from both sides, numbered apart from the paths", async () => {
      const { useEditorStore } = await storeWithLight();
      const square = { points: [corner([-1, -1, 0]), corner([1, -1, 0]), corner([1, 1, 0])], closed: true };
      const shape: ImportedSvgItem = { kind: "shape", position: [2, 0, 0], shape: { regions: [{ outline: square, holes: [] }] }, color: "#123456" };

      const groupId = useEditorStore.getState().addImportedSvg("hello", [shape, imported(0), shape]);
      const children = useEditorStore.getState().entities.filter((e) => e.parentId === groupId);

      expect(children.map((e) => [e.type, e.name])).toEqual([
        ["shape", "Shape 1"],
        ["path", "Path 1"],
        ["shape", "Shape 2"],
      ]);
      expect(children[0]).toMatchObject({ position: [2, 0, 0], shape: { regions: [{ outline: square, holes: [] }] } });
      expect(children[0].shape!.regions[0].outline.points[0].position).not.toBe(square.points[0].position);
      expect(children[0].materialLayers).toEqual([
        expect.objectContaining({ type: "color", color: "#123456", doubleSided: true }),
        expect.objectContaining({ type: "lighting" }),
      ]);
      expect(children[0].stroke).toBeUndefined();
    });

    it("puts the pen down", async () => {
      const { useEditorStore } = await storeWithLight();
      useEditorStore.getState().setPenTool({ mode: "draw", pathId: null, selectedPoints: [] });

      useEditorStore.getState().addImportedSvg("hello", [imported(0)]);

      expect(useEditorStore.getState().penTool).toBeNull();
    });

    it("adds nothing when there are no paths, or in a view-only tab", async () => {
      const { useEditorStore } = await storeWithLight();
      const before = useEditorStore.getState().entities;

      expect(useEditorStore.getState().addImportedSvg("empty", [])).toBe("");
      useEditorStore.getState().setReadOnly("openElsewhere");
      useEditorStore.getState().addImportedSvg("hello", [imported(0), imported(1)]);

      expect(useEditorStore.getState().entities).toBe(before);
    });
  });

  it("keeps a path and its Hidden state through save and reload", async () => {
    const { useEditorStore, selectSceneContent, pathId } = await storeWithPath();
    const hiddenId = useEditorStore.getState().addState(pathId);
    useEditorStore.getState().setStateValues(hiddenId, { trimEnd: 0 });
    const content = selectSceneContent(useEditorStore.getState());
    const saved = parseSceneDocument(JSON.parse(JSON.stringify(toSceneDocument(content))));

    useEditorStore.getState().loadScene(null);
    useEditorStore.getState().loadScene(saved.ok ? saved.content : null);

    expect(useEditorStore.getState().entities).toEqual(content.entities);
    expect(useEditorStore.getState().animation.states[hiddenId].values).toEqual({ trimEnd: 0 });
  });
});

describe("shapes", () => {
  const corner = (x: number, y: number): PathPoint => ({ position: [x, y, 0], handleIn: [0, 0, 0], handleOut: [0, 0, 0], mode: "corner" });
  const rectangle = (x0: number, y0: number, x1: number, y1: number): PathData => ({
    points: [corner(x0, y0), corner(x1, y0), corner(x1, y1), corner(x0, y1)],
    closed: true,
  });
  // A bar 4 long and 0.4 thick, and two bars apart: one stroke, and two.
  const bar: ShapeData = { regions: [{ outline: rectangle(-2, -0.2, 2, 0.2), holes: [] }] };
  const twoBars: ShapeData = {
    regions: [
      { outline: rectangle(-3, -0.1, -1, 0.1), holes: [] },
      { outline: rectangle(1, -0.1, 3, 0.1), holes: [] },
    ],
  };
  const group = entity("group-1", { type: "group", name: "hello" });
  const shape = (id: string, data: ShapeData, overrides: Partial<Entity> = {}) =>
    entity(id, {
      type: "shape",
      name: id,
      parentId: "group-1",
      position: [1, 2, 0],
      shape: data,
      extrusion: 0.2,
      materialLayers: [{ id: `${id}-color`, type: "color", enabled: true, opacity: 1, color: "#123456" }],
      ...overrides,
    });
  const storeWithShapes = async () => {
    const module = await loadStore();
    module.useEditorStore.getState().loadScene({ entities: [light, group, shape("bar", bar), shape("two", twoBars), entity("cube-1")] });
    return module;
  };

  it("turns a shape into a path along its middle in place, keeping its ID, place and material", async () => {
    const { useEditorStore } = await storeWithShapes();
    const stateId = useEditorStore.getState().addState("bar");

    expect(useEditorStore.getState().convertShapesToPaths(["bar"])).toBe(1);
    const converted = useEditorStore.getState().entities.find((e) => e.id === "bar")!;

    expect(converted).toMatchObject({ type: "path", name: "bar", parentId: "group-1", position: [1, 2, 0], trimStart: 0, trimEnd: 1 });
    expect(converted.stroke!.radius).toBeCloseTo(0.2, 2);
    expect(converted.stroke!.caps).toBe("round");
    expect(converted.materialLayers![0]).toMatchObject({ color: "#123456" });
    expect(converted.shape).toBeUndefined();
    expect(converted.extrusion).toBeUndefined();
    converted.path!.points.forEach(({ position }) => expect(Math.abs(position[1])).toBeLessThan(0.02));
    // Its states stay with it.
    expect(useEditorStore.getState().animation.states[stateId].targetId).toBe("bar");
  });

  it("converts the shapes in a selected group, adding a shape's other strokes next to it, in one undo step", async () => {
    const { useEditorStore } = await storeWithShapes();
    const before = useEditorStore.getState().entities;
    const steps = useEditorStore.temporal.getState().pastStates.length;

    expect(useEditorStore.getState().convertShapesToPaths(["group-1"])).toBe(2);
    const entities = useEditorStore.getState().entities;

    expect(entities.map((e) => [e.type, e.name])).toEqual([
      ["directionalLight", "Directional Light"],
      ["group", "hello"],
      ["path", "bar"],
      ["path", "two"],
      ["path", "two (2)"],
      ["cube", "Cube"],
    ]);
    const [first, second] = entities.filter((e) => e.name.startsWith("two"));
    expect(second).toMatchObject({ parentId: "group-1", position: [1, 2, 0], stroke: first.stroke });
    expect(second.id).not.toBe("two");
    expect(second.materialLayers![0]).toMatchObject({ color: "#123456" });
    expect(second.materialLayers![0].id).not.toBe(first.materialLayers![0].id);
    expect(useEditorStore.temporal.getState().pastStates.length).toBe(steps + 1);

    useEditorStore.temporal.getState().undo();
    expect(useEditorStore.getState().entities).toEqual(before);
  });

  it("converts nothing that isn't a shape, or in a view-only tab", async () => {
    const { useEditorStore } = await storeWithShapes();
    const before = useEditorStore.getState().entities;

    expect(useEditorStore.getState().convertShapesToPaths(["cube-1"])).toBe(0);
    useEditorStore.getState().setReadOnly("openElsewhere");
    expect(useEditorStore.getState().convertShapesToPaths(["bar"])).toBe(0);
    expect(useEditorStore.getState().entities).toBe(before);
  });

  it("sets the extrusion and bevel of several shapes in one undo step", async () => {
    const { useEditorStore } = await storeWithShapes();
    const steps = useEditorStore.temporal.getState().pastStates.length;

    useEditorStore.getState().updateShapeSolids(["bar", "two", "cube-1"], { extrusion: 0.5, bevel: 0.02 });
    const byId = (id: string) => useEditorStore.getState().entities.find((e) => e.id === id)!;

    expect([byId("bar").extrusion, byId("bar").bevel, byId("two").extrusion]).toEqual([0.5, 0.02, 0.5]);
    expect(byId("cube-1").extrusion).toBeUndefined();
    expect(useEditorStore.temporal.getState().pastStates.length).toBe(steps + 1);

    useEditorStore.getState().updateShapeSolids(["bar"], { extrusion: -1 });
    expect(byId("bar").extrusion).toBe(0.5);
  });

  it("replaces a shape's outlines flat, for the pen tool", async () => {
    const { useEditorStore } = await storeWithShapes();
    const lifted: ShapeData = {
      regions: [{ outline: { ...rectangle(0, 0, 1, 1), points: rectangle(0, 0, 1, 1).points.map((p) => ({ ...p, position: [p.position[0], p.position[1], 0.5] as [number, number, number] })) }, holes: [] }],
    };

    useEditorStore.getState().updateShape("bar", lifted);
    useEditorStore.getState().updateShape("cube-1", lifted);
    const byId = (id: string) => useEditorStore.getState().entities.find((e) => e.id === id)!;

    expect(byId("bar").shape).toEqual({ regions: [{ outline: rectangle(0, 0, 1, 1), holes: [] }] });
    expect(byId("cube-1").shape).toBeUndefined();
    expect(lifted.regions[0].outline.points[0].position[2]).toBe(0.5);
  });

  it("keeps a shape through save and reload", async () => {
    const { useEditorStore, selectSceneContent } = await storeWithShapes();
    const saved = parseSceneDocument(JSON.parse(JSON.stringify(toSceneDocument(selectSceneContent(useEditorStore.getState())))));

    useEditorStore.getState().loadScene(saved.ok ? saved.content : null);
    const reloaded = useEditorStore.getState().entities.find((e) => e.id === "bar")!;

    expect(reloaded).toMatchObject({ type: "shape", shape: bar, extrusion: 0.2 });
    expect(reloaded.shape).not.toBe(bar);
  });
});

describe("pen tool", () => {
  const drawing = { mode: "draw" as const, pathId: null, selectedPoints: [] };

  it("turns on and off without an undo step or a save", async () => {
    const { useEditorStore } = await loadStore();
    useEditorStore.getState().loadScene({ entities: [light] });

    useEditorStore.getState().setPenTool(drawing);
    expect(useEditorStore.getState().penTool).toEqual(drawing);
    useEditorStore.getState().setPenTool(null);

    expect(useEditorStore.temporal.getState().pastStates).toHaveLength(0);
    expect(Object.keys(persisted().state)).not.toContain("penTool");
  });

  it("is off in Play, during a ▶ preview, and while view only, and doesn't turn on then", async () => {
    const { useEditorStore } = await loadStore();
    const store = () => useEditorStore.getState();
    store().loadScene({ entities: [light] });

    for (const [start, stop] of [
      [() => store().setPreviewMode(true), () => store().setPreviewMode(false)],
      [() => store().setPreviewingAction("action-1"), () => store().setPreviewingAction(null)],
      [() => store().setReadOnly("openElsewhere"), () => store().setReadOnly(null)],
    ]) {
      store().setPenTool(drawing);
      start();
      expect(store().penTool).toBeNull();
      store().setPenTool(drawing);
      expect(store().penTool).toBeNull();
      stop();
    }
  });

  it("is off in a newly opened scene", async () => {
    const { useEditorStore } = await loadStore();
    useEditorStore.getState().setPenTool(drawing);
    useEditorStore.getState().loadScene(null);
    expect(useEditorStore.getState().penTool).toBeNull();
  });
});

describe("depth layers", () => {
  const storeWithCube = async () => {
    const { useEditorStore, createDepthLayer } = await loadStore();
    useEditorStore.getState().loadScene({ entities: [light] });
    const cubeId = useEditorStore.getState().addEntity("cube");
    const cube = () => useEditorStore.getState().entities.find((e) => e.id === cubeId)!;
    const depthOf = () => cube().materialLayers!.find((layer) => layer.type === "depth");
    return { useEditorStore, createDepthLayer, cubeId, cube, depthOf };
  };

  it("adds one Depth layer per object, removable, in one undo step each", async () => {
    const { useEditorStore, cubeId, cube, depthOf } = await storeWithCube();

    useEditorStore.getState().addMaterialLayer(cubeId, "depth");
    useEditorStore.getState().addMaterialLayer(cubeId, "depth");

    expect(cube().materialLayers!.filter((layer) => layer.type === "depth")).toHaveLength(1);
    expect(depthOf()).toMatchObject({ type: "depth", enabled: true, gradientType: "radial", near: 0, far: 2 });
    useEditorStore.getState().removeMaterialLayer(cubeId, depthOf()!.id);
    expect(depthOf()).toBeUndefined();
    useEditorStore.temporal.getState().undo();
    expect(depthOf()).toBeDefined();
  });

  it("gives a duplicate its own copy of the origin and stops", async () => {
    const { useEditorStore, cubeId, depthOf } = await storeWithCube();
    useEditorStore.getState().addMaterialLayer(cubeId, "depth");

    useEditorStore.getState().duplicateEntity([cubeId]);
    const copy = useEditorStore.getState().entities.at(-1)!.materialLayers!.find((layer) => layer.type === "depth")!;

    expect(copy).toEqual(depthOf());
    expect(copy.type === "depth" && copy.origin).not.toBe(depthOf()!.type === "depth" && depthOf()!.origin);
    expect(copy.type === "depth" && copy.stops[0]).not.toBe(depthOf()!.type === "depth" && depthOf()!.stops[0]);
  });

  it("is edited in the viewport in a mode the pen, Play and view only end", async () => {
    const { useEditorStore, cubeId } = await storeWithCube();
    const pen = { mode: "draw" as const, pathId: null, selectedPoints: [] };

    useEditorStore.getState().setPenTool(pen);
    useEditorStore.getState().setDepthEdit(cubeId);
    expect(useEditorStore.getState()).toMatchObject({ depthEdit: cubeId, penTool: null });
    useEditorStore.getState().setPenTool(pen);
    expect(useEditorStore.getState().depthEdit).toBeNull();

    useEditorStore.getState().setDepthEdit(cubeId);
    useEditorStore.getState().setPreviewMode(true);
    expect(useEditorStore.getState().depthEdit).toBeNull();
    useEditorStore.getState().setDepthEdit(cubeId);
    expect(useEditorStore.getState().depthEdit).toBeNull(); // not while playing
    useEditorStore.getState().setPreviewMode(false);

    useEditorStore.getState().setDepthEdit(cubeId);
    useEditorStore.getState().setReadOnly("openElsewhere");
    expect(useEditorStore.getState().depthEdit).toBeNull();
    useEditorStore.getState().setDepthEdit(cubeId);
    expect(useEditorStore.getState().depthEdit).toBeNull();
  });

  it("can't be added in a view-only tab", async () => {
    const { useEditorStore, cubeId } = await storeWithCube();
    const before = useEditorStore.getState().entities;
    useEditorStore.getState().setReadOnly("openElsewhere");

    useEditorStore.getState().addMaterialLayer(cubeId, "depth");

    expect(useEditorStore.getState().entities).toBe(before);
  });
});
