import * as THREE from "three";
import { describe, expect, it } from "vitest";

import { createDisplaceLayer, createEntity } from "../scene/entityFactories";
import type { Entity } from "../scene/types";
import { DISPLACE_DIRECTION } from "./displaceNodes";
import { createPrimitiveGeometry, displaceDetail } from "./entityGeometry";

const displaced = (type: Entity["type"], quality: "low" | "medium" | "high" = "low"): Entity => {
  const entity = createEntity(type);
  return { ...entity, materialLayers: [{ ...createDisplaceLayer(), quality }, ...(entity.materialLayers ?? [])] };
};

describe("displaced primitives", () => {
  it("are built finer, with push directions and tangents, only while they have Displace", () => {
    const plain = createPrimitiveGeometry(createEntity("sphere"));
    const fine = createPrimitiveGeometry(displaced("sphere"));
    expect(fine.getAttribute("position").count).toBeGreaterThan(plain.getAttribute("position").count);
    expect(fine.getAttribute(DISPLACE_DIRECTION)).toBeDefined();
    expect(fine.getAttribute("tangent")).toBeDefined();
    expect(plain.getAttribute(DISPLACE_DIRECTION)).toBeUndefined();
  });

  it("take the finest quality asked, and ignore Displace switched off or on other objects", () => {
    const entity = displaced("cube", "low");
    expect(displaceDetail(entity)).toBe("low");
    expect(displaceDetail({ ...entity, materialLayers: [...entity.materialLayers!, { ...createDisplaceLayer(), quality: "high" }] })).toBe("high");
    expect(displaceDetail({ ...entity, materialLayers: entity.materialLayers!.map((layer) => ({ ...layer, enabled: false })) })).toBeNull();
    expect(displaceDetail(displaced("image"))).toBeNull();
  });

  it("push a cube's points the same way on every face they're on, so its faces don't part", () => {
    const geometry = createPrimitiveGeometry(displaced("cube"));
    const position = geometry.getAttribute("position");
    const direction = geometry.getAttribute(DISPLACE_DIRECTION);
    const seen = new Map<string, THREE.Vector3>();
    let shared = 0;
    for (let i = 0; i < position.count; i++) {
      const key = [position.getX(i), position.getY(i), position.getZ(i)].map((v) => v.toFixed(5)).join(",");
      const here = new THREE.Vector3(direction.getX(i), direction.getY(i), direction.getZ(i));
      expect(here.length()).toBeCloseTo(1, 5);
      const before = seen.get(key);
      if (before) {
        shared++;
        expect(here.distanceTo(before)).toBeLessThan(1e-6);
      } else seen.set(key, here);
    }
    expect(shared).toBeGreaterThan(0);
  });

  it("push a corner of a cube along its diagonal, and a face's middle straight out", () => {
    const geometry = createPrimitiveGeometry(displaced("cube"));
    const position = geometry.getAttribute("position");
    const direction = geometry.getAttribute(DISPLACE_DIRECTION);
    for (let i = 0; i < position.count; i++) {
      const point = new THREE.Vector3(position.getX(i), position.getY(i), position.getZ(i));
      const push = new THREE.Vector3(direction.getX(i), direction.getY(i), direction.getZ(i));
      if (point.equals(new THREE.Vector3(0.5, 0.5, 0.5))) expect(push.distanceTo(new THREE.Vector3(1, 1, 1).normalize())).toBeLessThan(1e-6);
      if (point.equals(new THREE.Vector3(0.5, 0, 0))) expect(push.distanceTo(new THREE.Vector3(1, 0, 0))).toBeLessThan(1e-6);
    }
  });
});
