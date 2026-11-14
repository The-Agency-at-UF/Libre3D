import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { stubBrowserGlobals } from "../testing/browserStubs";
import { collectAssetRefs } from "../utils/sceneAssets";
import { parseSceneDocument, toSceneDocument } from "../utils/sceneDocument";
import type { ColorLayer, Entity } from "./useEditorStore";

// Material assets in the store (scene/materialAssets.ts): the asset actions, and the layer actions
// when what they edit is an asset or an object that uses one.

beforeEach(() => {
  stubBrowserGlobals();
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

const light: Entity = {
  id: "directional-light-1",
  type: "directionalLight",
  name: "Directional Light",
  position: [5, 8, 4],
  rotation: [0, 0, 0],
  scale: [1, 1, 1],
  visible: true,
  locked: false,
  parentId: null,
  color: "#ffffff",
};

// A fresh store holding two cubes.
const storeWithCubes = async () => {
  vi.resetModules();
  const { useEditorStore, selectSceneContent, selectDrawnEntities } = await import("./useEditorStore");
  const store = () => useEditorStore.getState();
  store().loadScene({ entities: [light] });
  const a = store().addEntity("cube");
  const b = store().addEntity("cube");
  useEditorStore.temporal.getState().clear();
  const entity = (id: string) => store().entities.find((each) => each.id === id)!;
  const drawn = (id: string) => selectDrawnEntities(store()).find((each) => each.id === id)!;
  const colorOf = (id: string) => (drawn(id).materialLayers!.find((layer) => layer.type === "color") as ColorLayer).color;
  const undo = () => useEditorStore.temporal.getState().undo();
  const steps = () => useEditorStore.temporal.getState().pastStates.length;
  return { useEditorStore, selectSceneContent, store, a, b, entity, drawn, colorOf, undo, steps };
};

describe("material assets", () => {
  it("creates a new asset with Lighting over a white Color layer, named in turn", async () => {
    const { store, undo } = await storeWithCubes();

    const first = store().createMaterialAsset();
    const second = store().createMaterialAsset();

    expect(store().materials[first]).toMatchObject({ id: first, name: "Material" });
    expect(store().materials[first].layers.map((layer) => layer.type)).toEqual(["lighting", "color"]);
    expect(store().materials[second].name).toBe("Material 2");

    undo();
    expect(Object.keys(store().materials)).toEqual([first]);
  });

  it("creates an asset from an object's layers, which the object then uses, in one undo step", async () => {
    const { store, a, b, entity, drawn, steps, undo } = await storeWithCubes();
    store().addMaterialLayer(a, "fresnel");
    const own = entity(a).materialLayers!;
    const before = steps();

    const assetId = store().createMaterialAsset(a);

    expect(steps()).toBe(before + 1);
    expect(entity(a).materialAssetId).toBe(assetId);
    expect(entity(a).materialLayers).toEqual([]);
    expect(entity(b).materialAssetId).toBeUndefined();
    const asset = store().materials[assetId];
    expect(asset.layers.map((layer) => layer.type)).toEqual(own.map((layer) => layer.type));
    // A copy: new layer IDs, nothing shared with the object's own layers.
    asset.layers.forEach((layer, index) => {
      expect(layer.id).not.toBe(own[index].id);
      expect(layer).not.toBe(own[index]);
    });
    expect(drawn(a).materialLayers).toBe(asset.layers);

    undo();
    expect(store().materials).toEqual({});
    expect(entity(a).materialAssetId).toBeUndefined();
    expect(entity(a).materialLayers).toBe(own);
  });


  it("makes nothing from a group or a light", async () => {
    const { store, steps } = await storeWithCubes();

    expect(store().createMaterialAsset(light.id)).toBe("");
    expect(store().createMaterialAsset("missing")).toBe("");
    expect(store().materials).toEqual({});
    expect(steps()).toBe(0);
  });

  it("renames an asset, ignoring an empty or unchanged name", async () => {
    const { store, steps } = await storeWithCubes();
    const assetId = store().createMaterialAsset();
    const before = steps();

    store().renameMaterialAsset(assetId, "  Chrome ");
    expect(store().materials[assetId].name).toBe("Chrome");
    store().renameMaterialAsset(assetId, "   ");
    store().renameMaterialAsset(assetId, "Chrome");
    store().renameMaterialAsset("missing", "Nope");
    expect(steps()).toBe(before + 1);
  });

  it("applies an asset to objects in one undo step, replacing their own layers", async () => {
    const { store, a, b, entity, drawn, steps, undo } = await storeWithCubes();
    const assetId = store().createMaterialAsset();
    const ownBefore = entity(a).materialLayers;
    const before = steps();

    store().applyMaterialAsset(assetId, [a, b, light.id]);

    expect(steps()).toBe(before + 1);
    expect(entity(a).materialAssetId).toBe(assetId);
    expect(entity(b).materialAssetId).toBe(assetId);
    expect(entity(light.id).materialAssetId).toBeUndefined();
    expect(drawn(a).materialLayers).toBe(store().materials[assetId].layers);
    // Its own layers are discarded.
    expect(entity(a).materialLayers).toEqual([]);

    // Applying it again changes nothing.
    store().applyMaterialAsset(assetId, [a]);
    store().applyMaterialAsset("missing", [a]);
    expect(steps()).toBe(before + 1);

    undo();
    expect(entity(a).materialAssetId).toBeUndefined();
    expect(entity(a).materialLayers).toBe(ownBefore);
  });

  it("doesn't apply an asset to an imported model's mesh", async () => {
    const { useEditorStore, store, a, entity } = await storeWithCubes();
    const assetId = store().createMaterialAsset();
    useEditorStore.setState({ entities: store().entities.map((each) => (each.id === a ? { ...each, type: "importedModel" as const } : each)) });

    store().applyMaterialAsset(assetId, [a]);

    expect(entity(a).materialAssetId).toBeUndefined();
  });

  it("edits the asset through any object that uses it, so every user changes and nothing else", async () => {
    const { store, a, b, entity, drawn, colorOf, steps, undo } = await storeWithCubes();
    const assetId = store().createMaterialAsset();
    store().applyMaterialAsset(assetId, [a]);
    const c = store().addEntity("cube");
    store().applyMaterialAsset(assetId, [c]);
    const untouched = entity(b);
    const ownOfA = entity(a).materialLayers;
    const colorId = store().materials[assetId].layers.find((layer) => layer.type === "color")!.id;
    const before = steps();

    store().updateMaterialLayer(a, colorId, { color: "#ff0000" });

    expect(steps()).toBe(before + 1);
    expect(colorOf(a)).toBe("#ff0000");
    expect(colorOf(c)).toBe("#ff0000");
    expect(colorOf(b)).toBe("#ffffff");
    expect(entity(b)).toBe(untouched);
    // The edit went to the asset: the objects themselves are the same.
    expect(entity(a).materialLayers).toBe(ownOfA);
    expect(drawn(b)).toBe(untouched);

    undo();
    expect(colorOf(a)).toBe("#ffffff");
  });

  it("edits an asset by its own ID, with the stack rules, while no object uses it", async () => {
    const { store, steps } = await storeWithCubes();
    const assetId = store().createMaterialAsset();
    const types = () => store().materials[assetId].layers.map((layer) => layer.type);
    const idOf = (type: string) => store().materials[assetId].layers.find((layer) => layer.type === type)!.id;

    store().addMaterialLayer(assetId, "fresnel");
    store().addMaterialLayer(assetId, "noise");
    expect(types()).toEqual(["fresnel", "lighting", "noise", "color"]);

    store().updateMaterialLayer(assetId, idOf("noise"), { blendMode: "screen" });
    expect(store().materials[assetId].layers[2]).toMatchObject({ type: "noise", blendMode: "screen" });

    store().switchMaterialLayerType(assetId, idOf("color"), "gradient");
    expect(types()).toEqual(["fresnel", "lighting", "noise", "gradient"]);

    store().moveMaterialLayer(assetId, idOf("gradient"), 2);
    expect(types()).toEqual(["fresnel", "lighting", "gradient", "noise"]);

    // Lighting can't be removed, so nothing is recorded.
    const before = steps();
    store().removeMaterialLayer(assetId, idOf("lighting"));
    expect(steps()).toBe(before);
    store().removeMaterialLayer(assetId, idOf("fresnel"));
    expect(types()).toEqual(["lighting", "gradient", "noise"]);
  });

  it("changes a shared asset once when several of its users are edited together", async () => {
    const { store, a, b, colorOf, steps } = await storeWithCubes();
    const assetId = store().createMaterialAsset();
    store().applyMaterialAsset(assetId, [a, b]);
    const colorId = store().materials[assetId].layers.find((layer) => layer.type === "color")!.id;
    const before = steps();

    store().updateMultipleEntityMaterialLayers({ [a]: { layerId: colorId, updates: { color: "#00ff00" } }, [b]: { layerId: colorId, updates: { color: "#00ff00" } } });

    expect(steps()).toBe(before + 1);
    expect(colorOf(a)).toBe("#00ff00");
    expect(colorOf(b)).toBe("#00ff00");
  });

  it("edits an asset user and an object with its own layers in one step", async () => {
    const { store, a, b, colorOf, entity, steps } = await storeWithCubes();
    const assetId = store().createMaterialAsset();
    store().applyMaterialAsset(assetId, [a]);
    const assetColor = store().materials[assetId].layers.find((layer) => layer.type === "color")!.id;
    const ownColor = entity(b).materialLayers!.find((layer) => layer.type === "color")!.id;
    const before = steps();

    store().updateMultipleEntityMaterialLayers({ [a]: { layerId: assetColor, updates: { color: "#111111" } }, [b]: { layerId: ownColor, updates: { color: "#222222" } } });

    expect(steps()).toBe(before + 1);
    expect(colorOf(a)).toBe("#111111");
    expect(colorOf(b)).toBe("#222222");
  });

  it("detaches an object with new layer IDs, so editing it leaves the asset and its other users alone", async () => {
    const { store, a, b, entity, colorOf, steps, undo } = await storeWithCubes();
    const assetId = store().createMaterialAsset();
    store().applyMaterialAsset(assetId, [a, b]);
    store().updateMaterialLayer(assetId, store().materials[assetId].layers[1].id, { color: "#123456" });
    const before = steps();

    store().detachMaterialAsset([a]);

    expect(steps()).toBe(before + 1);
    expect(entity(a)).not.toHaveProperty("materialAssetId");
    expect(colorOf(a)).toBe("#123456");
    const assetLayers = store().materials[assetId].layers;
    entity(a).materialLayers!.forEach((layer, index) => {
      expect(layer.id).not.toBe(assetLayers[index].id);
      expect(layer).not.toBe(assetLayers[index]);
    });

    store().updateMaterialLayer(a, entity(a).materialLayers![1].id, { color: "#abcdef" });
    expect(colorOf(a)).toBe("#abcdef");
    expect(colorOf(b)).toBe("#123456");
    expect(store().materials[assetId].layers).toBe(assetLayers);

    undo();
    undo();
    expect(entity(a).materialAssetId).toBe(assetId);

    // Detaching an object that uses no asset records nothing.
    const stepsNow = steps();
    store().detachMaterialAsset([a]);
    store().detachMaterialAsset([a]);
    expect(steps()).toBe(stepsNow + 1);
  });

  it("deletes an asset and detaches its users in one step; one undo restores the asset and the links", async () => {
    const { store, a, b, entity, colorOf, steps, undo } = await storeWithCubes();
    const assetId = store().createMaterialAsset();
    store().applyMaterialAsset(assetId, [a, b]);
    store().updateMaterialLayer(assetId, store().materials[assetId].layers[1].id, { color: "#654321" });
    const asset = store().materials[assetId];
    const before = steps();

    store().removeMaterialAsset(assetId);

    expect(steps()).toBe(before + 1);
    expect(store().materials).toEqual({});
    expect(entity(a)).not.toHaveProperty("materialAssetId");
    expect(entity(b)).not.toHaveProperty("materialAssetId");
    // They keep the look, each with layers of its own.
    expect(colorOf(a)).toBe("#654321");
    expect(colorOf(b)).toBe("#654321");
    expect(entity(a).materialLayers![1].id).not.toBe(entity(b).materialLayers![1].id);

    undo();
    expect(store().materials[assetId]).toBe(asset);
    expect(entity(a).materialAssetId).toBe(assetId);
    expect(entity(b).materialAssetId).toBe(assetId);

    store().removeMaterialAsset("missing");
    expect(steps()).toBe(before);
  });

  it("gives a duplicate the same asset", async () => {
    const { store, a, colorOf } = await storeWithCubes();
    const assetId = store().createMaterialAsset(a);

    store().duplicateEntity([a]);

    const copy = store().entities.find((each) => each.id === store().selectedEntityIds[0])!;
    expect(copy.id).not.toBe(a);
    expect(copy.materialAssetId).toBe(assetId);
    store().updateMaterialLayer(copy.id, store().materials[assetId].layers[1].id, { color: "#0000ff" });
    expect(colorOf(a)).toBe("#0000ff");
  });

  it("keeps the asset when the objects using it are deleted", async () => {
    const { store, a } = await storeWithCubes();
    const assetId = store().createMaterialAsset(a);

    store().removeEntity([a]);

    expect(store().materials[assetId]).toBeDefined();
  });

  it("changes nothing in a view-only tab", async () => {
    const { store, a, b } = await storeWithCubes();
    const assetId = store().createMaterialAsset();
    store().applyMaterialAsset(assetId, [a]);
    const { entities, materials } = store();
    store().setReadOnly("openElsewhere");

    expect(store().createMaterialAsset()).toBe("");
    expect(store().createMaterialAsset(b)).toBe("");
    store().renameMaterialAsset(assetId, "Other");
    store().applyMaterialAsset(assetId, [b]);
    store().detachMaterialAsset([a]);
    store().addMaterialLayer(assetId, "noise");
    store().updateMaterialLayer(a, materials[assetId].layers[1].id, { color: "#ff00ff" });
    store().removeMaterialAsset(assetId);

    expect(store().entities).toBe(entities);
    expect(store().materials).toBe(materials);
  });

  it("saves and reloads assets and links, and finds a picture used only in an asset", async () => {
    const { store, selectSceneContent, a, b } = await storeWithCubes();
    const assetId = store().createMaterialAsset();
    store().applyMaterialAsset(assetId, [a, b]);
    const hash = "a".repeat(64);
    store().updateMaterialLayer(assetId, store().materials[assetId].layers[0].id, { maps: { normal: { textureAssetId: hash, wrapS: 1000, wrapT: 1000, flipY: false } } });

    const saved = selectSceneContent(store());
    expect(collectAssetRefs(saved.entities)).toEqual([]);
    expect(collectAssetRefs(saved.entities, saved.materials)).toEqual([{ id: hash, kind: "texture" }]);

    const parsed = parseSceneDocument(JSON.parse(JSON.stringify(toSceneDocument(saved))));
    expect(parsed.ok).toBe(true);
    vi.resetModules();
    const reopened = await import("./useEditorStore");
    reopened.useEditorStore.getState().loadScene(parsed.ok ? parsed.content : null);

    const state = reopened.useEditorStore.getState();
    expect(state.materials).toEqual(saved.materials);
    expect(state.entities.find((each) => each.id === a)?.materialAssetId).toBe(assetId);
    expect(reopened.selectDrawnEntities(state).find((each) => each.id === b)?.materialLayers).toBe(state.materials[assetId].layers);
  });
});
