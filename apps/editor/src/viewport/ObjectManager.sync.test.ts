import * as THREE from "three";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { createDepthLayer, createEntity } from "../scene/entityFactories";
import { getDescendantIds } from "../scene/entityIndex";
import { resolveEntities } from "../scene/materialAssets";
import type { Entity, EntityType, ImageLayer, MaterialAsset, MaterialLayer } from "../scene/types";

import { PathMesh } from "../paths/PathMesh";
import { stubBrowserGlobals } from "../testing/browserStubs";
import { showBasePoses } from "./basePoses";
import { ObjectManager } from "./ObjectManager";
import type { SceneSource } from "./sceneSource";

// syncMeshes skips an object whose entity is the one it applied last time. These tests are about
// what must not be skipped: everything an object shows that doesn't come from its own entity.

type Vec3 = [number, number, number];

const make = (type: EntityType, id: string, overrides: Partial<Entity> = {}): Entity => ({ ...createEntity(type), id, name: id, ...overrides });

// A scene held outside any store, changed the way store actions change it: a new array, and a new
// object for each entity that changed.
const createScene = (initial: Entity[]) => {
  let entities = initial;
  let wireframe = false;
  const loadTexture = vi.fn(async (): Promise<Blob | null> => null);
  const source: SceneSource = {
    getEntities: () => entities,
    isWireframe: () => wireframe,
    loadModel: async () => null,
    loadTexture,
    saveTexture: async () => {},
    setMaterialLayers: () => {},
  };
  return {
    source,
    loadTexture,
    get entities() {
      return entities;
    },
    get: (id: string) => entities.find((entity) => entity.id === id)!,
    update: (id: string, changes: Partial<Entity>) => {
      entities = entities.map((entity) => (entity.id === id ? { ...entity, ...changes } : entity));
    },
    add: (entity: Entity) => {
      entities = [...entities, entity];
    },
    remove: (ids: string[]) => {
      entities = entities.filter((entity) => !ids.includes(entity.id));
    },
    setWireframe: (value: boolean) => {
      wireframe = value;
    },
  };
};

const createManager = (source: SceneSource) => {
  const meshMap = new Map<string, THREE.Object3D>();
  const manager = new ObjectManager(new THREE.Scene(), meshMap, source, { getRenderer: () => null });
  return { manager, meshMap, object: (id: string) => meshMap.get(id)! };
};

// The objects that went through a full sync, by entity id, since the spy was made.
const spyOnSyncedIds = () => {
  const spy = vi.spyOn(ObjectManager.prototype as unknown as { syncEntityToSceneObject: (obj: THREE.Object3D, entity: Entity) => void }, "syncEntityToSceneObject");
  return { ids: () => spy.mock.calls.map(([, entity]) => entity.id), clear: () => spy.mockClear() };
};

const updateColor = (layers: MaterialLayer[] | undefined, changes: Partial<MaterialLayer>): MaterialLayer[] =>
  (layers ?? []).map((layer) => (layer.type === "color" ? ({ ...layer, ...changes } as MaterialLayer) : layer));

beforeEach(() => {
  stubBrowserGlobals();
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("ObjectManager.syncMeshes: what it skips", () => {
  // Built, then synced once: an object is first skipped on the sync after that.
  const settled = (initial: Entity[]) => {
    const scene = createScene(initial);
    const built = createManager(scene.source);
    built.manager.syncMeshes(scene.entities, null, false);
    built.manager.syncMeshes(scene.entities, null, false);
    return { scene, ...built };
  };

  it("applies only the entity that changed", () => {
    const { scene, manager, object } = settled([make("cube", "a"), make("cube", "b"), make("sphere", "c")]);
    const synced = spyOnSyncedIds();

    scene.update("b", { position: [3, 0, 0] });
    manager.syncMeshes(scene.entities, null, false);

    expect(synced.ids()).toEqual(["b"]);
    expect(object("b").position.toArray()).toEqual([3, 0, 0]);
  });

  it("applies nothing when nothing changed, in the same array or a new one", () => {
    const { scene, manager } = settled([make("cube", "a"), make("cube", "b")]);
    const synced = spyOnSyncedIds();

    manager.syncMeshes(scene.entities, null, false);
    manager.syncMeshes([...scene.entities], null, false);

    expect(synced.ids()).toEqual([]);
  });

  it("applies an entity that goes back to an earlier value (an undo)", () => {
    const { scene, manager, object } = settled([make("cube", "a")]);
    const before = scene.entities;

    scene.update("a", { position: [3, 0, 0] });
    manager.syncMeshes(scene.entities, null, false);
    manager.syncMeshes(before, null, false);

    expect(object("a").position.toArray()).toEqual([0, 0, 0]);
  });

  it("syncs a new object once more after it's built, then leaves it", () => {
    const scene = createScene([make("cube", "a")]);
    const { manager } = createManager(scene.source);
    const synced = spyOnSyncedIds();

    manager.syncMeshes(scene.entities, null, false);
    expect(synced.ids()).toEqual([]);
    manager.syncMeshes(scene.entities, null, false);
    expect(synced.ids()).toEqual(["a"]);
    manager.syncMeshes(scene.entities, null, false);
    expect(synced.ids()).toEqual(["a"]);
  });
});

// Objects that use a material asset reach the sync with the asset's layers (resolveEntities), as the
// editor's and the viewer's sources hand them out.
describe("ObjectManager.syncMeshes: material assets", () => {
  const colorOf = (object: THREE.Object3D) => `#${((object as THREE.Mesh).material as THREE.MeshStandardMaterial).color.getHexString()}`;
  const assetOf = (id: string, color: string): MaterialAsset => ({ id, name: id, layers: updateColor(createEntity("cube").materialLayers, { color }) });

  const settled = () => {
    const scene = createScene([
      make("cube", "a", { materialAssetId: "m" }),
      make("cube", "b", { materialAssetId: "m" }),
      make("cube", "c"),
      make("cube", "d", { materialAssetId: "gone" }),
      // As applying an asset leaves an object: no layers of its own. Its asset is missing (a damaged file).
      make("cube", "e", { materialAssetId: "gone", materialLayers: [] }),
    ]);
    let materials: Record<string, MaterialAsset> = { m: assetOf("m", "#ff0000") };
    const built = createManager(scene.source);
    const sync = () => built.manager.syncMeshes(resolveEntities(scene.entities, materials), null, false);
    sync();
    sync();
    return { scene, ...built, sync, setMaterials: (next: Record<string, MaterialAsset>) => (materials = next) };
  };

  it("builds an object from its asset's layers, and from its own when the asset is missing", () => {
    const { object } = settled();

    expect(colorOf(object("a"))).toBe("#ff0000");
    expect(colorOf(object("b"))).toBe("#ff0000");
    expect(colorOf(object("c"))).toBe("#ffffff");
    expect(colorOf(object("d"))).toBe("#ffffff");
    // Nothing to draw it from: a plain material, and no failure.
    expect((object("e") as THREE.Mesh).material).toBeInstanceOf(THREE.Material);
  });


  it("applies an edited asset to every object that uses it, and to nothing else", () => {
    const { object, sync, setMaterials } = settled();
    const synced = spyOnSyncedIds();

    sync();
    expect(synced.ids()).toEqual([]);

    setMaterials({ m: assetOf("m", "#00ff00") });
    sync();

    expect(synced.ids()).toEqual(["a", "b"]);
    expect(colorOf(object("a"))).toBe("#00ff00");
    expect(colorOf(object("b"))).toBe("#00ff00");
    expect(colorOf(object("c"))).toBe("#ffffff");
  });

  it("applies only the object whose own values changed, though it uses an asset", () => {
    const { scene, object, sync } = settled();
    const synced = spyOnSyncedIds();

    scene.update("a", { position: [2, 0, 0] });
    sync();

    expect(synced.ids()).toEqual(["a"]);
    expect(object("a").position.toArray()).toEqual([2, 0, 0]);
    expect(colorOf(object("a"))).toBe("#ff0000");
  });

  it("draws an object from its own layers once it's detached, and from the asset once it's applied", () => {
    const { scene, object, sync } = settled();

    scene.update("a", { materialAssetId: undefined });
    scene.update("c", { materialAssetId: "m" });
    sync();

    expect(colorOf(object("a"))).toBe("#ffffff");
    expect(colorOf(object("c"))).toBe("#ff0000");
  });
});

describe("ObjectManager.syncMeshes: what it must not skip", () => {
  const settled = (initial: Entity[]) => {
    const scene = createScene(initial);
    const built = createManager(scene.source);
    built.manager.syncMeshes(scene.entities, null, false);
    built.manager.syncMeshes(scene.entities, null, false);
    return { scene, ...built };
  };

  it("puts a posed object back in Base, though its entity is the same", () => {
    const { scene, manager, object } = settled([make("cube", "a", { position: [1, 0, 0] }), make("cube", "b")]);

    manager.applyPose("a", { position: [9, 9, 9], rotation: [0, 1, 0], scale: [2, 2, 2] });
    expect(object("a").position.toArray()).toEqual([9, 9, 9]);
    const synced = spyOnSyncedIds();
    manager.syncMeshes(scene.entities, null, false);

    expect(object("a").position.toArray()).toEqual([1, 0, 0]);
    expect(object("a").scale.toArray()).toEqual([1, 1, 1]);
    expect(synced.ids()).toEqual(["a"]);
  });

  it("puts a posed path's trim back too", () => {
    const { scene, manager, object } = settled([make("path", "p", { trimStart: 0.1, trimEnd: 0.8 })]);

    manager.applyPose("p", { position: [0, 0, 0], rotation: [0, 0, 0], scale: [1, 1, 1], trimStart: 0.4, trimEnd: 0.5 });
    expect((object("p") as PathMesh).getTrim()).toEqual([0.4, 0.5]);
    manager.syncMeshes(scene.entities, null, false);

    expect((object("p") as PathMesh).getTrim()).toEqual([0.1, 0.8]);
  });

  it("leaves the gizmo's object where a drag put it, then puts it where its entity says", () => {
    const { scene, manager, object } = settled([make("cube", "a"), make("cube", "b")]);
    const dragged = object("a");

    // TransformControls moves the object itself; here the store never hears of it.
    dragged.position.set(5, 0, 0);
    manager.syncMeshes(scene.entities, dragged, true);
    expect(dragged.position.toArray()).toEqual([5, 0, 0]);

    manager.syncMeshes(scene.entities, dragged, false);
    expect(dragged.position.toArray()).toEqual([0, 0, 0]);
  });

  it("syncs the gizmo's object once more after the gizmo lets go of it", () => {
    const { scene, manager, object } = settled([make("cube", "a"), make("cube", "b")]);
    const dragged = object("a");

    dragged.position.set(5, 0, 0);
    manager.syncMeshes(scene.entities, dragged, true);
    const synced = spyOnSyncedIds();
    manager.syncMeshes(scene.entities, null, false);

    expect(dragged.position.toArray()).toEqual([0, 0, 0]);
    expect(synced.ids()).toEqual(["a"]);
    manager.syncMeshes(scene.entities, null, false);
    expect(synced.ids()).toEqual(["a"]);
  });

  it("locks and unlocks the objects under a group whose lock changes, without syncing them", () => {
    const { scene, manager, object } = settled([
      make("group", "g"),
      make("cube", "child", { parentId: "g" }),
      make("cube", "grandchild", { parentId: "child" }),
      make("cube", "other"),
    ]);
    const synced = spyOnSyncedIds();

    scene.update("g", { locked: true });
    manager.syncMeshes(scene.entities, null, false);

    expect(synced.ids()).toEqual(["g"]);
    expect([object("g"), object("child"), object("grandchild"), object("other")].map((each) => each.userData.locked)).toEqual([true, true, true, false]);

    scene.update("g", { locked: false });
    manager.syncMeshes(scene.entities, null, false);

    expect([object("child"), object("grandchild")].map((each) => each.userData.locked)).toEqual([false, false]);
  });

  it("keeps a child's own lock when its group is unlocked", () => {
    const { scene, manager, object } = settled([make("group", "g", { locked: true }), make("cube", "child", { parentId: "g", locked: true })]);

    scene.update("g", { locked: false });
    manager.syncMeshes(scene.entities, null, false);

    expect(object("child").userData.locked).toBe(true);
  });

  it("unlocks what leaves a locked group, and locks what's moved under one", () => {
    const { scene, manager, object } = settled([
      make("group", "locked", { locked: true }),
      make("group", "inner", { parentId: "locked" }),
      make("cube", "deep", { parentId: "inner" }),
      make("cube", "free"),
    ]);
    expect(object("deep").userData.locked).toBe(true);

    // The cube's own entity doesn't change: its parent's parent does.
    scene.update("inner", { parentId: null });
    scene.update("free", { parentId: "locked" });
    manager.syncMeshes(scene.entities, null, false);

    expect(object("deep").userData.locked).toBe(false);
    expect(object("free").userData.locked).toBe(true);
  });

  it("unlocks the objects left behind when a locked parent is removed", () => {
    const { scene, manager, object } = settled([make("group", "g", { locked: true }), make("cube", "child", { parentId: "g" })]);

    scene.remove(["g"]);
    manager.syncMeshes(scene.entities, null, false);

    expect(object("child").userData.locked).toBe(false);
  });

  it("aims a light at the origin again when the group it's in moves", () => {
    const { scene, manager, object } = settled([make("group", "g"), make("directionalLight", "light", { parentId: "g", position: [5, 8, 4] })]);
    const direction = () => {
      const light = object("light") as THREE.DirectionalLight;
      light.updateWorldMatrix(true, true);
      const from = new THREE.Vector3().setFromMatrixPosition(light.matrixWorld);
      const to = new THREE.Vector3().setFromMatrixPosition(light.target.matrixWorld);
      return { aim: to.sub(from).normalize(), toOrigin: from.clone().negate().normalize() };
    };
    expect(direction().aim.distanceTo(direction().toOrigin)).toBeLessThan(1e-6);

    scene.update("g", { position: [-20, 3, 7] });
    manager.syncMeshes(scene.entities, null, false);

    expect(direction().aim.distanceTo(direction().toOrigin)).toBeLessThan(1e-6);
  });

  it("asks again for a texture that couldn't be had, on every sync, as before", async () => {
    const image: ImageLayer = { id: "image-layer", type: "image", enabled: true, opacity: 1, blendMode: "normal", textureAssetId: "c".repeat(64), wrapS: THREE.ClampToEdgeWrapping, wrapT: THREE.ClampToEdgeWrapping, projection: "uv", axis: "y", sharpness: "smooth", crop: false, scale: [1, 1], offset: [0, 0], rotation: 0 };
    const picture = make("plane", "picture");
    const scene = createScene([{ ...picture, materialLayers: [...picture.materialLayers!, image] }, make("cube", "a")]);
    const { manager } = createManager(scene.source);
    const settle = () => new Promise((resolve) => setTimeout(resolve, 0)); // the load answers null

    manager.syncMeshes(scene.entities, null, false);
    await settle();
    expect(scene.loadTexture).toHaveBeenCalledTimes(1);

    manager.syncMeshes(scene.entities, null, false);
    await settle();
    manager.syncMeshes(scene.entities, null, false);
    await settle();

    expect(scene.loadTexture).toHaveBeenCalledTimes(3);
  });
});

// The check that covers what the cases above didn't think of: one manager syncs as the editor does,
// the other has its memory wiped before every sync, so it applies every entity each time (what
// syncMeshes did before it skipped anything). Through any run of edits, poses and drags, the two
// scenes must stay the same.
describe("ObjectManager.syncMeshes: the same scene as syncing everything", () => {
  const createRandom = (seed: number) => () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };

  const forgetEverything = (manager: ObjectManager) => {
    const internals = manager as unknown as { syncedEntities: WeakMap<THREE.Object3D, Entity>; lastSyncedById: Map<string, Entity> | null };
    internals.syncedEntities = new WeakMap();
    internals.lastSyncedById = null;
  };

  // What an object shows, as plain values.
  const describeObject = (object: THREE.Object3D | undefined, objectIds: Map<THREE.Object3D, string>) => {
    if (!object) return null;
    const round = (value: number) => Math.round(value * 1e6) / 1e6;
    const material = object instanceof THREE.Mesh ? (object.material as THREE.MeshStandardMaterial) : null;
    const geometry = object instanceof THREE.Mesh ? (object.geometry as THREE.BufferGeometry) : null;
    const colors = geometry?.getAttribute("color");
    return {
      position: object.position.toArray().map(round),
      quaternion: object.quaternion.toArray().map(round),
      scale: object.scale.toArray().map(round),
      visible: object.visible,
      locked: object.userData.locked,
      parent: object.parent ? (objectIds.get(object.parent) ?? "scene") : null,
      trackedParent: object.userData.parentEntityId ?? null,
      outline: object.userData.selectionOutline ? "yes" : "no",
      material: material && {
        kind: material.type,
        color: material.color.getHexString(),
        opacity: material.opacity,
        transparent: material.transparent,
        depthWrite: material.depthWrite,
        side: material.side,
        wireframe: material.wireframe,
        vertexColors: material.vertexColors,
        roughness: material.roughness ?? null,
        emissive: material.emissive ? material.emissive.getHexString() : null,
      },
      geometry: geometry && {
        vertices: geometry.getAttribute("position")?.count ?? 0,
        painted: colors ? [round(colors.getX(0)), round(colors.getY(0)), round(colors.getZ(0))] : null,
      },
      trim: object instanceof PathMesh ? object.getTrim() : null,
      light: object instanceof THREE.DirectionalLight ? object.color.getHexString() : null,
    };
  };

  const describeScene = (meshMap: Map<string, THREE.Object3D>) => {
    const objectIds = new Map([...meshMap].map(([id, object]) => [object, id] as const));
    return Object.fromEntries([...meshMap].sort(([a], [b]) => a.localeCompare(b)).map(([id, object]) => [id, describeObject(object, objectIds)]));
  };

  it.each([0x5eed1, 0x5eed2, 0x5eed3, 0x5eed4])("through 400 random edits, poses and drags (seed %i)", (seed) => {
    const random = createRandom(seed);
    const pick = <T,>(list: readonly T[]): T => list[Math.floor(random() * list.length)];
    const number = (reach: number) => Math.round((random() * 2 - 1) * reach * 100) / 100;
    const vector = (reach: number): Vec3 => [number(reach), number(reach), number(reach)];
    const colors = ["#ff0000", "#00ff00", "#3366ff", "#ffffff", "#101010"] as const;

    const scene = createScene([
      make("cube", "cube"),
      make("sphere", "sphere"),
      make("torus", "torus"),
      make("plane", "plane"),
      make("path", "path"),
      make("group", "groupA"),
      make("group", "groupB", { parentId: "groupA" }),
      make("cube", "inA", { parentId: "groupA" }),
      make("sphere", "inB", { parentId: "groupB" }),
      make("directionalLight", "light"),
      make("directionalLight", "lightInB", { parentId: "groupB" }),
    ]);
    const skipping = createManager(scene.source);
    const everything = createManager(scene.source);
    let added = 0;
    // The gizmo's object, by entity id, and whether it's mid-drag.
    let target: string | null = null;
    let dragging = false;

    const syncBoth = () => {
      forgetEverything(everything.manager);
      for (const each of [skipping, everything]) {
        each.manager.syncMeshes(scene.entities, target ? (each.meshMap.get(target) ?? null) : null, dragging);
      }
    };
    const meshes = () => scene.entities.filter((entity) => entity.materialLayers);
    // An entity can be gone by now: it was moved into an added group that was then removed.
    const has = (id: string) => scene.entities.some((entity) => entity.id === id);

    const edits: (() => void)[] = [
      () => scene.update(pick(scene.entities).id, { position: vector(10) }),
      () => scene.update(pick(scene.entities).id, { rotation: vector(3) }),
      () => scene.update(pick(scene.entities).id, { scale: [1 + random(), 1 + random(), 1 + random()] }),
      () => {
        const entity = pick(scene.entities);
        scene.update(entity.id, { visible: !entity.visible });
      },
      () => {
        const entity = pick(scene.entities);
        scene.update(entity.id, { locked: !entity.locked });
      },
      () => {
        // Into a group that isn't the entity or under it, or out to the scene.
        const entity = pick(scene.entities);
        const under = new Set([entity.id, ...getDescendantIds(scene.entities, entity.id)]);
        const parents = scene.entities.filter((each) => each.type === "group" && !under.has(each.id)).map((each) => each.id);
        scene.update(entity.id, { parentId: pick([null, ...parents]) });
      },
      () => {
        const entity = pick(meshes());
        if (entity) scene.update(entity.id, { materialLayers: updateColor(entity.materialLayers, { color: pick(colors) }) });
      },
      () => {
        const entity = pick(meshes());
        if (entity) scene.update(entity.id, { materialLayers: updateColor(entity.materialLayers, { opacity: pick([1, 0.5, 0.2]) }) });
      },
      () => {
        const entity = pick(meshes());
        if (!entity) return;
        const model = pick(["physical", "lambert", "phong", "toon", "none"] as const);
        scene.update(entity.id, { materialLayers: entity.materialLayers!.map((layer) => (layer.type === "lighting" ? { ...layer, model } : layer)) });
      },
      () => {
        // A Depth layer on, changed, or off.
        const entity = pick(meshes());
        if (!entity) return;
        const layers = entity.materialLayers!;
        const depth = layers.find((layer) => layer.type === "depth");
        scene.update(entity.id, {
          materialLayers: !depth ? [...layers, createDepthLayer(1 + random() * 3)] : random() < 0.5 ? layers.filter((layer) => layer !== depth) : layers.map((layer) => (layer === depth ? { ...depth, far: 1 + random() * 3 } : layer)),
        });
      },
      () => scene.update("path", { trimStart: Math.round(random() * 40) / 100, trimEnd: 0.6 + Math.round(random() * 40) / 100 }),
      () => {
        if (has("path")) scene.update("path", { stroke: { ...scene.get("path").stroke!, radius: 0.05 + Math.round(random() * 20) / 100 } });
      },
      () => scene.update("light", { color: pick(colors) }),
      () => scene.add(make(pick(["cube", "sphere", "group"] as const), `added${added++}`, { position: vector(5), parentId: pick([null, "groupA", "groupB"]) })),
      () => {
        // Remove something added, and whatever is under it.
        const candidates = scene.entities.filter((entity) => entity.id.startsWith("added"));
        if (candidates.length === 0) return;
        const id = pick(candidates).id;
        if (target === id || getDescendantIds(scene.entities, id).includes(target ?? "")) target = null;
        scene.remove([id, ...getDescendantIds(scene.entities, id)]);
      },
      () => {
        // The scene's wireframe setting: ViewportCanvas applies it to every mesh when it changes.
        scene.setWireframe(!scene.source.isWireframe());
        for (const each of [skipping, everything]) {
          each.meshMap.forEach((object) => {
            if (object instanceof THREE.Mesh) (object.material as THREE.MeshStandardMaterial).wireframe = scene.source.isWireframe();
          });
        }
      },
    ];

    // What moves objects without an edit: a pose (a state being viewed, Play), and the gizmo.
    const touches: (() => void)[] = [
      () => {
        const entity = pick(scene.entities);
        const pose = { position: vector(10), rotation: vector(3), scale: [1, 2, 1] as Vec3, ...(entity.type === "path" ? { trimStart: 0.3, trimEnd: 0.7 } : null) };
        for (const each of [skipping, everything]) each.manager.applyPose(entity.id, pose);
      },
      () => {
        // Select another object: the gizmo moves to it.
        target = pick([null, ...scene.entities.map((entity) => entity.id)]);
        dragging = false;
      },
      () => {
        // A drag step: the gizmo moves its object, and the same value goes to the store.
        if (!target || !scene.entities.some((entity) => entity.id === target)) return;
        dragging = true;
        const position = vector(10);
        for (const each of [skipping, everything]) each.meshMap.get(target)?.position.set(...position);
        scene.update(target, { position });
      },
      () => {
        // A drag step that the store drops (a locked or view-only scene): only the object moves.
        if (!target) return;
        dragging = true;
        const position = vector(10);
        for (const each of [skipping, everything]) each.meshMap.get(target)?.position.set(...position);
      },
      () => {
        dragging = false;
      },
    ];

    syncBoth();
    for (let step = 0; step < 400; step++) {
      if (random() < 0.3) pick(touches)();
      else pick(edits)();
      syncBoth();
      expect(describeScene(skipping.meshMap), `step ${step}`).toEqual(describeScene(everything.meshMap));
    }
    expect(scene.entities.length).toBeGreaterThan(0);
  });
});

describe("ObjectManager without the editor's helpers (the share-link viewer)", () => {
  // One of each kind of object that gets an outline, a helper, or an error box in the editor.
  const everyKind = () => [
    make("cube", "cube"),
    make("path", "path"),
    make("shape", "shape"),
    make("directionalLight", "light"),
    make("group", "group"),
    make("importedModel", "broken", { assetId: "missing" }), // can't be loaded: the editor shows its red box
  ];

  const editorOnlyObjects = async (editorHelpers: boolean | undefined) => {
    vi.spyOn(console, "error").mockImplementation(() => {}); // the missing model is reported
    const scene = createScene(everyKind());
    const threeScene = new THREE.Scene();
    const manager = new ObjectManager(threeScene, new Map(), scene.source, { getRenderer: () => null, editorHelpers });
    manager.syncMeshes(scene.entities, null, false);
    await new Promise((resolve) => setTimeout(resolve, 0)); // the model's load comes back empty
    // A path and a shape rebuild their outline with their geometry.
    scene.update("path", { stroke: { ...scene.get("path").stroke!, radius: 0.3 } });
    scene.update("shape", { extrusion: 0.5 });
    manager.syncMeshes(scene.entities, null, false);

    const found: string[] = [];
    threeScene.traverse((object) => {
      if (object.userData.editorOnly) found.push(object.type);
    });
    return { found, manager };
  };

  it("builds no outline, light helper, or error box", async () => {
    const { found, manager } = await editorOnlyObjects(false);

    expect(found).toEqual([]);
    expect(manager.getObject("cube")!.userData.selectionOutline).toBeUndefined();
    expect(manager.getObject("light")!.userData.helper).toBeUndefined();
    expect(manager.getObject("broken")!.userData.loadError).toBe(true);
  });

  it("builds them in the editor, where the option is left out", async () => {
    const { found } = await editorOnlyObjects(undefined);

    // An outline each for the cube, the path, the shape, and the broken model, and the light's helper.
    expect(found.sort()).toEqual(["DirectionalLightHelper", "LineSegments", "LineSegments", "LineSegments", "LineSegments"]);
  });
});

// A pose's colour and opacity (a state being viewed, or Play) go on the object's material as values.
describe("ObjectManager.applyPose: colour and opacity", () => {
  const materialOf = (object: THREE.Object3D) => (object as THREE.Mesh).material as THREE.MeshStandardMaterial;
  const colorOf = (object: THREE.Object3D) => `#${materialOf(object).color.getHexString()}`;
  const pose = (look: { color?: string; opacity?: number }) => ({ position: [0, 0, 0] as Vec3, rotation: [0, 0, 0] as Vec3, scale: [1, 1, 1] as Vec3, ...look });
  const red = updateColor(createEntity("cube").materialLayers, { color: "#ff0000" });

  // Synced twice, as the editor has by the time anything is posed. `fading`: the objects a state can fade.
  const settled = (initial: Entity[], fading: string[] = [], materials: Record<string, MaterialAsset> = {}) => {
    const scene = createScene(initial);
    // As the editor's and the viewer's sources hand entities out: with their assets' layers.
    scene.source.getEntities = () => resolveEntities(scene.entities, materials);
    const built = createManager(scene.source);
    const sync = (target: THREE.Object3D | null = null, dragging = false) => built.manager.syncMeshes(scene.source.getEntities(), target, dragging);
    built.manager.setFadingObjects(new Set(fading));
    sync();
    sync();
    return { scene, ...built, sync };
  };

  it("changes the colour and opacity without a new material or a shader rebuild", () => {
    const { manager, object } = settled([make("cube", "a", { materialLayers: red })], ["a"]);
    const material = materialOf(object("a"));
    const version = material.version;

    manager.applyPose("a", pose({ color: "#0000ff", opacity: 0.5 }));

    expect(materialOf(object("a"))).toBe(material);
    expect(colorOf(object("a"))).toBe("#0000ff");
    expect(material.opacity).toBe(0.5);
    // needsUpdate (a rebuild) bumps the version.
    expect(material.version).toBe(version);
  });

  it("draws an object a state can fade with the see-through ones while it's solid, still writing depth", () => {
    const { manager, object } = settled([make("cube", "a"), make("cube", "b")], ["a"]);

    expect(materialOf(object("a"))).toMatchObject({ transparent: true, depthWrite: true, opacity: 1 });
    expect(materialOf(object("b"))).toMatchObject({ transparent: false, depthWrite: true });

    manager.applyPose("a", pose({ opacity: 0.2 }));
    expect(materialOf(object("a"))).toMatchObject({ transparent: true, opacity: 0.2 });
    manager.applyPose("a", pose({ opacity: 1 }));
    expect(materialOf(object("a"))).toMatchObject({ transparent: true, opacity: 1 });
  });

  it("syncs again only the objects that start or stop being ones a state can fade", () => {
    const { manager, object, sync } = settled([make("cube", "a"), make("cube", "b"), make("cube", "c")], ["a"]);
    const synced = spyOnSyncedIds();

    manager.setFadingObjects(new Set(["b"]));
    sync();

    expect(synced.ids()).toEqual(["a", "b"]);
    expect(materialOf(object("a")).transparent).toBe(false);
    expect(materialOf(object("b")).transparent).toBe(true);
  });

  it("puts the object's own colour and opacity back on the next sync", () => {
    const { manager, object, sync } = settled([make("cube", "a", { materialLayers: red, opacity: 0.8 })], ["a"]);

    manager.applyPose("a", pose({ color: "#0000ff", opacity: 0.1 }));
    sync();

    expect(colorOf(object("a"))).toBe("#ff0000");
    expect(materialOf(object("a")).opacity).toBeCloseTo(0.8, 6);
  });

  it("keeps the gizmo's object in its pose's look while it's dragged", () => {
    const { manager, object, sync } = settled([make("cube", "a", { materialLayers: red })], ["a"]);

    manager.applyPose("a", pose({ color: "#0000ff", opacity: 0.5 }));
    sync(object("a"), true);
    expect(colorOf(object("a"))).toBe("#0000ff");
    expect(materialOf(object("a")).opacity).toBe(0.5);

    sync(object("a"), false);
    expect(colorOf(object("a"))).toBe("#ff0000");
  });

  it("leaves another object with the same layers as it was", () => {
    const { manager, object } = settled([make("cube", "a", { materialLayers: red }), make("cube", "b", { materialLayers: red })], ["a"]);

    manager.applyPose("a", pose({ color: "#0000ff", opacity: 0.5 }));

    expect(colorOf(object("b"))).toBe("#ff0000");
    expect(materialOf(object("b"))).toMatchObject({ opacity: 1, transparent: false });
  });

  it("leaves another object on the same material asset, and the asset, as they were", () => {
    const asset: MaterialAsset = { id: "m", name: "m", layers: red };
    const layersBefore = JSON.stringify(asset.layers);
    const { manager, object } = settled(
      [make("cube", "a", { materialAssetId: "m", materialLayers: [] }), make("cube", "b", { materialAssetId: "m", materialLayers: [] })],
      ["a"],
      { m: asset },
    );
    expect(colorOf(object("a"))).toBe("#ff0000");

    manager.applyPose("a", pose({ color: "#0000ff", opacity: 0.5 }));

    expect(colorOf(object("a"))).toBe("#0000ff");
    expect(colorOf(object("b"))).toBe("#ff0000");
    expect(materialOf(object("b")).opacity).toBe(1);
    expect(asset.layers).toBe(red);
    expect(JSON.stringify(asset.layers)).toBe(layersBefore);
  });

  it("keeps the shader of a stack drawn per pixel, for it and for an object sharing its shape", () => {
    const stack = [createDepthLayer(), ...red];
    const { manager, object } = settled([make("cube", "a", { materialLayers: stack }), make("cube", "b", { materialLayers: stack })], ["a"]);
    const shapeOf = (id: string) => (materialOf(object(id)) as unknown as Record<string, unknown>).libre3dLayerStack;
    const [shape, version, other] = [shapeOf("a"), materialOf(object("a")).version, materialOf(object("b")).version];
    expect(shape).toBeTypeOf("string");

    manager.applyPose("a", pose({ color: "#0000ff", opacity: 0.5 }));

    expect(shapeOf("a")).toBe(shape);
    expect(shapeOf("b")).toBe(shape);
    expect(materialOf(object("a")).version).toBe(version);
    expect(materialOf(object("b")).version).toBe(other);
    expect(materialOf(object("a")).opacity).toBe(0.5);
  });

  it("does nothing for a pose that looks like the object already does", () => {
    const { manager, object } = settled([make("cube", "a", { materialLayers: red })]);
    const applied = vi.spyOn(materialOf(object("a")).color, "setRGB");

    manager.applyPose("a", pose({ color: "#ff0000", opacity: 1 }));
    expect(applied).not.toHaveBeenCalled();

    manager.applyPose("a", pose({ color: "#0000ff", opacity: 1 }));
    manager.applyPose("a", pose({ color: "#0000ff", opacity: 1 }));
    expect(applied).toHaveBeenCalledTimes(1);
  });

  it("shows Base to exports and thumbnails, then the pose again", () => {
    const { manager, object } = settled([make("cube", "a", { materialLayers: red })], ["a"]);
    manager.applyPose("a", pose({ color: "#0000ff", opacity: 0.5 }));

    const restore = showBasePoses(object("a").parent as THREE.Scene);
    expect(colorOf(object("a"))).toBe("#ff0000");
    expect(materialOf(object("a")).opacity).toBe(1);

    restore();
    expect(colorOf(object("a"))).toBe("#0000ff");
    expect(materialOf(object("a")).opacity).toBe(0.5);
  });

  it("ignores a look on an object without a material", () => {
    const { manager, object } = settled([make("group", "g")]);
    expect(() => manager.applyPose("g", pose({ color: "#0000ff", opacity: 0.5 }))).not.toThrow();
    expect(object("g").position.toArray()).toEqual([0, 0, 0]);
  });
});
