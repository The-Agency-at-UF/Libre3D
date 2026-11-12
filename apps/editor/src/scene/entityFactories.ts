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
import type { CameraProfile, ColorLayer, DepthLayer, Entity, EntityType, LightingLayer, MaterialLayer } from "./types";
import { cloneVector } from "./vec3";

export const ENTITY_DEFAULTS: Record<EntityType, { name: string; color: string }> = {
  cube: {
    name: "Cube",
    color: "#4f8cff",
  },
  sphere: {
    name: "Sphere",
    color: "#3DFFA0",
  },
  torus: {
    name: "Torus",
    color: "#FF7AE0",
  },
  plane: {
    name: "Plane",
    color: "#B39DFF",
  },
  path: {
    name: "Path",
    color: "#FFC24D",
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

// `far` is fitted to the object when the panel can measure it (utils/depthColors.ts, depthReach).
export const createDepthLayer = (far = 2): DepthLayer => ({
  id: createEntityId(),
  type: "depth",
  enabled: true,
  opacity: 1,
  blendMode: "normal",
  gradientType: "radial",
  origin: [0, 0, 0],
  direction: [1, 0, 0],
  near: 0,
  far,
  stops: [
    { color: "#ff3b30", position: 0 },
    { color: "#ffcc00", position: 0.5 },
    { color: "#af52de", position: 1 },
  ],
  smooth: false,
});

// A copy that shares nothing with `layer` (a Depth layer holds arrays).
export const cloneMaterialLayer = (layer: MaterialLayer): MaterialLayer =>
  layer.type === "depth"
    ? { ...layer, origin: cloneVector(layer.origin), direction: cloneVector(layer.direction), stops: layer.stops.map((stop) => ({ ...stop })) }
    : { ...layer };

export const createLightingLayer = (overrides: Partial<LightingLayer> = {}): LightingLayer => ({
  id: createEntityId(),
  type: "lighting",
  enabled: true,
  opacity: 1,
  blendMode: "normal",
  model: "physical",
  roughness: DEFAULT_ROUGHNESS,
  metalness: DEFAULT_METALNESS,
  clearcoat: 0,
  clearcoatRoughness: 0,
  shininess: 30,
  emissive: "#000000",
  emissiveIntensity: 1,
  ...overrides,
});

/**
 * A new object's layers, top first: Lighting, then a Color layer. `lighting` sets the Lighting
 * layer's model and the surface (a flat object's `doubleSided`, a picture's `alphaMode`).
 */
export const createMaterialLayers = (color: string, lighting: Partial<LightingLayer> = {}): MaterialLayer[] => [
  createLightingLayer(lighting),
  createColorLayer(color, 1),
];

/** A layer of `type` in place of `layer`: the same ID, eye, opacity and blend mode, the type's defaults otherwise. */
export const switchLayerType = (layer: MaterialLayer, type: "color" | "depth", depthFar?: number, color = "#ffffff"): MaterialLayer => {
  const shared = { id: layer.id, enabled: layer.enabled, opacity: layer.opacity, blendMode: layer.blendMode };
  if (type === "depth") return { ...createDepthLayer(depthFar !== undefined && depthFar > 0 ? depthFar : undefined), ...shared };
  return { ...createColorLayer(color), ...shared };
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
      : type === "plane"
        ? // flat, so shown from both sides, like a shape or an image
          { materialLayers: createMaterialLayers(ENTITY_DEFAULTS.plane.color, { doubleSided: true }) }
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
