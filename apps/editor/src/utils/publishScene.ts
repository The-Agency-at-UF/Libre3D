import type * as THREE from "three";

import { apiFetch } from "./apiFetch";
import { createSceneExportBlob } from "./exportScene";
import { normalizePublishedBgColor } from "./publishedSceneStyle";

interface PublishSession {
  publishId: string;
  uploadUrl: string;
}

const PUBLISH_ENDPOINT = "/api/publish";

// Throws ApiAuthError when signed out or the session was rejected; the caller reports that.
const readPublishSession = async (sceneId: string, bgColor: string | null): Promise<PublishSession> => {
  const response = await apiFetch(PUBLISH_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ sceneId, bgColor }),
  });

  if (!response.ok) {
    throw new Error(`Failed to create a publish session (${response.status}).`);
  }

  return (await response.json()) as PublishSession;
};

const uploadSceneBlob = async (uploadUrl: string, blob: Blob): Promise<void> => {
  const response = await fetch(uploadUrl, {
    method: "PUT",
    headers: {
      "Content-Type": "model/gltf-binary",
    },
    body: blob,
  });

  if (!response.ok) {
    throw new Error("Failed to upload the exported scene to S3.");
  }
};

/**
 * Publishes the live scene as the given scene's public copy and returns its publish ID (share link:
 * `shareUrlFor(publishId)`). The server picks the ID the first time and keeps it, so publishing
 * again updates the same link. Null when there's nothing to export.
 *
 * `bgColor` is the editor's scene background. The GLB can't carry it (glTF has no background), so
 * it is sent alongside and stored on the published row for the share page to apply.
 */
export const publishLiveScene = async (
  scene: THREE.Scene,
  sceneId: string,
  bgColor: string,
): Promise<{ publishId: string } | null> => {
  const sceneBlob = await createSceneExportBlob(scene, "glb");

  if (!sceneBlob) {
    return null;
  }

  const session = await readPublishSession(sceneId, normalizePublishedBgColor(bgColor));
  await uploadSceneBlob(session.uploadUrl, sceneBlob);

  return { publishId: session.publishId };
};
