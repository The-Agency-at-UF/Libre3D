/**
 * PURPOSE: Validation for the scene styling that travels with a published scene.
 *
 * INPUT: Untrusted values — the colour in a publish request, or one read back from DynamoDB.
 * OUTPUT: A normalized `#rrggbb`-style hex colour, or null when the value isn't one.
 *
 * glTF has no notion of a background colour, so the exported GLB cannot carry the scene's
 * `bgColor`. It is stored on the published-scenes row instead and applied by `PublicViewer`. The value
 * is user-entered, persisted server-side, and then written into a style for anyone who opens the
 * share link, so it is checked as a strict hex colour both on the way in (publish) and on the way
 * out (viewer) — never passed through as arbitrary CSS.
 *
 * Shared by the Vercel functions, the Vite dev middleware and the browser, so it must stay free
 * of Node and DOM APIs.
 */

const HEX_COLOR = /^#?([0-9a-f]{3}|[0-9a-f]{4}|[0-9a-f]{6}|[0-9a-f]{8})$/i;

export const normalizePublishedBgColor = (value: unknown): string | null => {
  if (typeof value !== "string") {
    return null;
  }

  const match = HEX_COLOR.exec(value.trim());

  return match ? `#${match[1].toLowerCase()}` : null;
};
