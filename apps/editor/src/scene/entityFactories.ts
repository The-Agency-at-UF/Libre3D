/**
 * PURPOSE: Makes and copies a scene's pieces: a new entity of each type with its starting material
 * layers, the layers themselves, camera profiles, and the entities a new scene starts with.
 *
 * INPUT: An entity type, or an entity, layer, or camera profile to copy.
 * OUTPUT: New plain objects that share nothing with what they were made from (vectors, layers,
 * paths, and shapes are copied), ready to go into the store.
 *
 * Pure: nothing here reads or writes the store. The editor's store calls these from its actions;
 * the share-link viewer doesn't need them (it only reads a scene). Depends on the path math, and so
 * on Three.js, for the Add menu's sample path.
 */

import { clonePath, createSamplePath, DEFAULT_STROKE } from "../paths/pathGeometry";
import { cloneShape } from "../paths/shapeGeometry";
import { createId } from "../utils/createId";
import { DEFAULT_CAMERA_PROFILE } from "./defaults";
import { DEFAULT_METALNESS, DEFAULT_ROUGHNESS } from "./layers";
import type {
  CameraProfile,
  ColorLayer,
  DepthLayer,
  DisplaceLayer,
  Entity,
  EntityType,
  FresnelLayer,
  GlassLayer,
  GradientLayer,
  ImageLayer,
  LightingLayer,
  MaterialLayer,
  MaterialLayerType,
  MatcapLayer,
  NoiseLayer,
  NormalLayer,
  RainbowLayer,
} from "./types";
import { cloneVector } from "./vec3";

// A new object's name and colour. 3D objects start white and lit (task D2); the flat ones keep a
// colour of their own and start unlit (FLAT_ENTITY_TYPES).
export const ENTITY_DEFAULTS: Record<EntityType, { name: string; color: string }> = {
  cube: {
    name: "Cube",
    color: "#ffffff",
  },
  sphere: {
    name: "Sphere",
    color: "#ffffff",
  },
  torus: {
    name: "Torus",
    color: "#ffffff",
  },
  plane: {
    name: "Plane",
    color: "#B39DFF",
  },
  path: {
    name: "Path",
    color: "#ffffff",
  },
  shape: {
    name: "Shape",
    color: "#9AA4B2",
  },
  image: {
    name: "Image",
    color: "#ffffff",
  },
  directionalLight: {
    name: "Directional Light",
    color: "#ffffff",
  },
  importedModel: {
    name: "Imported Model",
    color: "#ffffff",
  },
  group: {
    name: "Group",
    color: "#ffffff",
  },
};

export const createColorLayer = (color: string, opacity = 1): ColorLayer => ({
  id: createEntityId(),
  type: "color",
  enabled: true,
  opacity,
  blendMode: "normal",
  color,
});

// The new layer types start as Spline's do (its player's defaults), in Libre3D's units.

// `far` is fitted to the object when the panel can measure it (utils/depthColors.ts, depthReach).
export const createDepthLayer = (far = 2): DepthLayer => ({
  id: createEntityId(),
  type: "depth",
  enabled: true,
  opacity: 1,
  blendMode: "normal",
  gradientType: "radial",
  originType: "vector",
  space: "local",
  origin: [0, 0, 0],
  direction: [1, 0, 0],
  near: 0,
  far,
  stops: [
    { color: "#ffffff", position: 0 },
    { color: "#000000", position: 1 },
  ],
  smooth: false,
});

export const createGradientLayer = (): GradientLayer => ({
  id: createEntityId(),
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
});

export const createNoiseLayer = (): NoiseLayer => ({
  id: createEntityId(),
  type: "noise",
  enabled: true,
  opacity: 1,
  blendMode: "normal",
  noiseType: "simplex",
  size: [1, 1, 1],
  scale: 1,
  movement: 1,
  colors: [{ color: "#666666" }, { color: "#666666" }, { color: "#ffffff" }, { color: "#ffffff" }],
  distortion: [1, 1],
  factorA: [1.7, 9.2],
  factorB: [8.3, 2.8],
  voronoiStyle: "f1",
  smoothness: 0.3,
  seed: 0,
  lowCut: 0,
  highCut: 1,
});

/** A picture layer (`picture` names it; none picked paints nothing yet), placed by the mesh's UVs once. */
export const createImageLayer = (picture: Partial<ImageLayer> = {}): ImageLayer => ({
  id: createEntityId(),
  type: "image",
  enabled: true,
  opacity: 1,
  blendMode: "normal",
  textureAssetId: "",
  wrapS: 1000, // THREE.RepeatWrapping
  wrapT: 1000,
  projection: "uv",
  axis: "y",
  sharpness: "smooth",
  crop: false,
  scale: [1, 1],
  offset: [0, 0],
  rotation: 0,
  ...picture,
});

export const createNormalLayer = (): NormalLayer => ({
  id: createEntityId(),
  type: "normal",
  enabled: true,
  opacity: 1,
  blendMode: "normal",
  axes: [true, true, true],
});

export const createMatcapLayer = (): MatcapLayer => ({
  id: createEntityId(),
  type: "matcap",
  enabled: true,
  opacity: 1,
  blendMode: "normal",
  preset: "clay", // viewport/matcaps.ts, DEFAULT_MATCAP
  rotation: 0,
});

export const createRainbowLayer = (): RainbowLayer => ({
  id: createEntityId(),
  type: "rainbow",
  enabled: true,
  opacity: 1,
  blendMode: "normal",
  frequency: 30,
  movement: 0,
  color: [0, 0, 0],
  noise: 0,
  noiseScale: 1,
  offset: [0, 0, 0],
});

// Spline's defaults (its player, @splinetool/runtime 2.0.178), as its drawer shows them; Glass's Blur
// starts at 5, not Spline's 10, for a clearer first look (Emily, 2026-11-12).
export const createGlassLayer = (): GlassLayer => ({
  id: createEntityId(),
  type: "glass",
  enabled: true,
  opacity: 1,
  blendMode: "normal",
  blur: 5,
  thickness: 10,
  ior: 1.5,
  absorption: "#ffffff",
  absorbDistance: 0,
});

export const createDisplaceLayer = (): DisplaceLayer => ({
  id: createEntityId(),
  type: "displace",
  enabled: true,
  opacity: 1,
  blendMode: "normal",
  displaceType: "simplex",
  scale: 10,
  movement: 1,
  offset: [0, 0, 0],
  intensity: 8,
  voronoiStyle: "f1",
  smoothness: 0.3,
  seed: 0,
  lowCut: 0,
  highCut: 1,
  quality: "medium",
});

export const createFresnelLayer = (): FresnelLayer => ({
  id: createEntityId(),
  type: "fresnel",
  enabled: true,
  opacity: 1,
  blendMode: "normal",
  color: "#ffffff",
  bias: 0.1,
  scale: 1,
  intensity: 2,
  factor: 1,
});

// A copy that shares nothing with `layer` (some layers hold arrays and objects).
export const cloneMaterialLayer = (layer: MaterialLayer): MaterialLayer => {
  switch (layer.type) {
    case "depth":
      return { ...layer, origin: cloneVector(layer.origin), direction: cloneVector(layer.direction), stops: layer.stops.map((stop) => ({ ...stop })) };
    case "gradient":
      return { ...layer, stops: layer.stops.map((stop) => ({ ...stop })), offset: [...layer.offset], morph: [...layer.morph] };
    case "image":
      return { ...layer, scale: [...layer.scale], offset: [...layer.offset] };
    case "normal":
      return { ...layer, axes: [...layer.axes] };
    case "rainbow":
      return { ...layer, color: [...layer.color], offset: [...layer.offset] };
    case "displace":
      return { ...layer, offset: [...layer.offset] };
    case "noise":
      return {
        ...layer,
        size: cloneVector(layer.size),
        colors: layer.colors.map((color) => ({ ...color })) as NoiseLayer["colors"],
        distortion: [...layer.distortion],
        factorA: [...layer.factorA],
        factorB: [...layer.factorB],
      };
    case "lighting":
      return layer.maps
        ? { ...layer, maps: Object.fromEntries(Object.entries(layer.maps).map(([slot, ref]) => [slot, { ...ref }])) }
        : { ...layer };
    default:
      return { ...layer };
  }
};

export const createLightingLayer = (overrides: Partial<LightingLayer> = {}): LightingLayer => ({
  id: createEntityId(),
  type: "lighting",
  enabled: true,
  opacity: 1,
  blendMode: "normal",
  model: "phong",
  roughness: DEFAULT_ROUGHNESS,
  metalness: DEFAULT_METALNESS,
  clearcoat: 0,
  clearcoatRoughness: 0,
  shininess: 30,
  emissive: "#000000",
  emissiveIntensity: 1,
  ...overrides,
});

/** 2D objects: flat, so shown from both sides, and unlit (task D2). Shapes start flat too (an extrusion keeps it). */
export const FLAT_ENTITY_TYPES: readonly EntityType[] = ["plane", "shape", "image"];

/** A new flat object's layers: unlit, both sides, in `color`. */
export const createFlatMaterialLayers = (color: string, lighting: Partial<LightingLayer> = {}): MaterialLayer[] =>
  createMaterialLayers(color, { model: "none", doubleSided: true, ...lighting });

/**
 * A new object's layers, top first: Lighting (Phong unless `lighting` says otherwise), then a Color layer. `lighting` sets the Lighting
 * layer's model and the surface (a flat object's `doubleSided`, a picture's `alphaMode`).
 */
export const createMaterialLayers = (color: string, lighting: Partial<LightingLayer> = {}): MaterialLayer[] => [
  createLightingLayer(lighting),
  createColorLayer(color, 1),
];

/** A new layer of `type` (Color in `color`; Depth reaching `depthFar` when it's above 0). */
export const createPaintLayer = (type: PaintLayerType, depthFar?: number, color = "#ffffff"): MaterialLayer => {
  switch (type) {
    case "depth":
      return createDepthLayer(depthFar !== undefined && depthFar > 0 ? depthFar : undefined);
    case "gradient":
      return createGradientLayer();
    case "noise":
      return createNoiseLayer();
    case "fresnel":
      return createFresnelLayer();
    case "image":
      return createImageLayer();
    case "normal":
      return createNormalLayer();
    case "matcap":
      return createMatcapLayer();
    case "rainbow":
      return createRainbowLayer();
    case "glass":
      return createGlassLayer();
    case "displace":
      return createDisplaceLayer();
    case "color":
    default:
      return createColorLayer(color);
  }
};

/** The types a row can be: every type but Lighting (Displace paints nothing, but sits in the same list, as in Spline). */
export type PaintLayerType = Exclude<MaterialLayerType, "lighting">;

/**
 * A layer of `type` in place of `layer`: the same ID, eye, opacity and blend mode, and its Mode
 * (Mask or Color) when the new type has one; the type's defaults otherwise.
 */
export const switchLayerType = (layer: MaterialLayer, type: PaintLayerType, depthFar?: number, color = "#ffffff"): MaterialLayer => {
  const shared = { id: layer.id, enabled: layer.enabled, opacity: layer.opacity, blendMode: layer.blendMode };
  const mask = type !== "color" && layer.mask ? { mask: true } : null;
  return { ...createPaintLayer(type, depthFar, color), ...shared, ...mask };
};

const ZERO_VECTOR: [number, number, number] = [0, 0, 0];
const UNIT_VECTOR: [number, number, number] = [1, 1, 1];

export const createEntityId = (): string => createId("entity");

export const createEntity = (type: EntityType): Entity => ({
  id: createEntityId(),
  type,
  name: ENTITY_DEFAULTS[type].name,
  position: (type === "directionalLight" ? [5, 8, 4] : [...ZERO_VECTOR]) as [number, number, number],
  rotation: [...ZERO_VECTOR] as [number, number, number],
  scale: [...UNIT_VECTOR] as [number, number, number],
  ...(type === "directionalLight"
    ? { color: ENTITY_DEFAULTS[type].color }
    : type === "group"
      ? null // groups are pure transform pivots — no material, no color
      : FLAT_ENTITY_TYPES.includes(type)
        ? { materialLayers: createFlatMaterialLayers(ENTITY_DEFAULTS[type].color) }
        : { materialLayers: createMaterialLayers(ENTITY_DEFAULTS[type].color) }),
  // The Add menu's path is a sample curve; the Path pen draws its own (addPath).
  ...(type === "path" ? { path: createSamplePath(), stroke: { ...DEFAULT_STROKE }, trimStart: 0, trimEnd: 1 } : null),
  visible: true,
  locked: false,
});

export const initialEntities: Entity[] = [
  createEntity("cube"),
  {
    id: "directional-light-1",
    type: "directionalLight",
    name: "Directional Light",
    position: [5, 8, 4],
    rotation: [0, 0, 0],
    scale: [1, 1, 1],
    color: "#ffffff",
    visible: true,
    locked: false,
  },
];

export const cloneCameraProfile = (profile: CameraProfile): CameraProfile => ({
  ...profile,
  position: cloneVector(profile.position),
  target: cloneVector(profile.target),
  ...(profile.play ? { play: { ...profile.play } } : null),
});

export const createCameraProfile = (id: string, data: Partial<CameraProfile> = {}): CameraProfile => ({
  ...cloneCameraProfile(DEFAULT_CAMERA_PROFILE),
  ...data,
  id,
  name: data.name ?? DEFAULT_CAMERA_PROFILE.name,
  position: cloneVector(data.position ?? DEFAULT_CAMERA_PROFILE.position),
  target: cloneVector(data.target ?? DEFAULT_CAMERA_PROFILE.target),
  fov: data.fov ?? DEFAULT_CAMERA_PROFILE.fov,
  near: data.near ?? DEFAULT_CAMERA_PROFILE.near,
  far: data.far ?? DEFAULT_CAMERA_PROFILE.far,
  zoom: data.zoom ?? DEFAULT_CAMERA_PROFILE.zoom,
});

export const cloneEntity = (entity: Entity): Entity => ({
  ...entity,
  position: cloneVector(entity.position),
  rotation: cloneVector(entity.rotation),
  scale: cloneVector(entity.scale),
  visible: entity.visible ?? true,
  locked: entity.locked ?? false,
  ...(entity.materialLayers ? { materialLayers: entity.materialLayers.map(cloneMaterialLayer) } : null),
  ...(entity.path ? { path: clonePath(entity.path) } : null),
  ...(entity.stroke ? { stroke: { ...entity.stroke } } : null),
  ...(entity.shape ? { shape: cloneShape(entity.shape) } : null),
});

// What a new scene starts with: a fresh cube (new ID) and the default light.
export const createStartingEntities = (): Entity[] => [
  createEntity("cube"),
  ...initialEntities.filter((entity) => entity.type === "directionalLight").map(cloneEntity),
];
