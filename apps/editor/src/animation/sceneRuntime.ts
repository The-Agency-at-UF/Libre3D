/**
 * PURPOSE: Runs a scene's events (notes/animation-plan.md, A3): what Play does, and later the
 * share-link viewer.
 *
 * INPUT: A snapshot of the scene (its objects' own transforms and parents, and its animation
 *        section), taken when Play starts; its triggers (Start, and a pointer trigger on an
 *        object, through `fire`; a key, through `key`), the passing of time, and the scroll
 *        progress the host reads from the page (`setScrollProgress`).
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
 * - Values change linearly after easing (a path's trim too, which is how it writes itself on;
 *   opacity and a camera's field of view too). Colour is mixed in linear light (utils/colorSpaces.ts), as THREE.Color.lerp would.
 *   Rotation changes per Euler component, so a state turned +360° about Y spins once, where the
 *   shortest way round (slerp) wouldn't move at all.
 * - A Scroll event's transitions have no clock (decision tree B4): where each is is the scene's one
 *   scroll progress (0 to 1) times its length, through its steps and easings, without its Delay,
 *   Loop, or Cycle, so scrolling back retraces it. They are set up once, put at progress 0 by
 *   `start()` (no flash of Base before the first frame), and moved by `setScrollProgress`. Row 1 is
 *   never Current there (there is no moment it starts from): it reads as Base. The newest writer
 *   wins an object both drive: a clocked transition (a click) started on a scroll-driven object
 *   takes it from where it is, and the next change of scroll progress takes it back, stopping that
 *   transition. It doesn't snap back: the object glides from where the click left it to its scroll
 *   pose over SCROLL_TAKEOVER_SECONDS, moved by `tick` for that glide only, then follows scroll
 *   again. A click during the glide ends it.
 * - An Open Link or Sound action isn't run here: it becomes an effect (actions.ts) handed to the
 *   host's `onEffect` at once, while the trigger is still being handled.
 * - A missing owner, target, or state (a deleted object or state, a damaged file) skips that action
 *   instead of throwing.
 */

import type { MaterialLayer } from "../scene/types";
import { mixHexLinear } from "../utils/colorSpaces";
import { actionEffect, isTransition, type SceneAction, type SceneEffect } from "./actions";
import { normalizeEvents, type EventTrigger, type SceneEvent } from "./events";
import { resolveState, withoutLook, type ObjectState, type Pose, type SceneAnimation } from "./objectStates";
import {
  clampProgress,
  sampleTransition,
  sampleTransitionAt,
  scrubTiming,
  transitionLength,
  type StateRef,
  type TransitionAction,
  type TransitionSample,
  type TransitionTiming,
} from "./transitions";

/**
 * What the runtime needs of an object: where it is in Base (and a path's trim), its parent (for
 * clicks), and for its colour and opacity the layers and opacity it is drawn with, and whether
 * they are a material asset's (no state changes those: objectStates.ts). Give it the entities as
 * they are drawn (scene/materialAssets.ts, `resolveEntities`), so an object on a material asset has
 * the asset's layers.
 */
export interface RuntimeEntity {
  id: string;
  parentId?: string | null;
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
  trimStart?: number;
  trimEnd?: number;
  materialLayers?: MaterialLayer[];
  materialAssetId?: string;
  opacity?: number;
  camera?: { fov: number }; // a scene camera's lens: its field of view is a state value
}

export interface RuntimeOptions {
  /**
   * Carries out what an action asks of the host (open a link, play a sound): the runtime never
   * touches the DOM. Called synchronously inside the trigger that fired it, so a link opened from
   * a click is still inside that click's handler (browsers block it as a popup otherwise).
   */
  onEffect?: (effect: SceneEffect) => void;
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

/** The triggers fired by a key rather than the pointer or Start. */
export type KeyTrigger = Extract<EventTrigger, "keyDown" | "keyUp">;

// How long an object a click moved takes to glide back to its scroll pose once scroll takes it
// again. Short enough to read as a response to the scroll, long enough that no step is visible.
const SCROLL_TAKEOVER_SECONDS = 0.5;

/** A glide from where a click left a scroll-driven object back to its scroll pose. */
interface ScrollTakeover {
  from: Pose;
  elapsed: number; // seconds
}

/** A Scroll event's transition, ready to be put anywhere along its sequence. */
interface ScrubbedTransition {
  targetId: string;
  timing: TransitionTiming; // its steps, without Delay, Loop, or Cycle
  length: number; // seconds, so progress paces the steps as time would
  rows: Pose[];
}

const keySlot = (trigger: KeyTrigger, code: string) => `${trigger}:${code}`;

const lerp = (from: number, to: number, progress: number) => from + (to - from) * progress;

const lerpVector = (
  from: [number, number, number],
  to: [number, number, number],
  progress: number,
): [number, number, number] => [lerp(from[0], to[0], progress), lerp(from[1], to[1], progress), lerp(from[2], to[2], progress)];

// A row without a colour (it can't happen between two rows of one object) takes the other's.
const mixedColor = (from: string | undefined, to: string | undefined, progress: number): string | undefined =>
  from === undefined || to === undefined ? (from ?? to) : mixHexLinear(from, to, progress);

const hasTrim = (pose: Pose) => pose.trimStart !== undefined || pose.trimEnd !== undefined;

const lerpPose = (from: Pose, to: Pose, progress: number): Pose => {
  const pose: Pose = {
    position: lerpVector(from.position, to.position, progress),
    rotation: lerpVector(from.rotation, to.rotation, progress),
    scale: lerpVector(from.scale, to.scale, progress),
  };
  if (hasTrim(from) || hasTrim(to)) {
    pose.trimStart = lerp(from.trimStart ?? 0, to.trimStart ?? 0, progress);
    pose.trimEnd = lerp(from.trimEnd ?? 1, to.trimEnd ?? 1, progress);
  }
  if (from.opacity !== undefined || to.opacity !== undefined) {
    pose.opacity = Math.min(1, Math.max(0, lerp(from.opacity ?? 1, to.opacity ?? 1, progress)));
  }
  const color = mixedColor(from.color, to.color, progress);
  if (color !== undefined) pose.color = color;
  // A camera's field of view (both rows have one: they're the same camera's).
  if (from.fov !== undefined || to.fov !== undefined) pose.fov = lerp(from.fov ?? to.fov!, to.fov ?? from.fov!, progress);
  return pose;
};

export class SceneRuntime {
  private readonly entities = new Map<string, RuntimeEntity>();
  private readonly states: Record<string, ObjectState>;
  private readonly eventsByOwner = new Map<string, SceneEvent[]>();
  // Key Down and Key Up events by trigger and code ("keyDown:Space"), in scene order, so a keypress is one lookup.
  private readonly eventsByKey = new Map<string, SceneEvent[]>();
  private readonly running = new Map<string, RunningTransition>(); // by target ID
  private readonly current = new Map<string, Pose>(); // where each moved object is, by entity ID
  private readonly scrubbed: ScrubbedTransition[] = []; // Scroll events' transitions, in scene order
  private scrollProgress = Number.NaN; // none put on yet
  private readonly scrollPoses = new Map<string, Pose>(); // where scroll puts each scrubbed object now
  private readonly clockMoved = new Set<string>(); // objects a clocked transition moved since scroll last did
  private readonly takeovers = new Map<string, ScrollTakeover>(); // objects gliding back to their scroll pose

  /**
   * The triggers the scene's events use, so a host can skip what the scene can't need (no pick on
   * a hover when nothing is clickable). Events never change after construction, so it's worked out
   * once, not on every hover frame.
   */
  readonly triggersInUse: ReadonlySet<EventTrigger>;

  /**
   * The keys (`KeyboardEvent.code`) the scene's Key Down and Key Up events listen for, so a host
   * listens for keys only when there are some, and claims only these from the page.
   */
  readonly keyCodes: ReadonlySet<string>;

  private readonly onEffect: RuntimeOptions["onEffect"];

  constructor(scene: RuntimeScene, { onEffect }: RuntimeOptions = {}) {
    this.onEffect = onEffect;
    for (const entity of scene.entities) {
      this.entities.set(entity.id, {
        id: entity.id,
        parentId: entity.parentId ?? null,
        ...withoutLook(resolveState(entity)), // copies of its vectors
        materialLayers: entity.materialLayers,
        materialAssetId: entity.materialAssetId,
        opacity: entity.opacity,
        ...(entity.camera ? { camera: { fov: entity.camera.fov } } : null),
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
    this.triggersInUse = new Set(events.map((event) => event.trigger));

    // An event with no key picked yet never fires, so it isn't indexed.
    for (const event of events) {
      if ((event.trigger !== "keyDown" && event.trigger !== "keyUp") || !event.key) continue;
      const slot = keySlot(event.trigger, event.key);
      const list = this.eventsByKey.get(slot) ?? [];
      list.push(event);
      this.eventsByKey.set(slot, list);
    }
    this.keyCodes = new Set([...this.eventsByKey.values()].map((list) => list[0].key!));

    for (const event of events) {
      if (event.trigger !== "scroll") continue;
      for (const action of event.actions) {
        // Only transitions follow scroll: an Open Link or Sound has no moment to happen.
        if (!isTransition(action)) continue;
        const entity = this.entities.get(action.targetId);
        // Row 1 can't be Current without a moment it starts from: it reads as Base.
        const first = entity && action.from === "current" ? resolveState(entity) : null;
        const rows = entity && action.type === "transition" && action.steps.length > 0 ? this.resolveRows(entity, action, first) : null;
        if (!rows) continue;
        const timing = scrubTiming(action);
        this.scrubbed.push({ targetId: entity!.id, timing, length: transitionLength(timing), rows });
      }
    }
  }

  /** Whether any object has a Mouse Down event. */
  get hasClickEvents(): boolean {
    return this.triggersInUse.has("mouseDown");
  }

  /** Fires every Start event, and puts every Scroll event's transition at progress 0. */
  start(): void {
    this.fire("start");
    this.setScrollProgress(0);
  }

  /** Whether any Scroll event has a transition that can run, so a host knows to supply progress. */
  get hasScrollEvents(): boolean {
    return this.scrubbed.length > 0;
  }

  /**
   * Puts every Scroll event's transition at `progress` (0 to 1, clamped; NaN is 0) of its sequence:
   * the host's scroll position, read from the page (or the editor's scrubber). Writes nothing when
   * the progress hasn't changed, so a host may call it every frame.
   */
  setScrollProgress(progress: number): void {
    const next = clampProgress(progress);
    if (next === this.scrollProgress) return;
    const firstWrite = Number.isNaN(this.scrollProgress); // start(): nothing to glide from yet
    this.scrollProgress = next;
    for (const scrub of this.scrubbed) {
      const id = scrub.targetId;
      this.running.delete(id); // newest writer wins: a clocked transition here stops
      const sample = sampleTransitionAt(scrub.timing, scrub.length, next);
      this.scrollPoses.set(id, lerpPose(scrub.rows[sample.from], scrub.rows[sample.to], sample.progress));
      if (this.clockMoved.delete(id) && !firstWrite) {
        this.takeovers.set(id, { from: lerpPose(this.current.get(id) ?? this.scrollPoses.get(id)!, this.scrollPoses.get(id)!, 0), elapsed: 0 });
      }
      this.writeScrollPose(id);
    }
  }

  /** Puts a scroll-driven object at its scroll pose, or part-way back to it while it glides. */
  private writeScrollPose(id: string): void {
    const target = this.scrollPoses.get(id)!;
    const takeover = this.takeovers.get(id);
    if (!takeover) {
      this.current.set(id, lerpPose(target, target, 0));
      return;
    }
    const t = Math.min(1, takeover.elapsed / SCROLL_TAKEOVER_SECONDS);
    const eased = 1 - (1 - t) * (1 - t); // starts quickly, then settles
    this.current.set(id, lerpPose(takeover.from, target, eased));
  }

  /**
   * The one way in: fires the events of a trigger. With an object (a pointer trigger), its owner's
   * (`ownerOf`); without one (Start), every object's, in scene order. Returns whether any fired.
   * Key triggers need their key, so they go through `key`, and Scroll has no moment it fires (it
   * goes through `setScrollProgress`): neither fires anything here.
   */
  fire(trigger: EventTrigger, entityId?: string): boolean {
    if (trigger === "keyDown" || trigger === "keyUp" || trigger === "scroll") return false;
    if (entityId === undefined) {
      let fired = false;
      for (const ownerId of this.eventsByOwner.keys()) fired = this.fireOwn(ownerId, trigger) || fired;
      return fired;
    }
    const ownerId = this.ownerOf(trigger, entityId);
    return ownerId !== null && this.fireOwn(ownerId, trigger);
  }

  /**
   * The object whose events of a trigger a pointer on `entityId` fires: that object, or its nearest
   * ancestor that has any (so clicking part of an imported model fires the model's). Null if none.
   */
  ownerOf(trigger: EventTrigger, entityId: string): string | null {
    const visited = new Set<string>(); // a damaged document could make a parent cycle
    let id: string | null | undefined = entityId;
    while (id && !visited.has(id)) {
      visited.add(id);
      if (this.eventsByOwner.get(id)?.some((event) => event.trigger === trigger)) return id;
      id = this.entities.get(id)?.parentId;
    }
    return null;
  }

  /** `ownerOf("mouseDown", entityId)`: the object whose Mouse Down events a click on `entityId` fires. */
  clickOwnerOf(entityId: string): string | null {
    return this.ownerOf("mouseDown", entityId);
  }

  /** `fire("mouseDown", entityId)`: a click (mouse button down) on an object. */
  click(entityId: string): boolean {
    return this.fire("mouseDown", entityId);
  }

  /**
   * A key pressed (`keyDown`) or released (`keyUp`): fires every event of that trigger listening
   * for `code`, on whichever object it belongs to, in scene order. The pointer plays no part.
   * Returns whether any fired.
   */
  key(trigger: KeyTrigger, code: string): boolean {
    const events = this.eventsByKey.get(keySlot(trigger, code));
    events?.forEach((event) => this.runEvent(event));
    return events !== undefined;
  }

  /**
   * Starts one transition on its target, replacing any running there. Returns false, and changes
   * nothing, when it can't run: its target or one of its states is missing.
   */
  run(action: TransitionAction): boolean {
    const entity = this.entities.get(action.targetId);
    if (!entity || action.type !== "transition" || action.steps.length === 0) return false;

    const isMoving = this.running.has(entity.id);
    const rows = this.resolveRows(entity, action, action.from === "current" || isMoving ? this.poseOf(entity) : null);
    if (!rows) return false;

    this.takeovers.delete(entity.id); // a new click ends a glide back to scroll
    const transition: RunningTransition = { action, rows, elapsed: 0 };
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
    for (const [id, takeover] of this.takeovers) {
      takeover.elapsed += dt;
      this.writeScrollPose(id);
      if (takeover.elapsed >= SCROLL_TAKEOVER_SECONDS) this.takeovers.delete(id);
    }
  }

  /** Where each object a transition has moved is now, by entity ID. Objects not listed are in Base. */
  poses(): ReadonlyMap<string, Pose> {
    return this.current;
  }

  /** Whether nothing is moving (or waiting to move) any more. */
  get isIdle(): boolean {
    return this.running.size === 0 && this.takeovers.size === 0;
  }

  /** Fires an owner's own events of a trigger, in Events-list order. Returns whether it had any. */
  private fireOwn(ownerId: string, trigger: EventTrigger): boolean {
    let fired = false;
    for (const event of this.eventsByOwner.get(ownerId) ?? []) {
      if (event.trigger !== trigger) continue;
      this.runEvent(event);
      fired = true;
    }
    return fired;
  }

  /** Runs an event's actions in order: transitions here, the rest as effects for the host. */
  private runEvent(event: SceneEvent): void {
    for (const action of event.actions) {
      if (isTransition(action)) this.run(action);
      else this.emit(action);
    }
  }

  // A host's handler that throws (a blocked popup, a sound that won't decode) mustn't stop the rest
  // of the event, or Play.
  private emit(action: SceneAction): void {
    const effect = actionEffect(action);
    if (!effect || !this.onEffect) return;
    try {
      this.onEffect(effect);
    } catch (error) {
      console.error("[Libre3D] An event's action failed:", error);
    }
  }

  /**
   * The pose at each row of a transition on `entity`, or null when a row names no state of it. Row 1
   * is `first` when given (where the object is), else the state it names.
   */
  private resolveRows(entity: RuntimeEntity, action: TransitionAction, first: Pose | null): Pose[] | null {
    const resolveRow = (ref: StateRef): Pose | null => {
      if (ref === "base") return resolveState(entity);
      const state = this.states[ref];
      return state && state.targetId === entity.id ? resolveState(entity, state) : null;
    };
    const rows = [first ?? resolveRow(action.from), ...action.steps.map((step) => resolveRow(step.to))];
    return rows.every((pose) => pose !== null) ? (rows as Pose[]) : null;
  }

  private poseOf(entity: RuntimeEntity): Pose {
    const pose = this.current.get(entity.id);
    return pose ? lerpPose(pose, pose, 0) : resolveState(entity);
  }

  private advance(targetId: string, transition: RunningTransition): void {
    const sample = sampleTransition(transition.action, transition.elapsed);
    this.putAt(targetId, transition.rows, sample);
    this.clockMoved.add(targetId);
    if (sample.finished) this.running.delete(targetId);
  }

  private putAt(targetId: string, rows: Pose[], sample: TransitionSample): void {
    // Always a new pose object, never one of the rows, so whoever applies it can't change a row.
    this.current.set(targetId, lerpPose(rows[sample.from], rows[sample.to], sample.progress));
  }
}
