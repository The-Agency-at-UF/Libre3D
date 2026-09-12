/**
 * PURPOSE: Browser-side storage for the shared publish passphrase.
 *
 * INPUT/OUTPUT: Reads and writes a single localStorage key.
 *
 * Kept out of `useEditorStore` on purpose. This is a per-browser credential rather than editor
 * state, and routing it through the store would drag it into the persisted scene blob and zundo's
 * undo history. Mirrors the plain-localStorage pattern already used for `libre3d-theme` and
 * `libre3d-left-sidebar-width` in `App.tsx`.
 */

const PUBLISH_TOKEN_STORAGE_KEY = "libre3d-publish-token";

export const readPublishToken = (): string => {
  try {
    return localStorage.getItem(PUBLISH_TOKEN_STORAGE_KEY) ?? "";
  } catch {
    // Private-mode browsers can throw on access; treat it as "no token stored".
    return "";
  }
};

export const writePublishToken = (token: string): void => {
  try {
    localStorage.setItem(PUBLISH_TOKEN_STORAGE_KEY, token);
  } catch {
    // Non-fatal: the passphrase still applies to the current publish, just not the next session.
  }
};

export const clearPublishToken = (): void => {
  try {
    localStorage.removeItem(PUBLISH_TOKEN_STORAGE_KEY);
  } catch {
    // Nothing to do; a stale token simply prompts again on the next failure.
  }
};
