import { useEffect } from "react";
import * as THREE from "three";
import { resolveState } from "../../animation/objectStates";
import { SceneRuntime } from "../../animation/sceneRuntime";
import { previewTiming, type TransitionAction } from "../../animation/transitions";
import { selectViewedObjectState, useEditorStore, type EditorState } from "../../store/useEditorStore";
import type { ObjectManager } from "../ObjectManager";
import { pickEntityAt } from "../pickEntity";

// A runtime running in the viewport: Play's, or the ▶ preview of one transition. A preview stops
// when what it was started from changes: an edit (undo included) or another selection.
interface Session {
  runtime: SceneRuntime;
  preview: boolean;
  entities: EditorState["entities"];
  animation: EditorState["animation"];
  selection: EditorState["selectedEntityIds"];
}

const findAction = (state: EditorState, actionId: string): TransitionAction | undefined => {
  for (const event of Object.values(state.animation.events)) {
    const action = event.actions.find((candidate) => candidate.id === actionId);
    if (action) return action;
  }
  return undefined;
};

/**
 * Play runs the scene's events (notes/animation-plan.md, A3) in the editor's viewport, and the Edit
 * Event panel's ▶ plays one transition there.
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
 * The ▶ preview (`previewingActionId`) works the same way outside Play, for one transition: without
 * its Delay and run once (there and back for a ping-pong loop), starting from the state its target
 * is shown in, then back to that state. It stops early on any edit, another selection, Play (which
 * clears it), or ■.
 * The gizmo is detached meanwhile (ViewportCanvas), so a drag can't save a pose it's showing.
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
    let session: Session | null = null;
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

    // Each object the runtime moved goes back to the state it's shown in while editing. The entity
    // sync does the same when it next runs, but only after React renders, which can be a frame late.
    const endSession = () => {
      if (!session) return;
      const store = useEditorStore.getState();
      session.runtime.poses().forEach((_pose, entityId) => {
        const entity = store.entities.find((candidate) => candidate.id === entityId);
        if (entity) objectManager.applyPose(entityId, resolveState(entity, selectViewedObjectState(store, entityId)));
      });
      session = null;
      hoverPoint = null;
      setCursor("");
    };

    const startSession = (store: EditorState, preview: boolean): SceneRuntime => {
      const runtime = new SceneRuntime({ entities: store.entities, animation: store.animation });
      session = { runtime, preview, entities: store.entities, animation: store.animation, selection: store.selectedEntityIds };
      return runtime;
    };

    // The preview's runtime, started on its action, or null when there's nothing it can play.
    const startPreview = (store: EditorState, actionId: string): SceneRuntime | null => {
      const action = findAction(store, actionId);
      const target = action && store.entities.find((entity) => entity.id === action.targetId);
      if (!action || !target) return null;

      const runtime = startSession(store, true);
      runtime.place(target.id, resolveState(target, selectViewedObjectState(store, target.id)));
      return runtime.run(previewTiming(action)) ? runtime : null;
    };

    frameRef.current = () => {
      const store = useEditorStore.getState();
      const now = performance.now();
      let runtime: SceneRuntime | null;

      if (store.isPreviewMode) {
        if (session?.preview) endSession();
        if (session) {
          runtime = session.runtime;
          runtime.tick((now - lastFrameTime) / 1000);
        } else {
          runtime = startSession(store, false);
          runtime.start();
        }
      } else if (store.previewingActionId) {
        if (session && !session.preview) endSession();
        if (session) {
          const changed =
            store.entities !== session.entities ||
            store.animation !== session.animation ||
            store.selectedEntityIds !== session.selection;
          runtime = changed ? null : session.runtime;
          runtime?.tick((now - lastFrameTime) / 1000);
        } else {
          runtime = startPreview(store, store.previewingActionId);
        }

        // Played through, edited meanwhile, or nothing to play: back to the edited state.
        if (!runtime || runtime.isIdle) {
          endSession();
          store.setPreviewingAction(null);
          return;
        }
      } else {
        endSession();
        return;
      }
      lastFrameTime = now;

      // At most one hover test a frame, against what the last frame showed. Play only.
      if (hoverPoint && store.isPreviewMode) {
        const entityId = runtime.hasClickEvents ? pick(hoverPoint.x, hoverPoint.y) : null;
        setCursor(entityId && runtime.clickOwnerOf(entityId) ? "pointer" : "");
        hoverPoint = null;
      }

      runtime.poses().forEach((pose, entityId) => objectManager.applyPose(entityId, pose));
    };

    // Play or the preview started or stopped: drop what was running. The next frame starts what's asked for.
    const unsubscribePlay = useEditorStore.subscribe((state) => state.isPreviewMode, endSession);
    const unsubscribePreview = useEditorStore.subscribe((state) => state.previewingActionId, endSession);

    const onPointerDown = (event: PointerEvent) => {
      if (!session || session.preview || !useEditorStore.getState().isPreviewMode) return;
      if (event.button !== 0 || event.altKey || isSpacePressed) return;

      const entityId = pick(event.clientX, event.clientY);
      if (entityId) session.runtime.click(entityId);
    };

    const onPointerMove = (event: PointerEvent) => {
      if (session && !session.preview) hoverPoint = { x: event.clientX, y: event.clientY };
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
      unsubscribePlay();
      unsubscribePreview();
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
