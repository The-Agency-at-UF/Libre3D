import { describe, expect, it, vi } from "vitest";

import { AssetTransferError, AssetUnavailableError, AssetUploader, type TransferProgress } from "./assetTransfers";
import type { AssetRef } from "./sceneAssets";
import { SceneApiError, type AssetUploadTicket } from "./sceneLibrary";

// Everything the uploader touches is injected; keep the real modules (and storage) out.
vi.mock("./apiFetch", () => ({ apiFetch: vi.fn(), ApiAuthError: class ApiAuthError extends Error {} }));
vi.mock("./modelAssetStore", () => ({ loadModelAsset: vi.fn() }));
vi.mock("./textureAssetStore", () => ({ loadTextureAsset: vi.fn() }));

const MODEL = "a".repeat(64);
const TEXTURE = "b".repeat(64);
const OTHER = "c".repeat(64);

const model = (id: string): AssetRef => ({ id, kind: "model" });
const texture = (id: string): AssetRef => ({ id, kind: "texture" });

interface Setup {
  /** Bytes in this browser's storage, by hash. */
  local?: Record<string, ArrayBuffer | Blob>;
  /** Hashes the cloud already has. */
  cloud?: string[];
  confirmed?: string[];
  put?: (ticket: AssetUploadTicket, body: ArrayBuffer | Blob, onProgress: (loaded: number) => void) => Promise<void>;
}

const bytes = (size: number) => new ArrayBuffer(size);

/** An uploader over in-memory storage, a fake uploads route, and PUTs that land in `cloud`. */
const setUp = ({ local = {}, cloud = [], confirmed = [], put }: Setup = {}) => {
  const inCloud = new Set(cloud);
  const requests: Array<Array<{ hash: string; size: number; kind: string }>> = [];
  const puts: string[] = [];
  const requestUploads = vi.fn(async (_sceneId: string, assets: Array<{ hash: string; size: number; kind: "model" | "texture" }>) => {
    requests.push(assets);
    return assets
      .filter((asset) => !inCloud.has(asset.hash))
      .map((asset) => ({ hash: asset.hash, url: `https://s3.test/${asset.hash}`, headers: { "x-amz-checksum-sha256": asset.hash } }));
  });
  const uploader = new AssetUploader({
    sceneId: "scene-1",
    confirmed,
    readAsset: async (ref) => local[ref.id] ?? null,
    requestUploads,
    put:
      put ??
      (async (ticket, body, onProgress) => {
        puts.push(ticket.hash);
        onProgress(body instanceof Blob ? body.size : body.byteLength);
        inCloud.add(ticket.hash);
      }),
  });

  return { uploader, requests, puts, requestUploads, inCloud };
};

describe("AssetUploader", () => {
  it("uploads the content-addressed assets the cloud lacks, once, and leaves old IDs alone", async () => {
    const { uploader, requests, puts } = setUp({
      local: { [MODEL]: bytes(10), [TEXTURE]: new Blob(["png"]), "asset-old": bytes(5) },
      cloud: [TEXTURE],
    });

    await uploader.upload([model(MODEL), texture(TEXTURE), model("asset-old"), model(MODEL)]);

    expect(requests).toEqual([
      [
        { hash: MODEL, size: 10, kind: "model" },
        { hash: TEXTURE, size: 3, kind: "texture" },
      ],
    ]);
    expect(puts).toEqual([MODEL]);

    // Both are known to be in the cloud now: nothing more to ask.
    await uploader.upload([model(MODEL), texture(TEXTURE)]);
    expect(requests).toHaveLength(1);
  });

  it("never asks about the assets the scene was loaded with", async () => {
    const { uploader, requestUploads } = setUp({ local: { [MODEL]: bytes(10) }, confirmed: [MODEL] });

    await uploader.upload([model(MODEL)]);

    expect(requestUploads).not.toHaveBeenCalled();
  });

  it("reports progress across every file in the batch, ending at the total", async () => {
    const progress: TransferProgress[] = [];
    const { uploader } = setUp({
      local: { [MODEL]: bytes(100), [TEXTURE]: bytes(50) },
      put: async (ticket, body, onProgress) => {
        const size = (body as ArrayBuffer).byteLength;
        onProgress(size / 2);
        onProgress(size);
      },
    });

    await uploader.upload([model(MODEL), texture(TEXTURE)], (update) => progress.push(update));

    expect(progress[0]).toEqual({ loaded: 0, total: 150 });
    expect(progress.at(-1)).toEqual({ loaded: 150, total: 150 });
    expect(progress.every((update, index) => index === 0 || update.loaded >= progress[index - 1].loaded)).toBe(true);
  });

  it("runs at most three uploads at once", async () => {
    let running = 0;
    let most = 0;
    const hashes = Array.from({ length: 7 }, (_unused, index) => String(index).repeat(64));
    const { uploader } = setUp({
      local: Object.fromEntries(hashes.map((hash) => [hash, bytes(1)])),
      put: async () => {
        running += 1;
        most = Math.max(most, running);
        await new Promise((resolve) => setTimeout(resolve, 1));
        running -= 1;
      },
    });

    await uploader.upload(hashes.map(model));

    expect(most).toBe(3);
  });

  it("asks in batches of at most 100", async () => {
    const hashes = Array.from({ length: 150 }, (_unused, index) => index.toString(16).padStart(64, "0"));
    const { uploader, requests } = setUp({ local: Object.fromEntries(hashes.map((hash) => [hash, bytes(1)])), cloud: hashes });

    await uploader.upload(hashes.map(texture));

    expect(requests.map((batch) => batch.length)).toEqual([100, 50]);
  });

  it("rejects when an upload fails, and next time retries only what didn't land", async () => {
    let failOnce = true;
    const landed: string[] = [];
    const { uploader, requests } = setUp({
      local: { [MODEL]: bytes(10), [TEXTURE]: bytes(10) },
      put: async (ticket) => {
        if (ticket.hash === TEXTURE && failOnce) {
          failOnce = false;
          throw new AssetTransferError(403, "expired");
        }
        landed.push(ticket.hash);
      },
    });

    await expect(uploader.upload([model(MODEL), texture(TEXTURE)])).rejects.toMatchObject({ status: 403 });
    expect(landed).toEqual([MODEL]);

    await uploader.upload([model(MODEL), texture(TEXTURE)]);
    expect(requests.at(-1)).toEqual([{ hash: TEXTURE, size: 10, kind: "texture" }]);
    expect(landed).toEqual([MODEL, TEXTURE]);
  });

  it("passes on a refused uploads request (e.g. 423 when the lock moved)", async () => {
    const { uploader, requestUploads } = setUp({ local: { [MODEL]: bytes(10) } });
    requestUploads.mockRejectedValueOnce(new SceneApiError(423, "This scene is open somewhere else."));

    await expect(uploader.upload([model(MODEL)])).rejects.toMatchObject({ status: 423 });
  });

  it("skips an asset that isn't in this browser, unless a save was refused for it", async () => {
    const { uploader, requestUploads } = setUp({ local: { [MODEL]: bytes(10) } });

    // Uploaded from another tab, perhaps: the save finds out.
    await uploader.upload([model(MODEL), texture(OTHER)]);
    expect(requestUploads.mock.calls[0][1]).toEqual([{ hash: MODEL, size: 10, kind: "model" }]);

    uploader.reportMissing([OTHER]);

    await expect(uploader.upload([model(MODEL), texture(OTHER)])).rejects.toEqual(new AssetUnavailableError([OTHER]));
  });

  it("uploads again what a refused save reported missing, even if it was confirmed", async () => {
    const { uploader, puts } = setUp({ local: { [MODEL]: bytes(10) }, confirmed: [MODEL] });

    uploader.reportMissing([MODEL]);
    await uploader.upload([model(MODEL)]);

    expect(puts).toEqual([MODEL]);
  });

  it("treats an empty local copy as missing (a failed write leaves one)", async () => {
    const { uploader, requestUploads } = setUp({ local: { [MODEL]: bytes(0) } });

    await uploader.upload([model(MODEL)]);

    expect(requestUploads).not.toHaveBeenCalled();
  });
});
