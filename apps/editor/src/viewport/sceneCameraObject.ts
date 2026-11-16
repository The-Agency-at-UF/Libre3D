/**
 * PURPOSE: A scene camera's object (decision tree §C3): an empty Object3D placed by the camera
 * entity's transform, and in the editor a wireframe frustum that shows where it looks and is what a
 * click selects.
 *
 * INPUT: The entity's lens (`SceneCameraSettings`), on build and on each sync.
 * OUTPUT: The object ObjectManager keeps for the entity. It draws nothing itself: only its gizmo,
 * which is editor-only (editorOnly.ts), so Play, the share-link viewer's frames, thumbnails, and
 * the export never show it. The viewer builds none (`withGizmo` false).
 *
 * The gizmo is a child, so moving, parenting, and posing the camera move it with no code of its
 * own. It carries no entity ID: a click on it walks up to the camera's, and Play's picking skips it
 * as editor-only (pickEntity.ts). It looks down -Z, as a Three camera does. A perspective camera's
 * frustum is drawn to a fixed depth (its far distance is usually far off-screen), or to `far` when
 * that is nearer; an orthographic one's at its real size.
 */

import * as THREE from "three";
import type { SceneCameraSettings } from "../scene/types";

/** How deep a perspective frustum is drawn, in world units, when `far` is beyond it. */
export const GIZMO_DEPTH = 1.5;
/** The width : height the gizmo draws (a camera's view takes the canvas's when it is looked through, C6). */
export const GIZMO_ASPECT = 16 / 9;

const COLOR = 0xffffff;
const SELECTED_COLOR = 0xfde047; // the light helper's selected colour

const sameSettings = (a: SceneCameraSettings, b: SceneCameraSettings) =>
  a.projection === b.projection && a.fov === b.fov && a.orthoSize === b.orthoSize && a.near === b.near && a.far === b.far;

type Corners = [THREE.Vector3, THREE.Vector3, THREE.Vector3, THREE.Vector3];

// The four corners of a rectangle `depth` in front of the camera, half as tall as `halfHeight`.
const rectangle = (halfHeight: number, depth: number): Corners => {
  const halfWidth = halfHeight * GIZMO_ASPECT;
  return [
    new THREE.Vector3(-halfWidth, halfHeight, -depth),
    new THREE.Vector3(halfWidth, halfHeight, -depth),
    new THREE.Vector3(halfWidth, -halfHeight, -depth),
    new THREE.Vector3(-halfWidth, -halfHeight, -depth),
  ];
};

const outline = (corners: Corners): THREE.Vector3[] => corners.flatMap((corner, index) => [corner, corners[(index + 1) % 4]]);

/** The gizmo's line segments (pairs of points) for a lens: exported for its tests. */
export const frustumSegments = (settings: SceneCameraSettings): THREE.Vector3[] => {
  const near = Math.max(0, settings.near);
  const segments: THREE.Vector3[] = [];
  let farCorners: Corners;

  if (settings.projection === "orthographic") {
    const half = Math.max(1e-3, settings.orthoSize);
    const depth = Math.max(near + 1e-3, Math.min(settings.far, GIZMO_DEPTH + near));
    const nearCorners = rectangle(half, near);
    farCorners = rectangle(half, depth);
    segments.push(...outline(nearCorners), ...outline(farCorners));
    nearCorners.forEach((corner, index) => segments.push(corner, farCorners[index]));
  } else {
    const slope = Math.tan(THREE.MathUtils.degToRad(Math.min(179, Math.max(1, settings.fov))) / 2);
    const depth = Math.max(1e-3, Math.min(settings.far, GIZMO_DEPTH));
    farCorners = rectangle(slope * depth, depth);
    // Edges from the lens to the far rectangle, the rectangle, and the near plane where it's in front of it.
    const apex = new THREE.Vector3();
    farCorners.forEach((corner) => segments.push(apex, corner));
    segments.push(...outline(farCorners));
    if (near > 0 && near < depth) segments.push(...outline(rectangle(slope * near, near)));
  }

  // A triangle on the top edge, which way is up.
  const [topLeft, topRight] = farCorners;
  const width = topRight.x - topLeft.x;
  const peak = new THREE.Vector3(0, topLeft.y + width * 0.15, topLeft.z);
  const left = new THREE.Vector3(-width * 0.15, topLeft.y, topLeft.z);
  const right = new THREE.Vector3(width * 0.15, topLeft.y, topLeft.z);
  segments.push(left, peak, peak, right);

  return segments;
};

/** The frustum lines. Rebuilt in place when the lens changes; the object keeps its place in the scene. */
class CameraGizmo extends THREE.LineSegments<THREE.BufferGeometry, THREE.LineBasicMaterial> {
  private settings: SceneCameraSettings;

  constructor(settings: SceneCameraSettings) {
    super(new THREE.BufferGeometry().setFromPoints(frustumSegments(settings)), new THREE.LineBasicMaterial({ color: COLOR }));
    this.settings = { ...settings };
    this.userData.editorOnly = true; // never exported, hidden in Play and thumbnails: editorOnly.ts
  }

  /** Redraws for a new lens. Returns whether it changed. */
  setSettings(settings: SceneCameraSettings): boolean {
    if (sameSettings(this.settings, settings)) return false;
    this.settings = { ...settings };
    this.geometry.dispose();
    this.geometry = new THREE.BufferGeometry().setFromPoints(frustumSegments(settings));
    return true;
  }

  dispose(): void {
    this.geometry.dispose();
    this.material.dispose();
  }
}

export class SceneCameraObject extends THREE.Object3D {
  readonly isSceneCamera = true;
  /** The frustum, or null in the share-link viewer. */
  readonly gizmo: CameraGizmo | null;

  constructor(settings: SceneCameraSettings, withGizmo: boolean) {
    super();
    this.gizmo = withGizmo ? new CameraGizmo(settings) : null;
    if (this.gizmo) this.add(this.gizmo);
  }

  /** Applies the entity's lens: only the gizmo shows it until the camera can be looked through (C6). */
  setSettings(settings: SceneCameraSettings): void {
    this.gizmo?.setSettings(settings);
  }

  /** The gizmo in the selection colour, or back. */
  setSelected(selected: boolean): void {
    this.gizmo?.material.color.set(selected ? SELECTED_COLOR : COLOR);
  }

  dispose(): void {
    this.gizmo?.dispose();
  }
}
