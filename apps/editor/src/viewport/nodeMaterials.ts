/**
 * PURPOSE: The node material (three/webgpu) for each of three's built-in mesh materials, and a copy of
 * a built-in material as its node material, so every object's material is one a TSL layer can be
 * added to.
 *
 * INPUT: A built-in material, as GLTFLoader makes them for an imported model.
 * OUTPUT: `toNodeMaterial`: a new node material with the same values (colours, maps, roughness,
 * clearcoat, transmission, …), or null for a material with no node counterpart here.
 *
 * Node materials keep the built-in ones' `is…Material` flags (three copies them from a default
 * built-in material), so code that tests a flag, as GLTFExporter does, treats both alike. Code that
 * needs to tell the class should test the flag too, not `instanceof`.
 *
 * No store, React or DOM here: the share-link viewer uses it too.
 */

import type * as THREE from "three";
import {
  MeshBasicNodeMaterial,
  MeshLambertNodeMaterial,
  MeshPhongNodeMaterial,
  MeshPhysicalNodeMaterial,
  MeshStandardNodeMaterial,
  MeshToonNodeMaterial,
  type NodeMaterial,
} from "three/webgpu";

/** The node material class for a built-in one, by its flags (most specific first); null for none. */
const nodeClassFor = (material: THREE.Material) => {
  const flags = material as unknown as Record<string, unknown>;
  if (flags.isMeshPhysicalMaterial) return MeshPhysicalNodeMaterial;
  if (flags.isMeshStandardMaterial) return MeshStandardNodeMaterial;
  if (flags.isMeshPhongMaterial) return MeshPhongNodeMaterial;
  if (flags.isMeshToonMaterial) return MeshToonNodeMaterial;
  if (flags.isMeshLambertMaterial) return MeshLambertNodeMaterial;
  if (flags.isMeshBasicMaterial) return MeshBasicNodeMaterial;
  return null;
};

// What a copy keeps of its own: its identity, its class's flags and type, and three's bookkeeping.
const NOT_COPIED = new Set(["uuid", "type", "version", "defines"]);

interface Copyable {
  copy(source: unknown): unknown;
}
const isCopyable = (value: unknown): value is Copyable =>
  typeof value === "object" && value !== null && typeof (value as Copyable).copy === "function" && !(value as { isTexture?: boolean }).isTexture;

/**
 * A node material with `material`'s values, or null when it isn't one of the built-in mesh
 * materials. Textures are shared with `material`, not copied (so disposing `material` doesn't
 * free them); colours and vectors are copied, so the two can change apart.
 */
export const toNodeMaterial = (material: THREE.Material): NodeMaterial | null => {
  if ((material as { isNodeMaterial?: boolean }).isNodeMaterial) return material as unknown as NodeMaterial;
  const NodeClass = nodeClassFor(material);
  if (!NodeClass) return null;
  const copy = new NodeClass();
  const target = copy as unknown as Record<string, unknown>;
  const source = material as unknown as Record<string, unknown>;
  for (const key of Object.keys(source)) {
    if (NOT_COPIED.has(key) || /^is[A-Z]/.test(key) || !(key in copy)) continue;
    const value = source[key];
    const current = target[key];
    if (isCopyable(value) && isCopyable(current)) current.copy(value);
    else if (Array.isArray(value)) target[key] = value.slice();
    else if (key === "userData") target[key] = { ...(value as object) };
    else target[key] = value;
  }
  return copy;
};
