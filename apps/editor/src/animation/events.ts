/**
 * PURPOSE: Events, the second part of state-based animation (notes/animation-plan.md, A3): on an
 * object, a trigger (Start, Mouse Down) and the actions it runs, which for now are transitions
 * (transitions.ts).
 *
 * Events live in the scene's `animation` section next to the states, keyed by ID, and point at
 * their object (the owner) by entity ID. Their actions are a small ordered list inside the event,
 * edited as a whole. Only Play runs them (sceneRuntime.ts); editing never does. Nothing here
 * depends on the store, React, or the DOM.
 */

import { createId } from "../utils/createId";
import { getObjectStates, type ObjectState } from "./objectStates";
import { normalizeTransition, type StateRef, type TransitionAction } from "./transitions";

export type EventTrigger = "start" | "mouseDown";

/** The triggers in the order the trigger dropdown lists them, with their names and icons there. */
export const EVENT_TRIGGERS: { value: EventTrigger; label: string; icon: string }[] = [
  { value: "start", label: "Start", icon: "flag" },
  { value: "mouseDown", label: "Mouse Down", icon: "pointer" },
];

export interface SceneEvent {
  id: string;
  ownerId: string; // entity ID; Mouse Down fires when it's clicked
  trigger: EventTrigger;
  order: number; // position in the owner's Events list
  actions: TransitionAction[];
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

/** An object's events, in the order its Events list shows them. */
export const getObjectEvents = (events: Record<string, SceneEvent>, ownerId: string): SceneEvent[] =>
  Object.values(events)
    .filter((event) => event.ownerId === ownerId)
    .sort((a, b) => a.order - b.order);

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

/** A new event on an object, last in its list, with one transition of the object itself. */
export const createEvent = (
  events: Record<string, SceneEvent>,
  states: Record<string, ObjectState>,
  ownerId: string,
  trigger: EventTrigger,
): SceneEvent => {
  const siblings = getObjectEvents(events, ownerId);

  return {
    id: createId("event"),
    ownerId,
    trigger,
    order: siblings.length > 0 ? siblings[siblings.length - 1].order + 1 : 0,
    actions: [createTransition(states, ownerId)],
  };
};

/**
 * Whether row `index` of a transition names something it can go to: Base, a state of its target,
 * or (row 1 only) wherever the target is.
 */
export const isRowValid = (
  ref: StateRef | "current",
  index: number,
  targetId: string,
  states: Record<string, ObjectState>,
): boolean => ref === "base" || (index === 0 && ref === "current") || states[ref]?.targetId === targetId;

/** A row's state by name, as the inspector shows it ("Pick a state" when it names none of the target's). */
export const stateRefLabel = (
  ref: StateRef | "current",
  targetId: string,
  states: Record<string, ObjectState>,
): string =>
  ref === "base"
    ? "Base State"
    : ref === "current"
      ? "Current"
      : states[ref]?.targetId === targetId
        ? states[ref].name
        : "Pick a state";

/**
 * What keeps a transition from running in Play (the runtime skips it): its target is gone, or a
 * row names no state of it (a deleted state, another object's, or none picked yet). Null if none.
 */
export const transitionProblem = (
  action: TransitionAction,
  entityExists: (id: string) => boolean,
  states: Record<string, ObjectState>,
): "target" | "state" | null => {
  if (!entityExists(action.targetId)) return "target";
  const rows = [action.from, ...action.steps.map((step) => step.to)];
  return action.steps.length > 0 && rows.every((ref, index) => isRowValid(ref, index, action.targetId, states))
    ? null
    : "state";
};

/** A copy of a transition that shares nothing with it. */
export const cloneTransition = (action: TransitionAction): TransitionAction => ({
  ...action,
  steps: action.steps.map((step) => ({ ...step })),
});

/**
 * Drops the events of removed objects, and the actions (on any object's events) that move a
 * removed object; an event left with no actions stays. Returns `events` itself when nothing changed.
 */
export const removeEventsOf = (
  events: Record<string, SceneEvent>,
  removedIds: Set<string>,
): Record<string, SceneEvent> => {
  let next: Record<string, SceneEvent> | null = null;

  for (const event of Object.values(events)) {
    if (removedIds.has(event.ownerId)) {
      next ??= { ...events };
      delete next[event.id];
      continue;
    }
    const actions = event.actions.filter((action) => !removedIds.has(action.targetId));
    if (actions.length !== event.actions.length) {
      next ??= { ...events };
      next[event.id] = { ...event, actions };
    }
  }

  return next ?? events;
};

/**
 * Gives duplicated objects copies of their originals' events, with new IDs. `idMap` maps each
 * original's ID to its copy's and `stateIdMap` each copied state's ID to its copy's
 * (duplicateStates). An action moving an object that was duplicated too moves the copy, through
 * the copy's states; one moving anything else is copied as it is. Returns `events` itself when
 * none of the originals had any.
 */
export const duplicateEvents = (
  events: Record<string, SceneEvent>,
  idMap: Map<string, string>,
  stateIdMap: Map<string, string>,
): Record<string, SceneEvent> => {
  const copies = Object.values(events)
    .filter((event) => idMap.has(event.ownerId))
    .map((event): SceneEvent => ({
      ...event,
      id: createId("event"),
      ownerId: idMap.get(event.ownerId)!,
      actions: event.actions.map((action) => {
        const copy = { ...cloneTransition(action), id: createId("action") };
        const targetCopy = idMap.get(action.targetId);
        if (!targetCopy) return copy;

        const mapRef = <T extends StateRef>(ref: T): T => (stateIdMap.get(ref) as T | undefined) ?? ref;
        return {
          ...copy,
          targetId: targetCopy,
          from: mapRef(copy.from),
          steps: copy.steps.map((step) => ({ ...step, to: mapRef(step.to) })),
        };
      }),
    }));

  return copies.length === 0 ? events : { ...events, ...Object.fromEntries(copies.map((event) => [event.id, event])) };
};

/**
 * Events read from a document, in the shape everything else expects. Anything that isn't an event
 * is dropped, and so is any action that isn't a transition (see normalizeTransition). Keyed by
 * their own IDs.
 */
export const normalizeEvents = (raw: unknown): Record<string, SceneEvent> => {
  if (!isRecord(raw)) return {};

  const events: Record<string, SceneEvent> = {};
  for (const value of Object.values(raw)) {
    if (!isRecord(value) || typeof value.id !== "string" || typeof value.ownerId !== "string") continue;
    if (!EVENT_TRIGGERS.some((trigger) => trigger.value === value.trigger)) continue;

    events[value.id] = {
      id: value.id,
      ownerId: value.ownerId,
      trigger: value.trigger as EventTrigger,
      order: typeof value.order === "number" && Number.isFinite(value.order) ? value.order : 0,
      actions: (Array.isArray(value.actions) ? value.actions : [])
        .map(normalizeTransition)
        .filter((action): action is TransitionAction => action !== null),
    };
  }
  return events;
};
