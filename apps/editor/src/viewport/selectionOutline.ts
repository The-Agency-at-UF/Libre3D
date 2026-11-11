/**
 * PURPOSE: An object's selection outline: a thin box around it that the editor shows while the
 * object is selected.
 *
 * INPUT: An object and the bounding box of its geometry, in the object's own space.
 * OUTPUT: The outline, a child of the object, kept in `object.userData.selectionOutline`.
 *
 * It's made hidden: ViewportCanvas shows and hides it as the selection changes. It's tagged
 * editor-only, so exports, thumbnails, and Play leave it out (editorOnly.ts).
 */

import * as THREE from "three";

// A thin wireframe box parented directly to the mesh, sized from the mesh's own
// geometry bounding box. Parenting it (rather than recomputing a world-space AABB
// every frame, e.g. THREE.BoxHelper) means it inherits the mesh's full transform for
// free — it stays a tight, correctly oriented box even when the object is rotated,
// matching Spline's selection indicator instead of a looser world-axis-aligned box.
function createSelectionOutline(boundingBox: THREE.Box3, color = 0xffffff): THREE.LineSegments {
  // An empty box (a path with nothing to draw) has a size of -Infinity; outline a point instead.
  const box = boundingBox.isEmpty() ? new THREE.Box3(new THREE.Vector3(), new THREE.Vector3()) : boundingBox;
  const size = new THREE.Vector3();
  box.getSize(size);
  const center = new THREE.Vector3();
  box.getCenter(center);

  const boxGeometry = new THREE.BoxGeometry(size.x, size.y, size.z);
  boxGeometry.translate(center.x, center.y, center.z);
  const edges = new THREE.EdgesGeometry(boxGeometry);
  boxGeometry.dispose();

  const material = new THREE.LineBasicMaterial({
    color,
    transparent: true,
    opacity: 0.9,
    depthTest: false, // always render on top, same convention TransformControls uses
  });

  const outline = new THREE.LineSegments(edges, material);
  outline.userData.editorOnly = true; // never exported — see hideEditorOnlyObjects
  outline.visible = false;
  outline.renderOrder = 999;
  outline.raycast = () => { }; // never an independent click/box-select target —
  // Raycaster doesn't check .visible, so this guards
  // against it being hit while hidden (see gizmo picker fix)
  return outline;
}

const outlineOf = (object: THREE.Object3D): THREE.LineSegments | undefined => object.userData.selectionOutline;

/** Gives `object` an outline the size of `boundingBox`, hidden. For an object that has none. */
export function attachSelectionOutline(object: THREE.Object3D, boundingBox: THREE.Box3, color?: number): THREE.LineSegments {
  const outline = createSelectionOutline(boundingBox, color);
  object.add(outline);
  object.userData.selectionOutline = outline;
  return outline;
}

/** Frees the outline's geometry and material. For an object that is being disposed with it. */
export function disposeSelectionOutline(object: THREE.Object3D): void {
  const outline = outlineOf(object);
  if (!outline) return;
  outline.geometry.dispose();
  (outline.material as THREE.Material).dispose();
}

/**
 * Gives `object` a new outline in place of the one it has, for a new bounding box or colour.
 * `keepVisibility` leaves the new one showing if the old one was (the object is still selected).
 */
export function replaceSelectionOutline(
  object: THREE.Object3D,
  boundingBox: THREE.Box3,
  { color, keepVisibility = false }: { color?: number; keepVisibility?: boolean } = {},
): THREE.LineSegments {
  const oldOutline = outlineOf(object);
  if (oldOutline) {
    object.remove(oldOutline);
    disposeSelectionOutline(object);
  }
  const outline = attachSelectionOutline(object, boundingBox, color);
  if (oldOutline && keepVisibility) outline.visible = oldOutline.visible;
  return outline;
}
