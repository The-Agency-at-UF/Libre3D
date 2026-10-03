import { afterEach, describe, expect, it, vi } from "vitest";

import { jsonResponse } from "../testing/browserStubs";
import { ApiAuthError, apiFetch } from "./apiFetch";
import {
  SceneApiError,
  createScene,
  deleteScene,
  getScene,
  listScenes,
  renameScene,
  saveScene,
} from "./sceneLibrary";

vi.mock("./apiFetch", () => ({
  apiFetch: vi.fn(),
  ApiAuthError: class ApiAuthError extends Error {},
}));

const apiFetchMock = vi.mocked(apiFetch);

const lastCall = () => {
  const [path, init = {}] = apiFetchMock.mock.calls.at(-1)!;
  return { path, method: init.method ?? "GET", headers: new Headers(init.headers), body: init.body ? JSON.parse(String(init.body)) : undefined };
};

afterEach(() => {
  vi.clearAllMocks();
});

describe("requests", () => {
  it("lists the user's scenes", async () => {
    const scenes = [{ sceneId: "a", name: "A", updatedAt: "2026-10-03T12:00:00.000Z" }];
    apiFetchMock.mockResolvedValueOnce(jsonResponse({ scenes }));

    await expect(listScenes()).resolves.toEqual(scenes);
    expect(lastCall()).toMatchObject({ path: "/api/scenes", method: "GET" });
  });

  it("creates a scene, optionally from a document", async () => {
    apiFetchMock.mockResolvedValueOnce(jsonResponse({ sceneId: "new", name: "Untitled scene", updatedAt: "t" }, 201));

    await expect(createScene({ name: "Untitled scene", document: { format: "libre3d.scene" } })).resolves.toMatchObject({ sceneId: "new" });

    const request = lastCall();
    expect(request).toMatchObject({ path: "/api/scenes", method: "POST", body: { name: "Untitled scene", document: { format: "libre3d.scene" } } });
    expect(request.headers.get("Content-Type")).toBe("application/json");
  });

  it("opens, saves, renames, and deletes by scene ID, escaping it in the path", async () => {
    apiFetchMock.mockImplementation(async () => jsonResponse({}));

    await getScene("a/b");
    expect(lastCall()).toMatchObject({ path: "/api/scenes/a%2Fb", method: "GET" });

    await saveScene("s1", { format: "libre3d.scene" }, 4);
    expect(lastCall()).toMatchObject({ path: "/api/scenes/s1", method: "PUT", body: { document: { format: "libre3d.scene" }, baseRevision: 4 } });

    await renameScene("s1", "New name");
    expect(lastCall()).toMatchObject({ path: "/api/scenes/s1", method: "PATCH", body: { name: "New name" } });

    await deleteScene("s1");
    expect(lastCall()).toMatchObject({ path: "/api/scenes/s1", method: "DELETE", body: undefined });
    expect(lastCall().headers.has("Content-Type")).toBe(false);
  });
});

describe("failures", () => {
  it("raises SceneApiError with the server's status and message", async () => {
    apiFetchMock.mockResolvedValueOnce(jsonResponse({ error: "This scene was saved from somewhere else.", revision: 5 }, 409));

    const failure = saveScene("s1", {}, 4).catch((error: unknown) => error);

    await expect(failure).resolves.toBeInstanceOf(SceneApiError);
    await expect(failure).resolves.toMatchObject({ status: 409, message: "This scene was saved from somewhere else." });
  });

  it("still reports the status when the error body isn't JSON", async () => {
    apiFetchMock.mockResolvedValueOnce(new Response("Bad Gateway", { status: 502 }));

    await expect(listScenes()).rejects.toMatchObject({ status: 502, message: "The request failed (502)." });
  });

  it("passes a lost session through as ApiAuthError", async () => {
    apiFetchMock.mockRejectedValueOnce(new ApiAuthError("Your session has expired."));

    await expect(getScene("s1")).rejects.toBeInstanceOf(ApiAuthError);
  });
});

describe("listScenes after leaving the editor", () => {
  it("waits for a save still in flight, so the gallery shows the scene's latest edit time", async () => {
    const order: string[] = [];
    let finishSave: (response: Response) => void = () => undefined;

    apiFetchMock.mockImplementation(async (_path, init) => {
      if (init?.method === "PUT") {
        order.push("save sent");
        return new Promise<Response>((resolve) => {
          finishSave = (response) => {
            order.push("save landed");
            resolve(response);
          };
        });
      }

      order.push("list sent");
      return jsonResponse({ scenes: [] });
    });

    const save = saveScene("s1", {}, 1);
    const list = listScenes();
    await Promise.resolve();
    finishSave(jsonResponse({ revision: 2, updatedAt: "t" }));
    await Promise.all([save, list]);

    expect(order).toEqual(["save sent", "save landed", "list sent"]);
  });

  it("still lists when that save failed", async () => {
    apiFetchMock
      .mockResolvedValueOnce(jsonResponse({ error: "boom" }, 500))
      .mockResolvedValueOnce(jsonResponse({ scenes: [] }));

    const save = saveScene("s1", {}, 1).catch(() => "failed");

    await expect(listScenes()).resolves.toEqual([]);
    await expect(save).resolves.toBe("failed");
  });
});
