/**
 * PURPOSE: Which links an Open Link action may open (C2). The run-time check is the one that counts:
 * a document can be edited by hand, so the runtime emits a link only through `safeLinkUrl`.
 *
 * INPUT: A link as the author typed it.
 * OUTPUT: `safeLinkUrl` (the normalized href of an allowed link, or null), `linkProblem` (why the
 *         Edit Event panel warns), `withHttps` (the fix it offers for a bare domain).
 *
 * Only web pages (http, https) and email (mailto) are allowed; `javascript:`, `data:`, `file:` and
 * everything else are refused. Nothing is fixed up silently: `example.com` is refused at run time,
 * and the panel offers `https://example.com` instead. Pure (`URL` exists in Node and browsers).
 */

const ALLOWED_PROTOCOLS = new Set(["http:", "https:", "mailto:"]);

/** The link's normalized href when it may be opened, or null (empty, relative, unparseable, or not http/https/mailto). */
export const safeLinkUrl = (raw: string): string | null => {
  const text = raw.trim();
  if (!text) return null;
  let url: URL;
  try {
    url = new URL(text);
  } catch {
    return null;
  }
  return ALLOWED_PROTOCOLS.has(url.protocol) ? url.href : null;
};

/** Why a link can't open, for the panel's warning: none typed, or not a web or email link. Null when it can. */
export const linkProblem = (raw: string): "empty" | "unsafe" | null =>
  !raw.trim() ? "empty" : safeLinkUrl(raw) ? null : "unsafe";

/** `https://` + a link typed without a scheme (`example.com/page`), when that makes it one that opens; else null. */
export const withHttps = (raw: string): string | null => {
  const text = raw.trim();
  // A scheme already (but `host:port` is a host with a port, not a scheme).
  if (!text || /^[a-z][a-z0-9+.-]*:(?!\d+([/?#]|$))/i.test(text) || text.startsWith("/")) return null;
  const fixed = safeLinkUrl(`https://${text}`);
  // A host with a dot (example.com) or localhost, not a stray word.
  return fixed && /^https:\/\/([^/?#]+\.[^/?#]+|localhost)([:/?#]|$)/i.test(fixed) ? fixed : null;
};
