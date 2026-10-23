import { describe, expect, it } from "vitest";
import { applyEasing } from "./easing";
import { previewTiming, sampleTransition, transitionRows, type TransitionTiming } from "./transitions";

const timing = (overrides: Partial<TransitionTiming> = {}): TransitionTiming => ({
  steps: [{ to: "up", duration: 1, easing: "linear" }],
  delay: 0,
  delayRepeat: "none",
  loop: 0,
  cycle: "restart",
  ...overrides,
});

const twoSteps = (easing: "linear" | "easeIn" = "linear") =>
  [
    { to: "up", duration: 1, easing },
    { to: "big", duration: 1, easing },
  ] as TransitionTiming["steps"];

const moving = (from: number, to: number, progress: number) => ({ from, to, progress, finished: false });
const waiting = (row: number) => ({ from: row, to: row, progress: 0, finished: false });
const done = (row: number) => ({ from: row, to: row, progress: 0, finished: true });

describe("sampleTransition: one run", () => {
  it("moves from row 1 to row 2 over the step's duration, then stops there", () => {
    const once = timing();

    expect(sampleTransition(once, 0)).toEqual(moving(0, 1, 0));
    expect(sampleTransition(once, 0.25)).toEqual(moving(0, 1, 0.25));
    expect(sampleTransition(once, 1)).toEqual(done(1));
    expect(sampleTransition(once, 50)).toEqual(done(1));
  });

  it("goes through the steps in order, each with its own duration and easing", () => {
    const steps = timing({
      steps: [
        { to: "up", duration: 1, easing: "linear" },
        { to: "big", duration: 0.5, easing: "easeIn" },
      ],
    });

    expect(sampleTransition(steps, 0.5)).toEqual(moving(0, 1, 0.5));
    expect(sampleTransition(steps, 1.25)).toEqual(moving(1, 2, applyEasing("easeIn", 0.5)));
    expect(sampleTransition(steps, 1.5)).toEqual(done(2));
  });

  it("waits at row 1 for the delay first", () => {
    const delayed = timing({ delay: 2 });

    expect(sampleTransition(delayed, 0)).toEqual(waiting(0));
    expect(sampleTransition(delayed, 1.9)).toEqual(waiting(0));
    expect(sampleTransition(delayed, 2.5)).toEqual(moving(0, 1, 0.5));
    expect(sampleTransition(delayed, 3)).toEqual(done(1));
  });

  it("treats negative or missing times as zero", () => {
    expect(sampleTransition(timing(), -3)).toEqual(moving(0, 1, 0));
    expect(sampleTransition(timing({ delay: -1, steps: [{ to: "up", duration: Number.NaN, easing: "linear" }] }), 0)).toEqual(done(1));
    expect(sampleTransition(timing({ steps: [] }), 4)).toEqual(done(0));
  });
});

describe("sampleTransition: loops", () => {
  it("restarts from row 1 for each repeat and stops after the last", () => {
    const twice = timing({ loop: 2 });

    expect(sampleTransition(twice, 0.5)).toEqual(moving(0, 1, 0.5));
    expect(sampleTransition(twice, 1.5)).toEqual(moving(0, 1, 0.5));
    expect(sampleTransition(twice, 2.75)).toEqual(moving(0, 1, 0.75));
    expect(sampleTransition(twice, 3)).toEqual(done(1));
  });

  it("goes back the way it came with ping-pong, each step with its own easing the same way round", () => {
    const pingPong = timing({ steps: twoSteps("easeIn"), loop: 1, cycle: "pingPong" });

    expect(sampleTransition(pingPong, 0.5)).toEqual(moving(0, 1, applyEasing("easeIn", 0.5)));
    expect(sampleTransition(pingPong, 1.5)).toEqual(moving(1, 2, applyEasing("easeIn", 0.5)));
    expect(sampleTransition(pingPong, 2.25)).toEqual(moving(2, 1, applyEasing("easeIn", 0.25)));
    expect(sampleTransition(pingPong, 3.5)).toEqual(moving(1, 0, applyEasing("easeIn", 0.5)));
    expect(sampleTransition(pingPong, 4)).toEqual(done(0));
  });

  it("counts each way of a ping-pong as one run, as Spline does", () => {
    const back = timing({ loop: 1, cycle: "pingPong" });
    const backAndForth = timing({ loop: 2, cycle: "pingPong" });

    expect(sampleTransition(back, 10)).toEqual(done(0));
    expect(sampleTransition(backAndForth, 10)).toEqual(done(1));
  });

  it("loops forever, and is the same an hour in as it was in the first cycle", () => {
    const bob = timing({ steps: twoSteps(), loop: "infinite", cycle: "pingPong" });

    expect(sampleTransition(bob, 4.5)).toEqual(moving(0, 1, 0.5));
    expect(sampleTransition(bob, 6.5)).toEqual(moving(2, 1, 0.5));
    expect(sampleTransition(bob, 3600 + 4.5)).toEqual(moving(0, 1, 0.5));
    expect(sampleTransition(bob, 1e9).finished).toBe(false);

    const spin = timing({ loop: "infinite" });
    expect(sampleTransition(spin, 7.25)).toEqual(moving(0, 1, 0.25));
  });

  it("doesn't hang on a loop that takes no time", () => {
    expect(sampleTransition(timing({ steps: [{ to: "up", duration: 0, easing: "linear" }], loop: "infinite" }), 5)).toEqual(done(1));
    expect(sampleTransition(timing({ steps: [{ to: "up", duration: 0, easing: "linear" }], loop: 3, cycle: "pingPong" }), 5)).toEqual(done(0));
  });
});

describe("sampleTransition: Delay Repeat", () => {
  // One 1 s step, a 1 s delay, played three times.
  const repeated = (delayRepeat: TransitionTiming["delayRepeat"]) => timing({ delay: 1, delayRepeat, loop: 2 });

  it("none: only the first run waits", () => {
    const none = repeated("none");

    expect(sampleTransition(none, 0.5)).toEqual(waiting(0));
    expect(sampleTransition(none, 1.5)).toEqual(moving(0, 1, 0.5));
    expect(sampleTransition(none, 2.5)).toEqual(moving(0, 1, 0.5));
    expect(sampleTransition(none, 4)).toEqual(done(1));
  });

  it("start: every run waits at row 1 before it", () => {
    const start = repeated("start");

    expect(sampleTransition(start, 0.5)).toEqual(waiting(0));
    expect(sampleTransition(start, 2.5)).toEqual(waiting(0));
    expect(sampleTransition(start, 3.5)).toEqual(moving(0, 1, 0.5));
    expect(sampleTransition(start, 5.5)).toEqual(moving(0, 1, 0.5));
    expect(sampleTransition(start, 6)).toEqual(done(1));
  });

  it("end: every run waits at the last row after it, and the first starts at once", () => {
    const end = repeated("end");

    expect(sampleTransition(end, 0.5)).toEqual(moving(0, 1, 0.5));
    expect(sampleTransition(end, 1.5)).toEqual(waiting(1));
    expect(sampleTransition(end, 2.5)).toEqual(moving(0, 1, 0.5));
    expect(sampleTransition(end, 5)).toEqual(done(1));
  });

  it("startEnd: both", () => {
    const both = repeated("startEnd");

    expect(sampleTransition(both, 0.5)).toEqual(waiting(0));
    expect(sampleTransition(both, 2.5)).toEqual(waiting(1));
    expect(sampleTransition(both, 3.5)).toEqual(waiting(0));
    expect(sampleTransition(both, 4.5)).toEqual(moving(0, 1, 0.5));
    expect(sampleTransition(both, 8)).toEqual(done(1));
  });

  it("with ping-pong, Start waits at row 1 and End at the last row", () => {
    const start = timing({ delay: 1, delayRepeat: "start", loop: "infinite", cycle: "pingPong" });
    const end = timing({ delay: 1, delayRepeat: "end", loop: "infinite", cycle: "pingPong" });

    // Start: wait, there, back, wait, there…
    expect(sampleTransition(start, 0.5)).toEqual(waiting(0));
    expect(sampleTransition(start, 1.5)).toEqual(moving(0, 1, 0.5));
    expect(sampleTransition(start, 2.5)).toEqual(moving(1, 0, 0.5));
    expect(sampleTransition(start, 3.5)).toEqual(waiting(0));
    expect(sampleTransition(start, 4.5)).toEqual(moving(0, 1, 0.5));

    // End: there, wait, back, there, wait…
    expect(sampleTransition(end, 0.5)).toEqual(moving(0, 1, 0.5));
    expect(sampleTransition(end, 1.5)).toEqual(waiting(1));
    expect(sampleTransition(end, 2.5)).toEqual(moving(1, 0, 0.5));
    expect(sampleTransition(end, 3.5)).toEqual(moving(0, 1, 0.5));
    expect(sampleTransition(end, 4.5)).toEqual(waiting(1));
  });
});

describe("transitionRows and previewTiming", () => {
  it("lists row 1 and where each step ends", () => {
    expect(transitionRows({ from: "current", steps: twoSteps() })).toEqual(["current", "up", "big"]);
  });

  it("previews without the delay, once, or there and back for a ping-pong loop", () => {
    expect(previewTiming(timing({ delay: 2, loop: "infinite" }))).toMatchObject({ delay: 0, loop: 0 });
    expect(previewTiming(timing({ loop: 5, cycle: "pingPong" }))).toMatchObject({ delay: 0, loop: 1 });
    expect(previewTiming(timing({ loop: 0, cycle: "pingPong" }))).toMatchObject({ loop: 0 });
  });
});
