/**
 * PURPOSE: The saved form of a scene: what goes to the cloud (`/api/scenes/:id`), the local cache of
 * the open scene, and the one-time upload of a scene saved in the browser before cloud saving.
 *
 * INPUT: The scene content from the store (`toSceneDocument`), or a document read back from
 *        anywhere (`parseSceneDocument`, which migrates it to the current schema).
 * OUTPUT: A plain, versioned JSON object, independent of the store's live references.
 *
 * Only the scene itself goes in: entities, scene/post-processing/frame settings, and camera
 * profiles. Selection, the transform tool, projection mode, zoom, the HUD, preview state, and undo
 * history are editor state, not scene content, and stay out. The name lives on the scene's row in
 * DynamoDB, so renaming never rewrites the document.
 *
 * Evolving the format (e.g. the animation timeline):
 * - New data goes in its own optional top-level section (`animation: { duration, tracks }`), not
 *   inside entities. Tracks will point at what they animate by stable ID (entity IDs survive save
 *   and load), so they can later target camera profiles or scene settings too.
 * - Adding a section bumps `CURRENT_SCENE_SCHEMA_VERSION` and adds a migration that fills in its
 *   empty default. Old documents upgrade on read; nothing breaks.
 * - A document newer than this build is refused rather than loaded: otherwise a tab still running an
 *   old bundle would drop the parts it doesn't know about (keyframes) on its next autosave.
 *
 * The nested settings objects are deep-merged over the current defaults when the store loads the
 * content (`loadScene`), so a field added to the defaults later keeps its default for old scenes.
 */

import type {
  CameraProfile,
  DeepPartial,
  Entity,
  FrameSettingsConfig,
  PostProcessingConfig,
  SceneSettingsConfig,
} from "../store/useEditorStore";

export const SCENE_DOCUMENT_FORMAT = "libre3d.scene";
export const CURRENT_SCENE_SCHEMA_VERSION = 1;

/** The parts of the editor state that make up a scene. */
export interface SceneContent {
  entities: Entity[];
  sceneSettings: SceneSettingsConfig;
  postProcessing: PostProcessingConfig;
  frame: FrameSettingsConfig;
  cameraProfiles: Record<string, CameraProfile>;
  activeProfileId: string;
}

/** Scene content as read back from a document: settings may predate fields added since. */
export interface StoredSceneContent {
  entities: Entity[];
  sceneSettings?: DeepPartial<SceneSettingsConfig>;
  postProcessing?: DeepPartial<PostProcessingConfig>;
  frame?: DeepPartial<FrameSettingsConfig>;
  cameraProfiles?: Record<string, CameraProfile>;
  activeProfileId?: string;
}

export interface SceneDocument {
  format: typeof SCENE_DOCUMENT_FORMAT;
  schemaVersion: number;
  scene: SceneContent;
}

export type ParsedSceneDocument =
  | { ok: true; content: StoredSceneContent }
  | { ok: false; reason: "invalid" | "newer" };

// Each entry upgrades a document from schema version N to N + 1. Example for the timeline:
//   1: (document) => ({ ...document, schemaVersion: 2, animation: { duration: 5, tracks: [] } }),
// `any` because a migration's input is, by definition, a shape the current types don't describe.
const migrations: Record<number, (document: any) => any> = {};

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
    },
  };
};

const isPristineDefaultCube = (entity: Entity): boolean =>
  entity.type === "cube" &&
  entity.name === "Cube" &&
  !entity.parentId &&
  entity.position.every((value) => value === 0) &&
  entity.rotation.every((value) => value === 0) &&
  entity.scale.every((value) => value === 1);

/**
 * Whether a scene holds anything worth keeping: more than lights, and more than the untouched cube
 * every new scene starts with. Decides whether a scene saved before cloud saving is offered for
 * upload.
 */
export const hasSceneContent = (entities: Entity[]): boolean => {
  const nonLights = entities.filter((entity) => entity.type !== "directionalLight");

  return nonLights.length > 1 || (nonLights.length === 1 && !isPristineDefaultCube(nonLights[0]));
};
