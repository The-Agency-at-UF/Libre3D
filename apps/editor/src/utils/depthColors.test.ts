import { describe, expect, it } from "vitest";
import * as THREE from "three";
import type { DepthLayer, MaterialLayer } from "../store/useEditorStore";
import { clearDepthColors, depthPaintOf, depthRampHex, depthReach, depthRampPosition, paintDepthColors, sampleDepthRamp, syncDepthColors } from "./depthColors";

const depth = (overrides: Partial<DepthLayer> = {}): DepthLayer => ({
  id: "depth",
  type: "depth",
  enabled: true,
  opacity: 1,
  gradientType: "radial",
  origin: [0, 0, 0],
  direction: [1, 0, 0],
  near: 0,
  far: 2,
  stops: [
    { color: "#000000", position: 0 },
    { color: "#ffffff", position: 1 },
  ],
  smooth: false,
  ...overrides,
});

const colorAt = (attribute: THREE.BufferAttribute, i: number) =>
  new THREE.Color(attribute.getX(i), attribute.getY(i), attribute.getZ(i)).getHexString();

describe("depthRampPosition", () => {
  it("is the distance from the origin between near and far, clamped", () => {
    const layer = depth({ origin: [1, 0, 0], near: 1, far: 3 });
    expect(depthRampPosition(layer, 1, 0, 0)).toBe(0); // closer than near
    expect(depthRampPosition(layer, 1, 2, 0)).toBeCloseTo(0.5);
    expect(depthRampPosition(layer, 1, 0, 5)).toBe(1); // past far
  });

  it("measures along the direction when linear, whatever the direction's length", () => {
    const layer = depth({ gradientType: "linear", direction: [0, 10, 0], far: 4 });
    expect(depthRampPosition(layer, 5, 1, 5)).toBeCloseTo(0.25);
    expect(depthRampPosition(layer, 0, -3, 0)).toBe(0); // behind the origin
  });

  it("steps from first to last at near when near and far meet", () => {
    const layer = depth({ near: 1, far: 1 });
    expect(depthRampPosition(layer, 0.5, 0, 0)).toBe(0);
    expect(depthRampPosition(layer, 1.5, 0, 0)).toBe(1);
  });
});

describe("sampleDepthRamp", () => {
  it("blends each stop into the next, in sRGB, in position order", () => {
    const layer = depth({
      stops: [
        { color: "#0000ff", position: 1 },
        { color: "#ff0000", position: 0 },
        { color: "#00ff00", position: 0.5 },
      ],
    });
    const at = (t: number) => sampleDepthRamp(layer, t).map((c) => Number(c.toFixed(3)));
    expect(at(0)).toEqual([1, 0, 0]);
    expect(at(0.25)).toEqual([0.5, 0.5, 0]);
    expect(at(1)).toEqual([0, 0, 1]);
    expect(depthRampHex(layer, 0.75)).toBe("#008080");
  });

  it("eases each blend when smooth", () => {
    const linear = depth();
    const smooth = depth({ smooth: true });
    expect(sampleDepthRamp(linear, 0.25)[0]).toBeCloseTo(0.25);
    expect(sampleDepthRamp(smooth, 0.25)[0]).toBeCloseTo(0.15625); // 3t² − 2t³
    expect(sampleDepthRamp(smooth, 0.5)[0]).toBeCloseTo(0.5);
  });
});

describe("depthReach", () => {
  it("is the farthest vertex from the object's origin, in hundredths", () => {
    expect(depthReach(new THREE.PlaneGeometry(1, 1, 32, 32))).toBe(0.71);
    expect(depthReach(new THREE.BoxGeometry(1, 1, 1))).toBe(0.87);
    expect(depthReach(new THREE.SphereGeometry(0.5, 32, 16))).toBe(0.5);
    expect(depthReach(new THREE.TorusGeometry(0.55, 0.2, 16, 48))).toBe(0.75);
  });

  it("measures from the origin, not the geometry's centre", () => {
    expect(depthReach(new THREE.PlaneGeometry(1, 1).translate(3, 0, 0))).toBe(3.54); // the corner at (3.5, 0.5)
  });

  it("is null for a geometry with no extent, and never rounds down to 0", () => {
    expect(depthReach(new THREE.BufferGeometry())).toBeNull();
    expect(depthReach(new THREE.PlaneGeometry(0, 0))).toBeNull();
    expect(depthReach(new THREE.PlaneGeometry(0.002, 0.002))).toBe(0.01);
  });
});

describe("depthPaintOf", () => {
  it("is the enabled Depth layer over the Color layer's colour", () => {
    const layers: MaterialLayer[] = [{ id: "c", type: "color", enabled: true, opacity: 1, color: "#123456" }, depth()];
    expect(depthPaintOf(layers)).toEqual({ layer: layers[1], base: "#123456" });
    expect(depthPaintOf([depth({ enabled: false })])).toBeNull();
    expect(depthPaintOf(undefined)).toBeNull();
  });
});

describe("painting a geometry", () => {
  const line = () =>
    new THREE.BufferGeometry().setAttribute("position", new THREE.Float32BufferAttribute([0, 0, 0, 1, 0, 0, 2, 0, 0], 3));

  it("writes each vertex's ramp colour, over the base colour by the layer's opacity", () => {
    const geometry = line();
    paintDepthColors(geometry, { layer: depth({ stops: [{ color: "#ff0000", position: 0 }, { color: "#0000ff", position: 1 }] }), base: "#ffffff" });
    const colors = geometry.getAttribute("color") as THREE.BufferAttribute;
    expect(colorAt(colors, 0)).toBe("ff0000");
    expect(colorAt(colors, 1)).toBe("800080");
    expect(colorAt(colors, 2)).toBe("0000ff");

    paintDepthColors(geometry, { layer: depth({ opacity: 0.5 }), base: "#ffffff" });
    expect(colorAt(geometry.getAttribute("color") as THREE.BufferAttribute, 0)).toBe("808080"); // half black over white
  });

  it("places positions with the given matrix first", () => {
    const geometry = line();
    paintDepthColors(geometry, { layer: depth(), base: "#ffffff" }, new THREE.Matrix4().makeTranslation(2, 0, 0));
    expect(colorAt(geometry.getAttribute("color") as THREE.BufferAttribute, 0)).toBe("ffffff"); // at 2: the last stop
  });

  it("puts back the colours a geometry came with when cleared", () => {
    const geometry = line();
    const own = new THREE.Float32BufferAttribute([1, 0, 0, 1, 0, 0, 1, 0, 0], 3);
    geometry.setAttribute("color", own);
    paintDepthColors(geometry, { layer: depth(), base: "#ffffff" });
    expect(geometry.getAttribute("color")).not.toBe(own);
    clearDepthColors(geometry);
    expect(geometry.getAttribute("color")).toBe(own);

    const plain = line();
    paintDepthColors(plain, { layer: depth(), base: "#ffffff" });
    clearDepthColors(plain);
    expect(plain.getAttribute("color")).toBeUndefined();
  });

  it("skips painting again with the same key", () => {
    const geometry = line();
    const paint = { layer: depth(), base: "#ffffff" };
    syncDepthColors(geometry, paint, "a");
    const colors = geometry.getAttribute("color") as THREE.BufferAttribute;
    colors.setXYZ(0, 0.5, 0.5, 0.5);
    syncDepthColors(geometry, paint, "a");
    expect(colors.getX(0)).toBe(0.5);
    syncDepthColors(geometry, paint, "b");
    expect(colors.getX(0)).toBe(0);
    syncDepthColors(geometry, null, null);
    expect(geometry.getAttribute("color")).toBeUndefined();
  });
});
