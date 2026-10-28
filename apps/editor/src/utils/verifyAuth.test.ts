import { CognitoJwtVerifier } from "aws-jwt-verify";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { verifyAuth } from "./verifyAuth";

vi.mock("aws-jwt-verify", () => ({ CognitoJwtVerifier: { create: vi.fn() } }));

const createVerifierMock = vi.mocked(CognitoJwtVerifier.create);
const verify = vi.fn();

// verifyAuth caches one verifier per pool/client for the life of the module, so each test uses
// its own pool ID unless it's testing that cache.
let poolCounter = 0;
const nextEnv = () => ({ VITE_COGNITO_USER_POOL_ID: `us-east-2_pool${++poolCounter}`, VITE_COGNITO_CLIENT_ID: "client-123" });

beforeEach(() => {
  verify.mockResolvedValue({ sub: "user-sub-1" });
  createVerifierMock.mockReturnValue({ verify } as unknown as ReturnType<typeof CognitoJwtVerifier.create>);
});

afterEach(() => {
  vi.clearAllMocks();
});

describe("verifyAuth", () => {
  it("returns the verified token's sub as the user ID", async () => {
    const env = nextEnv();

    await expect(verifyAuth({ authorization: "Bearer good-token" }, env)).resolves.toEqual({
      authorized: true,
      userId: "user-sub-1",
    });
    expect(createVerifierMock).toHaveBeenCalledWith({
      userPoolId: env.VITE_COGNITO_USER_POOL_ID,
      clientId: "client-123",
      tokenUse: "access",
    });
    expect(verify).toHaveBeenCalledWith("good-token");
  });

  it("accepts the scheme in any case", async () => {
    await expect(verifyAuth({ authorization: "bearer good-token" }, nextEnv())).resolves.toMatchObject({ authorized: true });
  });

  it.each([
    ["no Authorization header", {}],
    ["another scheme", { authorization: "Basic dXNlcjpwYXNz" }],
    ["an empty Bearer", { authorization: "Bearer " }],
  ])("rejects %s with 401 without checking anything", async (_label, headers) => {
    await expect(verifyAuth(headers, nextEnv())).resolves.toMatchObject({ authorized: false, status: 401 });
    expect(verify).not.toHaveBeenCalled();
  });

  it("rejects a token that fails verification (expired, forged, wrong pool or client, an ID token)", async () => {
    verify.mockRejectedValueOnce(new Error("Token expired"));
    vi.spyOn(console, "warn").mockImplementation(() => undefined);

    await expect(verifyAuth({ authorization: "Bearer bad-token" }, nextEnv())).resolves.toEqual({
      authorized: false,
      status: 401,
      error: "Your session has expired. Please sign in again.",
    });
  });

  it("fails closed with 503 when the deployment has no user pool configured", async () => {
    await expect(verifyAuth({ authorization: "Bearer good-token" }, {})).resolves.toMatchObject({
      authorized: false,
      status: 503,
    });
    expect(verify).not.toHaveBeenCalled();
  });

  it("reuses one verifier per pool and client, so Cognito's public keys are fetched once", async () => {
    const env = nextEnv();

    await verifyAuth({ authorization: "Bearer a" }, env);
    await verifyAuth({ authorization: "Bearer b" }, env);
    await verifyAuth({ authorization: "Bearer c" }, { ...env, VITE_COGNITO_CLIENT_ID: "other-client" });

    expect(createVerifierMock).toHaveBeenCalledTimes(2);
  });
});
