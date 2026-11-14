/**
 * PURPOSE: The editor's 3D viewport. Builds the scene, camera and object managers once, keeps them
 * in step with the store (scene settings, the active camera, the entities, and what the transform
 * gizmo holds), and leaves the rest to the viewport hooks:
 * - useViewportRenderer: the WebGL renderer and its frame loop
 * - useViewportControls: the orbit controls and the transform gizmo
 * - useViewportGizmo: the navigation gizmo in the top-right corner
 * - useViewportRaycaster: click and box selection
 * - useViewportPlay: Play's events, and the preview of one transition
 * - useViewportPenTool: drawing shapes and paths, and editing their points
 * - useViewportDepthGizmo: a Depth layer's handles
 * - useMultiSelectProxy: the stand-in the gizmo drags when several objects are selected
 * - useFrameAutoScale: the scale a fixed-size frame is shown at (its math is viewport/frameFit.ts)
 * - useCenterOnSelection: the "center on selected" and "orient to selected" events
 */

import { useEffect, useRef, useMemo } from "react";
import * as THREE from "three";
import type { ViewportGizmo } from "three-viewport-gizmo";
import { selectDrawnEntities, useEditorStore } from "../store/useEditorStore";

import { getEntityIndex } from "../scene/entityIndex";
import { fadingObjects, getViewedState, resolveState } from "../animation/objectStates";
import { SceneManager } from "../viewport/SceneManager";
import { setWireframe } from "../viewport/entityMaterials";
import { whenRendererReady } from "../viewport/rendererSettings";
import { createRoomEnvironment } from "../viewport/sceneEnvironment";
import { CameraManager } from "../viewport/CameraManager";
import { ObjectManager } from "../viewport/ObjectManager";
import { editorSceneSource } from "../viewport/editorSceneSource";
import { getLiveRenderer, setLiveScene } from "../viewport/liveViewport";
import { useViewportRenderer } from "../viewport/hooks/useViewportRenderer";
import { useViewportControls } from "../viewport/hooks/useViewportControls";
import { useViewportRaycaster } from "../viewport/hooks/useViewportRaycaster";
import { useViewportGizmo } from "../viewport/hooks/useViewportGizmo";
import { useViewportPlay } from "../viewport/hooks/useViewportPlay";
import { useViewportPenTool } from "../viewport/hooks/useViewportPenTool";
import { useViewportDepthGizmo } from "../viewport/hooks/useViewportDepthGizmo";
import { useMultiSelectProxy } from "../viewport/hooks/useMultiSelectProxy";
import { useFrameAutoScale } from "../viewport/hooks/useFrameAutoScale";
import { useCenterOnSelection } from "../viewport/hooks/useCenterOnSelection";

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
  // As they're drawn: an object that uses a material asset comes with the asset's layers.
  const entities        = useEditorStore(selectDrawnEntities);

  const selectedEntityIds = useEditorStore((state) => state.selectedEntityIds);
  const viewedStates    = useEditorStore((state) => state.viewedStates);
  const objectStates    = useEditorStore((state) => state.animation.states);

  const autoScaleFactor = useFrameAutoScale(wrapperRef, frame, isPreviewMode);

  // Initialize Managers synchronously so scene and camera are never undefined
  const managers = useMemo(() => {
    const storeState     = useEditorStore.getState();
    const initialProfile = storeState.cameraProfiles[storeState.activeProfileId] ?? storeState.cameraProfiles.personal;

    const sceneManager  = new SceneManager(storeState.sceneSettings);
    // Use aspect = 1 initially; ResizeObserver will correct it immediately after mount.
    const cameraManager = new CameraManager(initialProfile, storeState.projectionMode, 1);
    const objectManager = new ObjectManager(sceneManager.scene, new Map(), editorSceneSource, { getRenderer: getLiveRenderer });

    return { sceneManager, cameraManager, objectManager };
  }, []);

  const { sceneManager, cameraManager, objectManager } = managers;
  const scene = sceneManager.scene;

  // Dev-only console handle for manual and automated smoke tests. Set in an
  // effect so it always points at the committed managers, not a render pass
  // StrictMode discarded.
  useEffect(() => {
    if (import.meta.env.DEV) {
      (window as unknown as Record<string, unknown>).__libre3dViewport = { sceneManager, objectManager };
    }
  }, [sceneManager, objectManager]);

  // ── Single shared camera ref ─────────────────────────────────────────────
  // All three viewport hooks read from this ref so they always use the live
  // active camera, even after perspective ↔ orthographic switches.
  const cameraRef = useRef<THREE.Camera>(cameraManager.activeCamera);

  // Export and the Depth layer's reach read the live scene from outside the viewport (liveViewport.ts).
  useEffect(() => setLiveScene(sceneManager.scene), [sceneManager]);

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
    let environment: THREE.RenderTarget | null = null;
    let unmounted = false;
    // Once the renderer has started (useViewportRenderer starts it; this only waits for it).
    whenRendererReady(renderer).then(
      () => {
        if (unmounted) return;
        environment = createRoomEnvironment(renderer);
        sceneManager.setEnvironmentMap(environment.texture);
      },
      () => undefined, // useViewportRenderer reports a renderer that couldn't start
    );
    return () => {
      unmounted = true;
      sceneManager.setEnvironmentMap(null);
      environment?.dispose();
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

  const selectionProxyRef = useMultiSelectProxy(scene, objectManager, transformControlsRef);

  useCenterOnSelection(orbitControlsRef, objectManager, cameraRef);

  // -- Sync Scene Settings --
  useEffect(() => {
    if (!sceneManager) return;
    sceneManager.updateBackground(sceneSettings.bgColor);
    sceneManager.updateFog(sceneSettings.fogEnabled, sceneSettings.bgColor);
    sceneManager.updateLightIntensity(sceneSettings.lights.intensity);
    sceneManager.updateEnvironment(sceneSettings.environment.enabled, sceneSettings.environment.intensity);
    sceneManager.updateGridVisibility(sceneSettings.showGrid !== false);

    // Wireframe sync
    const applyWireframe = (mesh: THREE.Mesh) => {
      if ("wireframe" in mesh.material) setWireframe(mesh.material as THREE.MeshStandardMaterial, sceneSettings.wireframe);
    };
    objectManager?.getMeshes().forEach((obj) => {
      if (obj instanceof THREE.Mesh) {
        applyWireframe(obj);
      } else {
        obj.traverse((child) => {
          if (child instanceof THREE.Mesh) applyWireframe(child);
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

    // Before the sync, which draws the objects a state can fade as see-through ones.
    objectManager.setFadingObjects(fadingObjects(objectStates));
    objectManager.syncMeshes(entities, transformTarget, isDragging);

    // This effect runs on every edit, and the loops below visit every object: an entity is looked up
    // in the index and the selection in a set, not by searching the arrays once per object.
    const { byId } = getEntityIndex(entities);
    const selectedIdSet = new Set(selectedEntityIds);

    // Objects shown in one of their states (syncMeshes just put everything in Base). Not the one the
    // gizmo is dragging: the drag already put it there, and writes into the state. Play shows every
    // object in Base; Stop runs this again, which puts each one back in the state picked for it.
    if (!isPreviewMode) {
      Object.keys(viewedStates).forEach((entityId) => {
        const objectState = getViewedState(viewedStates, objectStates, entityId);
        const entity = objectState && byId.get(entityId);
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
      const entity     = byId.get(id);
      const isSelected = selectedIdSet.has(id);
      if (obj.userData.selectionOutline) {
        // Hidden while a Depth layer is edited (as Spline does), so the box doesn't hide the gradient.
        (obj.userData.selectionOutline as THREE.LineSegments).visible = isSelected && !isEditingDepth && (entity?.visible ?? true);
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
