import * as THREE from "three";
import { MeshStandardNodeMaterial } from "three/webgpu";
import { describe, expect, it } from "vitest";

import { planStack } from "../scene/layerStack";
import type { ColorLayer, DepthLayer, FresnelLayer, GradientLayer, LightingLayer, MaterialLayer } from "../scene/types";
import { createDisplaceLayer, createGlassLayer } from "../scene/entityFactories";
import { applyLayerNodes, syncLayerNodes } from "./layerNodes";

const lighting = (overrides: Partial<LightingLayer> = {}): LightingLayer => ({
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
  ...overrides,
});
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
const gradient = (overrides: Partial<GradientLayer> = {}): GradientLayer => ({
  id: "g",
  type: "gradient",
  enabled: true,
  opacity: 1,
  blendMode: "normal",
  gradientType: "linear",
  stops: [
    { color: "#000000", position: 0 },
    { color: "#ffffff", position: 1 },
  ],
  smooth: false,
  angle: 0,
  offset: [0, 0],
  morph: [0, 0],
  ...overrides,
});
const fresnel: FresnelLayer = { id: "f", type: "fresnel", enabled: true, opacity: 1, blendMode: "screen", color: "#ffffff", bias: 0.1, scale: 1, intensity: 2, factor: 1 };

const stack = (...layers: MaterialLayer[]) => planStack(layers);
const shapeOf = (material: THREE.Material) => (material as unknown as Record<string, unknown>).libre3dLayerStack;

describe("syncLayerNodes", () => {
  it("gives Color layers under Lighting no nodes", () => {
    const material = new MeshStandardNodeMaterial();

    expect(syncLayerNodes(material, stack(lighting(), color("#ff0000", { blendMode: "multiply" }), color("#808080")))).toBe(false);
    expect(applyLayerNodes(material, Object.create(material))).toBeNull();
    expect(material).not.toHaveProperty("libre3dLayerStack");
  });

  it("asks for a new shader when the stack's shape changes, not when a value does", () => {
    const material = new MeshStandardNodeMaterial();

    expect(syncLayerNodes(material, stack(lighting(), depth(), color("#ff0000")))).toBe(true);
    expect(syncLayerNodes(material, stack(lighting(), depth({ opacity: 0.2, far: 4, smooth: true }), color("#00ff00")))).toBe(false);
    expect(syncLayerNodes(material, stack(lighting(), depth({ blendMode: "screen" }), color("#00ff00")))).toBe(true);
    expect(syncLayerNodes(material, stack(lighting({ opacity: 0.5 }), depth({ blendMode: "screen" }), color("#00ff00")))).toBe(true);
    expect(syncLayerNodes(material, stack(lighting({ opacity: 0.3 }), depth({ blendMode: "screen" }), color("#00ff00")))).toBe(false);
    // Another stop count, another type of gradient, a mask: other shaders.
    const stops = [...depth().stops, { color: "#ff0000", position: 0.5 }];
    expect(syncLayerNodes(material, stack(lighting({ opacity: 0.3 }), depth({ blendMode: "screen", stops }), color("#00ff00")))).toBe(true);
    expect(syncLayerNodes(material, stack(lighting(), gradient(), color("#00ff00")))).toBe(true);
    expect(syncLayerNodes(material, stack(lighting(), gradient({ gradientType: "polar" }), color("#00ff00")))).toBe(true);
    expect(syncLayerNodes(material, stack(lighting(), gradient({ mask: true }), color("#00ff00")))).toBe(true);
    expect(syncLayerNodes(material, stack(lighting(), color("#00ff00")))).toBe(true);
    expect(syncLayerNodes(material, stack(lighting(), color("#00ff00")))).toBe(false);
  });

  it("keys the shader by the stack's shape, so two shapes never share one", () => {
    const a = new MeshStandardNodeMaterial();
    const b = new MeshStandardNodeMaterial();
    syncLayerNodes(a, stack(lighting(), depth({ blendMode: "multiply" }), color("#ff0000")));
    syncLayerNodes(b, stack(lighting(), depth({ blendMode: "overlay" }), color("#ff0000")));

    expect(shapeOf(a)).not.toEqual(shapeOf(b));
  });

  it("builds again for another object's space (a path's)", () => {
    const material = new MeshStandardNodeMaterial();
    const plan = stack(lighting(), depth(), color("#ff0000"));
    syncLayerNodes(material, plan);
    expect(syncLayerNodes(material, plan, new THREE.Object3D())).toBe(true);
  });

  it("puts the nodes on what three builds from, never on the material", () => {
    const material = new MeshStandardNodeMaterial();
    syncLayerNodes(material, stack(lighting({ opacity: 0.5 }), depth(), color("#ff0000")));
    const built = Object.create(material);

    expect(applyLayerNodes(material, built)).not.toBeNull();
    expect(built.colorNode).not.toBeNull();
    expect(material.colorNode).toBeNull();
  });

  it("leaves the material's colour to three when only layers over Lighting need nodes", () => {
    const material = new MeshStandardNodeMaterial();
    syncLayerNodes(material, stack(fresnel, lighting(), color("#ff0000")));
    const built = Object.create(material);

    expect(applyLayerNodes(material, built)).not.toBeNull();
    expect(built.colorNode).toBeNull();
  });

  it("moves the surface for Displace, and builds again for another kind of noise", () => {
    const material = new MeshStandardNodeMaterial();
    const displace = createDisplaceLayer();
    expect(syncLayerNodes(material, stack(lighting(), displace, color("#ff0000")))).toBe(true);
    // A value is a number in the shader; another noise is another shader.
    expect(syncLayerNodes(material, stack(lighting(), { ...displace, intensity: 20, scale: 3 }, color("#ff0000")))).toBe(false);
    expect(syncLayerNodes(material, stack(lighting(), { ...displace, displaceType: "voronoi" }, color("#ff0000")))).toBe(true);
    const built = Object.create(material);
    applyLayerNodes(material, built);
    expect(built.positionNode).not.toBeNull();
    expect(material.positionNode).toBeNull();
  });

  it("adds Glass under Lighting after the shading, so what's behind isn't shaded again", () => {
    const material = new MeshStandardNodeMaterial();
    syncLayerNodes(material, stack(lighting(), createGlassLayer(), color("#ff0000")));
    const built = Object.create(material);
    // Lighting at full strength with nothing over it would be three's own ending; the glass's light is added to it.
    expect(applyLayerNodes(material, built)).not.toBeNull();
    expect(built.colorNode).not.toBeNull();
  });
});
