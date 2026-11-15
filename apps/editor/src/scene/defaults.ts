/**
 * PURPOSE: What a new scene starts with, and what a saved scene falls back to for a setting it
 * doesn't hold: the scene, post-processing, and frame settings, and the camera every scene has.
 *
 * Used by the editor's store (new scenes, and `loadScene` merging a saved scene over these) and by
 * the share-link viewer for a published scene. Imports nothing but types, so the viewer gets the
 * same values without loading the store.
 */

import type { CameraProfile, FrameSettingsConfig, PostProcessingConfig, SceneSettingsConfig } from "./types";

// Every effect starts off, holding the values its row shows the first time it's turned on.
export const initialPostProcessingDefaults: PostProcessingConfig = {
  enabled: true,
  toneMap: "Neutral",
  exposure: 0,
  dof: { enabled: false, amount: 100, focusDistance: 100, range: 20, blur: 5 },
  pixelation: { enabled: false, amount: 100, granularity: 15 },
  aberration: { enabled: false, amount: 100, offsetX: 2, offsetY: 2, locked: true },
  bloom: { enabled: false, amount: 100, intensity: 1, blurScale: 1, threshold: 0.25, smoothing: 0.03 },
  hue: { enabled: false, amount: 100, hue: 3, saturation: 0 },
  brightness: { enabled: false, amount: 100, brightness: 0.25, contrast: 0 },
  vignette: { enabled: false, amount: 100, darkness: 1, offset: 0 },
  noise: { enabled: false, amount: 100 },
};

export const initialSceneDefaults: SceneSettingsConfig = {
  bgColor: "#0b1020",
  bgAlpha: "100%",
  showGrid: true,
  wireframe: false,
  fogEnabled: false,
  showAxisGuides: false,
  environment: {
    enabled: true,
    intensity: 1,
  },
  lights: {
    intensity: 0.75,
    color: "#ffffff",
    ambientEnabled: true,
    directionalEnabled: true,
    shadow: "Soft",
  },
  physics: {
    enabled: false,
    gravityY: -9.8,
    collisionType: "Mesh",
  },
};

export const initialFrameDefaults: FrameSettingsConfig = {
  mode: "responsive",
  preset: "responsive",
  width: 1920,
  height: 1080,
};

/** The ID of the camera every scene has: the one the user orbits. It can't be deleted. */
export const DEFAULT_CAMERA_PROFILE_ID = "personal";

export const DEFAULT_CAMERA_PROFILE: CameraProfile = {
  id: "personal",
  name: "Personal Camera",
  position: [0, 5, 10],
  target: [0, 0, 0],
  fov: 45,
  near: 0.1,
  far: 1000,
  zoom: 1,
};
