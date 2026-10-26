import { useEffect, useRef } from "react";
import * as THREE from "three";
import type { TransformControls } from "three/examples/jsm/controls/TransformControls.js";
import { useEditorStore, type DepthLayer, type EditorState } from "../../store/useEditorStore";
import { distanceAlongAxis, dragFar, dragNear, dragStop, pointOnAxis, stopDistance } from "../../utils/depthGizmo";
import type { ObjectManager } from "../ObjectManager";

const SVG_NS = "http://www.w3.org/2000/svg";
const CONE_LIFT = 22; // pixels the near and far markers sit above their place on the axis

type Handle = { kind: "near" } | { kind: "far" } | { kind: "stop"; index: number };

const store = () => useEditorStore.getState();

// The enabled Depth layer of the object being depth-edited, while it's the one selected.
const editedLayer = (state: EditorState): DepthLayer | null => {
  const { depthEdit, selectedEntityIds, entities } = state;
  if (!depthEdit || selectedEntityIds.length !== 1 || selectedEntityIds[0] !== depthEdit) return null;
  const entity = entities.find((e) => e.id === depthEdit);
  return entity?.materialLayers?.find((each): each is DepthLayer => each.type === "depth" && each.enabled) ?? null;
};

// What's being depth-edited, and the object's world matrix as it's shown. None when the object is hidden.
const findTarget = (objectManager: ObjectManager) => {
  const state = store();
  const layer = editedLayer(state);
  const object = layer && state.depthEdit ? objectManager.getObject(state.depthEdit) : undefined;
  if (!layer || !object?.visible) return null;
  object.updateWorldMatrix(true, false);
  return { entityId: state.depthEdit!, layer, matrix: object.matrixWorld.clone() };
};

/** Starts editing an object's Depth layer in the viewport (it must be the one selected). */
export function editDepth(entityId: string): void {
  store().setDepthEdit(entityId);
  if (!editedLayer(store())) store().setDepthEdit(null);
}

const svgElement = <K extends keyof SVGElementTagNameMap>(tag: K, className: string): SVGElementTagNameMap[K] => {
  const element = document.createElementNS(SVG_NS, tag);
  element.setAttribute("class", className);
  return element;
};

// Keeps `count` elements in `group`, made by `make`, and returns them.
const pool = <T extends SVGElement>(group: SVGGElement, count: number, make: () => T): T[] => {
  while (group.children.length < count) group.appendChild(make());
  while (group.children.length > count) group.lastChild!.remove();
  return [...group.children] as T[];
};

/**
 * ============================================================================
 * useViewportDepthGizmo — the Depth layer's handles in the viewport
 * ============================================================================
 *
 * While an object's Depth layer is being edited (`depthEdit` in the store; `editDepth`, the Depth
 * layer's button), an SVG over the canvas shows its axis from the origin to far, the near and far
 * markers (triangles above the axis), each stop as a dot in its colour, and for a radial layer a
 * ring at each stop's distance (facing the view, around the origin). It's redrawn from the 3D
 * positions each frame (ViewportCanvas runs `frameRef` before each render), so it follows the
 * camera and the object.
 *
 * The transform gizmo moves the origin, not the object: ViewportCanvas attaches it (translate only)
 * to a stand-in this hook keeps on the origin, and its drags are written back to the layer.
 * Dragging a handle edits the layer too (utils/depthGizmo.ts): far turns the axis toward the
 * cursor, near and the stops slide along the axis. A drag is one undo step (history pauses after
 * its first write) and writes at most once a frame. The handles take their own pointer events, so
 * the camera controls and click selection on the canvas never see them; the rest of the SVG lets
 * pointer events through. Enter or Escape ends editing, and so does selecting something else; the
 * object's own transform keys (W, E, R) and Delete do nothing meanwhile.
 */
export function useViewportDepthGizmo(
  frameRef: React.MutableRefObject<(() => void) | null>,
  cameraRef: React.RefObject<THREE.Camera>,
  rendererRef: React.RefObject<THREE.WebGLRenderer | null>,
  scene: THREE.Scene,
  objectManager: ObjectManager,
  transformControlsRef: React.RefObject<TransformControls | null>,
) {
  // What the transform gizmo holds while depth editing: kept on the origin each frame, and its drags
  // written back to the layer. ViewportCanvas attaches the gizmo to it.
  const anchorProxyRef = useRef(new THREE.Object3D());

  useEffect(() => {
    const renderer = rendererRef.current;
    const container = renderer?.domElement.parentElement;
    if (!renderer || !container) return;
    const canvas = renderer.domElement;

    const svg = svgElement("svg", "depth-gizmo");
    const rings = svgElement("g", "depth-gizmo-rings");
    const axis = svgElement("line", "depth-gizmo-axis");
    const cones = svgElement("g", "");
    const stops = svgElement("g", "");
    svg.append(rings, axis, cones, stops);
    const coneParts = (["near", "far"] as const).map((kind) => {
      const stem = svgElement("line", "depth-gizmo-stem");
      const cone = svgElement("polygon", "depth-gizmo-handle depth-gizmo-cone");
      cone.dataset.handle = kind;
      cones.append(stem, cone);
      return { stem, cone };
    });
    container.appendChild(svg);

    const anchorProxy = anchorProxyRef.current;
    anchorProxy.userData.editorOnly = true; // never exported — see hideEditorOnlyObjects
    scene.add(anchorProxy);
    const transformControls = transformControlsRef.current;

    const raycaster = new THREE.Raycaster();
    let gesture: { handle: Handle; entityId: string; layerId: string; plane: THREE.Plane | null; historyPaused: boolean } | null = null;
    let pendingMove: PointerEvent | null = null;
    let moveFrame = 0;

    // -- Where things are --------------------------------------------------------------------

    // A world position in the SVG's pixels (the container's), or null behind the camera.
    const toScreen = (world: THREE.Vector3): THREE.Vector2 | null => {
      const ndc = world.clone().project(cameraRef.current);
      if (ndc.z > 1 || ndc.z < -1) return null;
      const rect = canvas.getBoundingClientRect();
      const box = container.getBoundingClientRect();
      return new THREE.Vector2(rect.left - box.left + ((ndc.x + 1) / 2) * rect.width, rect.top - box.top + ((1 - ndc.y) / 2) * rect.height);
    };

    const rayAt = (event: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      const ndc = new THREE.Vector2(((event.clientX - rect.left) / rect.width) * 2 - 1, -((event.clientY - rect.top) / rect.height) * 2 + 1);
      raycaster.setFromCamera(ndc, cameraRef.current);
      return raycaster.ray.clone();
    };

    const viewPlaneThrough = (world: THREE.Vector3) =>
      new THREE.Plane().setFromNormalAndCoplanarPoint(cameraRef.current.getWorldDirection(new THREE.Vector3()), world);

    // -- Drawing ------------------------------------------------------------------------------

    const hide = () => {
      svg.style.display = "none";
    };

    frameRef.current = () => {
      const target = findTarget(objectManager);
      if (!target) return hide();
      const { layer, matrix } = target;
      const world = (local: THREE.Vector3) => local.applyMatrix4(matrix);
      const originWorld = world(new THREE.Vector3(...layer.origin));
      const originAt = toScreen(originWorld);
      if (!originAt) return hide();
      svg.style.display = "";

      const farAt = toScreen(world(pointOnAxis(layer, layer.far)));
      axis.style.display = farAt ? "" : "none";
      if (farAt) {
        axis.setAttribute("x1", `${originAt.x}`);
        axis.setAttribute("y1", `${originAt.y}`);
        axis.setAttribute("x2", `${farAt.x}`);
        axis.setAttribute("y2", `${farAt.y}`);
      }

      // The gizmo's stand-in on the origin, turned like the object (for Local space). Left alone
      // while the gizmo drags it.
      if (!(transformControls?.dragging && transformControls.object === anchorProxy)) {
        anchorProxy.position.copy(originWorld);
        matrix.decompose(new THREE.Vector3(), anchorProxy.quaternion, new THREE.Vector3());
        anchorProxy.updateMatrixWorld();
      }

      // Near and far: a cone above the axis, on a stem down to its place.
      [layer.near, layer.far].forEach((distance, i) => {
        const at = toScreen(world(pointOnAxis(layer, distance)));
        const { stem, cone } = coneParts[i];
        stem.style.display = cone.style.display = at ? "" : "none";
        if (!at) return;
        const top = at.y - CONE_LIFT;
        stem.setAttribute("x1", `${at.x}`);
        stem.setAttribute("y1", `${at.y}`);
        stem.setAttribute("x2", `${at.x}`);
        stem.setAttribute("y2", `${top}`);
        cone.setAttribute("points", `${at.x - 7},${top - 10} ${at.x + 7},${top - 10} ${at.x},${top + 2}`);
      });

      // A radial layer's rings, one per stop, facing the view.
      const right = new THREE.Vector3().setFromMatrixColumn(cameraRef.current.matrixWorld, 0).normalize();
      const ringRadii =
        layer.gradientType === "radial"
          ? layer.stops.map((stop) => {
              const distance = world(pointOnAxis(layer, stopDistance(layer, stop.position))).distanceTo(originWorld);
              const edge = toScreen(originWorld.clone().addScaledVector(right, distance));
              return edge ? edge.distanceTo(originAt) : 0;
            })
          : [];
      pool(rings, ringRadii.length, () => svgElement("circle", "depth-gizmo-ring")).forEach((ring, i) => {
        ring.setAttribute("cx", `${originAt.x}`);
        ring.setAttribute("cy", `${originAt.y}`);
        ring.setAttribute("r", `${ringRadii[i]}`);
      });

      pool(stops, layer.stops.length, () => svgElement("circle", "depth-gizmo-handle depth-gizmo-stop")).forEach((dot, i) => {
        const stop = layer.stops[i];
        const at = toScreen(world(pointOnAxis(layer, stopDistance(layer, stop.position))));
        dot.style.display = at ? "" : "none";
        if (!at) return;
        dot.dataset.handle = `stop:${i}`;
        dot.setAttribute("cx", `${at.x}`);
        dot.setAttribute("cy", `${at.y}`);
        dot.setAttribute("r", "6");
        dot.style.fill = stop.color;
      });
    };

    // -- Dragging -----------------------------------------------------------------------------

    const parseHandle = (value: string | undefined): Handle | null => {
      if (value === "near" || value === "far") return { kind: value };
      const index = value?.startsWith("stop:") ? Number(value.slice(5)) : NaN;
      return Number.isInteger(index) ? { kind: "stop", index } : null;
    };

    // The layer being dragged, as it is now, with its object's matrix.
    const draggedLayer = () => {
      if (!gesture) return null;
      const target = findTarget(objectManager);
      return target && target.entityId === gesture.entityId && target.layer.id === gesture.layerId ? target : null;
    };

    const applyMove = () => {
      moveFrame = 0;
      const event = pendingMove;
      pendingMove = null;
      const target = draggedLayer();
      if (!event || !gesture || !target) return;
      const { layer, matrix } = target;
      const toLocal = matrix.clone().invert();
      const ray = rayAt(event);

      let updates: Partial<DepthLayer> | null = null;
      const { handle } = gesture;
      if (handle.kind === "far") {
        const hit = gesture.plane && ray.intersectPlane(gesture.plane, new THREE.Vector3());
        if (!hit) return;
        updates = dragFar(layer, hit.applyMatrix4(toLocal));
      } else {
        const distance = distanceAlongAxis(layer, ray.applyMatrix4(toLocal));
        if (distance === null) return;
        updates =
          handle.kind === "near"
            ? { near: dragNear(layer, distance) }
            : { stops: layer.stops.map((stop, i) => (i === handle.index ? { ...stop, position: dragStop(layer, distance) } : stop)) };
      }
      store().updateMaterialLayer(gesture.entityId, gesture.layerId, updates);
      // The first write records the undo step; the rest of the drag joins it.
      if (!gesture.historyPaused) {
        useEditorStore.temporal.getState().pause();
        gesture.historyPaused = true;
      }
    };

    const onMove = (event: PointerEvent) => {
      pendingMove = event;
      if (!moveFrame) moveFrame = window.requestAnimationFrame(applyMove);
    };

    const onUp = () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
      if (moveFrame) {
        window.cancelAnimationFrame(moveFrame);
        applyMove();
      }
      if (gesture?.historyPaused) useEditorStore.temporal.getState().resume();
      gesture = null;
      svg.classList.remove("dragging");
    };

    const onPointerDown = (event: PointerEvent) => {
      const handle = parseHandle((event.target as SVGElement).dataset?.handle);
      const target = findTarget(objectManager);
      if (!handle || !target || event.button !== 0 || gesture) return;
      event.stopPropagation();
      event.preventDefault();
      const { layer, matrix } = target;
      // Far moves across the view, on the plane through where it starts.
      const plane = handle.kind === "far" ? viewPlaneThrough(pointOnAxis(layer, layer.far).applyMatrix4(matrix)) : null;
      gesture = { handle, entityId: target.entityId, layerId: layer.id, plane, historyPaused: false };
      svg.classList.add("dragging");
      window.addEventListener("pointermove", onMove);
      window.addEventListener("pointerup", onUp);
      window.addEventListener("pointercancel", onUp);
    };

    // The gizmo on the origin: its drag moves the origin (one undo step; useViewportControls resumes
    // history when any gizmo drag ends).
    const onGizmoChange = () => {
      const target = findTarget(objectManager);
      if (transformControls?.object !== anchorProxy || !target) return;
      const local = anchorProxy.position.clone().applyMatrix4(target.matrix.clone().invert());
      store().updateMaterialLayer(target.entityId, target.layer.id, { origin: [local.x, local.y, local.z] });
      if (transformControls.dragging) useEditorStore.temporal.getState().pause();
    };
    transformControls?.addEventListener("objectChange", onGizmoChange);

    // -- Keys and the mode ending -------------------------------------------------------------

    const isTyping = () => {
      const active = document.activeElement;
      return !!active && (active.tagName === "INPUT" || active.tagName === "TEXTAREA" || active.getAttribute("contenteditable") === "true");
    };

    // Before useHotkeys: Enter and Escape end editing; the object's transform keys and Delete wait.
    const onKeyDown = (event: KeyboardEvent) => {
      if (!store().depthEdit || isTyping() || event.ctrlKey || event.metaKey || event.altKey) return;
      const key = event.key.toLowerCase();
      if (key === "enter" || key === "escape") store().setDepthEdit(null);
      else if (!["w", "e", "r", "delete", "backspace"].includes(key)) return;
      event.preventDefault();
      event.stopImmediatePropagation();
    };
    window.addEventListener("keydown", onKeyDown, true);

    // Selecting something else, or the layer going (removed, turned off, undone), ends editing.
    const unsubscribe = useEditorStore.subscribe(
      (state) => !!state.depthEdit && !editedLayer(state),
      (stale) => {
        if (stale) store().setDepthEdit(null);
      },
    );

    svg.addEventListener("pointerdown", onPointerDown);
    hide();

    return () => {
      svg.removeEventListener("pointerdown", onPointerDown);
      transformControls?.removeEventListener("objectChange", onGizmoChange);
      window.removeEventListener("keydown", onKeyDown, true);
      unsubscribe();
      scene.remove(anchorProxy);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
      if (moveFrame) window.cancelAnimationFrame(moveFrame);
      if (gesture?.historyPaused) useEditorStore.temporal.getState().resume();
      frameRef.current = null;
      svg.remove();
    };
    // Created once against the renderer, scene and controls (the camera is read through its ref).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rendererRef, scene, objectManager]);

  return anchorProxyRef;
}
