import * as THREE from "three";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { Entity, LightingLayer } from "../store/useEditorStore";
import { stubBrowserGlobals } from "../testing/browserStubs";

// The store reads localStorage while its module loads, so the browser goes in first.
const loadModules = async () => {
  vi.resetModules();
  const [{ useEditorStore }, { ObjectManager }] = await Promise.all([
    import("../store/useEditorStore"),
    import("./ObjectManager"),
  ]);
  return { useEditorStore, ObjectManager };
};

// The starter scene's cube, drawn by the editor itself, with its lighting layer changed by `lighting`.
const buildCube = async () => {
  const { useEditorStore, ObjectManager } = await loadModules();
  const meshMap = new Map<string, THREE.Object3D>();
  const manager = new ObjectManager(new THREE.Scene(), meshMap);
  const cube = useEditorStore.getState().entities.find((entity) => entity.type === "cube")!;

  const sync = (lighting: Partial<LightingLayer>): THREE.Material => {
    const entity: Entity = {
      ...cube,
      materialLayers: cube.materialLayers!.map((layer) => (layer.type === "lighting" ? { ...layer, ...lighting } : layer)),
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

    expect(material).toBeInstanceOf(THREE.MeshStandardMaterial);
    expect(material).not.toBeInstanceOf(THREE.MeshPhysicalMaterial);
  });

  it("builds a physical material for a clearcoat, and keeps it when the coat goes back to 0", async () => {
    const { sync } = await buildCube();
    sync({});

    const coated = sync({ clearcoat: 1, clearcoatRoughness: 0.05 }) as THREE.MeshPhysicalMaterial;

    expect(coated).toBeInstanceOf(THREE.MeshPhysicalMaterial);
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

    expect(material).toBe(imported);
    expect(material).toMatchObject({ clearcoat: 0.7, clearcoatRoughness: 0.2, roughness: 0.3 });
  });

  it("drops the coat for a lighting model other than physical", async () => {
    const { sync } = await buildCube();

    expect(sync({ model: "lambert", clearcoat: 1 })).toBeInstanceOf(THREE.MeshLambertMaterial);
  });
});

describe("ObjectManager image planes", () => {
  it("draws an image as an unlit, double-sided plane the picture's shape, and loads its texture", async () => {
    vi.resetModules();
    const loadTextureForScene = vi.fn(() => new Promise<Blob | null>(() => {}));
    vi.doMock("../utils/assetTransfers", () => ({ loadTextureForScene, loadModelForScene: vi.fn() }));
    const [{ useEditorStore }, { ObjectManager }] = await Promise.all([import("../store/useEditorStore"), import("./ObjectManager")]);
    const meshMap = new Map<string, THREE.Object3D>();
    const manager = new ObjectManager(new THREE.Scene(), meshMap);
    const hash = "b".repeat(64);

    const id = useEditorStore.getState().addImagePlane("logo", hash, 2, true);
    manager.syncMeshes(useEditorStore.getState().entities, null, false);
    const mesh = meshMap.get(id) as THREE.Mesh<THREE.PlaneGeometry, THREE.Material>;

    expect(mesh.geometry).toBeInstanceOf(THREE.PlaneGeometry);
    expect(mesh.geometry.parameters).toMatchObject({ width: 2, height: 1 });
    expect(mesh.material).toBeInstanceOf(THREE.MeshBasicMaterial);
    expect(mesh.material).toMatchObject({ side: THREE.DoubleSide, transparent: true, depthWrite: true });
    expect(loadTextureForScene).toHaveBeenCalledWith(hash);
    vi.doUnmock("../utils/assetTransfers");
  });
});
