import { useEffect } from "react";
import * as THREE from "three";
import { useEditorStore } from "../../store/useEditorStore";
import type { TransformControls } from "three/examples/jsm/controls/TransformControls.js";

export function useViewportRaycaster(
  // Accept a ref so raycasting always uses the current active camera.
  cameraRef: React.RefObject<THREE.Camera>,
  rendererRef: React.RefObject<THREE.WebGLRenderer | null>,
  meshMap: Map<string, THREE.Object3D>,
  transformControlsRef: React.RefObject<TransformControls | null>
) {
  useEffect(() => {
    const renderer = rendererRef.current;
    if (!renderer) return;

    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    let pointerDownTime = 0;
    const pointerDownPos = new THREE.Vector2();
    let clickedGizmo = false;

    const onPointerDown = (event: PointerEvent) => {
      pointerDownTime = Date.now();
      pointerDownPos.set(event.clientX, event.clientY);
      clickedGizmo = transformControlsRef.current?.axis !== null;
    };

    const onPointerUp = (event: PointerEvent) => {
      const duration = Date.now() - pointerDownTime;
      const dist = pointerDownPos.distanceTo(new THREE.Vector2(event.clientX, event.clientY));

      if (duration < 500 && dist < 10) {
        if (clickedGizmo) return;

        const rect = renderer.domElement.getBoundingClientRect();
        mouse.x =  ((event.clientX - rect.left) / rect.width)  * 2 - 1;
        mouse.y = -((event.clientY - rect.top)  / rect.height) * 2 + 1;

        // Always ray-cast with the current active camera.
        raycaster.setFromCamera(mouse, cameraRef.current);

        const targets: THREE.Object3D[] = [];
        meshMap.forEach((obj) => {
          if (obj.visible && !obj.userData.locked) {
            targets.push(obj);
            if (obj.userData.helper) {
              targets.push(obj.userData.helper);
            }
          }
        });

        const intersects = raycaster.intersectObjects(targets, true);

        if (intersects.length > 0) {
          let hitObject: THREE.Object3D | null = intersects[0].object;
          while (hitObject && !hitObject.userData.entityId) {
            hitObject = hitObject.parent;
          }
          if (hitObject && hitObject.userData.entityId) {
            useEditorStore.getState().selectEntity(hitObject.userData.entityId, event.shiftKey);
            return;
          }
        }

        useEditorStore.getState().selectEntity(null, event.shiftKey);
      }
    };

    renderer.domElement.addEventListener("pointerdown", onPointerDown);
    renderer.domElement.addEventListener("pointerup",   onPointerUp);

    return () => {
      renderer.domElement.removeEventListener("pointerdown", onPointerDown);
      renderer.domElement.removeEventListener("pointerup",   onPointerUp);
    };
    // camera is read via ref each event — no need to re-register listeners on switch.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rendererRef, meshMap, transformControlsRef]);
}
