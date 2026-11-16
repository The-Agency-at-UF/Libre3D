/**
 * PURPOSE: Carries out the effects a playing scene's actions ask for (animation/actions.ts,
 * `SceneEffect`): one home for every effect handler, shared by the editor's Play
 * (hooks/useViewportPlay.ts) and the share-link viewer (SceneViewer.ts), so each new action type
 * adds one handler here instead of one in each host.
 *
 * INPUT: What a host lets its effects do (`PlayEffectsOptions`).
 * OUTPUT: `onEffect`, to give `SceneRuntime`, and `dispose()`, which releases whatever the handlers
 *         made (the scene's audio), called on Stop and on the viewer's dispose.
 *
 * A handler runs synchronously inside the trigger that fired it: a link opened from a click must
 * be, or the browser blocks it as a popup. A link opened by a Start, Scroll or key event has no click
 * behind it and may be blocked all the same; that's the browser's call, not worked around here. Links
 * arrive already checked (only http, https, mailto: animation/links.ts). Nothing here loads the
 * store, React, or the editor's UI (runtimeBoundary.test.ts checks).
 */

import type { SceneEffect } from "../animation/actions";
import type { SceneAudio } from "./sceneAudio";

type EffectHandler<T extends SceneEffect["type"]> = (effect: Extract<SceneEffect, { type: T }>) => void;

/** `window.open`'s shape, so tests can pass their own. */
export type OpenWindow = (url: string, target: string, features: string) => unknown;

export interface PlayEffectsOptions {
  /** Editor Play: every link opens in a new tab, since the same tab would leave the editor mid-Play. */
  alwaysNewTab?: boolean;
  /** Given, links go here instead of opening (an embed hands them to its page). */
  onOpenLink?: (url: string, newTab: boolean) => void;
  /** How a link opens; `window.open` unless given. */
  open?: OpenWindow;
  /** Plays the scene's sounds; none for a scene without (its Sound effects are then dropped). Disposed with these effects. */
  audio?: SceneAudio | null;
}

export interface PlayEffects {
  onEffect: (effect: SceneEffect) => void;
  dispose: () => void;
}

const windowOpen: OpenWindow = (url, target, features) => window.open(url, target, features);

export const createPlayEffects = ({ alwaysNewTab = false, onOpenLink, open = windowOpen, audio = null }: PlayEffectsOptions = {}): PlayEffects => {
  // One entry per effect type, so a new action type without a handler is a compile error.
  const handlers: { [T in SceneEffect["type"]]: EffectHandler<T> } = {
    openLink: ({ url, newTab }) => {
      const inNewTab = alwaysNewTab || newTab;
      if (onOpenLink) onOpenLink(url, inNewTab);
      // The opened page gets no handle on this one (noopener) and isn't told where it came from (noreferrer).
      else open(url, inNewTab ? "_blank" : "_self", "noopener,noreferrer");
    },
    sound: ({ assetId, volume, loop, mode }) => {
      if (!audio) return;
      if (mode === "stop") audio.stop(assetId);
      else void audio.play(assetId, { volume, loop });
    },
  };

  return {
    onEffect: (effect) => (handlers[effect.type] as (effect: SceneEffect) => void)(effect),
    dispose: () => audio?.dispose(),
  };
};
