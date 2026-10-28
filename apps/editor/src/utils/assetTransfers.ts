/**
 * PURPOSE: Moves a scene's imported models and textures between this browser's storage and the
 * cloud, straight to and from S3 through presigned URLs.
 *
 * INPUT: The assets a scene document uses (`collectAssetRefs`).
 * OUTPUT: Uploads (`AssetUploader`) and downloads (`downloadSceneAssets`, `loadModelForScene`,
 *         `loadTextureForScene`), with progress and typed failures.
 *
 * Assets are content-addressed (sceneAssets.ts), so an uploaded asset never changes: once the cloud
 * has a hash, this editor session never sends it again. The autosaver uploads a document's assets
 * before saving it (the server refuses a save naming one it doesn't have), so a saved scene always
 * opens complete on another device. Only an edit session's autosaver uploads: a view-only tab never
 * writes, and the server checks the lock before it signs anything.
 *
 * Downloads go the other way, into this browser's storage, which is a cache of the cloud copies:
 * opening a scene fetches what it uses that isn't here before the viewport builds it, and anything
 * still missing when it's needed later (a view-only tab following another tab's import, an undo) is
 * fetched then. Every download is checked against its hash before it's stored. Reading needs no
 * lock, so view-only tabs download too.
 */
import { hasModelAsset, loadModelAsset, saveModelAsset } from "./modelAssetStore";
import { hashAsset, isAssetHash, type AssetKind, type AssetRef } from "./sceneAssets";
import { requestAssetDownloads, requestAssetUploads, type AssetUploadTicket } from "./sceneLibrary";
import { hasTextureAsset, loadTextureAsset, saveTextureAsset } from "./textureAssetStore";

export interface TransferProgress {
  /** Bytes moved so far, across every file in the batch. */
  loaded: number;
  total: number;
}

/** Downloads don't know their sizes up front, so they count files, plus bytes so far. */
export interface DownloadProgress {
  files: number;
  filesDone: number;
  loaded: number;
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

// The server's limit per uploads or downloads request.
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

// ---- Downloads ------------------------------------------------------------------------------

const hasLocalAsset = (ref: AssetRef): Promise<boolean> =>
  ref.kind === "model" ? hasModelAsset(ref.id) : hasTextureAsset(ref.id);

const saveLocalAsset = async (ref: AssetRef, blob: Blob): Promise<void> =>
  ref.kind === "model" ? saveModelAsset(ref.id, await blob.arrayBuffer()) : saveTextureAsset(ref.id, blob);

/** GETs a presigned URL, reporting bytes as they arrive. */
export const fetchAssetBlob = async (url: string, onProgress: (loaded: number) => void): Promise<Blob> => {
  let response: Response;

  try {
    response = await fetch(url);
  } catch {
    throw new AssetTransferError(0, "Downloading an imported file was interrupted.");
  }

  if (!response.ok) {
    throw new AssetTransferError(response.status, `Downloading an imported file failed (${response.status}).`);
  }

  const type = response.headers.get("Content-Type") ?? "";
  const reader = response.body?.getReader();

  if (!reader) {
    const blob = await response.blob();
    onProgress(blob.size);
    return blob;
  }

  const chunks: Uint8Array[] = [];
  let loaded = 0;

  for (;;) {
    const { done, value } = await reader.read();

    if (done) {
      break;
    }

    chunks.push(value);
    loaded += value.byteLength;
    onProgress(loaded);
  }

  return new Blob(chunks as BlobPart[], { type });
};

interface AssetDownloaderOptions {
  // The defaults are the real thing; tests swap them.
  hasLocal?: (ref: AssetRef) => Promise<boolean>;
  saveLocal?: (ref: AssetRef, blob: Blob) => Promise<void>;
  requestDownloads?: typeof requestAssetDownloads;
  fetchBlob?: typeof fetchAssetBlob;
}

const PARALLEL_DOWNLOADS = 3;

/**
 * Fetches assets into this browser's storage. One download per hash at a time, however many callers
 * want it (the scene opening, and the viewport hydrating the same model).
 */
export class AssetDownloader {
  private readonly inFlight = new Map<string, Promise<boolean>>();
  private readonly hasLocal: NonNullable<AssetDownloaderOptions["hasLocal"]>;
  private readonly saveLocal: NonNullable<AssetDownloaderOptions["saveLocal"]>;
  private readonly requestDownloads: typeof requestAssetDownloads;
  private readonly fetchBlob: typeof fetchAssetBlob;

  constructor(options: AssetDownloaderOptions = {}) {
    this.hasLocal = options.hasLocal ?? hasLocalAsset;
    this.saveLocal = options.saveLocal ?? saveLocalAsset;
    this.requestDownloads = options.requestDownloads ?? requestAssetDownloads;
    this.fetchBlob = options.fetchBlob ?? fetchAssetBlob;
  }

  /**
   * Downloads the content-addressed assets among `refs` that this browser doesn't have. Never
   * rejects: resolves to the hashes still missing afterwards (failures are logged).
   */
  async download(sceneId: string, refs: AssetRef[], onProgress?: (progress: DownloadProgress) => void): Promise<string[]> {
    const wanted = new Map(refs.filter((ref) => isAssetHash(ref.id)).map((ref) => [ref.id, ref]));
    const absent: AssetRef[] = [];

    for (const ref of wanted.values()) {
      if (!(await this.hasLocal(ref).catch(() => false))) {
        absent.push(ref);
      }
    }

    if (absent.length === 0) {
      return [];
    }

    const loaded = new Map<string, number>();
    const progress: DownloadProgress = { files: absent.length, filesDone: 0, loaded: 0 };
    const report = () => {
      progress.loaded = [...loaded.values()].reduce((sum, bytes) => sum + bytes, 0);
      onProgress?.({ ...progress });
    };
    const missing = new Set<string>();
    const settle = async (hash: string, download: Promise<boolean>) => {
      if (await download) {
        progress.filesDone += 1;
        report();
      } else {
        missing.add(hash);
      }
    };

    report();

    // Already on their way for someone else: wait for those rather than fetch them twice. Taken
    // now, since a download leaves inFlight as soon as it ends.
    const joined = absent.flatMap((ref) => {
      const download = this.inFlight.get(ref.id);
      return download ? [{ ref, download }] : [];
    });
    const toRequest = absent.filter((ref) => !joined.some((entry) => entry.ref.id === ref.id));
    const tickets: Array<{ ref: AssetRef; url: string }> = [];

    for (let start = 0; start < toRequest.length; start += MAX_ASSETS_PER_REQUEST) {
      const batch = toRequest.slice(start, start + MAX_ASSETS_PER_REQUEST);

      try {
        const answer = await this.requestDownloads(
          sceneId,
          batch.map((ref) => ref.id),
        );
        answer.unavailable.forEach((hash) => missing.add(hash));
        answer.downloads.forEach(({ hash, url }) => {
          const ref = wanted.get(hash);
          if (ref) tickets.push({ ref, url });
        });
      } catch (error) {
        console.error("[Libre3D] Couldn't ask for imported files to download.", error);
        batch.forEach((ref) => missing.add(ref.id));
      }
    }

    let next = 0;
    const downloadNext = async (): Promise<void> => {
      while (next < tickets.length) {
        const { ref, url } = tickets[next];
        next += 1;
        // Started elsewhere since this call asked for its URL.
        const download = this.inFlight.get(ref.id) ?? this.start(ref, url, (bytes) => {
          loaded.set(ref.id, bytes);
          report();
        });
        await settle(ref.id, download);
      }
    };

    await Promise.all([
      ...joined.map(({ ref, download }) => settle(ref.id, download)),
      ...Array.from({ length: Math.min(PARALLEL_DOWNLOADS, tickets.length) }, downloadNext),
    ]);

    return [...missing];
  }

  private start(ref: AssetRef, url: string, onProgress: (loaded: number) => void): Promise<boolean> {
    const download = (async () => {
      try {
        const blob = await this.fetchBlob(url, onProgress);

        // Never store bytes under an address they don't have.
        if ((await hashAsset(blob)) !== ref.id) {
          throw new Error("The downloaded file doesn't match its hash.");
        }

        await this.saveLocal(ref, blob);
        return true;
      } catch (error) {
        console.error(`[Libre3D] Couldn't download imported ${ref.kind} "${ref.id}".`, error);
        return false;
      } finally {
        this.inFlight.delete(ref.id);
      }
    })();

    this.inFlight.set(ref.id, download);
    return download;
  }
}

const downloader = new AssetDownloader();

// The scene the editor has open, whose downloads route the load-time fallback below uses. Module
// memory like editorSession.ts: one editor per tab.
let openSceneId: string | null = null;

/** Tells the load-time fallback which scene's assets it may download (null when none is open). */
export const setSceneForAssetDownloads = (sceneId: string | null): void => {
  openSceneId = sceneId;
};

/** Downloads what a scene uses that this browser doesn't have; resolves to the hashes still missing. */
export const downloadSceneAssets = (
  sceneId: string,
  refs: AssetRef[],
  onProgress?: (progress: DownloadProgress) => void,
): Promise<string[]> => downloader.download(sceneId, refs, onProgress);

const loadForScene = async <T>(ref: AssetRef, load: (id: string) => Promise<T | null>): Promise<T | null> => {
  const local = await load(ref.id);

  if (local || !openSceneId || !isAssetHash(ref.id)) {
    return local;
  }

  await downloader.download(openSceneId, [ref]);
  return load(ref.id);
};

/** An imported model's bytes: from this browser's storage, else downloaded for the open scene. */
export const loadModelForScene = (assetId: string): Promise<ArrayBuffer | null> =>
  loadForScene({ id: assetId, kind: "model" }, loadModelAsset);

/** An imported texture: from this browser's storage, else downloaded for the open scene. */
export const loadTextureForScene = (textureAssetId: string): Promise<Blob | null> =>
  loadForScene({ id: textureAssetId, kind: "texture" }, loadTextureAsset);
