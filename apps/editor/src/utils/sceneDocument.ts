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
 * animation/objectStates.ts and animation/events.ts), and which state each object is shown in while editing, so it reopens
 * as it was left. Selection, the transform tool, projection mode, zoom, the HUD, preview state, and
 * undo history are editor state, not scene content, and stay out. The name lives on the scene's row in DynamoDB, so renaming never rewrites the document.
 *
 * Evolving the format:
 * - New data goes in its own optional top-level section (as `animation` did in v2), not inside
 *   entities. New optional fields on entities or settings don't need one: they're copied whole.
 *   New values a state can set do (as a path's trim did in v3): a state's values are copied only
 *   as far as the build knows them (objectStates.ts, cloneStateValues).
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
import type {
  CameraProfile,
  DeepPartial,
  Entity,
  FrameSettingsConfig,
  PostProcessingConfig,
  SceneSettingsConfig,
} from "../store/useEditorStore";

export const SCENE_DOCUMENT_FORMAT = "libre3d.scene";
export const CURRENT_SCENE_SCHEMA_VERSION = 3;

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
    },
  };
};
