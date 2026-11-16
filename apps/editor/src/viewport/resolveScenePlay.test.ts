import { describe, expect, it } from "vitest";
import { DEFAULT_PLAY_CAMERA, resolveScenePlay } from "./PlayCamera";

// The order a scene's Play setting is read in (C7): the scene's, the active profile's, the defaults.
describe("resolveScenePlay", () => {
  it("takes the scene's setting over the active profile's", () => {
    expect(resolveScenePlay({ mode: "fixed" }, { mode: "autoRotate", speed: 20 })).toEqual({ ...DEFAULT_PLAY_CAMERA, mode: "fixed" });
  });

  it("falls back to the active profile's for a scene without one, as scenes from before it", () => {
    expect(resolveScenePlay(undefined, { mode: "autoRotate", speed: 20 })).toEqual({ ...DEFAULT_PLAY_CAMERA, mode: "autoRotate", speed: 20 });
  });

  it("gives the defaults when neither holds one", () => {
    expect(resolveScenePlay(undefined, undefined)).toEqual(DEFAULT_PLAY_CAMERA);
  });

  it("fills and clamps a partial or damaged setting as resolvePlayCamera does", () => {
    expect(resolveScenePlay({ mode: "softOrbit", range: 500 }, undefined)).toEqual({ ...DEFAULT_PLAY_CAMERA, mode: "softOrbit", range: 45 });
    expect(resolveScenePlay({ mode: "spin" as never, smoothness: -1 }, { mode: "fixed" })).toEqual({ ...DEFAULT_PLAY_CAMERA, smoothness: 0 });
  });
});
