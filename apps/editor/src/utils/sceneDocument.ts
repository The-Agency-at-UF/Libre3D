/**
 * PURPOSE: The saved form of a scene: what goes to the cloud (`/api/scenes/:id`), and the local copy
 * of the open scene's unsaved edits.
 *
 * INPUT: The scene content from the store (`toSceneDocument`), or a document read back from
 *        anywhere (`parseSceneDocument`, which migrates it to the current schema).
 * OUTPUT: A plain, versioned JSON object, independent of the store's live references.
 *
 * Only the scene itself goes in: entities, scene/post-processing/frame settings, camera profiles,
 * animation (object states and events, keyed by ID and pointing at entities by ID; see
 * animation/objectStates.ts and animation/events.ts), material assets (`materials`), and which state each object is shown in while editing, so it reopens
 * as it was left. Selection, the transform tool, projection mode, zoom, the HUD, preview state, and
 * undo history are editor state, not scene content, and stay out. The name lives on the scene's row in DynamoDB, so renaming never rewrites the document.
 *
 * Evolving the format:
 * - New data goes in its own optional top-level section (as `animation` did in v2), not inside
 *   entities. New optional fields on entities or settings don't need one: they're copied whole.
 *   New values a state can set do (as a path's trim did in v3): a state's values are copied only
 *   as far as the build knows them (objectStates.ts, cloneStateValues). So does a new setting whose
 *   default shouldn't apply to older scenes (the environment light, v4): the migration writes the
 *   old behaviour in.
 * - Adding a section or a state value bumps `CURRENT_SCENE_SCHEMA_VERSION` and adds a migration.
 *   Old documents upgrade on read; nothing breaks.
 * - A document newer than this build is refused rather than loaded: otherwise a tab still running an
 *   old bundle would drop the parts it doesn't know about (states) on its next autosave.
 *
 * The nested settings objects are deep-merged over the current defaults when the store loads the
 * content (`loadScene`), so a field added to the defaults later keeps its default for old scenes.
 */

import { normalizeEvents } from "../animation/events";
import { pruneViewedStates, type SceneAnimation } from "../animation/objectStates";
import { DEFAULT_METALNESS, DEFAULT_ROUGHNESS } from "../scene/layers";
import { createId } from "./createId";
import type {
  CameraProfile,
  DeepPartial,
  Entity,
  FrameSettingsConfig,
  MaterialAsset,
  PostProcessingConfig,
  SceneSettingsConfig,
} from "../scene/types";

export const SCENE_DOCUMENT_FORMAT = "libre3d.scene";
export const CURRENT_SCENE_SCHEMA_VERSION = 5;

/** The parts of the editor state that make up a scene. */
export interface SceneContent {
  entities: Entity[];
  sceneSettings: SceneSettingsConfig;
  postProcessing: PostProcessingConfig;
  frame: FrameSettingsConfig;
  cameraProfiles: Record<string, CameraProfile>;
  activeProfileId: string;
  animation: SceneAnimation;
  viewedStates: Record<string, string>; // entity ID → the state it's shown in while editing
  materials: Record<string, MaterialAsset>; // reusable materials by ID (task D, PR 6)
}

/** Scene content as read back from a document: settings may predate fields added since. */
export interface StoredSceneContent {
  entities: Entity[];
  sceneSettings?: DeepPartial<SceneSettingsConfig>;
  postProcessing?: DeepPartial<PostProcessingConfig>;
  frame?: DeepPartial<FrameSettingsConfig>;
  cameraProfiles?: Record<string, CameraProfile>;
  activeProfileId?: string;
  animation?: Partial<SceneAnimation>;
  viewedStates?: Record<string, string>;
  materials?: Record<string, MaterialAsset>;
}

export interface SceneDocument {
  format: typeof SCENE_DOCUMENT_FORMAT;
  schemaVersion: number;
  scene: SceneContent;
}

export type ParsedSceneDocument =
  | { ok: true; content: StoredSceneContent }
  | { ok: false; reason: "invalid" | "newer" };

// Each entry upgrades a document from schema version N to N + 1.
// `any` because a migration's input is, by definition, a shape the current types don't describe.
const migrations: Record<number, (document: any) => any> = {
  // v2 added `scene.animation` and `scene.viewedStates`. A scene without them has no states and shows
  // everything in Base, which is what loadScene starts with anyway, so there's nothing to fill in.
  1: (document) => document,
  // v3 lets a state set a path's trim. A v2 build would drop it on load (it copies only the state
  // values it knows) and then autosave without it, so it has to refuse v3 instead. Nothing to fill in.
  2: (document) => document,
  // v4 lights new scenes with an environment (sceneSettings.environment, on by default). Scenes from
  // before keep the look they were made with: loadScene would otherwise fill in the new default.
  3: (document) => {
    const scene = document?.scene;
    if (!isPlainObject(scene) || !isPlainObject(scene.sceneSettings)) return document;
    const environment = isPlainObject(scene.sceneSettings.environment) ? scene.sceneSettings.environment : {};
    return {
      ...document,
      scene: { ...scene, sceneSettings: { ...scene.sceneSettings, environment: { enabled: false, ...environment } } },
    };
  },
  // v5 is task D's document: material layers become a stack (top first, each with a blend mode),
  // the object's see-through-ness moves off the Color layer onto the object, the surface settings
  // move to the Lighting layer, and there's a `materials` section (assets) and `materialAssetId`.
  // States may set `color` and `opacity`. Each object comes out looking as it did.
  4: (document) => {
    const scene = document?.scene;
    if (!isPlainObject(scene)) return document;
    return {
      ...document,
      scene: {
        ...scene,
        entities: Array.isArray(scene.entities) ? scene.entities.map(migrateLayersToV5) : scene.entities,
        materials: isPlainObject(scene.materials) ? scene.materials : {},
      },
    };
  },
};

const SURFACE_KEYS = ["alphaMode", "alphaCutoff", "doubleSided"] as const;

// A Lighting layer as v4 drew an object without one: physical, with the default roughness and metalness.
const v4DefaultLighting = (): Record<string, unknown> => ({
  id: createId("entity"),
  type: "lighting",
  enabled: true,
  opacity: 1,
  blendMode: "normal",
  model: "physical",
  roughness: DEFAULT_ROUGHNESS,
  metalness: DEFAULT_METALNESS,
  shininess: 30,
  emissive: "#000000",
  emissiveIntensity: 1,
});

/**
 * One v4 entity's layers as v5 holds them. In v4 the order didn't matter: the first Color and the
 * first Lighting layer were used, with or without their (unshown) eye, Depth was painted over the
 * Color layer's colour, and Image layers filled the material's texture slots. So the stack becomes
 * Lighting, Depth, Color, Image, all Normal; the Color layer's opacity becomes the object's, which
 * keeps a Depth layer blending into the colour under it by its own opacity and the object exactly
 * as see-through as it was.
 */
const migrateLayersToV5 = (entity: unknown): unknown => {
  if (!isPlainObject(entity) || !Array.isArray(entity.materialLayers)) return entity;
  const layers: Record<string, unknown>[] = entity.materialLayers.filter(isPlainObject).map((layer) => ({ blendMode: "normal", ...layer }));
  const color = layers.find((layer) => layer.type === "color");
  const lighting = layers.find((layer) => layer.type === "lighting") ?? (layers.length > 0 ? v4DefaultLighting() : undefined);
  const depths = layers.filter((layer) => layer.type === "depth");

  let opacity: number | undefined;
  let newColor: Record<string, unknown> | undefined;
  if (color) {
    opacity = typeof color.opacity === "number" ? color.opacity : undefined;
    for (const key of SURFACE_KEYS) {
      if (color[key] !== undefined && lighting) lighting[key] = color[key];
      delete color[key];
    }
    color.opacity = 1;
    color.enabled = true;
  } else if (depths.length > 0) {
    // v4 painted Depth over white when there was no Color layer.
    newColor = { id: createId("entity"), type: "color", enabled: true, opacity: 1, blendMode: "normal", color: "#ffffff" };
  }
  if (lighting) lighting.enabled = true;

  const rank = (layer: Record<string, unknown>): number =>
    layer === lighting ? 0 : layer.type === "depth" ? 1 : layer === color ? 2 : layer.type === "color" ? 3 : layer.type === "image" ? 4 : 5;
  const ordered = [...(lighting && !layers.includes(lighting) ? [lighting] : []), ...layers, ...(newColor ? [newColor] : [])];
  const stack = ordered.map((layer, index) => ({ layer, index })).sort((a, b) => rank(a.layer) - rank(b.layer) || a.index - b.index).map(({ layer }) => layer);

  return {
    ...entity,
    materialLayers: stack,
    ...(opacity !== undefined && opacity !== 1 ? { opacity } : null),
  };
};

export const toSceneDocument = (content: SceneContent): SceneDocument => ({
  format: SCENE_DOCUMENT_FORMAT,
  schemaVersion: CURRENT_SCENE_SCHEMA_VERSION,
  // A deep copy, so the document never shares vectors or layers with the live store.
  scene: structuredClone({
    entities: content.entities,
    sceneSettings: content.sceneSettings,
    postProcessing: content.postProcessing,
    frame: content.frame,
    cameraProfiles: content.cameraProfiles,
    activeProfileId: content.activeProfileId,
    animation: content.animation,
    // Entries left by deleted states or objects mean Base anyway; they needn't be kept.
    viewedStates: pruneViewedStates(content.viewedStates, content.animation.states),
    materials: content.materials,
  }),
});

const isPlainObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

export const parseSceneDocument = (raw: unknown): ParsedSceneDocument => {
  if (!isPlainObject(raw) || raw.format !== SCENE_DOCUMENT_FORMAT) {
    return { ok: false, reason: "invalid" };
  }

  const version = raw.schemaVersion;

  if (typeof version !== "number" || !Number.isInteger(version) || version < 1) {
    return { ok: false, reason: "invalid" };
  }

  if (version > CURRENT_SCENE_SCHEMA_VERSION) {
    return { ok: false, reason: "newer" };
  }

  let document: Record<string, unknown> = structuredClone(raw);

  for (let from = version; from < CURRENT_SCENE_SCHEMA_VERSION; from += 1) {
    document = migrations[from](document);
  }

  const scene = document.scene;

  if (!isPlainObject(scene) || !Array.isArray(scene.entities)) {
    return { ok: false, reason: "invalid" };
  }

  return {
    ok: true,
    content: {
      entities: scene.entities as Entity[],
      sceneSettings: isPlainObject(scene.sceneSettings) ? scene.sceneSettings : undefined,
      postProcessing: isPlainObject(scene.postProcessing) ? scene.postProcessing : undefined,
      frame: isPlainObject(scene.frame) ? scene.frame : undefined,
      cameraProfiles: isPlainObject(scene.cameraProfiles)
        ? (scene.cameraProfiles as Record<string, CameraProfile>)
        : undefined,
      activeProfileId: typeof scene.activeProfileId === "string" ? scene.activeProfileId : undefined,
      // Events are read into shape here (normalizeEvents), so a damaged one can't break the panel or Play.
      animation: isPlainObject(scene.animation)
        ? { ...(scene.animation as Partial<SceneAnimation>), events: normalizeEvents(scene.animation.events) }
        : undefined,
      viewedStates: isPlainObject(scene.viewedStates) ? (scene.viewedStates as Record<string, string>) : undefined,
      materials: isPlainObject(scene.materials) ? (scene.materials as Record<string, MaterialAsset>) : undefined,
    },
  };
};
