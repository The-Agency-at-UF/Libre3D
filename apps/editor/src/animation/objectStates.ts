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
 * share-link viewer can use it as is.
 */

import type * as THREE from "three";
import type { Entity } from "../store/useEditorStore";
import { createId } from "../utils/createId";
import { composeLocalMatrix, solveLocalFromWorld, type EntityTRS } from "../utils/entityTransforms";

/** What a state can set. Paths add trim (B1); colour and opacity may follow. */
export interface StateValues {
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: [number, number, number];
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
  // Events arrive in A3. Until then they're carried whole, so a scene saved by a newer build loses
  // none of them here.
  events: Record<string, unknown>;
}

/** An object's whole transform: its Base values with a state's on top. */
export type Pose = EntityTRS;

/** An object that moves to another parent, with its own values from before the move. */
export interface ParentChange {
  entity: Pick<Entity, "id" | "position" | "rotation" | "scale">;
  from: THREE.Matrix4 | null; // the old parent's world matrix (null = the scene)
  to: THREE.Matrix4 | null; // the new parent's
}

const FULL_TURN = Math.PI * 2;

const cloneVector = (vector: [number, number, number]): [number, number, number] => [vector[0], vector[1], vector[2]];

export const createEmptyAnimation = (): SceneAnimation => ({ states: {}, events: {} });

export const cloneStateValues = (values: StateValues): StateValues => ({
  ...(values.position ? { position: cloneVector(values.position) } : null),
  ...(values.rotation ? { rotation: cloneVector(values.rotation) } : null),
  ...(values.scale ? { scale: cloneVector(values.scale) } : null),
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
export const resolveState = (entity: EntityTRS, state?: ObjectState | null): Pose => ({
  position: cloneVector(state?.values.position ?? entity.position),
  rotation: cloneVector(state?.values.rotation ?? entity.rotation),
  scale: cloneVector(state?.values.scale ?? entity.scale),
});

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
 */
export const duplicateStates = (
  states: Record<string, ObjectState>,
  idMap: Map<string, string>,
  offsets: Map<string, [number, number, number]>,
): Record<string, ObjectState> => {
  const copies = Object.values(states)
    .filter((state) => idMap.has(state.targetId))
    .map((state): ObjectState => {
      const values = cloneStateValues(state.values);
      const offset = offsets.get(state.targetId);
      if (values.position && offset) {
        values.position = [values.position[0] + offset[0], values.position[1] + offset[1], values.position[2] + offset[2]];
      }
      return { ...state, id: createId("state"), targetId: idMap.get(state.targetId)!, values };
    });

  return copies.length === 0 ? states : { ...states, ...Object.fromEntries(copies.map((state) => [state.id, state])) };
};

/**
 * Keeps states in place in the world when their object moves to another parent. The store
 * re-solves the object's own values that way (reparenting, grouping, ungrouping); a state's values
 * are relative to the parent too, so without this they'd shift by the difference between the
 * parents. A state keeps setting only what it set. Returns `states` itself when nothing changed.
 */
export const reparentStates = (
  states: Record<string, ObjectState>,
  changes: ParentChange[],
): Record<string, ObjectState> => {
  const changeByTarget = new Map(changes.map((change) => [change.entity.id, change]));
  let next: Record<string, ObjectState> | null = null;

  for (const state of Object.values(states)) {
    const change = changeByTarget.get(state.targetId);
    const { position, rotation, scale } = state.values;
    if (!change || (!position && !rotation && !scale)) continue;

    const world = composeLocalMatrix(resolveState(change.entity, state));
    if (change.from) world.premultiply(change.from);
    const solved = solveLocalFromWorld(world, change.to);

    next ??= { ...states };
    next[state.id] = {
      ...state,
      values: {
        ...(position ? { position: solved.position } : null),
        ...(rotation ? { rotation: unwrapRotation(solved.rotation, rotation) } : null),
        ...(scale ? { scale: solved.scale } : null),
      },
    };
  }

  return next ?? states;
};
