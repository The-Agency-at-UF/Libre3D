import { afterEach, describe, expect, it, vi } from "vitest";

import { jsonResponse } from "../testing/browserStubs";
import { ApiAuthError, apiFetch } from "./apiFetch";
import {
  SceneApiError,
  claimSceneLock,
  createScene,
  deleteScene,
  getScene,
  hasPendingSaves,
  listScenes,
  releaseSceneLock,
  renameScene,
  saveScene,
} from "./sceneLibrary";

vi.mock("./apiFetch", () => ({
  apiFetch: vi.fn(),
  ApiAuthError: class ApiAuthError extends Error {},
}));

// The real one is covered in editorSession.test.ts.
const TAB = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
vi.mock("./editorSession", () => ({ getEditorSessionId: () => TAB }));

const apiFetchMock = vi.mocked(apiFetch);

const lastCall = () => {
  const [path, init = {}] = apiFetchMock.mock.calls.at(-1)!;
  return {
    path,
    method: init.method ?? "GET",
    headers: new Headers(init.headers),
    body: init.body ? JSON.parse(String(init.body)) : undefined,
    keepalive: init.keepalive ?? false,
  };
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

  it("creates a scene", async () => {
    apiFetchMock.mockResolvedValueOnce(jsonResponse({ sceneId: "new", name: "Untitled scene", updatedAt: "t" }, 201));

    await expect(createScene({ name: "Untitled scene" })).resolves.toMatchObject({ sceneId: "new" });

    const request = lastCall();
    expect(request).toMatchObject({ path: "/api/scenes", method: "POST", body: { name: "Untitled scene" } });
    expect(request.headers.get("Content-Type")).toBe("application/json");
  });

  it("opens, saves, renames, and deletes by scene ID, escaping it in the path", async () => {
    apiFetchMock.mockImplementation(async () => jsonResponse({}));

    await getScene("a/b");
    expect(lastCall()).toMatchObject({ path: "/api/scenes/a%2Fb", method: "GET" });

    await saveScene("s1", { format: "libre3d.scene" }, 4);
    expect(lastCall()).toMatchObject({
      path: "/api/scenes/s1",
      method: "PUT",
      body: { document: { format: "libre3d.scene" }, baseRevision: 4, sessionId: TAB },
    });

    await renameScene("s1", "New name");
    expect(lastCall()).toMatchObject({ path: "/api/scenes/s1", method: "PATCH", body: { name: "New name" } });

    await deleteScene("s1");
    expect(lastCall()).toMatchObject({ path: "/api/scenes/s1", method: "DELETE", body: undefined });
    expect(lastCall().headers.has("Content-Type")).toBe(false);
  });
});

describe("the editing lock", () => {
  it("claims the lock for this tab and reports the scene's revision", async () => {
    apiFetchMock.mockResolvedValueOnce(jsonResponse({ revision: 7 }));

    await expect(claimSceneLock("s1")).resolves.toEqual({ held: true, revision: 7 });
    expect(lastCall()).toMatchObject({ path: "/api/scenes/s1/lock", method: "POST", body: { sessionId: TAB } });
  });

  it("asks to take the lock over only when told to", async () => {
    apiFetchMock.mockImplementation(async () => jsonResponse({ revision: 1 }));

    await claimSceneLock("s1", { takeOver: true });
    expect(lastCall().body).toEqual({ sessionId: TAB, takeOver: true });
  });

  it("reports a lock held elsewhere (423) as an outcome, with who holds it and the revision", async () => {
    apiFetchMock.mockResolvedValueOnce(
      jsonResponse({ error: "This scene is open somewhere else.", revision: 3, heldByYou: true }, 423),
    );

    await expect(claimSceneLock("s1")).resolves.toEqual({ held: false, revision: 3, heldByYou: true });
  });

  it("still throws for a deleted scene and other failures", async () => {
    apiFetchMock.mockResolvedValueOnce(jsonResponse({ error: "Scene not found." }, 404));

    await expect(claimSceneLock("s1")).rejects.toMatchObject({ status: 404 });
  });

  it("releases the lock, with keepalive when the page is going away", async () => {
    apiFetchMock.mockImplementation(async () => jsonResponse({ released: true }));

    await releaseSceneLock("s1");
    expect(lastCall()).toMatchObject({ path: "/api/scenes/s1/lock", method: "DELETE", body: { sessionId: TAB }, keepalive: false });

    await releaseSceneLock("s1", { keepalive: true });
    expect(lastCall().keepalive).toBe(true);
  });
});

describe("failures", () => {
  it("raises SceneApiError with the server's status, message, and the rest of its body", async () => {
    apiFetchMock.mockResolvedValueOnce(jsonResponse({ error: "This scene was saved from somewhere else.", revision: 5 }, 409));

    const failure = saveScene("s1", {}, 4).catch((error: unknown) => error);

    await expect(failure).resolves.toBeInstanceOf(SceneApiError);
    await expect(failure).resolves.toMatchObject({
      status: 409,
      message: "This scene was saved from somewhere else.",
      details: { revision: 5 },
    });
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
    expect(hasPendingSaves()).toBe(true);
    finishSave(jsonResponse({ revision: 2, updatedAt: "t" }));
    await Promise.all([save, list]);

    expect(order).toEqual(["save sent", "save landed", "list sent"]);
    expect(hasPendingSaves()).toBe(false);
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
