/**
 * PURPOSE: How far a new Depth layer's ramp should reach on an object: its mesh's farthest point.
 *
 * A Depth layer is drawn per pixel (viewport/layerSources.ts); its maths' CPU twins are in
 * scene/layerStack.ts (depthRampPosition, sampleRamp).
 */

import type * as THREE from "three";

/**
 * Where a new Depth layer's ramp should end on `geometry`: its farthest vertex from the object's
 * origin, in hundredths, so the whole ramp lands on the object (its outer ring through the farthest
 * corner) instead of a fixed distance that runs out past small objects. Null with no vertices.
 */
export const depthReach = (geometry: THREE.BufferGeometry): number | null => {
  const position = geometry.getAttribute("position");
  if (!position) return null;
  let farthest = 0;
  for (let i = 0; i < position.count; i += 1) {
    farthest = Math.max(farthest, Math.hypot(position.getX(i), position.getY(i), position.getZ(i)));
  }
  return farthest > 0 ? Math.max(0.01, Math.round(farthest * 100) / 100) : null;
};
