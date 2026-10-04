import { afterEach, beforeEach, describe, expect, it, vi, type Mock } from "vitest";

import { stubBrowserGlobals, type BrowserStubs } from "../testing/browserStubs";
import { ApiAuthError } from "./apiFetch";
import { SceneApiError, claimSceneLock, releaseSceneLock, type LockClaim } from "./sceneLibrary";
import { SceneLock, cancelRelease, releaseWhenSaved, type SceneLockState } from "./sceneLock";

vi.mock("./apiFetch", () => ({
  apiFetch: vi.fn(),
  ApiAuthError: class ApiAuthError extends Error {},
}));

// Saves in flight, as the test arranges them (sceneLibrary's own set is covered in its tests).
const saves = vi.hoisted(() => ({ pending: new Set<Promise<unknown>>() }));

vi.mock("./sceneLibrary", async (importOriginal) => ({
  ...(await importOriginal<typeof import("./sceneLibrary")>()),
  claimSceneLock: vi.fn(),
  releaseSceneLock: vi.fn(),
  hasPendingSaves: () => saves.pending.size > 0,
  settlePendingSaves: async () => {
    await Promise.allSettled([...saves.pending]);
  },
}));

const claimMock = vi.mocked(claimSceneLock);
const releaseMock = vi.mocked(releaseSceneLock);

const HELD: LockClaim = { held: true, revision: 1 };
const ELSEWHERE: LockClaim = { held: false, revision: 1, heldByYou: true };

let browser: BrowserStubs;
let states: SceneLockState[];
let unsavedEdits: boolean;
let onChange: Mock<(state: SceneLockState) => void>;

const createLock = (initial: SceneLockState = { kind: "held", revision: 1 }) =>
  new SceneLock({
    sceneId: "scene-1",
    initial,
    onChange,
    hasUnsavedEdits: () => unsavedEdits,
  });

const lastState = () => states.at(-1);

/** A claim the test answers when it chooses. */
const deferredClaim = () => {
  let resolve: (claim: LockClaim) => void = () => undefined;
  claimMock.mockReturnValueOnce(new Promise<LockClaim>((res) => (resolve = res)));
  return { resolve };
};

/** A save in flight that the test lands when it chooses. */
const saveInFlight = () => {
  let land: () => void = () => undefined;
  const save: Promise<void> = new Promise<void>((resolve) => (land = resolve)).finally(() => saves.pending.delete(save));
  saves.pending.add(save);
  return { land };
};

beforeEach(() => {
  vi.useFakeTimers();
  browser = stubBrowserGlobals();
  states = [];
  unsavedEdits = false;
  onChange = vi.fn((state: SceneLockState) => {
    states.push(state);
  });
  saves.pending.clear();
  releaseMock.mockResolvedValue(undefined);
  vi.spyOn(console, "warn").mockImplementation(() => undefined);
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  claimMock.mockReset();
  releaseMock.mockReset();
});

describe("keeping the lock", () => {
  it("renews a held lock every 20 s and reports each answer", async () => {
    claimMock.mockResolvedValue({ held: true, revision: 4 });
    const lock = createLock();

    await vi.advanceTimersByTimeAsync(19_999);
    expect(claimMock).not.toHaveBeenCalled();
    await vi.advanceTimersByTimeAsync(1);
    expect(claimMock).toHaveBeenCalledExactlyOnceWith("scene-1", { takeOver: false });
    expect(lastState()).toEqual({ kind: "held", revision: 4 });

    await vi.advanceTimersByTimeAsync(20_000);
    expect(claimMock).toHaveBeenCalledTimes(2);
    lock.dispose();
  });

  it("notices when the lock was taken elsewhere, and then retries every 10 s", async () => {
    claimMock.mockResolvedValue(ELSEWHERE);
    const lock = createLock();

    await vi.advanceTimersByTimeAsync(20_000);
    expect(lastState()).toEqual({ kind: "elsewhere", revision: 1, heldByYou: true });

    await vi.advanceTimersByTimeAsync(10_000);
    expect(claimMock).toHaveBeenCalledTimes(2);
    expect(lock.current.kind).toBe("elsewhere");
    lock.dispose();
  });

  it("keeps retrying while held elsewhere, reports new revisions, and switches to renewing once it gets the lock", async () => {
    claimMock
      .mockResolvedValueOnce({ held: false, revision: 2, heldByYou: true })
      .mockResolvedValueOnce({ held: true, revision: 3 })
      .mockResolvedValue({ held: true, revision: 3 });
    const lock = createLock({ kind: "elsewhere", revision: 1, heldByYou: true });

    await vi.advanceTimersByTimeAsync(10_000);
    expect(lastState()).toEqual({ kind: "elsewhere", revision: 2, heldByYou: true });

    await vi.advanceTimersByTimeAsync(10_000);
    expect(lastState()).toEqual({ kind: "held", revision: 3 });

    await vi.advanceTimersByTimeAsync(10_000);
    expect(claimMock).toHaveBeenCalledTimes(2);
    await vi.advanceTimersByTimeAsync(10_000);
    expect(claimMock).toHaveBeenCalledTimes(3);
    lock.dispose();
  });

  it("changes nothing when a claim fails to arrive, and tries again at the next tick", async () => {
    claimMock.mockRejectedValueOnce(new TypeError("Failed to fetch")).mockResolvedValue(HELD);
    const lock = createLock();

    await vi.advanceTimersByTimeAsync(20_000);
    expect(onChange).not.toHaveBeenCalled();
    expect(lock.current.kind).toBe("held");

    await vi.advanceTimersByTimeAsync(20_000);
    expect(claimMock).toHaveBeenCalledTimes(2);
    expect(lastState()?.kind).toBe("held");
    lock.dispose();
  });

  it.each([
    ["a deleted scene", new SceneApiError(404, "Scene not found."), "deleted"],
    ["a lost session", new ApiAuthError("expired"), "signedOut"],
  ])("stops for good on %s", async (_label, error, kind) => {
    claimMock.mockRejectedValueOnce(error);
    const lock = createLock();

    await vi.advanceTimersByTimeAsync(20_000);
    expect(lastState()?.kind).toBe(kind);

    await vi.advanceTimersByTimeAsync(120_000);
    await lock.checkNow();
    expect(claimMock).toHaveBeenCalledOnce();
    lock.dispose();
  });

  it("checks right away when the tab becomes visible again, not when it's hidden", async () => {
    claimMock.mockResolvedValue(ELSEWHERE);
    const lock = createLock();

    browser.document.visibilityState = "hidden";
    browser.document.dispatchEvent(new Event("visibilitychange"));
    await vi.advanceTimersByTimeAsync(0);
    expect(claimMock).not.toHaveBeenCalled();

    browser.document.visibilityState = "visible";
    browser.document.dispatchEvent(new Event("visibilitychange"));
    await vi.advanceTimersByTimeAsync(0);
    expect(claimMock).toHaveBeenCalledOnce();
    expect(lastState()?.kind).toBe("elsewhere");
    lock.dispose();
  });

  it("checks right away when the page comes back from the back/forward cache", async () => {
    claimMock.mockResolvedValue(HELD);
    const lock = createLock();

    browser.window.dispatchEvent(Object.assign(new Event("pageshow"), { persisted: true }));
    await vi.advanceTimersByTimeAsync(0);

    expect(claimMock).toHaveBeenCalledOnce();
    lock.dispose();
  });

  it("sends one claim at a time", async () => {
    const pending = deferredClaim();
    const lock = createLock();

    void lock.checkNow();
    void lock.checkNow();
    await vi.advanceTimersByTimeAsync(30_000);
    expect(claimMock).toHaveBeenCalledOnce();

    pending.resolve(HELD);
    await vi.advanceTimersByTimeAsync(0);
    lock.dispose();
  });
});

describe("taking over and losing the lock", () => {
  it("takes the lock over on request", async () => {
    claimMock.mockResolvedValue({ held: true, revision: 5 });
    const lock = createLock({ kind: "elsewhere", revision: 1, heldByYou: true });

    await lock.takeOver();

    expect(claimMock).toHaveBeenCalledExactlyOnceWith("scene-1", { takeOver: true });
    expect(lastState()).toEqual({ kind: "held", revision: 5 });
    lock.dispose();
  });

  it("lets a routine claim still out finish before taking over, so its answer can't land last", async () => {
    const routine = deferredClaim();
    claimMock.mockResolvedValueOnce({ held: true, revision: 2 });
    const lock = createLock({ kind: "elsewhere", revision: 1, heldByYou: true });

    void lock.checkNow();
    const takingOver = lock.takeOver();
    await vi.advanceTimersByTimeAsync(0);
    expect(claimMock).toHaveBeenCalledOnce();

    routine.resolve(ELSEWHERE);
    await takingOver;

    expect(claimMock).toHaveBeenLastCalledWith("scene-1", { takeOver: true });
    expect(states.map((state) => state.kind)).toEqual(["elsewhere", "held"]);
    lock.dispose();
  });

  it("treats a save refused for want of the lock as losing it, and checks again at once", async () => {
    claimMock.mockResolvedValue({ held: false, revision: 3, heldByYou: true });
    const lock = createLock();

    lock.markLost();
    expect(lastState()).toEqual({ kind: "elsewhere", revision: 1, heldByYou: true });

    await vi.advanceTimersByTimeAsync(0);
    expect(claimMock).toHaveBeenCalledOnce();
    expect(lastState()).toEqual({ kind: "elsewhere", revision: 3, heldByYou: true });
    lock.dispose();
  });
});

describe("closing the tab", () => {
  const hidePage = () => browser.window.dispatchEvent(Object.assign(new Event("pagehide"), { persisted: false }));

  it("releases a held lock with a request that outlives the page", () => {
    const lock = createLock();

    hidePage();

    expect(releaseMock).toHaveBeenCalledExactlyOnceWith("scene-1", { keepalive: true });
    lock.dispose();
  });

  it("keeps the lock while edits are unsaved, so the release can't overtake the last save", () => {
    unsavedEdits = true;
    const lock = createLock();

    hidePage();

    expect(releaseMock).not.toHaveBeenCalled();
    lock.dispose();
  });

  it("releases nothing it doesn't hold", () => {
    const lock = createLock({ kind: "elsewhere", revision: 1, heldByYou: true });

    hidePage();

    expect(releaseMock).not.toHaveBeenCalled();
    lock.dispose();
  });

  it("stops everything on dispose, and ignores an answer that arrives after it", async () => {
    const pending = deferredClaim();
    const lock = createLock();
    void lock.checkNow();

    lock.dispose();
    pending.resolve(ELSEWHERE);
    await vi.advanceTimersByTimeAsync(120_000);
    hidePage();
    browser.document.dispatchEvent(new Event("visibilitychange"));

    expect(onChange).not.toHaveBeenCalled();
    expect(claimMock).toHaveBeenCalledOnce();
    expect(releaseMock).not.toHaveBeenCalled();
  });
});

describe("releaseWhenSaved", () => {
  it("releases once the saves still going out have landed", async () => {
    const save = saveInFlight();

    releaseWhenSaved("scene-1", () => false);
    await vi.advanceTimersByTimeAsync(1_000);
    expect(releaseMock).not.toHaveBeenCalled();

    save.land();
    await vi.advanceTimersByTimeAsync(0);
    expect(releaseMock).toHaveBeenCalledExactlyOnceWith("scene-1");
  });

  it("also waits for a save queued behind the one in flight", async () => {
    const first = saveInFlight();
    let second: { land: () => void } | null = null;

    releaseWhenSaved("scene-1", () => false);
    first.land();
    // As the autosaver does: the queued save goes out right after the first lands.
    second = saveInFlight();
    await vi.advanceTimersByTimeAsync(1_000);
    expect(releaseMock).not.toHaveBeenCalled();

    second.land();
    await vi.advanceTimersByTimeAsync(0);
    expect(releaseMock).toHaveBeenCalledOnce();
  });

  it("is called off when the scene is opened again first (StrictMode's remount, or coming straight back)", async () => {
    const save = saveInFlight();

    releaseWhenSaved("scene-1", () => false);
    cancelRelease("scene-1");
    save.land();
    await vi.advanceTimersByTimeAsync(1_000);

    expect(releaseMock).not.toHaveBeenCalled();
  });

  it("only calls off that scene's release", async () => {
    releaseWhenSaved("scene-1", () => false);
    cancelRelease("scene-2");
    await vi.advanceTimersByTimeAsync(0);

    expect(releaseMock).toHaveBeenCalledExactlyOnceWith("scene-1");
  });

  it("leaves the lock to lapse when edits are still unsaved after the saves settle", async () => {
    releaseWhenSaved("scene-1", () => true);
    await vi.advanceTimersByTimeAsync(1_000);

    expect(releaseMock).not.toHaveBeenCalled();
  });
});
