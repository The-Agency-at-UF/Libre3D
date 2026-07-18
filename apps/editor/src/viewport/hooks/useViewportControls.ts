import { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { TransformControls } from "three/examples/jsm/controls/TransformControls.js";
import { useEditorStore } from "../../store/useEditorStore";

export function useViewportControls(
  // Accept a ref so OrbitControls / TransformControls always use the live camera.
  cameraRef: React.RefObject<THREE.Camera>,
  rendererRef: React.RefObject<THREE.WebGLRenderer | null>,
  scene: THREE.Scene
) {
  const orbitControlsRef = useRef<OrbitControls | null>(null);
  const transformControlsRef = useRef<TransformControls | null>(null);
  const profileCommitFrameRef = useRef<number | null>(null);

  useEffect(() => {
    if (!rendererRef.current) return;

    const camera = cameraRef.current;

    const orbitControls = new OrbitControls(camera, rendererRef.current.domElement);
    orbitControls.enableDamping = true;
    orbitControls.dampingFactor = 0.05;
    orbitControls.minZoom = 0.1;
    orbitControls.maxZoom = 5;
    orbitControls.enableRotate = false;
    orbitControls.enablePan = false;
    orbitControlsRef.current = orbitControls;

    const transformControls = new TransformControls(camera, rendererRef.current.domElement);

    // Spline-like aesthetic: keep the visual gizmo small but make hitboxes huge
    transformControls.size = 0.5;
    try {
      const gizmo = (transformControls as any)._gizmo;
      if (gizmo && gizmo.picker) {
        Object.values(gizmo.picker).forEach((modeGroup: any) => {
          modeGroup.children.forEach((handle: any) => {
            if (handle.geometry) {
              handle.geometry = handle.geometry.clone(); // Prevent double-scaling shared geometries
              handle.geometry.scale(3.5, 3.5, 3.5); // Make invisible hitboxes 3.5x thicker
            }
          });
        });
      }
    } catch (e) {
      console.warn("Failed to scale transform controls pickers", e);
    }

    const helperObj = transformControls.getHelper();
    scene.add(helperObj);
    transformControlsRef.current = transformControls;

    const state = useEditorStore.getState();
    transformControls.setMode(state.activeTransformTool);
    transformControls.setSpace(state.transformSpace);

    orbitControls.addEventListener("change", () => {
      if (profileCommitFrameRef.current !== null) return;

      profileCommitFrameRef.current = window.requestAnimationFrame(() => {
        profileCommitFrameRef.current = null;

        const currentState = useEditorStore.getState();
        const currentProfileId = currentState.activeProfileId;
        const nextProfile = currentState.cameraProfiles[currentProfileId];
        if (!nextProfile) return;

        // Read the live camera from the ref for accurate position/type data.
        const liveCamera = cameraRef.current;
        const isPerspectiveCamera = liveCamera instanceof THREE.PerspectiveCamera;
        const isOrthographicCamera = liveCamera instanceof THREE.OrthographicCamera;

        const nextData = {
          position: [liveCamera.position.x, liveCamera.position.y, liveCamera.position.z] as [number, number, number],
          target: [orbitControls.target.x, orbitControls.target.y, orbitControls.target.z] as [number, number, number],
          near: isPerspectiveCamera || isOrthographicCamera ? liveCamera.near : nextProfile.near,
          far: isPerspectiveCamera || isOrthographicCamera ? liveCamera.far : nextProfile.far,
          fov: isPerspectiveCamera ? (liveCamera as THREE.PerspectiveCamera).fov : nextProfile.fov,
          zoom: isOrthographicCamera ? (liveCamera as THREE.OrthographicCamera).zoom : nextProfile.zoom,
        };

        currentState.updateProfileData(currentProfileId, nextData);

        let currentZoom = 100;
        const defaultDistance = 11.180339887498949;
        if (isPerspectiveCamera) {
          const dist = liveCamera.position.distanceTo(orbitControls.target);
          currentZoom = Math.round((defaultDistance / dist) * 100);
        } else if (isOrthographicCamera) {
          currentZoom = Math.round((liveCamera as THREE.OrthographicCamera).zoom * 100);
        }
        currentZoom = Math.max(10, Math.min(500, currentZoom));
        if (currentState.viewportZoom !== currentZoom) {
          currentState.setEditorState({ viewportZoom: currentZoom });
        }
      });
    });

    let isDragging = false;
    let hasPausedForDrag = false;
    let isAltPressed = false;
    let isSpacePressed = false;

    const updateOrbitControls = () => {
      orbitControls.enableRotate = isAltPressed && !isSpacePressed;
      orbitControls.enablePan = isAltPressed || isSpacePressed;
      orbitControls.enabled = !isDragging;

      if (isSpacePressed) {
        orbitControls.mouseButtons.LEFT = THREE.MOUSE.PAN;
        rendererRef.current.domElement.style.cursor = "grab";
      } else {
        orbitControls.mouseButtons.LEFT = THREE.MOUSE.ROTATE;
        rendererRef.current.domElement.style.cursor = "";
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      const activeEl = document.activeElement;
      const isInput = activeEl && (activeEl.tagName === "INPUT" || activeEl.tagName === "TEXTAREA" || activeEl.getAttribute("contenteditable") === "true");

      if (e.key === "Alt") {
        isAltPressed = true;
        updateOrbitControls();
      }
      if (e.code === "Space" && !isInput) {
        e.preventDefault(); // prevent page scroll
        if (!isSpacePressed) {
          isSpacePressed = true;
          updateOrbitControls();
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === "Alt") {
        isAltPressed = false;
        updateOrbitControls();
      }
      if (e.code === "Space") {
        isSpacePressed = false;
        updateOrbitControls();
      }
    };

    const handleBlur = () => {
      isAltPressed = false;
      isSpacePressed = false;
      updateOrbitControls();
    };

    const handlePointerDown = () => {
      if (isSpacePressed) {
        rendererRef.current.domElement.style.cursor = "grabbing";
      }
    };

    const handlePointerUp = () => {
      if (isSpacePressed) {
        rendererRef.current.domElement.style.cursor = "grab";
      }
    };

    rendererRef.current.domElement.addEventListener("pointerdown", handlePointerDown);
    window.addEventListener("pointerup", handlePointerUp);
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    window.addEventListener("blur", handleBlur);

    transformControls.addEventListener("dragging-changed", (event) => {
      isDragging = event.value;
      updateOrbitControls();
      if (!isDragging) {
        useEditorStore.temporal.getState().resume();
        hasPausedForDrag = false;
      }
    });

    transformControls.addEventListener("objectChange", () => {
      const target = transformControls.object;
      if (target && target.userData.entityId && !target.userData.locked) {
        useEditorStore.getState().updateEntityTransform(target.userData.entityId, {
          position: [target.position.x, target.position.y, target.position.z],
          rotation: [target.rotation.x, target.rotation.y, target.rotation.z],
          scale: [target.scale.x, target.scale.y, target.scale.z],
        });

        if (isDragging && !hasPausedForDrag) {
          useEditorStore.temporal.getState().pause();
          hasPausedForDrag = true;
        }
      }
    });

    // Subscriptions
    const unsubActiveTransformTool = useEditorStore.subscribe(
      (s) => s.activeTransformTool,
      (tool) => transformControls.setMode(tool)
    );

    const unsubTransformSpace = useEditorStore.subscribe(
      (s) => s.transformSpace,
      (space) => transformControls.setSpace(space)
    );

    const unsubShowAxisGuides = useEditorStore.subscribe(
      (s) => s.sceneSettings.showAxisGuides,
      (showAxisGuides) => {
        const HIDDEN_LAYER = 31;
        const gizmo = (transformControls as any)._gizmo as THREE.Object3D & { helper: Record<string, THREE.Object3D> };
        const guidelineLines: THREE.Object3D[] = [];
        if (gizmo && gizmo.helper && typeof gizmo.helper === "object") {
          Object.values(gizmo.helper).forEach((subGroup) => {
            if (typeof subGroup.traverse === "function") {
              subGroup.traverse((child) => {
                if ((child as THREE.Line).isLine) guidelineLines.push(child);
              });
            }
          });
        }
        guidelineLines.forEach((line) => line.layers.set(showAxisGuides ? 0 : HIDDEN_LAYER));
      },
      { fireImmediately: true }
    );

    const unsubViewportZoom = useEditorStore.subscribe(
      (s) => s.viewportZoom,
      (newZoom) => {
        const liveCamera = cameraRef.current;
        if (!liveCamera || !orbitControls) return;

        const isPerspective = liveCamera instanceof THREE.PerspectiveCamera;
        const isOrthographic = liveCamera instanceof THREE.OrthographicCamera;
        const defaultDistance = 11.180339887498949;

        if (isPerspective) {
          const currentDist = liveCamera.position.distanceTo(orbitControls.target);
          const expectedDist = (defaultDistance * 100) / newZoom;

          if (Math.abs(currentDist - expectedDist) > 0.01) {
            let direction = new THREE.Vector3().subVectors(liveCamera.position, orbitControls.target);
            if (direction.lengthSq() < 0.000001) {
              direction.set(0, 0, 1);
            }
            direction.normalize();
            liveCamera.position.copy(orbitControls.target).add(direction.multiplyScalar(expectedDist));
            orbitControls.update();
          }
        } else if (isOrthographic) {
          const orthoCam = liveCamera as THREE.OrthographicCamera;
          const expectedZoom = newZoom / 100;
          if (Math.abs(orthoCam.zoom - expectedZoom) > 0.001) {
            orthoCam.zoom = expectedZoom;
            orthoCam.updateProjectionMatrix();
            orbitControls.update();
          }
        }
      }
    );

    return () => {
      rendererRef.current?.domElement.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("pointerup", handlePointerUp);
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      window.removeEventListener("blur", handleBlur);
      unsubActiveTransformTool();
      unsubTransformSpace();
      unsubShowAxisGuides();
      unsubViewportZoom();
      scene.remove(transformControls.getHelper());
      transformControls.dispose();
      orbitControls.dispose();
    };
    // Controls are created once against the initial camera instance;
    // camera switches are handled externally by updating orbitControls.object.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rendererRef, scene]);

  return { orbitControlsRef, transformControlsRef };
}
