import * as THREE from "three";

/**
 * The entity under a point of the canvas: the deepest object tagged with an entity ID that's hit
 * first, or null on a miss. `targets` are the objects to try (their children too). Shared by
 * editor clicks (useViewportRaycaster) and Play's clicks (useViewportPlay). `skipEditorOnly`
 * ignores hits on the editor's own objects, such as a selection outline, which Play doesn't show
 * (raycasting doesn't check visibility, and a line is hit from up to a unit away).
 */
export const pickEntityAt = (
  raycaster: THREE.Raycaster,
  camera: THREE.Camera,
  canvas: HTMLCanvasElement,
  targets: THREE.Object3D[],
  clientX: number,
  clientY: number,
  skipEditorOnly = false,
): string | null => {
  const rect = canvas.getBoundingClientRect();
  const pointer = new THREE.Vector2(
    ((clientX - rect.left) / rect.width) * 2 - 1,
    -((clientY - rect.top) / rect.height) * 2 + 1,
  );
  raycaster.setFromCamera(pointer, camera);

  for (const intersection of raycaster.intersectObjects(targets, true)) {
    let hitObject: THREE.Object3D | null = intersection.object;
    let isEditorOnly = false;
    while (hitObject && !hitObject.userData.entityId) {
      isEditorOnly ||= !!hitObject.userData.editorOnly;
      hitObject = hitObject.parent;
    }
    if (skipEditorOnly && isEditorOnly) continue;
    return hitObject?.userData.entityId ?? null;
  }
  return null;
};
