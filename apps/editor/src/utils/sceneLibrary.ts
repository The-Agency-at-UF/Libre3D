/**
 * PURPOSE: The browser side of the signed-in user's scenes: the gallery's list, and the editor's
 * open/save/rename/delete, all through `/api/scenes` (see `awsSceneHandler.ts` for the server).
 *
 * Kept free of the store and Three.js so the gallery can import it without pulling in the editor.
 * Calls go through `apiFetch`, which throws `ApiAuthError` when the session is gone.
 */
import { apiFetch } from "./apiFetch";

export interface SceneSummary {
  sceneId: string;
  name: string;
  /** ISO 8601 timestamp of the last save. */
  updatedAt: string;
  /** Short-lived presigned URL for the gallery thumbnail, once scenes have one (PR 6). */
  thumbnailUrl?: string;
}

/** A failed scene request, with the server's status (404 gone, 409 saved elsewhere, …). */
export class SceneApiError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "SceneApiError";
    this.status = status;
  }
}

const SCENES_ENDPOINT = "/api/scenes";

const scenePath = (sceneId: string): string => `${SCENES_ENDPOINT}/${encodeURIComponent(sceneId)}`;

const requestJson = async <T>(path: string, init: RequestInit = {}): Promise<T> => {
  const response = await apiFetch(path, {
    ...init,
    headers: init.body === undefined ? init.headers : { "Content-Type": "application/json", ...init.headers },
  });
  const body = (await response.json().catch(() => ({}))) as T & { error?: string };

  if (!response.ok) {
    throw new SceneApiError(response.status, body.error ?? `The request failed (${response.status}).`);
  }

  return body;
};

export const listScenes = async (): Promise<SceneSummary[]> => {
  const { scenes } = await requestJson<{ scenes: SceneSummary[] }>(SCENES_ENDPOINT);

  return scenes;
};

export const createScene = async (): Promise<{ sceneId: string }> =>
  requestJson<SceneSummary>(SCENES_ENDPOINT, { method: "POST", body: JSON.stringify({}) });
