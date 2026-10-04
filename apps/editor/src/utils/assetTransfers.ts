/**
 * PURPOSE: Moves a scene's imported models and textures between this browser's storage and the
 * cloud, straight to and from S3 through presigned URLs.
 *
 * INPUT: The assets a scene document uses (`collectAssetRefs`).
 * OUTPUT: Uploads (`AssetUploader`), with progress and typed failures for the autosaver.
 *
 * Assets are content-addressed (sceneAssets.ts), so an uploaded asset never changes: once the cloud
 * has a hash, this editor session never sends it again. The autosaver uploads a document's assets
 * before saving it (the server refuses a save naming one it doesn't have), so a saved scene always
 * opens complete on another device. Only an edit session's autosaver uploads: a view-only tab never
 * writes, and the server checks the lock before it signs anything.
 */
import { loadModelAsset } from "./modelAssetStore";
import { isAssetHash, type AssetKind, type AssetRef } from "./sceneAssets";
import { requestAssetUploads, type AssetUploadTicket } from "./sceneLibrary";
import { loadTextureAsset } from "./textureAssetStore";

export interface TransferProgress {
  /** Bytes moved so far, across every file in the batch. */
  loaded: number;
  total: number;
}

/** An upload or download S3 refused (`status`), or one that never got an answer (status 0). */
export class AssetTransferError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "AssetTransferError";
    this.status = status;
  }
}

/** Assets the cloud doesn't have and this browser can't supply either, so the scene can't be saved. */
export class AssetUnavailableError extends Error {
  readonly hashes: string[];

  constructor(hashes: string[]) {
    super("An imported model or texture is missing from this browser and the cloud.");
    this.name = "AssetUnavailableError";
    this.hashes = hashes;
  }
}

type AssetBody = ArrayBuffer | Blob;

const sizeOf = (body: AssetBody): number => (body instanceof Blob ? body.size : body.byteLength);

/** An asset's bytes from this browser's storage, or null if they aren't here. */
export const readLocalAsset = (ref: AssetRef): Promise<AssetBody | null> =>
  ref.kind === "model" ? loadModelAsset(ref.id) : loadTextureAsset(ref.id);

/**
 * PUTs an asset to its presigned URL, sending the headers it was signed with. XMLHttpRequest rather
 * than fetch because only XHR reports upload progress.
 */
export const putAsset = (ticket: AssetUploadTicket, body: AssetBody, onProgress: (loaded: number) => void): Promise<void> =>
  new Promise((resolve, reject) => {
    const request = new XMLHttpRequest();
    request.open("PUT", ticket.url);
    Object.entries(ticket.headers).forEach(([name, value]) => request.setRequestHeader(name, value));
    request.upload.onprogress = (event) => onProgress(event.loaded);
    request.onload = () => {
      if (request.status >= 200 && request.status < 300) {
        resolve();
      } else {
        // 400 BadDigest: the bytes don't match their hash. 403: the URL expired (or didn't match).
        reject(new AssetTransferError(request.status, `Uploading an imported file failed (${request.status}).`));
      }
    };
    request.onerror = () => reject(new AssetTransferError(0, "Uploading an imported file was interrupted."));
    request.send(body);
  });

interface AssetUploaderOptions {
  sceneId: string;
  /** Hashes the cloud is known to have: those of the scene as it was loaded (`OpenedScene.assetHashes`). */
  confirmed?: Iterable<string>;
  // The defaults are the real thing; tests swap them.
  readAsset?: (ref: AssetRef) => Promise<AssetBody | null>;
  requestUploads?: (sceneId: string, assets: Array<{ hash: string; size: number; kind: AssetKind }>) => Promise<AssetUploadTicket[]>;
  put?: typeof putAsset;
}

// The server's limit per uploads request.
const MAX_ASSETS_PER_REQUEST = 100;
const PARALLEL_UPLOADS = 3;

/**
 * Uploads the assets a document uses that the cloud may not have, for one edit session. One call at
 * a time (the autosaver has one save in flight).
 */
export class AssetUploader {
  private readonly sceneId: string;
  private readonly confirmed: Set<string>;
  /** A save was refused for want of these; until they're uploaded, they mustn't be skipped. */
  private readonly reportedMissing = new Set<string>();
  private readonly readAsset: NonNullable<AssetUploaderOptions["readAsset"]>;
  private readonly requestUploads: NonNullable<AssetUploaderOptions["requestUploads"]>;
  private readonly put: typeof putAsset;

  constructor(options: AssetUploaderOptions) {
    this.sceneId = options.sceneId;
    this.confirmed = new Set(options.confirmed ?? []);
    this.readAsset = options.readAsset ?? readLocalAsset;
    this.requestUploads = options.requestUploads ?? requestAssetUploads;
    this.put = options.put ?? putAsset;
  }

  /**
   * Makes sure the cloud has every content-addressed asset in `refs` (IDs from before cloud assets
   * are left alone). Resolves once it does; rejects with what went wrong (an AssetTransferError, an
   * AssetUnavailableError, or the uploads request's SceneApiError / ApiAuthError).
   */
  async upload(refs: AssetRef[], onProgress?: (progress: TransferProgress) => void): Promise<void> {
    const pending = refs.filter((ref) => isAssetHash(ref.id) && !this.confirmed.has(ref.id));
    const local = new Map<string, { ref: AssetRef; body: AssetBody; size: number }>();
    const unavailable: string[] = [];

    for (const ref of pending) {
      const body = await this.readAsset(ref);

      if (body && sizeOf(body) > 0) {
        local.set(ref.id, { ref, body, size: sizeOf(body) });
      } else if (this.reportedMissing.has(ref.id)) {
        unavailable.push(ref.id);
      }
      // Otherwise the cloud may well have it (uploaded from another tab or device); if not, the
      // save is refused for it and reportMissing makes the next attempt fail here instead.
    }

    if (unavailable.length > 0) {
      throw new AssetUnavailableError(unavailable);
    }

    const entries = [...local.values()];
    const tickets: AssetUploadTicket[] = [];

    for (let start = 0; start < entries.length; start += MAX_ASSETS_PER_REQUEST) {
      const batch = entries.slice(start, start + MAX_ASSETS_PER_REQUEST);
      const answer = await this.requestUploads(
        this.sceneId,
        batch.map(({ ref, size }) => ({ hash: ref.id, size, kind: ref.kind })),
      );
      const needed = new Set(answer.map((ticket) => ticket.hash));

      // The ones without a ticket are in the cloud already.
      batch.filter(({ ref }) => !needed.has(ref.id)).forEach(({ ref }) => this.markConfirmed(ref.id));
      tickets.push(...answer.filter((ticket) => local.has(ticket.hash)));
    }

    if (tickets.length === 0) {
      return;
    }

    const loaded = new Map<string, number>();
    const total = tickets.reduce((sum, ticket) => sum + local.get(ticket.hash)!.size, 0);
    const report = () => onProgress?.({ loaded: [...loaded.values()].reduce((sum, bytes) => sum + bytes, 0), total });
    let next = 0;
    let failure: { error: unknown } | null = null;

    const uploadNext = async (): Promise<void> => {
      while (next < tickets.length && !failure) {
        const ticket = tickets[next];
        next += 1;
        const { body, size } = local.get(ticket.hash)!;

        try {
          await this.put(ticket, body, (bytes) => {
            loaded.set(ticket.hash, bytes);
            report();
          });
          loaded.set(ticket.hash, size);
          this.markConfirmed(ticket.hash);
          report();
        } catch (error) {
          // Stop starting new ones; those already going finish, and count if they land.
          failure ??= { error };
        }
      }
    };

    report();
    await Promise.all(Array.from({ length: Math.min(PARALLEL_UPLOADS, tickets.length) }, uploadNext));

    if (failure) {
      throw (failure as { error: unknown }).error;
    }
  }

  /** A save was refused because the cloud lacks these (422): upload them again before the next one. */
  reportMissing(hashes: string[]): void {
    for (const hash of hashes) {
      this.confirmed.delete(hash);
      this.reportedMissing.add(hash);
    }
  }

  private markConfirmed(hash: string): void {
    this.confirmed.add(hash);
    this.reportedMissing.delete(hash);
  }
}
