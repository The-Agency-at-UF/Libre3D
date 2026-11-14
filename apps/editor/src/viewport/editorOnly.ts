/**
 * PURPOSE: Hides the editor's own objects (anything tagged `userData.editorOnly`) for one render or
 * one export, and puts them back.
 *
 * INPUT: A scene. OUTPUT: A function that shows again exactly what this call hid.
 *
 * Used by Play and the share-link viewer (every frame), the gallery thumbnail, and the GLB export.
 * Its own module so the viewer doesn't load the exporter to use it.
 */

import type * as THREE from "three";

// The live scene the exporter reads is the *editor's* scene, so it also holds
// viewport furniture the user never asked to publish: the grid, directional-light
// helpers, selection outlines, the multi-select proxy and the transform gizmo.
// Left in, they end up as line/mesh nodes in every exported and published GLB.
// The light helper is the worst of them — three sets matrixAutoUpdate = false on
// it and drives it by matrix, so with `trs: true` the exporter reads its untouched
// position/quaternion/scale and writes the helper to the origin with no rotation,
// which is why it looked like the light moved between the editor and preview.
//
// Objects opt out by tagging themselves `userData.editorOnly` at creation. The
// export already runs with `onlyVisible: true`, so hiding them for the duration of
// the parse is enough to keep them out without touching the scene graph. The gallery
// thumbnail (viewport/thumbnailCapture.ts) hides them the same way for its render, and
// so does every Play frame (viewport/hooks/useViewportRenderer.ts).
export const hideEditorOnlyObjects = (scene: THREE.Scene): (() => void) => {
  const hidden: THREE.Object3D[] = [];

  scene.traverse((object) => {
    if (object.userData?.editorOnly && object.visible) {
      object.visible = false;
      hidden.push(object);
    }
  });

  return () => {
    for (const object of hidden) {
      object.visible = true;
    }
  };
};
