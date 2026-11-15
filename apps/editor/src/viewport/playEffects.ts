/**
 * PURPOSE: Carries out the effects a playing scene's actions ask for (animation/actions.ts,
 * `SceneEffect`): one home for every effect handler, shared by the editor's Play
 * (hooks/useViewportPlay.ts) and the share-link viewer (SceneViewer.ts), so each new action type
 * adds one handler here instead of one in each host.
 *
 * INPUT: What a host lets its effects reach (nothing yet: C2 adds `onOpenLink`, C4 the audio).
 * OUTPUT: `onEffect`, to give `SceneRuntime`, and `dispose()`, which releases whatever the handlers
 *         made (audio nodes, from C4), called on Stop and on the viewer's dispose.
 *
 * A handler runs synchronously inside the trigger that fired it (a link opened from a click must
 * be, or browsers block it). Nothing here loads the store, React, or the editor's UI
 * (runtimeBoundary.test.ts checks).
 */

import type { SceneEffect } from "../animation/actions";

type EffectHandler<T extends SceneEffect["type"]> = (effect: Extract<SceneEffect, { type: T }>) => void;

export interface PlayEffects {
  onEffect: (effect: SceneEffect) => void;
  dispose: () => void;
}

export const createPlayEffects = (): PlayEffects => {
  // One entry per effect type, so a new action type without a handler is a compile error.
  const handlers: { [T in SceneEffect["type"]]: EffectHandler<T> } = {
    openLink: () => {}, // C2
    sound: () => {}, // C4
  };

  return {
    onEffect: (effect) => (handlers[effect.type] as (effect: SceneEffect) => void)(effect),
    dispose: () => {},
  };
};
