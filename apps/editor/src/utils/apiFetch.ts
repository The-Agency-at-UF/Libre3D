import { getAccessToken } from "./authSession";

/**
 * Raised when an API call can't be made as a signed-in user, or the server rejected the session,
 * so callers can say "sign in again" instead of showing a generic failure.
 */
export class ApiAuthError extends Error {
  constructor(message = "Your session has expired. Please sign in again.") {
    super(message);
    this.name = "ApiAuthError";
  }
}

/**
 * `fetch` for our own `/api/*` routes: adds `Authorization: Bearer <access token>`, refreshing the
 * token first when needed. Only for our API. Presigned S3 URLs must be called with plain `fetch`,
 * because the URL already carries its own signature and S3 rejects an extra Authorization header.
 */
export const apiFetch = async (path: string, init: RequestInit = {}): Promise<Response> => {
  if (!path.startsWith("/api/")) {
    throw new Error(`apiFetch is only for /api/* routes, not ${path}`);
  }

  const accessToken = await getAccessToken();

  if (!accessToken) {
    throw new ApiAuthError();
  }

  const headers = new Headers(init.headers);
  headers.set("Authorization", `Bearer ${accessToken}`);

  const response = await fetch(path, { ...init, headers });

  if (response.status === 401) {
    throw new ApiAuthError();
  }

  return response;
};
