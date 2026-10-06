/**
 * PURPOSE: This tab's editor session ID, which names who holds a scene's editing lock (see
 * sceneLock.ts and the lock routes in awsSceneHandler.ts).
 *
 * INPUT: Nothing; made the first time it's asked for.
 * OUTPUT: `getEditorSessionId()`, the same random UUID for as long as this page lives.
 *
 * One per page, not per browser or user: two tabs on the same scene must be told apart, and a
 * "Duplicate tab" is a new page with an ID of its own. So is a reload, which rarely matters: the
 * page releases its lock as it goes (`pagehide`), and the reloaded page claims it again. Only a
 * reload with edits still unsaved keeps the old lock (the release could overtake the last save), so
 * that page opens view only until the old lease lapses (60 s at most) or Take over is clicked.
 */

let sessionId: string | null = null;

export const getEditorSessionId = (): string => {
  sessionId ??= crypto.randomUUID();
  return sessionId;
};
