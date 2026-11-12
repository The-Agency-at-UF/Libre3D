import * as THREE from "three";
import { describe, expect, it } from "vitest";

import { collectSlots, objectSlot, objectTexture, objectUniform, setSlotLookup, shaderNode, type Slot } from "./objectValues";

// What three calls a uniform's onObjectUpdate with, for one object drawn.
type Updatable = { value: unknown; update: (frame: { material: THREE.Material }) => void };

describe("objectValues", () => {
  it("lets objects whose stacks share a shader each be drawn with their own values", () => {
    const first = new THREE.MeshBasicMaterial();
    const second = new THREE.MeshBasicMaterial();
    const slots = new Map<THREE.Material, Slot<unknown>[]>([
      [first, []],
      [second, []],
    ]);
    setSlotLookup((material) => slots.get(material));

    // Two stacks of one shape: the first's nodes go in the shared shader.
    const firstColor = collectSlots(slots.get(first)!, () => objectUniform(new THREE.Color("#ff0000")));
    const secondColor = collectSlots(slots.get(second)!, () => objectUniform(new THREE.Color("#0000ff")));
    const shared = shaderNode(firstColor) as unknown as Updatable;
    expect(shared).not.toBe(firstColor);

    shared.update({ material: second });
    expect(shared.value).toBe(secondColor.value);
    shared.update({ material: first });
    expect(shared.value).toBe(firstColor.value);
    expect((firstColor.value as THREE.Color).getHexString()).toBe("ff0000"); // the stack's own stays its own
  });

  it("does the same for a picture", () => {
    const first = new THREE.MeshBasicMaterial();
    const second = new THREE.MeshBasicMaterial();
    const slots = new Map<THREE.Material, Slot<unknown>[]>([
      [first, []],
      [second, []],
    ]);
    setSlotLookup((material) => slots.get(material));
    const red = new THREE.Texture();
    const blue = new THREE.Texture();

    const firstPicture = collectSlots(slots.get(first)!, () => objectSlot(red));
    collectSlots(slots.get(second)!, () => objectSlot(blue));
    const sampler = objectTexture(firstPicture, undefined) as unknown as Updatable;

    sampler.update({ material: second });
    expect(sampler.value).toBe(blue);
  });

  it("refuses a value made outside a stack", () => {
    expect(() => objectUniform(1)).toThrow(/collectSlots/);
  });
});
