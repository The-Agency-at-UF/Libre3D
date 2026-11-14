/**
 * PURPOSE: Object states, the first part of state-based animation (notes/animation-plan.md, A1):
 * named looks of one object, and the logic that reads and edits them.
 *
 * Every object has a Base State: its own values on the entity. A state ("State", "State 2", …)
 * holds the values it sets, and a value it doesn't set follows Base. A new state starts as a
 * snapshot of the pose on screen (it sets all of them), so later changes to Base reach it only in a
 * value set back to Base. Values are absolute, not offsets: a state's position is a position, in the
 * same parent space as the entity's own.
 *
 * States live in the scene's `animation` section, keyed by ID, and point at their object by entity
 * ID. Nothing here depends on the store, React, or the DOM, so the events runtime (A3) and the
 * share-link viewer can use it as is. Nor on Three.js: the scene document reads states through
 * here, so every page loads this file, and only the editor may download Three (App.tsx). The
 * matrix math for states whose object changes parent is in reparentStates.ts.
 *
 * Colour and opacity: a state's `opacity` is the object's opacity, and its `color` is the colour of
 * the object's top Color layer (scene/layers.ts, `colorLayerOf`). An object with no Color layer has
 * no colour to set. Nor has an object that uses a material asset: an asset is one look, the same in
 * every state (so its shaderball is always what its objects look like), and such an object is its
 * asset's colour whatever a state says. To animate its colour, detach it from the asset; applying
 * an asset drops the colours its states set (`withoutStateColors`). A new state doesn't snapshot
 * colour or opacity: it sets one only once it's edited while the state is shown, so recolouring
 * Base still reaches every state.
 */

import { colorLayerOf } from "../scene/layers";
import type { MaterialLayer } from "../scene/types";
import { cloneVector } from "../scene/vec3";
import { createId } from "../utils/createId";
import type { EntityTRS } from "../utils/entityTransforms";
import type { SceneEvent } from "./events";

/**
 * What a state can set: transform, a path's trim (0–1, see paths/), and the object's colour ("#rrggbb")
 * and opacity (0–1; the file header says what they mean on a layer stack).
 */
export interface StateValues {
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: [number, number, number];
  trimStart?: number;
  trimEnd?: number;
  color?: string;
  opacity?: number;
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

/** An object's colour (its top Color layer's, "#rrggbb") and opacity (0–1). */
export type Look = Pick<StateValues, "color" | "opacity">;

/**
 * Where an object is and how it looks: its Base values with a state's on top. Its transform always;
 * a trim only when the object or the state has one (paths); an opacity only for an object with a
 * material, and a colour only when that material has a Color layer (the state's only for an object
 * with layers of its own, not a material asset's).
 */
export type Pose = EntityTRS & Trim & Look;

/**
 * What a pose is worked out from: an object's own transform and trim, and for its look the layers
 * it is drawn with (its material asset's when it uses one: scene/materialAssets.ts,
 * `resolveEntities`) and its own opacity. An entity is one.
 */
export type PoseSource = EntityTRS & Trim & { materialLayers?: MaterialLayer[]; materialAssetId?: string; opacity?: number };

const FULL_TURN = Math.PI * 2;

export const createEmptyAnimation = (): SceneAnimation => ({ states: {}, events: {} });

// Only the values this build knows. A document with a value added later is refused as newer
// (sceneDocument.ts), so leaving one out can't lose it.
export const cloneStateValues = (values: StateValues): StateValues => ({
  ...(values.position ? { position: cloneVector(values.position) } : null),
  ...(values.rotation ? { rotation: cloneVector(values.rotation) } : null),
  ...(values.scale ? { scale: cloneVector(values.scale) } : null),
  ...(typeof values.trimStart === "number" ? { trimStart: values.trimStart } : null),
  ...(typeof values.trimEnd === "number" ? { trimEnd: values.trimEnd } : null),
  ...(typeof values.color === "string" ? { color: values.color } : null),
  ...(typeof values.opacity === "number" ? { opacity: values.opacity } : null),
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
export const resolveState = (entity: PoseSource, state?: ObjectState | null): Pose => {
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
  if (entity.materialLayers) {
    pose.opacity = clampOpacity(state?.values.opacity ?? entity.opacity ?? 1);
    const baseColor = colorLayerOf(entity.materialLayers)?.color;
    // An object on a material asset is the asset's colour in every state.
    if (baseColor !== undefined) pose.color = (!entity.materialAssetId && state?.values.color) || baseColor;
  }
  return pose;
};

const clampOpacity = (opacity: number): number => Math.min(1, Math.max(0, opacity));

/** A pose's transform and trim without its look: what a new state snapshots (see the file header). */
export const withoutLook = (pose: Pose): Pose => {
  const { color: _color, opacity: _opacity, ...rest } = pose;
  return rest;
};

/**
 * The states without the colours those of `entityIds` set: for objects that start using a material
 * asset, which is one colour in every state. The same states when none of them set one.
 */
export const withoutStateColors = (states: Record<string, ObjectState>, entityIds: ReadonlySet<string>): Record<string, ObjectState> => {
  const colored = Object.values(states).filter((state) => entityIds.has(state.targetId) && state.values.color !== undefined);
  if (colored.length === 0) return states;
  const next = { ...states };
  for (const state of colored) {
    const { color: _color, ...values } = state.values;
    next[state.id] = { ...state, values };
  }
  return next;
};

// The objects with a state that sets an opacity, by the states they were worked out from.
const fadingByStates = new WeakMap<Record<string, ObjectState>, ReadonlySet<string>>();
const NO_OBJECTS: ReadonlySet<string> = new Set();

/**
 * The IDs of the objects some state gives an opacity: the ones a transition can fade. The viewport
 * draws those as see-through objects for good (viewport/entityMaterials.ts), because switching an
 * object between solid and see-through mid-fade rebuilds its shader. The same set for the same states.
 */
export const fadingObjects = (states: Record<string, ObjectState> | undefined): ReadonlySet<string> => {
  if (!states) return NO_OBJECTS;
  let fading = fadingByStates.get(states);
  if (!fading) {
    fading = new Set(
      Object.values(states)
        .filter((state) => typeof state.values?.opacity === "number")
        .map((state) => state.targetId),
    );
    fadingByStates.set(states, fading);
  }
  return fading;
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
const unwrapAngle = (angle: number, reference: number): number =>
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
