import * as THREE from "three";
import { MeshBasicNodeMaterial, MeshPhongNodeMaterial, MeshPhysicalNodeMaterial, MeshStandardNodeMaterial } from "three/webgpu";
import { describe, expect, it } from "vitest";
import { toNodeMaterial } from "./nodeMaterials";

describe("toNodeMaterial", () => {
  it("makes each built-in mesh material its node material", () => {
    expect(toNodeMaterial(new THREE.MeshPhysicalMaterial())).toBeInstanceOf(MeshPhysicalNodeMaterial);
    expect(toNodeMaterial(new THREE.MeshStandardMaterial())).toBeInstanceOf(MeshStandardNodeMaterial);
    expect(toNodeMaterial(new THREE.MeshStandardMaterial())).not.toBeInstanceOf(MeshPhysicalNodeMaterial);
    expect(toNodeMaterial(new THREE.MeshPhongMaterial())).toBeInstanceOf(MeshPhongNodeMaterial);
    expect(toNodeMaterial(new THREE.MeshBasicMaterial())).toBeInstanceOf(MeshBasicNodeMaterial);
  });

  it("keeps the built-in flags GLTFExporter tests", () => {
    const copy = toNodeMaterial(new THREE.MeshPhysicalMaterial()) as unknown as THREE.MeshPhysicalMaterial;
    expect(copy.isMeshStandardMaterial).toBe(true);
    expect(copy.isMeshPhysicalMaterial).toBe(true);
  });

  it("copies the values, the physical extras included", () => {
    const map = new THREE.Texture();
    const source = new THREE.MeshPhysicalMaterial({
      color: "#ff3366",
      roughness: 0.2,
      metalness: 0.9,
      emissive: "#112233",
      emissiveIntensity: 2,
      map,
      normalScale: new THREE.Vector2(0.5, 0.25),
      clearcoat: 0.7,
      clearcoatRoughness: 0.1,
      transmission: 0.5,
      sheen: 0.3,
      opacity: 0.6,
      transparent: true,
      side: THREE.DoubleSide,
      alphaTest: 0.4,
      name: "Paint",
    });
    source.userData.note = "kept";
    const copy = toNodeMaterial(source) as unknown as THREE.MeshPhysicalMaterial;

    expect(copy.color.getHexString()).toBe("ff3366");
    expect([copy.roughness, copy.metalness, copy.emissiveIntensity]).toEqual([0.2, 0.9, 2]);
    expect(copy.emissive.getHexString()).toBe("112233");
    expect(copy.map).toBe(map); // shared, not copied
    expect(copy.normalScale.toArray()).toEqual([0.5, 0.25]);
    expect([copy.clearcoat, copy.clearcoatRoughness, copy.transmission, copy.sheen]).toEqual([0.7, 0.1, 0.5, 0.3]);
    expect([copy.opacity, copy.transparent, copy.side, copy.alphaTest]).toEqual([0.6, true, THREE.DoubleSide, 0.4]);
    expect(copy.name).toBe("Paint");
    expect(copy.userData).toEqual({ note: "kept" });
  });

  it("copies colours and vectors, so the two change apart", () => {
    const source = new THREE.MeshStandardMaterial({ color: "#ffffff" });
    const copy = toNodeMaterial(source) as unknown as THREE.MeshStandardMaterial;
    expect(copy.color).not.toBe(source.color);
    copy.color.set("#000000");
    expect(source.color.getHexString()).toBe("ffffff");
    expect(copy.uuid).not.toBe(source.uuid);
  });

  it("hands a node material back as it is, and has nothing for other materials", () => {
    const node = new MeshStandardNodeMaterial();
    expect(toNodeMaterial(node)).toBe(node);
    expect(toNodeMaterial(new THREE.MeshNormalMaterial())).toBeNull();
  });
});
