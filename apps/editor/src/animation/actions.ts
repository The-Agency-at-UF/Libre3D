/**
 * PURPOSE: What an event can do (decision tree C1): the action union, and the effects the runtime
 * asks its host to carry out for actions it can't do itself.
 *
 * INPUT: Actions as the store and documents hold them (a damaged one included, through
 *        `normalizeAction`).
 * OUTPUT: The action types (`SceneAction`), the helpers that copy, check, and read them, and the
 *         effect (`SceneEffect`) a non-transition action asks for when its event fires.
 *
 * A Transition moves an object and is run by the runtime itself (sceneRuntime.ts, with its timing in
 * transitions.ts). Open Link and Sound reach outside the scene (a window, the speakers), which the
 * runtime must not touch: it hands their effects to its host (viewport/playEffects.ts). Each concern
 * is a `Record` keyed by action type, so a new type that misses one is a compile error, not a
 * forgotten `if`. Nothing here depends on the store, React, or the DOM.
 */

import { createId } from "../utils/createId";
import { safeLinkUrl } from "./links";
import { getObjectStates, type ObjectState } from "./objectStates";
import { normalizeTransition, type TransitionAction } from "./transitions";

/** Opens a web page or an email (C2). */
export interface OpenLinkAction {
  id: string;
  type: "openLink";
  url: string;
  newTab: boolean;
}

/** Plays or stops an uploaded sound (C3, C4). */
export interface SoundAction {
  id: string;
  type: "sound";
  assetId: string; // the audio asset's content hash
  volume: number; // 0 to 1
  loop: boolean;
  mode: "play" | "stop";
}

export type SceneAction = TransitionAction | OpenLinkAction | SoundAction;
export type ActionType = SceneAction["type"];

/** What the runtime asks its host to do when an event with a non-transition action fires. */
export type SceneEffect =
  | { type: "openLink"; url: string; newTab: boolean }
  | { type: "sound"; assetId: string; volume: number; loop: boolean; mode: "play" | "stop" };

/** Every action type with its name and icon in the Edit Event panel. What `normalizeAction` keeps. */
export const ACTION_INFO: Record<ActionType, { label: string; icon: string }> = {
  transition: { label: "Transition", icon: "arrows-exchange" },
  openLink: { label: "Open Link", icon: "link" },
  sound: { label: "Sound", icon: "volume" },
};

/** The types the "Add action" menu offers: only those that work. Sound joins when it is built. */
export const OFFERED_ACTIONS: readonly ActionType[] = ["transition", "openLink"];

export const isTransition = (action: SceneAction): action is TransitionAction => action.type === "transition";

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const clamp01 = (value: unknown, fallback: number) =>
  typeof value === "number" && Number.isFinite(value) ? Math.min(1, Math.max(0, value)) : fallback;

/** What a new action of each type starts as, on an event of `ownerId`. */
interface NewActionContext {
  states: Record<string, ObjectState>;
  ownerId: string;
}

/**
 * A new transition on `targetId`: from Base to its first state (no state picked yet when it has
 * none), in 1 s with Ease In Out, played once.
 */
export const createTransition = (states: Record<string, ObjectState>, targetId: string): TransitionAction => ({
  id: createId("action"),
  type: "transition",
  targetId,
  from: "base",
  steps: [{ to: getObjectStates(states, targetId)[0]?.id ?? "", duration: 1, easing: "easeInOut" }],
  delay: 0,
  delayRepeat: "none",
  loop: 0,
  cycle: "restart",
});

const CREATE: { [T in ActionType]: (context: NewActionContext) => Extract<SceneAction, { type: T }> } = {
  // A transition of the event's own object.
  transition: ({ states, ownerId }) => createTransition(states, ownerId),
  openLink: () => ({ id: createId("action"), type: "openLink", url: "", newTab: true }),
  sound: () => ({ id: createId("action"), type: "sound", assetId: "", volume: 1, loop: false, mode: "play" }),
};

/** A new action of a type, as the "Add action" menu adds it. */
export const createAction = <T extends ActionType>(type: T, context: NewActionContext): Extract<SceneAction, { type: T }> =>
  CREATE[type](context);

const NORMALIZE: Record<ActionType, (raw: Record<string, unknown> & { id: string }) => SceneAction | null> = {
  transition: (raw) => normalizeTransition(raw),
  openLink: (raw) => ({
    id: raw.id,
    type: "openLink",
    url: typeof raw.url === "string" ? raw.url : "",
    newTab: raw.newTab !== false,
  }),
  sound: (raw) => ({
    id: raw.id,
    type: "sound",
    assetId: typeof raw.assetId === "string" ? raw.assetId : "",
    volume: clamp01(raw.volume, 1),
    loop: raw.loop === true,
    mode: raw.mode === "stop" ? "stop" : "play",
  }),
};

/**
 * An action read from a document, in the shape everything else expects, or null when it isn't one
 * this build knows (an unknown type is dropped, which is why new types need a schema bump). Each
 * type fills in and clamps its own fields.
 */
export const normalizeAction = (raw: unknown): SceneAction | null => {
  if (!isRecord(raw) || typeof raw.id !== "string" || typeof raw.type !== "string") return null;
  if (!Object.hasOwn(ACTION_INFO, raw.type)) return null;
  return NORMALIZE[raw.type as ActionType](raw as Record<string, unknown> & { id: string });
};

/** A copy of an action that shares nothing with it. */
export const cloneAction = <T extends SceneAction>(action: T): T =>
  isTransition(action) ? ({ ...action, steps: action.steps.map((step) => ({ ...step })) } as T) : { ...action };

/** The object an action moves (a transition's target), or null for an action that moves none. */
export const actionTargetId = (action: SceneAction): string | null => (isTransition(action) ? action.targetId : null);

const EFFECT: { [T in ActionType]: (action: Extract<SceneAction, { type: T }>) => SceneEffect | null } = {
  // The runtime runs transitions itself.
  transition: () => null,
  // Only a web or email link, normalized (links.ts): a hand-edited document can hold anything.
  openLink: ({ url, newTab }) => {
    const safe = safeLinkUrl(url);
    return safe ? { type: "openLink", url: safe, newTab } : null;
  },
  sound: ({ assetId, volume, loop, mode }) => (assetId ? { type: "sound", assetId, volume, loop, mode } : null),
};

/** The effect a non-transition action asks for, or null when it asks for none (a transition, or bad data: an unsafe link included). */
export const actionEffect = (action: SceneAction): SceneEffect | null =>
  (EFFECT[action.type] as (action: SceneAction) => SceneEffect | null)(action);
