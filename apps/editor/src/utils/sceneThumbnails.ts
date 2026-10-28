/**
 * PURPOSE: When the open scene's gallery picture is retaken: after saves, at most once a minute.
 *
 * `ThumbnailScheduler` is told about every save that lands. The first one takes a picture right
 * away; saves within the next minute are folded into one more picture when the minute is up, so the
 * gallery shows the scene as last edited (give or take the final minute before leaving the editor,
 * when the viewport is already gone). Taking and uploading the picture are passed in, so this has
 * no DOM and runs under the unit tests.
 *
 * One scheduler per edit session (useSceneAutosave): a tab without the lock never saves, so it never
 * uploads a picture either. A refused upload (lock lost, scene deleted) stops it.
 */

import { SceneApiError } from "./sceneLibrary";

/** At most one picture per this long. */
export const THUMBNAIL_INTERVAL_MS = 60_000;

interface ThumbnailSchedulerOptions {
  /** The picture to upload, or null when there's none to take right now (e.g. during preview). */
  capture: () => Promise<Blob | null>;
  upload: (image: Blob) => Promise<void>;
}

export class ThumbnailScheduler {
  private readonly options: ThumbnailSchedulerOptions;
  private lastTakenAt = -Infinity;
  private timer: ReturnType<typeof setTimeout> | null = null;
  private isTaking = false;
  /** A save landed while a picture was being taken: take another one after it. */
  private isOutdated = false;
  private isDisposed = false;

  constructor(options: ThumbnailSchedulerOptions) {
    this.options = options;
  }

  /** A save landed: retake the picture now, or once a minute has passed since the last one. */
  noteSaved(): void {
    if (this.isDisposed || this.timer !== null) {
      return;
    }

    if (this.isTaking) {
      this.isOutdated = true;
      return;
    }

    const wait = this.lastTakenAt + THUMBNAIL_INTERVAL_MS - Date.now();

    if (wait <= 0) {
      void this.take();
      return;
    }

    this.timer = setTimeout(() => {
      this.timer = null;
      void this.take();
    }, wait);
  }

  dispose(): void {
    this.isDisposed = true;

    if (this.timer !== null) {
      clearTimeout(this.timer);
      this.timer = null;
    }
  }

  private async take(): Promise<void> {
    this.isTaking = true;
    this.lastTakenAt = Date.now();

    try {
      const image = await this.options.capture();

      if (image && !this.isDisposed) {
        await this.options.upload(image);
      }
    } catch (error) {
      if (error instanceof SceneApiError && (error.status === 423 || error.status === 404)) {
        // The lock moved or the scene is gone; the autosaver finds out on its own.
        this.dispose();
      } else {
        // Only the gallery picture: the next save tries again.
        console.warn("Could not update the scene's thumbnail.", error);
      }
    } finally {
      this.isTaking = false;
    }

    if (this.isOutdated) {
      this.isOutdated = false;
      this.noteSaved();
    }
  }
}
