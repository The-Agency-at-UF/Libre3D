import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { DEFAULT_CAMERA_PROFILE, initialSceneDefaults } from "../scene/defaults";
import type { Entity, MaterialLayer } from "../scene/types";
import { stubBrowserGlobals } from "../testing/browserStubs";
import { createPublishedSceneSource } from "./publishedSceneSource";
import { SceneManager } from "./SceneManager";
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
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("keeps what's derived for imported meshes in memory, never draws wireframe, and saves nothing", () => {
    const source = createPublishedSceneSource([entity("cube-1"), entity("cube-2")], {});
    const layers: MaterialLayer[] = [{ id: "c", type: "color", enabled: true, opacity: 1, blendMode: "normal", color: "#123456" }];

    source.setMaterialLayers("cube-2", layers, 1);

    expect(source.getEntities().map((each) => each.materialLayers)).toEqual([undefined, layers]);
    expect(source.isWireframe()).toBe(false);
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
