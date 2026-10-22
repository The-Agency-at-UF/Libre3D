import * as THREE from "three";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { stubBrowserGlobals } from "../testing/browserStubs";

type GltfNode = { name?: string; extras?: Record<string, unknown> };

// Node has no FileReader, which GLTFExporter uses to put a GLB together. This one reads a Blob the
// way the exporter does: readAsArrayBuffer, then onloadend.
class BlobReader {
  result: ArrayBuffer | null = null;
  onloadend: (() => void) | null = null;

  readAsArrayBuffer(blob: Blob) {
    void blob.arrayBuffer().then((buffer) => {
      this.result = buffer;
      this.onloadend?.();
    });
  }
}

// A GLB is a 12-byte header, then the JSON chunk's length and type (8 bytes), then the JSON.
const readGlbNodes = async (glb: Blob): Promise<GltfNode[]> => {
  const buffer = await glb.arrayBuffer();
  const length = new DataView(buffer).getUint32(12, true);
  return JSON.parse(new TextDecoder().decode(new Uint8Array(buffer, 20, length))).nodes;
};

// The store reads localStorage while its module loads, so the browser goes in first.
const loadModules = async () => {
  vi.resetModules();
  const [{ useEditorStore }, { ObjectManager }, { createSceneExportBlob }] = await Promise.all([
    import("../store/useEditorStore"),
    import("../viewport/ObjectManager"),
    import("./exportScene"),
  ]);
  return { useEditorStore, ObjectManager, createSceneExportBlob };
};

// The scene a new editor starts with (a cube and the default light), built by the editor itself.
const buildStarterScene = async () => {
  const { useEditorStore, ObjectManager, createSceneExportBlob } = await loadModules();
  const scene = new THREE.Scene();
  const meshMap = new Map<string, THREE.Object3D>();
  const entities = useEditorStore.getState().entities;

  new ObjectManager(scene, meshMap).syncMeshes(entities, null, false);

  const cube = meshMap.get(entities.find((entity) => entity.type === "cube")!.id)!;
  const light = meshMap.get(entities.find((entity) => entity.type === "directionalLight")!.id)!;
  return { scene, cube, light, createSceneExportBlob };
};

beforeEach(() => {
  stubBrowserGlobals();
  vi.stubGlobal("FileReader", BlobReader);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("createSceneExportBlob", () => {
  it("leaves the editor's userData out of the file", async () => {
    const { scene, cube, light, createSceneExportBlob } = await buildStarterScene();
    // What the editor keeps on them, so the test fails if it stops looking like this.
    expect(Object.keys(cube.userData)).toEqual(expect.arrayContaining(["entityId", "selectionOutline"]));
    expect(Object.keys(light.userData)).toEqual(expect.arrayContaining(["entityId", "helper", "target"]));

    const nodes = await readGlbNodes((await createSceneExportBlob(scene, "glb"))!);

    expect(nodes.length).toBeGreaterThan(0);
    expect(nodes.filter((node) => node.extras)).toEqual([]);
  });

  it("keeps the extras an imported glTF node brought with it", async () => {
    const { scene, cube, createSceneExportBlob } = await buildStarterScene();
    // GLTFLoader puts a node's extras in userData, next to the editor's own keys.
    cube.name = "Crate";
    Object.assign(cube.userData, { sku: "A-12", target: "door", gltfExtensions: { EXT_custom: { on: true } } });

    const nodes = await readGlbNodes((await createSceneExportBlob(scene, "glb"))!);

    expect(nodes.find((node) => node.name === "Crate")?.extras).toEqual({
      sku: "A-12",
      target: "door",
      gltfExtensions: { EXT_custom: { on: true } },
    });
  });

  it("gives the editor its userData back afterwards", async () => {
    const { scene, cube, light, createSceneExportBlob } = await buildStarterScene();
    const cubeUserData = cube.userData;
    const { entityId, selectionOutline } = cube.userData;
    const { helper, target } = light.userData;

    await createSceneExportBlob(scene, "glb");

    expect(cube.userData).toBe(cubeUserData);
    expect(cube.userData).toMatchObject({ entityId, selectionOutline, locked: false });
    expect(light.userData).toMatchObject({ helper, target });
  });

  it("keeps what the editor writes into userData while the export runs", async () => {
    const { scene, cube, createSceneExportBlob } = await buildStarterScene();
    const lateOutline = new THREE.LineSegments();
    // The GLB is read back after the scene is walked; write then, as a model finishing its load would.
    vi.stubGlobal(
      "FileReader",
      class extends BlobReader {
        readAsArrayBuffer(blob: Blob) {
          cube.userData.selectionOutline = lateOutline;
          super.readAsArrayBuffer(blob);
        }
      },
    );

    await createSceneExportBlob(scene, "glb");

    expect(cube.userData.selectionOutline).toBe(lateOutline);
    expect(cube.userData.entityId).toEqual(expect.any(String));
  });

  it("gives the editor its userData back when the export fails", async () => {
    const { scene, cube, createSceneExportBlob } = await buildStarterScene();
    const { selectionOutline } = cube.userData;
    vi.stubGlobal(
      "FileReader",
      class {
        readAsArrayBuffer() {
          throw new Error("no reader");
        }
      },
    );

    await expect(createSceneExportBlob(scene, "glb")).rejects.toThrow("no reader");

    expect(cube.userData.selectionOutline).toBe(selectionOutline);
  });
});
