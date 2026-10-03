/**
 * PURPOSE: Saves the open scene to the cloud as it's edited, and reports how that's going.
 *
 * INPUT: `markChanged()` on every edit of the scene's content; `saveNow()` / `flush()` to save
 *        without waiting (leaving the editor, signing out, the Retry button).
 * OUTPUT: Saves through `saveScene`, and a `SaveStatus` for the editor's indicator.
 *
 * Timing: a save goes out 2 s after the last edit, or after 10 s of continuous editing at the
 * latest (dragging a slider never pauses for 2 s). One save is in flight at a time; edits made
 * during it are saved right after. Failures retry with backoff, and immediately when the browser
 * comes back online. A conflict (saved from somewhere else), a deleted scene, a lost session, or
 * losing the editing lock (another tab or device took the scene over) stops this autosaver for good:
 * retrying those would fail the same way, or overwrite someone's newer save. Getting the lock back
 * starts a new autosaver (useSceneLock.ts).
 */
import { ApiAuthError } from "./apiFetch";
import { SceneApiError, saveScene } from "./sceneLibrary";

export type SaveStatus =
  | { kind: "saved"; savedAt: Date | null }
  | { kind: "saving" }
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
}

const DEBOUNCE_MS = 2_000;
const MAX_WAIT_MS = 10_000;
const RETRY_DELAYS_MS = [2_000, 5_000, 15_000, 30_000];

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

    if (!navigator.onLine) {
      this.options.onStatus({ kind: "offline" });
      return Promise.resolve();
    }

    this.isDirty = false;
    this.firstChangeAt = 0;
    this.options.onStatus({ kind: "saving" });

    this.inFlight = saveScene(this.options.sceneId, this.options.readDocument(), this.options.readRevision())
      .then(
        (result) => this.handleSaved(result.revision),
        (error: unknown) => this.handleFailed(error),
      )
      .finally(() => {
        this.inFlight = null;
      });

    return this.inFlight;
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
