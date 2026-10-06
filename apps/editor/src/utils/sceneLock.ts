/**
 * PURPOSE: Keeps this tab's editing lock on the open scene, or keeps trying to get it.
 *
 * INPUT: What opening the scene found (lock held or not), `takeOver()` from the read-only banner,
 *        `markLost()` when a save was refused because another session holds the lock.
 * OUTPUT: `onChange` with the lock's state after every claim, including the scene's current revision
 *         (so a read-only view can tell it's out of date). `releaseWhenSaved` / `cancelRelease` for
 *         giving the lock up when the editor closes the scene.
 *
 * Timing: while held, the lease (60 s on the server) is renewed every 20 s; while held elsewhere,
 * the claim is retried every 10 s. Both also run right away when the tab becomes visible again or
 * comes back from the back/forward cache, so returning to a tab that was taken over shows it at
 * once. A deleted scene or a lost session stops the lock for good. A failed request (offline, a
 * server error) changes nothing; the next tick tries again.
 *
 * When the page goes away (`pagehide`) a held lock is released with a keepalive request, unless
 * edits are still unsaved: a release then could overtake the last save, which needs the lock. The
 * lease lapsing is the safety net either way.
 */
import { ApiAuthError } from "./apiFetch";
import { SceneApiError, claimSceneLock, hasPendingSaves, releaseSceneLock, settlePendingSaves } from "./sceneLibrary";

export type SceneLockState =
  | { kind: "held"; revision: number }
  /** `heldByYou`: by this user's other tab or device (always, until scenes can be shared). */
  | { kind: "elsewhere"; revision: number; heldByYou: boolean }
  | { kind: "deleted" }
  | { kind: "signedOut" };

interface SceneLockOptions {
  sceneId: string;
  /** The claim made while opening the scene: `held` or `elsewhere`. */
  initial: SceneLockState;
  /** After every claim that got an answer (even an unchanged one), and on markLost. */
  onChange: (state: SceneLockState) => void;
  /** Whether this browser still has unsaved edits to the scene; the lock isn't released while so. */
  hasUnsavedEdits: () => boolean;
}

const RENEW_MS = 20_000;
const RETRY_MS = 10_000;

export class SceneLock {
  private readonly options: SceneLockOptions;
  private state: SceneLockState;
  private timer: ReturnType<typeof setTimeout> | null = null;
  private inFlight: Promise<void> | null = null;
  private isDisposed = false;

  constructor(options: SceneLockOptions) {
    this.options = options;
    this.state = options.initial;
    this.schedule();
    document.addEventListener("visibilitychange", this.handleVisibilityChange);
    window.addEventListener("pageshow", this.handlePageShow);
    window.addEventListener("pagehide", this.handlePageHide);
  }

  get current(): SceneLockState {
    return this.state;
  }

  /** Claims (or renews) now rather than at the next tick. Resolves when that claim is answered. */
  checkNow(): Promise<void> {
    return this.claim(false);
  }

  /** Moves the lock to this tab from wherever it is. Resolves when that's answered. */
  async takeOver(): Promise<void> {
    // Let a routine claim still out finish first, so its answer can't land after the take-over's.
    await this.inFlight;
    await this.claim(true);
  }

  /** A save was refused for want of the lock: treat it as gone, and check again right away. */
  markLost(): void {
    if (this.isDisposed || this.state.kind !== "held") {
      return;
    }

    this.update({ kind: "elsewhere", revision: this.state.revision, heldByYou: true });
    void this.checkNow();
  }

  /** Stops timers and listeners. Doesn't release the lock: see releaseWhenSaved. */
  dispose(): void {
    this.isDisposed = true;
    this.clearTimer();
    document.removeEventListener("visibilitychange", this.handleVisibilityChange);
    window.removeEventListener("pageshow", this.handlePageShow);
    window.removeEventListener("pagehide", this.handlePageHide);
  }

  private claim(takeOver: boolean): Promise<void> {
    if (this.isDisposed || this.isFinished()) {
      return Promise.resolve();
    }

    if (this.inFlight && !takeOver) {
      return this.inFlight;
    }

    this.clearTimer();

    const request = claimSceneLock(this.options.sceneId, { takeOver })
      .then(
        (claim) => {
          if (!this.isDisposed) {
            this.update(
              claim.held
                ? { kind: "held", revision: claim.revision }
                : { kind: "elsewhere", revision: claim.revision, heldByYou: claim.heldByYou },
            );
          }
        },
        (error: unknown) => {
          if (this.isDisposed) {
            return;
          }

          if (error instanceof SceneApiError && error.status === 404) {
            this.update({ kind: "deleted" });
          } else if (error instanceof ApiAuthError) {
            this.update({ kind: "signedOut" });
          } else {
            // Offline or a server hiccup: nothing is known to have changed. Try again next tick.
            console.warn("[Libre3D] Couldn't check the scene's editing lock.", error);
          }
        },
      )
      .finally(() => {
        if (this.inFlight === request) {
          this.inFlight = null;
        }

        this.schedule();
      });

    this.inFlight = request;
    return request;
  }

  private update(state: SceneLockState): void {
    this.state = state;
    this.options.onChange(state);
  }

  private isFinished(): boolean {
    return this.state.kind === "deleted" || this.state.kind === "signedOut";
  }

  private schedule(): void {
    this.clearTimer();

    if (this.isDisposed || this.isFinished() || this.inFlight) {
      return;
    }

    this.timer = setTimeout(() => void this.claim(false), this.state.kind === "held" ? RENEW_MS : RETRY_MS);
  }

  private clearTimer(): void {
    if (this.timer !== null) {
      clearTimeout(this.timer);
      this.timer = null;
    }
  }

  private readonly handleVisibilityChange = (): void => {
    if (document.visibilityState === "visible") {
      void this.checkNow();
    }
  };

  private readonly handlePageShow = (event: PageTransitionEvent): void => {
    // Back from the back/forward cache: the pagehide below may have released the lock, and timers
    // were frozen meanwhile.
    if (event.persisted) {
      void this.checkNow();
    }
  };

  private readonly handlePageHide = (): void => {
    if (this.state.kind === "held" && !this.options.hasUnsavedEdits()) {
      void releaseSceneLock(this.options.sceneId, { keepalive: true }).catch(() => undefined);
    }
  };
}

// ---- Releasing when the editor closes a scene ----------------------------------------------

// Scene ID → the release waiting to go out for it. Replaced or deleted to call that release off.
const pendingReleases = new Map<string, symbol>();

/**
 * Releases this tab's lock on a scene once the saves still going out have landed, so the release
 * can't overtake the final save (which needs the lock). Called off by `cancelRelease` (the editor
 * opening the scene again: StrictMode's remount, or coming straight back from the gallery), and
 * skipped if edits are left unsaved: the lock then lapses on its own, and this browser's copy of
 * the edits is saved when the scene is next opened here.
 */
export const releaseWhenSaved = (sceneId: string, hasUnsavedEdits: () => boolean): void => {
  const token = Symbol(sceneId);
  pendingReleases.set(sceneId, token);

  void (async () => {
    // A save queued behind the one in flight only joins the pending set once that one lands.
    do {
      await settlePendingSaves();
      await new Promise((resolve) => setTimeout(resolve, 0));
    } while (hasPendingSaves() && pendingReleases.get(sceneId) === token);

    if (pendingReleases.get(sceneId) !== token) {
      return;
    }

    pendingReleases.delete(sceneId);

    if (!hasUnsavedEdits()) {
      await releaseSceneLock(sceneId).catch(() => undefined);
    }
  })();
};

/** Calls off a release `releaseWhenSaved` scheduled for this scene, if it hasn't gone out yet. */
export const cancelRelease = (sceneId: string): void => {
  pendingReleases.delete(sceneId);
};
