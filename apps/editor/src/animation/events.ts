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

import { normalizeTransition, type TransitionAction } from "./transitions";

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
