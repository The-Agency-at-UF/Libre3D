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

// Saves still in flight, e.g. the one the editor fires as it's left for the gallery.
const pendingSaves = new Set<Promise<unknown>>();

export const listScenes = async (): Promise<SceneSummary[]> => {
  // Let a just-left scene's last save land first, so its card shows the right "Edited" time.
  await Promise.allSettled([...pendingSaves]);
  const { scenes } = await requestJson<{ scenes: SceneSummary[] }>(SCENES_ENDPOINT);

  return scenes;
};

/** Creates a scene; `document` only when uploading a scene saved in the browser before cloud saving. */
export const createScene = async (options: { name?: string; document?: unknown } = {}): Promise<SceneSummary> =>
  requestJson<SceneSummary>(SCENES_ENDPOINT, { method: "POST", body: JSON.stringify(options) });

/** A scene's row as the editor needs it: the summary plus the revision its next save builds on. */
export interface OpenedScene extends SceneSummary {
  revision: number;
}

/** One scene and its saved document; `document` is null until the scene's first save. */
export const getScene = async (sceneId: string): Promise<{ scene: OpenedScene; document: unknown }> =>
  requestJson(scenePath(sceneId));

/**
 * Saves a scene document on top of `baseRevision` and returns the new revision. Fails with a
 * SceneApiError: 409 when the scene was saved from somewhere else since, 404 when it was deleted.
 */
export const saveScene = (
  sceneId: string,
  document: unknown,
  baseRevision: number,
): Promise<{ revision: number; updatedAt: string }> => {
  const save = requestJson<{ revision: number; updatedAt: string }>(scenePath(sceneId), {
    method: "PUT",
    body: JSON.stringify({ document, baseRevision }),
  });

  pendingSaves.add(save);
  void save.catch(() => undefined).finally(() => pendingSaves.delete(save));

  return save;
};

/** Renames a scene. Only its row changes: the document and revision stay as they are. */
export const renameScene = async (sceneId: string, name: string): Promise<{ name: string }> =>
  requestJson(scenePath(sceneId), { method: "PATCH", body: JSON.stringify({ name }) });

/** Deletes a scene and everything stored for it. */
export const deleteScene = async (sceneId: string): Promise<void> => {
  await requestJson(scenePath(sceneId), { method: "DELETE" });
};
