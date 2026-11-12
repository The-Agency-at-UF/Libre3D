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

export type MaterialLayerType = "color" | "lighting" | "image" | "depth" | "gradient" | "noise" | "fresnel" | "normal";
export type LightingModel = "none" | "lambert" | "phong" | "physical" | "toon";

// How a layer goes over the layers under it. The stack is drawn bottom to top, and
// `materialLayers[0]` is the top, as the panel lists it. The formulas are the W3C compositing ones,
// on sRGB values (scene/layerStack.ts).
export type BlendMode = "normal" | "multiply" | "screen" | "overlay";

// What every layer has. `opacity` (0-1) is how strongly it shows over the layers under it; the
// object's own see-through-ness is `Entity.opacity`. `enabled` is the row's eye.
// `mask` is the drawer's Mode (Spline's Layer Masking): a Depth, Gradient, Noise or Fresnel layer in
// Mask mode paints nothing, and shows the one layer right under it only where it's light
// (scene/layerStack.ts). Missing = Color mode.
interface LayerBase {
  id: string;
  enabled: boolean;
  opacity: number;
  blendMode: BlendMode;
  mask?: boolean;
}

// A colour with its own alpha (0-1, missing = 1): a ramp stop, a Noise or a Fresnel colour.
// `color` is "#rrggbb", sRGB as picked.
export interface PaintColor {
  color: string;
  alpha?: number;
}

// A ramp's stop (Depth, Gradient): a colour and its place along the ramp, 0-1.
export interface RampStop extends PaintColor {
  position: number;
}

export interface ColorLayer extends LayerBase {
  type: "color";
  color: string;
}

// A picture a Lighting layer's map uses: its bytes are in the texture store under `textureAssetId`,
// like an Image layer's. `flipY` is true for a picture uploaded in the editor (drawn the way up it
// was made); a map from an imported glTF keeps glTF's way (missing). `name` labels it in the map
// dropdowns.
export interface TextureRef {
  textureAssetId: string;
  name?: string;
  wrapS: number;
  wrapT: number;
  flipY?: boolean;
}

/** The maps a Lighting layer can have. */
export type LightingMapSlot = "roughness" | "metalness" | "normal" | "ao" | "emissive" | "bump";

// Shades the layers under it; the layers over it are drawn on the shaded result, unshaded (as in
// Spline). Its opacity is how much shading shows (0 looks unlit, as with the eye off); its blend
// mode stays "normal". It can't be removed, so it also holds the surface's settings and the maps.
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
  // Phong's highlight colour (missing = three's #111111).
  specular?: string;
  // Physical only; off their defaults they take a MeshPhysicalMaterial, as a clearcoat does: how
  // strong the specular reflection is (three's specularIntensity, 1), a velvet sheen (0), a
  // soap-bubble iridescence (0), and the index of refraction (1.5).
  reflectivity?: number;
  sheen?: number;
  iridescence?: number;
  ior?: number;
  // Pictures that feed the shading (roughness and metalness only on Physical). `bumpScale` is how
  // strong the bump map is (missing = 1).
  maps?: Partial<Record<LightingMapSlot, TextureRef>>;
  bumpScale?: number;
}

export type ImageProjection = "uv" | "planar" | "spherical" | "cylindrical" | "triplanar";

// A picture painted on the object, as Spline's Texture layer: a colour layer like the others (its
// alpha is the picture's). It's an image plane's picture, an imported model's colour map, or one
// uploaded or picked in its drawer. The bytes live in the texture store under `textureAssetId`
// ("" while none is picked: it paints nothing). Placed by `projection` (the mesh's UVs, or straight
// along `axis` (planar), around the object (spherical, cylindrical), or from all three sides
// (triplanar)), then `scale` (repeats), `offset` and `rotation` (degrees). `crop` keeps the
// picture's shape instead of stretching it; `sharpness` "pixelated" draws its pixels sharp.
// Before PR 4b an Image layer only filled the material's colour map (and had a `slot`); those are
// converted when a document is read (utils/sceneDocument.ts).
export interface ImageLayer extends LayerBase, TextureRef {
  type: "image";
  projection: ImageProjection;
  axis: "x" | "y" | "z"; // for planar and cylindrical
  sharpness: "smooth" | "pixelated";
  crop: boolean;
  scale: [number, number];
  offset: [number, number];
  rotation: number;
}

// Colours the object by distance, as Spline's Depth layer: each point's distance from the origin,
// straight out ("radial") or along `direction` ("linear"), is placed on the ramp between `near` (its
// first stop) and `far` (its last). The origin is `origin` ("vector": in the object's own space, or
// with `space: "world"` the scene's) or the camera ("camera": radial is the distance to it, linear
// the depth along the view). Drawn per pixel (viewport/layerNodes.ts).
export interface DepthLayer extends LayerBase {
  type: "depth";
  gradientType: "radial" | "linear";
  originType?: "vector" | "camera"; // missing = "vector"
  space?: "local" | "world"; // missing = "local"; for a "vector" origin
  origin: [number, number, number];
  direction: [number, number, number]; // only meaningful when gradientType === "linear"
  near: number;
  far: number;
  stops: RampStop[]; // 2-10
  smooth: boolean; // eased blends between stops
}

// A ramp laid over the object's UVs, as Spline's Gradient layer (its maths: scene/layerStack.ts,
// gradientPosition). `angle` in degrees; `offset` moves it, `morph` bends it.
export interface GradientLayer extends LayerBase {
  type: "gradient";
  gradientType: "linear" | "radial" | "polar";
  stops: RampStop[]; // 2-10
  smooth: boolean;
  angle: number;
  offset: [number, number];
  morph: [number, number];
}

export type NoiseType = "simplex" | "simplexFractal" | "perlin" | "fbm" | "voronoi";
export type VoronoiStyle = "f1" | "f2" | "f2MinusF1" | "smoothBlend" | "edge";

// Swirling 3D noise in the object's own space, as Spline's Noise layer: a domain-warped noise (Inigo
// Quilez's warp, whose constants Spline's Factor A and B defaults are) colouring between four
// colours. `size` stretches it per axis, `scale` zooms in, `movement` animates it (0 = still), and
// `distortion` is how far each of the two warps pushes. Voronoi cells take `voronoiStyle`,
// `smoothness` and `seed`. `lowCut` / `highCut` remap the noise's value. Its maths:
// viewport/layerSources.ts.
export interface NoiseLayer extends LayerBase {
  type: "noise";
  noiseType: NoiseType;
  size: [number, number, number];
  scale: number;
  movement: number;
  colors: [PaintColor, PaintColor, PaintColor, PaintColor];
  distortion: [number, number];
  factorA: [number, number];
  factorB: [number, number];
  voronoiStyle: VoronoiStyle;
  smoothness: number;
  seed: number;
  lowCut: number;
  highCut: number;
}

// A glow where the surface turns away from the camera, as Spline's Fresnel layer: its colour, as
// much as clamp(bias + scale * (1 - |N·V|)^intensity) * factor. Over Lighting it glows.
export interface FresnelLayer extends LayerBase, PaintColor {
  type: "fresnel";
  bias: number;
  scale: number;
  intensity: number;
  factor: number;
}

// Colours each point by the way the surface faces there, as Spline's Normal layer: red, green and
// blue from the normal's X, Y and Z in the scene's space (-1 to 1 as 0 to 1), so the colours stay
// put as the camera orbits. An axis turned off gives 0 in its channel (Spline's Direction X Y Z).
export interface NormalLayer extends LayerBase {
  type: "normal";
  axes: [boolean, boolean, boolean];
}

export type MaterialLayer = ColorLayer | LightingLayer | ImageLayer | DepthLayer | GradientLayer | NoiseLayer | FresnelLayer | NormalLayer;

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
