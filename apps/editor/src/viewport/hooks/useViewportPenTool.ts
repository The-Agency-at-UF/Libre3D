import { useEffect, useRef } from "react";
import * as THREE from "three";
import type { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import type { TransformControls } from "three/examples/jsm/controls/TransformControls.js";
import { useEditorStore, type Entity, type PenToolState } from "../../store/useEditorStore";
import { isEffectivelyLocked } from "../../store/entityIndex";
import { getEntityWorldMatrix } from "../../utils/entityTransforms";
import type { PathData, PathPoint } from "../../paths/pathGeometry";
import {
  appendPoint,
  deletePoint,
  dragOutHandles,
  drawingPlane,
  insertPoint,
  moveHandle,
  movePoint,
  nearestOnCurve,
  nearestScreenPoint,
  projectOntoPlane,
  setPointMode,
  visibleHandles,
  type HandleSide,
} from "../../paths/pathEditing";
import { removeContour, replaceContour, shapeContours } from "../../paths/shapeGeometry";
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

// What editing works on: a path's one curve, or a shape's closed outlines (shapeContours), each
// edited like a closed path. `write` replaces one contour; `remove` takes one away (a shape loses
// that outline, or the whole object goes when nothing would be left).
interface Editable {
  entity: Entity;
  contours: PathData[];
  minPoints: number; // a contour with fewer draws nothing
  write: (contour: number, path: PathData) => void;
  remove: (contour: number) => void;
}

const findEditable = (id: string | null): Editable | null => {
  const path = findPath(id);
  if (path) {
    return {
      entity: path,
      contours: [path.path],
      minPoints: 2,
      write: (_, next) => store().updatePath(path.id, next),
      remove: () => store().removeEntity([path.id]),
    };
  }
  const entity = id ? store().entities.find((e) => e.id === id) : undefined;
  const shape = entity?.type === "shape" ? entity.shape : undefined;
  if (!entity || !shape) return null;
  return {
    entity,
    contours: shapeContours(shape),
    minPoints: 3,
    write: (contour, next) => store().updateShape(entity.id, replaceContour(shape, contour, next)),
    remove: (contour) => {
      const next = removeContour(shape, contour);
      if (next) store().updateShape(entity.id, next);
      else store().removeEntity([entity.id]);
    },
  };
};

/**
 * Starts editing a path's or shape's points (double-click it, or Enter with it selected). Not for a
 * locked one, and not while view only or playing (setPenTool refuses). Returns whether editing started.
 */
export function editPath(pathId: string): boolean {
  if (!findEditable(pathId) || isEffectivelyLocked(store().entities, pathId)) return false;
  store().setPenTool({ mode: "edit", pathId, selectedPoint: null });
  return store().penTool?.mode === "edit";
}

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
 * While the pen is on, a dot under the cursor shows where the next click puts a point, or the
 * point a click closes or finishes at.
 *
 * Editing (`editPath`) shows one path's points. Drag a point or a handle across the view (on the
 * plane through it facing the path's own axis nearest the view, so it keeps its depth); Alt-drag a
 * handle to move it alone. Click the curve to add a point there, double-click a point to switch it
 * between smooth and corner, Delete to remove it. The picked point gets the transform gizmo (moving
 * only), which is how a point moves in depth. Enter or Escape ends editing, and so does a click away
 * from the object, which then selects or box-selects as usual (a click on the object itself only
 * drops the picked point). The points belong to
 * the path, not to a state, and are placed from the path as it's shown, so editing works in any state.
 * A shape is edited the same way, one closed outline at a time (`contour`): its other outlines show
 * their points and curves, and picking one of those edits that outline. A shape stays flat (Z = 0).
 *
 * Pointer events: the pen listens on the canvas's container in the capture phase and stops the
 * presses it uses there, before the camera controls and click selection on the canvas see them.
 * Alt-drag (orbit, unless it's on a handle), Space-drag and the middle button (pan), and presses on
 * the transform gizmo go through untouched. Keys: a capture listener on window takes the pen's keys
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
  // What the transform gizmo holds while a point is picked: placed on the point each frame, and its
  // drags written back to the point. ViewportCanvas attaches the gizmo to it.
  const anchorProxyRef = useRef(new THREE.Object3D());

  useEffect(() => {
    const renderer = rendererRef.current;
    const container = renderer?.domElement.parentElement;
    if (!renderer || !container) return;
    const canvas = renderer.domElement;

    const overlay = new PathEditOverlay();
    scene.add(overlay.object);
    const anchorProxy = anchorProxyRef.current;
    anchorProxy.userData.editorOnly = true; // never exported — see hideEditorOnlyObjects
    scene.add(anchorProxy);
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
    let isAltPressed = false;
    let isOrbiting = false;

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
      if (pen?.mode !== "draw") return null;
      const entity = findPath(pen.pathId);
      if (entity) return { path: entity.path, matrix: pathMatrix(entity.id), id: entity.id };
      if (draft) return { path: { points: [draft.point], closed: false }, matrix: new THREE.Matrix4().makeTranslation(draft.origin), id: null };
      return null;
    };

    const pointWorld = (point: PathPoint, matrix: THREE.Matrix4) => toVector3(point.position).applyMatrix4(matrix);
    const toLocal = (world: THREE.Vector3, matrix: THREE.Matrix4) => world.clone().applyMatrix4(matrix.clone().invert());
    // A handle from its tip's world position, relative to its point in the path's space.
    const handleToLocal = (tipWorld: THREE.Vector3, anchorWorld: THREE.Vector3, matrix: THREE.Matrix4) =>
      toLocal(tipWorld, matrix).sub(toLocal(anchorWorld, matrix));
    const handleTipWorld = (point: PathPoint, side: HandleSide, matrix: THREE.Matrix4) =>
      toVector3(point.position)
        .add(toVector3(side === "in" ? point.handleIn : point.handleOut))
        .applyMatrix4(matrix);
    const rotationOf = (matrix: THREE.Matrix4) => {
      const rotation = new THREE.Quaternion();
      matrix.decompose(new THREE.Vector3(), rotation, new THREE.Vector3());
      return rotation;
    };

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

    // What a press at `at` does instead of adding a point: close the path (on its first point, once
    // it has 3) or finish it (on its last point).
    const endAt = (drawn: NonNullable<ReturnType<typeof drawnPath>>, at: THREE.Vector2): { index: number; closes: boolean } | null => {
      const { path, matrix, id } = drawn;
      const screen = path.points.map((point) => toScreen(pointWorld(point, matrix)));
      const picked = nearestScreenPoint(screen, at, PICK_RADIUS);
      if (id && picked === 0 && path.points.length >= 3) return { index: 0, closes: true };
      if (picked === path.points.length - 1) return { index: picked, closes: false };
      return null;
    };

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
      const end = endAt(drawn, at);

      // The first point closes the path (a drag there shapes its handles), the last one finishes it.
      if (id && end?.closes) {
        gesture = dragHandlesGesture(at, 0, pointWorld(path.points[0], matrix), finishPath);
        write(() => store().updatePath(id, { ...path, closed: true }));
        return true;
      }
      if (end) {
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

    // -- Editing ------------------------------------------------------------------------------

    // The path being edited (a shape's: the outline being edited), and its world matrix as shown.
    const editedPath = () => {
      const pen = store().penTool;
      const editable = pen?.mode === "edit" ? findEditable(pen.pathId) : null;
      if (!pen || !editable) return null;
      const contour = Math.min(pen.contour ?? 0, editable.contours.length - 1);
      return { pen, entity: editable.entity, editable, contour, path: editable.contours[contour], matrix: pathMatrix(editable.entity.id) };
    };

    // Writes one of an object's contours as it is now (a drag reads it again on every move).
    const currentContour = (id: string, contour: number) => findEditable(id)?.contours[contour];
    const writeContour = (id: string, contour: number, path: PathData) => findEditable(id)?.write(contour, path);

    // A drag of a point or a handle tip: it moves on the plane through where it was, facing the
    // path's own axis nearest the view, keeping the distance from the cursor it was grabbed at.
    const dragOnPlane = (
      event: PointerEvent,
      from: THREE.Vector3,
      matrix: THREE.Matrix4,
      apply: (world: THREE.Vector3, event: PointerEvent) => void,
    ): Gesture | null => {
      const dragPlane = drawingPlane(viewDirection(), from, rotationOf(matrix));
      const grabbed = projectOntoPlane(rayAt(event.clientX, event.clientY), dragPlane);
      if (!grabbed) return null;
      const offset = from.clone().sub(grabbed);
      return {
        start: new THREE.Vector2(event.clientX, event.clientY),
        moved: false,
        move: (moveEvent) => {
          const hit = projectOntoPlane(rayAt(moveEvent.clientX, moveEvent.clientY), dragPlane);
          if (hit) apply(hit.add(offset), moveEvent);
        },
      };
    };

    const startEditing = (event: PointerEvent): boolean => {
      const edited = editedPath();
      if (!edited) return false;
      const { pen, entity, editable, contour, path, matrix } = edited;
      const id = entity.id;
      const at = new THREE.Vector2(event.clientX, event.clientY);

      // A handle first (Alt-drag moves it alone), then a point, then the curve.
      const handles = visibleHandles(path, pen.selectedPoint);
      const tips = handles.map(({ index, side }) => handleTipWorld(path.points[index], side, matrix));
      const pickedHandle = nearestScreenPoint(tips.map(toScreen), at, PICK_RADIUS);
      if (pickedHandle !== null) {
        const { index, side } = handles[pickedHandle];
        gesture = dragOnPlane(event, tips[pickedHandle], matrix, (tip, moveEvent) => {
          const current = currentContour(id, contour);
          if (!current?.points[index]) return;
          const shown = pathMatrix(id);
          const handle = toTuple(handleToLocal(tip, pointWorld(current.points[index], shown), shown));
          write(() => writeContour(id, contour, moveHandle(current, index, side, handle, event.altKey || moveEvent.altKey)));
        });
        return true;
      }
      // Alt-drag anywhere else orbits.
      if (event.altKey) return false;

      const dragPoint = (inContour: number, index: number, from: THREE.Vector3) =>
        dragOnPlane(event, from, matrix, (world) => {
          const current = currentContour(id, inContour);
          if (!current?.points[index]) return;
          write(() => writeContour(id, inContour, movePoint(current, index, toTuple(toLocal(world, pathMatrix(id))))));
        });

      // The edited contour's points, then a shape's other outlines' (picking one edits that outline).
      const others = editable.contours.map((_, i) => i).filter((i) => i !== contour);
      for (const inContour of [contour, ...others]) {
        const points = editable.contours[inContour].points;
        const pickedPoint = nearestScreenPoint(points.map((point) => toScreen(pointWorld(point, matrix))), at, PICK_RADIUS);
        if (pickedPoint !== null) {
          store().setPenTool({ ...pen, contour: inContour, selectedPoint: pickedPoint });
          gesture = dragPoint(inContour, pickedPoint, pointWorld(points[pickedPoint], matrix));
          return true;
        }
      }

      // The dots sit on the gizmo (a point's handles near its plane handles), so they come first;
      // anywhere else on the gizmo is the gizmo's.
      if (transformControlsRef.current?.axis) return false;

      // On the curve: a new point there, which the same press can drag.
      for (const inContour of [contour, ...others]) {
        const curve = editable.contours[inContour];
        const onCurve = nearestOnCurve(curve, (local) => toScreen(local.clone().applyMatrix4(matrix)), at, PICK_RADIUS);
        if (!onCurve) continue;
        const { path: next, index } = insertPoint(curve, onCurve.segment, onCurve.t);
        gesture = dragPoint(inContour, index, pointWorld(next.points[index], matrix));
        write(() => writeContour(id, inContour, next));
        store().setPenTool({ ...pen, contour: inContour, selectedPoint: index });
        return true;
      }

      // On the object itself (a shape's fill, away from its outlines): still editing, no point picked.
      const shown = objectManager.getObject(id);
      rayAt(event.clientX, event.clientY); // aims `raycaster` at the press
      if (shown && raycaster.intersectObject(shown, true).length > 0) {
        store().setPenTool({ ...pen, selectedPoint: null });
        return true;
      }
      // Anywhere else ends editing, and the press goes on as an ordinary one: it selects what's
      // there, clears the selection, or starts a box select.
      store().setPenTool(null);
      return false;
    };

    // Double-clicking a point switches it between smooth and corner.
    const onDoubleClick = (event: MouseEvent) => {
      const edited = editedPath();
      if (!edited || event.target !== canvas) return;
      event.stopPropagation();
      const { editable, contour, path, matrix } = edited;
      const at = new THREE.Vector2(event.clientX, event.clientY);
      const index = nearestScreenPoint(path.points.map((point) => toScreen(pointWorld(point, matrix))), at, PICK_RADIUS);
      if (index === null) return;
      editable.write(contour, setPointMode(path, index, path.points[index].mode === "smooth" ? "corner" : "smooth"));
    };

    // Delete while editing: the picked point goes, and its neighbours join. A path left with one
    // point draws nothing, so it goes too; so does a shape's outline left with two (and the shape
    // when that was its last).
    const deleteSelectedPoint = () => {
      const edited = editedPath();
      const selected = edited?.pen.selectedPoint ?? null;
      if (!edited || selected === null) return;
      const { pen, editable, contour, path } = edited;
      if (path.points.length <= editable.minPoints) {
        editable.remove(contour);
        if (findEditable(pen.pathId)) store().setPenTool({ ...pen, contour: 0, selectedPoint: null });
        return;
      }
      editable.write(contour, deletePoint(path, selected));
      store().setPenTool({ ...pen, selectedPoint: null });
    };

    // The gizmo on the picked point: its drag moves the point (one undo step, as for objects).
    const transformControls = transformControlsRef.current;
    let isGizmoPaused = false;
    const onGizmoChange = () => {
      const edited = editedPath();
      if (transformControls?.object !== anchorProxy || !edited || edited.pen.selectedPoint === null) return;
      const { editable, contour, path, matrix, pen } = edited;
      editable.write(contour, movePoint(path, pen.selectedPoint!, toTuple(toLocal(anchorProxy.position, matrix))));
      if (transformControls.dragging && !isGizmoPaused) {
        useEditorStore.temporal.getState().pause();
        isGizmoPaused = true;
      }
    };
    // useViewportControls resumes history when any gizmo drag ends.
    const onGizmoDragging = (event: { value: unknown }) => {
      if (!event.value) isGizmoPaused = false;
    };
    transformControls?.addEventListener("objectChange", onGizmoChange);
    transformControls?.addEventListener("dragging-changed", onGizmoDragging);

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
      // Space-drag pans.
      if (isSpacePressed) return;

      const handled = pen.mode === "draw" ? startDrawing(event) : startEditing(event);
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
      isAltPressed = event.altKey;
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
      if (event.key === "Alt") isAltPressed = true;
      const pen = store().penTool;
      if (!pen || isTyping() || event.ctrlKey || event.metaKey || event.altKey) return;

      let handled = false;
      if (pen.mode === "draw") {
        const isDrawing = !!drawnPath();
        if (event.key === "Enter" || event.key === "Escape") {
          handled = true;
          if (isDrawing) finishPath();
          else if (event.key === "Escape") store().setPenTool(null);
          else {
            // Enter with nothing being drawn edits the selected path, as it does with the pen down.
            const { selectedEntityIds } = store();
            if (selectedEntityIds.length === 1) editPath(selectedEntityIds[0]);
          }
        } else if ((event.key === "Backspace" || event.key === "Delete") && isDrawing) {
          handled = true;
          removeLastPoint();
        }
      } else {
        handled = true;
        const key = event.key.toLowerCase();
        if (key === "enter" || key === "escape") store().setPenTool(null);
        else if (key === "backspace" || key === "delete") deleteSelectedPoint();
        // The gizmo only moves a point, and the path isn't deleted while editing its points.
        else handled = key === "w" || key === "e" || key === "r";
      }

      if (handled) {
        event.preventDefault();
        event.stopImmediatePropagation();
      }
    };

    const onKeyUp = (event: KeyboardEvent) => {
      if (event.code === "Space") isSpacePressed = false;
      if (event.key === "Alt") isAltPressed = false;
    };
    const onBlur = () => {
      isSpacePressed = false;
      isAltPressed = false;
    };

    // The cursor's dot hides while the camera moves (Alt-drag, Space-drag, the middle button, wheel).
    const orbitControls = orbitControlsRef.current;
    const onOrbitStart = () => {
      isOrbiting = true;
    };
    const onOrbitEnd = () => {
      isOrbiting = false;
    };
    orbitControls?.addEventListener("start", onOrbitStart);
    orbitControls?.addEventListener("end", onOrbitEnd);

    // -- Store --------------------------------------------------------------------------------

    // Undo, redo or a delete can take the path away, or the picked point; a new selection ends
    // drawing or editing the path.
    const unsubscribeEntities = useEditorStore.subscribe(
      (state) => state.entities,
      () => {
        const pen = store().penTool;
        if (!pen?.pathId) return;
        const editable = pen.mode === "draw" ? (findPath(pen.pathId) && findEditable(pen.pathId)) : findEditable(pen.pathId);
        if (!editable) {
          if (pen.mode === "draw") finishPath();
          else store().setPenTool(null);
          return;
        }
        const contour = editable.contours[pen.contour ?? 0];
        if (!contour) store().setPenTool({ ...pen, contour: 0, selectedPoint: null });
        else if (pen.selectedPoint !== null && pen.selectedPoint >= contour.points.length) store().setPenTool({ ...pen, selectedPoint: null });
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

    // A shape's other outlines while one is edited: their points and curves, one overlay each, so a
    // click on one of them edits that outline.
    const otherOverlays: PathEditOverlay[] = [];
    const showOtherContours = (contours: PathData[], matrix: THREE.Matrix4) => {
      while (otherOverlays.length < contours.length) {
        const added = new PathEditOverlay();
        scene.add(added.object);
        otherOverlays.push(added);
      }
      otherOverlays.forEach((each, i) =>
        each.show(
          contours[i] ? { path: contours[i], matrixWorld: matrix, selectedPoint: null, handles: [], preview: null, insertAt: null } : null,
          renderer.getPixelRatio(),
        ),
      );
    };

    // Editing: the path's points, the picked one's handles, where a click on the curve would add a
    // point, and the gizmo's stand-in on the picked point (left alone while the gizmo drags it).
    const showEditing = () => {
      overlay.showPlane(null, new THREE.Vector3());
      const edited = editedPath();
      if (!edited) {
        overlay.show(null, 1);
        showOtherContours([], new THREE.Matrix4());
        return;
      }
      const { pen, editable, contour, path, matrix } = edited;
      const handles = visibleHandles(path, pen.selectedPoint);
      const others = editable.contours.filter((_, i) => i !== contour);
      showOtherContours(others, matrix);

      let insertAt: THREE.Vector3 | null = null;
      if (cursor && !gesture && !transformControlsRef.current?.axis) {
        const dots = [
          ...editable.contours.flatMap((each) => each.points.map((point) => pointWorld(point, matrix))),
          ...handles.map(({ index, side }) => handleTipWorld(path.points[index], side, matrix)),
        ];
        if (nearestScreenPoint(dots.map(toScreen), cursor, PICK_RADIUS) === null) {
          for (const each of [path, ...others]) {
            const onCurve = nearestOnCurve(each, (local) => toScreen(local.clone().applyMatrix4(matrix)), cursor, PICK_RADIUS);
            insertAt = onCurve?.point ?? null;
            if (insertAt) break;
          }
        }
      }

      const transformControls = transformControlsRef.current;
      const point = pen.selectedPoint !== null ? path.points[pen.selectedPoint] : undefined;
      if (point && !(transformControls?.dragging && transformControls.object === anchorProxy)) {
        anchorProxy.position.copy(pointWorld(point, matrix));
        anchorProxy.quaternion.copy(rotationOf(matrix));
        anchorProxy.updateMatrixWorld();
      }

      overlay.show({ path, matrixWorld: matrix, selectedPoint: pen.selectedPoint, handles, preview: null, insertAt }, renderer.getPixelRatio());
    };

    // Where the pen's next click puts a point, for the dot under the cursor: on the drawing plane, or
    // on the point a click there closes or finishes the path at. Null when a press wouldn't draw: off
    // the canvas, while the camera moves, with Alt or Space held (orbit, pan), or while a point's
    // handles are being dragged out.
    const cursorTarget = (drawn: ReturnType<typeof drawnPath>, drawPlane: THREE.Plane | null) => {
      if (!cursor || gesture || isOrbiting || isAltPressed || isSpacePressed || !drawPlane) return null;
      const end = drawn && endAt(drawn, cursor);
      if (drawn && end) return { position: pointWorld(drawn.path.points[end.index], drawn.matrix), end };
      const hit = projectOntoPlane(rayAt(cursor.x, cursor.y), drawPlane);
      return hit && { position: hit, end: null };
    };

    frameRef.current = () => {
      const pen = store().penTool;
      const pixelRatio = renderer.getPixelRatio();
      if (pen?.mode !== "draw") overlay.showCursor(null, false, pixelRatio);
      if (pen?.mode === "edit") {
        showEditing();
        return;
      }
      showOtherContours([], new THREE.Matrix4());
      if (!pen) {
        overlay.show(null, 1);
        overlay.showPlane(null, new THREE.Vector3());
        return;
      }

      const drawn = drawnPath();
      // Before a path's first point, the plane follows the view.
      const planeCentre = drawn ? new THREE.Vector3().setFromMatrixPosition(drawn.matrix) : orbitTarget();
      const drawPlane = drawn ? plane : drawingPlane(viewDirection(), planeCentre);
      overlay.showPlane(drawPlane, planeCentre);
      const target = cursorTarget(drawn, drawPlane);
      overlay.showCursor(target?.position ?? null, !!target?.end, pixelRatio);
      if (!drawn) {
        overlay.show(null, pixelRatio);
        return;
      }

      // The point being placed shows its handles; the cursor shows the next segment (none when a
      // click finishes the path).
      const { path, matrix } = drawn;
      const lastIndex = path.points.length - 1;
      const sides: HandleSide[] = path.points[lastIndex].mode === "smooth" && !path.closed ? ["in", "out"] : [];
      const handles = sides.map((side) => ({ index: lastIndex, side }));
      const hit = target && (!target.end || target.end.closes) ? target.position : null;

      overlay.show(
        {
          path,
          matrixWorld: matrix,
          selectedPoint: null,
          handles,
          preview: hit ? toLocal(hit, matrix) : null,
          insertAt: null,
        },
        pixelRatio,
      );
    };

    container.addEventListener("pointerdown", onPointerDown, true);
    container.addEventListener("dblclick", onDoubleClick, true);
    canvas.addEventListener("pointermove", onHover);
    canvas.addEventListener("pointerleave", onLeave);
    window.addEventListener("keydown", onKeyDown, true);
    window.addEventListener("keyup", onKeyUp);
    window.addEventListener("blur", onBlur);

    return () => {
      container.removeEventListener("pointerdown", onPointerDown, true);
      container.removeEventListener("dblclick", onDoubleClick, true);
      transformControls?.removeEventListener("objectChange", onGizmoChange);
      transformControls?.removeEventListener("dragging-changed", onGizmoDragging);
      orbitControls?.removeEventListener("start", onOrbitStart);
      orbitControls?.removeEventListener("end", onOrbitEnd);
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
      scene.remove(overlay.object, anchorProxy);
      overlay.dispose();
      otherOverlays.forEach((each) => {
        scene.remove(each.object);
        each.dispose();
      });
    };
    // Created once against the renderer, scene and controls (useViewportControls makes those first);
    // the camera is read through its ref.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rendererRef, scene, objectManager]);

  return anchorProxyRef;
}
