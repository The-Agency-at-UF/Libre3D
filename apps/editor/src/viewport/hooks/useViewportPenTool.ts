import { useEffect } from "react";
import * as THREE from "three";
import type { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import type { TransformControls } from "three/examples/jsm/controls/TransformControls.js";
import { useEditorStore, type Entity, type PenToolState } from "../../store/useEditorStore";
import { getEntityWorldMatrix } from "../../utils/entityTransforms";
import type { PathData, PathPoint } from "../../paths/pathGeometry";
import {
  appendPoint,
  deletePoint,
  dragOutHandles,
  drawingPlane,
  nearestScreenPoint,
  projectOntoPlane,
  type HandleSide,
} from "../../paths/pathEditing";
import { PathEditOverlay } from "../PathEditOverlay";
import type { ObjectManager } from "../ObjectManager";

const PICK_RADIUS = 8; // pixels from a dot's centre that still pick it
const DRAG_THRESHOLD = 3; // pixels a press moves before it's a drag

type Vector = [number, number, number];

// One press-drag-release of the pen. `move` and `end` see the pointer while it's down.
interface Gesture {
  start: THREE.Vector2;
  moved: boolean;
  move: (event: PointerEvent) => void;
  end?: () => void;
}

const DRAWING: PenToolState = { mode: "draw", pathId: null, selectedPoint: null };

const toTuple = (vector: THREE.Vector3): Vector => [vector.x, vector.y, vector.z];
const toVector3 = (vector: Vector) => new THREE.Vector3(...vector);
const store = () => useEditorStore.getState();

const findPath = (id: string | null): (Entity & { path: PathData }) | null => {
  const entity = id ? store().entities.find((e) => e.id === id) : undefined;
  return entity?.type === "path" && entity.path ? (entity as Entity & { path: PathData }) : null;
};

/**
 * ============================================================================
 * useViewportPenTool — drawing and editing paths in the viewport (B2)
 * ============================================================================
 *
 * The pen (`penTool` in the store) draws a path a point at a time: click for a corner, press and
 * drag for a smooth point. Points land on a plane through the orbit target facing the axis nearest
 * the view; a path's first point fixes the plane for that path. The path entity is made by the
 * second point (one point draws nothing), with its origin at the orbit target, and each point after
 * that is one undo step. Clicking the first point closes the path; clicking the last point, Enter or
 * Escape finishes it, and the pen stays on for the next one. Backspace takes the last point back.
 *
 * Pointer events: the pen listens on the canvas's container in the capture phase and stops the
 * presses it uses there, before the camera controls and click selection on the canvas see them.
 * Alt-drag (orbit), Space-drag and the middle button (pan), and presses on the transform gizmo go
 * through untouched. Keys: a capture listener on window takes Enter, Escape, Backspace and Delete
 * before useHotkeys (and the Edit Event panel's Escape) see them.
 *
 * Undo: a gesture's first write records its step and history pauses until the pointer is up, as the
 * transform gizmo does. Drags write at most once a frame.
 */
export function useViewportPenTool(
  // Filled here: updates the overlay before each render (ViewportCanvas runs it, like Play's frame).
  frameRef: React.MutableRefObject<(() => void) | null>,
  cameraRef: React.RefObject<THREE.Camera>,
  rendererRef: React.RefObject<THREE.WebGLRenderer | null>,
  scene: THREE.Scene,
  objectManager: ObjectManager,
  orbitControlsRef: React.RefObject<OrbitControls | null>,
  transformControlsRef: React.RefObject<TransformControls | null>,
) {
  useEffect(() => {
    const renderer = rendererRef.current;
    const container = renderer?.domElement.parentElement;
    if (!renderer || !container) return;
    const canvas = renderer.domElement;

    const overlay = new PathEditOverlay();
    scene.add(overlay.object);
    const raycaster = new THREE.Raycaster();

    // The pen's own state, beside the store's: a path's first point before the path exists (with
    // the origin the path will get), the plane the path is drawn on, the cursor, and the gesture.
    let draft: { origin: THREE.Vector3; point: PathPoint } | null = null;
    let plane: THREE.Plane | null = null;
    let cursor: THREE.Vector2 | null = null;
    let gesture: Gesture | null = null;
    let historyPaused = false;
    let pendingMove: PointerEvent | null = null;
    let moveFrame = 0;
    let isSpacePressed = false;

    // -- Where things are --------------------------------------------------------------------

    const canvasRect = () => canvas.getBoundingClientRect();

    const rayAt = (clientX: number, clientY: number) => {
      const rect = canvasRect();
      const ndc = new THREE.Vector2(((clientX - rect.left) / rect.width) * 2 - 1, -((clientY - rect.top) / rect.height) * 2 + 1);
      raycaster.setFromCamera(ndc, cameraRef.current);
      return raycaster.ray;
    };

    // A world position on screen, in client pixels, or null when it's behind the camera.
    const toScreen = (world: THREE.Vector3): THREE.Vector2 | null => {
      const ndc = world.clone().project(cameraRef.current);
      if (ndc.z > 1 || ndc.z < -1) return null;
      const rect = canvasRect();
      return new THREE.Vector2(rect.left + ((ndc.x + 1) / 2) * rect.width, rect.top + ((1 - ndc.y) / 2) * rect.height);
    };

    const viewDirection = () => cameraRef.current.getWorldDirection(new THREE.Vector3());
    const orbitTarget = () => orbitControlsRef.current?.target.clone() ?? new THREE.Vector3();

    // The path's world matrix as it's shown (its state, its parents). Before ViewportCanvas has made
    // its Three object (the frame after addPath), from the store.
    const pathMatrix = (id: string): THREE.Matrix4 => {
      const object = objectManager.getObject(id);
      if (!object) return getEntityWorldMatrix(store().entities, id);
      object.updateWorldMatrix(true, false);
      return object.matrixWorld.clone();
    };

    // The path being drawn, as a path and its matrix: the store's, or the lone first point's.
    const drawnPath = (): { path: PathData; matrix: THREE.Matrix4; id: string | null } | null => {
      const pen = store().penTool;
      const entity = findPath(pen?.pathId ?? null);
      if (entity) return { path: entity.path, matrix: pathMatrix(entity.id), id: entity.id };
      if (draft) return { path: { points: [draft.point], closed: false }, matrix: new THREE.Matrix4().makeTranslation(draft.origin), id: null };
      return null;
    };

    const pointWorld = (point: PathPoint, matrix: THREE.Matrix4) => toVector3(point.position).applyMatrix4(matrix);
    const toLocal = (world: THREE.Vector3, matrix: THREE.Matrix4) => world.clone().applyMatrix4(matrix.clone().invert());
    // A handle from its tip's world position, relative to its point in the path's space.
    const handleToLocal = (tipWorld: THREE.Vector3, anchorWorld: THREE.Vector3, matrix: THREE.Matrix4) =>
      toLocal(tipWorld, matrix).sub(toLocal(anchorWorld, matrix));

    // -- Writing ------------------------------------------------------------------------------

    // The gesture's first write records its undo step; later ones join it (history resumes on up).
    const write = (apply: () => void) => {
      apply();
      if (gesture && !historyPaused) {
        useEditorStore.temporal.getState().pause();
        historyPaused = true;
      }
    };

    const resumeHistory = () => {
      if (!historyPaused) return;
      useEditorStore.temporal.getState().resume();
      historyPaused = false;
    };

    // Ends the path being drawn; the pen stays on for the next one.
    const finishPath = () => {
      draft = null;
      plane = null;
      const pen = store().penTool;
      if (pen?.mode === "draw" && pen.pathId) store().setPenTool(DRAWING);
    };

    // Backspace while drawing: takes the last point back. A path down to one point goes back to
    // being the lone first point (the path entity goes, since one point draws nothing).
    const removeLastPoint = () => {
      const drawn = drawnPath();
      if (!drawn) return;
      const { path, matrix, id } = drawn;
      if (!id) {
        draft = null;
        plane = null;
      } else if (path.points.length > 2) {
        store().updatePath(id, deletePoint(path, path.points.length - 1));
      } else {
        draft = { origin: new THREE.Vector3().setFromMatrixPosition(matrix), point: path.points[0] };
        store().setPenTool(DRAWING);
        store().removeEntity([id]);
      }
    };

    // -- Drawing ------------------------------------------------------------------------------

    // Press-and-drag out of a point being placed: its handles, mirrored, along the drag.
    const dragHandlesGesture = (start: THREE.Vector2, index: number, anchorWorld: THREE.Vector3, then?: () => void): Gesture => ({
      start,
      moved: false,
      move: (event) => {
        const hit = plane && projectOntoPlane(rayAt(event.clientX, event.clientY), plane);
        const drawn = drawnPath();
        if (!hit || !drawn) return;
        const handle = toTuple(handleToLocal(hit, anchorWorld, drawn.matrix));
        if (drawn.id) {
          const id = drawn.id;
          write(() => store().updatePath(id, dragOutHandles(drawn.path, index, handle)));
        } else if (draft) {
          draft.point = dragOutHandles(drawn.path, 0, handle).points[0];
        }
      },
      end: then,
    });

    const startDrawing = (event: PointerEvent): boolean => {
      // Alt-drag orbits, also while drawing.
      if (event.altKey) return false;
      const drawn = drawnPath();
      if (!drawn) plane = drawingPlane(viewDirection(), orbitTarget());
      const hit = plane && projectOntoPlane(rayAt(event.clientX, event.clientY), plane);
      if (!hit) return false;
      const at = new THREE.Vector2(event.clientX, event.clientY);

      if (!drawn) {
        const origin = orbitTarget();
        draft = { origin, point: appendPoint({ points: [], closed: false }, toTuple(hit.clone().sub(origin))).points[0] };
        gesture = dragHandlesGesture(at, 0, hit);
        return true;
      }

      const { path, matrix, id } = drawn;
      const screen = path.points.map((point) => toScreen(pointWorld(point, matrix)));
      const picked = nearestScreenPoint(screen, at, PICK_RADIUS);
      const lastIndex = path.points.length - 1;

      // The first point closes the path (a drag there shapes its handles), the last one finishes it.
      if (id && picked === 0 && path.points.length >= 3) {
        gesture = dragHandlesGesture(at, 0, pointWorld(path.points[0], matrix), finishPath);
        write(() => store().updatePath(id, { ...path, closed: true }));
        return true;
      }
      if (picked === lastIndex) {
        finishPath();
        return true;
      }

      const next = appendPoint(path, toTuple(toLocal(hit, matrix)));
      if (id) {
        gesture = dragHandlesGesture(at, next.points.length - 1, hit);
        write(() => store().updatePath(id, next));
      } else if (draft) {
        // The second point makes the path.
        const origin = draft.origin;
        draft = null;
        gesture = dragHandlesGesture(at, 1, hit);
        write(() => {
          const pathId = store().addPath(toTuple(origin), next);
          store().setPenTool({ ...DRAWING, pathId });
        });
      }
      return true;
    };

    // -- Pointer ------------------------------------------------------------------------------

    const applyMove = () => {
      moveFrame = 0;
      const event = pendingMove;
      pendingMove = null;
      if (!event || !gesture) return;
      if (!gesture.moved && gesture.start.distanceTo(new THREE.Vector2(event.clientX, event.clientY)) < DRAG_THRESHOLD) return;
      gesture.moved = true;
      gesture.move(event);
    };

    const onGestureMove = (event: PointerEvent) => {
      pendingMove = event;
      if (!moveFrame) moveFrame = window.requestAnimationFrame(applyMove);
    };

    const onGestureEnd = () => {
      window.removeEventListener("pointermove", onGestureMove);
      window.removeEventListener("pointerup", onGestureEnd);
      window.removeEventListener("pointercancel", onGestureEnd);
      if (moveFrame) {
        window.cancelAnimationFrame(moveFrame);
        applyMove();
      }
      const ended = gesture;
      gesture = null;
      ended?.end?.();
      resumeHistory();
    };

    const onPointerDown = (event: PointerEvent) => {
      const pen = store().penTool;
      if (!pen || event.target !== canvas || event.button !== 0 || gesture) return;
      // Space-drag pans; a press on the transform gizmo is the gizmo's.
      if (isSpacePressed || transformControlsRef.current?.axis) return;

      const handled = pen.mode === "draw" ? startDrawing(event) : false;
      if (!handled) return;
      // Ours: the camera controls and click selection on the canvas don't see it.
      event.stopPropagation();
      event.preventDefault();
      if (!gesture) return;
      window.addEventListener("pointermove", onGestureMove);
      window.addEventListener("pointerup", onGestureEnd);
      window.addEventListener("pointercancel", onGestureEnd);
    };

    const onHover = (event: PointerEvent) => {
      cursor = event.target === canvas ? new THREE.Vector2(event.clientX, event.clientY) : null;
    };
    const onLeave = () => {
      cursor = null;
    };

    // -- Keys ---------------------------------------------------------------------------------

    const isTyping = () => {
      const active = document.activeElement;
      return !!active && (active.tagName === "INPUT" || active.tagName === "TEXTAREA" || active.getAttribute("contenteditable") === "true");
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.code === "Space") isSpacePressed = true;
      const pen = store().penTool;
      if (!pen || isTyping() || event.ctrlKey || event.metaKey || event.altKey) return;

      let handled = false;
      if (pen.mode === "draw") {
        const isDrawing = !!drawnPath();
        if (event.key === "Enter" || event.key === "Escape") {
          handled = true;
          if (isDrawing) finishPath();
          else if (event.key === "Escape") store().setPenTool(null);
        } else if ((event.key === "Backspace" || event.key === "Delete") && isDrawing) {
          handled = true;
          removeLastPoint();
        }
      }

      if (handled) {
        event.preventDefault();
        event.stopImmediatePropagation();
      }
    };

    const onKeyUp = (event: KeyboardEvent) => {
      if (event.code === "Space") isSpacePressed = false;
    };
    const onBlur = () => {
      isSpacePressed = false;
    };

    // -- Store --------------------------------------------------------------------------------

    // Undo, redo or a delete can take the path away; a new selection ends drawing or editing it.
    const unsubscribeEntities = useEditorStore.subscribe(
      (state) => state.entities,
      () => {
        const pen = store().penTool;
        if (!pen?.pathId || findPath(pen.pathId)) return;
        if (pen.mode === "draw") finishPath();
        else store().setPenTool(null);
      },
    );
    const unsubscribeSelection = useEditorStore.subscribe(
      (state) => state.selectedEntityIds,
      (selectedIds) => {
        const pen = store().penTool;
        if (!pen?.pathId || (selectedIds.length === 1 && selectedIds[0] === pen.pathId)) return;
        if (pen.mode === "draw") finishPath();
        else store().setPenTool(null);
      },
    );
    const unsubscribePen = useEditorStore.subscribe(
      (state) => state.penTool,
      (pen) => {
        if (pen?.mode !== "draw") {
          draft = null;
          plane = null;
        }
        container.style.cursor = pen?.mode === "draw" ? "crosshair" : "";
      },
    );

    // -- Each frame ---------------------------------------------------------------------------

    frameRef.current = () => {
      const pen = store().penTool;
      if (!pen) {
        overlay.show(null, 1);
        overlay.showPlane(null, new THREE.Vector3());
        return;
      }

      const drawn = drawnPath();
      // Before a path's first point, the plane follows the view.
      const planeCentre = drawn ? new THREE.Vector3().setFromMatrixPosition(drawn.matrix) : orbitTarget();
      overlay.showPlane(drawn ? plane : drawingPlane(viewDirection(), planeCentre), planeCentre);
      if (!drawn) {
        overlay.show(null, renderer.getPixelRatio());
        return;
      }

      // The point being placed shows its handles; the cursor shows the next segment.
      const { path, matrix } = drawn;
      const lastIndex = path.points.length - 1;
      const sides: HandleSide[] = path.points[lastIndex].mode === "smooth" && !path.closed ? ["in", "out"] : [];
      const handles = sides.map((side) => ({ index: lastIndex, side }));
      const hit = !gesture && cursor && plane ? projectOntoPlane(rayAt(cursor.x, cursor.y), plane) : null;

      overlay.show(
        {
          path,
          matrixWorld: matrix,
          selectedPoint: null,
          handles,
          preview: hit ? toLocal(hit, matrix) : null,
          insertAt: null,
        },
        renderer.getPixelRatio(),
      );
    };

    container.addEventListener("pointerdown", onPointerDown, true);
    canvas.addEventListener("pointermove", onHover);
    canvas.addEventListener("pointerleave", onLeave);
    window.addEventListener("keydown", onKeyDown, true);
    window.addEventListener("keyup", onKeyUp);
    window.addEventListener("blur", onBlur);

    return () => {
      container.removeEventListener("pointerdown", onPointerDown, true);
      canvas.removeEventListener("pointermove", onHover);
      canvas.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("keydown", onKeyDown, true);
      window.removeEventListener("keyup", onKeyUp);
      window.removeEventListener("blur", onBlur);
      window.removeEventListener("pointermove", onGestureMove);
      window.removeEventListener("pointerup", onGestureEnd);
      window.removeEventListener("pointercancel", onGestureEnd);
      if (moveFrame) window.cancelAnimationFrame(moveFrame);
      resumeHistory();
      unsubscribeEntities();
      unsubscribeSelection();
      unsubscribePen();
      frameRef.current = null;
      container.style.cursor = "";
      scene.remove(overlay.object);
      overlay.dispose();
    };
    // Created once against the renderer and scene; the camera and controls are read through refs.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rendererRef, scene, objectManager]);
}
