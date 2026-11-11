import * as THREE from "three";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { createDepthLayer, createEntity } from "../scene/entityFactories";
import { getDescendantIds } from "../scene/entityIndex";
import type { Entity, EntityType, ImageLayer, MaterialLayer } from "../scene/types";
import { PathMesh } from "../paths/PathMesh";
import { stubBrowserGlobals } from "../testing/browserStubs";
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
    applyHierarchyPrune: () => {},
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
    const image: ImageLayer = { id: "image-layer", type: "image", enabled: true, opacity: 1, textureAssetId: "c".repeat(64), slot: "color", wrapS: THREE.ClampToEdgeWrapping, wrapT: THREE.ClampToEdgeWrapping };
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
