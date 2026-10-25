import * as THREE from "three";
import { describe, expect, it } from "vitest";

import type { LightingLayer } from "../store/useEditorStore";
import { createTextureDedupCache, deriveMaterialLayers } from "./materialLayers";

const lightingOf = async (material: THREE.Material) =>
  (await deriveMaterialLayers(material, createTextureDedupCache())).find(
    (layer): layer is LightingLayer => layer.type === "lighting",
  );

describe("deriveMaterialLayers", () => {
  it("reads an imported material's clearcoat into its lighting layer", async () => {
    const material = new THREE.MeshPhysicalMaterial({ clearcoat: 0.5, clearcoatRoughness: 0.2 });

    expect(await lightingOf(material)).toMatchObject({ model: "physical", clearcoat: 0.5, clearcoatRoughness: 0.2 });
  });

  it("gives a material without one a clearcoat of 0", async () => {
    expect(await lightingOf(new THREE.MeshStandardMaterial())).toMatchObject({ clearcoat: 0, clearcoatRoughness: 0 });
  });
});
