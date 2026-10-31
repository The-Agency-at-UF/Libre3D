import { ClampToEdgeWrapping, Euler, Vector3 } from "three";
import { create, type StateCreator, type StoreMutatorIdentifier } from "zustand";
import { persist, createJSONStorage, subscribeWithSelector } from "zustand/middleware";
import { temporal } from "zundo";
import { shallow } from "zustand/shallow";
import { getDescendantIds, getChildren, filterMoveRoots, canReparentEntities } from "./entityIndex";
import { createId } from "../utils/createId";
import type { SceneContent, StoredSceneContent } from "../utils/sceneDocument";
import {
  getEntityWorldMatrix,
  solveLocalFromWorld,
  makeTranslationMatrix,
  getWorldPosition,
  type EntityTRS,
} from "../utils/entityTransforms";
import {
  cloneAnimation,
  cloneStateValues,
  createEmptyAnimation,
  createObjectState,
  duplicateStates,
  getViewedState,
  removeStatesOf,
  resolveState,
  type ObjectState,
  type SceneAnimation,
  type StateValueKey,
  type StateValues,
} from "../animation/objectStates";
import { reparentStates, type ParentChange } from "../animation/reparentStates";
import {
  cloneTransition,
  createEvent,
  duplicateEvents,
  removeEventsOf,
  type EventTrigger,
  type SceneEvent,
} from "../animation/events";
import type { TransitionAction } from "../animation/transitions";
import { clonePath, createSamplePath, DEFAULT_STROKE, pathsCenter, type PathData, type PathStroke } from "../paths/pathGeometry";
import { shiftPoints } from "../paths/pathEditing";
import { MIN_IMPORT_RADIUS, type ImportedSvgItem } from "../paths/svgImport";
import { cloneShape, flattenShape, shapeContours, type ShapeData, type ShapeSolid } from "../paths/shapeGeometry";
import { shapeCenterLines, type CenterLines } from "../paths/centerLine";

export type EntityType = "cube" | "sphere" | "torus" | "plane" | "path" | "shape" | "image" | "directionalLight" | "importedModel" | "group";

/**
 * Why the open scene can't be edited here. `openElsewhere`: another tab or device holds its editing
 * lock (useSceneLock.ts). A viewer of a shared scene would be another reason, later.
 */
export type ReadOnlyReason = "openElsewhere";

export type MaterialLayerType = "color" | "lighting" | "image" | "depth";
export type LightingModel = "none" | "lambert" | "phong" | "physical" | "toon";

// Which glTF texture channel an ImageLayer feeds. "metallicRoughness" is a
// single packed map (green = roughness, blue = metalness) that Three assigns to
// both material.roughnessMap and material.metalnessMap — one layer covers both,
// never split into two.
export type ImageSlot = "color" | "normal" | "metallicRoughness" | "emissive" | "ao";

export interface ColorLayer {
  id: string;
  type: "color";
  enabled: boolean;
  opacity: number; // 0-1
  color: string;
  // glTF alpha-blending mode, captured from the source material at derivation
  // time so imported meshes preserve texture-alpha-driven transparency (BLEND)
  // and cutout masking (MASK) instead of only reacting to the scalar opacity
  // above. Undefined for layers on primitives (cube/sphere/torus/plane), which have
  // no glTF material to inherit this from -- treated as "OPAQUE".
  alphaMode?: "OPAQUE" | "MASK" | "BLEND";
  alphaCutoff?: number; // only meaningful when alphaMode === "MASK"
  // glTF doubleSided, captured the same way -- an imported mesh authored as
  // double-sided (thin geometry like hair/foliage/fabric) must stay that way
  // even if its material ever needs a full rebuild (see createMaterialFromLayers).
  doubleSided?: boolean;
}

export interface LightingLayer {
  id: string;
  type: "lighting";
  enabled: boolean;
  opacity: number;
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
}

// A texture map layer, derived from an imported glTF material's maps. The pixel
// data is never stored here (materialLayers is persisted to localStorage) — it
// lives in the OPFS texture asset store, referenced by textureAssetId. wrapS/wrapT
// are the THREE wrap constants copied straight off the source texture.
export interface ImageLayer {
  id: string;
  type: "image";
  enabled: boolean;
  opacity: number;
  textureAssetId: string;
  slot: ImageSlot;
  wrapS: number;
  wrapT: number;
}

// Colours the object by distance (like Spline's Depth layer, Vector origin, Local): each vertex's
// distance from `origin` in the object's own space, straight out ("radial") or along `direction`
// ("linear"), is placed on the ramp between `near` (its first stop) and `far` (its last). It's
// painted as vertex colours (utils/depthColors.ts), so it exports and publishes; over the Color
// layer's colour by `opacity`. At most one per object.
export interface DepthStop {
  color: string;
  position: number; // 0-1 along the ramp
}

export interface DepthLayer {
  id: string;
  type: "depth";
  enabled: boolean;
  opacity: number;
  gradientType: "radial" | "linear";
  origin: [number, number, number];
  direction: [number, number, number]; // only meaningful when gradientType === "linear"
  near: number;
  far: number;
  stops: DepthStop[]; // 2-10
  smooth: boolean; // eased blends between stops
}

export type MaterialLayer = ColorLayer | LightingLayer | ImageLayer | DepthLayer;

export interface Entity {
  id: string;
  type: EntityType;
  name: string;
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
  color?: string;
  materialLayers?: MaterialLayer[];
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

/**
 * The pen tool (viewport/hooks/useViewportPenTool.ts): drawing new shapes or paths ("draw") or editing
 * one path's or shape's points ("edit"). While drawing, `draws` is what it draws: a filled shape (the
 * default) or a tube path. `pathId` is the shape or path being drawn (null while the pen is on
 * between them) or the path or shape edited; `selectedPoints` are the edited path's picked points, indices
 * into its points, in the order they were picked (the last one is the one the gizmo and the Point row
 * show). A shape has several closed outlines (paths/shapeGeometry.ts's shapeContours): `contour` is the
 * one being edited, which `selectedPoints` are in (0 when missing).
 */
export interface PenToolState {
  mode: "draw" | "edit";
  pathId: string | null;
  selectedPoints: number[];
  contour?: number;
  draws?: "shape" | "path";
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

export interface CameraProfile {
  id: string;
  name: string;
  position: [number, number, number];
  target: [number, number, number];
  fov: number;
  near: number;
  far: number;
  zoom: number;
}

type EntityTransformUpdates = Partial<Pick<Entity, "position" | "rotation" | "scale" | "color">> & {
};

export type DeepPartial<T> = T extends object ? {
  [P in keyof T]?: DeepPartial<T[P]>;
} : T;

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
  bgAlpha: string;
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
    color: string;
    ambientEnabled: boolean;
    directionalEnabled: boolean;
    shadow: string;
  };
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

export const initialPostProcessingDefaults: PostProcessingConfig = {
  enabled: true,
  toneMap: "ACES Filmic",
  exposure: 0.00,
  bloom: {
    enabled: true,
    intensity: 40,
    threshold: 0.85,
    radius: 0.4,
  },
  ssao: {
    enabled: false,
    intensity: 25,
  },
  dof: {
    enabled: false,
    focusDistance: 10.0,
    bokeh: 0.30,
  },
  chromaticAberration: {
    enabled: false,
    intensity: 0,
  },
  motionBlur: {
    enabled: false,
    intensity: 0,
  },
  filmGrain: {
    enabled: false,
    intensity: 0,
  },
  vignette: {
    enabled: true,
    intensity: 15,
  },
  outline: {
    enabled: false,
    color: "5865F2",
  },
  colorGrading: {
    enabled: false,
    brightness: 0.00,
    contrast: 0.00,
    saturation: 0.00,
  },
};

export const initialSceneDefaults: SceneSettingsConfig = {
  bgColor: "#0b1020",
  bgAlpha: "100%",
  showGrid: true,
  wireframe: false,
  fogEnabled: false,
  showAxisGuides: false,
  environment: {
    enabled: true,
    intensity: 1,
  },
  lights: {
    intensity: 0.75,
    color: "#ffffff",
    ambientEnabled: true,
    directionalEnabled: true,
    shadow: "Soft",
  },
  physics: {
    enabled: false,
    gravityY: -9.8,
    collisionType: "Mesh",
  },
};

export const initialFrameDefaults: FrameSettingsConfig = {
  mode: "responsive",
  preset: "responsive",
  width: 1920,
  height: 1080,
};

export interface EditorState {
  entities: Entity[];
  selectedEntityIds: string[];
  activeProfileId: string;
  cameraProfiles: Record<string, CameraProfile>;
  setActiveProfile: (id: string) => void;
  addCameraProfile: (id: string, data?: Partial<CameraProfile>) => string;
  deleteCameraProfile: (id: string) => void;
  updateProfileData: (id: string, updates: Partial<CameraProfile>) => void;
  addEntity: (type: EntityType) => string;
  addImportedModelHierarchy: (assetId: string, nodes: ImportNodeSpec[]) => string;
  duplicateEntity: (ids: string[]) => void;
  removeEntity: (ids: string[]) => void;
  reparentEntities: (ids: string[], newParentId: string | null, index?: number) => void;
  groupEntities: (ids: string[]) => string;
  ungroupEntity: (id: string) => void;
  applyHierarchyPrune: (
    removedIds: Set<string>,
    updates: Map<string, { position: [number, number, number]; rotation: [number, number, number]; scale: [number, number, number]; parentId: string | null }>,
  ) => void;
  updateEntityTransform: (id: string, updates: EntityTransformUpdates) => void;
  updateMultipleEntityTransforms: (updates: Record<string, EntityTransformUpdates>) => void;
  selectEntity: (id: string | null, multi?: boolean) => void;
  selectEntities: (ids: string[], mode?: "replace" | "add" | "subtract") => void;
  toggleVisibility: (id: string) => void;
  toggleLock: (id: string) => void;
  renameEntity: (id: string, newName: string) => void;
  renameEntities: (updates: Record<string, string>) => void;
  // The radius or cap style of every path among `ids`, in one undo step (not their trim, which
  // states can set: see updateShownTransforms).
  updatePathStrokes: (ids: string[], updates: Partial<PathStroke>) => void;
  // A shape the pen tool drew: one outline (`outline`, in the shape's own XY plane, so turned by
  // `rotation`), its origin at `origin`. Filled in the default shape colour from both sides, like an
  // imported one. Selected, like addEntity. Returns its ID.
  addShape: (origin: [number, number, number], rotation: [number, number, number], outline: PathData) => string;
  // A path the pen tool drew (the Path pen), its origin at `origin` and its points relative to it.
  // Selected, like addEntity. Returns its ID.
  addPath: (origin: [number, number, number], path: PathData) => string;
  // Replaces a path's points (the pen tool's edits; see paths/pathEditing.ts). The points belong to
  // the path, not to a state, so this changes them in every state.
  updatePath: (id: string, path: PathData) => void;
  // Replaces a shape's outlines (the pen tool's edits). Flat: their points' and handles' Z is dropped.
  updateShape: (id: string, shape: ShapeData) => void;
  // Moves a path's or shape's origin to the middle of its curves (pathsCenter) without moving it on
  // screen: its points shift one way and its position the other. Its states keep their transforms,
  // so it's for one that has none yet: the pen tool's, as it finishes drawing one.
  centerOrigin: (id: string) => void;
  // The shapes and paths of an imported SVG (paths/svgImport.ts), in one undo step: one named `name`,
  // or several ("Shape 1", "Path 1", …) in a group named `name`. Selects it and puts the pen down.
  // Returns its ID ("" when there's nothing to add).
  addImportedSvg: (name: string, items: ImportedSvgItem[]) => string;
  // An imported picture (utils/importImage.ts) as a plane named `name`, at the origin: `aspect` is its
  // width / height, and `textureAssetId` its bytes in the texture store, shown unlit from both sides
  // and blended when it has see-through pixels (`transparent`). Selects it and puts the pen down.
  // Returns its ID.
  addImagePlane: (name: string, textureAssetId: string, aspect: number, transparent: boolean) => string;
  // The extrusion (depth) or bevel of every shape among `ids`, in one undo step.
  updateShapeSolids: (ids: string[], updates: Partial<ShapeSolid>) => void;
  // Convert to Path: every shape among `ids` and inside them (an import selects its group) becomes
  // a path along the middle of its strokes (paths/centerLine.ts), with a tube as thick as the
  // strokes, in one undo step. A shape keeps its ID, name, place, material, states and events; when
  // it has several strokes, the others become paths next to it ("Shape 1 (2)"). Returns how many
  // shapes were converted.
  convertShapesToPaths: (ids: string[]) => number;

  // Viewport / Projection
  activeTransformTool: "translate" | "rotate" | "scale";
  // Drawing or editing paths (see PenToolState), or null. Not saved and not undoable; off in Play,
  // during a ▶ preview, and while view only.
  penTool: PenToolState | null;
  setPenTool: (penTool: PenToolState | null) => void;
  // Editing an object's Depth layer in the viewport (useViewportDepthGizmo): its handles show, and
  // the transform gizmo moves the layer's origin instead of the object. The object's ID, or null.
  // Not saved and not undoable; off like the pen, and the pen and it end each other.
  depthEdit: string | null;
  setDepthEdit: (entityId: string | null) => void;
  projectionMode: "perspective" | "orthographic";
  transformSpace: "world" | "local";

  sceneSettings: SceneSettingsConfig;
  postProcessing: PostProcessingConfig;

  // Frame
  hudOverlay: string;
  viewportZoom: number;
  frame: FrameSettingsConfig;

  // Play Mode / Preview
  isPreviewMode: boolean;
  setPreviewMode: (active: boolean) => void;
  // The transition the Edit Event panel's ▶ is playing in the editor viewport (useViewportPlay), by
  // action ID, or null. Not saved and not undoable, and allowed in a view-only scene: it's looking.
  previewingActionId: string | null;
  setPreviewingAction: (actionId: string | null) => void;

  // Number of .glb imports currently being read/parsed (file picked but
  // entities not yet materialized). Not persisted — like isPreviewMode it's
  // transient session state that happens to need cross-component visibility.
  pendingImportCount: number;
  adjustPendingImports: (delta: number) => void;

  // Why the scene can't be edited right now; null when it can. While set, updates that would change
  // the scene's content are dropped (see guardSceneContent). Not persisted and not undoable: the
  // editor sets it each time it opens a scene and whenever the editing lock moves.
  readOnlyReason: ReadOnlyReason | null;
  setReadOnly: (reason: ReadOnlyReason | null) => void;

  // Object states and events (see animation/objectStates.ts and animation/events.ts). Saved with the
  // scene and undoable.
  animation: SceneAnimation;
  // The state each object is shown in while editing (entity ID → state ID; no entry = Base). It
  // stays when the object is deselected, and is saved with the scene so it reopens as it was left.
  // Not undoable, and allowed while read-only (looking at a state changes nothing). Read it through
  // selectViewedObjectState, which treats an entry whose state is gone (deleted, undone) as Base.
  viewedStates: Record<string, string>;
  // Shows an object in one of its states, or in Base (null).
  setViewedState: (entityId: string, stateId: string | null) => void;
  // Adds "State N" (setting nothing yet) to an object and views it, like addEntity selects. Returns its ID.
  addState: (entityId: string) => string;
  renameState: (stateId: string, name: string) => void;
  removeState: (stateId: string) => void;
  // Sets values in a state, leaving the ones not passed as they are.
  setStateValues: (stateId: string, values: StateValues) => void;
  // Transform edits from the inspector and the gizmo: each object's go to the state it's shown in,
  // or to its own values in Base. One undo step for all of them.
  updateShownTransforms: (updates: Record<string, StateValues>) => void;
  // "Reset to Base": the state stops setting that value, so it follows the object's own again.
  clearStateValue: (stateId: string, key: StateValueKey) => void;
  // Adds an event to an object, last in its list, with one transition of the object. Returns its ID.
  addEvent: (ownerId: string, trigger: EventTrigger) => string;
  // Changes an event's trigger or replaces its actions (a list edited as a whole).
  updateEvent: (eventId: string, updates: { trigger?: EventTrigger; actions?: TransitionAction[] }) => void;
  removeEvent: (eventId: string) => void;

  updatePostProcessing: (updates: DeepPartial<PostProcessingConfig>) => void;
  updateSceneSettings: (updates: DeepPartial<SceneSettingsConfig>) => void;
  updateFrameSettings: (updates: DeepPartial<FrameSettingsConfig>) => void;
  addMaterialLayer: (entityId: string, layerType: MaterialLayerType) => void;
  removeMaterialLayer: (entityId: string, layerId: string) => void;
  updateMaterialLayer: (entityId: string, layerId: string, updates: Partial<MaterialLayer>) => void;
  updateMultipleEntityMaterialLayers: (updates: Record<string, { layerId: string; updates: Partial<MaterialLayer> }>) => void;
  setEntityMaterialLayers: (entityId: string, layers: MaterialLayer[]) => void;
  // Replaces the whole scene with a saved one (null = a new scene's starting content) and clears
  // undo history, so Ctrl+Z can't reach into the previously open scene.
  loadScene: (content: StoredSceneContent | null) => void;
  setEditorState:(updates: Partial<Omit<EditorState, "entities" | "animation" | "selectedEntityIds" | "addEntity" | "addImportedModelHierarchy" | "removeEntity" | "updateEntityTransform" | "updateMultipleEntityTransforms" | "selectEntity" | "selectEntities" | "toggleVisibility" | "toggleLock" | "renameEntity" | "updatePostProcessing" | "updateSceneSettings" | "setEditorState" | "setActiveProfile" | "addCameraProfile" | "updateProfileData" | "setPreviewMode" | "setPreviewingAction" | "addMaterialLayer" | "removeMaterialLayer" | "updateMaterialLayer" | "updateMultipleEntityMaterialLayers" | "setEntityMaterialLayers">>) => void;
}

const ENTITY_DEFAULTS: Record<EntityType, { name: string; color: string }> = {
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

const MANDATORY_LAYER_TYPES: MaterialLayerType[] = ["color", "lighting"];

const createColorLayer = (color: string, opacity = 1): ColorLayer => ({
  id: createEntityId(),
  type: "color",
  enabled: true,
  opacity,
  color,
});

export const createDepthLayer = (): DepthLayer => ({
  id: createEntityId(),
  type: "depth",
  enabled: true,
  opacity: 1,
  gradientType: "radial",
  origin: [0, 0, 0],
  direction: [1, 0, 0],
  near: 0,
  far: 2,
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

const createLightingLayer = (overrides: Partial<LightingLayer> = {}): LightingLayer => ({
  id: createEntityId(),
  type: "lighting",
  enabled: true,
  opacity: 1,
  model: "physical",
  roughness: 0.45,
  metalness: 0.08,
  clearcoat: 0,
  clearcoatRoughness: 0,
  shininess: 30,
  emissive: "#000000",
  emissiveIntensity: 1,
  ...overrides,
});

const createDefaultMaterialLayers = (color: string): MaterialLayer[] => [
  createColorLayer(color, 1),
  createLightingLayer(),
];

const ZERO_VECTOR: [number, number, number] = [0, 0, 0];
const UNIT_VECTOR: [number, number, number] = [1, 1, 1];
const DEFAULT_CAMERA_PROFILE_ID = "personal";

export const DEFAULT_CAMERA_PROFILE: CameraProfile = {
  id: "personal",
  name: "Personal Camera",
  position: [0, 5, 10],
  target: [0, 0, 0],
  fov: 45,
  near: 0.1,
  far: 1000,
  zoom: 1,
};

const createEntityId = (): string => createId("entity");

const createEntity = (type: EntityType): Entity => ({
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
          { materialLayers: [{ ...createColorLayer(ENTITY_DEFAULTS.plane.color, 1), doubleSided: true }, createLightingLayer()] }
        : { materialLayers: createDefaultMaterialLayers(ENTITY_DEFAULTS[type].color) }),
  // The Add menu's path is a sample curve; the Path pen draws its own (addPath).
  ...(type === "path" ? { path: createSamplePath(), stroke: { ...DEFAULT_STROKE }, trimStart: 0, trimEnd: 1 } : null),
  visible: true,
  locked: false,
});

const initialEntities: Entity[] = [
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

const cloneVector = (vector: [number, number, number]): [number, number, number] => [
  vector[0],
  vector[1],
  vector[2],
];

const cloneCameraProfile = (profile: CameraProfile): CameraProfile => ({
  ...profile,
  position: cloneVector(profile.position),
  target: cloneVector(profile.target),
});

const createCameraProfile = (id: string, data: Partial<CameraProfile> = {}): CameraProfile => ({
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

const cloneEntity = (entity: Entity): Entity => ({
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

/** The parts of the state that are saved as the scene (see utils/sceneDocument.ts). */
export const selectSceneContent = (state: EditorState): SceneContent => ({
  entities: state.entities,
  sceneSettings: state.sceneSettings,
  postProcessing: state.postProcessing,
  frame: state.frame,
  cameraProfiles: state.cameraProfiles,
  activeProfileId: state.activeProfileId,
  animation: state.animation,
  viewedStates: state.viewedStates,
});

/** The state an object is shown in, or null when it's shown in Base (see `viewedStates`). */
export const selectViewedObjectState = (state: EditorState, entityId: string): ObjectState | null =>
  getViewedState(state.viewedStates, state.animation.states, entityId);

// The `animation` part of an update that replaces its states, its events, or both, or nothing when
// neither changed.
const withAnimation = (animation: SceneAnimation, changes: Partial<SceneAnimation>) => {
  const { states = animation.states, events = animation.events } = changes;
  return states === animation.states && events === animation.events ? null : { animation: { ...animation, states, events } };
};

// The update that replaces one event through `update`, or no change when it's gone.
const updatingEvent = (
  state: EditorState,
  eventId: string,
  update: (event: SceneEvent) => SceneEvent,
): Partial<EditorState> => {
  const event = state.animation.events[eventId];
  return event ? withAnimation(state.animation, { events: { ...state.animation.events, [eventId]: update(event) } })! : {};
};

// The update that replaces one state through `update`, or no change when it's gone.
const updatingState = (
  state: EditorState,
  stateId: string,
  update: (objectState: ObjectState) => ObjectState,
): Partial<EditorState> => {
  const objectState = state.animation.states[stateId];
  return objectState ? withAnimation(state.animation, { states: { ...state.animation.states, [stateId]: update(objectState) } })! : {};
};

// Where an object's parent is in the world, from the stored tree (null = the scene).
const getParentWorld = (entities: Entity[], parentId: string | null | undefined) =>
  parentId ? getEntityWorldMatrix(entities, parentId) : null;

// What a new scene starts with: a fresh cube (new ID) and the default light.
const createStartingEntities = (): Entity[] => [
  createEntity("cube"),
  ...initialEntities.filter((entity) => entity.type === "directionalLight").map(cloneEntity),
];

function deepMerge(target: any, source: any): any {
  const result = { ...target };
  for (const key in source) {
    if (Object.prototype.hasOwnProperty.call(source, key)) {
      const sourceVal = source[key];
      if (sourceVal !== null && typeof sourceVal === "object" && !Array.isArray(sourceVal)) {
        result[key] = deepMerge(target[key] || {}, sourceVal);
      } else {
        result[key] = sourceVal;
      }
    }
  }
  return result;
}

// What read-only mode protects: the scene's content, less its cameras. Moving the view (and picking
// a camera) is how you look at a scene you can't edit, and nothing is saved while read-only; the
// scene is reloaded from the cloud before editing resumes.
const PROTECTED_SCENE_KEYS = ["entities", "sceneSettings", "postProcessing", "frame", "animation"] as const;

// What persist saves in this browser (partialize): editor preferences only. The scene is saved per
// scene in the cloud.
const PERSISTED_PREFERENCES = [
  "activeTransformTool",
  "projectionMode",
  "transformSpace",
  "hudOverlay",
  "viewportZoom",
] as const satisfies readonly (keyof EditorState)[];

/**
 * Middleware between persist and the store's actions: while `readOnlyReason` is set, an update that
 * would change the scene's content is dropped whole (nothing half-applied, nothing recorded for
 * undo). This is the backstop behind the UI's disabled controls, since every action, hotkey, and
 * viewport gesture writes through the `set` it hands the actions. `loadScene` and `setReadOnly`
 * write with `api.setState`, which it doesn't touch. Undo also bypasses it (zundo writes from
 * outside), which is why entering read-only clears the history.
 */
const guardSceneContent =
  <T extends EditorState, Mps extends [StoreMutatorIdentifier, unknown][] = [], Mcs extends [StoreMutatorIdentifier, unknown][] = []>(
    creator: StateCreator<T, Mps, Mcs>,
  ): StateCreator<T, Mps, Mcs> =>
  (set, get, api) => {
    const guardedSet = ((partial: unknown, replace?: boolean) => {
      // get() is still undefined while create() builds the initial state.
      const state = get() as T | undefined;

      if (!state?.readOnlyReason) {
        return (set as (partial: unknown, replace?: boolean) => void)(partial, replace);
      }

      const next = (typeof partial === "function" ? partial(state) : partial) as Partial<EditorState> | null;

      if (next && PROTECTED_SCENE_KEYS.some((key) => key in next && next[key] !== state[key])) {
        return;
      }

      return (set as (partial: unknown, replace?: boolean) => void)(next, replace);
    }) as typeof set;

    return creator(guardedSet, get, api);
  };

export const useEditorStore = create<EditorState>()(
  subscribeWithSelector(
    temporal(
      persist(
        guardSceneContent((set, get, api) => ({
          entities: initialEntities.map(cloneEntity),
          selectedEntityIds: [],
          activeProfileId: DEFAULT_CAMERA_PROFILE_ID,
          cameraProfiles: {
            [DEFAULT_CAMERA_PROFILE_ID]: cloneCameraProfile(DEFAULT_CAMERA_PROFILE),
          },
          setActiveProfile: (id) => set({ activeProfileId: id }),
          addCameraProfile: (id, data = {}) => {
            set((state) => {
              const nextProfile = createCameraProfile(id, data);
              return {
                cameraProfiles: {
                  ...state.cameraProfiles,
                  [id]: nextProfile,
                },
                activeProfileId: id,
              };
            });

            return id;
          },
          deleteCameraProfile: (id) =>
            set((state) => {
              if (id === DEFAULT_CAMERA_PROFILE_ID || !state.cameraProfiles[id]) {
                return state;
              }

              const nextCameraProfiles = { ...state.cameraProfiles };
              delete nextCameraProfiles[id];

              return {
                cameraProfiles: nextCameraProfiles,
                activeProfileId: state.activeProfileId === id ? DEFAULT_CAMERA_PROFILE_ID : state.activeProfileId,
              };
            }),
          updateProfileData: (id, updates) =>
            set((state) => {
              const existingProfile = state.cameraProfiles[id] ?? createCameraProfile(id);
              const nextProfile: CameraProfile = {
                ...existingProfile,
                ...updates,
                position: updates.position ? cloneVector(updates.position) : cloneVector(existingProfile.position),
                target: updates.target ? cloneVector(updates.target) : cloneVector(existingProfile.target),
              };

              return {
                cameraProfiles: {
                  ...state.cameraProfiles,
                  [id]: nextProfile,
                },
              };
            }),
          addEntity: (type) => {
            let newId = "";
            set((state) => {
              const entity = createEntity(type);
              newId = entity.id;

              return {
                entities: [...state.entities, entity],
                selectedEntityIds: [entity.id],
              };
            });
            return newId;
          },
          addImportedModelHierarchy: (assetId, nodes) => {
            let rootRealId = "";
            set((state) => {
              const rootNode = nodes.find((node) => node.parentTempId === null);
              if (!rootNode) return state;

              const tempToReal = new Map<string, string>();
              nodes.forEach((node) => tempToReal.set(node.tempId, createEntityId()));
              rootRealId = tempToReal.get(rootNode.tempId)!;

              const newEntities: Entity[] = nodes.map((node) => {
                const isRoot = node.tempId === rootNode.tempId;
                return {
                  id: tempToReal.get(node.tempId)!,
                  type: "importedModel",
                  name: node.name,
                  position: cloneVector(node.position),
                  rotation: cloneVector(node.rotation),
                  scale: cloneVector(node.scale),
                  parentId: node.parentTempId ? tempToReal.get(node.parentTempId) ?? null : null,
                  nodePath: [...node.nodePath],
                  rootEntityId: rootRealId,
                  ...(isRoot ? { assetId, sourceFileName: node.name } : {}),
                  visible: true,
                  locked: false,
                };
              });

              return {
                entities: [...state.entities, ...newEntities],
                selectedEntityIds: [rootRealId],
              };
            });
            return rootRealId;
          },
          duplicateEntity: (ids) => {
            set((state) => {
              const requestedRootIds = new Set(ids);
              const cloneOrder: string[] = [];
              const seen = new Set<string>();

              ids.forEach((id) => {
                if (!state.entities.some((e) => e.id === id)) return;
                if (!seen.has(id)) {
                  seen.add(id);
                  cloneOrder.push(id);
                }
                getDescendantIds(state.entities, id).forEach((descId) => {
                  if (!seen.has(descId)) {
                    seen.add(descId);
                    cloneOrder.push(descId);
                  }
                });
              });

              if (cloneOrder.length === 0) return state;

              const idMap = new Map<string, string>();
              cloneOrder.forEach((id) => idMap.set(id, createEntityId()));

              // A requested copy is set a little apart from its original (its states too).
              const copyOffset: [number, number, number] = [0.5, 0, 0.5];
              const copyOffsets = new Map(
                cloneOrder.filter((id) => requestedRootIds.has(id)).map((id) => [id, copyOffset] as const),
              );

              const newEntities: Entity[] = cloneOrder.map((id) => {
                const original = state.entities.find((e) => e.id === id)!;
                const isRequestedRoot = requestedRootIds.has(id);
                const newParentId = original.parentId ? idMap.get(original.parentId) ?? original.parentId : original.parentId;
                const newRootEntityId = original.rootEntityId ? idMap.get(original.rootEntityId) ?? original.rootEntityId : original.rootEntityId;

                return {
                  ...cloneEntity(original),
                  id: idMap.get(id)!,
                  name: isRequestedRoot ? `${original.name} (Copy)` : original.name,
                  parentId: newParentId,
                  rootEntityId: newRootEntityId,
                  position: isRequestedRoot
                    ? [
                      original.position[0] + copyOffset[0],
                      original.position[1] + copyOffset[1],
                      original.position[2] + copyOffset[2],
                    ] as [number, number, number]
                    : cloneVector(original.position),
                };
              });

              // Copies of the states and events too, and each copy shown in the copy of the state its
              // original shows.
              const { states, stateIdMap } = duplicateStates(state.animation.states, idMap, copyOffsets);
              const events = duplicateEvents(state.animation.events, idMap, stateIdMap);
              const copiedViews = cloneOrder
                .map((id) => [idMap.get(id)!, stateIdMap.get(selectViewedObjectState(state, id)?.id ?? "")] as const)
                .filter((view): view is readonly [string, string] => view[1] !== undefined);

              return {
                entities: [...state.entities, ...newEntities],
                selectedEntityIds: cloneOrder.filter((id) => requestedRootIds.has(id)).map((id) => idMap.get(id)!),
                ...withAnimation(state.animation, { states, events }),
                ...(copiedViews.length > 0 ? { viewedStates: { ...state.viewedStates, ...Object.fromEntries(copiedViews) } } : null),
              };
            });
          },
          removeEntity: (ids) => {
            const { entities } = get();
            const allIds = new Set(ids);
            ids.forEach((id) => {
              getDescendantIds(entities, id).forEach((descId) => allIds.add(descId));
            });

            // Note: this intentionally does NOT free the removed entities'
            // model/texture assets, so undo always gets a working entity back.
            // Local copies are a cache of the cloud ones (assetTransfers.ts);
            // nothing evicts them yet. The removed objects' states and events, and
            // other objects' actions that move them, go in the same set, so one undo
            // brings all of it back together.
            set((state) => ({
              entities: state.entities.filter((entity) => !allIds.has(entity.id)),
              selectedEntityIds: state.selectedEntityIds.filter((id) => !allIds.has(id)),
              ...withAnimation(state.animation, {
                states: removeStatesOf(state.animation.states, allIds),
                events: removeEventsOf(state.animation.events, allIds),
              }),
            }));
          },
          // World-space placement is preserved: the new local TRS is solved from
          // the stored parent chain so the object doesn't visually jump. One
          // set() call = one zundo undo step for the whole move. `index` counts
          // siblings under the new parent *after* the moved entities are removed
          // (standard drop-index semantics); omitted/out-of-range appends last.
          reparentEntities: (ids, newParentId, index) =>
            set((state) => {
              const moveRoots = filterMoveRoots(state.entities, ids);
              if (moveRoots.length === 0 || !canReparentEntities(state.entities, moveRoots, newParentId)) {
                return state;
              }

              const parentWorld = newParentId ? getEntityWorldMatrix(state.entities, newParentId) : null;
              const solvedById = new Map<string, EntityTRS>();
              const parentChanges: ParentChange[] = [];
              for (const id of moveRoots) {
                const entity = state.entities.find((e) => e.id === id)!;
                // Same-parent moves are pure sibling reorders — keep the stored
                // TRS bit-identical instead of a solve/decompose round-trip.
                if ((entity.parentId ?? null) === (newParentId ?? null)) continue;
                solvedById.set(id, solveLocalFromWorld(getEntityWorldMatrix(state.entities, id), parentWorld));
                parentChanges.push({ entity, from: getParentWorld(state.entities, entity.parentId), to: parentWorld });
              }

              const movingSet = new Set(moveRoots);
              const remaining = state.entities.filter((entity) => !movingSet.has(entity.id));
              const moved: Entity[] = moveRoots.map((id) => {
                const original = state.entities.find((e) => e.id === id)!;
                const solved = solvedById.get(id);
                return {
                  ...original,
                  parentId: newParentId,
                  ...(solved
                    ? {
                      position: cloneVector(solved.position),
                      rotation: cloneVector(solved.rotation),
                      scale: cloneVector(solved.scale),
                    }
                    : null),
                };
              });

              // Sibling order is array position among same-parent entities:
              // insert before the array slot of the sibling currently at `index`.
              let insertAt = remaining.length;
              if (index !== undefined) {
                const siblingArrayIndexes = remaining
                  .map((entity, arrayIndex) => ({ entity, arrayIndex }))
                  .filter(({ entity }) => (entity.parentId ?? null) === (newParentId ?? null))
                  .map(({ arrayIndex }) => arrayIndex);
                if (index < siblingArrayIndexes.length) insertAt = siblingArrayIndexes[index];
              }

              return {
                entities: [...remaining.slice(0, insertAt), ...moved, ...remaining.slice(insertAt)],
                ...withAnimation(state.animation, { states: reparentStates(state.animation.states, parentChanges) }),
              };
            }),
          groupEntities: (ids) => {
            let groupId = "";
            set((state) => {
              const moveRoots = filterMoveRoots(state.entities, ids);
              if (moveRoots.length === 0) return state;

              const parentIds = new Set(
                moveRoots.map((id) => state.entities.find((e) => e.id === id)?.parentId ?? null),
              );
              const groupParentId = parentIds.size === 1 ? [...parentIds][0] : null;
              // The members end up under the new group, whose own parent is
              // groupParentId — legality (cycles, imported-model boundary) is
              // identical to reparenting them straight onto groupParentId,
              // since the group itself is a plain node.
              if (!canReparentEntities(state.entities, moveRoots, groupParentId)) return state;

              const memberWorlds = new Map(
                moveRoots.map((id) => [id, getEntityWorldMatrix(state.entities, id)] as const),
              );
              const centroid: [number, number, number] = [0, 0, 0];
              memberWorlds.forEach((world) => {
                const [x, y, z] = getWorldPosition(world);
                centroid[0] += x / moveRoots.length;
                centroid[1] += y / moveRoots.length;
                centroid[2] += z / moveRoots.length;
              });

              // The group pivots at the members' world centroid, with identity
              // world rotation/scale (Blender's default for a new Empty parent).
              const groupWorld = makeTranslationMatrix(centroid);
              const groupParentWorld = groupParentId ? getEntityWorldMatrix(state.entities, groupParentId) : null;
              const groupLocal = solveLocalFromWorld(groupWorld, groupParentWorld);

              const group: Entity = {
                id: createEntityId(),
                type: "group",
                name: "Group",
                position: cloneVector(groupLocal.position),
                rotation: cloneVector(groupLocal.rotation),
                scale: cloneVector(groupLocal.scale),
                visible: true,
                locked: false,
                parentId: groupParentId,
              };
              groupId = group.id;

              const movingSet = new Set(moveRoots);
              const firstMemberIndex = state.entities.findIndex((entity) => movingSet.has(entity.id));
              const parentChanges: ParentChange[] = [];
              const entitiesNext = state.entities.map((entity) => {
                if (!movingSet.has(entity.id)) return entity;
                const solved = solveLocalFromWorld(memberWorlds.get(entity.id)!, groupWorld);
                parentChanges.push({ entity, from: getParentWorld(state.entities, entity.parentId), to: groupWorld });
                return {
                  ...entity,
                  parentId: group.id,
                  position: cloneVector(solved.position),
                  rotation: cloneVector(solved.rotation),
                  scale: cloneVector(solved.scale),
                };
              });
              entitiesNext.splice(Math.max(firstMemberIndex, 0), 0, group);

              return {
                entities: entitiesNext,
                selectedEntityIds: [group.id],
                ...withAnimation(state.animation, { states: reparentStates(state.animation.states, parentChanges) }),
              };
            });
            return groupId;
          },
          applyHierarchyPrune: (removedIds, updates) =>
            set((state) => ({
              entities: state.entities
                .filter((entity) => !removedIds.has(entity.id))
                .map((entity) => {
                  const update = updates.get(entity.id);
                  if (!update) return entity;
                  return {
                    ...entity,
                    parentId: update.parentId,
                    position: cloneVector(update.position),
                    rotation: cloneVector(update.rotation),
                    scale: cloneVector(update.scale),
                  };
                }),
            })),
          ungroupEntity: (id) =>
            set((state) => {
              const group = state.entities.find((entity) => entity.id === id);
              const canUngroup =
                group && (group.type === "group" || (group.type === "importedModel" && group.id !== group.rootEntityId));
              if (!canUngroup) return state;

              const childIds = getChildren(state.entities, id).map((child) => child.id);
              const parentWorld = group.parentId ? getEntityWorldMatrix(state.entities, group.parentId) : null;
              const groupWorld = getEntityWorldMatrix(state.entities, id);
              const childSet = new Set(childIds);
              const parentChanges: ParentChange[] = [];

              const entitiesNext = state.entities
                .filter((entity) => entity.id !== id)
                .map((entity) => {
                  if (!childSet.has(entity.id)) return entity;
                  const solved = solveLocalFromWorld(getEntityWorldMatrix(state.entities, entity.id), parentWorld);
                  parentChanges.push({ entity, from: groupWorld, to: parentWorld });
                  return {
                    ...entity,
                    parentId: group.parentId ?? null,
                    position: cloneVector(solved.position),
                    rotation: cloneVector(solved.rotation),
                    scale: cloneVector(solved.scale),
                  };
                });

              // The group's own states and events go with it (and other objects' actions that move
              // it); its children's states keep their place.
              const statesNext = reparentStates(removeStatesOf(state.animation.states, new Set([id])), parentChanges);

              return {
                entities: entitiesNext,
                selectedEntityIds: childIds.length > 0
                  ? childIds
                  : state.selectedEntityIds.filter((selId) => selId !== id),
                ...withAnimation(state.animation, {
                  states: statesNext,
                  events: removeEventsOf(state.animation.events, new Set([id])),
                }),
              };
            }),
          updateEntityTransform: (id, updates) =>
            set((state) => ({
              entities: state.entities.map((entity) =>
                entity.id === id
                  ? {
                    ...entity,
                    ...(updates.position
                      ? { position: cloneVector(updates.position) }
                      : null),
                    ...(updates.rotation
                      ? { rotation: cloneVector(updates.rotation) }
                      : null),
                    ...(updates.scale
                      ? { scale: cloneVector(updates.scale) }
                      : null),
                    ...(updates.color ? { color: updates.color } : null),
                  }
                  : entity,
              ),
            })),
          updateMultipleEntityTransforms: (updatesMap) =>
            set((state) => ({
              entities: state.entities.map((entity) => {
                const updates = updatesMap[entity.id];
                if (!updates) return entity;
                return {
                  ...entity,
                  ...(updates.position ? { position: cloneVector(updates.position) } : null),
                  ...(updates.rotation ? { rotation: cloneVector(updates.rotation) } : null),
                  ...(updates.scale ? { scale: cloneVector(updates.scale) } : null),
                  ...(updates.color ? { color: updates.color } : null),
                };
              }),
            })),
          selectEntity: (id, multi = false) =>
            set((state) => {
              if (!id) return { selectedEntityIds: [] };
              if (multi) {
                const isSelected = state.selectedEntityIds.includes(id);
                return {
                  selectedEntityIds: isSelected
                    ? state.selectedEntityIds.filter(selId => selId !== id)
                    : [...state.selectedEntityIds, id]
                };
              }
              return { selectedEntityIds: [id] };
            }),
          selectEntities: (ids, mode = "replace") =>
            set((state) => {
              if (mode === "replace") {
                return { selectedEntityIds: [...new Set(ids)] };
              }
              if (mode === "add") {
                return { selectedEntityIds: [...new Set([...state.selectedEntityIds, ...ids])] };
              }
              // subtract
              const remove = new Set(ids);
              return { selectedEntityIds: state.selectedEntityIds.filter((id) => !remove.has(id)) };
            }),
          toggleVisibility: (id) =>
            set((state) => ({
              entities: state.entities.map((entity) =>
                entity.id === id ? { ...entity, visible: !entity.visible } : entity,
              ),
            })),
          toggleLock: (id) =>
            set((state) => {
              const target = state.entities.find((entity) => entity.id === id);
              // Locking a group locks its subtree (see isEffectivelyLocked), so
              // drop any selected descendants along with the entity itself.
              const deselect = new Set([id]);
              if (target && !target.locked) {
                getDescendantIds(state.entities, id).forEach((descId) => deselect.add(descId));
              }
              return {
                entities: state.entities.map((entity) =>
                  entity.id === id ? { ...entity, locked: !entity.locked } : entity,
                ),
                selectedEntityIds: state.selectedEntityIds.filter((selId) => !deselect.has(selId)),
              };
            }),
          renameEntity: (id, newName) =>
            set((state) => ({
              entities: state.entities.map((entity) =>
                entity.id === id ? { ...entity, name: newName } : entity,
              ),
            })),
          // Batch rename in one set() so the whole operation is one undo step.
          renameEntities: (updates) =>
            set((state) => ({
              entities: state.entities.map((entity) => {
                const newName = updates[entity.id]?.trim();
                return newName ? { ...entity, name: newName } : entity;
              }),
            })),
          updatePathStrokes: (ids, updates) =>
            set((state) => {
              if (updates.radius !== undefined && !(updates.radius > 0)) return state; // a radius of 0 (or NaN) draws nothing
              const targets = new Set(ids);
              const isTarget = (entity: Entity) => entity.type === "path" && targets.has(entity.id);
              if (!state.entities.some(isTarget)) return state;
              return {
                entities: state.entities.map((entity) =>
                  isTarget(entity) ? { ...entity, stroke: { ...DEFAULT_STROKE, ...entity.stroke, ...updates } } : entity,
                ),
              };
            }),
          addShape: (origin, rotation, outline) => {
            let newId = "";
            set((state) => {
              const entity: Entity = {
                ...createEntity("shape"),
                position: cloneVector(origin),
                rotation: cloneVector(rotation),
                shape: flattenShape({ regions: [{ outline, holes: [] }] }),
                materialLayers: [{ ...createColorLayer(ENTITY_DEFAULTS.shape.color, 1), doubleSided: true }, createLightingLayer()],
              };
              newId = entity.id;
              return { entities: [...state.entities, entity], selectedEntityIds: [entity.id] };
            });
            return newId;
          },
          addPath: (origin, path) => {
            let newId = "";
            set((state) => {
              const entity: Entity = { ...createEntity("path"), position: cloneVector(origin), path: clonePath(path) };
              newId = entity.id;
              return { entities: [...state.entities, entity], selectedEntityIds: [entity.id] };
            });
            return newId;
          },
          updatePath: (id, path) =>
            set((state) => {
              const target = state.entities.find((entity) => entity.id === id);
              if (target?.type !== "path") return state;
              return { entities: state.entities.map((entity) => (entity === target ? { ...entity, path: clonePath(path) } : entity)) };
            }),
          updateShape: (id, shape) =>
            set((state) => {
              const target = state.entities.find((entity) => entity.id === id);
              if (target?.type !== "shape") return state;
              return { entities: state.entities.map((entity) => (entity === target ? { ...entity, shape: flattenShape(shape) } : entity)) };
            }),
          centerOrigin: (id) =>
            set((state) => {
              const target = state.entities.find((entity) => entity.id === id);
              const contours = target?.type === "path" && target.path ? [target.path] : target?.type === "shape" && target.shape ? shapeContours(target.shape) : [];
              const center = pathsCenter(contours);
              if (!target || !center) return state;
              const back: [number, number, number] = [-center[0], -center[1], -center[2]];
              const shift = (path: PathData) => shiftPoints(path, path.points.map((_, index) => index), back);
              // Where the centre is in the parent's space: through the object's own size and turn.
              const offset = new Vector3(...center).multiply(new Vector3(...target.scale)).applyEuler(new Euler(...target.rotation, "XYZ"));
              const moved: Entity = {
                ...target,
                position: [target.position[0] + offset.x, target.position[1] + offset.y, target.position[2] + offset.z],
                ...(target.path ? { path: shift(target.path) } : null),
                ...(target.shape ? { shape: { regions: target.shape.regions.map((region) => ({ outline: shift(region.outline), holes: region.holes.map(shift) })) } } : null),
              };
              return { entities: state.entities.map((entity) => (entity === target ? moved : entity)) };
            }),
          addImportedSvg: (name, items) => {
            let rootId = "";
            set((state) => {
              if (items.length === 0) return state;
              const toEntity = (imported: ImportedSvgItem, entityName: string, parentId?: string): Entity => ({
                ...createEntity(imported.kind),
                name: entityName,
                position: cloneVector(imported.position),
                ...(imported.kind === "path"
                  ? { path: clonePath(imported.path), stroke: { ...imported.stroke } }
                  : {
                      shape: cloneShape(imported.shape),
                      // A flat shape shows from both sides.
                      materialLayers: [{ ...createColorLayer(imported.color, 1), doubleSided: true }, createLightingLayer()],
                    }),
                ...(parentId ? { parentId } : null),
              });

              // The group sits at the drawing's centre (the import's origin), so it turns the word about its middle.
              const group = items.length > 1 ? { ...createEntity("group"), name } : null;
              const counts = { path: 0, shape: 0 };
              const added = group
                ? [group, ...items.map((imported) => toEntity(imported, `${ENTITY_DEFAULTS[imported.kind].name} ${++counts[imported.kind]}`, group.id))]
                : [toEntity(items[0], name)];
              rootId = added[0].id;
              return { entities: [...state.entities, ...added], selectedEntityIds: [rootId], penTool: null };
            });
            return rootId;
          },
          addImagePlane: (name, textureAssetId, aspect, transparent) => {
            let newId = "";
            set((state) => {
              const image: ImageLayer = {
                id: createEntityId(),
                type: "image",
                enabled: true,
                opacity: 1,
                textureAssetId,
                slot: "color",
                // The picture covers the plane once; clamping keeps its edges from bleeding into each other.
                wrapS: ClampToEdgeWrapping,
                wrapT: ClampToEdgeWrapping,
              };
              const entity: Entity = {
                ...createEntity("image"),
                name,
                imageAspect: aspect,
                // White, so the picture shows in its own colours (the Color layer tints it), whatever the lights.
                materialLayers: [
                  { ...createColorLayer(ENTITY_DEFAULTS.image.color, 1), doubleSided: true, ...(transparent ? { alphaMode: "BLEND" as const } : null) },
                  createLightingLayer({ model: "none" }),
                  image,
                ],
              };
              newId = entity.id;
              return { entities: [...state.entities, entity], selectedEntityIds: [entity.id], penTool: null };
            });
            return newId;
          },
          updateShapeSolids: (ids, updates) =>
            set((state) => {
              const valid = Object.values(updates).every((value) => value === undefined || value >= 0);
              const targets = new Set(ids);
              const isTarget = (entity: Entity) => entity.type === "shape" && targets.has(entity.id);
              if (!valid || !state.entities.some(isTarget)) return state;
              return { entities: state.entities.map((entity) => (isTarget(entity) ? { ...entity, ...updates } : entity)) };
            }),
          convertShapesToPaths: (ids) => {
            const { entities, readOnlyReason, isPreviewMode } = get();
            if (readOnlyReason || isPreviewMode) return 0;
            const reach = new Set([...ids, ...ids.flatMap((id) => [...getDescendantIds(entities, id)])]);
            // The maths runs before the store is written: it's the slow part.
            const converted = new Map<string, CenterLines>();
            entities.forEach((entity) => {
              if (entity.type !== "shape" || !reach.has(entity.id) || !entity.shape) return;
              const lines = shapeCenterLines(entity.shape);
              if (lines.paths.length > 0) converted.set(entity.id, lines);
            });
            if (converted.size === 0) return 0;

            set((state) => ({
              entities: state.entities.flatMap((entity) => {
                const lines = converted.get(entity.id);
                if (!lines || entity.type !== "shape") return [entity];
                const stroke = { radius: Math.max(MIN_IMPORT_RADIUS, lines.radius), caps: "round" as const };
                const { shape: _shape, extrusion: _extrusion, bevel: _bevel, ...rest } = entity;
                const asPath = (path: PathData): Entity => ({ ...rest, type: "path", path: clonePath(path), stroke: { ...stroke }, trimStart: 0, trimEnd: 1 });
                const [first, ...others] = lines.paths;
                return [
                  asPath(first),
                  ...others.map((path, i) => ({
                    ...cloneEntity(asPath(path)),
                    id: createEntityId(),
                    name: `${entity.name} (${i + 2})`,
                    materialLayers: entity.materialLayers?.map((layer) => ({ ...cloneMaterialLayer(layer), id: createEntityId() })),
                  })),
                ];
              }),
              // The pen was editing a shape that's now a path: start again from it.
              penTool: state.penTool?.pathId && converted.has(state.penTool.pathId) ? null : state.penTool,
            }));
            return converted.size;
          },
          // Viewport / Projection
          activeTransformTool: "translate",
          projectionMode: "perspective",
          transformSpace: "world",
          penTool: null,
          // Playing and view only are for looking, so the pen doesn't turn on then.
          setPenTool: (penTool) =>
            set((state) =>
              penTool && (state.readOnlyReason || state.isPreviewMode || state.previewingActionId)
                ? state
                : { penTool, ...(penTool ? { depthEdit: null } : null) },
            ),
          depthEdit: null,
          setDepthEdit: (entityId) =>
            set((state) =>
              entityId && (state.readOnlyReason || state.isPreviewMode || state.previewingActionId)
                ? state
                : { depthEdit: entityId, ...(entityId ? { penTool: null } : null) },
            ),

          sceneSettings: initialSceneDefaults,
          postProcessing: initialPostProcessingDefaults,

          // Frame
          hudOverlay: "None",
          viewportZoom: 100,
          frame: initialFrameDefaults,

          // Play Mode / Preview
          isPreviewMode: false,
          // Play takes over from a ▶ preview, which doesn't come back after Stop. Both end the pen.
          setPreviewMode: (active) => set({ isPreviewMode: active, previewingActionId: null, ...(active ? { penTool: null, depthEdit: null } : null) }),
          previewingActionId: null,
          setPreviewingAction: (actionId) => set({ previewingActionId: actionId, ...(actionId ? { penTool: null, depthEdit: null } : null) }),

          readOnlyReason: null,
          setReadOnly: (reason) => {
            api.setState({ readOnlyReason: reason, ...(reason ? { penTool: null, depthEdit: null } : null) });

            if (reason) {
              // There's nothing to undo into: the scene can't change here, and it's reloaded from
              // the cloud before editing resumes.
              useEditorStore.temporal.getState().clear();
            }
          },
          pendingImportCount: 0,
          adjustPendingImports: (delta) =>
            set((state) => ({ pendingImportCount: Math.max(0, state.pendingImportCount + delta) })),

          animation: createEmptyAnimation(),
          viewedStates: {},
          setViewedState: (entityId, stateId) =>
            set((state) => {
              const viewedStates = { ...state.viewedStates };
              if (stateId) {
                viewedStates[entityId] = stateId;
              } else {
                delete viewedStates[entityId];
              }
              return { viewedStates };
            }),
          // A new state starts as a snapshot of the pose on screen (the shown state's, or Base), so
          // later changes to Base don't reach it.
          addState: (entityId) => {
            let stateId = "";
            set((state) => {
              const entity = state.entities.find((each) => each.id === entityId);
              if (!entity) return state;
              const pose = resolveState(entity, selectViewedObjectState(state, entityId));
              const objectState = { ...createObjectState(state.animation.states, entityId), values: cloneStateValues(pose) };
              stateId = objectState.id;
              return {
                animation: { ...state.animation, states: { ...state.animation.states, [objectState.id]: objectState } },
                viewedStates: { ...state.viewedStates, [entityId]: objectState.id },
              };
            });
            return stateId;
          },
          renameState: (stateId, name) => {
            const trimmed = name.trim();
            if (trimmed) set((state) => updatingState(state, stateId, (objectState) => ({ ...objectState, name: trimmed })));
          },
          // An object shown in the removed state is shown in Base (its viewedStates entry stays, so
          // undoing the removal shows the state again).
          removeState: (stateId) =>
            set((state) => {
              if (!state.animation.states[stateId]) return state;
              const states = { ...state.animation.states };
              delete states[stateId];
              return { animation: { ...state.animation, states } };
            }),
          setStateValues: (stateId, values) =>
            set((state) =>
              updatingState(state, stateId, (objectState) => ({
                ...objectState,
                values: { ...objectState.values, ...cloneStateValues(values) },
              })),
            ),
          clearStateValue: (stateId, key) =>
            set((state) =>
              updatingState(state, stateId, (objectState) => {
                const values = { ...objectState.values };
                delete values[key];
                return { ...objectState, values };
              }),
            ),
          updateShownTransforms: (updates) =>
            set((state) => {
              const states = { ...state.animation.states };
              const baseUpdates = new Map<string, StateValues>();
              let isStateEdit = false;

              for (const [entityId, values] of Object.entries(updates)) {
                const shown = selectViewedObjectState(state, entityId);
                if (shown) {
                  states[shown.id] = { ...shown, values: { ...shown.values, ...cloneStateValues(values) } };
                  isStateEdit = true;
                } else {
                  baseUpdates.set(entityId, cloneStateValues(values));
                }
              }

              return {
                ...(baseUpdates.size > 0
                  ? { entities: state.entities.map((entity) => (baseUpdates.has(entity.id) ? { ...entity, ...baseUpdates.get(entity.id) } : entity)) }
                  : null),
                ...(isStateEdit ? { animation: { ...state.animation, states } } : null),
              };
            }),
          addEvent: (ownerId, trigger) => {
            let eventId = "";
            set((state) => {
              if (!state.entities.some((entity) => entity.id === ownerId)) return state;
              const event = createEvent(state.animation.events, state.animation.states, ownerId, trigger);
              eventId = event.id;
              return withAnimation(state.animation, { events: { ...state.animation.events, [event.id]: event } })!;
            });
            return eventId;
          },
          updateEvent: (eventId, updates) =>
            set((state) =>
              updatingEvent(state, eventId, (event) => ({
                ...event,
                ...(updates.trigger ? { trigger: updates.trigger } : null),
                ...(updates.actions ? { actions: updates.actions.map(cloneTransition) } : null),
              })),
            ),
          removeEvent: (eventId) =>
            set((state) => {
              if (!state.animation.events[eventId]) return state;
              const events = { ...state.animation.events };
              delete events[eventId];
              return withAnimation(state.animation, { events })!;
            }),

          updatePostProcessing: (updates) =>
            set((state) => ({
              postProcessing: deepMerge(state.postProcessing, updates),
            })),
          updateSceneSettings: (updates) =>
            set((state) => ({
              sceneSettings: deepMerge(state.sceneSettings, updates),
            })),
          updateFrameSettings: (updates) =>
            set((state) => ({
              frame: deepMerge(state.frame, updates),
            })),
          addMaterialLayer: (entityId, layerType) =>
            set((state) => ({
              entities: state.entities.map((entity) => {
                if (entity.id !== entityId || !entity.materialLayers) return entity;
                if (entity.materialLayers.some((layer) => layer.type === layerType)) return entity;

                const colorLayer = entity.materialLayers.find((layer): layer is ColorLayer => layer.type === "color");
                const newLayer: MaterialLayer =
                  layerType === "color"
                    ? createColorLayer(colorLayer?.color ?? "#ffffff")
                    : layerType === "depth"
                      ? createDepthLayer()
                      : createLightingLayer();

                return {
                  ...entity,
                  materialLayers: [...entity.materialLayers, newLayer],
                };
              }),
            })),
          removeMaterialLayer: (entityId, layerId) =>
            set((state) => ({
              entities: state.entities.map((entity) => {
                if (entity.id !== entityId || !entity.materialLayers) return entity;
                const layer = entity.materialLayers.find((l) => l.id === layerId);
                if (!layer || MANDATORY_LAYER_TYPES.includes(layer.type)) return entity;

                return {
                  ...entity,
                  materialLayers: entity.materialLayers.filter((l) => l.id !== layerId),
                };
              }),
            })),
          updateMaterialLayer: (entityId, layerId, updates) =>
            set((state) => ({
              entities: state.entities.map((entity) => {
                if (entity.id !== entityId || !entity.materialLayers) return entity;
                return {
                  ...entity,
                  materialLayers: entity.materialLayers.map((layer) =>
                    layer.id === layerId ? ({ ...layer, ...updates } as MaterialLayer) : layer,
                  ),
                };
              }),
            })),
          updateMultipleEntityMaterialLayers: (updatesMap) =>
            set((state) => ({
              entities: state.entities.map((entity) => {
                const change = updatesMap[entity.id];
                if (!change || !entity.materialLayers) return entity;
                return {
                  ...entity,
                  materialLayers: entity.materialLayers.map((layer) =>
                    layer.id === change.layerId ? ({ ...layer, ...change.updates } as MaterialLayer) : layer,
                  ),
                };
              }),
            })),
          // Replaces an entity's whole layer stack. Used by hydrate-time backfill
          // (ObjectManager) to write the layers derived from an imported mesh's
          // parsed glTF material — the one place layers can be built, since it
          // needs parsed texture/material data unavailable at migrate() time.
          setEntityMaterialLayers: (entityId, layers) =>
            set((state) => ({
              entities: state.entities.map((entity) =>
                entity.id === entityId
                  ? { ...entity, materialLayers: layers.map((layer) => ({ ...layer })) }
                  : entity,
              ),
            })),
          loadScene: (content) => {
            const savedProfiles = Object.values(content?.cameraProfiles ?? {}).map(cloneCameraProfile);
            const cameraProfiles: Record<string, CameraProfile> = {
              [DEFAULT_CAMERA_PROFILE_ID]: cloneCameraProfile(DEFAULT_CAMERA_PROFILE),
              ...Object.fromEntries(savedProfiles.map((profile) => [profile.id, profile])),
            };
            const activeProfileId =
              content?.activeProfileId && cameraProfiles[content.activeProfileId]
                ? content.activeProfileId
                : DEFAULT_CAMERA_PROFILE_ID;

            // Past the read-only guard: a read-only tab shows the latest saved scene through this too.
            api.setState({
              entities: content ? content.entities.map(cloneEntity) : createStartingEntities(),
              // Deep-merged over the defaults, so a setting added since the scene was saved keeps
              // its default instead of coming back undefined.
              sceneSettings: deepMerge(initialSceneDefaults, content?.sceneSettings ?? {}),
              postProcessing: deepMerge(initialPostProcessingDefaults, content?.postProcessing ?? {}),
              frame: deepMerge(initialFrameDefaults, content?.frame ?? {}),
              cameraProfiles,
              activeProfileId,
              animation: cloneAnimation(content?.animation),
              viewedStates: { ...content?.viewedStates },
              selectedEntityIds: [],
              isPreviewMode: false,
              previewingActionId: null,
              penTool: null,
              depthEdit: null,
            });

            // The editor no longer reloads the page between scenes, so history would otherwise
            // carry over; the load itself also shouldn't be an undoable step.
            useEditorStore.temporal.getState().clear();
          },
          setEditorState: (updates) => set((state) => ({ ...state, ...updates })),
        })),
        {
          // Since v17 this holds only editor preferences; the scene itself is saved in the cloud
          // (utils/sceneLibrary.ts) and loaded with loadScene. The key keeps its name from when it
          // held the scene.
          name: "libre3d-scene-state",
          version: 17,
          storage: createJSONStorage(() => localStorage),
          // Before v17 the scene was saved here too. Scenes live in the cloud now and nothing saved
          // before then is kept, so an older blob keeps only the editor preferences (the fields
          // partialize saves below, none of which ever changed shape).
          migrate: (persistedState: any, version: number) => {
            if (version < 17) {
              return Object.fromEntries(
                PERSISTED_PREFERENCES.filter((key) => persistedState?.[key] !== undefined).map((key) => [key, persistedState[key]]),
              );
            }

            return persistedState;
          },
          partialize: (state) =>
            Object.fromEntries(PERSISTED_PREFERENCES.map((key) => [key, state[key]])) as Pick<
              EditorState,
              (typeof PERSISTED_PREFERENCES)[number]
            >,
          // Deep-merge nested objects (sceneSettings, postProcessing, etc.) so that
          // new fields added to initialSceneDefaults always survive old saves that
          // are missing those keys.  Without this, Zustand's default shallow merge
          // replaces the entire sceneSettings object, dropping any key not present
          // in the persisted copy.
          merge: (persistedState: any, currentState: EditorState) => deepMerge(currentState, persistedState),
        }
      ),
      {
        // What undo restores. Not the cameras: the view changes every frame of an orbit, and undo
        // shouldn't move it.
        partialize: (state) => ({
          entities: state.entities,
          sceneSettings: state.sceneSettings,
          postProcessing: state.postProcessing,
          frame: state.frame,
          animation: state.animation,
        }),
        // Only record a step when something undo restores changed. Every action replaces what it
        // changes, so comparing references is enough; without this, selecting an object or picking
        // a state to view added a step that undid nothing.
        equality: shallow,
      }
    )
  )
);

// zundo wraps set() to snapshot partialize(get()) first, and get() is still undefined while create()
// runs, so persist's first hydration throws right after building the loaded state. The store still
// starts from that state (persist returns it), but a migrated state is never written back and
// hasHydrated() stays false: until something else is set, every load migrates again. Hydrating
// again now that the store exists writes the migration back once. The load is not an undoable step.
if (!useEditorStore.persist.hasHydrated()) {
  void useEditorStore.persist.rehydrate();
  useEditorStore.temporal.getState().clear();
}
