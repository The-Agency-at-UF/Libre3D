/**
 * PURPOSE: Hands the Play bar's scroll scrubber (PreviewControls) a way to the running Play
 * session's scroll progress (`SceneRuntime.setScrollProgress`) without going through the store.
 *
 * INPUT: useViewportPlay registers a setter while its viewport is mounted; the scrubber calls
 *        `setPlayScrollProgress(p)` on every input.
 * OUTPUT: Nothing of its own: the setter puts the progress on Play's runtime, whose poses go on in
 *         the next frame.
 *
 * Why not the store: a store write costs a render of the whole editor (about 6 ms measured) and a
 * scrub writes on every pointer move, and Play must never write the store per frame. There is one
 * editor viewport at a time (as in liveViewport.ts), so one module-level setter is enough.
 * Editor-only: the share-link viewer is handed its progress directly (SceneViewer) and never loads
 * this file.
 */

type ProgressSetter = (progress: number) => void;

let setter: ProgressSetter | null = null;

/** Puts Play's Scroll events at `progress` (0 to 1). Does nothing while no Play session can take it. */
export const setPlayScrollProgress = (progress: number): void => setter?.(progress);

/** Makes `next` the setter. Returns a function that clears it, if it's still this one. */
export const registerPlayScroll = (next: ProgressSetter): (() => void) => {
  setter = next;
  return () => {
    if (setter === next) setter = null;
  };
};
