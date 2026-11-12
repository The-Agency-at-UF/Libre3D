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
  materials: {},
});

// v4 layer stacks, as v4 builds saved them (no blend modes; the Color layer held the opacity and surface).
const v4Color = (overrides: Record<string, unknown> = {}) => ({ id: "c", type: "color", enabled: true, opacity: 1, color: "#4f8cff", ...overrides });
const v4Lighting = (overrides: Record<string, unknown> = {}) => ({
  id: "l",
  type: "lighting",
  enabled: true,
  opacity: 1,
  model: "physical",
  roughness: 0.45,
  metalness: 0.08,
  shininess: 30,
  emissive: "#000000",
  emissiveIntensity: 1,
  ...overrides,
});
const v4Depth = (overrides: Record<string, unknown> = {}) => ({
  id: "d",
  type: "depth",
  enabled: true,
  opacity: 0.6,
  gradientType: "radial",
  origin: [0, 0, 0],
  direction: [1, 0, 0],
  near: 0,
  far: 2,
  stops: [
    { color: "#ff3b30", position: 0 },
    { color: "#af52de", position: 1 },
  ],
  smooth: false,
  ...overrides,
});
const v4Image = (id: string, slot: string, extra: Record<string, unknown> = {}) => ({ id, type: "image", enabled: true, opacity: 0.3, textureAssetId: `t-${id}`, slot, wrapS: 1000, wrapT: 1000, ...extra });

// Opens a v4 document holding one cube with `layers` (and `extra` on it) and returns that cube.
const openV4 = (layers: unknown[], extra: Record<string, unknown> = {}) => {
  const { materials: _materials, ...v4Scene } = makeContent();
  const cube = { ...makeEntity("cube-1"), materialLayers: layers, ...extra };
  const parsed = parseSceneDocument({ format: SCENE_DOCUMENT_FORMAT, schemaVersion: 4, scene: { ...v4Scene, entities: [cube] } });
  if (!parsed.ok) throw new Error("not opened");
  return { cube: parsed.content.entities[0], content: parsed.content };
};

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
    const { animation: _animation, viewedStates: _viewedStates, materials: _materials, ...v1Scene } = makeContent();
    const parsed = parseSceneDocument({ format: SCENE_DOCUMENT_FORMAT, schemaVersion: 1, scene: v1Scene });

    expect(parsed).toEqual({ ok: true, content: { ...v1Scene, animation: undefined, viewedStates: undefined, materials: {} } });
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
        materials: {},
      },
    });
  });
});

describe("schema v5: the material layer stack", () => {
  it("adds an empty materials section to a v4 document", () => {
    expect(openV4([v4Color(), v4Lighting()]).content.materials).toEqual({});
  });

  it("puts Lighting on top of Color, with Normal blending, and changes nothing else on a plain cube", () => {
    const { cube } = openV4([v4Color(), v4Lighting()]);

    expect(cube.materialLayers).toEqual([
      { ...v4Lighting(), blendMode: "normal" },
      { ...v4Color(), blendMode: "normal" },
    ]);
    expect(cube.opacity).toBeUndefined();
  });

  it("moves a see-through Color layer's opacity onto the object", () => {
    const { cube } = openV4([v4Color({ opacity: 0.4 }), v4Lighting()]);

    expect(cube.opacity).toBe(0.4);
    expect(cube.materialLayers?.find((layer) => layer.type === "color")?.opacity).toBe(1);
  });

  it("keeps Depth over Color, blending into it by its own opacity, and the object as see-through as it was", () => {
    const { cube } = openV4([v4Color({ opacity: 0.5 }), v4Lighting(), v4Depth()]);

    expect(cube.materialLayers?.map((layer) => layer.type)).toEqual(["lighting", "depth", "color"]);
    expect(cube.materialLayers?.[1]).toMatchObject({ opacity: 0.6, blendMode: "normal" });
    expect(cube.opacity).toBe(0.5);
  });

  it("moves the surface settings to the Lighting layer", () => {
    const { cube } = openV4([v4Color({ alphaMode: "MASK", alphaCutoff: 0.3, doubleSided: true }), v4Lighting()]);
    const [lighting, color] = cube.materialLayers ?? [];

    expect(lighting).toMatchObject({ type: "lighting", alphaMode: "MASK", alphaCutoff: 0.3, doubleSided: true });
    expect(color).not.toHaveProperty("alphaMode");
    expect(color).not.toHaveProperty("doubleSided");
  });

  it("keeps an imported mesh's colour picture at the bottom, and makes its other pictures Lighting's maps", () => {
    const { cube } = openV4([
      v4Color({ alphaMode: "BLEND" }),
      v4Lighting(),
      v4Image("map", "color"),
      v4Image("normal", "normal"),
      v4Image("mr", "metallicRoughness"),
      v4Image("hidden", "ao", { enabled: false }),
    ]);

    expect(cube.materialLayers?.map((layer) => layer.id)).toEqual(["l", "c", "map"]);
    expect(cube.materialLayers?.[2]).toEqual({ ...v4Image("map", "color"), blendMode: "normal" });
    const lighting = cube.materialLayers?.[0];
    expect(lighting?.type === "lighting" && lighting.maps).toEqual({
      normal: { textureAssetId: "t-normal", wrapS: 1000, wrapT: 1000 },
      roughness: { textureAssetId: "t-mr", wrapS: 1000, wrapT: 1000 },
      metalness: { textureAssetId: "t-mr", wrapS: 1000, wrapT: 1000 },
    });
  });

  it("gives a stack without a Lighting layer the physical one v4 drew it with", () => {
    const { cube } = openV4([v4Color({ doubleSided: true })]);

    expect(cube.materialLayers?.[0]).toMatchObject({ type: "lighting", model: "physical", roughness: 0.45, metalness: 0.08, doubleSided: true });
  });

  it("paints a Depth layer without a Color layer over white, as v4 did", () => {
    const { cube } = openV4([v4Lighting(), v4Depth()]);

    expect(cube.materialLayers?.map((layer) => layer.type)).toEqual(["lighting", "depth", "color"]);
    expect(cube.materialLayers?.[2]).toMatchObject({ color: "#ffffff", opacity: 1, blendMode: "normal" });
  });

  it("turns the eye back on for Color and Lighting, which v4 drew whatever it said", () => {
    const { cube } = openV4([v4Color({ enabled: false }), v4Lighting({ enabled: false }), v4Depth({ enabled: false })]);

    expect(cube.materialLayers?.map((layer) => layer.enabled)).toEqual([true, false, true]);
  });

  it("leaves objects without layers (lights, groups) alone", () => {
    const { content } = openV4([]);
    const light = parseSceneDocument({ ...toSceneDocument(makeContent()), schemaVersion: 4 });

    expect(content.entities[0].materialLayers).toEqual([]);
    expect(light.ok && light.content.entities[1]).toEqual(makeContent().entities[1]);
  });

  it("round-trips a v5 document unchanged, and keeps colour and opacity state values", () => {
    const content = makeContent();
    content.animation.states.up.values = { ...content.animation.states.up.values, color: "#ff0000", opacity: 0.5 };
    content.materials = { m: { id: "m", name: "Gloss", layers: [] } };
    content.entities[0] = { ...content.entities[0], materialAssetId: "m", opacity: 0.7 };
    const parsed = parseSceneDocument(JSON.parse(JSON.stringify(toSceneDocument(content))));

    expect(parsed).toEqual({ ok: true, content });
  });
});
