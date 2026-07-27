import * as THREE from "three";
import { createId } from "./createId";
import { saveTextureAsset } from "./textureAssetStore";
import type {
  ColorLayer,
  ImageLayer,
  ImageSlot,
  LightingLayer,
  LightingModel,
  MaterialLayer,
} from "../store/useEditorStore";

// Turns a parsed glTF THREE.Material into the editable layer stack this codebase
// already uses for primitives (Color + Lighting, plus an Image layer per texture
// map). It's the reverse of ObjectManager.materialClassForModel: read a material,
// emit layers; that function reads layers, builds a material.
//
// TEXTURE EXTRACTION — approach chosen: (A) canvas re-encode.
// Two options were considered for getting the pixel bytes out of an imported
// texture (see the phase plan): (A) draw the already-decoded THREE.Texture.image
// to an OffscreenCanvas and convertToBlob(), or (B) reach into GLTFLoader's parser
// internals (gltf.parser.json.images + buffer-view resolution) for the original
// undecoded bytes. (A) is used here because derivation runs at hydrate time, the
// exact point where GLTFLoader has already handed us decoded THREE.Texture objects
// with .image populated — so (A) needs nothing beyond public THREE API and works
// with whatever the loader decoded. (B) would be byte-perfect (no PNG re-encode)
// but depends on GLTFLoader parser internals that aren't part of its documented
// public surface and shift between three versions; not worth the fragility for an
// MVP. The tradeoff of (A) is a re-encode to PNG (e.g. a source JPEG loses its
// original compression), which is imperceptible for editing purposes.

const createLayerId = (): string => createId("layer");
const createTextureAssetId = (): string => createId("texture");

// Maps a parsed material's class to our LightingModel, mirroring
// ObjectManager.materialClassForModel in reverse. MeshPhysicalMaterial extends
// MeshStandardMaterial and both map to "physical" (advanced physical-only
// features like clearcoat aren't surfaced as layers yet, but the base PBR is).
export function lightingModelForMaterial(material: THREE.Material): LightingModel {
  if (material instanceof THREE.MeshStandardMaterial) return "physical"; // incl. MeshPhysicalMaterial
  if (material instanceof THREE.MeshPhongMaterial) return "phong";
  if (material instanceof THREE.MeshToonMaterial) return "toon";
  if (material instanceof THREE.MeshLambertMaterial) return "lambert";
  return "none"; // MeshBasicMaterial (KHR_materials_unlit) and anything unrecognized
}

function colorLayerFromMaterial(material: THREE.Material): ColorLayer {
  const color = "color" in material && (material as THREE.MeshStandardMaterial).color instanceof THREE.Color
    ? (material as THREE.MeshStandardMaterial).color.getHexString()
    : "ffffff";

  // GLTFLoader already resolves alphaMode into these two THREE properties
  // correctly at parse time (transparent=true for BLEND, alphaTest>0 for
  // MASK) -- reconstruct the effective alphaMode from them rather than
  // needing the raw glTF JSON here.
  const alphaMode: NonNullable<ColorLayer["alphaMode"]> = material.transparent
    ? "BLEND"
    : material.alphaTest > 0
      ? "MASK"
      : "OPAQUE";

  return {
    id: createLayerId(),
    type: "color",
    enabled: true,
    opacity: typeof material.opacity === "number" ? material.opacity : 1,
    color: `#${color}`,
    alphaMode,
    ...(alphaMode === "MASK" ? { alphaCutoff: material.alphaTest } : {}),
    doubleSided: material.side === THREE.DoubleSide,
  };
}

function lightingLayerFromMaterial(material: THREE.Material, model: LightingModel): LightingLayer {
  const std = material as THREE.MeshStandardMaterial;
  const phong = material as unknown as THREE.MeshPhongMaterial;
  const emissive =
    "emissive" in material && (material as THREE.MeshStandardMaterial).emissive instanceof THREE.Color
      ? (material as THREE.MeshStandardMaterial).emissive.getHexString()
      : "000000";
  return {
    id: createLayerId(),
    type: "lighting",
    enabled: true,
    opacity: 1,
    model,
    roughness: typeof std.roughness === "number" ? std.roughness : 0.45,
    metalness: typeof std.metalness === "number" ? std.metalness : 0.08,
    shininess: typeof phong.shininess === "number" ? phong.shininess : 30,
    emissive: `#${emissive}`,
    emissiveIntensity:
      typeof (material as THREE.MeshStandardMaterial).emissiveIntensity === "number"
        ? (material as THREE.MeshStandardMaterial).emissiveIntensity
        : 1,
  };
}

// Re-encodes one decoded texture image to a PNG blob (approach A above). Returns
// null when the image isn't canvas-drawable — e.g. a KTX2/GPU-compressed texture
// with no decoded bitmap — so the caller just skips that image layer and the mesh
// keeps its parsed material rather than the whole import failing.
async function extractTextureBlob(texture: THREE.Texture): Promise<Blob | null> {
  const image = texture.image as
    | ImageBitmap
    | HTMLImageElement
    | HTMLCanvasElement
    | OffscreenCanvas
    | undefined;
  if (!image) return null;

  const width = (image as { width?: number }).width ?? 0;
  const height = (image as { height?: number }).height ?? 0;
  if (!width || !height) return null;

  try {
    const canvas = new OffscreenCanvas(width, height);
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    ctx.drawImage(image as CanvasImageSource, 0, 0);
    return await canvas.convertToBlob({ type: "image/png" });
  } catch (error) {
    console.warn("[Libre3D] Could not extract an imported texture image; skipping that image layer.", error);
    return null;
  }
}

// A cache spanning one import's derivation pass, keyed by underlying image
// identity. glTF materials routinely reuse the same physical image across slots
// and meshes (a shared packed metallic-roughness map is the classic case) — this
// dedupes so each unique image is extracted and saved to OPFS exactly once, with
// one shared textureAssetId. A cached `null` records "extraction already failed"
// so a failing image isn't retried per-slot.
export type TextureDedupCache = Map<unknown, string | null>;
export const createTextureDedupCache = (): TextureDedupCache => new Map();

async function resolveTextureAssetId(texture: THREE.Texture, cache: TextureDedupCache): Promise<string | null> {
  const key: unknown = texture.image ?? texture;
  if (cache.has(key)) return cache.get(key) ?? null;

  const blob = await extractTextureBlob(texture);
  if (!blob) {
    cache.set(key, null);
    return null;
  }
  const id = createTextureAssetId();
  await saveTextureAsset(id, blob);
  cache.set(key, id);
  return id;
}

async function imageLayersFromMaterial(material: THREE.Material, cache: TextureDedupCache): Promise<ImageLayer[]> {
  const std = material as THREE.MeshStandardMaterial;
  const layers: ImageLayer[] = [];

  const add = async (texture: THREE.Texture | null | undefined, slot: ImageSlot): Promise<void> => {
    if (!texture) return;
    const textureAssetId = await resolveTextureAssetId(texture, cache);
    if (!textureAssetId) return;
    layers.push({
      id: createLayerId(),
      type: "image",
      enabled: true,
      opacity: 1,
      textureAssetId,
      slot,
      wrapS: texture.wrapS,
      wrapT: texture.wrapT,
    });
  };

  await add(std.map, "color");
  await add(std.normalMap, "normal");
  // glTF packs metallic + roughness into a single texture Three assigns to both
  // roughnessMap and metalnessMap — emit one "metallicRoughness" layer, not two.
  await add(std.roughnessMap ?? std.metalnessMap, "metallicRoughness");
  await add((material as THREE.MeshStandardMaterial).emissiveMap, "emissive");
  await add(std.aoMap, "ao");

  return layers;
}

// Builds the full editable layer stack (Color + Lighting + Image layers) for one
// imported mesh's material. Pass a shared cache across every mesh in the same
// import so reused images are extracted once.
export async function deriveMaterialLayers(material: THREE.Material, cache: TextureDedupCache): Promise<MaterialLayer[]> {
  const model = lightingModelForMaterial(material);
  const imageLayers = await imageLayersFromMaterial(material, cache);
  return [colorLayerFromMaterial(material), lightingLayerFromMaterial(material, model), ...imageLayers];
}

// Rebuilds a THREE.Texture from a stored blob for an ImageLayer, restoring the
// wrap/colorSpace/flip conventions glTF textures use so the reloaded map renders
// identically to the parsed original.
export async function buildTextureFromLayer(blob: Blob, layer: ImageLayer): Promise<THREE.Texture> {
  const bitmap = await createImageBitmap(blob);
  const texture = new THREE.Texture(bitmap);
  // wrapS/wrapT are persisted as plain numbers (THREE wrap constants); the union
  // type is narrower than number, so assert back to it here.
  texture.wrapS = layer.wrapS as THREE.Wrapping;
  texture.wrapT = layer.wrapT as THREE.Wrapping;
  // glTF stores textures unflipped and Three uploads them with flipY = false; the
  // canvas re-encode preserved that top-left origin, so reload the same way.
  texture.flipY = false;
  texture.colorSpace =
    layer.slot === "color" || layer.slot === "emissive" ? THREE.SRGBColorSpace : THREE.NoColorSpace;
  // Marks this texture as owned by ObjectManager's session cache so the group
  // disposal pass doesn't free it out from under other meshes sharing the id.
  texture.userData.libre3dManaged = true;
  texture.needsUpdate = true;
  return texture;
}
