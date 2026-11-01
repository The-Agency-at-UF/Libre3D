import { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { TransformControls } from "three/examples/jsm/controls/TransformControls.js";
import { selectViewedObjectState, useEditorStore } from "../../store/useEditorStore";
import { resolveState, unwrapRotation } from "../../animation/objectStates";

export function useViewportControls(
  // Accept a ref so OrbitControls / TransformControls always use the live camera.
  cameraRef: React.RefObject<THREE.Camera>,
  rendererRef: React.RefObject<THREE.WebGLRenderer | null>,
  scene: THREE.Scene,
) {
  const orbitControlsRef = useRef<OrbitControls | null>(null);
  const transformControlsRef = useRef<TransformControls | null>(null);
  const profileCommitFrameRef = useRef<number | null>(null);

  useEffect(() => {
    if (!rendererRef.current) return;

    const camera = cameraRef.current;

    const orbitControls = new OrbitControls(
      camera,
      rendererRef.current.domElement,
    );
    // No damping: the camera tracks the pointer 1:1 and stops when the drag
    // ends. With damping on, each update() only applied a fraction of the
    // input, so the view trailed the mouse and kept gliding after release.
    orbitControls.enableDamping = false;
    orbitControls.minZoom = 0.1;
    orbitControls.maxZoom = 5;
    orbitControls.enableRotate = false;
    orbitControls.enablePan = false;
    // Middle mouse drag pans (default is DOLLY); enablePan is toggled per-gesture below.
    orbitControls.mouseButtons.MIDDLE = THREE.MOUSE.PAN;
    orbitControlsRef.current = orbitControls;

    const transformControls = new TransformControls(
      camera,
      rendererRef.current.domElement,
    );

    // Spline-like aesthetic: keep the visual gizmo slightly larger but with good hitboxes
    transformControls.size = 1.0;

    // Tuned so the center (XYZ) picker stays easy to grab without swallowing
    // the base of the axis arrows, and the planar pickers shrink without
    // drifting toward the origin (see note below on why a naive .scale() breaks this).
    const CENTER_HITBOX_SCALE = 1.6;
    const PLANE_HITBOX_SCALE = 0.5;

    // Uniform scaling via the center (XYZ) cube follows the mouse's horizontal
    // movement since pointerdown: right grows the object, left shrinks it, and
    // every CENTER_SCALE_PIXELS_PER_DOUBLING px doubles (or halves) it, so it
    // never reaches zero or goes negative.
    //
    // Stock TransformControls scales by a *ratio of distances* instead: on
    // pointerdown it records `pointStart`, the vector from the gizmo's world
    // position to where the drag ray hits the drag plane; on every pointermove
    // it recomputes `pointEnd` the same way and does
    //   d = pointEnd.length() / pointStart.length()  (negated if they point apart)
    //   object.scale = scaleAtDragStart * d
    // (see node_modules/three/examples/jsm/controls/TransformControls.js,
    // pointerMove(), the `mode === 'scale'` branch, `axis.search('XYZ')`).
    // So only the distance from the object's center counts, not the direction
    // you drag: dragging toward the center shrinks the object, and crossing it
    // flips `d` negative, turning the object inside out (it reads as upside
    // down). And since you grab the cube near that center, `pointStart` is
    // short, so a few pixels swing the scale wildly. There's no public option
    // for any of this, so the 'objectChange' listener below overwrites the
    // scale TransformControls just applied, before the store-sync
    // 'objectChange' listener (further down) reads `target.scale`.
    const CENTER_SCALE_PIXELS_PER_DOUBLING = 200;

    try {
      const gizmo = (transformControls as any)._gizmo;
      if (gizmo && gizmo.picker) {
        Object.values(gizmo.picker).forEach((modeGroup: any) => {
          modeGroup.children.forEach((handle: any) => {
            if (!handle.geometry) return;

            // Only scale the center and planar handles.
            // Scaling X/Y/Z scales the rotation torus major radius, misaligning it with the visual gizmo!
            const isCenter = handle.name === "XYZ";
            const isPlane = ["XY", "YZ", "XZ"].includes(handle.name);
            if (!isCenter && !isPlane) return;

            const scaleFactor = isCenter
              ? CENTER_HITBOX_SCALE
              : PLANE_HITBOX_SCALE;

            // TransformControls bakes each handle's position/rotation into its
            // geometry vertices (see setupGizmo() in TransformControls.js), so the
            // planar handles' vertices are already offset to e.g. (0.15, 0.15, 0) —
            // not centered at the origin. BufferGeometry.scale() scales around the
            // geometry's local origin, so scaling this geometry directly would also
            // drag the handle's position toward the gizmo center, not just resize it.
            // Translate to origin, scale, then translate back to preserve the center.
            const geometry = handle.geometry.clone();
            geometry.computeBoundingBox();
            const center = new THREE.Vector3();
            geometry.boundingBox!.getCenter(center);
            geometry.translate(-center.x, -center.y, -center.z);
            geometry.scale(scaleFactor, scaleFactor, scaleFactor);
            geometry.translate(center.x, center.y, center.z);
            handle.geometry = geometry;
          });
        });
      }
    } catch (e) {
      console.warn("Failed to scale transform controls pickers", e);
    }

    // In scale mode the center cube wins wherever its picker is under the
    // pointer. Each axis picker is a cone running from the gizmo's center out
    // to its handle, so when an axis points at the camera (Z, in a front view)
    // its wide end covers the center cube, and TransformControls takes the
    // nearest hit: a click on the center cube grabbed Z, scaling along an axis
    // that barely moves on screen and flipping sign as the drag crossed the
    // center. This trims the inner ends of the X/Y pickers too; their handles
    // are grabbed at the far end anyway.
    const centerScalePicker = (
      (transformControls as any)._gizmo?.picker?.scale as
        | THREE.Object3D
        | undefined
    )?.children.find((handle) => handle.name === "XYZ");
    const centerRaycaster = new THREE.Raycaster();
    const centerPointer = new THREE.Vector2();
    const pointerHover = transformControls.pointerHover.bind(transformControls);
    transformControls.pointerHover = (pointer) => {
      pointerHover(pointer);
      if (
        !pointer ||
        !centerScalePicker?.visible ||
        transformControls.mode !== "scale" ||
        transformControls.dragging ||
        transformControls.axis === null
      )
        return;
      centerRaycaster.setFromCamera(
        centerPointer.set(pointer.x, pointer.y),
        transformControls.camera,
      );
      if (centerRaycaster.intersectObject(centerScalePicker, false).length > 0)
        transformControls.axis = "XYZ";
    };

    const helperObj = transformControls.getHelper();
    helperObj.userData.editorOnly = true; // never exported — see hideEditorOnlyObjects
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
        const isPerspectiveCamera =
          liveCamera instanceof THREE.PerspectiveCamera;
        const isOrthographicCamera =
          liveCamera instanceof THREE.OrthographicCamera;

        const nextData = {
          position: [
            liveCamera.position.x,
            liveCamera.position.y,
            liveCamera.position.z,
          ] as [number, number, number],
          target: [
            orbitControls.target.x,
            orbitControls.target.y,
            orbitControls.target.z,
          ] as [number, number, number],
          near:
            isPerspectiveCamera || isOrthographicCamera
              ? liveCamera.near
              : nextProfile.near,
          far:
            isPerspectiveCamera || isOrthographicCamera
              ? liveCamera.far
              : nextProfile.far,
          fov: isPerspectiveCamera
            ? (liveCamera as THREE.PerspectiveCamera).fov
            : nextProfile.fov,
          zoom: isOrthographicCamera
            ? (liveCamera as THREE.OrthographicCamera).zoom
            : nextProfile.zoom,
        };

        currentState.updateProfileData(currentProfileId, nextData);

        let currentZoom = 100;
        const defaultDistance = 11.180339887498949;
        if (isPerspectiveCamera) {
          const dist = liveCamera.position.distanceTo(orbitControls.target);
          currentZoom = Math.round((defaultDistance / dist) * 100);
        } else if (isOrthographicCamera) {
          currentZoom = Math.round(
            (liveCamera as THREE.OrthographicCamera).zoom * 100,
          );
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
    let isMiddlePanning = false;
    // The pointer's x, now and at the last press, for the center-cube scale (see
    // CENTER_SCALE_PIXELS_PER_DOUBLING). Both are read in capture phase, so they're
    // current before TransformControls handles the same event.
    let pointerX = 0;
    let pointerDownX = 0;

    const updateOrbitControls = () => {
      // Play looks through a camera of its own (useViewportPlay, PlayCamera), so nothing here may
      // move, and save, the scene's camera meanwhile.
      const isPlaying = useEditorStore.getState().isPreviewMode;
      orbitControls.enableRotate = isAltPressed && !isSpacePressed;
      orbitControls.enablePan =
        isAltPressed || isSpacePressed || isMiddlePanning;
      orbitControls.enabled = !isDragging && !isPlaying;

      if (isSpacePressed && !isPlaying) {
        orbitControls.mouseButtons.LEFT = THREE.MOUSE.PAN;
        if (rendererRef.current)
          rendererRef.current.domElement.style.cursor = "grab";
      } else {
        orbitControls.mouseButtons.LEFT = THREE.MOUSE.ROTATE;
        if (rendererRef.current)
          rendererRef.current.domElement.style.cursor = "";
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      const activeEl = document.activeElement;
      const isInput =
        activeEl &&
        (activeEl.tagName === "INPUT" ||
          activeEl.tagName === "TEXTAREA" ||
          activeEl.getAttribute("contenteditable") === "true");

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
      isMiddlePanning = false;
      updateOrbitControls();
    };

    // Capture phase so enablePan is set before OrbitControls' own pointerdown reads it.
    const handlePointerDown = (e: PointerEvent) => {
      pointerX = pointerDownX = e.clientX;
      if (e.button === 1) {
        isMiddlePanning = true;
        updateOrbitControls();
        if (rendererRef.current)
          rendererRef.current.domElement.style.cursor = "grabbing";
      } else if (isSpacePressed && rendererRef.current) {
        rendererRef.current.domElement.style.cursor = "grabbing";
      }
    };

    const handlePointerMove = (e: PointerEvent) => {
      pointerX = e.clientX;
    };

    const handlePointerUp = (e: PointerEvent) => {
      if (e.button === 1 && isMiddlePanning) {
        isMiddlePanning = false;
        // updateOrbitControls resets the cursor based on the current modifier state.
        updateOrbitControls();
      } else if (isSpacePressed && rendererRef.current) {
        rendererRef.current.domElement.style.cursor = "grab";
      }
    };

    rendererRef.current.domElement.addEventListener(
      "pointerdown",
      handlePointerDown,
      true,
    );
    rendererRef.current.domElement.addEventListener(
      "pointermove",
      handlePointerMove,
      true,
    );
    window.addEventListener("pointerup", handlePointerUp);
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    window.addEventListener("blur", handleBlur);

    transformControls.addEventListener("dragging-changed", (event: any) => {
      isDragging = !!event.value;
      updateOrbitControls();
      if (!isDragging) {
        useEditorStore.temporal.getState().resume();
        hasPausedForDrag = false;
      }
    });

    // Replaces uniform (center-cube) scaling with the mouse-direction scale
    // described at CENTER_SCALE_PIXELS_PER_DOUBLING, above. Must be registered
    // before the 'objectChange' listener below -- EventDispatcher fires listeners
    // in registration order, and that listener reads `target.scale` to sync the
    // entity store, so our value has to land on the object first.
    transformControls.addEventListener("objectChange", () => {
      if (
        transformControls.dragging &&
        transformControls.mode === "scale" &&
        transformControls.axis === "XYZ"
      ) {
        const target = transformControls.object;
        // Internal, undocumented field -- the scale TransformControls captured
        // at pointerdown. Same category of risk as the `_gizmo` reach-in above:
        // it can move or vanish on a three.js upgrade, in which case this skips
        // and the stock ratio scaling comes back.
        const scaleStart = (transformControls as any)._scaleStart as
          | THREE.Vector3
          | undefined;
        if (target && scaleStart) {
          const factor =
            2 ** ((pointerX - pointerDownX) / CENTER_SCALE_PIXELS_PER_DOUBLING);
          target.scale.copy(scaleStart).multiplyScalar(factor);
        }
      }
    });

    transformControls.addEventListener("objectChange", () => {
      const target = transformControls.object;
      const store = useEditorStore.getState();
      const entity = target?.userData.entityId
        ? store.entities.find((e) => e.id === target.userData.entityId)
        : undefined;
      if (target && entity && !target.userData.locked) {
        // The gizmo hands back rotations wrapped to ±180° (they go through a quaternion); keep the
        // turn nearest the stored one, so a turn past 180° stays one and transitions to it don't
        // go the long way round.
        const rotation = unwrapRotation(
          [target.rotation.x, target.rotation.y, target.rotation.z],
          resolveState(entity, selectViewedObjectState(store, entity.id)).rotation,
        );
        // Only what this tool moves: the edit goes to the state the object is shown in, if any, and
        // its other values stay as they are (following Base where the state doesn't set them).
        const tool = transformControls.mode;
        store.updateShownTransforms({
          [entity.id]:
            tool === "translate"
              ? { position: [target.position.x, target.position.y, target.position.z] }
              : tool === "rotate"
                ? { rotation }
                : { scale: [target.scale.x, target.scale.y, target.scale.z] },
        });

        // The drag's first write recorded its undo step; the rest of the drag joins it. Only after
        // a write: pausing first (the multi-select proxy is written by ViewportCanvas, after this)
        // left the whole drag out of undo history.
        if (isDragging && !hasPausedForDrag) {
          useEditorStore.temporal.getState().pause();
          hasPausedForDrag = true;
        }
      }
    });

    // Subscriptions
    const unsubActiveTransformTool = useEditorStore.subscribe(
      (s) => s.activeTransformTool,
      (tool) => transformControls.setMode(tool),
    );

    const unsubTransformSpace = useEditorStore.subscribe(
      (s) => s.transformSpace,
      (space) => transformControls.setSpace(space),
    );

    const unsubShowAxisGuides = useEditorStore.subscribe(
      (s) => s.sceneSettings.showAxisGuides,
      (showAxisGuides) => {
        const HIDDEN_LAYER = 31;
        const gizmo = (transformControls as any)._gizmo as THREE.Object3D & {
          helper: Record<string, THREE.Object3D>;
        };
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
        guidelineLines.forEach((line) =>
          line.layers.set(showAxisGuides ? 0 : HIDDEN_LAYER),
        );
      },
      { fireImmediately: true },
    );

    const unsubPlay = useEditorStore.subscribe((s) => s.isPreviewMode, updateOrbitControls);

    const unsubViewportZoom = useEditorStore.subscribe(
      (s) => s.viewportZoom,
      (newZoom) => {
        const liveCamera = cameraRef.current;
        if (!liveCamera || !orbitControls || useEditorStore.getState().isPreviewMode) return;

        const isPerspective = liveCamera instanceof THREE.PerspectiveCamera;
        const isOrthographic = liveCamera instanceof THREE.OrthographicCamera;
        const defaultDistance = 11.180339887498949;

        if (isPerspective) {
          const currentDist = liveCamera.position.distanceTo(
            orbitControls.target,
          );
          const expectedDist = (defaultDistance * 100) / newZoom;

          if (Math.abs(currentDist - expectedDist) > 0.01) {
            let direction = new THREE.Vector3().subVectors(
              liveCamera.position,
              orbitControls.target,
            );
            if (direction.lengthSq() < 0.000001) {
              direction.set(0, 0, 1);
            }
            direction.normalize();
            liveCamera.position
              .copy(orbitControls.target)
              .add(direction.multiplyScalar(expectedDist));
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
      },
    );

    return () => {
      rendererRef.current?.domElement.removeEventListener(
        "pointerdown",
        handlePointerDown,
        true,
      );
      rendererRef.current?.domElement.removeEventListener(
        "pointermove",
        handlePointerMove,
        true,
      );
      window.removeEventListener("pointerup", handlePointerUp);
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      window.removeEventListener("blur", handleBlur);
      unsubActiveTransformTool();
      unsubTransformSpace();
      unsubShowAxisGuides();
      unsubPlay();
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
