/**
 * PURPOSE: The data a scene is made of: entities and their material layers, cameras, and the scene,
 * post-processing, and frame settings. Shared by the editor's store, the scene document
 * (utils/sceneDocument.ts), and the share-link viewer (viewport/SceneViewer.ts).
 *
 * Types only, so importing this file loads nothing: the viewer describes a scene without the
 * editor's store. The values a scene starts from are in defaults.ts. Editor state that isn't part
 * of a scene (the pen tool, read-only mode, the store's actions) stays in store/useEditorStore.ts.
 */

import type { PathData, PathStroke } from "../paths/pathGeometry";
import type { ShapeData } from "../paths/shapeGeometry";

export type EntityType = "cube" | "sphere" | "torus" | "plane" | "path" | "shape" | "image" | "directionalLight" | "importedModel" | "group";

export type MaterialLayerType = "color" | "lighting" | "image" | "depth";
export type LightingModel = "none" | "lambert" | "phong" | "physical" | "toon";

// Which glTF texture channel an ImageLayer feeds. "metallicRoughness" is a
// single packed map (green = roughness, blue = metalness) that Three assigns to
// both material.roughnessMap and material.metalnessMap — one layer covers both,
// never split into two.
export type ImageSlot = "color" | "normal" | "metallicRoughness" | "emissive" | "ao";

// How a layer goes over the layers under it. The stack is drawn bottom to top, and
// `materialLayers[0]` is the top, as the panel lists it. The formulas are the W3C compositing ones,
// on sRGB values (scene/layerStack.ts).
export type BlendMode = "normal" | "multiply" | "screen" | "overlay";

// What every layer has. `opacity` (0-1) is how strongly it shows over the layers under it; the
// object's own see-through-ness is `Entity.opacity`. `enabled` is the row's eye.
interface LayerBase {
  id: string;
  enabled: boolean;
  opacity: number;
  blendMode: BlendMode;
}

export interface ColorLayer extends LayerBase {
  type: "color";
  color: string;
}

// Shades everything under it. Its opacity is how much shading shows (0 looks unlit, as with the eye
// off); its blend mode stays "normal". It can't be removed, so it also holds the surface's settings.
export interface LightingLayer extends LayerBase {
  type: "lighting";
  model: LightingModel;
  roughness: number; // only meaningful when model === "physical"
  metalness: number; // only meaningful when model === "physical"
  // A clear lacquer over the material (glTF's KHR_materials_clearcoat), physical only. Above 0 it
  // takes a MeshPhysicalMaterial. Undefined on layers from before it (an imported mesh's then keeps
  // the clearcoat its glTF material came with).
  clearcoat?: number;
  clearcoatRoughness?: number;
  shininess: number; // only meaningful when model === "phong"
  emissive: string;
  emissiveIntensity: number; // ignored when model === "none"
  // The surface (on the Color layer before schema v5). glTF's alpha mode, captured from an imported
  // material so texture-alpha transparency (BLEND) and cutouts (MASK) survive; undefined = "OPAQUE".
  alphaMode?: "OPAQUE" | "MASK" | "BLEND";
  alphaCutoff?: number; // only meaningful when alphaMode === "MASK"
  // Drawn from both sides: flat objects, and imported thin geometry (hair, foliage, fabric).
  doubleSided?: boolean;
}

// A texture map layer, derived from an imported glTF material's maps. The pixel
// data is never stored here (materialLayers is saved in the scene document) — it
// lives in the OPFS texture asset store, referenced by textureAssetId. wrapS/wrapT
// are the THREE wrap constants copied straight off the source texture.
// Until Image is a layer type of its own (task D, PR 4) it only fills its slot, as the imported
// material did: its opacity and blend mode aren't used.
export interface ImageLayer extends LayerBase {
  type: "image";
  textureAssetId: string;
  slot: ImageSlot;
  wrapS: number;
  wrapT: number;
}

// Colours the object by distance (like Spline's Depth layer, Vector origin, Local): each vertex's
// distance from `origin` in the object's own space, straight out ("radial") or along `direction`
// ("linear"), is placed on the ramp between `near` (its first stop) and `far` (its last). It's
// painted as vertex colours (utils/depthColors.ts) and blended over the layers under it like any
// other (viewport/layerNodes.ts); an export bakes the blend into the vertex colours. At most one per
// object.
export interface DepthStop {
  color: string;
  position: number; // 0-1 along the ramp
}

export interface DepthLayer extends LayerBase {
  type: "depth";
  gradientType: "radial" | "linear";
  origin: [number, number, number];
  direction: [number, number, number]; // only meaningful when gradientType === "linear"
  near: number;
  far: number;
  stops: DepthStop[]; // 2-10
  smooth: boolean; // eased blends between stops
}

export type MaterialLayer = ColorLayer | LightingLayer | ImageLayer | DepthLayer;

/** A reusable material: the scene document's `materials` section, by ID (task D, PR 6). */
export interface MaterialAsset {
  id: string;
  name: string;
  layers: MaterialLayer[]; // top first, like an entity's
}

export interface Entity {
  id: string;
  type: EntityType;
  name: string;
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
  color?: string;
  // Top first. Missing on groups, lights, and imported meshes whose layers aren't derived yet.
  materialLayers?: MaterialLayer[];
  // The material asset (scene.materials) the object uses instead of its own layers (task D, PR 6).
  materialAssetId?: string;
  // How see-through the whole object is, 0-1; missing = 1 (the Color layer's opacity before v5).
  opacity?: number;
  assetId?: string;
  sourceFileName?: string;
  visible: boolean;
  locked: boolean;
  parentId?: string | null;
  nodePath?: number[];
  rootEntityId?: string;
  // Paths (type "path", see paths/pathGeometry.ts): the curve, its tube, and how much of it shows
  // in Base (0–1 of its length; states can set their own).
  path?: PathData;
  stroke?: PathStroke;
  trimStart?: number;
  trimEnd?: number;
  // Shapes (type "shape", see paths/shapeGeometry.ts): a filled outline with holes, flat in its own
  // XY plane unless it has an extrusion (its depth) or a bevel.
  shape?: ShapeData;
  extrusion?: number;
  bevel?: number;
  // Images (type "image", see utils/imagePlane.ts): a flat plane as wide for its height as the picture
  // (width / height), which its Image layer shows.
  imageAspect?: number;
}

export interface ImportNodeSpec {
  tempId: string;
  parentTempId: string | null;
  name: string;
  nodePath: number[];
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
}

// How the camera moves in Play (viewport/PlayCamera.ts): it stays put, turns towards the pointer,
// turns by dragging, or turns by itself.
export type PlayCameraMode = "fixed" | "softOrbit" | "orbit" | "autoRotate";

export interface PlayCameraSettings {
  mode: PlayCameraMode;
  range: number; // softOrbit: degrees at the canvas's edge
  smoothness: number; // softOrbit and orbit: 0-1, how slowly it eases
  speed: number; // autoRotate: degrees a second
}

export interface CameraProfile {
  id: string;
  name: string;
  position: [number, number, number];
  target: [number, number, number];
  fov: number;
  near: number;
  far: number;
  zoom: number;
  // Missing (cameras from before it) or partly missing fields are defaults: resolvePlayCamera.
  play?: Partial<PlayCameraSettings>;
}

export type DeepPartial<T> = T extends object ? {
  [P in keyof T]?: DeepPartial<T[P]>;
} : T;

/**
 * Saved with every scene, not rendered yet: nothing reads it, and nothing calls updatePostProcessing.
 * It stays so saved documents keep their shape; post-processing will build on it.
 */
export interface PostProcessingConfig {
  enabled: boolean;
  toneMap: string;
  exposure: number;
  bloom: {
    enabled: boolean;
    intensity: number;
    threshold: number;
    radius: number;
  };
  ssao: {
    enabled: boolean;
    intensity: number;
  };
  dof: {
    enabled: boolean;
    focusDistance: number;
    bokeh: number;
  };
  chromaticAberration: {
    enabled: boolean;
    intensity: number;
  };
  motionBlur: {
    enabled: boolean;
    intensity: number;
  };
  filmGrain: {
    enabled: boolean;
    intensity: number;
  };
  vignette: {
    enabled: boolean;
    intensity: number;
  };
  outline: {
    enabled: boolean;
    color: string;
  };
  colorGrading: {
    enabled: boolean;
    brightness: number;
    contrast: number;
    saturation: number;
  };
}

export interface SceneSettingsConfig {
  bgColor: string;
  bgAlpha: string; // not read yet
  showGrid: boolean;
  wireframe: boolean;
  fogEnabled: boolean;
  showAxisGuides?: boolean;
  // Image-based light from a generated room (viewport/sceneEnvironment.ts): soft fill and reflections
  // for Physical materials. Replaces the ambient light while on. Older scenes open with it off
  // (scene document v4), new ones with it on.
  environment: {
    enabled: boolean;
    intensity: number;
  };
  lights: {
    intensity: number;
    // Not read yet: color, ambientEnabled, directionalEnabled and shadow. They are in every saved
    // document, so they stay until a document change takes them out or something uses them.
    color: string;
    ambientEnabled: boolean;
    directionalEnabled: boolean;
    shadow: string;
  };
  // Not read yet (there is no physics), kept for the same reason as the lights' unread fields.
  physics: {
    enabled: boolean;
    gravityY: number;
    collisionType: string;
  };
}

export type FrameMode = "responsive" | "fixed";
export type FrameSizePreset = "responsive" | "1920x1080" | "1080x1080" | "custom";

export interface FrameSettingsConfig {
  mode: FrameMode;
  preset: FrameSizePreset;
  width: number;
  height: number;
}
