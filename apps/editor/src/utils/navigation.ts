/**
 * PURPOSE: Client-side navigation for the hand-rolled router in App.tsx (no router library).
 *
 * The URL is the only state: `navigate` pushes a history entry and announces it, and
 * `usePathname` re-renders on that announcement and on Back/Forward (`popstate`). Every path the
 * app can navigate to also needs a rewrite in `vercel.json`, or a hard refresh on it 404s.
 */

import { sanitizeReturnTo } from "./authSession";

// pushState/replaceState fire no event of their own; this one tells subscribers the URL changed.
const NAVIGATE_EVENT = "libre3d-navigate";

/** Where signed-in visitors to `/` land when no `?next` says otherwise. */
export const HOME_PATH = "/scenes";

const NEXT_PARAM = "next";

export const navigate = (path: string, options: { replace?: boolean } = {}): void => {
  if (options.replace) {
    window.history.replaceState(null, "", path);
  } else {
    window.history.pushState(null, "", path);
  }

  window.dispatchEvent(new Event(NAVIGATE_EVENT));
};

export const getPathname = (): string => window.location.pathname;

/** The landing page, remembering that the visitor was headed to `path` before being asked to sign in. */
export const landingPathFor = (path: string): string => `/?${new URLSearchParams({ [NEXT_PARAM]: path })}`;

/**
 * Where to go once signed in: the landing page's `?next` when it is a same-site path other than
 * the landing page itself (which would bounce straight back here), else the gallery.
 */
export const getPostSignInPath = (): string => {
  const next = sanitizeReturnTo(new URLSearchParams(window.location.search).get(NEXT_PARAM));

  return new URL(next, window.location.origin).pathname === "/" ? HOME_PATH : next;
};

export const subscribeToLocation = (listener: () => void): (() => void) => {
  window.addEventListener(NAVIGATE_EVENT, listener);
  window.addEventListener("popstate", listener);

  return () => {
    window.removeEventListener(NAVIGATE_EVENT, listener);
    window.removeEventListener("popstate", listener);
  };
};
