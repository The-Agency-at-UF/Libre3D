import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { SceneApiError } from "./sceneLibrary";
import { THUMBNAIL_INTERVAL_MS, ThumbnailScheduler } from "./sceneThumbnails";

vi.mock("./apiFetch", () => ({
  apiFetch: vi.fn(),
  ApiAuthError: class ApiAuthError extends Error {},
}));

const picture = new Blob(["jpeg"], { type: "image/jpeg" });

let capture: ReturnType<typeof vi.fn<() => Promise<Blob | null>>>;
let upload: ReturnType<typeof vi.fn<(image: Blob) => Promise<void>>>;
let scheduler: ThumbnailScheduler;

beforeEach(() => {
  vi.useFakeTimers();
  capture = vi.fn(async () => picture);
  upload = vi.fn(async () => undefined);
  scheduler = new ThumbnailScheduler({ capture, upload });
});

afterEach(() => {
  scheduler.dispose();
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe("ThumbnailScheduler", () => {
  it("takes and uploads a picture after the first save right away", async () => {
    scheduler.noteSaved();
    await vi.advanceTimersByTimeAsync(0);

    expect(capture).toHaveBeenCalledOnce();
    expect(upload).toHaveBeenCalledWith(picture);
  });

  it("folds the saves of the next minute into one more picture when the minute is up", async () => {
    scheduler.noteSaved();
    await vi.advanceTimersByTimeAsync(10_000);
    scheduler.noteSaved();
    await vi.advanceTimersByTimeAsync(20_000);
    scheduler.noteSaved();

    await vi.advanceTimersByTimeAsync(THUMBNAIL_INTERVAL_MS - 30_000 - 1);
    expect(upload).toHaveBeenCalledOnce();

    await vi.advanceTimersByTimeAsync(1);
    expect(upload).toHaveBeenCalledTimes(2);

    // Nothing saved since: nothing more to take.
    await vi.advanceTimersByTimeAsync(5 * THUMBNAIL_INTERVAL_MS);
    expect(upload).toHaveBeenCalledTimes(2);
  });

  it("takes another picture after one still uploading when a save lands meanwhile", async () => {
    let finishUpload = () => {};
    upload.mockImplementationOnce(() => new Promise<void>((resolve) => (finishUpload = resolve)));
    scheduler.noteSaved();
    await vi.advanceTimersByTimeAsync(0);
    scheduler.noteSaved();

    finishUpload();
    await vi.advanceTimersByTimeAsync(THUMBNAIL_INTERVAL_MS);

    expect(upload).toHaveBeenCalledTimes(2);
  });

  it("uploads nothing when there's no picture to take (e.g. during preview)", async () => {
    capture.mockResolvedValueOnce(null);

    scheduler.noteSaved();
    await vi.advanceTimersByTimeAsync(0);

    expect(upload).not.toHaveBeenCalled();
  });

  it("tries again on the next save after a failed upload", async () => {
    vi.spyOn(console, "warn").mockImplementation(() => undefined);
    upload.mockRejectedValueOnce(new Error("offline"));
    scheduler.noteSaved();
    await vi.advanceTimersByTimeAsync(THUMBNAIL_INTERVAL_MS);

    scheduler.noteSaved();
    await vi.advanceTimersByTimeAsync(0);

    expect(upload).toHaveBeenCalledTimes(2);
  });

  it.each([423, 404])("stops for good when the upload is refused with %i (lock lost, scene deleted)", async (status) => {
    upload.mockRejectedValueOnce(new SceneApiError(status, "refused"));
    scheduler.noteSaved();
    await vi.advanceTimersByTimeAsync(THUMBNAIL_INTERVAL_MS);

    scheduler.noteSaved();
    await vi.advanceTimersByTimeAsync(THUMBNAIL_INTERVAL_MS);

    expect(capture).toHaveBeenCalledOnce();
  });

  it("drops a waiting picture and a captured one once disposed", async () => {
    scheduler.noteSaved();
    await vi.advanceTimersByTimeAsync(0);
    scheduler.noteSaved();
    scheduler.dispose();
    await vi.advanceTimersByTimeAsync(THUMBNAIL_INTERVAL_MS);
    expect(capture).toHaveBeenCalledOnce();

    let finishCapture = (_image: Blob | null) => {};
    const other = new ThumbnailScheduler({ capture: () => new Promise((resolve) => (finishCapture = resolve)), upload });
    other.noteSaved();
    other.dispose();
    finishCapture(picture);
    await vi.advanceTimersByTimeAsync(0);
    expect(upload).toHaveBeenCalledOnce();
  });
});
