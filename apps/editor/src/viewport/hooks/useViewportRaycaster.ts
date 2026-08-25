import { useEffect } from "react";
import * as THREE from "three";
import { useEditorStore } from "../../store/useEditorStore";
import { getSelectionRootId } from "../../store/entityIndex";
import type { TransformControls } from "three/examples/jsm/controls/TransformControls.js";

// Matches the existing click-tolerance below (`dist < 10`) so a genuine click with a
// little accidental jitter still registers as a click, not a box-select drag.
const DRAG_THRESHOLD_PX = 10;

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
    const worldPos = new THREE.Vector3();
    const camSpace = new THREE.Vector3();
    let pointerDownTime = 0;
    const pointerDownPos = new THREE.Vector2();
    let clickedGizmo = false;

    // Plain left-drag on empty canvas is otherwise a dead gesture (OrbitControls only
    // rotates/pans while Alt/Space are held), so it's free to repurpose for box-select.
    // Box-select state below only lives between pointerdown and pointerup.
    let isSpacePressed = false;
    let isDragSelecting = false;
    let marqueeEl: HTMLDivElement | null = null;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space") isSpacePressed = true;
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === "Space") isSpacePressed = false;
    };

    const ensureMarqueeEl = (): HTMLDivElement | null => {
      const container = renderer.domElement.parentElement;
      if (!container) return null;
      if (!marqueeEl) {
        marqueeEl = document.createElement("div");
        marqueeEl.className = "viewport-marquee-select";
        container.appendChild(marqueeEl);
      }
      return marqueeEl;
    };

    const updateMarqueeRect = (currentX: number, currentY: number) => {
      const el = ensureMarqueeEl();
      const container = renderer.domElement.parentElement;
      if (!el || !container) return;
      const containerRect = container.getBoundingClientRect();
      const startX = pointerDownPos.x - containerRect.left;
      const startY = pointerDownPos.y - containerRect.top;
      const curX = currentX - containerRect.left;
      const curY = currentY - containerRect.top;

      el.style.left = `${Math.min(startX, curX)}px`;
      el.style.top = `${Math.min(startY, curY)}px`;
      el.style.width = `${Math.abs(curX - startX)}px`;
      el.style.height = `${Math.abs(curY - startY)}px`;
    };

    const removeMarqueeEl = () => {
      marqueeEl?.remove();
      marqueeEl = null;
    };

    const selectWithinRect = (endX: number, endY: number, event: PointerEvent) => {
      const minX = Math.min(pointerDownPos.x, endX);
      const maxX = Math.max(pointerDownPos.x, endX);
      const minY = Math.min(pointerDownPos.y, endY);
      const maxY = Math.max(pointerDownPos.y, endY);

      const camera = cameraRef.current;
      const rect = renderer.domElement.getBoundingClientRect();
      const hitIds: string[] = [];

      meshMap.forEach((obj, entityId) => {
        if (!obj.visible || obj.userData.locked) return;

        obj.getWorldPosition(worldPos);

        // Skip anything behind the camera — project() doesn't clip, so a point behind
        // the camera can still land inside the NDC range after the perspective divide's
        // sign flip, which would otherwise let box-select grab off-screen objects.
        camSpace.copy(worldPos).applyMatrix4(camera.matrixWorldInverse);
        if (camSpace.z > 0) return;

        const projected = worldPos.clone().project(camera);
        const screenX = rect.left + ((projected.x + 1) / 2) * rect.width;
        const screenY = rect.top + ((1 - projected.y) / 2) * rect.height;

        if (screenX >= minX && screenX <= maxX && screenY >= minY && screenY <= maxY) {
          hitIds.push(entityId);
        }
      });

      const mode = event.shiftKey ? "add" : event.ctrlKey || event.metaKey ? "subtract" : "replace";
      useEditorStore.getState().selectEntities(hitIds, mode);
    };

    const onPointerDown = (event: PointerEvent) => {
      if (useEditorStore.getState().isPreviewMode) return;
      // Left button only — middle-drag pans and right-click shouldn't box-select or pick.
      if (event.button !== 0) return;
      pointerDownTime = Date.now();
      pointerDownPos.set(event.clientX, event.clientY);
      clickedGizmo = transformControlsRef.current?.axis !== null;
      isDragSelecting = false;
      renderer.domElement.addEventListener("pointermove", onPointerMove);
    };

    const onPointerMove = (event: PointerEvent) => {
      // Don't hijack a gizmo drag or a camera rotate/pan gesture into a box-select.
      if (clickedGizmo || event.altKey || isSpacePressed) return;

      const dist = pointerDownPos.distanceTo(new THREE.Vector2(event.clientX, event.clientY));
      if (!isDragSelecting && dist > DRAG_THRESHOLD_PX) {
        isDragSelecting = true;
      }
      if (isDragSelecting) {
        updateMarqueeRect(event.clientX, event.clientY);
      }
    };

    const onPointerUp = (event: PointerEvent) => {
      // Only the left button drives box-select / click-pick (see onPointerDown).
      if (event.button !== 0) return;
      renderer.domElement.removeEventListener("pointermove", onPointerMove);

      if (isDragSelecting) {
        selectWithinRect(event.clientX, event.clientY, event);
        isDragSelecting = false;
        removeMarqueeEl();
        return;
      }

      const duration = Date.now() - pointerDownTime;
      const dist = pointerDownPos.distanceTo(new THREE.Vector2(event.clientX, event.clientY));

      if (duration < 500 && dist < 10) {
        if (clickedGizmo) return;

        const hitEntityId = pickEntityIdAt(event.clientX, event.clientY);
        if (hitEntityId) {
          // Viewport clicks select the outermost container the hit entity belongs
          // to — the whole imported model, or the outermost enclosing group — not
          // the deepest child under the cursor. A specific child is reached by
          // double-clicking (see onDoubleClick) or via the hierarchy panel.
          const state = useEditorStore.getState();
          state.selectEntity(getSelectionRootId(state.entities, hitEntityId), event.shiftKey);
          return;
        }

        useEditorStore.getState().selectEntity(null, event.shiftKey);
      }
    };

    // Resolves the entity id of the deepest tagged object under the cursor, or
    // null on a miss. Shared by click (which bubbles to the import root) and
    // double-click (which keeps the exact child).
    const pickEntityIdAt = (clientX: number, clientY: number): string | null => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x =  ((clientX - rect.left) / rect.width)  * 2 - 1;
      mouse.y = -((clientY - rect.top)  / rect.height) * 2 + 1;

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
      if (intersects.length === 0) return null;

      let hitObject: THREE.Object3D | null = intersects[0].object;
      while (hitObject && !hitObject.userData.entityId) {
        hitObject = hitObject.parent;
      }
      return hitObject?.userData.entityId ?? null;
    };

    // Double-click drills into the exact child under the cursor (the deepest
    // tagged node), bypassing the click handler's bubble-to-root. A no-op on a
    // miss so an empty double-click doesn't clear the current selection.
    const onDoubleClick = (event: MouseEvent) => {
      if (useEditorStore.getState().isPreviewMode) return;
      if (transformControlsRef.current?.axis) return;
      const hitEntityId = pickEntityIdAt(event.clientX, event.clientY);
      if (hitEntityId) {
        useEditorStore.getState().selectEntity(hitEntityId, event.shiftKey);
      }
    };

    renderer.domElement.addEventListener("pointerdown", onPointerDown);
    renderer.domElement.addEventListener("pointerup",   onPointerUp);
    renderer.domElement.addEventListener("dblclick",    onDoubleClick);
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      renderer.domElement.removeEventListener("pointerdown", onPointerDown);
      renderer.domElement.removeEventListener("pointerup",   onPointerUp);
      renderer.domElement.removeEventListener("dblclick",    onDoubleClick);
      renderer.domElement.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      removeMarqueeEl();
    };
    // camera is read via ref each event — no need to re-register listeners on switch.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rendererRef, meshMap, transformControlsRef]);
}
