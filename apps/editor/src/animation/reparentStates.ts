/**
 * PURPOSE: Keeps object states (objectStates.ts) in place in the world when their object moves to
 * another parent: reparenting, grouping, ungrouping. Only the editor store uses it.
 *
 * Kept out of objectStates.ts because it needs Three.js's matrix math (entityTransforms.ts), and
 * every page loads objectStates.ts through the scene document, while only the editor may download
 * Three (App.tsx).
 */

import type * as THREE from "three";
import type { Entity } from "../store/useEditorStore";
import { composeLocalMatrix, solveLocalFromWorld } from "../utils/entityTransforms";
import { resolveState, unwrapRotation, type ObjectState } from "./objectStates";

/** An object that moves to another parent, with its own values from before the move. */
export interface ParentChange {
  entity: Pick<Entity, "id" | "position" | "rotation" | "scale">;
  from: THREE.Matrix4 | null; // the old parent's world matrix (null = the scene)
  to: THREE.Matrix4 | null; // the new parent's
}

/**
 * Keeps states in place in the world when their object moves to another parent. The store
 * re-solves the object's own values that way (reparenting, grouping, ungrouping); a state's values
 * are relative to the parent too, so without this they'd shift by the difference between the
 * parents. A state keeps setting only what it set, and keeps its other values (a trim) as they
 * were. Returns `states` itself when nothing changed.
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
        ...state.values,
        ...(position ? { position: solved.position } : null),
        ...(rotation ? { rotation: unwrapRotation(solved.rotation, rotation) } : null),
        ...(scale ? { scale: solved.scale } : null),
      },
    };
  }

  return next ?? states;
};
