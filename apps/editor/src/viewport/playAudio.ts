/**
 * PURPOSE: Editor-only handle from the Play bar's mute button (PreviewControls.tsx) to the running Play
 * session's audio (sceneAudio.ts), as playScroll.ts is for the scrubber: `useViewportPlay` registers
 * a setter and the button calls `setPlayMuted`, so muting never writes the store.
 */

type MutedSetter = (muted: boolean) => void;

let setter: MutedSetter | null = null;

/** Mutes or unmutes Play's sound. Does nothing while no Play session has any. */
export const setPlayMuted = (muted: boolean): void => setter?.(muted);

/** Makes `next` the setter. Returns a function that clears it, if it's still this one. */
export const registerPlayAudio = (next: MutedSetter): (() => void) => {
  setter = next;
  return () => {
    if (setter === next) setter = null;
  };
};
