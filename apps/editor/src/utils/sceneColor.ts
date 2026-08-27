// Scene colours are stored as user-entered strings and may arrive without the
// leading "#" (the colour inputs write raw hex). Anything that paints with
// sceneSettings.bgColor — the Three scene, the fog, the preview surface — has to
// normalize the same way or they drift apart on the same stored value.
export const DEFAULT_SCENE_BG_COLOR = "#0b1020";

export function getSafeColor(color: string): string {
  const value = color || DEFAULT_SCENE_BG_COLOR;
  return value.startsWith("#") ? value : `#${value}`;
}
