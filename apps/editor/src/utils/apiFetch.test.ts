import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { ApiAuthError, apiFetch } from "./apiFetch";
import { getAccessToken } from "./authSession";

vi.mock("./authSession", () => ({ getAccessToken: vi.fn() }));

const getAccessTokenMock = vi.mocked(getAccessToken);
let fetchMock: ReturnType<typeof vi.fn>;

beforeEach(() => {
  fetchMock = vi.fn().mockResolvedValue(new Response("{}", { status: 200 }));
  vi.stubGlobal("fetch", fetchMock);
  getAccessTokenMock.mockResolvedValue("access-1");
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.clearAllMocks();
});

describe("apiFetch", () => {
  it("adds the access token as a Bearer header and keeps the caller's headers and options", async () => {
    await apiFetch("/api/scenes", { method: "POST", headers: { "Content-Type": "application/json" }, body: "{}" });

    const [path, init] = fetchMock.mock.calls[0];
    const headers = new Headers(init.headers);

    expect(path).toBe("/api/scenes");
    expect(init.method).toBe("POST");
    expect(init.body).toBe("{}");
    expect(headers.get("Authorization")).toBe("Bearer access-1");
    expect(headers.get("Content-Type")).toBe("application/json");
  });

  it("refuses anything but our own /api routes, so a token never reaches S3 or another site", async () => {
    await expect(apiFetch("https://bucket.s3.amazonaws.com/key")).rejects.toThrow(/only for \/api/);
    await expect(apiFetch("/scenes")).rejects.toThrow(/only for \/api/);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("raises ApiAuthError without calling the API when signed out", async () => {
    getAccessTokenMock.mockResolvedValueOnce(null);

    await expect(apiFetch("/api/scenes")).rejects.toBeInstanceOf(ApiAuthError);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("raises ApiAuthError when the server rejects the session", async () => {
    fetchMock.mockResolvedValueOnce(new Response("{}", { status: 401 }));

    await expect(apiFetch("/api/scenes")).rejects.toBeInstanceOf(ApiAuthError);
  });

  it("hands back other failures for the caller to handle", async () => {
    fetchMock.mockResolvedValueOnce(new Response("{}", { status: 409 }));

    await expect(apiFetch("/api/scenes/abc", { method: "PUT" })).resolves.toMatchObject({ status: 409 });
  });
});
