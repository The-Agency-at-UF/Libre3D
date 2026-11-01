import { useEffect, useRef, useState, useMemo } from "react";
import * as THREE from "three";
import type { ViewportGizmo } from "three-viewport-gizmo";
import { selectViewedObjectState, useEditorStore } from "../store/useEditorStore";
import { filterMoveRoots } from "../store/entityIndex";
import { getViewedState, resolveState, unwrapRotation, type StateValues } from "../animation/objectStates";
import { SceneManager } from "../viewport/SceneManager";
import { createRoomEnvironment } from "../viewport/sceneEnvironment";
import { CameraManager } from "../viewport/CameraManager";
import { ObjectManager } from "../viewport/ObjectManager";
import { useViewportRenderer } from "../viewport/hooks/useViewportRenderer";
import { useViewportControls } from "../viewport/hooks/useViewportControls";
import { useViewportRaycaster } from "../viewport/hooks/useViewportRaycaster";
import { useViewportGizmo } from "../viewport/hooks/useViewportGizmo";
import { useViewportPlay } from "../viewport/hooks/useViewportPlay";
import { useViewportPenTool } from "../viewport/hooks/useViewportPenTool";
import { useViewportDepthGizmo } from "../viewport/hooks/useViewportDepthGizmo";

export function ViewportCanvas() {
  const wrapperRef   = useRef<HTMLDivElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // -- Store --
  const projectionMode  = useEditorStore((state) => state.projectionMode);
  const frame           = useEditorStore((state) => state.frame);
  const activeProfileId = useEditorStore((state) => state.activeProfileId);
  const activeProfile   = useEditorStore((state) => state.cameraProfiles[activeProfileId] ?? state.cameraProfiles.personal);
  const isPreviewMode   = useEditorStore((state) => state.isPreviewMode);
  const isPreviewingAction = useEditorStore((state) => state.previewingActionId !== null);
  const isReadOnly      = useEditorStore((state) => state.readOnlyReason !== null);
  const isPenOn         = useEditorStore((state) => state.penTool !== null);
  const isEditingPoint  = useEditorStore((state) => state.penTool?.mode === "edit" && state.penTool.selectedPoints.length > 0);
  const isEditingDepth  = useEditorStore((state) => state.depthEdit !== null);
  const sceneSettings   = useEditorStore((state) => state.sceneSettings);
  const entities        = useEditorStore((state) => state.entities);
  const selectedEntityIds = useEditorStore((state) => state.selectedEntityIds);
  const viewedStates    = useEditorStore((state) => state.viewedStates);
  const objectStates    = useEditorStore((state) => state.animation.states);

  const [autoScaleFactor, setAutoScaleFactor] = useState(1);

  // Initialize Managers synchronously so scene and camera are never undefined
  const managers = useMemo(() => {
    const storeState     = useEditorStore.getState();
    const initialProfile = storeState.cameraProfiles[storeState.activeProfileId] ?? storeState.cameraProfiles.personal;

    const sceneManager  = new SceneManager(storeState.sceneSettings);
    // Use aspect = 1 initially; ResizeObserver will correct it immediately after mount.
    const cameraManager = new CameraManager(initialProfile, storeState.projectionMode, 1);
    const objectManager = new ObjectManager(sceneManager.scene, new Map());

    return { sceneManager, cameraManager, objectManager };
  }, []);

  const { sceneManager, cameraManager, objectManager } = managers;
  const scene = sceneManager.scene;

  // Dev-only console handle for manual smoke tests (no test suite — the THREE
  // graph is inspected from the devtools console, see main.tsx). Set in an
  // effect so it always points at the committed managers, not a render pass
  // StrictMode discarded.
  useEffect(() => {
    if (import.meta.env.DEV) {
      (window as unknown as Record<string, unknown>).__libre3dViewport = { sceneManager, objectManager };
    }
  }, [sceneManager, objectManager]);

  // -- Multi-select Proxy --
  const selectionProxyRef = useRef(new THREE.Group());
  const initialOffsetsRef = useRef<Map<string, THREE.Matrix4>>(new Map());

  useEffect(() => {
    const proxy = selectionProxyRef.current;
    proxy.userData.editorOnly = true; // never exported — see hideEditorOnlyObjects
    scene.add(proxy);
    return () => { scene.remove(proxy); };
  }, [scene]);

  // ── Single shared camera ref ─────────────────────────────────────────────
  // All three viewport hooks read from this ref so they always use the live
  // active camera, even after perspective ↔ orthographic switches.
  const cameraRef = useRef<THREE.Camera>(cameraManager.activeCamera);

  useEffect(() => {
    (window as any).__libre3dScene = sceneManager.scene;
    return () => {
      if ((window as any).__libre3dScene === sceneManager.scene) {
        delete (window as any).__libre3dScene;
      }
    };
  }, [sceneManager]);



  // -- Setup Hooks --
  // Declared before useViewportRenderer (and populated later, by
  // useViewportGizmo below) so the render loop's onAfterRender callback can
  // close over this ref and pick up the gizmo once it exists — see the
  // "render ordering" note in useViewportGizmo.ts.
  const gizmoRef = useRef<ViewportGizmo | null>(null);
  // Filled by useViewportPlay below, like gizmoRef: moves the objects Play's events are moving,
  // before each render.
  const playFrameRef = useRef<(() => void) | null>(null);
  // Filled by useViewportPenTool: shows the path being drawn or edited, after Play's poses.
  const penFrameRef = useRef<(() => void) | null>(null);
  // Filled by useViewportDepthGizmo: places the selected object's Depth layer handles.
  const depthFrameRef = useRef<(() => void) | null>(null);

  const rendererRef = useViewportRenderer(
    containerRef,
    scene,
    cameraRef,
    () => {
      playFrameRef.current?.();
      penFrameRef.current?.();
      depthFrameRef.current?.();
    },
    // Not in Play, which shows no editor furniture (the gizmo draws whether or not it's enabled).
    () => {
      if (!useEditorStore.getState().isPreviewMode) gizmoRef.current?.render();
    }
  );

  // The environment light is made once the renderer exists (it renders the room on the GPU), and
  // shown or hidden by the scene settings below.
  useEffect(() => {
    const renderer = rendererRef.current;
    if (!renderer) return;
    const environment = createRoomEnvironment(renderer);
    sceneManager.setEnvironmentMap(environment.texture);
    return () => {
      sceneManager.setEnvironmentMap(null);
      environment.dispose();
    };
  }, [sceneManager, rendererRef]);

  const { orbitControlsRef, transformControlsRef } = useViewportControls(
    cameraRef,
    rendererRef,
    scene
  );

  // Top-right navigation gizmo (Blender-style). Must be set up after
  // useViewportControls so orbitControlsRef.current already exists — see its
  // own doc comment for the full render/camera-swap wiring.
  useViewportGizmo(gizmoRef, cameraRef, rendererRef, orbitControlsRef, containerRef);

  useViewportRaycaster(
    cameraRef,
    rendererRef,
    objectManager.getMeshes(),
    transformControlsRef
  );

  useViewportPlay(playFrameRef, cameraRef, rendererRef, objectManager);

  const penAnchorRef = useViewportPenTool(penFrameRef, cameraRef, rendererRef, scene, objectManager, orbitControlsRef, transformControlsRef);

  const depthAnchorRef = useViewportDepthGizmo(depthFrameRef, cameraRef, rendererRef, scene, objectManager, transformControlsRef);

  // -- Proxy Setup --
  useEffect(() => {
    const proxy = selectionProxyRef.current;
    scene.add(proxy);
    return () => {
      scene.remove(proxy);
    };
  }, [scene]);

  // -- Multi-select Drag Handlers --
  // Only the selection's move roots are driven by the proxy. A selected
  // descendant of another selected entity already follows its parent through
  // the scene graph; writing it too would solve its local transform against the
  // parent's pre-update matrix and then move it again when the parent syncs —
  // an overshoot that compounds per nesting level (visible as skinned meshes
  // smearing when box-select grabs a whole bone chain).
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
        getDragRootIds().forEach(id => {
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
        const { entities } = store;
        getDragRootIds().forEach(id => {
          const localMat = initialOffsetsRef.current.get(id);
          const obj = objectManager.getObject(id);
          const entity = entities.find(e => e.id === id);
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

  // -- Sync Scene Settings --
  useEffect(() => {
    if (!sceneManager) return;
    sceneManager.updateBackground(sceneSettings.bgColor);
    sceneManager.updateFog(sceneSettings.fogEnabled, sceneSettings.bgColor);
    sceneManager.updateLightIntensity(sceneSettings.lights.intensity);
    sceneManager.updateEnvironment(sceneSettings.environment.enabled, sceneSettings.environment.intensity);
    sceneManager.updateGridVisibility(sceneSettings.showGrid !== false);

    // Wireframe sync
    objectManager?.getMeshes().forEach((obj) => {
      if (obj instanceof THREE.Mesh) {
        if ("wireframe" in obj.material) {
          (obj.material as THREE.MeshStandardMaterial).wireframe = sceneSettings.wireframe;
        }
      } else {
        obj.traverse((child) => {
          if (child instanceof THREE.Mesh && "wireframe" in child.material) {
            (child.material as THREE.MeshStandardMaterial).wireframe = sceneSettings.wireframe;
          }
        });
      }
    });
  }, [sceneManager, sceneSettings, objectManager]);

  // -- Sync Camera Profile --
  useEffect(() => {
    if (!cameraManager || !orbitControlsRef.current) return;

    // Update the manager and write the new active camera into the shared ref
    // BEFORE anything reads from cameraRef this frame.
    cameraManager.setActiveMode(projectionMode);
    cameraManager.syncWithProfile(activeProfile, orbitControlsRef.current.target);

    const nextCamera = cameraManager.activeCamera;
    cameraRef.current = nextCamera;

    // Tell OrbitControls to track the new camera object.
    orbitControlsRef.current.object = nextCamera;
    orbitControlsRef.current.update();

    // Keep the nav gizmo pointed at whichever camera is now active —
    // ViewportGizmo doesn't follow cameraRef automatically (it holds a
    // direct camera reference, not a ref), so it has to be told explicitly
    // on every perspective ↔ orthographic swap, same as OrbitControls.object
    // just above. See useViewportGizmo.ts's "Camera swaps" doc note.
    if (gizmoRef.current) {
      gizmoRef.current.camera = nextCamera as THREE.PerspectiveCamera | THREE.OrthographicCamera;
      gizmoRef.current.update();
    }
  }, [cameraManager, activeProfile, projectionMode, orbitControlsRef, cameraRef, gizmoRef]);

  // -- Sync Entities --
  useEffect(() => {
    if (!objectManager || !sceneManager) return;
    const transformTarget = transformControlsRef.current?.object ?? null;
    const isDragging      = !!transformControlsRef.current?.dragging;

    objectManager.syncMeshes(entities, transformTarget, isDragging);

    // Objects shown in one of their states (syncMeshes just put everything in Base). Not the one the
    // gizmo is dragging: the drag already put it there, and writes into the state. Play shows every
    // object in Base; Stop runs this again, which puts each one back in the state picked for it.
    if (!isPreviewMode) {
      Object.keys(viewedStates).forEach((entityId) => {
        const objectState = getViewedState(viewedStates, objectStates, entityId);
        const entity = objectState && entities.find((e) => e.id === entityId);
        const isDraggedObject = isDragging && transformTarget === objectManager.getObject(entityId);
        if (entity && !isDraggedObject) objectManager.applyPose(entityId, resolveState(entity, objectState));
      });
    }

    const tc = transformControlsRef.current;
    const locked = selectedEntityIds.some(id => objectManager.getObject(id)?.userData.locked);
    // Play hides the gizmo (useViewportRenderer), so detach it there: otherwise it
    // stays draggable while invisible. View only: TransformControls moves the
    // object itself before the store (which drops the change) hears of it, so
    // there must be no gizmo to drag. A ▶ preview moves objects through poses
    // that aren't theirs; a drag then would save one (useViewportPlay). The pen
    // clicks where the gizmo would be, except on a path's picked point, which the
    // gizmo moves (useViewportPenTool places its stand-in there). Editing a Depth layer, the gizmo
    // moves the layer's origin, not the object (useViewportDepthGizmo's stand-in).
    const activeTool = useEditorStore.getState().activeTransformTool;
    if (isPreviewMode || isPreviewingAction || isReadOnly || (isPenOn && !isEditingPoint) || locked || selectedEntityIds.length === 0) {
      tc?.detach();
    } else if (isEditingPoint) {
      if (tc && tc.object !== penAnchorRef.current) {
        tc.setMode("translate");
        tc.attach(penAnchorRef.current);
      }
    } else if (isEditingDepth) {
      if (tc && tc.object !== depthAnchorRef.current) {
        tc.setMode("translate");
        tc.attach(depthAnchorRef.current);
      }
    } else if (selectedEntityIds.length === 1) {
      const selectedObj = objectManager.getObject(selectedEntityIds[0]);
      // Re-attaching every render (this effect re-runs on every entities change,
      // i.e. every frame of a gizmo drag since we write the transform back to the
      // store) resets the gizmo and makes the drag jitter. Only (re)attach when
      // the target actually changed.
      if (selectedObj && tc && tc.object !== selectedObj) {
        tc.setMode(activeTool);
        tc.attach(selectedObj);
      }
    } else {
      const proxy = selectionProxyRef.current;
      // While a multi-select drag is in progress, don't recompute the proxy's
      // center and re-attach — that would move the proxy out from under the
      // active gizmo drag each frame and fight the gesture. Only rebuild the
      // proxy when the selection is settled (not mid-drag).
      const draggingProxy = isDragging && tc?.object === proxy;
      if (!draggingProxy) {
        const box = new THREE.Box3();
        selectedEntityIds.forEach(id => {
          const obj = objectManager.getObject(id);
          if (obj) box.expandByObject(obj);
        });
        const center = new THREE.Vector3();
        box.getCenter(center);
        proxy.position.copy(center);
        proxy.rotation.set(0, 0, 0);
        proxy.scale.set(1, 1, 1);
        proxy.updateMatrixWorld();

        if (tc && tc.object !== proxy) {
          tc.setMode(activeTool);
          tc.attach(proxy);
        }
      }
    }

    // Helper visibility
    objectManager.getMeshes().forEach((obj, id) => {
      const entity     = entities.find(e => e.id === id);
      const isSelected = selectedEntityIds.includes(id);
      if (obj.userData.selectionOutline) {
        (obj.userData.selectionOutline as THREE.LineSegments).visible = isSelected && (entity?.visible ?? true);
      }
      if (obj.userData.helper) {
        const helper = obj.userData.helper as THREE.DirectionalLightHelper;
        if (entity?.visible) {
          if (!helper.parent) sceneManager.scene.add(helper);
          helper.visible = true;
          helper.color   = isSelected ? 0xfde047 : 0xffffff;
          helper.update();
        } else {
          if (helper.parent) helper.parent.remove(helper);
          helper.visible = false;
        }
      }
    });
  }, [entities, selectedEntityIds, viewedStates, objectStates, objectManager, sceneManager, transformControlsRef, isPreviewMode, isPreviewingAction, isReadOnly, isPenOn, isEditingPoint, penAnchorRef, isEditingDepth, depthAnchorRef]);

  // -- Resize Logic --
  useEffect(() => {
    const container = containerRef.current;
    if (!container || !cameraManager || !rendererRef.current) return;

    const resizeObserver = new ResizeObserver(() => {
      const w = container.clientWidth  || 1;
      const h = container.clientHeight || 1;
      cameraManager.updateAspect(w, h);
      rendererRef.current?.setSize(w, h, false);

      // Re-sync the nav gizmo's DOM rect + its renderer-viewport snapshot
      // *after* the line above, in this same callback, not from a second
      // ResizeObserver of the gizmo's own. ViewportGizmo.update() snapshots
      // whatever the renderer's current viewport is at the moment it's
      // called, then restores exactly that snapshot after every future
      // render() — so it has to run after setSize() has corrected that
      // viewport, not racing it from an independently-scheduled observer
      // callback on the same element (that ordering isn't guaranteed, and
      // losing the race is what caused the viewport to collapse into a
      // small stale corner shortly after load). See useViewportGizmo.ts's
      // "Resize" doc note for the full explanation.
      gizmoRef.current?.update();
    });

    resizeObserver.observe(container);
    return () => resizeObserver.disconnect();
  }, [cameraManager, rendererRef, gizmoRef]);

  // -- Auto Scale Logic (Fixed Frame Mode) --
  useEffect(() => {
    const wrapper      = wrapperRef.current;
    const viewportHost = wrapper?.parentElement;
    if (!wrapper || !viewportHost) {
      setAutoScaleFactor(1);
      return;
    }

    const updateScale = () => {
      if (frame.mode !== "fixed") {
        setAutoScaleFactor(1);
        return;
      }
      const viewportRect   = viewportHost.getBoundingClientRect();
      const leftSidebar    = document.querySelector<HTMLElement>(".left-sidebar");
      const rightSidebar   = document.querySelector<HTMLElement>(".right-sidebar");
      const floatingToolbar = document.querySelector<HTMLElement>(".floating-toolbar");

      // Play hides the sidebars and the toolbar, so the frame gets the whole viewport.
      const leftInset  = isPreviewMode ? 0 : leftSidebar    ? Math.max(0, leftSidebar.getBoundingClientRect().right    - viewportRect.left)  : 280;
      const rightInset = isPreviewMode ? 0 : rightSidebar   ? Math.max(0, viewportRect.right - rightSidebar.getBoundingClientRect().left)    : 320;
      const topInset   = isPreviewMode ? 0 : floatingToolbar ? Math.max(0, floatingToolbar.getBoundingClientRect().bottom - viewportRect.top) : 0;

      const availableWidth  = Math.max(1, viewportRect.width  - leftInset - rightInset);
      const availableHeight = Math.max(1, viewportRect.height - topInset);
      const nextScale = Math.min(1, availableWidth / frame.width, availableHeight / frame.height);
      setAutoScaleFactor(Number.isFinite(nextScale) ? Math.max(nextScale, 0.1) : 1);
    };

    updateScale();
    const observer = new ResizeObserver(updateScale);
    observer.observe(viewportHost);
    return () => observer.disconnect();
  }, [frame.mode, frame.width, frame.height, isPreviewMode]);


  // -- Viewport centering events --
  useEffect(() => {
    const handleCenterOnSelected = () => {
      if (!orbitControlsRef.current || !objectManager) return;
      const selectedIds = useEditorStore.getState().selectedEntityIds;
      if (selectedIds.length === 0) return;

      const box = new THREE.Box3();
      selectedIds.forEach(id => {
        const mesh = objectManager.getObject(id);
        if (mesh) {
           const targetPos = new THREE.Vector3();
           mesh.getWorldPosition(targetPos);
           box.expandByPoint(targetPos);
        }
      });
      const center = new THREE.Vector3();
      box.getCenter(center);
      
      const camera    = cameraRef.current;
      const offset = new THREE.Vector3().subVectors(camera.position, orbitControlsRef.current.target);
      orbitControlsRef.current.target.copy(center);
      camera.position.copy(center).add(offset);
      orbitControlsRef.current.update();
    };

    const handleOrientateToSelected = () => {
      if (!orbitControlsRef.current || !objectManager) return;
      const selectedIds = useEditorStore.getState().selectedEntityIds;
      if (selectedIds.length === 0) return;

      const box = new THREE.Box3();
      selectedIds.forEach(id => {
        const mesh = objectManager.getObject(id);
        if (mesh) {
           const targetPos = new THREE.Vector3();
           mesh.getWorldPosition(targetPos);
           box.expandByPoint(targetPos);
        }
      });
      const center = new THREE.Vector3();
      box.getCenter(center);

      const camera        = cameraRef.current;
      orbitControlsRef.current.target.copy(center);
      const currentZoom   = useEditorStore.getState().viewportZoom || 100;
      const defaultDistance = 11.180339887498949;
      camera.position.set(
        center.x,
        center.y,
        center.z + defaultDistance * (100 / currentZoom)
      );
      orbitControlsRef.current.update();
    };

    window.addEventListener("libre3d-center-on-selected",    handleCenterOnSelected);
    window.addEventListener("libre3d-orientate-to-selected", handleOrientateToSelected);
    return () => {
      window.removeEventListener("libre3d-center-on-selected",    handleCenterOnSelected);
      window.removeEventListener("libre3d-orientate-to-selected", handleOrientateToSelected);
    };
  }, [orbitControlsRef, objectManager, cameraRef]);

  // Files dropped on the editor are imported by DropOverlay (EditorLayout), not here.

  const frameScaleLabel = `${Math.round(autoScaleFactor * 100)}%`;

  return (
    <div
      ref={wrapperRef}
      className="viewport-sandbox-wrapper"
      style={{
        display:         "flex",
        width:           frame.mode === "fixed" ? frame.width  : "100%",
        height:          frame.mode === "fixed" ? frame.height : "100%",
        transform:       frame.mode === "fixed" ? `scale(${autoScaleFactor})` : "scale(1)",
        transformOrigin: "center center",
      }}
    >
      <div
        ref={containerRef}
        className={`viewport-sandbox-container${frame.mode === "fixed" ? " fixed-bounds" : ""}`}
        style={{ width: "100%", height: "100%" }}
      />
      {frame.mode === "fixed" && !isPreviewMode && (
        <div className="badge green viewport-sandbox-badge">
          {frame.width.toLocaleString()} × {frame.height.toLocaleString()} ({frameScaleLabel})
        </div>
      )}
    </div>
  );
}
