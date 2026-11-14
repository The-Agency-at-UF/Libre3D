import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { GLTF } from "three/examples/jsm/loaders/GLTFLoader.js";

import { cacheParsedModel, takeParsedModel } from "./parsedModelCache";

// The cache never looks inside what it holds.
const parsed = (name: string) => ({ name }) as unknown as GLTF;

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

describe("the parsed-model cache", () => {
  it("hands a parsed model to the first taker, once", () => {
    const car = parsed("car");
    cacheParsedModel("car-hash", car);

    expect(takeParsedModel("car-hash")).toBe(car);
    expect(takeParsedModel("car-hash")).toBeUndefined();
  });

  it("has nothing for a model that wasn't imported this session", () => {
    expect(takeParsedModel("never-imported")).toBeUndefined();
  });

  it("keeps models apart by asset ID", () => {
    const car = parsed("car");
    const tree = parsed("tree");
    cacheParsedModel("car-hash", car);
    cacheParsedModel("tree-hash", tree);

    expect(takeParsedModel("tree-hash")).toBe(tree);
    expect(takeParsedModel("car-hash")).toBe(car);
  });

  it("drops a model nobody claimed after 30 seconds", () => {
    cacheParsedModel("car-hash", parsed("car"));

    vi.advanceTimersByTime(29_999);
    expect(vi.getTimerCount()).toBe(1);
    vi.advanceTimersByTime(1);

    expect(takeParsedModel("car-hash")).toBeUndefined();
    expect(vi.getTimerCount()).toBe(0);
  });

  it("stops the clock when a model is taken", () => {
    cacheParsedModel("car-hash", parsed("car"));
    takeParsedModel("car-hash");

    expect(vi.getTimerCount()).toBe(0);
  });
});
