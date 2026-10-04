/**
 * PURPOSE: Saves the open scene to the cloud as it's edited, and reports how that's going.
 *
 * INPUT: `markChanged()` on every edit of the scene's content; `saveNow()` / `flush()` to save
 *        without waiting (leaving the editor, signing out, the Retry button).
 * OUTPUT: Saves through `saveScene`, and a `SaveStatus` for the editor's indicator.
 *
 * Timing: a save goes out 2 s after the last edit, or after 10 s of continuous editing at the
 * latest (dragging a slider never pauses for 2 s). One save of a scene is in flight at a time, even
 * across autosavers; edits made during it are saved right after. Failures retry with backoff, and
 * immediately when the browser comes back online. A conflict (saved from somewhere else), a
 * deleted scene, a lost session, or losing the editing lock (another tab or device took the scene
 * over) stops this autosaver for good: retrying those would fail the same way, or overwrite
 * someone's newer save. Getting the lock back starts a new autosaver (useSceneLock.ts).
 *
 * Imported assets: `prepareSave` runs before each save with the document about to go out, and the
 * save waits for it (uploading the assets the document uses, see assetTransfers.ts), so a saved
 * scene never names an asset the cloud doesn't have. A save the server refuses for a missing asset
 * (422) reports it (`onMissingAssets`) and tries again.
 */
import { ApiAuthError } from "./apiFetch";
import { AssetTransferError, AssetUnavailableError, type TransferProgress } from "./assetTransfers";
import { SceneApiError, saveScene } from "./sceneLibrary";

export type SaveStatus =
  | { kind: "saved"; savedAt: Date | null }
  | { kind: "saving" }
  /** Uploading imported assets before saving: bytes so far, across the batch. */
  | { kind: "uploading"; loaded: number; total: number }
  | { kind: "offline" }
  | { kind: "error"; message: string; willRetry: boolean }
  | { kind: "conflict" }
  | { kind: "deleted" }
  | { kind: "signedOut" }
  /** Another editor session holds the scene's lock, so this tab is read-only. */
  | { kind: "openElsewhere" };

interface SceneAutosaverOptions {
  sceneId: string;
  /**
   * The cloud revision the next save builds on. Read at each save, and owned by the caller (updated
   * from onSaved), so a new autosaver for the same scene picks up a save an old one just made.
   */
  readRevision: () => number;
  /** The scene document to save, read at the moment the save goes out. */
  readDocument: () => unknown;
  onStatus: (status: SaveStatus) => void;
  /** After every successful save; `hasPendingEdits` when edits made during it still need saving. */
  onSaved: (revision: number, hasPendingEdits: boolean) => void;
  /**
   * Before each save, with the document about to be saved: uploads the assets it uses. The save
   * goes out once this resolves; a rejection fails the save. `report` shows upload progress.
   */
  prepareSave?: (document: unknown, report: (progress: TransferProgress) => void) => Promise<void>;
  /** A save was refused because the cloud doesn't have these assets (422). */
  onMissingAssets?: (hashes: string[]) => void;
}

const DEBOUNCE_MS = 2_000;
const MAX_WAIT_MS = 10_000;
const RETRY_DELAYS_MS = [2_000, 5_000, 15_000, 30_000];

// The save in flight for each scene, whichever autosaver started it. Another autosaver for the same
// scene (React StrictMode's remount, or a new edit session after getting the lock back) waits for
// it, so it never builds on the revision that save is about to replace (a 409). Uploading assets
// first makes that window seconds long.
const savesInFlight = new Map<string, Promise<void>>();

export class SceneAutosaver {
  private readonly options: SceneAutosaverOptions;
  private isDirty = false;
  private firstChangeAt = 0;
  private inFlight: Promise<void> | null = null;
  private timer: ReturnType<typeof setTimeout> | null = null;
  private retryCount = 0;
  /** Set by a conflict, deletion, lost session or lock, or dispose: no more saves from this instance. */
  private isStopped = false;

  constructor(options: SceneAutosaverOptions) {
    this.options = options;
    window.addEventListener("online", this.handleOnline);
  }

  /** Whether leaving now would lose edits (not saved yet, or a save still in flight). */
  get hasUnsavedWork(): boolean {
    return this.isDirty || this.inFlight !== null;
  }

  markChanged(): void {
    if (this.isStopped) {
      return;
    }

    if (!this.isDirty) {
      this.isDirty = true;
      this.firstChangeAt = Date.now();
    }

    this.options.onStatus(navigator.onLine ? { kind: "saving" } : { kind: "offline" });
    const untilMaxWait = this.firstChangeAt + MAX_WAIT_MS - Date.now();
    this.schedule(Math.max(0, Math.min(DEBOUNCE_MS, untilMaxWait)));
  }

  /** Saves pending edits now. Resolves when this save (and any it was queued behind) settles. */
  saveNow(): Promise<void> {
    this.clearTimer();

    if (this.isStopped || !this.isDirty) {
      return this.inFlight ?? Promise.resolve();
    }

    if (this.inFlight) {
      return this.inFlight.then(() => this.saveNow());
    }

    const othersSave = savesInFlight.get(this.options.sceneId);

    if (othersSave) {
      return othersSave.then(() => this.saveNow());
    }

    if (!navigator.onLine) {
      this.options.onStatus({ kind: "offline" });
      return Promise.resolve();
    }

    this.isDirty = false;
    this.firstChangeAt = 0;
    this.options.onStatus({ kind: "saving" });

    const document = this.options.readDocument();
    const prepared =
      this.options.prepareSave?.(document, (progress) => {
        if (!this.isStopped) {
          this.options.onStatus({ kind: "uploading", ...progress });
        }
      }) ?? Promise.resolve();

    const { sceneId } = this.options;
    const save = prepared
      .then(() => saveScene(sceneId, document, this.options.readRevision()))
      .then(
        (result) => this.handleSaved(result.revision),
        (error: unknown) => this.handleFailed(error),
      )
      .finally(() => {
        this.inFlight = null;

        if (savesInFlight.get(sceneId) === save) {
          savesInFlight.delete(sceneId);
        }
      });

    this.inFlight = save;
    savesInFlight.set(sceneId, save);

    return save;
  }

  /** Saves everything pending; true if nothing is left unsaved afterwards. */
  async flush(): Promise<boolean> {
    await this.saveNow();
    return !this.hasUnsavedWork;
  }

  /** Stops timers and listeners. A save already in flight still finishes. */
  dispose(): void {
    this.isStopped = true;
    this.clearTimer();
    window.removeEventListener("online", this.handleOnline);
  }

  private handleSaved(revision: number): void {
    this.retryCount = 0;
    this.options.onSaved(revision, this.isDirty);

    if (this.isStopped) {
      return;
    }

    if (this.isDirty) {
      // Edited while that save was in flight.
      this.options.onStatus({ kind: "saving" });
      this.schedule(DEBOUNCE_MS);
    } else {
      this.options.onStatus({ kind: "saved", savedAt: new Date() });
    }
  }

  private handleFailed(error: unknown): void {
    // What was sent didn't land, so it still needs saving.
    if (!this.isDirty) {
      this.isDirty = true;
      this.firstChangeAt = Date.now();
    }

    if (error instanceof SceneApiError && (error.status === 409 || error.status === 404 || error.status === 423)) {
      this.stop(
        error.status === 423 ? { kind: "openElsewhere" } : error.status === 409 ? { kind: "conflict" } : { kind: "deleted" },
      );
      return;
    }

    if (error instanceof ApiAuthError) {
      this.stop({ kind: "signedOut" });
      return;
    }

    if (this.isStopped) {
      return;
    }

    if (error instanceof SceneApiError && error.status === 413) {
      // Retrying sends the same too-large document; the next edit (e.g. deleting something) tries again.
      this.options.onStatus({ kind: "error", message: error.message, willRetry: false });
      return;
    }

    if (error instanceof SceneApiError && error.status === 422) {
      // The cloud lacks assets the document uses: upload them and save again. Backing off, in case
      // it keeps disagreeing.
      const missing = Array.isArray(error.details.missingAssets) ? error.details.missingAssets : [];
      this.options.onMissingAssets?.(missing.filter((hash): hash is string => typeof hash === "string"));
      this.options.onStatus({ kind: "saving" });
      this.schedule(RETRY_DELAYS_MS[Math.min(this.retryCount, RETRY_DELAYS_MS.length - 1)]);
      this.retryCount += 1;
      return;
    }

    // Retrying would fail the same way. The next edit (removing the object, say) tries again.
    if (error instanceof AssetUnavailableError) {
      this.options.onStatus({ kind: "error", message: "An imported file is missing, so the scene can't be saved", willRetry: false });
      return;
    }

    if (error instanceof AssetTransferError && error.status === 400) {
      // BadDigest: this browser's copy doesn't match its hash any more.
      this.options.onStatus({ kind: "error", message: "An imported file is damaged in this browser", willRetry: false });
      return;
    }

    if (!navigator.onLine) {
      this.options.onStatus({ kind: "offline" });
      return;
    }

    console.error("[Libre3D] Autosave failed.", error);
    this.options.onStatus({ kind: "error", message: "Couldn't save", willRetry: true });
    this.schedule(RETRY_DELAYS_MS[Math.min(this.retryCount, RETRY_DELAYS_MS.length - 1)]);
    this.retryCount += 1;
  }

  private stop(status: SaveStatus): void {
    this.isStopped = true;
    this.clearTimer();
    this.options.onStatus(status);
  }

  private schedule(delayMs: number): void {
    this.clearTimer();
    this.timer = setTimeout(() => void this.saveNow(), delayMs);
  }

  private clearTimer(): void {
    if (this.timer !== null) {
      clearTimeout(this.timer);
      this.timer = null;
    }
  }

  private readonly handleOnline = (): void => {
    if (this.isDirty) {
      void this.saveNow();
    }
  };
}
