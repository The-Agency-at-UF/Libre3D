import { useEffect } from "react";
import * as THREE from "three";
import type { SceneRenderer } from "../rendererSettings";
import { resolveState } from "../../animation/objectStates";
import { SceneRuntime } from "../../animation/sceneRuntime";
import { previewTiming, type TransitionAction } from "../../animation/transitions";
import { selectDrawnEntities, selectViewedObjectState, useEditorStore, type EditorState } from "../../store/useEditorStore";
import { getEntityIndex } from "../../scene/entityIndex";
import type { ObjectManager } from "../ObjectManager";
import { PlayCamera, resolvePlayCamera } from "../PlayCamera";
import { pickEntityAt } from "../pickEntity";
import { attachPlayInput } from "../playInput";

// A runtime running in the viewport: Play's, or the ▶ preview of one transition. A preview stops
// when what it was started from changes: an edit (undo included) or another selection.
interface Session {
  runtime: SceneRuntime;
  preview: boolean;
  entities: EditorState["entities"];
  animation: EditorState["animation"];
  selection: EditorState["selectedEntityIds"];
  // Play's own camera, and the editor's to give back on Stop. The ▶ preview keeps the editor's.
  view: { camera: PlayCamera; editorCamera: THREE.Camera; detach: () => void } | null;
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
 * Play looks through a camera of its own (PlayCamera): it starts where the scene's camera is and
 * moves as the camera's Play setting says (Fixed, Soft Orbit, Orbit, Auto-Rotate), while the
 * editor's camera, which is scene data, stays put and unsaved-to (useViewportControls switches its
 * orbiting off). `cameraRef` points at it from Play's first frame to Stop, so rendering and clicks
 * use it; on Stop the editor's camera is put back exactly as it was.
 *
 * Play's pointer input is playInput.ts, shared with the share-link viewer: clicks fire Mouse Down
 * events, and the cursor is a pointer over objects that have one. The editor adds its own rules
 * (not with Alt or Space held, which orbit the camera instead; not during the ▶ preview). With an
 * Orbit camera, a press on an object fires its Mouse Down and dragging from it still turns the
 * camera. Locked objects count: locking is for editing.
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
  rendererRef: React.RefObject<SceneRenderer | null>,
  objectManager: ObjectManager,
) {
  useEffect(() => {
    const renderer = rendererRef.current;
    if (!renderer) return;

    const canvas = renderer.domElement;
    const raycaster = new THREE.Raycaster();
    let session: Session | null = null;
    let lastFrameTime = 0;
    let isSpacePressed = false;

    const pick = (clientX: number, clientY: number) => {
      const targets = [...objectManager.getMeshes().values()].filter((object) => object.visible);
      return pickEntityAt(raycaster, cameraRef.current, canvas, targets, clientX, clientY, true);
    };

    const input = attachPlayInput({
      canvas,
      cursorElement: canvas.parentElement,
      pick,
      // Play's runtime only: the ▶ preview takes no input.
      getRuntime: () => (session && !session.preview ? session.runtime : null),
      shouldIgnore: (event) => event.altKey || isSpacePressed,
    });

    // Each object the runtime moved goes back to the state it's shown in while editing. The entity
    // sync does the same when it next runs, but only after React renders, which can be a frame late.
    const endSession = () => {
      if (!session) return;
      const store = useEditorStore.getState();
      const { byId } = getEntityIndex(selectDrawnEntities(store));
      session.runtime.poses().forEach((_pose, entityId) => {
        const entity = byId.get(entityId);
        if (entity) objectManager.applyPose(entityId, resolveState(entity, selectViewedObjectState(store, entityId)));
      });
      if (session.view) {
        session.view.detach();
        if (cameraRef.current === session.view.camera.camera) cameraRef.current = session.view.editorCamera;
      }
      session = null;
    };

    const canvasAspect = () => canvas.clientWidth / Math.max(1, canvas.clientHeight);

    // Play's camera starts where the scene's camera is, with its Play setting, read once here.
    const startView = (store: EditorState): NonNullable<Session["view"]> => {
      const profile = store.cameraProfiles[store.activeProfileId] ?? store.cameraProfiles.personal;
      const reduceMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
      const camera = new PlayCamera(profile, resolvePlayCamera(profile.play), canvasAspect(), { reduceMotion });
      const editorCamera = cameraRef.current;
      cameraRef.current = camera.camera;
      return { camera, editorCamera, detach: camera.attach(canvas) };
    };

    const startSession = (store: EditorState, preview: boolean): SceneRuntime => {
      // The entities as they are drawn, so a state's colour goes over a material asset's layers.
      const runtime = new SceneRuntime({ entities: selectDrawnEntities(store), animation: store.animation });
      const view = preview ? null : startView(store);
      session = { runtime, preview, entities: store.entities, animation: store.animation, selection: store.selectedEntityIds, view };
      return runtime;
    };

    // The preview's runtime, started on its action, or null when there's nothing it can play.
    const startPreview = (store: EditorState, actionId: string): SceneRuntime | null => {
      const action = findAction(store, actionId);
      const target = action && selectDrawnEntities(store).find((entity) => entity.id === action.targetId);
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
          session.view?.camera.setAspect(canvasAspect());
          session.view?.camera.update((now - lastFrameTime) / 1000);
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
        input.frame(); // nothing playing: drops the cursor Play set
        return;
      }
      lastFrameTime = now;

      // At most one hover test a frame, against what the last frame showed. Play only.
      input.frame();

      runtime.poses().forEach((pose, entityId) => objectManager.applyPose(entityId, pose));
    };

    // Play or the preview started or stopped: drop what was running. The next frame starts what's asked for.
    const unsubscribePlay = useEditorStore.subscribe((state) => state.isPreviewMode, endSession);
    const unsubscribePreview = useEditorStore.subscribe((state) => state.previewingActionId, endSession);

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.code === "Space") isSpacePressed = true;
    };
    const onKeyUp = (event: KeyboardEvent) => {
      if (event.code === "Space") isSpacePressed = false;
    };
    const onBlur = () => {
      isSpacePressed = false;
    };

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    window.addEventListener("blur", onBlur);

    return () => {
      // Torn down mid-Play (leaving the editor): the editor's camera comes back all the same.
      if (session?.view) {
        session.view.detach();
        if (cameraRef.current === session.view.camera.camera) cameraRef.current = session.view.editorCamera;
      }
      frameRef.current = null;
      unsubscribePlay();
      unsubscribePreview();
      input.detach();
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      window.removeEventListener("blur", onBlur);
    };
  }, [frameRef, cameraRef, rendererRef, objectManager]);
}
