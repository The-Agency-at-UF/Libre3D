import type * as THREE from "three";

import { createSceneExportBlob } from "./exportScene";

export interface PublishSceneResponse {
  sceneId: string;
  assetKey: string;
  uploadUrl: string;
  shareUrl: string;
}

export interface PublishSceneResult {
  sceneId: string;
  shareUrl: string;
}

const PUBLISH_ENDPOINT = "/api/publish";
const PUBLISH_TOKEN_HEADER = "x-publish-token";

/**
 * Raised when the publish endpoint rejects the passphrase, so the caller can prompt for a new one
 * instead of showing the generic failure alert.
 */
export class PublishAuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PublishAuthError";
  }
}

const readPublishSession = async (
  currentPublishId: string | null,
  publishToken: string,
): Promise<PublishSceneResponse> => {
  const response = await fetch(PUBLISH_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      [PUBLISH_TOKEN_HEADER]: publishToken,
    },
    body: JSON.stringify({ currentPublishId }),
  });

  if (response.status === 401) {
    throw new PublishAuthError("The publish passphrase was missing or incorrect.");
  }

  if (!response.ok) {
    throw new Error("Failed to create a publish session.");
  }

  return (await response.json()) as PublishSceneResponse;
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

export const publishLiveScene = async (
  scene: THREE.Scene,
  currentPublishId: string | null,
  publishToken: string,
): Promise<PublishSceneResult | null> => {
  const sceneBlob = await createSceneExportBlob(scene, "glb");

  if (!sceneBlob) {
    return null;
  }

  const session = await readPublishSession(currentPublishId, publishToken);
  await uploadSceneBlob(session.uploadUrl, sceneBlob);

  return {
    sceneId: session.sceneId,
    shareUrl: session.shareUrl,
  };
};