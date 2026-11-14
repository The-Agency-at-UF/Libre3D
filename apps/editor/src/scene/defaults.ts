/**
 * PURPOSE: What a new scene starts with, and what a saved scene falls back to for a setting it
 * doesn't hold: the scene, post-processing, and frame settings, and the camera every scene has.
 *
 * Used by the editor's store (new scenes, and `loadScene` merging a saved scene over these) and by
 * the share-link viewer for a published scene. Imports nothing but types, so the viewer gets the
 * same values without loading the store.
 */

import type { CameraProfile, FrameSettingsConfig, PostProcessingConfig, SceneSettingsConfig } from "./types";

export const initialPostProcessingDefaults: PostProcessingConfig = {
  enabled: true,
  toneMap: "ACES Filmic",
  exposure: 0.00,
  bloom: {
    enabled: true,
    intensity: 40,
    threshold: 0.85,
    radius: 0.4,
  },
  ssao: {
    enabled: false,
    intensity: 25,
  },
  dof: {
    enabled: false,
    focusDistance: 10.0,
    bokeh: 0.30,
  },
  chromaticAberration: {
    enabled: false,
    intensity: 0,
  },
  motionBlur: {
    enabled: false,
    intensity: 0,
  },
  filmGrain: {
    enabled: false,
    intensity: 0,
  },
  vignette: {
    enabled: true,
    intensity: 15,
  },
  outline: {
    enabled: false,
    color: "5865F2",
  },
  colorGrading: {
    enabled: false,
    brightness: 0.00,
    contrast: 0.00,
    saturation: 0.00,
  },
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
