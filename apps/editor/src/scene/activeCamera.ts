/**
 * PURPOSE: Which camera a scene is seen through (decision tree §C3, C6): the one picked in the
 * viewport's camera dropdown, which is also the one Play and the share link use.
 *
 * INPUT: A scene's `activeProfileId`, camera profiles, and entities (the store's state, or a
 *        published document's content).
 * OUTPUT: The camera profile, or the scene camera entity with its lens.
 *
 * `activeProfileId` holds a camera profile's ID or a scene camera entity's. An ID that names
 * neither (a camera deleted since, a damaged document) means the personal camera, so a deleted
 * camera needs no clean-up and undoing the deletion looks through it again. The editor, Play, and
 * the share-link viewer all ask here, so they can't disagree. Pure: no store, no Three.
 */

import { DEFAULT_CAMERA_PROFILE, DEFAULT_CAMERA_PROFILE_ID, DEFAULT_SCENE_CAMERA } from "./defaults";
import { getEntityIndex } from "./entityIndex";
import type { CameraProfile, Entity, SceneCameraSettings } from "./types";

export interface CameraContent {
  activeProfileId?: string;
  cameraProfiles?: Record<string, CameraProfile>;
  entities: Entity[];
}

export type ActiveCamera =
  | { kind: "profile"; id: string; profile: CameraProfile }
  | { kind: "entity"; id: string; entity: Entity; lens: SceneCameraSettings };

/** The scene camera entity `id` names, or undefined. */
export const sceneCameraEntity = (entities: Entity[], id: string | undefined): Entity | undefined => {
  const entity = id === undefined ? undefined : getEntityIndex(entities).byId.get(id);
  return entity?.type === "camera" ? entity : undefined;
};

/** A scene camera's lens, with the defaults under what it holds (a damaged one included). */
export const lensOf = (entity: Entity): SceneCameraSettings => ({ ...DEFAULT_SCENE_CAMERA, ...entity.camera });

/** The camera the scene is seen through. A profile is filled in with the default camera's values. */
export const resolveActiveCamera = ({ activeProfileId, cameraProfiles = {}, entities }: CameraContent): ActiveCamera => {
  const id = activeProfileId ?? DEFAULT_CAMERA_PROFILE_ID;
  const profile = cameraProfiles[id];
  if (profile) return { kind: "profile", id, profile: { ...DEFAULT_CAMERA_PROFILE, ...profile } };

  const entity = sceneCameraEntity(entities, id);
  if (entity) return { kind: "entity", id, entity, lens: lensOf(entity) };

  const personal = cameraProfiles[DEFAULT_CAMERA_PROFILE_ID];
  return { kind: "profile", id: DEFAULT_CAMERA_PROFILE_ID, profile: { ...DEFAULT_CAMERA_PROFILE, ...personal } };
};

/** The scene camera the scene is seen through, or null when it's a camera profile. */
export const activeSceneCameraId = (content: CameraContent): string | null => {
  const active = resolveActiveCamera(content);
  return active.kind === "entity" ? active.id : null;
};
