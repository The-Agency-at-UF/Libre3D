/**
 * PURPOSE: The gallery's data source: the signed-in user's scenes.
 *
 * STUB until PR 3 (cloud scenes). There is no scene list yet, so `listScenes` returns none and
 * `createScene` only mints an ID; the editor still opens the one scene saved in this browser
 * whatever the ID. PR 3 replaces these two bodies with `/api/*` calls through `apiFetch`. The
 * signatures are all the gallery depends on.
 */
import { createId } from "./createId";

export interface SceneSummary {
  sceneId: string;
  name: string;
  /** ISO 8601 timestamp of the last save. */
  updatedAt: string;
  /** Short-lived presigned URL for the gallery thumbnail, once scenes have one (PR 6). */
  thumbnailUrl?: string;
}

export const listScenes = async (): Promise<SceneSummary[]> => [];

export const createScene = async (): Promise<{ sceneId: string }> => ({ sceneId: createId("scene") });
