import { describe, expect, it } from "vitest";
import { createEntity } from "./entityFactories";
import { assetOf, canUseMaterialAsset, copyLayers, createMaterialAssetLayers, layersOf, nextMaterialAssetName, opacityOf, resolveEntities, usersOfMaterialAsset } from "./materialAssets";
import type { Entity, MaterialAsset, MaterialLayer } from "./types";

const asset = (id: string, name = "Gloss"): MaterialAsset => ({ id, name, layers: createMaterialAssetLayers() });
const cubeOn = (assetId?: string): Entity => ({ ...createEntity("cube"), ...(assetId ? { materialAssetId: assetId } : null) });

describe("layersOf", () => {
  it("gives the asset's layers to an object that uses one", () => {
    const gloss = asset("m");
    expect(layersOf(cubeOn("m"), { m: gloss })).toBe(gloss.layers);
  });

  it("gives an object without an asset its own layers", () => {
    const cube = cubeOn();
    expect(layersOf(cube, { m: asset("m") })).toBe(cube.materialLayers);
  });

  it("falls back to the object's own layers when the asset is missing or damaged", () => {
    const cube = cubeOn("gone");
    expect(layersOf(cube, {})).toBe(cube.materialLayers);
    expect(layersOf(cube, undefined)).toBe(cube.materialLayers);
    expect(layersOf(cube, { gone: { id: "gone", name: "Broken" } as unknown as MaterialAsset })).toBe(cube.materialLayers);
    expect(assetOf(cube, {})).toBeUndefined();
  });

  it("gives nothing to an object without layers, whatever it names", () => {
    const group: Entity = { ...createEntity("group"), materialAssetId: "m" };
    expect(layersOf(group, { m: asset("m") })).toBeUndefined();
  });
});

describe("resolveEntities", () => {
  it("returns the same list when no object uses an asset", () => {
    const entities = [cubeOn(), createEntity("group")];
    expect(resolveEntities(entities, { m: asset("m") })).toBe(entities);
  });

  it("replaces only the layers of the objects that use an asset", () => {
    const gloss = asset("m");
    const plain = cubeOn();
    const linked = cubeOn("m");
    const [first, second] = resolveEntities([plain, linked], { m: gloss });
    expect(first).toBe(plain);
    expect(second).toEqual({ ...linked, materialLayers: gloss.layers });
    expect(second.materialLayers).toBe(gloss.layers);
    expect(linked.materialLayers).not.toBe(gloss.layers);
  });

  it("gives the same objects back while nothing changed, so the sync can skip them", () => {
    const materials = { m: asset("m"), n: asset("n") };
    const a = cubeOn("m");
    const b = cubeOn("n");
    const first = resolveEntities([a, b], materials);
    expect(resolveEntities([a, b], materials)).toEqual(first);
    // A new list of the same entities (another object was edited): the same drawn entities.
    const again = resolveEntities([a, b, cubeOn()], { ...materials });
    expect(again[0]).toBe(first[0]);
    expect(again[1]).toBe(first[1]);
  });

  it("gives a new object to each user of an edited asset, and to nothing else", () => {
    const materials = { m: asset("m"), n: asset("n") };
    const entities = [cubeOn("m"), cubeOn("m"), cubeOn("n")];
    const before = resolveEntities(entities, materials);
    const edited = { ...materials, m: { ...materials.m, layers: createMaterialAssetLayers() } };
    const after = resolveEntities(entities, edited);
    expect(after[0]).not.toBe(before[0]);
    expect(after[1]).not.toBe(before[1]);
    expect(after[0].materialLayers).toBe(edited.m.layers);
    expect(after[2]).toBe(before[2]);
  });

  it("draws an object from its own layers again when its asset is gone", () => {
    const linked = cubeOn("m");
    expect(resolveEntities([linked], {})[0]).toBe(linked);
  });
});

describe("material asset helpers", () => {
  it("copies a stack under new layer IDs, sharing nothing", () => {
    const layers = createMaterialAssetLayers();
    const copy = copyLayers(layers);
    expect(copy.map((layer) => layer.type)).toEqual(layers.map((layer) => layer.type));
    copy.forEach((layer, index) => {
      expect(layer).not.toBe(layers[index]);
      expect(layer.id).not.toBe(layers[index].id);
      expect({ ...layer, id: layers[index].id }).toEqual(layers[index]);
    });
  });

  it("names new materials Material, Material 2, … skipping names in use", () => {
    expect(nextMaterialAssetName({})).toBe("Material");
    expect(nextMaterialAssetName({ a: asset("a", "Material"), b: asset("b", "Material 3") })).toBe("Material 2");
  });

  it("finds an asset's users", () => {
    const entities = [cubeOn("m"), cubeOn("n"), cubeOn("m"), cubeOn()];
    expect(usersOfMaterialAsset(entities, "m")).toEqual([entities[0], entities[2]]);
  });

  it("lets primitives use an asset, not groups or imported meshes", () => {
    expect(canUseMaterialAsset(cubeOn())).toBe(true);
    expect(canUseMaterialAsset(createEntity("group"))).toBe(false);
    expect(canUseMaterialAsset({ ...cubeOn(), type: "importedModel" })).toBe(false);
  });

  it("draws an object with its asset's opacity, not its own, and its own again without the asset", () => {
    const layers = [{ id: "c", type: "color", color: "#ff0000" }] as unknown as MaterialLayer[];
    const base = { position: [0, 0, 0], rotation: [0, 0, 0], scale: [1, 1, 1], visible: true, locked: false, name: "Cube", type: "cube" } as const;
    const user = { ...base, id: "a", materialAssetId: "m", materialLayers: [], opacity: 0.9 } as unknown as Entity;
    const own = { ...base, id: "b", materialLayers: layers, opacity: 0.9 } as unknown as Entity;
    const faded = { m: { id: "m", name: "M", layers, opacity: 0.3 } };
    const solid = { m: { id: "m", name: "M", layers } };

    expect(resolveEntities([user, own], faded).map((each) => each.opacity)).toEqual([0.3, 0.9]);
    expect(resolveEntities([user, own], solid).map((each) => each.opacity)).toEqual([undefined, 0.9]);
    expect(resolveEntities([user, own], {}).map((each) => each.opacity)).toEqual([0.9, 0.9]);
    expect([opacityOf(user, faded), opacityOf(user, solid), opacityOf(user, {}), opacityOf(own, faded)]).toEqual([0.3, 1, 0.9, 0.9]);
  });

  it("gives a new object to each user when the asset's opacity changes, and the same one when only its name does", () => {
    const layers = [{ id: "c", type: "color", color: "#ff0000" }] as unknown as MaterialLayer[];
    const user = { id: "a", type: "cube", materialAssetId: "m", materialLayers: [] } as unknown as Entity;
    const entities = [user];
    const first = resolveEntities(entities, { m: { id: "m", name: "M", layers } })[0];

    expect(resolveEntities(entities, { m: { id: "m", name: "Renamed", layers } })[0]).toBe(first);
    expect(resolveEntities(entities, { m: { id: "m", name: "M", layers, opacity: 0.5 } })[0]).not.toBe(first);
  });
});
