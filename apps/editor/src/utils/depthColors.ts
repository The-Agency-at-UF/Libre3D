/**
 * PURPOSE: Paints a Depth layer (store/useEditorStore.ts's DepthLayer) onto a geometry as vertex
 * colours, so the editor, an exported GLB (COLOR_0) and a published scene all show the same thing.
 *
 * A vertex's place on the ramp is its distance from the layer's origin in the object's own space,
 * straight out (radial) or along the direction (linear), between `near` (0) and `far` (1). The ramp
 * blends each stop into the next as Spline's does: in order, each blend clamped to its own span,
 * eased when `smooth`. Blends happen in sRGB (as the stops are picked) and are then converted to
 * the linear colours vertex colours hold. The result goes over the Color layer's colour by the
 * Depth layer's opacity; the material's own colour is then white (see ObjectManager).
 *
 * How smooth it looks depends on the geometry's vertices: tubes, spheres and models have plenty, a
 * cube or a flat shape's face very few.
 */

import * as THREE from "three";
import type { DepthLayer, MaterialLayer } from "../store/useEditorStore";

export const MAX_DEPTH_STOPS = 10;

type RGB = [number, number, number];

/** What a mesh is painted with, or null when it has no enabled Depth layer. */
export interface DepthPaint {
  layer: DepthLayer;
  base: string; // the Color layer's colour, under the depth colours
}

export const depthPaintOf = (layers: MaterialLayer[] | undefined): DepthPaint | null => {
  const layer = layers?.find((each): each is DepthLayer => each.type === "depth" && each.enabled);
  if (!layer) return null;
  const color = layers?.find((each) => each.type === "color");
  return { layer, base: color?.type === "color" ? color.color : "#ffffff" };
};

const clamp01 = (value: number) => Math.min(1, Math.max(0, value));

/** Where a point in the object's own space falls on the ramp, 0-1. */
export const depthRampPosition = (layer: DepthLayer, x: number, y: number, z: number): number => {
  const [ox, oy, oz] = layer.origin;
  const dx = x - ox;
  const dy = y - oy;
  const dz = z - oz;
  let distance: number;
  if (layer.gradientType === "linear") {
    const [ax, ay, az] = layer.direction;
    const length = Math.hypot(ax, ay, az) || 1;
    distance = (dx * ax + dy * ay + dz * az) / length;
  } else {
    distance = Math.hypot(dx, dy, dz);
  }
  const span = layer.far - layer.near;
  if (span <= 0) return distance >= layer.near ? 1 : 0;
  return clamp01((distance - layer.near) / span);
};

const hexToSrgb = (hex: string): RGB => {
  const color = new THREE.Color(hex);
  color.convertLinearToSRGB();
  return [color.r, color.g, color.b];
};

/** The ramp's colour (sRGB, 0-1) at `t`. */
export const sampleDepthRamp = (layer: DepthLayer, t: number): RGB => {
  const stops = [...layer.stops].sort((a, b) => a.position - b.position).slice(0, MAX_DEPTH_STOPS);
  if (stops.length === 0) return [1, 1, 1];
  const colors = stops.map((stop) => hexToSrgb(stop.color));
  const result: RGB = [...colors[0]];
  for (let i = 1; i < stops.length; i++) {
    const from = stops[i - 1].position;
    const span = stops[i].position - from;
    let amount = span !== 0 ? clamp01((t - from) / span) : t >= from ? 1 : 0;
    if (layer.smooth) amount = amount * amount * (3 - 2 * amount);
    for (let c = 0; c < 3; c++) result[c] += (colors[i][c] - result[c]) * amount;
  }
  return result;
};

/** The ramp's colour at `t` as a hex string, for a new stop placed there. */
export const depthRampHex = (layer: DepthLayer, t: number): string => {
  const [r, g, b] = sampleDepthRamp(layer, t);
  return `#${new THREE.Color().setRGB(r, g, b, THREE.SRGBColorSpace).getHexString()}`;
};

const scratch = new THREE.Vector3();
const scratchColor = new THREE.Color();

/**
 * Writes the paint as `geometry`'s colour attribute. `toObject` takes the geometry's positions into
 * the object's space, for a part placed inside it (a path's end caps). A colour attribute the
 * geometry came with (an imported model's) is kept aside, for clearDepthColors to put back.
 */
export const paintDepthColors = (geometry: THREE.BufferGeometry, paint: DepthPaint, toObject?: THREE.Matrix4): void => {
  const position = geometry.getAttribute("position");
  if (!position) return;
  if (!geometry.userData.depthPainted) {
    geometry.userData.depthOriginalColor = geometry.getAttribute("color") ?? null;
    geometry.userData.depthPainted = true;
  }

  const base = hexToSrgb(paint.base);
  const { opacity } = paint.layer;
  const existing = geometry.getAttribute("color");
  const colors =
    existing && existing !== geometry.userData.depthOriginalColor && existing.count === position.count && existing.itemSize === 3
      ? (existing as THREE.BufferAttribute)
      : new THREE.BufferAttribute(new Float32Array(position.count * 3), 3);

  for (let i = 0; i < position.count; i++) {
    scratch.fromBufferAttribute(position, i);
    if (toObject) scratch.applyMatrix4(toObject);
    const ramp = sampleDepthRamp(paint.layer, depthRampPosition(paint.layer, scratch.x, scratch.y, scratch.z));
    scratchColor.setRGB(
      base[0] + (ramp[0] - base[0]) * opacity,
      base[1] + (ramp[1] - base[1]) * opacity,
      base[2] + (ramp[2] - base[2]) * opacity,
      THREE.SRGBColorSpace,
    );
    colors.setXYZ(i, scratchColor.r, scratchColor.g, scratchColor.b);
  }
  colors.needsUpdate = true;
  if (colors !== existing) geometry.setAttribute("color", colors);
};

/** Takes the paint off again, putting back any colour attribute the geometry came with. */
export const clearDepthColors = (geometry: THREE.BufferGeometry): void => {
  if (!geometry.userData.depthPainted) return;
  const original = geometry.userData.depthOriginalColor as THREE.BufferAttribute | null;
  if (original) geometry.setAttribute("color", original);
  else geometry.deleteAttribute("color");
  delete geometry.userData.depthPainted;
  delete geometry.userData.depthOriginalColor;
  delete geometry.userData.depthKey;
};

/**
 * Paints `geometry` (or clears it, for null), skipping the work when it was last painted with the
 * same `key` (ObjectManager syncs every object on every store change, gizmo drags included).
 */
export const syncDepthColors = (geometry: THREE.BufferGeometry, paint: DepthPaint | null, key: string | null): void => {
  if (!paint || !key) {
    clearDepthColors(geometry);
    return;
  }
  if (geometry.userData.depthKey === key) return;
  paintDepthColors(geometry, paint);
  geometry.userData.depthKey = key;
};
