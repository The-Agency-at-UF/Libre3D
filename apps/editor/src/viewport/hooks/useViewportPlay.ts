import { useEffect } from "react";
import * as THREE from "three";
import { resolveState } from "../../animation/objectStates";
import { SceneRuntime } from "../../animation/sceneRuntime";
import { selectViewedObjectState, useEditorStore } from "../../store/useEditorStore";
import type { ObjectManager } from "../ObjectManager";
import { pickEntityAt } from "../pickEntity";

/**
 * Play runs the scene's events (notes/animation-plan.md, A3) in the editor's viewport.
 *
 * When Play starts, the next frame takes a snapshot of the scene into a SceneRuntime and fires its
 * Start events; every frame after moves its time on. Each frame, right before the render, the
 * objects it has moved are put in its poses (ObjectManager.applyPose). The Three objects move, the
 * store never does: no React renders and no undo steps per frame. Poses go on every frame, so the
 * first Play frame already shows where Start events begin, and the entity sync putting objects back
 * in Base between frames never shows. On Stop the runtime is dropped and each moved object goes
 * back to the state it's shown in while editing.
 *
 * Clicks in Play (left button, without Alt or Space, which orbit and pan) fire Mouse Down events,
 * and the cursor is a pointer over objects that have one. Locked objects count: locking is for
 * editing.
 *
 * `frameRef` is filled with the per-frame function, which useViewportRenderer calls before each
 * render (its `onRender`).
 */
export function useViewportPlay(
  frameRef: React.MutableRefObject<(() => void) | null>,
  cameraRef: React.RefObject<THREE.Camera>,
  rendererRef: React.RefObject<THREE.WebGLRenderer | null>,
  objectManager: ObjectManager,
) {
  useEffect(() => {
    const renderer = rendererRef.current;
    if (!renderer) return;

    const canvas = renderer.domElement;
    const raycaster = new THREE.Raycaster();
    let runtime: SceneRuntime | null = null;
    let lastFrameTime = 0;
    let hoverPoint: { x: number; y: number } | null = null;
    let isSpacePressed = false;

    // On the canvas's container, so the orbit controls' own cursor on the canvas (grab while Space
    // is held) still wins.
    const setCursor = (cursor: string) => {
      const container = canvas.parentElement;
      if (container && container.style.cursor !== cursor) container.style.cursor = cursor;
    };

    const pick = (clientX: number, clientY: number) => {
      const targets = [...objectManager.getMeshes().values()].filter((object) => object.visible);
      return pickEntityAt(raycaster, cameraRef.current, canvas, targets, clientX, clientY, true);
    };

    frameRef.current = () => {
      if (!useEditorStore.getState().isPreviewMode) return;

      const now = performance.now();
      if (runtime) {
        runtime.tick((now - lastFrameTime) / 1000);
      } else {
        const { entities, animation } = useEditorStore.getState();
        runtime = new SceneRuntime({ entities, animation });
        runtime.start();
      }
      lastFrameTime = now;

      // At most one hover test a frame, against what the last frame showed.
      if (hoverPoint) {
        const entityId = runtime.hasClickEvents ? pick(hoverPoint.x, hoverPoint.y) : null;
        setCursor(entityId && runtime.clickOwnerOf(entityId) ? "pointer" : "");
        hoverPoint = null;
      }

      runtime.poses().forEach((pose, entityId) => objectManager.applyPose(entityId, pose));
    };

    // Play started or stopped. The entity sync also puts objects back when it re-runs on Stop, but
    // only after React renders, which can be a frame late.
    const unsubscribe = useEditorStore.subscribe(
      (state) => state.isPreviewMode,
      () => {
        const store = useEditorStore.getState();
        runtime?.poses().forEach((_pose, entityId) => {
          const entity = store.entities.find((candidate) => candidate.id === entityId);
          if (entity) objectManager.applyPose(entityId, resolveState(entity, selectViewedObjectState(store, entityId)));
        });
        runtime = null;
        hoverPoint = null;
        setCursor("");
      },
    );

    const onPointerDown = (event: PointerEvent) => {
      if (!runtime || !useEditorStore.getState().isPreviewMode) return;
      if (event.button !== 0 || event.altKey || isSpacePressed) return;

      const entityId = pick(event.clientX, event.clientY);
      if (entityId) runtime.click(entityId);
    };

    const onPointerMove = (event: PointerEvent) => {
      if (runtime) hoverPoint = { x: event.clientX, y: event.clientY };
    };

    const onPointerLeave = () => {
      hoverPoint = null;
      setCursor("");
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.code === "Space") isSpacePressed = true;
    };
    const onKeyUp = (event: KeyboardEvent) => {
      if (event.code === "Space") isSpacePressed = false;
    };
    const onBlur = () => {
      isSpacePressed = false;
    };

    canvas.addEventListener("pointerdown", onPointerDown);
    canvas.addEventListener("pointermove", onPointerMove);
    canvas.addEventListener("pointerleave", onPointerLeave);
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    window.addEventListener("blur", onBlur);

    return () => {
      frameRef.current = null;
      unsubscribe();
      canvas.removeEventListener("pointerdown", onPointerDown);
      canvas.removeEventListener("pointermove", onPointerMove);
      canvas.removeEventListener("pointerleave", onPointerLeave);
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      window.removeEventListener("blur", onBlur);
      setCursor("");
    };
  }, [frameRef, cameraRef, rendererRef, objectManager]);
}
