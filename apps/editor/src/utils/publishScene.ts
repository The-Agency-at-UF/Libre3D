import { apiFetch } from "./apiFetch";

const PUBLISH_ENDPOINT = "/api/publish";

/** A publish the server refused, with its reason (the scene isn't saved yet, the link isn't yours, ...). */
export class PublishError extends Error {}

// The publish endpoint answers failures with `{ error }`. Keep that message so a failed publish
// says why instead of a bare status.
const readServerError = async (response: Response): Promise<string | null> => {
  try {
    const body = (await response.json()) as { error?: unknown };
    return typeof body.error === "string" && body.error ? body.error : null;
  } catch {
    return null;
  }
};

/**
 * Publishes the scene as last saved and returns its publish ID (share link:
 * `shareUrlFor(publishId)`). The server copies the saved document (awsPublishHandler.ts), so the
 * caller saves pending edits first. It picks the ID the first time and keeps it, so publishing
 * again updates the same link.
 *
 * Throws ApiAuthError when signed out or the session was rejected, and PublishError with the
 * server's reason when it refuses.
 */
export const publishScene = async (sceneId: string): Promise<{ publishId: string }> => {
  const response = await apiFetch(PUBLISH_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ sceneId }),
  });

  if (!response.ok) {
    throw new PublishError((await readServerError(response)) ?? `The scene could not be published (HTTP ${response.status}).`);
  }

  return (await response.json()) as { publishId: string };
};
