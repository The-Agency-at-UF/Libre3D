import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { Entity, MaterialLayer } from "../store/useEditorStore";
import { stubBrowserGlobals } from "../testing/browserStubs";
import { createPublishedSceneSource } from "./publishedSceneSource";
import { VIEWER_DEFAULTS, viewerCamera, viewerSceneSettings } from "./SceneViewer";

// The editor's defaults, from its store, which reads browser storage as it loads.
const loadEditorDefaults = async () => {
  vi.resetModules();
  const { initialSceneDefaults, DEFAULT_CAMERA_PROFILE } = await import("../store/useEditorStore");
  return { initialSceneDefaults, DEFAULT_CAMERA_PROFILE };
};

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

describe("the viewer's defaults", () => {
  // The viewer doesn't load the store that defines the editor's defaults, so it keeps its own copy.
  it("are the editor's, for what a published scene uses", async () => {
    const { initialSceneDefaults, DEFAULT_CAMERA_PROFILE } = await loadEditorDefaults();
    expect(VIEWER_DEFAULTS).toEqual({
      bgColor: initialSceneDefaults.bgColor,
      fogEnabled: initialSceneDefaults.fogEnabled,
      lightIntensity: initialSceneDefaults.lights.intensity,
      environment: initialSceneDefaults.environment,
      camera: {
        position: DEFAULT_CAMERA_PROFILE.position,
        target: DEFAULT_CAMERA_PROFILE.target,
        fov: DEFAULT_CAMERA_PROFILE.fov,
        near: DEFAULT_CAMERA_PROFILE.near,
        far: DEFAULT_CAMERA_PROFILE.far,
      },
    });
  });

  it("fill what a scene doesn't hold, under the settings it does, without the editor's grid", () => {
    expect(viewerSceneSettings({ bgColor: "#c7dfff", environment: { intensity: 2 } })).toMatchObject({
      bgColor: "#c7dfff",
      fogEnabled: false,
      showGrid: false,
      environment: { enabled: true, intensity: 2 },
      lights: { intensity: 0.75 },
    });
    expect(viewerSceneSettings(undefined)).toMatchObject({ bgColor: "#0b1020", showGrid: false });
  });

  it("start from the scene's active camera with its Play setting, or the default camera", async () => {
    const { DEFAULT_CAMERA_PROFILE } = await loadEditorDefaults();
    const active = { ...DEFAULT_CAMERA_PROFILE, id: "closeup", name: "Close", position: [1, 2, 3] as [number, number, number], play: { mode: "softOrbit" as const } };

    expect(viewerCamera({ entities: [], cameraProfiles: { personal: DEFAULT_CAMERA_PROFILE, closeup: active }, activeProfileId: "closeup" })).toMatchObject({
      position: [1, 2, 3],
      play: { mode: "softOrbit" },
    });
    expect(viewerCamera({ entities: [] })).toMatchObject(VIEWER_DEFAULTS.camera);
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
    const layers: MaterialLayer[] = [{ id: "c", type: "color", enabled: true, opacity: 1, color: "#123456" }];

    source.setMaterialLayers("cube-2", layers);
    source.applyHierarchyPrune(new Set(["cube-1"]), new Map());

    expect(source.getEntities().map((each) => each.materialLayers)).toEqual([undefined, layers]);
    expect(source.isWireframe()).toBe(false);
  });
});
