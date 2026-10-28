/**
 * PURPOSE: The Transition action (notes/animation-plan.md, A3) and its timing: where in its sequence
 * a transition is at a given time.
 *
 * A transition moves one object (its target) through a sequence of that object's states: row 1
 * (`from`), then one row per step, each step with its own duration and easing. The Sequence
 * settings run the whole sequence again: Loop says how often, Cycle whether each repeat starts over
 * (restart) or goes back the way it came (ping-pong), and Delay how long it waits, with Delay Repeat
 * saying which repeats wait too. These follow what Spline's player does with the same settings.
 *
 * Only time is handled here. Which pose each row is, and moving objects, is the scene runtime's
 * job (sceneRuntime.ts). Nothing here depends on the store, React, or the DOM.
 */

import { applyEasing, EASINGS, type Easing } from "./easing";

/** A state of the target: "base" for its own values, else a state ID. */
export type StateRef = "base" | string;

/**
 * Which runs wait for the Delay. A run that leaves row 1 can wait before it (start), and a run that
 * reaches the last row can wait after it (end). With Restart every run does both; with Ping Pong
 * only the runs going forward do, so Start waits at row 1 and End at the last row.
 * - none: only the first run waits, before it starts.
 * - start: every run leaving row 1 waits before it.
 * - end: every run reaching the last row waits after it. Nothing waits at the very start.
 * - startEnd: both.
 */
export type DelayRepeat = "none" | "start" | "end" | "startEnd";

export type Cycle = "restart" | "pingPong";

export interface TransitionStep {
  to: StateRef;
  duration: number; // seconds
  easing: Easing;
}

export interface TransitionAction {
  id: string;
  type: "transition";
  targetId: string; // entity ID
  from: StateRef | "current"; // row 1; "current" = wherever the target is when it starts
  steps: TransitionStep[]; // rows 2…n
  delay: number; // seconds
  delayRepeat: DelayRepeat;
  loop: number | "infinite"; // runs after the first; 0 = play once
  cycle: Cycle;
}

export type TransitionTiming = Pick<TransitionAction, "steps" | "delay" | "delayRepeat" | "loop" | "cycle">;

/**
 * Where a transition is: moving from row `from` towards row `to` (row 0 is row 1 in the panel, row
 * k is where step k ends), `progress` of the way there, already eased. While it waits, `from` and
 * `to` are the row it waits at. `finished` once the last run has arrived.
 */
export interface TransitionSample {
  from: number;
  to: number;
  progress: number;
  finished: boolean;
}

const seconds = (value: number): number => (Number.isFinite(value) && value > 0 ? value : 0);

/** How many runs in all: the first plus the repeats. */
const countRuns = (loop: TransitionTiming["loop"]): number =>
  loop === "infinite" ? Infinity : 1 + Math.floor(seconds(loop));

/** Where a transition is `elapsed` seconds after it started. */
export const sampleTransition = (timing: TransitionTiming, elapsed: number): TransitionSample => {
  const durations = timing.steps.map((step) => seconds(step.duration));
  const lastRow = durations.length;
  const runLength = durations.reduce((sum, duration) => sum + duration, 0);
  const delay = seconds(timing.delay);
  const runs = countRuns(timing.loop);
  const pingPong = timing.cycle === "pingPong";
  const { delayRepeat } = timing;

  const isForward = (run: number) => !pingPong || run % 2 === 0;
  const waitBefore = (run: number) =>
    isForward(run) && (delayRepeat === "start" || delayRepeat === "startEnd" || (delayRepeat === "none" && run === 0))
      ? delay
      : 0;
  const waitAfter = (run: number) =>
    isForward(run) && (delayRepeat === "end" || delayRepeat === "startEnd") ? delay : 0;
  const runSpan = (run: number) => waitBefore(run) + runLength + waitAfter(run);
  const hold = (row: number, finished = false): TransitionSample => ({ from: row, to: row, progress: 0, finished });
  const endRow = (run: number) => (isForward(run) ? lastRow : 0);

  // Inside run `run`, `time` seconds after its span began.
  const sampleRun = (run: number, time: number): TransitionSample => {
    const forward = isForward(run);
    let left = time - waitBefore(run);
    if (left < 0) return hold(forward ? 0 : lastRow);
    if (left >= runLength) {
      return run === runs - 1 ? hold(endRow(run), true) : hold(endRow(run));
    }

    // Forward, step k goes from row k to row k + 1; backward, the steps run last to first, each
    // with its own duration and easing.
    for (let i = 0; i < lastRow; i += 1) {
      const step = forward ? i : lastRow - 1 - i;
      const duration = durations[step];
      if (left < duration) {
        const progress = applyEasing(timing.steps[step].easing, left / duration);
        return forward
          ? { from: step, to: step + 1, progress, finished: false }
          : { from: step + 1, to: step, progress, finished: false };
      }
      left -= duration;
    }
    return hold(endRow(run));
  };

  let time = Math.max(0, Number.isFinite(elapsed) ? elapsed : 0);
  if (lastRow === 0) return hold(0, true);

  // The first run is the odd one out (with Delay Repeat None, only it waits), so it's handled on
  // its own; after it, the runs repeat with a period of one run (restart) or two (ping-pong).
  const firstSpan = runSpan(0);
  if (runs === 1 || time < firstSpan) return sampleRun(0, Math.min(time, firstSpan));
  time -= firstSpan;

  const periodRuns = pingPong ? 2 : 1;
  const periodSpans = Array.from({ length: periodRuns }, (_, i) => runSpan(1 + i));
  const periodLength = periodSpans.reduce((sum, span) => sum + span, 0);
  const lastRun = runs - 1;

  // Nothing takes any time (no durations, no delay): it's wherever the last run ends, at once. An
  // endless loop of that has no last run; it shows the first run's end.
  if (periodLength === 0) return runs === Infinity ? hold(endRow(0), true) : hold(endRow(lastRun), true);

  const periods = Math.floor(time / periodLength);
  let run = 1 + periods * periodRuns;
  if (run > lastRun) return hold(endRow(lastRun), true);
  time -= periods * periodLength;

  for (const span of periodSpans) {
    if (time < span || run === lastRun) return sampleRun(run, time);
    time -= span;
    run += 1;
  }
  return sampleRun(run, time);
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const DELAY_REPEATS: DelayRepeat[] = ["none", "start", "end", "startEnd"];

/**
 * A transition read from a document, in the shape everything else expects, or null when it isn't a
 * transition at all. Settings that are missing or out of range get their defaults, and a row whose
 * state isn't a string becomes "" (no state picked), so a hand-edited or damaged file can't break
 * the panel or Play. Whether the states and target still exist is checked where they're used.
 */
export const normalizeTransition = (raw: unknown): TransitionAction | null => {
  if (!isRecord(raw) || raw.type !== "transition" || typeof raw.id !== "string") return null;

  const steps = Array.isArray(raw.steps) ? raw.steps.filter(isRecord) : [];
  const easings = EASINGS.map((easing) => easing.value);

  return {
    id: raw.id,
    type: "transition",
    targetId: typeof raw.targetId === "string" ? raw.targetId : "",
    from: typeof raw.from === "string" ? raw.from : "",
    steps: steps.map((step) => ({
      to: typeof step.to === "string" ? step.to : "",
      duration: seconds(step.duration as number),
      easing: easings.includes(step.easing as Easing) ? (step.easing as Easing) : "easeInOut",
    })),
    delay: seconds(raw.delay as number),
    delayRepeat: DELAY_REPEATS.includes(raw.delayRepeat as DelayRepeat) ? (raw.delayRepeat as DelayRepeat) : "none",
    loop: raw.loop === "infinite" ? "infinite" : Math.floor(seconds(raw.loop as number)),
    cycle: raw.cycle === "pingPong" ? "pingPong" : "restart",
  };
};

/** The states a transition goes through, row by row: row 1, then where each step ends. */
export const transitionRows = (action: Pick<TransitionAction, "from" | "steps">): (StateRef | "current")[] => [
  action.from,
  ...action.steps.map((step) => step.to),
];

/**
 * The same transition as the ▶ button in the Edit Event panel plays it: without its Delay, and run
 * once (twice when it ping-pongs, so the way back shows too) however often it loops.
 */
export const previewTiming = <T extends TransitionTiming>(action: T): T => ({
  ...action,
  delay: 0,
  loop: action.loop !== 0 && action.cycle === "pingPong" ? 1 : 0,
});
