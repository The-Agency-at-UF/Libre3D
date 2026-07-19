import { useEffect, useRef, useState, useMemo } from "react";
import * as THREE from "three";
import { useEditorStore } from "../store/useEditorStore";
import { SceneManager } from "../viewport/SceneManager";
import { CameraManager } from "../viewport/CameraManager";
import { ObjectManager } from "../viewport/ObjectManager";
import { useViewportRenderer } from "../viewport/hooks/useViewportRenderer";
import { useViewportControls } from "../viewport/hooks/useViewportControls";
import { useViewportRaycaster } from "../viewport/hooks/useViewportRaycaster";
import { prepareModelImport } from "../utils/importModel";

export function ViewportCanvas() {
  const wrapperRef   = useRef<HTMLDivElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // -- Store --
  const projectionMode  = useEditorStore((state) => state.projectionMode);
  const frame           = useEditorStore((state) => state.frame);
  const activeProfileId = useEditorStore((state) => state.activeProfileId);
  const activeProfile   = useEditorStore((state) => state.cameraProfiles[activeProfileId] ?? state.cameraProfiles.personal);
  const isPreviewMode   = useEditorStore((state) => state.isPreviewMode);
  const sceneSettings   = useEditorStore((state) => state.sceneSettings);
  const entities        = useEditorStore((state) => state.entities);
  const selectedEntityIds = useEditorStore((state) => state.selectedEntityIds);

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

  // -- Multi-select Proxy --
  const selectionProxyRef = useRef(new THREE.Group());
  const initialOffsetsRef = useRef<Map<string, THREE.Matrix4>>(new Map());

  useEffect(() => {
    const proxy = selectionProxyRef.current;
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
  const rendererRef = useViewportRenderer(containerRef, scene, cameraRef);

  const { orbitControlsRef, transformControlsRef } = useViewportControls(
    cameraRef,
    rendererRef,
    scene
  );

  useViewportRaycaster(
    cameraRef,
    rendererRef,
    objectManager.getMeshes(),
    transformControlsRef
  );

  // -- Proxy Setup --
  useEffect(() => {
    const proxy = selectionProxyRef.current;
    scene.add(proxy);
    return () => {
      scene.remove(proxy);
    };
  }, [scene]);

  // -- Multi-select Drag Handlers --
  useEffect(() => {
    const tc = transformControlsRef.current;
    if (!tc) return;

    const onDragChange = (event: any) => {
      const isDragging = event.value;
      const proxy = selectionProxyRef.current;
      if (isDragging && tc.object === proxy) {
        initialOffsetsRef.current.clear();
        proxy.updateMatrixWorld(true);
        const proxyInverse = proxy.matrixWorld.clone().invert();
        useEditorStore.getState().selectedEntityIds.forEach(id => {
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
        const updates: Record<string, any> = {};
        proxy.updateMatrixWorld(true);
        const proxyMat = proxy.matrixWorld;
        useEditorStore.getState().selectedEntityIds.forEach(id => {
          const localMat = initialOffsetsRef.current.get(id);
          if (localMat) {
            const newWorldMat = proxyMat.clone().multiply(localMat);
            const pos = new THREE.Vector3();
            const quat = new THREE.Quaternion();
            const scale = new THREE.Vector3();
            newWorldMat.decompose(pos, quat, scale);
            const rot = new THREE.Euler().setFromQuaternion(quat);
            updates[id] = { position: pos.toArray(), rotation: rot.toArray(), scale: scale.toArray() };
          }
        });
        useEditorStore.getState().updateMultipleEntityTransforms(updates);
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
  }, [cameraManager, activeProfile, projectionMode, orbitControlsRef, cameraRef]);

  // -- Sync Entities --
  useEffect(() => {
    if (!objectManager || !sceneManager) return;
    const transformTarget = transformControlsRef.current?.object ?? null;
    const isDragging      = !!transformControlsRef.current?.dragging;

    objectManager.syncMeshes(entities, transformTarget, isDragging);

    const locked = selectedEntityIds.some(id => objectManager.getObject(id)?.userData.locked);
    if (locked || selectedEntityIds.length === 0) {
      transformControlsRef.current?.detach();
    } else if (selectedEntityIds.length === 1) {
      const selectedObj = objectManager.getObject(selectedEntityIds[0]);
      if (selectedObj) transformControlsRef.current?.attach(selectedObj);
    } else {
      const proxy = selectionProxyRef.current;
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
      
      transformControlsRef.current?.attach(proxy);
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
  }, [entities, selectedEntityIds, objectManager, sceneManager, transformControlsRef]);

  // -- Resize Logic --
  useEffect(() => {
    const container = containerRef.current;
    if (!container || !cameraManager || !rendererRef.current) return;

    const resizeObserver = new ResizeObserver(() => {
      const w = container.clientWidth  || 1;
      const h = container.clientHeight || 1;
      cameraManager.updateAspect(w, h);
      rendererRef.current?.setSize(w, h, false);
    });

    resizeObserver.observe(container);
    return () => resizeObserver.disconnect();
  }, [cameraManager, rendererRef]);

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

      const leftInset  = leftSidebar    ? Math.max(0, leftSidebar.getBoundingClientRect().right    - viewportRect.left)  : 280;
      const rightInset = rightSidebar   ? Math.max(0, viewportRect.right - rightSidebar.getBoundingClientRect().left)    : 320;
      const topInset   = floatingToolbar ? Math.max(0, floatingToolbar.getBoundingClientRect().bottom - viewportRect.top) : 0;

      const availableWidth  = Math.max(1, viewportRect.width  - leftInset - rightInset);
      const availableHeight = Math.max(1, viewportRect.height - topInset);
      const nextScale = Math.min(1, availableWidth / frame.width, availableHeight / frame.height);
      setAutoScaleFactor(Number.isFinite(nextScale) ? Math.max(nextScale, 0.1) : 1);
    };

    updateScale();
    const observer = new ResizeObserver(updateScale);
    observer.observe(viewportHost);
    return () => observer.disconnect();
  }, [frame.mode, frame.width, frame.height]);


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

  // -- Drag-and-drop .glb import --
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleDragOver = (event: DragEvent) => {
      event.preventDefault();
    };

    const handleDrop = (event: DragEvent) => {
      event.preventDefault();
      const files = event.dataTransfer?.files;
      if (!files || files.length === 0) return;

      Array.from(files).forEach((file) => {
        prepareModelImport(file)
          .then(({ assetId, nodes }) => {
            useEditorStore.getState().addImportedModelHierarchy(assetId, nodes);
          })
          .catch((error) => {
            console.error("[Libre3D] Failed to import dropped model:", error);
          });
      });
    };

    container.addEventListener("dragover", handleDragOver);
    container.addEventListener("drop", handleDrop);
    return () => {
      container.removeEventListener("dragover", handleDragOver);
      container.removeEventListener("drop", handleDrop);
    };
  }, []);

  const frameScaleLabel = `${Math.round(autoScaleFactor * 100)}%`;

  return (
    <div
      ref={wrapperRef}
      className="viewport-sandbox-wrapper"
      style={{
        display:         isPreviewMode ? "none" : "flex",
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
      {frame.mode === "fixed" && (
        <div className="badge green viewport-sandbox-badge">
          {frame.width.toLocaleString()} × {frame.height.toLocaleString()} ({frameScaleLabel})
        </div>
      )}
    </div>
  );
}
