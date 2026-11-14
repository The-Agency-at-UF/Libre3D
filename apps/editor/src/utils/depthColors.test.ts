import { describe, expect, it } from "vitest";
import * as THREE from "three";
import { depthReach } from "./depthColors";

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
