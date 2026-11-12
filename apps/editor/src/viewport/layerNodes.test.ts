import * as THREE from "three";
import { MeshBasicNodeMaterial, MeshStandardNodeMaterial } from "three/webgpu";
import { describe, expect, it } from "vitest";

import { evaluatePlan, planStack } from "../scene/layerStack";
import type { ColorLayer, DepthLayer, LightingLayer, MaterialLayer } from "../scene/types";
import { applyLayerNodes, bakeLayerStacksForExport, syncLayerNodes } from "./layerNodes";

const lighting: LightingLayer = {
  id: "l",
  type: "lighting",
  enabled: true,
  opacity: 1,
  blendMode: "normal",
  model: "phong",
  roughness: 0.45,
  metalness: 0.08,
  shininess: 30,
  emissive: "#000000",
  emissiveIntensity: 1,
};
const color = (hex: string, overrides: Partial<ColorLayer> = {}): ColorLayer => ({
  id: `c-${hex}`,
  type: "color",
  enabled: true,
  opacity: 1,
  blendMode: "normal",
  color: hex,
  ...overrides,
});
const depth = (overrides: Partial<DepthLayer> = {}): DepthLayer => ({
  id: "d",
  type: "depth",
  enabled: true,
  opacity: 0.5,
  blendMode: "multiply",
  gradientType: "radial",
  origin: [0, 0, 0],
  direction: [1, 0, 0],
  near: 0,
  far: 1,
  stops: [
    { color: "#000000", position: 0 },
    { color: "#ffffff", position: 1 },
  ],
  smooth: false,
  ...overrides,
});

const stack = (...layers: MaterialLayer[]) => planStack(layers);

describe("syncLayerNodes", () => {
  it("gives a stack that adds up to one colour no nodes", () => {
    const material = new MeshStandardNodeMaterial();

    expect(syncLayerNodes(material, stack(lighting, color("#ff0000", { blendMode: "multiply" }), color("#808080")), 1)).toBe(false);
    expect(applyLayerNodes(material, Object.create(material))).toBeNull();
    expect(material).not.toHaveProperty("libre3dLayerStack");
  });

  it("asks for a new shader when the stack's shape changes, not when a value does", () => {
    const material = new MeshStandardNodeMaterial();

    expect(syncLayerNodes(material, stack(lighting, depth(), color("#ff0000")), 1)).toBe(true);
    expect(syncLayerNodes(material, stack(lighting, depth({ opacity: 0.2 }), color("#00ff00")), 1)).toBe(false);
    expect(syncLayerNodes(material, stack(lighting, depth({ blendMode: "screen" }), color("#00ff00")), 1)).toBe(true);
    expect(syncLayerNodes(material, stack(lighting, depth({ blendMode: "screen" }), color("#00ff00")), 0.5)).toBe(true);
    expect(syncLayerNodes(material, stack(lighting, color("#00ff00")), 1)).toBe(true);
    expect(syncLayerNodes(material, stack(lighting, color("#00ff00")), 1)).toBe(false);
  });

  it("keys the shader by the stack's shape, so two shapes never share one", () => {
    const a = new MeshStandardNodeMaterial();
    const b = new MeshStandardNodeMaterial();
    syncLayerNodes(a, stack(lighting, depth({ blendMode: "multiply" }), color("#ff0000")), 1);
    syncLayerNodes(b, stack(lighting, depth({ blendMode: "overlay" }), color("#ff0000")), 1);

    expect((a as unknown as Record<string, unknown>).libre3dLayerStack).not.toEqual((b as unknown as Record<string, unknown>).libre3dLayerStack);
  });

  it("puts the nodes on what three builds from, never on the material", () => {
    const material = new MeshStandardNodeMaterial({ vertexColors: true });
    syncLayerNodes(material, stack({ ...lighting, opacity: 0.5 }, depth(), color("#ff0000")), 0.5);
    const built = Object.create(material);

    expect(applyLayerNodes(material, built)).not.toBeNull();
    expect(built.colorNode).not.toBeNull();
    expect(built.vertexColors).toBe(false);
    expect(material.colorNode).toBeNull();
    expect(material.vertexColors).toBe(true);
  });
});

describe("bakeLayerStacksForExport", () => {
  it("bakes the whole stack into a Depth mesh's vertex colours for the export, then puts the ramp back", () => {
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.Float32BufferAttribute([0, 0, 0, 1, 0, 0], 3));
    const ramp = new THREE.Float32BufferAttribute([0, 0, 0, 1, 1, 1], 3);
    geometry.setAttribute("color", ramp);
    const material = new MeshBasicNodeMaterial({ vertexColors: true });
    const plan = stack(lighting, depth(), color("#336699"));
    syncLayerNodes(material, plan, 1);
    const scene = new THREE.Scene().add(new THREE.Mesh(geometry, material));

    const restore = bakeLayerStacksForExport(scene);
    const baked = geometry.getAttribute("color");
    const expected = (rampSrgb: [number, number, number]) => {
      const paint = evaluatePlan(plan, rampSrgb);
      return new THREE.Color().setRGB(paint.rgb[0], paint.rgb[1], paint.rgb[2], THREE.SRGBColorSpace);
    };

    expect(baked).not.toBe(ramp);
    expect(baked.getX(0)).toBeCloseTo(expected([0, 0, 0]).r, 6);
    expect(baked.getZ(1)).toBeCloseTo(expected([1, 1, 1]).b, 6);
    restore();
    expect(geometry.getAttribute("color")).toBe(ramp);
  });

  it("leaves meshes without a Depth stack alone", () => {
    const geometry = new THREE.BoxGeometry();
    const material = new MeshBasicNodeMaterial();
    syncLayerNodes(material, stack(lighting, color("#336699")), 1);
    const scene = new THREE.Scene().add(new THREE.Mesh(geometry, material));
    const before = { ...geometry.attributes };

    bakeLayerStacksForExport(scene)();

    expect(geometry.attributes).toEqual(before);
  });
});
