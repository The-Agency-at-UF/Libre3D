/**
 * PURPOSE: Where a directional light shines: from where it is toward the world origin, as Spline's
 * does. Its rotation can be edited, but changes nothing.
 *
 * `OriginTarget` is the light's target. It's the light's child at (0, 0, -1), the only wiring
 * GLTFExporter takes, but its world matrix is always the world origin, so the renderer (which reads
 * the target's world position) aims the light there whatever the light's rotation, during a drag
 * of the rotate gizmo too. GLTFExporter writes a light's direction from its rotation instead, so
 * `aimLightsAtOrigin` turns each light toward the origin for the length of an export.
 *
 * No store, React or DOM here: the share-link viewer draws with this too.
 */

import * as THREE from "three";

export class OriginTarget extends THREE.Object3D {
  updateMatrixWorld(force?: boolean): void {
    this.matrixWorld.identity();
    this.matrixWorldNeedsUpdate = false;
    for (const child of this.children) child.updateMatrixWorld(force);
  }

  updateWorldMatrix(_updateParents: boolean, updateChildren: boolean): void {
    this.matrixWorld.identity();
    if (updateChildren) for (const child of this.children) child.updateWorldMatrix(false, true);
  }
}

/** Turns every directional light in `scene` toward the world origin, as it shines; returns the undo. */
export const aimLightsAtOrigin = (scene: THREE.Object3D): (() => void) => {
  const restores: Array<() => void> = [];
  scene.traverse((object) => {
    if (!(object instanceof THREE.DirectionalLight)) return;
    const turned = object.quaternion.clone();
    object.updateMatrixWorld();
    object.lookAt(0, 0, 0);
    object.updateMatrixWorld();
    restores.push(() => {
      object.quaternion.copy(turned);
      object.updateMatrixWorld();
    });
  });
  return () => restores.forEach((restore) => restore());
};
