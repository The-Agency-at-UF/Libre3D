import * as THREE from "three";
import { describe, expect, it } from "vitest";

import type { LightingLayer } from "../store/useEditorStore";
import { createTextureDedupCache, deriveMaterialLayers, isJpeg } from "./materialLayers";

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

describe("isJpeg", () => {
  it("tells a JPEG from other images by its first bytes", async () => {
    expect(await isJpeg(new Blob([new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 0x00])]))).toBe(true);
    expect(await isJpeg(new Blob([new Uint8Array([0x89, 0x50, 0x4e, 0x47])]))).toBe(false);
    expect(await isJpeg(new Blob([]))).toBe(false);
  });
});
