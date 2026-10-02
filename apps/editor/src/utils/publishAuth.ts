/**
 * PURPOSE: Server-side gate for the publish endpoint.
 *
 * INPUT: The incoming request headers and the server environment.
 * OUTPUT: Whether the caller may mint a presigned S3 upload URL.
 *
 * `/api/publish` hands out presigned write access to the scene bucket, so an open endpoint lets
 * anyone upload into it. A single shared passphrase (`PUBLISH_TOKEN`) keeps drive-by abuse out.
 * It is deliberately not per-user auth: the token reaches the browser of everyone allowed to
 * publish, so it proves "someone with the passphrase", and revoking means rotating it for all.
 *
 * Both the Vercel function and the Vite dev middleware call this, so the two cannot drift.
 */

import { createHash, timingSafeEqual } from "node:crypto";
import type { IncomingHttpHeaders } from "node:http";

type PublishAuthEnv = Record<string, string | undefined>;

export type PublishAuthResult = { authorized: true } | { authorized: false; status: number; error: string };

export const PUBLISH_TOKEN_HEADER = "x-publish-token";

// Hashing both sides first keeps the comparison constant-length, so timingSafeEqual cannot throw
// on a length mismatch and the token's length does not leak through response timing.
const digest = (value: string): Buffer => createHash("sha256").update(value).digest();

export const authorizePublishRequest = (headers: IncomingHttpHeaders, env: PublishAuthEnv): PublishAuthResult => {
  const expectedToken = env.PUBLISH_TOKEN;

  // Fail closed. An unset token means the deployment is misconfigured, not that publishing is open.
  if (!expectedToken) {
    return { authorized: false, status: 503, error: "Publishing is not configured on this deployment." };
  }

  const rawHeader = headers[PUBLISH_TOKEN_HEADER];
  const providedToken = Array.isArray(rawHeader) ? rawHeader[0] : rawHeader;

  if (!providedToken) {
    return { authorized: false, status: 401, error: "A publish passphrase is required." };
  }

  if (!timingSafeEqual(digest(providedToken), digest(expectedToken))) {
    return { authorized: false, status: 401, error: "That publish passphrase is not valid." };
  }

  return { authorized: true };
};
