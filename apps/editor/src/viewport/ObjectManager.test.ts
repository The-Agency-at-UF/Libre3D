import * as THREE from "three";
import { MeshBasicNodeMaterial, MeshLambertNodeMaterial, MeshPhysicalNodeMaterial, MeshStandardNodeMaterial } from "three/webgpu";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { Entity, LightingLayer } from "../store/useEditorStore";
import { stubBrowserGlobals } from "../testing/browserStubs";

// The store reads localStorage while its module loads, so the browser goes in first.
const loadModules = async () => {
  vi.resetModules();
  const [{ useEditorStore }, { ObjectManager }, { editorSceneSource }] = await Promise.all([
    import("../store/useEditorStore"),
    import("./ObjectManager"),
    import("./editorSceneSource"),
  ]);
  // Built from the store as the editor's viewport builds them.
  const createObjectManager = (meshMap: Map<string, THREE.Object3D>) => new ObjectManager(new THREE.Scene(), meshMap, editorSceneSource, { getRenderer: () => null });
  return { useEditorStore, createObjectManager };
};

// The starter scene's cube, drawn by the editor itself, with its lighting layer changed by `lighting`.
const buildCube = async () => {
  const { useEditorStore, createObjectManager } = await loadModules();
  const meshMap = new Map<string, THREE.Object3D>();
  const manager = createObjectManager(meshMap);
  const cube = useEditorStore.getState().entities.find((entity) => entity.type === "cube")!;

  const sync = (lighting: Partial<LightingLayer>): THREE.Material => {
    const entity: Entity = {
      ...cube,
      // These checks are about the physical model; a new cube is Phong (task D2).
      materialLayers: cube.materialLayers!.map((layer) => (layer.type === "lighting" ? { ...layer, model: "physical" as const, ...lighting } : layer)),
    };
    manager.syncMeshes([entity], null, false);
    return (meshMap.get(cube.id) as THREE.Mesh).material as THREE.Material;
  };

  return { sync, mesh: () => meshMap.get(cube.id) as THREE.Mesh };
};

beforeEach(() => {
  stubBrowserGlobals();
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("ObjectManager clearcoat", () => {
  it("keeps a physical material without a clearcoat standard", async () => {
    const { sync } = await buildCube();

    const material = sync({});

    expect(material).toBeInstanceOf(MeshStandardNodeMaterial);
    expect(material).not.toBeInstanceOf(MeshPhysicalNodeMaterial);
  });

  it("builds a physical material for a clearcoat, and keeps it when the coat goes back to 0", async () => {
    const { sync } = await buildCube();
    sync({});

    const coated = sync({ clearcoat: 1, clearcoatRoughness: 0.05 }) as THREE.MeshPhysicalMaterial;

    expect(coated).toBeInstanceOf(MeshPhysicalNodeMaterial);
    expect(coated).toMatchObject({ clearcoat: 1, clearcoatRoughness: 0.05, roughness: 0.45 });

    const uncoated = sync({ clearcoat: 0 });
    expect(uncoated).toBe(coated);
    expect(uncoated).toMatchObject({ clearcoat: 0 });
  });

  it("leaves a material's own clearcoat alone when the layer has none (a glTF import from before)", async () => {
    const { sync, mesh } = await buildCube();
    sync({});
    const imported = new THREE.MeshPhysicalMaterial({ clearcoat: 0.7, clearcoatRoughness: 0.2 });
    mesh().material = imported;

    const material = sync({ clearcoat: undefined, clearcoatRoughness: undefined, roughness: 0.3 });

    // GLTFLoader's built-in material is swapped for a node copy with its values, kept in place after.
    expect(material).toBeInstanceOf(MeshPhysicalNodeMaterial);
    expect(material).toMatchObject({ clearcoat: 0.7, clearcoatRoughness: 0.2, roughness: 0.3 });
    expect(sync({ clearcoat: undefined, clearcoatRoughness: undefined, roughness: 0.5 })).toBe(material);
  });

  it("keeps an imported material's maps and extras when it swaps it for a node material", async () => {
    const { sync, mesh } = await buildCube();
    sync({});
    const normalMap = new THREE.Texture();
    const imported = new THREE.MeshPhysicalMaterial({ normalMap, transmission: 0.6, sheen: 0.4 });
    mesh().material = imported;
    const disposed = vi.fn();
    imported.addEventListener("dispose", disposed);

    const material = sync({}) as THREE.MeshPhysicalMaterial;

    expect(material).toBeInstanceOf(MeshPhysicalNodeMaterial);
    expect(material).toMatchObject({ normalMap, transmission: 0.6, sheen: 0.4 });
    expect(disposed).toHaveBeenCalledOnce();
  });

  it("drops the coat for a lighting model other than physical", async () => {
    const { sync } = await buildCube();

    expect(sync({ model: "lambert", clearcoat: 1 })).toBeInstanceOf(MeshLambertNodeMaterial);
  });
});

describe("ObjectManager planes", () => {
  const buildPlane = async () => {
    const { useEditorStore, createObjectManager } = await loadModules();
    const meshMap = new Map<string, THREE.Object3D>();
    const manager = createObjectManager(meshMap);
    const id = useEditorStore.getState().addEntity("plane");
    const sync = () => {
      manager.syncMeshes(useEditorStore.getState().entities, null, false);
      return meshMap.get(id) as THREE.Mesh<THREE.PlaneGeometry, THREE.MeshStandardMaterial>;
    };
    return { useEditorStore, id, sync };
  };

  it("draws a plane as an unlit, double-sided 1×1 square in its own XY plane, facing +Z", async () => {
    const { sync } = await buildPlane();

    const mesh = sync();

    expect(mesh.geometry).toBeInstanceOf(THREE.PlaneGeometry);
    expect(mesh.geometry.parameters).toMatchObject({ width: 1, height: 1 });
    expect(mesh.geometry.boundingBox).toMatchObject({ min: { x: -0.5, y: -0.5, z: 0 }, max: { x: 0.5, y: 0.5, z: 0 } });
    expect(new THREE.Vector3().fromBufferAttribute(mesh.geometry.getAttribute("normal"), 0)).toEqual(new THREE.Vector3(0, 0, 1));
    expect(mesh.material).toBeInstanceOf(MeshBasicNodeMaterial);
    expect(mesh.material.side).toBe(THREE.DoubleSide);
  });

  it("draws a Depth layer per pixel, not as vertex colours", async () => {
    const { useEditorStore, id, sync } = await buildPlane();
    useEditorStore.getState().addMaterialLayer(id, "depth");

    const mesh = sync();

    expect(mesh.geometry.getAttribute("color")).toBeUndefined();
    expect(mesh.material.vertexColors).toBe(false);
    expect(mesh.material).toHaveProperty("libre3dLayerStack");
  });
});

describe("ObjectManager image planes", () => {
  it("draws an image as an unlit, double-sided plane the picture's shape, and loads its texture", async () => {
    vi.resetModules();
    const loadTextureForScene = vi.fn(() => new Promise<Blob | null>(() => {}));
    vi.doMock("../utils/assetTransfers", () => ({ loadTextureForScene, loadModelForScene: vi.fn() }));
    const [{ useEditorStore }, { ObjectManager }, { editorSceneSource }] = await Promise.all([
      import("../store/useEditorStore"),
      import("./ObjectManager"),
      import("./editorSceneSource"),
    ]);
    const meshMap = new Map<string, THREE.Object3D>();
    const manager = new ObjectManager(new THREE.Scene(), meshMap, editorSceneSource, { getRenderer: () => null });
    const hash = "b".repeat(64);

    const id = useEditorStore.getState().addImagePlane("logo", hash, 2, true);
    manager.syncMeshes(useEditorStore.getState().entities, null, false);
    const mesh = meshMap.get(id) as THREE.Mesh<THREE.PlaneGeometry, THREE.Material>;

    expect(mesh.geometry).toBeInstanceOf(THREE.PlaneGeometry);
    expect(mesh.geometry.parameters).toMatchObject({ width: 2, height: 1 });
    expect(mesh.material).toBeInstanceOf(MeshBasicNodeMaterial);
    expect(mesh.material).toMatchObject({ side: THREE.DoubleSide, transparent: true, depthWrite: true });
    expect(loadTextureForScene).toHaveBeenCalledWith(hash);
    vi.doUnmock("../utils/assetTransfers");
  });
});
