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
const readGlbJson = async (glb: Blob) => {
  const buffer = await glb.arrayBuffer();
  const length = new DataView(buffer).getUint32(12, true);
  return JSON.parse(new TextDecoder().decode(new Uint8Array(buffer, 20, length)));
};

const readGlbNodes = async (glb: Blob): Promise<GltfNode[]> => (await readGlbJson(glb)).nodes;

// The store reads localStorage while its module loads, so the browser goes in first.
const loadModules = async () => {
  vi.resetModules();
  const [{ useEditorStore }, { ObjectManager }, { editorSceneSource }, { createSceneExportBlob }] = await Promise.all([
    import("../store/useEditorStore"),
    import("../viewport/ObjectManager"),
    import("../viewport/editorSceneSource"),
    import("./exportScene"),
  ]);
  // The editor's own objects, built from the store as the viewport builds them.
  const createObjectManager = (scene: THREE.Scene, meshMap: Map<string, THREE.Object3D>) =>
    new ObjectManager(scene, meshMap, editorSceneSource);
  return { useEditorStore, createObjectManager, createSceneExportBlob };
};

// The scene a new editor starts with (a cube and the default light), built by the editor itself.
const buildStarterScene = async () => {
  const { useEditorStore, createObjectManager, createSceneExportBlob } = await loadModules();
  const scene = new THREE.Scene();
  const meshMap = new Map<string, THREE.Object3D>();
  const entities = useEditorStore.getState().entities;

  createObjectManager(scene, meshMap).syncMeshes(entities, null, false);

  const cube = meshMap.get(entities.find((entity) => entity.type === "cube")!.id)!;
  const light = meshMap.get(entities.find((entity) => entity.type === "directionalLight")!.id)!;
  return { scene, cube, light, createSceneExportBlob, useEditorStore, createObjectManager };
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

  it("writes a clearcoat as KHR_materials_clearcoat", async () => {
    const { useEditorStore, createObjectManager, createSceneExportBlob } = await buildStarterScene();
    const cube = useEditorStore.getState().entities.find((entity) => entity.type === "cube")!;
    const lighting = cube.materialLayers!.find((layer) => layer.type === "lighting")!;
    useEditorStore.getState().updateMaterialLayer(cube.id, lighting.id, { clearcoat: 1, clearcoatRoughness: 0.05 });
    const scene = new THREE.Scene();
    createObjectManager(scene, new Map()).syncMeshes(useEditorStore.getState().entities, null, false);

    const { materials, extensionsUsed } = await readGlbJson((await createSceneExportBlob(scene, "glb"))!);

    expect(extensionsUsed).toContain("KHR_materials_clearcoat");
    expect(materials[0].extensions.KHR_materials_clearcoat).toEqual({ clearcoatFactor: 1, clearcoatRoughnessFactor: 0.05 });
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

describe("createSceneExportBlob with paths", () => {
  type Gltf = {
    nodes: { mesh?: number }[];
    meshes: { primitives: { indices: number }[] }[];
    accessors: { count: number }[];
  };

  const readGlb = async (glb: Blob): Promise<Gltf> => {
    const buffer = await glb.arrayBuffer();
    const length = new DataView(buffer).getUint32(12, true);
    return JSON.parse(new TextDecoder().decode(new Uint8Array(buffer, 20, length)));
  };

  // Index counts of the meshes the file's nodes draw, one per node.
  const drawnIndexCounts = (gltf: Gltf) =>
    gltf.nodes.filter((node) => node.mesh !== undefined).map((node) => gltf.accessors[gltf.meshes[node.mesh!].primitives[0].indices].count);

  // The default light and a sample path with the given Base trim, built by the editor itself.
  const buildPathScene = async (trimEnd = 1) => {
    const { useEditorStore, createObjectManager, createSceneExportBlob } = await loadModules();
    useEditorStore.getState().loadScene(null);
    useEditorStore.setState({ entities: useEditorStore.getState().entities.filter((entity) => entity.type !== "cube") });
    const pathId = useEditorStore.getState().addEntity("path");
    useEditorStore.getState().updateShownTransforms({ [pathId]: { trimEnd } });

    const scene = new THREE.Scene();
    const meshMap = new Map<string, THREE.Object3D>();
    const objectManager = createObjectManager(scene, meshMap);
    objectManager.syncMeshes(useEditorStore.getState().entities, null, false);
    const { PathMesh } = await import("../paths/PathMesh");
    const path = meshMap.get(pathId) as InstanceType<typeof PathMesh>;
    expect(path).toBeInstanceOf(PathMesh);
    return { scene, path, pathId, objectManager, createSceneExportBlob };
  };

  it("exports a path shown in a state in Base: the whole tube and both caps", async () => {
    const { scene, path, pathId, objectManager, createSceneExportBlob } = await buildPathScene();
    const tubeIndices = path.geometry.getIndex()!.count;
    objectManager.applyPose(pathId, { position: [0, 0, 0], rotation: [0, 0, 0], scale: [1, 1, 1], trimStart: 0, trimEnd: 0 });

    const counts = drawnIndexCounts(await readGlb((await createSceneExportBlob(scene, "glb"))!));

    expect(Math.max(...counts)).toBe(tubeIndices);
    expect(counts).toHaveLength(3); // the tube and its two caps
    expect(path.getTrim()).toEqual([0, 0]); // back in the state it's shown in
  });

  it("exports only the drawn part of a path trimmed in Base, and puts its tube back", async () => {
    const { scene, path, createSceneExportBlob } = await buildPathScene(0.5);
    const tube = path.geometry;

    const counts = drawnIndexCounts(await readGlb((await createSceneExportBlob(scene, "glb"))!));

    expect(Math.max(...counts)).toBe(tube.drawRange.count);
    expect(tube.drawRange.count).toBeLessThan(tube.getIndex()!.count);
    expect(path.geometry).toBe(tube);
  });

  it("leaves out a path that draws nothing in Base", async () => {
    const { scene, path, createSceneExportBlob } = await buildPathScene(0);

    const gltf = await readGlb((await createSceneExportBlob(scene, "glb"))!);

    expect(drawnIndexCounts(gltf)).toEqual([]);
    expect(path.visible).toBe(true);
  });
});
