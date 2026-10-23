/**
 * PURPOSE: Runs a scene's events (notes/animation-plan.md, A3): what Play does, and later the
 * share-link viewer.
 *
 * INPUT: A snapshot of the scene (its objects' own transforms and parents, and its animation
 *        section), taken when Play starts; Start, clicks, and the passing of time.
 * OUTPUT: A pose for each object a transition has moved, to put on the Three objects each frame.
 *
 * The runtime never reads the store again and never writes it: Play moves Three objects, not
 * entities, so it costs no React renders and no undo steps. Nothing else moves objects while it
 * runs, so it keeps where each one is itself rather than reading the Three objects back. Nothing
 * here depends on the store, React, or the DOM.
 *
 * - A transition shows row 1 from the moment it starts, its Delay included, so a write-on starting
 *   from a hidden state never shows the finished word first.
 * - One transition per object: a new one replaces the one that's running. If that one hadn't
 *   finished, the new one starts from where the object is instead of its row 1, so interrupting
 *   never jumps (Spline does the same).
 * - Values change linearly after easing. Rotation changes per Euler component, so a state turned
 *   +360° about Y spins once, where the shortest way round (slerp) wouldn't move at all.
 * - A missing owner, target, or state (a deleted object or state, a damaged file) skips that action
 *   instead of throwing.
 */

import { normalizeEvents, type SceneEvent } from "./events";
import { resolveState, type ObjectState, type Pose, type SceneAnimation } from "./objectStates";
import { sampleTransition, type StateRef, type TransitionAction } from "./transitions";

/** What the runtime needs of an object: where it is in Base, and its parent (for clicks). */
export interface RuntimeEntity {
  id: string;
  parentId?: string | null;
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
}

export interface RuntimeScene {
  entities: RuntimeEntity[];
  animation: Partial<SceneAnimation>;
}

interface RunningTransition {
  action: TransitionAction;
  rows: Pose[]; // the pose at each row, worked out when it started
  elapsed: number; // seconds
}

const lerp = (from: number, to: number, progress: number) => from + (to - from) * progress;

const lerpVector = (
  from: [number, number, number],
  to: [number, number, number],
  progress: number,
): [number, number, number] => [lerp(from[0], to[0], progress), lerp(from[1], to[1], progress), lerp(from[2], to[2], progress)];

const lerpPose = (from: Pose, to: Pose, progress: number): Pose => ({
  position: lerpVector(from.position, to.position, progress),
  rotation: lerpVector(from.rotation, to.rotation, progress),
  scale: lerpVector(from.scale, to.scale, progress),
});

export class SceneRuntime {
  private readonly entities = new Map<string, RuntimeEntity>();
  private readonly states: Record<string, ObjectState>;
  private readonly eventsByOwner = new Map<string, SceneEvent[]>();
  private readonly running = new Map<string, RunningTransition>(); // by target ID
  private readonly current = new Map<string, Pose>(); // where each moved object is, by entity ID

  constructor(scene: RuntimeScene) {
    for (const entity of scene.entities) {
      this.entities.set(entity.id, {
        id: entity.id,
        parentId: entity.parentId ?? null,
        ...resolveState(entity), // copies of its vectors
      });
    }
    this.states = { ...scene.animation.states };

    // Each owner's events in Events-list order, owners in scene order, so when two Start events
    // move the same object, which one wins doesn't change from one Play to the next.
    const order = new Map(scene.entities.map((entity, index) => [entity.id, index]));
    const events = Object.values(normalizeEvents(scene.animation.events))
      .filter((event) => this.entities.has(event.ownerId))
      .sort((a, b) => order.get(a.ownerId)! - order.get(b.ownerId)! || a.order - b.order);
    for (const event of events) {
      const list = this.eventsByOwner.get(event.ownerId) ?? [];
      list.push(event);
      this.eventsByOwner.set(event.ownerId, list);
    }
  }

  /** Fires every Start event. */
  start(): void {
    for (const events of this.eventsByOwner.values()) {
      events.filter((event) => event.trigger === "start").forEach((event) => this.fire(event));
    }
  }

  /**
   * The object whose Mouse Down events a click on `entityId` fires: that object, or its nearest
   * ancestor that has any (so clicking part of an imported model fires the model's). Null if none.
   */
  clickOwnerOf(entityId: string): string | null {
    const visited = new Set<string>();
    let id: string | null | undefined = entityId;
    while (id && !visited.has(id)) {
      visited.add(id);
      if (this.eventsByOwner.get(id)?.some((event) => event.trigger === "mouseDown")) return id;
      id = this.entities.get(id)?.parentId;
    }
    return null;
  }

  /** Whether any object has a Mouse Down event (if not, clicks needn't be looked at). */
  get hasClickEvents(): boolean {
    return [...this.eventsByOwner.values()].some((events) => events.some((event) => event.trigger === "mouseDown"));
  }

  /** A click (mouse button down) on an object. Returns whether it fired anything. */
  click(entityId: string): boolean {
    const ownerId = this.clickOwnerOf(entityId);
    if (!ownerId) return false;

    this.eventsByOwner.get(ownerId)!.filter((event) => event.trigger === "mouseDown").forEach((event) => this.fire(event));
    return true;
  }

  /**
   * Starts one transition on its target, replacing any running there. Returns false, and changes
   * nothing, when it can't run: its target or one of its states is missing.
   */
  run(action: TransitionAction): boolean {
    const entity = this.entities.get(action.targetId);
    if (!entity || action.type !== "transition" || action.steps.length === 0) return false;

    const resolveRow = (ref: StateRef): Pose | null => {
      if (ref === "base") return resolveState(entity);
      const state = this.states[ref];
      return state && state.targetId === entity.id ? resolveState(entity, state) : null;
    };

    const rest = action.steps.map((step) => resolveRow(step.to));
    const isMoving = this.running.has(entity.id);
    const first = action.from === "current" || isMoving ? this.poseOf(entity) : resolveRow(action.from);
    if (!first || rest.some((pose) => !pose)) return false;

    const transition: RunningTransition = { action, rows: [first, ...(rest as Pose[])], elapsed: 0 };
    this.running.set(entity.id, transition);
    this.advance(entity.id, transition);
    return true;
  }

  /**
   * Puts an object somewhere without a transition, as if one had left it there: a transition from
   * Current then starts from it. The ▶ preview uses this to start from the state an object is shown
   * in while editing. Ignored for objects that aren't in the scene.
   */
  place(entityId: string, pose: Pose): void {
    if (this.entities.has(entityId)) this.current.set(entityId, lerpPose(pose, pose, 0));
  }

  /** Moves time on by `dt` seconds. */
  tick(dt: number): void {
    if (!(dt > 0)) return;
    for (const [targetId, transition] of this.running) {
      transition.elapsed += dt;
      this.advance(targetId, transition);
    }
  }

  /** Where each object a transition has moved is now, by entity ID. Objects not listed are in Base. */
  poses(): ReadonlyMap<string, Pose> {
    return this.current;
  }

  /** Whether nothing is moving (or waiting to move) any more. */
  get isIdle(): boolean {
    return this.running.size === 0;
  }

  private fire(event: SceneEvent): void {
    event.actions.forEach((action) => this.run(action));
  }

  private poseOf(entity: RuntimeEntity): Pose {
    const pose = this.current.get(entity.id);
    return pose ? lerpPose(pose, pose, 0) : resolveState(entity);
  }

  private advance(targetId: string, transition: RunningTransition): void {
    const sample = sampleTransition(transition.action, transition.elapsed);
    // Always a new pose object, never one of the rows, so whoever applies it can't change a row.
    this.current.set(targetId, lerpPose(transition.rows[sample.from], transition.rows[sample.to], sample.progress));
    if (sample.finished) this.running.delete(targetId);
  }
}
