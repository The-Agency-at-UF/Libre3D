import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { DEFAULT_CAMERA_PROFILE, initialSceneDefaults } from "../scene/defaults";
import type { Entity, MaterialLayer } from "../scene/types";
import { stubBrowserGlobals } from "../testing/browserStubs";
import { createPublishedSceneSource } from "./publishedSceneSource";
import { SceneManager } from "./SceneManager";
import { DEFAULT_PLAY_CAMERA, resolveScenePlay } from "./PlayCamera";
import { viewerCamera, viewerSceneSettings } from "./SceneViewer";

const entity = (id: string): Entity => ({
  id,
  type: "cube",
  name: "Cube",
  position: [0, 0, 0],
  rotation: [0, 0, 0],
  scale: [1, 1, 1],
  visible: true,
  locked: false,
});

beforeEach(() => {
  stubBrowserGlobals();
});

afterEach(() => {
  vi.unstubAllGlobals();
});

// The defaults are scene/defaults.ts's, the ones the editor's store starts a scene with.
describe("the viewer's defaults", () => {
  it("fill what a scene doesn't hold, under the settings it does, without the editor's grid", () => {
    expect(viewerSceneSettings({ bgColor: "#c7dfff", environment: { intensity: 2 } })).toMatchObject({
      bgColor: "#c7dfff",
      fogEnabled: false,
      showGrid: false,
      environment: { enabled: true, intensity: 2 },
      lights: { intensity: 0.75 },
    });
    expect(viewerSceneSettings(undefined)).toMatchObject({
      bgColor: initialSceneDefaults.bgColor,
      fogEnabled: initialSceneDefaults.fogEnabled,
      showGrid: false,
      environment: initialSceneDefaults.environment,
      lights: { intensity: initialSceneDefaults.lights.intensity },
    });
  });

  it("reads the sound button's settings over the defaults, a stored value winning", () => {
    expect(viewerSceneSettings(undefined).audioButton).toEqual(initialSceneDefaults.audioButton);
    expect(viewerSceneSettings({ audioButton: { visible: false } }).audioButton).toEqual({ visible: false, position: "bottomRight" });
  });

  it("reads the scroll settings over the defaults, a stored value winning", () => {
    expect(viewerSceneSettings(undefined).scroll).toEqual(initialSceneDefaults.scroll);
    expect(viewerSceneSettings({ scroll: { length: 6 } }).scroll).toEqual({ length: 6, smooth: initialSceneDefaults.scroll.smooth });
    expect(viewerSceneSettings({ scroll: { length: 2, smooth: false } }).scroll).toEqual({ length: 2, smooth: false });
  });

  it("start from the scene's active camera with its Play setting, or the default camera", () => {
    const active = { ...DEFAULT_CAMERA_PROFILE, id: "closeup", name: "Close", position: [1, 2, 3] as [number, number, number], play: { mode: "softOrbit" as const } };

    expect(viewerCamera({ entities: [], cameraProfiles: { personal: DEFAULT_CAMERA_PROFILE, closeup: active }, activeProfileId: "closeup" })).toMatchObject({
      position: [1, 2, 3],
      play: { mode: "softOrbit" },
    });
    const { position, target, fov, near, far } = DEFAULT_CAMERA_PROFILE;
    expect(viewerCamera({ entities: [] })).toEqual({ position, target, fov, near, far });
  });
});

describe("the viewer's Play setting (C7)", () => {
  // What SceneViewer hands PlayCamera: resolveScenePlay(viewerSceneSettings(...).play, viewerCamera(...).play).
  const played = (content: Parameters<typeof viewerCamera>[0] & { sceneSettings?: Parameters<typeof viewerSceneSettings>[0] }) =>
    resolveScenePlay(viewerSceneSettings(content.sceneSettings).play, viewerCamera(content).play);
  const personal = { ...DEFAULT_CAMERA_PROFILE, play: { mode: "autoRotate" as const, speed: 30 } };

  it("is the scene's when it holds one, over its camera's", () => {
    const content = { entities: [], cameraProfiles: { personal }, sceneSettings: { play: { mode: "softOrbit" as const, range: 20 } } };
    expect(played(content)).toEqual({ ...DEFAULT_PLAY_CAMERA, mode: "softOrbit", range: 20 });
  });

  it("is its active camera's in a scene from before it, and the default in a scene with neither", () => {
    expect(played({ entities: [], cameraProfiles: { personal } })).toEqual({ ...DEFAULT_PLAY_CAMERA, mode: "autoRotate", speed: 30 });
    expect(played({ entities: [] })).toEqual(DEFAULT_PLAY_CAMERA);
    expect(viewerSceneSettings(undefined)).not.toHaveProperty("play");
  });
});

describe("the viewer's camera with a scene camera picked (C6)", () => {
  it("resolves the scene camera, and starts from the personal profile's values when one is active", async () => {
    const { createEntity } = await import("../scene/entityFactories");
    const { resolveActiveCamera } = await import("../scene/activeCamera");
    const shot = { ...createEntity("camera"), id: "shot" };
    const personal = { ...DEFAULT_CAMERA_PROFILE, position: [7, 7, 7] as [number, number, number], play: { mode: "autoRotate" as const } };
    const content = { entities: [shot], cameraProfiles: { personal }, activeProfileId: "shot" };

    expect(resolveActiveCamera(content)).toMatchObject({ kind: "entity", id: "shot" });
    expect(viewerCamera(content)).toMatchObject({ position: [7, 7, 7], play: { mode: "autoRotate" } });
    // The camera deleted since: the personal one, as before.
    expect(resolveActiveCamera({ ...content, entities: [] })).toMatchObject({ kind: "profile", id: "personal" });
  });
});

describe("the viewer's scene", () => {
  it("is built without the editor's grid, which the editor's scene has", () => {
    const settings = viewerSceneSettings(undefined);
    const editorOnly = (manager: SceneManager) => manager.scene.children.filter((child) => child.userData.editorOnly);

    const viewer = new SceneManager(settings, { editorHelpers: false });
    const editor = new SceneManager(settings);

    expect(viewer.grid).toBeNull();
    expect(editorOnly(viewer)).toEqual([]);
    expect(editorOnly(editor)).toEqual([editor.grid]);
    viewer.updateGridVisibility(true); // nothing to show, and nothing thrown
    viewer.dispose();
    editor.dispose();
  });
});

describe("a published scene's source", () => {
  it("downloads assets through the share link's URLs, by hash, and nothing else", async () => {
    const fetchMock = vi.fn(async (url: string) =>
      url === "https://s3/model" ? new Response(new Uint8Array([1, 2, 3])) : new Response("gone", { status: 403 }),
    );
    vi.stubGlobal("fetch", fetchMock);
    const source = createPublishedSceneSource([entity("cube-1")], { model: "https://s3/model", expired: "https://s3/expired" });

    expect(new Uint8Array((await source.loadModel("model"))!)).toEqual(new Uint8Array([1, 2, 3]));
    expect(await source.loadTexture("expired")).toBeNull();
    expect(await source.loadModel("unknown")).toBeNull();
    expect(new Uint8Array((await source.loadAudio("model"))!)).toEqual(new Uint8Array([1, 2, 3]));
    expect(await source.loadAudio("unknown")).toBeNull();
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });

  it("keeps what's derived for imported meshes in memory, never draws wireframe, and saves nothing", () => {
    const source = createPublishedSceneSource([entity("cube-1"), entity("cube-2")], {});
    const layers: MaterialLayer[] = [{ id: "c", type: "color", enabled: true, opacity: 1, blendMode: "normal", color: "#123456" }];

    source.setMaterialLayers("cube-2", layers, 1);

    expect(source.getEntities().map((each) => each.materialLayers)).toEqual([undefined, layers]);
    expect(source.isWireframe()).toBe(false);
  });

  it("hands out objects that use a material asset with the asset's layers, from the document's assets", () => {
    const own: MaterialLayer[] = [{ id: "own", type: "color", enabled: true, opacity: 1, blendMode: "normal", color: "#111111" }];
    const shared: MaterialLayer[] = [{ id: "shared", type: "color", enabled: true, opacity: 1, blendMode: "normal", color: "#ff0000" }];
    const entities = [{ ...entity("cube-1"), materialLayers: own, materialAssetId: "m" }, { ...entity("cube-2"), materialLayers: own }, { ...entity("cube-3"), materialLayers: own, materialAssetId: "gone" }];

    const source = createPublishedSceneSource(entities, {}, { m: { id: "m", name: "Red", layers: shared } });

    expect(source.getEntities().map((each) => each.materialLayers)).toEqual([shared, own, own]);
    // Without the assets (an older caller), every object keeps its own layers.
    expect(createPublishedSceneSource(entities, {}).getEntities()).toBe(entities);
  });

  it("keeps a texture derived from an imported model in memory, and loads it back without a download", async () => {

    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    const source = createPublishedSceneSource([entity("cube-1")], {});
    const texture = new Blob([new Uint8Array([1, 2, 3])]);

    await source.saveTexture("derived", texture);

    expect(await source.loadTexture("derived")).toBe(texture);
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
