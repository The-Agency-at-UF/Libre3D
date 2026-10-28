import { createHash } from "node:crypto";

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { jsonResponse, makeUnsignedJwt, stubBrowserGlobals, type BrowserStubs } from "../testing/browserStubs";

const COGNITO_DOMAIN = "https://login.example.test";
const CLIENT_ID = "client-123";
const SESSION_KEY = "libre3d-auth-session";
const PENDING_KEY = "libre3d-auth-pending";

let browser: BrowserStubs;
let fetchMock: ReturnType<typeof vi.fn>;

// authSession reads the env and localStorage when it loads, and keeps module state (the memoized
// sign-in and refresh), so every test gets a fresh copy.
const loadAuthSession = async () => {
  vi.resetModules();
  return import("./authSession");
};

const storeTokens = (overrides: Partial<{ accessToken: string; idToken: string; refreshToken: string; expiresAt: number }> = {}) =>
  browser.localStorage.setItem(
    SESSION_KEY,
    JSON.stringify({
      accessToken: "access-1",
      idToken: makeUnsignedJwt({ sub: "user-sub-1", email: "ada@ufl.edu" }),
      refreshToken: "refresh-1",
      expiresAt: Date.now() + 60 * 60 * 1000,
      ...overrides,
    }),
  );

const tokenResponse = (overrides: Record<string, unknown> = {}) =>
  jsonResponse({
    access_token: "access-2",
    id_token: makeUnsignedJwt({ sub: "user-sub-1", email: "ada@ufl.edu" }),
    refresh_token: "refresh-2",
    expires_in: 3600,
    ...overrides,
  });

const requestBody = (callIndex: number): URLSearchParams => fetchMock.mock.calls[callIndex][1].body as URLSearchParams;

beforeEach(() => {
  browser = stubBrowserGlobals("http://localhost:5173/");
  fetchMock = vi.fn();
  vi.stubGlobal("fetch", fetchMock);
  vi.stubEnv("VITE_COGNITO_DOMAIN", COGNITO_DOMAIN);
  vi.stubEnv("VITE_COGNITO_CLIENT_ID", CLIENT_ID);
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

describe("sanitizeReturnTo", () => {
  it("keeps a same-site path with its query and hash", async () => {
    const { sanitizeReturnTo } = await loadAuthSession();

    expect(sanitizeReturnTo("/edit/abc?tab=1#top")).toBe("/edit/abc?tab=1#top");
  });

  it.each([
    ["nothing", null],
    ["an empty string", ""],
    ["a relative path", "edit/abc"],
    ["another origin", "https://evil.example"],
    ["a protocol-relative URL", "//evil.example/path"],
    ["a backslash trick browsers read as //", "/\\evil.example"],
    ["the sign-in callback itself", "/auth/callback?code=x"],
  ])("falls back to / for %s", async (_label, value) => {
    const { sanitizeReturnTo } = await loadAuthSession();

    expect(sanitizeReturnTo(value)).toBe("/");
  });
});

describe("auth snapshot", () => {
  it("is signed out with no stored tokens", async () => {
    const { getAuthSnapshot } = await loadAuthSession();

    expect(getAuthSnapshot()).toEqual({ status: "signedOut" });
  });

  it("reads the email and user ID (sub) from the stored ID token", async () => {
    storeTokens();
    const { getAuthSnapshot } = await loadAuthSession();

    expect(getAuthSnapshot()).toEqual({ status: "signedIn", email: "ada@ufl.edu", userId: "user-sub-1" });
  });

  it("follows a sign-out in another tab", async () => {
    storeTokens();
    const { getAuthSnapshot, subscribeToAuth } = await loadAuthSession();
    const listener = vi.fn();
    const unsubscribe = subscribeToAuth(listener);

    browser.localStorage.removeItem(SESSION_KEY);
    browser.window.dispatchEvent(Object.assign(new Event("storage"), { key: SESSION_KEY }));

    expect(listener).toHaveBeenCalledOnce();
    expect(getAuthSnapshot()).toEqual({ status: "signedOut" });
    unsubscribe();
  });
});

describe("startSignIn", () => {
  it("redirects to the hosted login with a PKCE S256 challenge and remembers the verifier", async () => {
    const { startSignIn } = await loadAuthSession();

    await startSignIn("/edit/abc");

    const pending = JSON.parse(browser.sessionStorage.getItem(PENDING_KEY)!);
    const authorizeUrl = new URL(browser.window.location.assign.mock.calls[0][0]);
    const expectedChallenge = createHash("sha256").update(pending.codeVerifier).digest("base64url");

    expect(pending.returnTo).toBe("/edit/abc");
    expect(authorizeUrl.origin + authorizeUrl.pathname).toBe(`${COGNITO_DOMAIN}/oauth2/authorize`);
    expect(Object.fromEntries(authorizeUrl.searchParams)).toEqual({
      response_type: "code",
      client_id: CLIENT_ID,
      redirect_uri: "http://localhost:5173/auth/callback",
      scope: "openid email",
      state: pending.state,
      code_challenge: expectedChallenge,
      code_challenge_method: "S256",
    });
  });

  it("only ever returns to a same-site path", async () => {
    const { startSignIn } = await loadAuthSession();

    await startSignIn("https://evil.example/steal");

    expect(JSON.parse(browser.sessionStorage.getItem(PENDING_KEY)!).returnTo).toBe("/");
  });

  it("refuses to start when sign-in isn't configured", async () => {
    vi.stubEnv("VITE_COGNITO_DOMAIN", "");
    const { startSignIn } = await loadAuthSession();

    await expect(startSignIn("/scenes")).rejects.toThrow(/not configured/);
    expect(browser.window.location.assign).not.toHaveBeenCalled();
  });
});

describe("completeSignIn", () => {
  const pendingSignIn = { state: "state-1", codeVerifier: "verifier-1", returnTo: "/edit/abc" };
  const callback = (query: string) => new URL(`http://localhost:5173/auth/callback?${query}`);

  it("redeems the code with the verifier, stores the session, and returns where the user was headed", async () => {
    browser.sessionStorage.setItem(PENDING_KEY, JSON.stringify(pendingSignIn));
    fetchMock.mockResolvedValueOnce(tokenResponse());
    const { completeSignIn, getAuthSnapshot } = await loadAuthSession();

    await expect(completeSignIn(callback("code=code-1&state=state-1"))).resolves.toBe("/edit/abc");

    expect(fetchMock).toHaveBeenCalledWith(`${COGNITO_DOMAIN}/oauth2/token`, expect.objectContaining({ method: "POST" }));
    expect(Object.fromEntries(requestBody(0))).toEqual({
      client_id: CLIENT_ID,
      grant_type: "authorization_code",
      code: "code-1",
      redirect_uri: "http://localhost:5173/auth/callback",
      code_verifier: "verifier-1",
    });
    expect(getAuthSnapshot()).toMatchObject({ status: "signedIn", userId: "user-sub-1" });
    expect(browser.sessionStorage.getItem(PENDING_KEY)).toBeNull();
  });

  it("rejects a callback whose state doesn't match this tab's request, without redeeming it", async () => {
    browser.sessionStorage.setItem(PENDING_KEY, JSON.stringify(pendingSignIn));
    const { completeSignIn } = await loadAuthSession();

    await expect(completeSignIn(callback("code=code-1&state=forged"))).rejects.toThrow(/expired or was started in another tab/);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("reports an error Cognito sent back", async () => {
    browser.sessionStorage.setItem(PENDING_KEY, JSON.stringify(pendingSignIn));
    const { completeSignIn } = await loadAuthSession();

    await expect(completeSignIn(callback("error=access_denied&error_description=User+cancelled"))).rejects.toThrow("User cancelled");
  });

  it("redeems a code only once even when called twice (StrictMode)", async () => {
    browser.sessionStorage.setItem(PENDING_KEY, JSON.stringify(pendingSignIn));
    fetchMock.mockResolvedValueOnce(tokenResponse());
    const { completeSignIn } = await loadAuthSession();

    const [first, second] = await Promise.all([
      completeSignIn(callback("code=code-1&state=state-1")),
      completeSignIn(callback("code=code-1&state=state-1")),
    ]);

    expect(first).toBe("/edit/abc");
    expect(second).toBe("/edit/abc");
    expect(fetchMock).toHaveBeenCalledOnce();
  });
});

describe("getAccessToken", () => {
  it("is null when signed out", async () => {
    const { getAccessToken } = await loadAuthSession();

    await expect(getAccessToken()).resolves.toBeNull();
  });

  it("returns a token that's still valid without calling Cognito", async () => {
    storeTokens();
    const { getAccessToken } = await loadAuthSession();

    await expect(getAccessToken()).resolves.toBe("access-1");
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("refreshes a token about to expire, once for several callers at the same time", async () => {
    storeTokens({ expiresAt: Date.now() + 30_000 }); // inside the one-minute margin
    fetchMock.mockResolvedValueOnce(tokenResponse({ refresh_token: undefined }));
    const { getAccessToken } = await loadAuthSession();

    const tokens = await Promise.all([getAccessToken(), getAccessToken(), getAccessToken()]);

    expect(tokens).toEqual(["access-2", "access-2", "access-2"]);
    expect(fetchMock).toHaveBeenCalledOnce();
    expect(Object.fromEntries(requestBody(0))).toMatchObject({ grant_type: "refresh_token", refresh_token: "refresh-1" });
    // Cognito doesn't rotate refresh tokens by default; the old one is kept.
    expect(JSON.parse(browser.localStorage.getItem(SESSION_KEY)!).refreshToken).toBe("refresh-1");
  });

  it("signs out when the refresh token is rejected (expired, revoked, user disabled)", async () => {
    storeTokens({ expiresAt: Date.now() - 1000 });
    fetchMock.mockResolvedValueOnce(jsonResponse({ error: "invalid_grant" }, 400));
    const { getAccessToken, getAuthSnapshot } = await loadAuthSession();

    await expect(getAccessToken()).resolves.toBeNull();
    expect(getAuthSnapshot()).toEqual({ status: "signedOut" });
  });

  it("keeps the session when the refresh fails for another reason (network, server)", async () => {
    storeTokens({ expiresAt: Date.now() - 1000 });
    fetchMock.mockRejectedValueOnce(new TypeError("Failed to fetch"));
    const { getAccessToken, getAuthSnapshot } = await loadAuthSession();

    await expect(getAccessToken()).rejects.toThrow("Failed to fetch");
    expect(getAuthSnapshot()).toMatchObject({ status: "signedIn" });
  });
});

describe("signOut", () => {
  it("forgets the session and this user's unsaved scene edits, revokes the refresh token, and signs out of the hosted login", async () => {
    storeTokens();
    browser.localStorage.setItem("libre3d-scene-cache:scene-1", "{}");
    browser.localStorage.setItem("libre3d-theme", "dark");
    fetchMock.mockResolvedValueOnce(new Response(null, { status: 200 }));
    const { getAuthSnapshot, signOut } = await loadAuthSession();

    await signOut();

    expect(getAuthSnapshot()).toEqual({ status: "signedOut" });
    expect(browser.localStorage.getItem("libre3d-scene-cache:scene-1")).toBeNull();
    expect(browser.localStorage.getItem("libre3d-theme")).toBe("dark");
    expect(fetchMock.mock.calls[0][0]).toBe(`${COGNITO_DOMAIN}/oauth2/revoke`);
    expect(Object.fromEntries(requestBody(0))).toEqual({ token: "refresh-1", client_id: CLIENT_ID });

    const logoutUrl = new URL(browser.window.location.assign.mock.calls[0][0]);
    expect(logoutUrl.origin + logoutUrl.pathname).toBe(`${COGNITO_DOMAIN}/logout`);
    expect(logoutUrl.searchParams.get("logout_uri")).toBe("http://localhost:5173/");
  });

  it("still signs out when revoking fails", async () => {
    storeTokens();
    fetchMock.mockRejectedValueOnce(new TypeError("Failed to fetch"));
    const { getAuthSnapshot, signOut } = await loadAuthSession();

    await signOut();

    expect(getAuthSnapshot()).toEqual({ status: "signedOut" });
    expect(browser.window.location.assign).toHaveBeenCalledOnce();
  });
});
