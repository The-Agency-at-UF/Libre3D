import { useEffect, type RefObject } from "react";
import * as THREE from "three";
import type { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { useEditorStore } from "../../store/useEditorStore";
import type { ObjectManager } from "../ObjectManager";

/** Sent on window to move the orbit target to the selection, keeping the camera's angle and distance. */
export const CENTER_ON_SELECTED_EVENT = "libre3d-center-on-selected";
/** Sent on window to look at the selection straight on, from the front. */
export const ORIENTATE_TO_SELECTED_EVENT = "libre3d-orientate-to-selected";

// How far the default camera ([0, 5, 10], scene/defaults.ts) is from its target: √125. The front
// view stands this far back at 100% zoom.
const DEFAULT_CAMERA_DISTANCE = Math.sqrt(125);

// The middle of the selected objects' origins, in world space. Null when nothing is selected.
function selectionCenter(objectManager: ObjectManager): THREE.Vector3 | null {
  const selectedIds = useEditorStore.getState().selectedEntityIds;
  if (selectedIds.length === 0) return null;

  const box = new THREE.Box3();
  selectedIds.forEach((id) => {
    const object = objectManager.getObject(id);
    if (object) box.expandByPoint(object.getWorldPosition(new THREE.Vector3()));
  });
  return box.getCenter(new THREE.Vector3());
}

/**
 * Listens for the two "look at what's selected" events (the inspector's zoom menu, the hierarchy,
 * and a hotkey send them) and moves the editor's camera. The camera's new place reaches the store
 * the way an orbit does: through the orbit controls' change event.
 */
export function useCenterOnSelection(
  orbitControlsRef: RefObject<OrbitControls | null>,
  objectManager: ObjectManager,
  cameraRef: RefObject<THREE.Camera>,
): void {
  useEffect(() => {
    const handleCenterOnSelected = () => {
      const controls = orbitControlsRef.current;
      if (!controls) return;
      const center = selectionCenter(objectManager);
      if (!center) return;

      const camera = cameraRef.current;
      const offset = new THREE.Vector3().subVectors(camera.position, controls.target);
      controls.target.copy(center);
      camera.position.copy(center).add(offset);
      controls.update();
    };

    const handleOrientateToSelected = () => {
      const controls = orbitControlsRef.current;
      if (!controls) return;
      const center = selectionCenter(objectManager);
      if (!center) return;

      const camera = cameraRef.current;
      controls.target.copy(center);
      const currentZoom = useEditorStore.getState().viewportZoom || 100;
      camera.position.set(center.x, center.y, center.z + DEFAULT_CAMERA_DISTANCE * (100 / currentZoom));
      controls.update();
    };

    window.addEventListener(CENTER_ON_SELECTED_EVENT, handleCenterOnSelected);
    window.addEventListener(ORIENTATE_TO_SELECTED_EVENT, handleOrientateToSelected);
    return () => {
      window.removeEventListener(CENTER_ON_SELECTED_EVENT, handleCenterOnSelected);
      window.removeEventListener(ORIENTATE_TO_SELECTED_EVENT, handleOrientateToSelected);
    };
  }, [orbitControlsRef, objectManager, cameraRef]);
}
