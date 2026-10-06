/**
 * PURPOSE: Server-side check that a request comes from a signed-in Libre3D user.
 *
 * INPUT: The incoming request headers (`Authorization: Bearer <access token>`) and the server env.
 * OUTPUT: The caller's user ID (the token's `sub`), or the status and message to reject with.
 *
 * Cognito signs every token with a private key and publishes the matching public keys, so checking
 * a token needs no AWS credentials and no call to Cognito per request: the verifier downloads the
 * public keys once, caches them, and checks the signature, expiry, issuer (our user pool), token
 * use (`access`), and app client. The user ID comes only from a token that passes, never from the
 * request body, so a caller cannot act as someone else by editing a request.
 *
 * Both the Vercel functions and the Vite dev middleware call this, so the two cannot drift.
 */

import type { IncomingHttpHeaders } from "node:http";

import { CognitoJwtVerifier } from "aws-jwt-verify";

type VerifyAuthEnv = Record<string, string | undefined>;

export type VerifyAuthResult =
  | { authorized: true; userId: string }
  | { authorized: false; status: number; error: string };

type AccessTokenVerifier = ReturnType<typeof createAccessTokenVerifier>;

const createAccessTokenVerifier = (userPoolId: string, clientId: string) =>
  CognitoJwtVerifier.create({ userPoolId, clientId, tokenUse: "access" });

// One verifier per pool/client, so the downloaded public keys are cached across requests (and,
// on Vercel, across invocations of a warm function).
const verifiers = new Map<string, AccessTokenVerifier>();

const getVerifier = (userPoolId: string, clientId: string): AccessTokenVerifier => {
  const cacheKey = `${userPoolId}/${clientId}`;
  let verifier = verifiers.get(cacheKey);

  if (!verifier) {
    verifier = createAccessTokenVerifier(userPoolId, clientId);
    verifiers.set(cacheKey, verifier);
  }

  return verifier;
};

const readBearerToken = (headers: IncomingHttpHeaders): string | null => {
  const header = headers.authorization;
  const match = header?.match(/^Bearer\s+(\S+)$/i);

  return match ? match[1] : null;
};

export const verifyAuth = async (headers: IncomingHttpHeaders, env: VerifyAuthEnv): Promise<VerifyAuthResult> => {
  // The same public values the browser bundle uses; they are not secrets.
  const userPoolId = env.VITE_COGNITO_USER_POOL_ID;
  const clientId = env.VITE_COGNITO_CLIENT_ID;

  // Fail closed. Missing config means the deployment is misconfigured, not that the API is open.
  if (!userPoolId || !clientId) {
    return { authorized: false, status: 503, error: "Sign-in is not configured on this deployment." };
  }

  const token = readBearerToken(headers);

  if (!token) {
    return { authorized: false, status: 401, error: "You need to be signed in to do that." };
  }

  try {
    const payload = await getVerifier(userPoolId, clientId).verify(token);
    return { authorized: true, userId: payload.sub };
  } catch (error) {
    // Expired, tampered with, from another pool or client, or an ID token sent as an access token.
    console.warn("Rejected an access token:", error instanceof Error ? error.message : error);
    return { authorized: false, status: 401, error: "Your session has expired. Please sign in again." };
  }
};
