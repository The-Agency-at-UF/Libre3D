/**
 * PURPOSE: Remembers where an object is in its Base State while the viewport shows it in another
 * pose (a state being viewed, or where Play has moved it), so exports and the gallery thumbnail can
 * show every object in Base.
 *
 * INPUT: The Three objects ObjectManager poses. OUTPUT: `showBasePoses` puts a scene in Base and
 * returns what puts it back.
 *
 * Its own module so ObjectManager, which the share-link viewer uses too, doesn't load the exporter.
 */

import type * as THREE from "three";
import { PathMesh } from "../paths/PathMesh";

// The editor shows the selected object in the state being viewed by moving its Three object
// (ObjectManager.applyPose), so clicks, the selection outline, and the gizmo all follow it. Exports
// and the gallery thumbnail read that same scene and show every object in Base: each posed object's
// Base transform (and a path's Base trim) is kept here and put back for them. A pose's colour and
// opacity are on the object's material, which this module knows nothing of: ObjectManager hands in
// what shows the Base ones (`rememberBaseLook`). A WeakMap rather than userData, which the exporter
// writes into the file.
interface BasePose {
  position: THREE.Vector3;
  quaternion: THREE.Quaternion;
  scale: THREE.Vector3;
  trim?: [number, number];
  // Shows the object's Base colour and opacity, and returns what shows the pose's again.
  showBaseLook?: () => () => void;
}

const basePoses = new WeakMap<THREE.Object3D, BasePose>();

/** Call before posing an object that's still in Base. */
export const rememberBasePose = (object: THREE.Object3D): void => {
  if (basePoses.has(object)) return;
  basePoses.set(object, {
    position: object.position.clone(),
    quaternion: object.quaternion.clone(),
    scale: object.scale.clone(),
    ...(object instanceof PathMesh ? { trim: object.getTrim() } : null),
  });
};

/** For an object whose pose changed its colour or opacity: how to show its Base ones (after rememberBasePose). */
export const rememberBaseLook = (object: THREE.Object3D, showBaseLook: () => () => void): void => {
  const base = basePoses.get(object);
  if (base) base.showBaseLook = showBaseLook;
};

/** Call when an object is put back in Base. */
export const forgetBasePose = (object: THREE.Object3D): void => {
  basePoses.delete(object);
};

/** Puts every posed object in Base; returns what puts them back. */
export const showBasePoses = (scene: THREE.Scene): (() => void) => {
  const restores: (() => void)[] = [];

  scene.traverse((object) => {
    const base = basePoses.get(object);
    if (!base) return;

    const posed = { position: object.position.clone(), quaternion: object.quaternion.clone(), scale: object.scale.clone() };
    object.position.copy(base.position);
    object.quaternion.copy(base.quaternion);
    object.scale.copy(base.scale);
    const path = object instanceof PathMesh && base.trim ? { mesh: object, posedTrim: object.getTrim() } : null;
    path?.mesh.setTrim(...base.trim!);
    const restoreLook = base.showBaseLook?.();
    restores.push(() => {
      restoreLook?.();
      object.position.copy(posed.position);
      object.quaternion.copy(posed.quaternion);
      object.scale.copy(posed.scale);
      path?.mesh.setTrim(...path.posedTrim);
    });
  });

  return () => restores.forEach((restore) => restore());
};
