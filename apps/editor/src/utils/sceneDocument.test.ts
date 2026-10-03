import { describe, expect, it } from "vitest";
import type { Entity } from "../store/useEditorStore";
import {
  CURRENT_SCENE_SCHEMA_VERSION,
  SCENE_DOCUMENT_FORMAT,
  hasSceneContent,
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

    expect(document.scene.entities[0].position[0]).toBe(1);
    expect(document.scene.cameraProfiles.personal.target[1]).toBe(0);
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
      },
    });
  });
});

describe("hasSceneContent", () => {
  it("is false for an empty scene, lights only, or the untouched starter cube", () => {
    expect(hasSceneContent([])).toBe(false);
    expect(hasSceneContent([light])).toBe(false);
    expect(hasSceneContent([makeEntity("cube-1"), light])).toBe(false);
  });

  it("is true once the starter cube is moved, renamed, or joined by anything else", () => {
    expect(hasSceneContent([makeEntity("cube-1", { position: [0, 1, 0] }), light])).toBe(true);
    expect(hasSceneContent([makeEntity("cube-1", { name: "Box" })])).toBe(true);
    expect(hasSceneContent([makeEntity("cube-1"), makeEntity("sphere-1", { type: "sphere", name: "Sphere" })])).toBe(true);
  });
});
