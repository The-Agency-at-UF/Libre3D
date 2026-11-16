import { describe, expect, it } from "vitest";

import { activeSceneCameraId, resolveActiveCamera, sceneCameraEntity } from "./activeCamera";
import { DEFAULT_CAMERA_PROFILE, DEFAULT_SCENE_CAMERA } from "./defaults";
import { createEntity } from "./entityFactories";
import type { CameraProfile, Entity } from "./types";

const camera = (id: string, overrides: Partial<Entity> = {}): Entity => ({ ...createEntity("camera"), id, name: id, ...overrides });
const closeup: CameraProfile = { ...DEFAULT_CAMERA_PROFILE, id: "closeup", name: "Close", position: [1, 2, 3] };
const profiles = { personal: { ...DEFAULT_CAMERA_PROFILE, position: [9, 9, 9] as [number, number, number] }, closeup };

describe("resolveActiveCamera", () => {
  it("gives a camera profile the ID names", () => {
    expect(resolveActiveCamera({ activeProfileId: "closeup", cameraProfiles: profiles, entities: [] })).toEqual({ kind: "profile", id: "closeup", profile: closeup });
  });

  it("gives a scene camera the ID names, with its lens", () => {
    const shot = camera("shot", { camera: { ...DEFAULT_SCENE_CAMERA, fov: 30 } });
    const active = resolveActiveCamera({ activeProfileId: "shot", cameraProfiles: profiles, entities: [createEntity("cube"), shot] });

    expect(active).toMatchObject({ kind: "entity", id: "shot", entity: shot, lens: { fov: 30, projection: "perspective" } });
    expect(activeSceneCameraId({ activeProfileId: "shot", cameraProfiles: profiles, entities: [shot] })).toBe("shot");
  });

  it("fills in a damaged camera's lens with the defaults", () => {
    const active = resolveActiveCamera({ activeProfileId: "shot", entities: [camera("shot", { camera: undefined })] });
    expect(active.kind === "entity" && active.lens).toEqual(DEFAULT_SCENE_CAMERA);
  });

  it("gives the personal camera for an ID that names nothing: a deleted camera, or an object that isn't one", () => {
    for (const activeProfileId of ["deleted-camera", "cube-1", undefined]) {
      const active = resolveActiveCamera({ activeProfileId, cameraProfiles: profiles, entities: [{ ...createEntity("cube"), id: "cube-1" }] });
      expect(active).toEqual({ kind: "profile", id: "personal", profile: profiles.personal });
      expect(activeSceneCameraId({ activeProfileId, cameraProfiles: profiles, entities: [] })).toBeNull();
    }
  });

  it("gives the default camera when a document holds no profiles", () => {
    expect(resolveActiveCamera({ entities: [] })).toEqual({ kind: "profile", id: "personal", profile: DEFAULT_CAMERA_PROFILE });
  });

  it("finds scene cameras only", () => {
    const cube = { ...createEntity("cube"), id: "cube-1" };
    expect(sceneCameraEntity([cube, camera("shot")], "shot")?.id).toBe("shot");
    expect(sceneCameraEntity([cube], "cube-1")).toBeUndefined();
    expect(sceneCameraEntity([cube], undefined)).toBeUndefined();
  });
});
