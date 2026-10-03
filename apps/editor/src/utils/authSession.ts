/**
 * PURPOSE: Browser-side sign-in session for the Cognito hosted login (managed login).
 *
 * INPUT: `VITE_COGNITO_DOMAIN` and `VITE_COGNITO_CLIENT_ID`, plus the redirect back from Cognito.
 * OUTPUT: Whether someone is signed in, and a fresh access token for calls to our own `/api/*`.
 *
 * Sign-in is the OAuth 2.0 authorization-code flow with PKCE: the app never sees a password or an
 * MFA code. `startSignIn` sends the browser to Cognito with a hash of a one-time secret (the
 * verifier); Cognito sends it back to `/auth/callback` with a short-lived code, and
 * `completeSignIn` trades that code plus the original secret for tokens. A stolen code is useless
 * without the secret, which is what makes a client with no client secret safe.
 *
 * Kept out of `useEditorStore` on purpose: a credential is not
 * editor state, and routing it through the store would put tokens into the persisted scene blob and
 * zundo's undo history. Components read it through `useAuthSession`.
 */

export type AuthSnapshot = { status: "signedIn"; email: string | null } | { status: "signedOut" };

interface StoredTokens {
  accessToken: string;
  idToken: string;
  refreshToken: string;
  /** Epoch milliseconds when the access token stops being accepted. */
  expiresAt: number;
}

interface PendingSignIn {
  state: string;
  codeVerifier: string;
  returnTo: string;
}

interface TokenResponse {
  access_token: string;
  id_token: string;
  refresh_token?: string;
  expires_in: number;
}

const SESSION_STORAGE_KEY = "libre3d-auth-session";
const PENDING_SIGN_IN_KEY = "libre3d-auth-pending";
export const AUTH_CALLBACK_PATH = "/auth/callback";

// Refresh a minute early so a token never expires between reading it and the server checking it.
const EXPIRY_MARGIN_MS = 60_000;

const cognitoDomain = (import.meta.env.VITE_COGNITO_DOMAIN ?? "").replace(/\/+$/, "");
const clientId = import.meta.env.VITE_COGNITO_CLIENT_ID ?? "";

export const isAuthConfigured = (): boolean => Boolean(cognitoDomain && clientId);

const callbackUrl = (): string => `${window.location.origin}${AUTH_CALLBACK_PATH}`;

// ---- Storage --------------------------------------------------------------------------------

const readJson = <T>(storage: Storage, key: string): T | null => {
  try {
    const raw = storage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    // Private-mode browsers can throw on access, and a corrupted value is as good as none.
    return null;
  }
};

const writeJson = (storage: Storage, key: string, value: unknown): void => {
  try {
    storage.setItem(key, JSON.stringify(value));
  } catch {
    // Non-fatal: the session simply won't survive a reload.
  }
};

const removeKey = (storage: Storage, key: string): void => {
  try {
    storage.removeItem(key);
  } catch {
    // Nothing to do.
  }
};

const readTokens = (): StoredTokens | null => readJson<StoredTokens>(localStorage, SESSION_STORAGE_KEY);

// ---- Subscription (for useSyncExternalStore) ------------------------------------------------

const listeners = new Set<() => void>();

const decodeJwtPayload = (token: string): Record<string, unknown> | null => {
  try {
    const payload = token.split(".")[1] ?? "";
    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    const bytes = Uint8Array.from(atob(base64), (char) => char.charCodeAt(0));
    return JSON.parse(new TextDecoder().decode(bytes)) as Record<string, unknown>;
  } catch {
    return null;
  }
};

const buildSnapshot = (): AuthSnapshot => {
  const tokens = readTokens();

  if (!tokens) {
    return { status: "signedOut" };
  }

  // Display only. Nothing trusts this unverified claim; the server verifies the access token itself.
  const email = decodeJwtPayload(tokens.idToken)?.email;

  return { status: "signedIn", email: typeof email === "string" ? email : null };
};

// useSyncExternalStore needs the same object back until something changes.
let snapshot: AuthSnapshot = buildSnapshot();

const notify = (): void => {
  snapshot = buildSnapshot();
  listeners.forEach((listener) => listener());
};

export const getAuthSnapshot = (): AuthSnapshot => snapshot;

export const subscribeToAuth = (listener: () => void): (() => void) => {
  listeners.add(listener);

  // Signing in or out in another tab changes localStorage there; follow it here.
  const handleStorage = (event: StorageEvent) => {
    if (event.key === SESSION_STORAGE_KEY || event.key === null) {
      notify();
    }
  };

  window.addEventListener("storage", handleStorage);

  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", handleStorage);
  };
};

const saveTokens = (tokens: StoredTokens): void => {
  writeJson(localStorage, SESSION_STORAGE_KEY, tokens);
  notify();
};

const clearTokens = (): void => {
  removeKey(localStorage, SESSION_STORAGE_KEY);
  notify();
};

// ---- PKCE helpers ---------------------------------------------------------------------------

const base64UrlEncode = (bytes: Uint8Array): string =>
  btoa(String.fromCharCode(...bytes))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

const randomUrlSafeString = (byteLength: number): string =>
  base64UrlEncode(crypto.getRandomValues(new Uint8Array(byteLength)));

const sha256UrlSafe = async (value: string): Promise<string> => {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return base64UrlEncode(new Uint8Array(digest));
};

/**
 * Only same-site paths, so a crafted link (e.g. `/?next=…`) can't use sign-in to bounce someone to
 * another site. Resolved with the URL parser rather than prefix checks: browsers read `/\evil.com`
 * as `//evil.com`, which a `startsWith("//")` test misses.
 */
export const sanitizeReturnTo = (value: string | null | undefined): string => {
  if (!value || !value.startsWith("/")) {
    return "/";
  }

  try {
    const url = new URL(value, window.location.origin);

    return url.origin === window.location.origin && url.pathname !== AUTH_CALLBACK_PATH
      ? url.pathname + url.search + url.hash
      : "/";
  } catch {
    return "/";
  }
};

// ---- Token endpoint -------------------------------------------------------------------------

class TokenEndpointError extends Error {
  constructor(
    readonly status: number,
    readonly errorCode: string,
  ) {
    super(`Cognito token request failed (${status} ${errorCode})`);
    this.name = "TokenEndpointError";
  }
}

const requestTokens = async (body: Record<string, string>): Promise<TokenResponse> => {
  const response = await fetch(`${cognitoDomain}/oauth2/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ client_id: clientId, ...body }),
  });

  if (!response.ok) {
    const errorBody = (await response.json().catch(() => ({}))) as { error?: string };
    throw new TokenEndpointError(response.status, errorBody.error ?? "unknown_error");
  }

  return (await response.json()) as TokenResponse;
};

// ---- Public API -----------------------------------------------------------------------------

/** Sends the browser to the hosted login. `returnTo` is where to land afterwards (same site only). */
export const startSignIn = async (returnTo: string = window.location.pathname + window.location.search) => {
  if (!isAuthConfigured()) {
    throw new Error("Sign-in is not configured: set VITE_COGNITO_DOMAIN and VITE_COGNITO_CLIENT_ID.");
  }

  const pending: PendingSignIn = {
    // `state` ties the callback to this browser tab's request, so a forged callback is rejected.
    state: randomUrlSafeString(16),
    codeVerifier: randomUrlSafeString(32),
    returnTo: sanitizeReturnTo(returnTo),
  };

  // sessionStorage: the secret only needs to live in this tab until the redirect comes back.
  writeJson(sessionStorage, PENDING_SIGN_IN_KEY, pending);

  const authorizeUrl = new URL(`${cognitoDomain}/oauth2/authorize`);
  authorizeUrl.search = new URLSearchParams({
    response_type: "code",
    client_id: clientId,
    redirect_uri: callbackUrl(),
    scope: "openid email",
    state: pending.state,
    code_challenge: await sha256UrlSafe(pending.codeVerifier),
    code_challenge_method: "S256",
  }).toString();

  window.location.assign(authorizeUrl.toString());
};

let pendingCompletion: Promise<string> | null = null;

/**
 * Finishes sign-in on `/auth/callback`. Resolves to the same-site path to return to.
 * Memoized: React StrictMode runs effects twice in development, and a code can be redeemed once.
 */
export const completeSignIn = (callbackLocation: URL): Promise<string> => {
  pendingCompletion ??= (async () => {
    const pending = readJson<PendingSignIn>(sessionStorage, PENDING_SIGN_IN_KEY);
    removeKey(sessionStorage, PENDING_SIGN_IN_KEY);

    const params = callbackLocation.searchParams;
    const error = params.get("error");

    if (error) {
      throw new Error(params.get("error_description") ?? error);
    }

    const code = params.get("code");

    if (!pending || !code || params.get("state") !== pending.state) {
      throw new Error("This sign-in link has expired or was started in another tab. Please sign in again.");
    }

    const tokens = await requestTokens({
      grant_type: "authorization_code",
      code,
      redirect_uri: callbackUrl(),
      code_verifier: pending.codeVerifier,
    });

    if (!tokens.refresh_token) {
      throw new Error("Cognito did not return a refresh token.");
    }

    saveTokens({
      accessToken: tokens.access_token,
      idToken: tokens.id_token,
      refreshToken: tokens.refresh_token,
      expiresAt: Date.now() + tokens.expires_in * 1000,
    });

    return pending.returnTo;
  })();

  return pendingCompletion;
};

let pendingRefresh: Promise<string | null> | null = null;

/**
 * A currently valid access token, refreshing it first if it is about to expire. `null` means
 * signed out (including when the refresh token itself was revoked or has expired).
 */
export const getAccessToken = async (): Promise<string | null> => {
  const tokens = readTokens();

  if (!tokens) {
    return null;
  }

  if (tokens.expiresAt - EXPIRY_MARGIN_MS > Date.now()) {
    return tokens.accessToken;
  }

  // Several API calls at once must share one refresh, not race to redeem the same refresh token.
  pendingRefresh ??= (async () => {
    try {
      const refreshed = await requestTokens({ grant_type: "refresh_token", refresh_token: tokens.refreshToken });

      saveTokens({
        accessToken: refreshed.access_token,
        idToken: refreshed.id_token,
        refreshToken: refreshed.refresh_token ?? tokens.refreshToken,
        expiresAt: Date.now() + refreshed.expires_in * 1000,
      });

      return refreshed.access_token;
    } catch (error) {
      // A rejected refresh token (expired, revoked, user disabled) means the session is over. A
      // network failure does not: keep the session and let the caller report the error.
      if (error instanceof TokenEndpointError && error.status === 400) {
        clearTokens();
        return null;
      }

      throw error;
    } finally {
      pendingRefresh = null;
    }
  })();

  return pendingRefresh;
};

/** Forgets the session locally, revokes its refresh token, and signs out of the hosted login too. */
export const signOut = async (): Promise<void> => {
  const tokens = readTokens();
  clearTokens();

  if (!isAuthConfigured()) {
    return;
  }

  if (tokens) {
    // Best effort: revoking kills this refresh token and the tokens issued from it, so a copy that
    // leaked from this browser stops working. Signing out locally must not wait on it succeeding.
    await fetch(`${cognitoDomain}/oauth2/revoke`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ token: tokens.refreshToken, client_id: clientId }),
    }).catch(() => undefined);
  }

  // Also end the hosted login's own one-hour session cookie, or "Sign in" would skip the password.
  const logoutUrl = new URL(`${cognitoDomain}/logout`);
  logoutUrl.search = new URLSearchParams({ client_id: clientId, logout_uri: `${window.location.origin}/` }).toString();
  window.location.assign(logoutUrl.toString());
};
