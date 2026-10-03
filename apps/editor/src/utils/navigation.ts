/**
 * PURPOSE: Client-side navigation for the hand-rolled router in App.tsx (no router library).
 *
 * The URL is the only state: `navigate` pushes a history entry and announces it, and
 * `usePathname` re-renders on that announcement and on Back/Forward (`popstate`). Every path the
 * app can navigate to also needs a rewrite in `vercel.json`, or a hard refresh on it 404s.
 */

// pushState/replaceState fire no event of their own; this one tells subscribers the URL changed.
const NAVIGATE_EVENT = "libre3d-navigate";

export const navigate = (path: string, options: { replace?: boolean } = {}): void => {
  if (options.replace) {
    window.history.replaceState(null, "", path);
  } else {
    window.history.pushState(null, "", path);
  }

  window.dispatchEvent(new Event(NAVIGATE_EVENT));
};

export const getPathname = (): string => window.location.pathname;

export const subscribeToLocation = (listener: () => void): (() => void) => {
  window.addEventListener(NAVIGATE_EVENT, listener);
  window.addEventListener("popstate", listener);

  return () => {
    window.removeEventListener(NAVIGATE_EVENT, listener);
    window.removeEventListener("popstate", listener);
  };
};
