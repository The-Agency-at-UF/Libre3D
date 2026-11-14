import { useEffect, useRef, type RefObject } from "react";
import * as THREE from "three";
import type { TransformControls } from "three/examples/jsm/controls/TransformControls.js";
import { resolveState, unwrapRotation, type StateValues } from "../../animation/objectStates";
import { filterMoveRoots, getEntityIndex } from "../../scene/entityIndex";
import { selectViewedObjectState, useEditorStore } from "../../store/useEditorStore";
import type { ObjectManager } from "../ObjectManager";

/**
 * Manages the invisible stand-in group that TransformControls attaches to when two or more objects
 * are selected, and translates gizmo drags on that stand-in into store writes for each selected root.
 *
 * Only the selection's move roots are driven by the proxy. A selected descendant of another selected
 * entity already follows its parent through the scene graph; writing it too would solve its local
 * transform against the parent's pre-update matrix and then move it again when the parent syncs —
 * an overshoot that compounds per nesting level (visible as skinned meshes smearing when box-select
 * grabs a whole bone chain).
 */
export function useMultiSelectProxy(
  scene: THREE.Scene,
  objectManager: ObjectManager,
  transformControlsRef: RefObject<TransformControls | null>,
): RefObject<THREE.Group> {
  const selectionProxyRef = useRef(new THREE.Group());
  const initialOffsetsRef = useRef<Map<string, THREE.Matrix4>>(new Map());

  useEffect(() => {
    const proxy = selectionProxyRef.current;
    proxy.userData.editorOnly = true; // never exported — see hideEditorOnlyObjects
    scene.add(proxy);
    return () => {
      scene.remove(proxy);
    };
  }, [scene]);

  useEffect(() => {
    const tc = transformControlsRef.current;
    if (!tc) return;

    const getDragRootIds = () => {
      const { entities, selectedEntityIds } = useEditorStore.getState();
      return filterMoveRoots(entities, selectedEntityIds);
    };

    const onDragChange = (event: any) => {
      const isDragging = event.value;
      const proxy = selectionProxyRef.current;
      if (isDragging && tc.object === proxy) {
        initialOffsetsRef.current.clear();
        proxy.updateMatrixWorld(true);
        const proxyInverse = proxy.matrixWorld.clone().invert();
        getDragRootIds().forEach((id) => {
          const obj = objectManager.getObject(id);
          if (obj) {
            obj.updateMatrixWorld(true);
            initialOffsetsRef.current.set(id, proxyInverse.clone().multiply(obj.matrixWorld));
          }
        });
      }
    };

    const onObjectChange = () => {
      const target = tc.object;
      const proxy = selectionProxyRef.current;
      if (target === proxy) {
        const updates: Record<string, StateValues> = {};
        proxy.updateMatrixWorld(true);
        const proxyMat = proxy.matrixWorld;
        const store = useEditorStore.getState();
        const { byId } = getEntityIndex(store.entities);
        getDragRootIds().forEach((id) => {
          const localMat = initialOffsetsRef.current.get(id);
          const obj = objectManager.getObject(id);
          const entity = byId.get(id);
          if (localMat && obj && entity) {
            const newWorldMat = proxyMat.clone().multiply(localMat);
            // entity.position/rotation/scale are LOCAL to the object's parent —
            // solve the local matrix against the live parent's world matrix
            // before storing, otherwise parented entities (imported child nodes,
            // grouped children) get world values written into local fields and
            // jump on the next sync.
            const parent = obj.parent;
            if (parent) {
              parent.updateMatrixWorld(true);
              newWorldMat.premultiply(parent.matrixWorld.clone().invert());
            }
            const pos = new THREE.Vector3();
            const quat = new THREE.Quaternion();
            const scale = new THREE.Vector3();
            newWorldMat.decompose(pos, quat, scale);
            const rot = new THREE.Euler().setFromQuaternion(quat);
            // Where the object was shown: Base, or the state it's shown in (which the edit goes to).
            const shown = resolveState(entity, selectViewedObjectState(store, id));
            // Wrapped to ±180° by the quaternion; keep the turn nearest the stored one (see unwrapRotation).
            const next = { position: pos.toArray(), rotation: unwrapRotation([rot.x, rot.y, rot.z], shown.rotation), scale: scale.toArray() };
            // Only what this drag changed (decompose leaves float noise in the rest), so a state
            // doesn't start setting values it left to Base.
            updates[id] = Object.fromEntries(
              (["position", "rotation", "scale"] as const)
                .filter((key) => next[key].some((value, axis) => Math.abs(value - shown[key][axis]) > 1e-6))
                .map((key) => [key, next[key]]),
            );
          }
        });
        store.updateShownTransforms(updates);
        // As for one object (useViewportControls): the drag's first write recorded its undo step,
        // so the rest of the drag joins it. Tracking resumes when the drag ends.
        if (tc.dragging) useEditorStore.temporal.getState().pause();
      }
    };

    tc.addEventListener("dragging-changed", onDragChange);
    tc.addEventListener("objectChange", onObjectChange);
    return () => {
      tc.removeEventListener("dragging-changed", onDragChange);
      tc.removeEventListener("objectChange", onObjectChange);
    };
  }, [transformControlsRef, objectManager]);

  return selectionProxyRef;
}

