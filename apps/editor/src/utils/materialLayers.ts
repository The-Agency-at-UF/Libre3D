import * as THREE from "three";
import { createId } from "./createId";
import { DEFAULT_METALNESS, DEFAULT_ROUGHNESS } from "../scene/layers";
import { MAX_ASSET_BYTES, hashAsset } from "./sceneAssets";
import type {
  ColorLayer,
  ImageLayer,
  LightingLayer,
  LightingModel,
  MaterialLayer,
  TextureRef,
} from "../scene/types";

// Turns a parsed glTF THREE.Material into the editable layer stack this codebase
// already uses for primitives (Lighting + Color, plus an Image layer per texture
// map), and the object's opacity. It's the reverse of materialClassForLayer (viewport/entityMaterials.ts): read a material,
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

// Whether a material is (or stands for) one of three's built-in classes, by its flag: node
// materials (three/webgpu) carry the flags of the built-in ones they stand for, `instanceof` doesn't
// see them.
const is = (material: THREE.Material, flag: string): boolean => (material as unknown as Record<string, unknown>)[flag] === true;

// Maps a parsed material's class to our LightingModel, mirroring
// materialClassForLayer (viewport/entityMaterials.ts) in reverse. Physical extends
// standard and both map to "physical" (clearcoat is read into the
// lighting layer; other physical-only features like sheen aren't surfaced yet).
function lightingModelForMaterial(material: THREE.Material): LightingModel {
  if (is(material, "isMeshStandardMaterial")) return "physical"; // incl. physical
  if (is(material, "isMeshPhongMaterial")) return "phong";
  if (is(material, "isMeshToonMaterial")) return "toon";
  if (is(material, "isMeshLambertMaterial")) return "lambert";
  return "none"; // basic (KHR_materials_unlit) and anything unrecognized
}

function colorLayerFromMaterial(material: THREE.Material): ColorLayer {
  const color = "color" in material && (material as THREE.MeshStandardMaterial).color instanceof THREE.Color
    ? (material as THREE.MeshStandardMaterial).color.getHexString()
    : "ffffff";

  return {
    id: createLayerId(),
    type: "color",
    enabled: true,
    opacity: 1,
    blendMode: "normal",
    color: `#${color}`,
  };
}

// The surface, kept on the Lighting layer. GLTFLoader already resolves alphaMode into these two
// THREE properties at parse time (transparent=true for BLEND, alphaTest>0 for MASK), so the effective
// alphaMode is read back from them rather than from the raw glTF JSON.
function surfaceFromMaterial(material: THREE.Material): Pick<LightingLayer, "alphaMode" | "alphaCutoff" | "doubleSided"> {
  const alphaMode: NonNullable<LightingLayer["alphaMode"]> = material.transparent
    ? "BLEND"
    : material.alphaTest > 0
      ? "MASK"
      : "OPAQUE";
  return {
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
    blendMode: "normal",
    model,
    roughness: typeof std.roughness === "number" ? std.roughness : DEFAULT_ROUGHNESS,
    metalness: typeof std.metalness === "number" ? std.metalness : DEFAULT_METALNESS,
    clearcoat: is(material, "isMeshPhysicalMaterial") ? (material as THREE.MeshPhysicalMaterial).clearcoat : 0,
    clearcoatRoughness: is(material, "isMeshPhysicalMaterial") ? (material as THREE.MeshPhysicalMaterial).clearcoatRoughness : 0,
    shininess: typeof phong.shininess === "number" ? phong.shininess : 30,
    emissive: `#${emissive}`,
    emissiveIntensity:
      typeof (material as THREE.MeshStandardMaterial).emissiveIntensity === "number"
        ? (material as THREE.MeshStandardMaterial).emissiveIntensity
        : 1,
    ...surfaceFromMaterial(material),
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
// dedupes so each unique image is extracted and saved exactly once, with
// one shared textureAssetId. A cached `null` records "extraction already failed"
// so a failing image isn't retried per-slot. The ID itself is the PNG's content
// hash (sceneAssets.ts), so the same image across imports is also stored once.
export type TextureDedupCache = Map<unknown, string | null>;
export const createTextureDedupCache = (): TextureDedupCache => new Map();

/**
 * Where an extracted texture is kept, under its content hash: the SceneSource's `saveTexture`
 * (viewport/sceneSource.ts). This module never touches storage itself, so the share-link viewer,
 * which runs it too, writes nothing to a visitor's browser.
 */
export type SaveTexture = (assetId: string, blob: Blob) => Promise<void>;

async function resolveTextureAssetId(texture: THREE.Texture, cache: TextureDedupCache, saveTexture: SaveTexture): Promise<string | null> {
  const key: unknown = texture.image ?? texture;
  if (cache.has(key)) return cache.get(key) ?? null;

  const blob = await extractTextureBlob(texture);
  if (!blob || blob.size > MAX_ASSET_BYTES) {
    // Too large to upload with the scene: skip the layer like an image that couldn't be read.
    if (blob) console.warn("[Libre3D] An imported texture is too large to keep; skipping that image layer.");
    cache.set(key, null);
    return null;
  }
  const id = await hashAsset(blob);
  await saveTexture(id, blob);
  cache.set(key, id);
  return id;
}

// The material's pictures: its colour map as an Image layer, the others as the Lighting layer's maps
// (glTF's packed metallic-roughness picture fills both roughness and metalness, as three does).
async function picturesFromMaterial(
  material: THREE.Material,
  cache: TextureDedupCache,
  saveTexture: SaveTexture,
): Promise<{ layers: ImageLayer[]; maps: NonNullable<LightingLayer["maps"]> }> {
  const std = material as THREE.MeshStandardMaterial;
  const refFor = async (texture: THREE.Texture | null | undefined): Promise<TextureRef | null> => {
    if (!texture) return null;
    const textureAssetId = await resolveTextureAssetId(texture, cache, saveTexture);
    return textureAssetId ? { textureAssetId, wrapS: texture.wrapS, wrapT: texture.wrapT } : null;
  };

  const layers: ImageLayer[] = [];
  const color = await refFor(std.map);
  if (color) {
    layers.push({ id: createLayerId(), type: "image", enabled: true, opacity: 1, blendMode: "normal", slot: "color", textureAssetId: color.textureAssetId, wrapS: color.wrapS, wrapT: color.wrapT });
  }

  const maps: NonNullable<LightingLayer["maps"]> = {};
  const normal = await refFor(std.normalMap);
  if (normal) maps.normal = normal;
  const metallicRoughness = await refFor(std.roughnessMap ?? std.metalnessMap);
  if (metallicRoughness) {
    maps.roughness = metallicRoughness;
    maps.metalness = { ...metallicRoughness };
  }
  const emissive = await refFor(std.emissiveMap);
  if (emissive) maps.emissive = emissive;
  const ao = await refFor(std.aoMap);
  if (ao) maps.ao = ao;
  return { layers, maps };
}

/** An imported mesh's editable material: its layer stack, top first, and the object's opacity. */
export interface DerivedMaterial {
  layers: MaterialLayer[];
  opacity: number;
}

// Builds the full editable layer stack (Lighting, Color, then the Image layers) for one imported
// mesh's material, and the object's opacity from the material's. Pass a shared cache across every
// mesh in the same import so reused images are extracted once. Each image goes to `saveTexture`
// under its hash.
export async function deriveMaterialLayers(material: THREE.Material, cache: TextureDedupCache, saveTexture: SaveTexture): Promise<DerivedMaterial> {
  const model = lightingModelForMaterial(material);
  const pictures = await picturesFromMaterial(material, cache, saveTexture);
  const lighting = lightingLayerFromMaterial(material, model);
  if (Object.keys(pictures.maps).length > 0) lighting.maps = pictures.maps;
  return {
    layers: [lighting, colorLayerFromMaterial(material), ...pictures.layers],
    opacity: typeof material.opacity === "number" ? material.opacity : 1,
  };
}

// Whether stored image bytes are a JPEG, by their first bytes (FF D8 FF): a
// stored file has no type to go by.
export async function isJpeg(blob: Blob): Promise<boolean> {
  const bytes = new Uint8Array(await blob.slice(0, 3).arrayBuffer());
  return bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
}

/** How a stored picture is made into a texture: its wrapping, whether it's turned up (see below), and whether it holds colours. */
export interface TextureOptions {
  wrapS: number;
  wrapT: number;
  flipY?: boolean;
  srgb: boolean;
}

// Rebuilds a THREE.Texture from a stored blob (an Image layer's picture, a Lighting map's), restoring
// the wrap/colorSpace/flip conventions glTF textures use so the reloaded map renders identically to
// the parsed original. A colour picture (`srgb`) is in sRGB; data (normals, roughness, …) isn't.
export async function buildTexture(blob: Blob, options: TextureOptions): Promise<THREE.Texture> {
  const bitmap = await createImageBitmap(blob, options.flipY ? { imageOrientation: "flipY" } : undefined);
  const texture = new THREE.Texture(bitmap);
  // wrapS/wrapT are persisted as plain numbers (THREE wrap constants); the union
  // type is narrower than number, so assert back to it here.
  texture.wrapS = options.wrapS as THREE.Wrapping;
  texture.wrapT = options.wrapT as THREE.Wrapping;
  // glTF stores textures unflipped and Three uploads them with flipY = false; the
  // canvas re-encode preserved that top-left origin, so reload the same way. A picture uploaded in
  // the editor is turned when it's decoded (an ImageBitmap can't be flipped on upload), so three's
  // primitives, whose UVs go up, show it the way up it was made.
  texture.flipY = false;
  texture.colorSpace = options.srgb ? THREE.SRGBColorSpace : THREE.NoColorSpace;
  // GLTFExporter writes every texture as a PNG unless told otherwise; a JPEG (an
  // imported photo, utils/importImage.ts) stays one in exports and published
  // scenes, which keeps them several times smaller.
  if (await isJpeg(blob)) texture.userData.mimeType = "image/jpeg";
  // Marks this texture as owned by EntityMaterials' session cache so the group
  // disposal pass doesn't free it out from under other meshes sharing the id.
  texture.userData.libre3dManaged = true;
  texture.needsUpdate = true;
  return texture;
}
