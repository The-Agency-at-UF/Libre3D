/**
 * PURPOSE: This tab's editor session ID, which names who holds a scene's editing lock (see
 * sceneLock.ts and the lock routes in awsSceneHandler.ts).
 *
 * INPUT: Nothing; made the first time it's asked for.
 * OUTPUT: `getEditorSessionId()`, the same random UUID for as long as this page lives.
 *
 * One per tab, not per browser or user: two tabs on the same scene must be told apart. A reload
 * keeps the ID, so the reloaded page reclaims its own lock at once instead of opening read-only
 * until the old lease lapses. The ID is handed to the next page in sessionStorage on `pagehide` and
 * taken back (and removed) when the next page asks for it. It's never left there while the page is
 * open, because "Duplicate tab" copies sessionStorage and the copy must get an ID of its own.
 */

const HANDOFF_KEY = "libre3d-editor-session";
const SESSION_ID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

let sessionId: string | null = null;

// Storage can throw (disabled, private mode); a fresh ID is always a safe fallback.
const takeHandedOffId = (): string | null => {
  try {
    const handedOff = sessionStorage.getItem(HANDOFF_KEY);
    sessionStorage.removeItem(HANDOFF_KEY);
    return handedOff && SESSION_ID_PATTERN.test(handedOff) ? handedOff : null;
  } catch {
    return null;
  }
};

const handOff = (): void => {
  try {
    if (sessionId) {
      sessionStorage.setItem(HANDOFF_KEY, sessionId);
    }
  } catch {
    // The next page just gets a new ID.
  }
};

// Back from the back/forward cache: this page is alive again with its ID, so take the hand-off back
// before a "Duplicate tab" can copy it.
const reclaim = (event: PageTransitionEvent): void => {
  if (event.persisted) {
    takeHandedOffId();
  }
};

export const getEditorSessionId = (): string => {
  if (sessionId === null) {
    sessionId = takeHandedOffId() ?? crypto.randomUUID();
    window.addEventListener("pagehide", handOff);
    window.addEventListener("pageshow", reclaim as EventListener);
  }

  return sessionId;
};
