import { describe, expect, it } from "vitest";
import type { Entity } from "../store/useEditorStore";
import {
  CURRENT_SCENE_SCHEMA_VERSION,
  SCENE_DOCUMENT_FORMAT,
  parseSceneDocument,
  toSceneDocument,
  type SceneContent,
} from "./sceneDocument";

const makeEntity = (id: string, overrides: Partial<Entity> = {}): Entity => ({
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

const light = makeEntity("directional-light-1", { type: "directionalLight", name: "Directional Light" });

const makeContent = (): SceneContent => ({
  entities: [makeEntity("cube-1", { position: [1, 2, 3] }), light],
  sceneSettings: {
    bgColor: "#123456",
    bgAlpha: "100%",
    showGrid: true,
    wireframe: false,
    fogEnabled: false,
    environment: { enabled: true, intensity: 0.8 },
    lights: { intensity: 1, color: "#ffffff", ambientEnabled: true, directionalEnabled: true, shadow: "Soft" },
    physics: { enabled: false, gravityY: -9.8, collisionType: "Mesh" },
  },
  postProcessing: { enabled: false } as SceneContent["postProcessing"],
  frame: { mode: "responsive", preset: "responsive", width: 1920, height: 1080 },
  cameraProfiles: {
    personal: {
      id: "personal",
      name: "Personal Camera",
      position: [0, 5, 10],
      target: [0, 0, 0],
      fov: 45,
      near: 0.1,
      far: 1000,
      zoom: 1,
    },
  },
  activeProfileId: "personal",
  animation: {
    states: {
      up: { id: "up", targetId: "cube-1", name: "State", order: 0, values: { position: [1, 3, 3], rotation: [0, 1, 0] } },
    },
    events: {
      grow: {
        id: "grow",
        ownerId: "cube-1",
        trigger: "mouseDown",
        order: 0,
        actions: [
          {
            id: "action-1",
            type: "transition",
            targetId: "cube-1",
            from: "current",
            steps: [{ to: "up", duration: 0.3, easing: "easeOut" }],
            delay: 0.5,
            delayRepeat: "start",
            loop: "infinite",
            cycle: "pingPong",
          },
        ],
      },
    },
  },
  viewedStates: { "cube-1": "up" },
});

describe("toSceneDocument / parseSceneDocument", () => {
  it("round-trips scene content through JSON", () => {
    const content = makeContent();
    const parsed = parseSceneDocument(JSON.parse(JSON.stringify(toSceneDocument(content))));

    expect(parsed).toEqual({ ok: true, content });
  });

  it("stamps the format and current schema version", () => {
    const document = toSceneDocument(makeContent());

    expect(document.format).toBe(SCENE_DOCUMENT_FORMAT);
    expect(document.schemaVersion).toBe(CURRENT_SCENE_SCHEMA_VERSION);
  });

  it("never shares vectors with the content it was made from", () => {
    const content = makeContent();
    const document = toSceneDocument(content);

    content.entities[0].position[0] = 99;
    content.cameraProfiles.personal.target[1] = 99;
    content.animation.states.up.values.position![1] = 99;

    expect(document.scene.entities[0].position[0]).toBe(1);
    expect(document.scene.cameraProfiles.personal.target[1]).toBe(0);
    expect(document.scene.animation.states.up.values.position![1]).toBe(3);
  });

  it("opens a v1 document (from before states) as a scene without animation", () => {
    const { animation: _animation, viewedStates: _viewedStates, ...v1Scene } = makeContent();
    const parsed = parseSceneDocument({ format: SCENE_DOCUMENT_FORMAT, schemaVersion: 1, scene: v1Scene });

    expect(parsed).toEqual({ ok: true, content: { ...v1Scene, animation: undefined, viewedStates: undefined } });
  });

  it("opens a v2 document (from before trim) as it was", () => {
    const content = makeContent();
    const parsed = parseSceneDocument({ ...toSceneDocument(content), schemaVersion: 2 });

    expect(parsed).toEqual(parseSceneDocument(toSceneDocument(content)));
    expect(parsed.ok && parsed.content.animation?.states).toEqual(content.animation.states);
  });

  it("opens a v3 document (from before the environment light) with the environment off", () => {
    const { environment: _environment, ...v3Settings } = makeContent().sceneSettings;
    const content = { ...makeContent(), sceneSettings: v3Settings };
    const parsed = parseSceneDocument({ ...toSceneDocument(content as SceneContent), schemaVersion: 3 });

    expect(parsed.ok && parsed.content.sceneSettings).toEqual({ ...v3Settings, environment: { enabled: false } });
  });

  it("keeps an environment setting an older document already has", () => {
    const parsed = parseSceneDocument({ ...toSceneDocument(makeContent()), schemaVersion: 3 });

    expect(parsed.ok && parsed.content.sceneSettings?.environment).toEqual({ enabled: true, intensity: 0.8 });
  });

  it("keeps a state's trim", () => {
    const content = makeContent();
    content.animation.states.up.values = { trimEnd: 0 };

    const parsed = parseSceneDocument(JSON.parse(JSON.stringify(toSceneDocument(content))));

    expect(parsed.ok && parsed.content.animation?.states?.up.values).toEqual({ trimEnd: 0 });
  });

  it("reads damaged events into shape instead of passing them on", () => {
    const content = makeContent();
    const document = JSON.parse(JSON.stringify(toSceneDocument(content)));
    document.scene.animation.events = {
      grow: { ...document.scene.animation.events.grow, actions: [{ type: "sound" }, { id: "a", type: "transition", steps: [{}] }] },
      junk: 42,
      noTrigger: { id: "noTrigger", ownerId: "cube-1", actions: [] },
    };

    const parsed = parseSceneDocument(document);

    expect(parsed.ok && parsed.content.animation?.events).toEqual({
      grow: {
        ...content.animation.events.grow,
        actions: [
          {
            id: "a",
            type: "transition",
            targetId: "",
            from: "",
            steps: [{ to: "", duration: 0, easing: "easeInOut" }],
            delay: 0,
            delayRepeat: "none",
            loop: 0,
            cycle: "restart",
          },
        ],
      },
    });
  });

  it("saves only the shown states that still exist", () => {
    const content = { ...makeContent(), viewedStates: { "cube-1": "up", "sphere-1": "deleted-state" } };

    expect(toSceneDocument(content).scene.viewedStates).toEqual({ "cube-1": "up" });
  });

  it("refuses a document from a newer schema instead of dropping what it doesn't know", () => {
    const document = { ...toSceneDocument(makeContent()), schemaVersion: CURRENT_SCENE_SCHEMA_VERSION + 1 };

    expect(parseSceneDocument(document)).toEqual({ ok: false, reason: "newer" });
  });

  it.each([
    ["null", null],
    ["an array", []],
    ["another format", { format: "other", schemaVersion: 1, scene: { entities: [] } }],
    ["a missing version", { format: SCENE_DOCUMENT_FORMAT, scene: { entities: [] } }],
    ["a fractional version", { format: SCENE_DOCUMENT_FORMAT, schemaVersion: 1.5, scene: { entities: [] } }],
    ["no scene", { format: SCENE_DOCUMENT_FORMAT, schemaVersion: 1 }],
    ["entities that aren't a list", { format: SCENE_DOCUMENT_FORMAT, schemaVersion: 1, scene: { entities: {} } }],
  ])("rejects %s as invalid", (_label, raw) => {
    expect(parseSceneDocument(raw)).toEqual({ ok: false, reason: "invalid" });
  });

  it("leaves missing settings for the store to fill from its defaults", () => {
    const parsed = parseSceneDocument({ format: SCENE_DOCUMENT_FORMAT, schemaVersion: 1, scene: { entities: [] } });

    expect(parsed).toEqual({
      ok: true,
      content: {
        entities: [],
        sceneSettings: undefined,
        postProcessing: undefined,
        frame: undefined,
        cameraProfiles: undefined,
        activeProfileId: undefined,
        animation: undefined,
        viewedStates: undefined,
      },
    });
  });
});
