import { afterEach, beforeEach, describe, expect, it, vi, type Mock } from "vitest";

import { stubBrowserGlobals, type BrowserStubs } from "../testing/browserStubs";
import { ApiAuthError } from "./apiFetch";
import { AssetTransferError, AssetUnavailableError } from "./assetTransfers";
import { SceneAutosaver, type SaveStatus } from "./sceneAutosave";
import { SceneApiError, saveScene } from "./sceneLibrary";

vi.mock("./apiFetch", () => ({
  apiFetch: vi.fn(),
  ApiAuthError: class ApiAuthError extends Error {},
}));

vi.mock("./modelAssetStore", () => ({ loadModelAsset: vi.fn() }));
vi.mock("./textureAssetStore", () => ({ loadTextureAsset: vi.fn() }));

vi.mock("./sceneLibrary", async (importOriginal) => ({
  ...(await importOriginal<typeof import("./sceneLibrary")>()),
  saveScene: vi.fn(),
}));

const saveSceneMock = vi.mocked(saveScene);

let browser: BrowserStubs;
let statuses: SaveStatus[];
let revision: number;
let documentVersion: number;
let onSaved: Mock<(revision: number, hasPendingEdits: boolean) => void>;

const lastStatus = () => statuses.at(-1)?.kind;

const createAutosaver = (options: Partial<ConstructorParameters<typeof SceneAutosaver>[0]> = {}) =>
  new SceneAutosaver({
    sceneId: "scene-1",
    readRevision: () => revision,
    readDocument: () => ({ version: documentVersion }),
    onStatus: (status) => statuses.push(status),
    // As useSceneAutosave does: the owner keeps the revision.
    onSaved: (savedRevision, hasPendingEdits) => {
      revision = savedRevision;
      onSaved(savedRevision, hasPendingEdits);
    },
    ...options,
  });

/** A save the test resolves or rejects when it chooses. */
const deferredSave = () => {
  let resolve: (value: { revision: number; updatedAt: string }) => void = () => undefined;
  let reject: (error: unknown) => void = () => undefined;
  const promise = new Promise<{ revision: number; updatedAt: string }>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  saveSceneMock.mockReturnValueOnce(promise);
  return { resolve, reject };
};

const succeedWith = (nextRevision: number) =>
  saveSceneMock.mockResolvedValueOnce({ revision: nextRevision, updatedAt: "2026-10-03T12:00:00.000Z" });

beforeEach(() => {
  vi.useFakeTimers();
  browser = stubBrowserGlobals();
  statuses = [];
  revision = 1;
  documentVersion = 1;
  onSaved = vi.fn();
  vi.spyOn(console, "error").mockImplementation(() => undefined);
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  saveSceneMock.mockReset();
});

describe("timing", () => {
  it("saves 2 s after the last edit, reading the document and revision at that moment", async () => {
    succeedWith(2);
    const autosaver = createAutosaver();

    autosaver.markChanged();
    expect(lastStatus()).toBe("saving");
    documentVersion = 2;

    await vi.advanceTimersByTimeAsync(1999);
    expect(saveSceneMock).not.toHaveBeenCalled();

    await vi.advanceTimersByTimeAsync(1);
    expect(saveSceneMock).toHaveBeenCalledExactlyOnceWith("scene-1", { version: 2 }, 1);
    expect(lastStatus()).toBe("saved");
    expect(onSaved).toHaveBeenCalledWith(2, false);
    autosaver.dispose();
  });

  it("waits for a pause in editing, but saves within 10 s of continuous edits", async () => {
    saveSceneMock.mockImplementation(async () => ({ revision: revision + 1, updatedAt: "t" }));
    const autosaver = createAutosaver();

    for (let elapsed = 0; elapsed < 12_000; elapsed += 500) {
      autosaver.markChanged();
      await vi.advanceTimersByTimeAsync(500);

      if (elapsed < 9_500) {
        expect(saveSceneMock).not.toHaveBeenCalled();
      }
    }

    expect(saveSceneMock).toHaveBeenCalledOnce();
    await vi.advanceTimersByTimeAsync(2_000);
    expect(saveSceneMock).toHaveBeenCalledTimes(2);
    autosaver.dispose();
  });

  it("has one save in flight at a time; edits made during it go out as soon as it lands, on the new revision", async () => {
    const first = deferredSave();
    succeedWith(3);
    const autosaver = createAutosaver();

    autosaver.markChanged();
    await vi.advanceTimersByTimeAsync(2_000);
    autosaver.markChanged();
    documentVersion = 2;
    // The second edit's 2 s pass while the first save is still out: it waits rather than overlapping.
    await vi.advanceTimersByTimeAsync(5_000);
    expect(saveSceneMock).toHaveBeenCalledOnce();
    expect(autosaver.hasUnsavedWork).toBe(true);

    first.resolve({ revision: 2, updatedAt: "t" });
    await vi.advanceTimersByTimeAsync(0);

    expect(saveSceneMock).toHaveBeenLastCalledWith("scene-1", { version: 2 }, 2);
    expect(onSaved.mock.calls).toEqual([
      [2, true],
      [3, false],
    ]);
    expect(lastStatus()).toBe("saved");
    expect(autosaver.hasUnsavedWork).toBe(false);
    autosaver.dispose();
  });

  it("still gives an edit made just before a save lands its own 2 s", async () => {
    const first = deferredSave();
    succeedWith(3);
    const autosaver = createAutosaver();

    autosaver.markChanged();
    await vi.advanceTimersByTimeAsync(2_000);
    await vi.advanceTimersByTimeAsync(500);
    autosaver.markChanged();
    first.resolve({ revision: 2, updatedAt: "t" });
    await vi.advanceTimersByTimeAsync(0);
    expect(lastStatus()).toBe("saving");

    await vi.advanceTimersByTimeAsync(1_999);
    expect(saveSceneMock).toHaveBeenCalledOnce();
    await vi.advanceTimersByTimeAsync(1);
    expect(saveSceneMock).toHaveBeenCalledTimes(2);
    autosaver.dispose();
  });

  it("does nothing when asked to save with no edits", async () => {
    const autosaver = createAutosaver();

    await autosaver.saveNow();

    expect(saveSceneMock).not.toHaveBeenCalled();
    autosaver.dispose();
  });
});

describe("failures", () => {
  it("retries with backoff (2, 5, 15, 30 s) until a save lands", async () => {
    saveSceneMock
      .mockRejectedValueOnce(new SceneApiError(500, "boom"))
      .mockRejectedValueOnce(new TypeError("Failed to fetch"))
      .mockRejectedValueOnce(new SceneApiError(503, "busy"))
      .mockRejectedValueOnce(new SceneApiError(500, "boom"));
    succeedWith(2);
    const autosaver = createAutosaver();

    autosaver.markChanged();
    await vi.advanceTimersByTimeAsync(2_000);
    expect(saveSceneMock).toHaveBeenCalledTimes(1);
    expect(statuses.at(-1)).toEqual({ kind: "error", message: "Couldn't save", willRetry: true });

    for (const [delay, expectedCalls] of [[2_000, 2], [5_000, 3], [15_000, 4], [30_000, 5]]) {
      await vi.advanceTimersByTimeAsync(delay - 1);
      expect(saveSceneMock).toHaveBeenCalledTimes(expectedCalls - 1);
      await vi.advanceTimersByTimeAsync(1);
      expect(saveSceneMock).toHaveBeenCalledTimes(expectedCalls);
    }

    expect(lastStatus()).toBe("saved");
    autosaver.dispose();
  });

  it("retries right away on Retry", async () => {
    saveSceneMock.mockRejectedValueOnce(new SceneApiError(500, "boom"));
    succeedWith(2);
    const autosaver = createAutosaver();

    autosaver.markChanged();
    await vi.advanceTimersByTimeAsync(2_000);
    await autosaver.saveNow();

    expect(saveSceneMock).toHaveBeenCalledTimes(2);
    expect(lastStatus()).toBe("saved");
    autosaver.dispose();
  });

  it.each([
    ["a save from somewhere else (409)", new SceneApiError(409, "conflict"), "conflict"],
    ["a deleted scene (404)", new SceneApiError(404, "gone"), "deleted"],
    ["a lost session", new ApiAuthError("expired"), "signedOut"],
    ["losing the editing lock to another tab (423)", new SceneApiError(423, "This scene is open somewhere else."), "openElsewhere"],
  ])("stops saving after %s, so nothing newer gets overwritten", async (_label, error, kind) => {
    saveSceneMock.mockRejectedValueOnce(error);
    const autosaver = createAutosaver();

    autosaver.markChanged();
    await vi.advanceTimersByTimeAsync(2_000);
    expect(lastStatus()).toBe(kind);

    autosaver.markChanged();
    await autosaver.saveNow();
    await vi.advanceTimersByTimeAsync(60_000);

    expect(saveSceneMock).toHaveBeenCalledOnce();
    expect(lastStatus()).toBe(kind);
    expect(autosaver.hasUnsavedWork).toBe(true);
    autosaver.dispose();
  });

  it("doesn't retry a scene that's too large, but tries again after the next edit", async () => {
    saveSceneMock.mockRejectedValueOnce(new SceneApiError(413, "This scene is too large to save."));
    succeedWith(2);
    const autosaver = createAutosaver();

    autosaver.markChanged();
    await vi.advanceTimersByTimeAsync(2_000);
    expect(statuses.at(-1)).toEqual({ kind: "error", message: "This scene is too large to save.", willRetry: false });

    await vi.advanceTimersByTimeAsync(60_000);
    expect(saveSceneMock).toHaveBeenCalledOnce();

    autosaver.markChanged();
    await vi.advanceTimersByTimeAsync(2_000);
    expect(saveSceneMock).toHaveBeenCalledTimes(2);
    expect(lastStatus()).toBe("saved");
    autosaver.dispose();
  });
});

describe("imported assets", () => {
  it("uploads a document's assets first and saves once they land; edits made meanwhile go out after", async () => {
    let finishUploads: () => void = () => undefined;
    const prepareSave = vi
      .fn<(document: unknown) => Promise<void>>()
      .mockImplementationOnce(() => new Promise<void>((resolve) => (finishUploads = resolve)))
      .mockResolvedValue(undefined);
    saveSceneMock.mockImplementation(async () => ({ revision: revision + 1, updatedAt: "t" }));
    const autosaver = createAutosaver({ prepareSave });

    autosaver.markChanged();
    await vi.advanceTimersByTimeAsync(2_000);
    expect(prepareSave).toHaveBeenCalledWith({ version: 1 }, expect.any(Function));
    expect(saveSceneMock).not.toHaveBeenCalled();
    expect(autosaver.hasUnsavedWork).toBe(true);

    documentVersion = 2;
    autosaver.markChanged();
    await vi.advanceTimersByTimeAsync(30_000);
    expect(saveSceneMock).not.toHaveBeenCalled();

    finishUploads();
    await vi.advanceTimersByTimeAsync(2_000);
    // First the document whose assets were uploaded, not the newer one; then the newer one, after
    // its own uploads.
    expect(saveSceneMock.mock.calls).toEqual([
      ["scene-1", { version: 1 }, 1],
      ["scene-1", { version: 2 }, 2],
    ]);
    expect(prepareSave).toHaveBeenLastCalledWith({ version: 2 }, expect.any(Function));
    expect(lastStatus()).toBe("saved");
    autosaver.dispose();
  });

  it("waits for another autosaver's save of the same scene, then builds on its revision", async () => {
    // React StrictMode's remount, or a new edit session after getting the lock back: the old
    // autosaver's last save (uploads first, so seconds long) is still out when the new one saves.
    let finishUploads: () => void = () => undefined;
    saveSceneMock.mockImplementation(async () => ({ revision: revision + 1, updatedAt: "t" }));
    const first = createAutosaver({ prepareSave: () => new Promise<void>((resolve) => (finishUploads = resolve)) });
    first.markChanged();
    await vi.advanceTimersByTimeAsync(2_000);
    void first.saveNow();
    first.dispose();

    const second = createAutosaver();
    documentVersion = 2;
    second.markChanged();
    await vi.advanceTimersByTimeAsync(30_000);
    expect(saveSceneMock).not.toHaveBeenCalled();

    finishUploads();
    await vi.advanceTimersByTimeAsync(0);

    expect(saveSceneMock.mock.calls).toEqual([
      ["scene-1", { version: 1 }, 1],
      ["scene-1", { version: 2 }, 2],
    ]);
    expect(lastStatus()).toBe("saved");
    second.dispose();
  });

  it("doesn't wait for a save of another scene", async () => {
    succeedWith(2);
    succeedWith(5);
    const slow = createAutosaver({ sceneId: "scene-2", prepareSave: () => new Promise<void>(() => undefined) });
    slow.markChanged();
    await vi.advanceTimersByTimeAsync(2_000);

    const autosaver = createAutosaver();
    autosaver.markChanged();
    await vi.advanceTimersByTimeAsync(2_000);

    expect(saveSceneMock).toHaveBeenCalledWith("scene-1", { version: 1 }, 1);
    slow.dispose();
    autosaver.dispose();
  });

  it("shows upload progress", async () => {
    succeedWith(2);
    const autosaver = createAutosaver({
      prepareSave: async (_document, report) => {
        report({ loaded: 0, total: 10 });
        report({ loaded: 10, total: 10 });
      },
    });

    autosaver.markChanged();
    await vi.advanceTimersByTimeAsync(2_000);

    expect(statuses).toContainEqual({ kind: "uploading", loaded: 0, total: 10 });
    expect(statuses).toContainEqual({ kind: "uploading", loaded: 10, total: 10 });
    expect(lastStatus()).toBe("saved");
    autosaver.dispose();
  });

  it("stops like a refused save when the uploads request is refused for the lock (423)", async () => {
    const autosaver = createAutosaver({
      prepareSave: () => Promise.reject(new SceneApiError(423, "This scene is open somewhere else.")),
    });

    autosaver.markChanged();
    await vi.advanceTimersByTimeAsync(60_000);

    expect(lastStatus()).toBe("openElsewhere");
    expect(saveSceneMock).not.toHaveBeenCalled();
    autosaver.dispose();
  });

  it("retries a failed upload with backoff", async () => {
    succeedWith(2);
    const prepareSave = vi
      .fn<() => Promise<void>>()
      .mockRejectedValueOnce(new AssetTransferError(0, "interrupted"))
      .mockResolvedValue(undefined);
    const autosaver = createAutosaver({ prepareSave });

    autosaver.markChanged();
    await vi.advanceTimersByTimeAsync(2_000);
    expect(statuses.at(-1)).toEqual({ kind: "error", message: "Couldn't save", willRetry: true });

    await vi.advanceTimersByTimeAsync(2_000);
    expect(saveSceneMock).toHaveBeenCalledOnce();
    expect(lastStatus()).toBe("saved");
    autosaver.dispose();
  });

  it("reports the assets a save was refused for (422) and saves again", async () => {
    saveSceneMock.mockRejectedValueOnce(new SceneApiError(422, "not uploaded", { missingAssets: ["a".repeat(64)] }));
    succeedWith(2);
    const onMissingAssets = vi.fn();
    const prepareSave = vi.fn(async () => undefined);
    const autosaver = createAutosaver({ prepareSave, onMissingAssets });

    autosaver.markChanged();
    await vi.advanceTimersByTimeAsync(2_000);
    expect(onMissingAssets).toHaveBeenCalledWith(["a".repeat(64)]);
    expect(lastStatus()).toBe("saving");

    await vi.advanceTimersByTimeAsync(2_000);
    expect(prepareSave).toHaveBeenCalledTimes(2);
    expect(saveSceneMock).toHaveBeenCalledTimes(2);
    expect(lastStatus()).toBe("saved");
    autosaver.dispose();
  });

  it.each([
    ["an asset missing everywhere", new AssetUnavailableError(["a".repeat(64)]), "An imported file is missing, so the scene can't be saved"],
    ["a local copy that doesn't match its hash (400)", new AssetTransferError(400, "BadDigest"), "An imported file is damaged in this browser"],
  ])("doesn't retry %s, but tries again after the next edit", async (_label, error, message) => {
    succeedWith(2);
    const prepareSave = vi.fn<() => Promise<void>>().mockRejectedValueOnce(error).mockResolvedValue(undefined);
    const autosaver = createAutosaver({ prepareSave });

    autosaver.markChanged();
    await vi.advanceTimersByTimeAsync(2_000);
    expect(statuses.at(-1)).toEqual({ kind: "error", message, willRetry: false });

    await vi.advanceTimersByTimeAsync(60_000);
    expect(prepareSave).toHaveBeenCalledOnce();

    autosaver.markChanged();
    await vi.advanceTimersByTimeAsync(2_000);
    expect(lastStatus()).toBe("saved");
    autosaver.dispose();
  });
});

describe("offline", () => {
  it("waits while offline and saves as soon as the connection is back", async () => {
    succeedWith(2);
    const autosaver = createAutosaver();
    browser.navigator.onLine = false;

    autosaver.markChanged();
    expect(lastStatus()).toBe("offline");
    await vi.advanceTimersByTimeAsync(10_000);
    expect(saveSceneMock).not.toHaveBeenCalled();

    browser.navigator.onLine = true;
    browser.window.dispatchEvent(new Event("online"));
    await vi.advanceTimersByTimeAsync(0);

    expect(saveSceneMock).toHaveBeenCalledOnce();
    expect(lastStatus()).toBe("saved");
    autosaver.dispose();
  });

  it("shows offline, not an error, when a save fails because the connection dropped", async () => {
    saveSceneMock.mockImplementationOnce(async () => {
      browser.navigator.onLine = false;
      throw new TypeError("Failed to fetch");
    });
    const autosaver = createAutosaver();

    autosaver.markChanged();
    await vi.advanceTimersByTimeAsync(2_000);

    expect(lastStatus()).toBe("offline");
    autosaver.dispose();
  });
});

describe("flush and dispose", () => {
  it("flush saves everything pending and reports whether it all landed", async () => {
    succeedWith(2);
    const autosaver = createAutosaver();
    autosaver.markChanged();

    await expect(autosaver.flush()).resolves.toBe(true);

    saveSceneMock.mockRejectedValueOnce(new SceneApiError(500, "boom"));
    autosaver.markChanged();
    await expect(autosaver.flush()).resolves.toBe(false);
    autosaver.dispose();
  });

  it("flush waits for the save in flight and then the edits queued behind it", async () => {
    const first = deferredSave();
    succeedWith(3);
    const autosaver = createAutosaver();

    autosaver.markChanged();
    await vi.advanceTimersByTimeAsync(2_000);
    autosaver.markChanged();
    const flushed = autosaver.flush();
    first.resolve({ revision: 2, updatedAt: "t" });

    await expect(flushed).resolves.toBe(true);
    expect(saveSceneMock).toHaveBeenCalledTimes(2);
    autosaver.dispose();
  });

  it("dispose cancels a pending save, but lets one in flight finish and report", async () => {
    const inFlight = deferredSave();
    const autosaver = createAutosaver();

    autosaver.markChanged();
    await vi.advanceTimersByTimeAsync(2_000);
    autosaver.markChanged(); // would be saved after the in-flight one
    autosaver.dispose();
    inFlight.resolve({ revision: 2, updatedAt: "t" });
    await vi.advanceTimersByTimeAsync(60_000);

    expect(onSaved).toHaveBeenCalledWith(2, true);
    expect(saveSceneMock).toHaveBeenCalledOnce();
  });
});
