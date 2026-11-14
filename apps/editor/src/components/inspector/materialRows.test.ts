import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { createEntity } from "../../scene/entityFactories";
import { createMaterialAssetLayers } from "../../scene/materialAssets";
import type { Entity, MaterialAsset } from "../../scene/types";
import { stubBrowserGlobals } from "../../testing/browserStubs";

// Whose stacks the layer rows edit (materialRows.ts): the selected objects' own, or the material
// assets they use, each once.

beforeEach(() => {
  stubBrowserGlobals();
});

afterEach(() => {
  vi.unstubAllGlobals();
});

// materialRows.ts loads the store, which reads localStorage as it loads: the browser goes in first.
const load = async () => {
  vi.resetModules();
  return import("./materialRows");
};

const asset = (id: string): MaterialAsset => ({ id, name: id, layers: createMaterialAssetLayers() });
const make = (type: "cube" | "path" | "group", id: string, assetId?: string): Entity => ({ ...createEntity(type), id, ...(assetId ? { materialAssetId: assetId, materialLayers: [] } : null) });

describe("ownersFor", () => {
  it("gives an object with layers of its own as its own owner", async () => {
    const { ownersFor } = await load();
    const cube = make("cube", "a");

    expect(ownersFor([cube], {})).toEqual([{ id: "a", layers: cube.materialLayers, entityId: "a", displaceable: true }]);
  });

  it("gives objects on one material asset as one owner: the asset, shown through the first of them", async () => {
    const { ownersFor } = await load();
    const materials = { m: asset("m") };

    const owners = ownersFor([make("cube", "a", "m"), make("cube", "b", "m"), make("cube", "c")], materials);

    expect(owners.map((owner) => [owner.id, owner.entityId])).toEqual([
      ["m", "a"],
      ["c", "c"],
    ]);
    expect(owners[0].layers).toBe(materials.m.layers);
  });

  it("falls back to an object's own layers when its asset is missing, and leaves out what has no material", async () => {
    const { ownersFor } = await load();

    const owners = ownersFor([make("cube", "a", "gone"), make("group", "g")], {});

    expect(owners).toEqual([{ id: "a", layers: [], entityId: "a", displaceable: true }]);
  });

  it("lets a stack be displaced only when every object showing it is a primitive", async () => {
    const { ownersFor, assetOwner } = await load();
    const materials = { m: asset("m") };

    expect(ownersFor([make("cube", "a", "m"), make("path", "p", "m")], materials)[0].displaceable).toBe(false);
    expect(ownersFor([make("cube", "a", "m"), make("cube", "b", "m")], materials)[0].displaceable).toBe(true);
    // An asset on its own (the Material Builder) isn't any one shape.
    expect(assetOwner(materials.m)).toEqual({ id: "m", layers: materials.m.layers, displaceable: false });
  });
});

describe("rowsFor", () => {
  it("shows one stack row by row, keyed by layer", async () => {
    const { rowsFor, assetOwner } = await load();
    const material = asset("m");

    const rows = rowsFor([assetOwner(material)]);

    expect(rows.map((row) => [row.key, row.type, row.index])).toEqual(material.layers.map((layer, index) => [layer.id, layer.type, index]));
    expect(rows[0].pairs).toEqual([{ owner: assetOwner(material), layer: material.layers[0] }]);
  });

  it("shows stacks of the same shape together, and only Lighting and Color for different ones", async () => {
    const { rowsFor, ownersFor } = await load();
    const same = ownersFor([make("cube", "a"), make("cube", "b")], {});
    expect(rowsFor(same).map((row) => [row.type, row.pairs.length, row.index])).toEqual([
      ["lighting", 2, 0],
      ["color", 2, 1],
    ]);

    const fresnel = asset("m");
    fresnel.layers = [{ ...fresnel.layers[1], id: "extra" }, ...fresnel.layers];
    const different = ownersFor([make("cube", "a"), make("cube", "b", "m")], { m: fresnel });
    expect(rowsFor(different).map((row) => [row.key, row.pairs.length, row.index])).toEqual([
      ["lighting", 2, null],
      ["color", 2, null],
    ]);
  });

  it("shows nothing for no stacks, or an empty one", async () => {
    const { rowsFor } = await load();

    expect(rowsFor([])).toEqual([]);
    expect(rowsFor([{ id: "a", layers: [], displaceable: true }])).toEqual([]);
  });
});
