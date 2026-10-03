import { afterEach, beforeEach, describe, expect, it, vi, type Mock } from "vitest";

import { stubBrowserGlobals, type BrowserStubs } from "../testing/browserStubs";
import { ApiAuthError } from "./apiFetch";
import { SceneAutosaver, type SaveStatus } from "./sceneAutosave";
import { SceneApiError, saveScene } from "./sceneLibrary";

vi.mock("./apiFetch", () => ({
  apiFetch: vi.fn(),
  ApiAuthError: class ApiAuthError extends Error {},
}));

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

const createAutosaver = () =>
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
