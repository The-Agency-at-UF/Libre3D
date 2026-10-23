/**
 * PURPOSE: Object states, the first part of state-based animation (notes/animation-plan.md, A1):
 * named looks of one object, and the logic that reads and edits them.
 *
 * Every object has a Base State: its own values on the entity. A state ("State", "State 2", …)
 * holds only the values it changes, and everything else follows Base, so moving an object in Base
 * still moves it in every state that doesn't set a position. Values are absolute, not offsets: a
 * state's position is a position, in the same parent space as the entity's own.
 *
 * States live in the scene's `animation` section, keyed by ID, and point at their object by entity
 * ID. Nothing here depends on the store, React, or the DOM, so the events runtime (A3) and the
 * share-link viewer can use it as is. Nor on Three.js: the scene document reads states through
 * here, so every page loads this file, and only the editor may download Three (App.tsx). The
 * matrix math for states whose object changes parent is in reparentStates.ts.
 */

import { createId } from "../utils/createId";
import type { EntityTRS } from "../utils/entityTransforms";
import type { SceneEvent } from "./events";

/** What a state can set: transform, and a path's trim (0–1, see paths/). Colour and opacity may follow. */
export interface StateValues {
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: [number, number, number];
  trimStart?: number;
  trimEnd?: number;
}

export type StateValueKey = keyof StateValues;

/** One named look of one object. */
export interface ObjectState {
  id: string;
  targetId: string; // entity ID
  name: string;
  order: number; // position in the States list
  values: StateValues;
}

/** The scene document's `animation` section. */
export interface SceneAnimation {
  states: Record<string, ObjectState>;
  events: Record<string, SceneEvent>; // see events.ts
}

/** A path's trim: how much of it shows, from `trimStart` to `trimEnd` (0–1 of its length). */
export type Trim = Pick<StateValues, "trimStart" | "trimEnd">;

/**
 * Where an object is and how it looks: its Base values with a state's on top. Its transform always;
 * a trim only when the object or the state has one (paths).
 */
export type Pose = EntityTRS & Trim;

const FULL_TURN = Math.PI * 2;

const cloneVector = (vector: [number, number, number]): [number, number, number] => [vector[0], vector[1], vector[2]];

export const createEmptyAnimation = (): SceneAnimation => ({ states: {}, events: {} });

// Only the values this build knows. A document with a value added later is refused as newer
// (sceneDocument.ts), so leaving one out can't lose it.
export const cloneStateValues = (values: StateValues): StateValues => ({
  ...(values.position ? { position: cloneVector(values.position) } : null),
  ...(values.rotation ? { rotation: cloneVector(values.rotation) } : null),
  ...(values.scale ? { scale: cloneVector(values.scale) } : null),
  ...(typeof values.trimStart === "number" ? { trimStart: values.trimStart } : null),
  ...(typeof values.trimEnd === "number" ? { trimEnd: values.trimEnd } : null),
});

const cloneObjectState = (state: ObjectState): ObjectState => ({
  ...state,
  values: cloneStateValues(state.values ?? {}),
});

/** A copy of an animation section (saved or live) that shares nothing with it. */
export const cloneAnimation = (animation: Partial<SceneAnimation> | undefined): SceneAnimation => ({
  states: Object.fromEntries(
    Object.values(animation?.states ?? {}).map((state) => [state.id, cloneObjectState(state)]),
  ),
  events: structuredClone(animation?.events ?? {}),
});

/** Where an object is in a state: the state's values over the object's own. No state = Base. */
export const resolveState = (entity: EntityTRS & Trim, state?: ObjectState | null): Pose => {
  const pose: Pose = {
    position: cloneVector(state?.values.position ?? entity.position),
    rotation: cloneVector(state?.values.rotation ?? entity.rotation),
    scale: cloneVector(state?.values.scale ?? entity.scale),
  };
  const trimStart = state?.values.trimStart ?? entity.trimStart;
  const trimEnd = state?.values.trimEnd ?? entity.trimEnd;
  if (trimStart !== undefined || trimEnd !== undefined) {
    pose.trimStart = trimStart ?? 0;
    pose.trimEnd = trimEnd ?? 1;
  }
  return pose;
};

/**
 * The state an object is shown in while editing (`viewedStates` maps entity IDs to state IDs), or
 * null for Base. An entry whose state is gone, or isn't that object's, means Base: it can outlive
 * its state through a deletion and come back to life with an undo.
 */
export const getViewedState = (
  viewedStates: Record<string, string>,
  states: Record<string, ObjectState>,
  entityId: string,
): ObjectState | null => {
  const state = entityId in viewedStates ? states[viewedStates[entityId]] : undefined;
  return state && state.targetId === entityId ? state : null;
};

/** `viewedStates` without the entries that mean Base anyway (see getViewedState). */
export const pruneViewedStates = (
  viewedStates: Record<string, string>,
  states: Record<string, ObjectState>,
): Record<string, string> =>
  Object.fromEntries(
    Object.entries(viewedStates).filter(([entityId]) => getViewedState(viewedStates, states, entityId)),
  );

/** An object's states, in the order the States list shows them. */
export const getObjectStates = (states: Record<string, ObjectState>, entityId: string): ObjectState[] =>
  Object.values(states)
    .filter((state) => state.targetId === entityId)
    .sort((a, b) => a.order - b.order);

/** "State", then "State 2", "State 3", …: the first of those the object's states don't use. */
export const nextStateName = (siblings: ObjectState[]): string => {
  const names = new Set(siblings.map((state) => state.name));
  if (!names.has("State")) return "State";

  let number = 2;
  while (names.has(`State ${number}`)) number += 1;
  return `State ${number}`;
};

/** A new state for an object, last in its list. It sets nothing yet, so it looks like Base. */
export const createObjectState = (states: Record<string, ObjectState>, entityId: string): ObjectState => {
  const siblings = getObjectStates(states, entityId);

  return {
    id: createId("state"),
    targetId: entityId,
    name: nextStateName(siblings),
    order: siblings.length > 0 ? siblings[siblings.length - 1].order + 1 : 0,
    values: {},
  };
};

/** The angle equal to `angle` (in radians, give or take whole turns) nearest `reference`. */
export const unwrapAngle = (angle: number, reference: number): number =>
  angle + FULL_TURN * Math.round((reference - angle) / FULL_TURN);

/**
 * The Euler rotation equal to `rotation` nearest `reference`. The gizmo and reparenting go through
 * a quaternion, which wraps every angle to ±180°; unwrapping against the value from before the
 * change keeps a turn past 180° a turn past 180°, so a transition to it doesn't go the long way
 * round. XYZ angles also name every orientation twice, (x, y, z) and (x + 180°, 180° − y,
 * z + 180°), and the conversion always picks the one with y within ±90°: turning about Y past 90°
 * would otherwise flip X and Z by 180°.
 */
export const unwrapRotation = (
  rotation: [number, number, number],
  reference: [number, number, number],
): [number, number, number] => {
  const [x, y, z] = rotation;
  const candidates = [
    [x, y, z],
    [x + Math.PI, Math.PI - y, z + Math.PI],
  ].map((angles) => angles.map((angle, axis) => unwrapAngle(angle, reference[axis])) as [number, number, number]);
  const distance = (angles: [number, number, number]) =>
    angles.reduce((sum, angle, axis) => sum + Math.abs(angle - reference[axis]), 0);

  return distance(candidates[1]) < distance(candidates[0]) ? candidates[1] : candidates[0];
};

/** Drops the states of removed objects. Returns `states` itself when none of them had any. */
export const removeStatesOf = (
  states: Record<string, ObjectState>,
  removedIds: Set<string>,
): Record<string, ObjectState> => {
  const kept = Object.values(states).filter((state) => !removedIds.has(state.targetId));
  return kept.length === Object.keys(states).length ? states : Object.fromEntries(kept.map((state) => [state.id, state]));
};

/**
 * Gives duplicated objects copies of their originals' states, with new IDs. `idMap` maps each
 * original's ID to its copy's. A copy placed apart from its original (`offsets`, by original ID)
 * has its states' positions moved the same way, so it doesn't fly back to the original's spot.
 * Returns the states with the copies added (`states` itself when there were none) and each copied
 * state's new ID by its original's.
 */
export const duplicateStates = (
  states: Record<string, ObjectState>,
  idMap: Map<string, string>,
  offsets: Map<string, [number, number, number]>,
): { states: Record<string, ObjectState>; stateIdMap: Map<string, string> } => {
  const stateIdMap = new Map<string, string>();
  const copies = Object.values(states)
    .filter((state) => idMap.has(state.targetId))
    .map((state): ObjectState => {
      const values = cloneStateValues(state.values);
      const offset = offsets.get(state.targetId);
      if (values.position && offset) {
        values.position = [values.position[0] + offset[0], values.position[1] + offset[1], values.position[2] + offset[2]];
      }
      const copy = { ...state, id: createId("state"), targetId: idMap.get(state.targetId)!, values };
      stateIdMap.set(state.id, copy.id);
      return copy;
    });

  return {
    states: copies.length === 0 ? states : { ...states, ...Object.fromEntries(copies.map((state) => [state.id, state])) },
    stateIdMap,
  };
};
