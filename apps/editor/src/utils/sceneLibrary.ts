/**
 * PURPOSE: The browser side of the signed-in user's scenes: the gallery's list, and the editor's
 * open/save/rename/delete, all through `/api/scenes` (see `awsSceneHandler.ts` for the server).
 *
 * Kept free of the store and Three.js so the gallery can import it without pulling in the editor.
 * Calls go through `apiFetch`, which throws `ApiAuthError` when the session is gone.
 */
import { apiFetch } from "./apiFetch";
import { getEditorSessionId } from "./editorSession";

export interface SceneSummary {
  sceneId: string;
  name: string;
  /** ISO 8601 timestamp of the last save. */
  updatedAt: string;
  /** Short-lived presigned URL for the gallery thumbnail, once scenes have one (PR 6). */
  thumbnailUrl?: string;
}

/**
 * A failed scene request, with the server's status (404 gone, 409 saved elsewhere, 423 open in
 * another editor session, …) and the rest of its error body (`details`).
 */
export class SceneApiError extends Error {
  readonly status: number;
  readonly details: Record<string, unknown>;

  constructor(status: number, message: string, details: Record<string, unknown> = {}) {
    super(message);
    this.name = "SceneApiError";
    this.status = status;
    this.details = details;
  }
}

const SCENES_ENDPOINT = "/api/scenes";

const scenePath = (sceneId: string): string => `${SCENES_ENDPOINT}/${encodeURIComponent(sceneId)}`;

const lockPath = (sceneId: string): string => `${scenePath(sceneId)}/lock`;

const requestJson = async <T>(path: string, init: RequestInit = {}): Promise<T> => {
  const response = await apiFetch(path, {
    ...init,
    headers: init.body === undefined ? init.headers : { "Content-Type": "application/json", ...init.headers },
  });
  const body = (await response.json().catch(() => ({}))) as T & { error?: string };

  if (!response.ok) {
    throw new SceneApiError(response.status, body.error ?? `The request failed (${response.status}).`, body);
  }

  return body;
};

// Saves still in flight, e.g. the one the editor fires as it's left for the gallery.
const pendingSaves = new Set<Promise<unknown>>();

/** Whether any save is still in flight. */
export const hasPendingSaves = (): boolean => pendingSaves.size > 0;

/** Resolves once every save in flight now has landed or failed. */
export const settlePendingSaves = async (): Promise<void> => {
  await Promise.allSettled([...pendingSaves]);
};

export const listScenes = async (): Promise<SceneSummary[]> => {
  // Let a just-left scene's last save land first, so its card shows the right "Edited" time.
  await settlePendingSaves();
  const { scenes } = await requestJson<{ scenes: SceneSummary[] }>(SCENES_ENDPOINT);

  return scenes;
};

/** Creates an empty scene (revision 0); its first save gives it a document. */
export const createScene = async (options: { name?: string } = {}): Promise<SceneSummary> =>
  requestJson<SceneSummary>(SCENES_ENDPOINT, { method: "POST", body: JSON.stringify(options) });

/**
 * A scene's row as the editor needs it: the summary, the revision its next save builds on, and the
 * imported assets its saved document uses (all in the cloud, so never uploaded again).
 */
export interface OpenedScene extends SceneSummary {
  revision: number;
  assetHashes: string[];
}

/** One scene and its saved document; `document` is null until the scene's first save. */
export const getScene = async (sceneId: string): Promise<{ scene: OpenedScene; document: unknown }> =>
  requestJson(scenePath(sceneId));

/**
 * Saves a scene document on top of `baseRevision` and returns the new revision. Only works while
 * this tab holds the scene's editing lock (claimSceneLock). Fails with a SceneApiError: 423 when
 * another editor session holds the lock, 409 when the scene was saved since, 404 when it was deleted.
 */
export const saveScene = (
  sceneId: string,
  document: unknown,
  baseRevision: number,
): Promise<{ revision: number; updatedAt: string }> => {
  const save = requestJson<{ revision: number; updatedAt: string }>(scenePath(sceneId), {
    method: "PUT",
    body: JSON.stringify({ document, baseRevision, sessionId: getEditorSessionId() }),
  });

  pendingSaves.add(save);
  void save.catch(() => undefined).finally(() => pendingSaves.delete(save));

  return save;
};

/**
 * The outcome of claiming a scene's editing lock, with the scene's current revision either way.
 * `heldByYou`: whoever holds it is this user (another tab or device), not someone the scene was
 * shared with. Always true until scenes can be shared.
 */
export type LockClaim = { held: true; revision: number } | { held: false; revision: number; heldByYou: boolean };

/**
 * Claims this tab's editing lock on a scene, or renews it. `takeOver` moves it from whichever
 * session holds it. A lock held elsewhere is an outcome, not an error; other failures throw
 * (SceneApiError 404 for a deleted scene, ApiAuthError, network errors).
 */
export const claimSceneLock = async (sceneId: string, { takeOver = false } = {}): Promise<LockClaim> => {
  try {
    const { revision } = await requestJson<{ revision: number }>(lockPath(sceneId), {
      method: "POST",
      body: JSON.stringify({ sessionId: getEditorSessionId(), ...(takeOver ? { takeOver: true } : {}) }),
    });

    return { held: true, revision };
  } catch (error) {
    if (error instanceof SceneApiError && error.status === 423) {
      return {
        held: false,
        revision: typeof error.details.revision === "number" ? error.details.revision : 0,
        heldByYou: error.details.heldByYou !== false,
      };
    }

    throw error;
  }
};

/**
 * Gives up this tab's editing lock (a no-op if it no longer holds it). `keepalive` lets the request
 * outlive the page, for releasing as the tab closes.
 */
export const releaseSceneLock = async (sceneId: string, { keepalive = false } = {}): Promise<void> => {
  await requestJson(lockPath(sceneId), {
    method: "DELETE",
    keepalive,
    body: JSON.stringify({ sessionId: getEditorSessionId() }),
  });
};

/** A presigned PUT for one asset, and the headers it must be sent with (they're signed). */
export interface AssetUploadTicket {
  hash: string;
  url: string;
  headers: Record<string, string>;
}

/**
 * Presigned PUTs for the assets the cloud doesn't have yet; the rest get no ticket. Only works while
 * this tab holds the scene's editing lock (SceneApiError 423 otherwise; 413 for a file over the cap).
 */
export const requestAssetUploads = async (
  sceneId: string,
  assets: Array<{ hash: string; size: number; kind: "model" | "texture" }>,
): Promise<AssetUploadTicket[]> => {
  const { uploads } = await requestJson<{ uploads: AssetUploadTicket[] }>(`${scenePath(sceneId)}/assets/uploads`, {
    method: "POST",
    body: JSON.stringify({ sessionId: getEditorSessionId(), assets }),
  });

  return uploads;
};

/**
 * Presigned GETs for assets the scene's saved document uses; `unavailable` lists the requested ones
 * it doesn't. Doesn't need the editing lock.
 */
export const requestAssetDownloads = async (
  sceneId: string,
  hashes: string[],
): Promise<{ downloads: Array<{ hash: string; url: string }>; unavailable: string[] }> =>
  requestJson(`${scenePath(sceneId)}/assets/downloads`, { method: "POST", body: JSON.stringify({ hashes }) });

/** Renames a scene. Only its row changes: the document and revision stay as they are. */
export const renameScene = async (sceneId: string, name: string): Promise<{ name: string }> =>
  requestJson(scenePath(sceneId), { method: "PATCH", body: JSON.stringify({ name }) });

/** Deletes a scene and everything stored for it. */
export const deleteScene = async (sceneId: string): Promise<void> => {
  await requestJson(scenePath(sceneId), { method: "DELETE" });
};
