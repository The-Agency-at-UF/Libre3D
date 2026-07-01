import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { TransformControls } from "three/examples/jsm/controls/TransformControls.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import Stats from "three/examples/jsm/libs/stats.module.js";
import { useEditorStore, type Entity } from "../store/useEditorStore";

const sceneBackground = new THREE.Color("#0b1020");

const createGeometry = (entity: Entity): THREE.BufferGeometry => {
  switch (entity.type) {
    case "sphere":
      return new THREE.SphereGeometry(0.5, 32, 16);
    case "torus":
      return new THREE.TorusGeometry(0.55, 0.2, 16, 48);
    case "cube":
    default:
      return new THREE.BoxGeometry(1, 1, 1);
  }
};

const createMaterial = (entity: Entity): THREE.MeshStandardMaterial =>
  new THREE.MeshStandardMaterial({
    color: entity.color,
    emissive: new THREE.Color(0x000000),
    roughness: 0.45,
    metalness: 0.08,
    wireframe: useEditorStore.getState().sceneSettings.wireframe,
  });

const createSceneObject = (entity: Entity, scene: THREE.Scene): THREE.Object3D => {
  if (entity.type === "directionalLight") {
    const light = new THREE.DirectionalLight(new THREE.Color(entity.color), 2.2);
    light.position.set(...entity.position);
    light.rotation.set(...entity.rotation);
    light.scale.set(...entity.scale);

    // Target setup
    light.target.position.set(0, 0, 0);
    scene.add(light.target);
    light.userData.target = light.target;

    // Helper setup
    const helper = new THREE.DirectionalLightHelper(light, 1.0, 0xfde047);
    helper.userData.entityId = entity.id;
    scene.add(helper);
    light.userData.helper = helper;

    return light;
  } else {
    const mesh = new THREE.Mesh(createGeometry(entity), createMaterial(entity));
    mesh.position.set(...entity.position);
    mesh.rotation.set(...entity.rotation);
    mesh.scale.set(...entity.scale);
    return mesh;
  }
};

const disposeSceneObject = (obj: THREE.Object3D, scene: THREE.Scene): void => {
  if (obj instanceof THREE.Mesh) {
    obj.geometry.dispose();
    const material = obj.material;
    if (Array.isArray(material)) {
      material.forEach((entry) => entry.dispose());
    } else {
      material.dispose();
    }
  } else if (obj instanceof THREE.DirectionalLight) {
    if (obj.userData.helper) {
      scene.remove(obj.userData.helper);
      obj.userData.helper.dispose();
    }
    if (obj.userData.target) {
      scene.remove(obj.userData.target);
    }
  }
};

const syncEntityToSceneObject = (obj: THREE.Object3D, entity: Entity, isBeingDragged: boolean): void => {
  if (!isBeingDragged) {
    obj.position.set(...entity.position);
    obj.rotation.set(...entity.rotation);
    obj.scale.set(...entity.scale);
  }
  obj.visible = entity.visible;
  obj.userData.locked = entity.locked;

  if (obj instanceof THREE.Mesh) {
    if (obj.material instanceof THREE.MeshStandardMaterial) {
      obj.material.color.set(entity.color);
    }
  } else if (obj instanceof THREE.DirectionalLight) {
    obj.color.set(entity.color);
    if (obj.userData.helper) {
      obj.userData.helper.visible = entity.visible;
      obj.userData.helper.update();
    }
  }
};

const updateGridColors = (gridHelper: THREE.GridHelper, gridPlane: string) => {
  const colorAttr = gridHelper.geometry.attributes.color as THREE.BufferAttribute;
  const posAttr = gridHelper.geometry.attributes.position as THREE.BufferAttribute;
  if (!colorAttr || !posAttr) return;

  const colorRed = new THREE.Color("#ef4444");
  const colorGreen = new THREE.Color("#22c55e");
  const colorBlue = new THREE.Color("#3b82f6");
  const colorGrid = new THREE.Color("#1f2937");

  let zAxisColor = colorBlue; // Local Z axis
  let xAxisColor = colorRed;  // Local X axis

  if (gridPlane === "Wall (XY)") {
    zAxisColor = colorGreen; // Local Z lies along Y axis
    xAxisColor = colorRed;   // Local X lies along X axis
  } else if (gridPlane === "Side (YZ)") {
    zAxisColor = colorBlue;  // Local Z lies along Z axis
    xAxisColor = colorGreen; // Local X lies along Y axis
  }

  // Reset all vertices to the default grid color first
  for (let i = 0; i < colorAttr.count; i++) {
    colorAttr.setXYZ(i, colorGrid.r, colorGrid.g, colorGrid.b);
  }

  // Identify and color center axes lines based on vertex position coordinates
  const totalLines = posAttr.count / 2;
  for (let j = 0; j < totalLines; j++) {
    const idx1 = j * 2;
    const idx2 = j * 2 + 1;

    const x1 = posAttr.getX(idx1);
    const z1 = posAttr.getZ(idx1);
    const x2 = posAttr.getX(idx2);
    const z2 = posAttr.getZ(idx2);

    // If both vertices have X ≈ 0, this line lies along the local Z axis
    if (Math.abs(x1) < 0.0001 && Math.abs(x2) < 0.0001) {
      colorAttr.setXYZ(idx1, zAxisColor.r, zAxisColor.g, zAxisColor.b);
      colorAttr.setXYZ(idx2, zAxisColor.r, zAxisColor.g, zAxisColor.b);
    }
    // If both vertices have Z ≈ 0, this line lies along the local X axis
    else if (Math.abs(z1) < 0.0001 && Math.abs(z2) < 0.0001) {
      colorAttr.setXYZ(idx1, xAxisColor.r, xAxisColor.g, xAxisColor.b);
      colorAttr.setXYZ(idx2, xAxisColor.r, xAxisColor.g, xAxisColor.b);
    }
  }

  colorAttr.needsUpdate = true;
};

export function ViewportCanvas() {
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const resizeRendererRef = useRef<(() => void) | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.Camera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);

  const transformControlsRef = useRef<TransformControls | null>(null);
  const orbitControlsRef = useRef<OrbitControls | null>(null);
  const perspCameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const orthoCameraRef = useRef<THREE.OrthographicCamera | null>(null);
  const isApplyingProfileRef = useRef(false);
  const profileCommitFrameRef = useRef<number | null>(null);

  const projectionMode = useEditorStore((state) => state.projectionMode);
  const frame = useEditorStore((state) => state.frame);
  const activeProfile = useEditorStore(
    (state) => state.cameraProfiles[state.activeProfileId] ?? state.cameraProfiles.personal
  );
  const isPreviewMode = useEditorStore((state) => state.isPreviewMode);
  const [autoScaleFactor, setAutoScaleFactor] = useState(1);

  const syncViewportFromProfile = () => {
    const profile = activeProfile;
    const perspCamera = perspCameraRef.current;
    const orthoCamera = orthoCameraRef.current;
    const orbitControls = orbitControlsRef.current;

    if (!profile || !perspCamera || !orthoCamera || !orbitControls) {
      return;
    }

    isApplyingProfileRef.current = true;

    const [px, py, pz] = profile.position;
    const [tx, ty, tz] = profile.target;

    perspCamera.position.set(px, py, pz);
    perspCamera.fov = profile.fov;
    perspCamera.near = profile.near;
    perspCamera.far = profile.far;
    perspCamera.updateProjectionMatrix();

    orthoCamera.position.set(px, py, pz);
    orthoCamera.zoom = profile.zoom;
    orthoCamera.near = profile.near;
    orthoCamera.far = profile.far;
    orthoCamera.updateProjectionMatrix();

    const currentCamera = projectionMode === "perspective" ? perspCamera : orthoCamera;
    cameraRef.current = currentCamera;
    orbitControls.object = currentCamera;
    orbitControls.target.set(tx, ty, tz);
    orbitControls.update();

    isApplyingProfileRef.current = false;
  };

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const initialStoreState = useEditorStore.getState();
    const activeTransformTool = initialStoreState.activeTransformTool;
    const transformSpace = initialStoreState.transformSpace;
    const initialBgColor = new THREE.Color(initialStoreState.sceneSettings.bgColor || "#0b1020");

    const stats = new Stats();
    stats.dom.style.position = "absolute";
    stats.dom.style.top = "10px";
    stats.dom.style.left = "10px";
    container.appendChild(stats.dom);

    const scene = new THREE.Scene();
    scene.background = initialBgColor;
    if (initialStoreState.sceneSettings.fogEnabled) {
      scene.fog = new THREE.FogExp2(initialStoreState.sceneSettings.bgColor || "#0b1020", 0.05);
    }

    // Set up the shared perspective and orthographic viewport cameras
    const aspect = container.clientWidth / container.clientHeight || 1;
    const initialProfile =
      initialStoreState.cameraProfiles[initialStoreState.activeProfileId] ??
      initialStoreState.cameraProfiles.personal;
    const perspCamera = new THREE.PerspectiveCamera(initialProfile.fov, aspect, initialProfile.near, initialProfile.far);
    perspCamera.position.set(...initialProfile.position);
    perspCameraRef.current = perspCamera;

    const orthoSize = 5;
    const orthoCamera = new THREE.OrthographicCamera(
      -orthoSize * aspect,
      orthoSize * aspect,
      orthoSize,
      -orthoSize,
      initialProfile.near,
      initialProfile.far
    );
    orthoCamera.zoom = initialProfile.zoom;
    orthoCamera.position.set(...initialProfile.position);
    orthoCameraRef.current = orthoCamera;

    let activeCamera: THREE.Camera = initialStoreState.projectionMode === "perspective" ? perspCamera : orthoCamera;
    cameraRef.current = activeCamera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(window.devicePixelRatio || 1);
    renderer.outputColorSpace = THREE.SRGBColorSpace;

    const renderPass = new RenderPass(scene, activeCamera);

    const ambientLight = new THREE.AmbientLight(0xffffff, initialStoreState.sceneSettings.lights.intensity * 1.5);

    const gridHelper = new THREE.GridHelper(20, 20, 0x334155, 0x1f2937);
    gridHelper.visible = initialStoreState.sceneSettings.gridPlane !== "None";
    gridHelper.rotation.set(0, 0, 0);
    if (initialStoreState.sceneSettings.gridPlane === "Wall (XY)") {
      gridHelper.rotation.x = Math.PI / 2;
    } else if (initialStoreState.sceneSettings.gridPlane === "Side (YZ)") {
      gridHelper.rotation.z = Math.PI / 2;
    }
    updateGridColors(gridHelper, initialStoreState.sceneSettings.gridPlane);

    const meshMap = new Map<string, THREE.Object3D>();
    let selectedObj: THREE.Object3D | null = null;
    let animationFrameId = 0;

    scene.add(ambientLight);
    scene.add(gridHelper);

    sceneRef.current = scene;
    rendererRef.current = renderer;
    (window as Window & { __libre3dScene?: THREE.Scene | null }).__libre3dScene = scene;

    renderer.domElement.style.width = "100%";
    renderer.domElement.style.height = "100%";
    renderer.domElement.style.display = "block";
    container.appendChild(renderer.domElement);

    // Controls setup
    const defaultDistance = 11.180339887498949;
    const orbitControls = new OrbitControls(activeCamera, renderer.domElement);
    orbitControls.enableDamping = true;
    orbitControls.dampingFactor = 0.05;
    orbitControlsRef.current = orbitControls;

    orbitControls.addEventListener("change", () => {
      if (isApplyingProfileRef.current) {
        return;
      }

      if (profileCommitFrameRef.current !== null) {
        return;
      }

      profileCommitFrameRef.current = window.requestAnimationFrame(() => {
        profileCommitFrameRef.current = null;

        const state = useEditorStore.getState();
        const currentProfileId = state.activeProfileId;
        const currentCamera = cameraRef.current;
        const controls = orbitControlsRef.current;

        if (!currentCamera || !controls) {
          return;
        }

        const nextProfile = state.cameraProfiles[currentProfileId];
        if (!nextProfile) {
          return;
        }

        const isPerspectiveCamera = currentCamera instanceof THREE.PerspectiveCamera;
        const isOrthographicCamera = currentCamera instanceof THREE.OrthographicCamera;

        const nextData = {
          position: [currentCamera.position.x, currentCamera.position.y, currentCamera.position.z] as [number, number, number],
          target: [controls.target.x, controls.target.y, controls.target.z] as [number, number, number],
          near: isPerspectiveCamera || isOrthographicCamera ? currentCamera.near : nextProfile.near,
          far: isPerspectiveCamera || isOrthographicCamera ? currentCamera.far : nextProfile.far,
          fov: isPerspectiveCamera ? currentCamera.fov : nextProfile.fov,
          zoom: isOrthographicCamera ? currentCamera.zoom : nextProfile.zoom,
        };

        state.updateProfileData(currentProfileId, nextData);

        let currentZoom = 100;
        if (currentCamera instanceof THREE.PerspectiveCamera) {
          const dist = currentCamera.position.distanceTo(controls.target);
          currentZoom = Math.round((defaultDistance / dist) * 100);
        } else if (currentCamera instanceof THREE.OrthographicCamera) {
          currentZoom = Math.round(currentCamera.zoom * 100);
        }
        currentZoom = Math.max(10, Math.min(500, currentZoom));
        if (state.viewportZoom !== currentZoom) {
          state.setEditorState({ viewportZoom: currentZoom });
        }
      });
    });

    const transformControls = new TransformControls(activeCamera, renderer.domElement);
    transformControls.setMode(activeTransformTool);
    transformControls.setSpace(transformSpace);
    scene.add(transformControls.getHelper());
    transformControlsRef.current = transformControls;

    // Temporarily disable OrbitControls while transforming
    transformControls.addEventListener("dragging-changed", (event) => {
      orbitControls.enabled = !event.value;
    });

    // Handle Transform Changes
    transformControls.addEventListener("objectChange", () => {
      const target = transformControls.object;
      if (target && target.userData.entityId) {
        if (target.userData.locked) return;
        useEditorStore.getState().updateEntityTransform(target.userData.entityId, {
          position: [target.position.x, target.position.y, target.position.z],
          rotation: [target.rotation.x, target.rotation.y, target.rotation.z],
          scale: [target.scale.x, target.scale.y, target.scale.z],
        });
      }
    });

    // Resize handler
    const resizeRenderer = (): void => {
      const nextWidth = container.clientWidth || 1;
      const nextHeight = container.clientHeight || 1;
      const nextAspect = nextWidth / nextHeight;

      perspCamera.aspect = nextAspect;
      perspCamera.updateProjectionMatrix();

      orthoCamera.left = -orthoSize * nextAspect;
      orthoCamera.right = orthoSize * nextAspect;
      orthoCamera.top = orthoSize;
      orthoCamera.bottom = -orthoSize;
      orthoCamera.updateProjectionMatrix();

      renderer.setSize(nextWidth, nextHeight, false);
    };
    resizeRendererRef.current = resizeRenderer;

    // Selection application
    const applySelectionState = (selectedEntityId: string | null): void => {
      // Clean up previous selected emissive
      if (selectedObj instanceof THREE.Mesh && selectedObj.material instanceof THREE.MeshStandardMaterial) {
        selectedObj.material.emissive.set(0x000000);
      }

      selectedObj = selectedEntityId ? meshMap.get(selectedEntityId) ?? null : null;

      if (selectedObj && !selectedObj.userData.locked) {
        transformControls.attach(selectedObj);
      } else {
        transformControls.detach();
      }
    };

    const syncMeshes = (entities: Entity[], selectedEntityId: string | null): void => {
      const nextIds = new Set(entities.map((entity) => entity.id));

      for (const entity of entities) {
        let existingObj = meshMap.get(entity.id);
        const isBeingDragged = existingObj && transformControls.object === existingObj && transformControls.dragging;

        if (existingObj && existingObj.userData.entityType !== entity.type) {
          if (transformControls.object === existingObj) {
            transformControls.detach();
          }
          scene.remove(existingObj);
          disposeSceneObject(existingObj, scene);
          meshMap.delete(entity.id);
          existingObj = undefined;
        }

        if (!existingObj) {
          const obj = createSceneObject(entity, scene);
          obj.userData.entityId = entity.id;
          obj.userData.entityType = entity.type;
          obj.userData.locked = entity.locked;
          obj.visible = entity.visible;
          scene.add(obj);
          meshMap.set(entity.id, obj);
          continue;
        }

        const skipSync = !!isBeingDragged;
        syncEntityToSceneObject(existingObj, entity, skipSync);

        if (existingObj instanceof THREE.Mesh) {
          const material = existingObj.material;
          if (material instanceof THREE.MeshStandardMaterial) {
            material.color.set(entity.color);
          }
        }
      }

      for (const [entityId, obj] of meshMap) {
        if (nextIds.has(entityId)) {
          continue;
        }

        if (transformControls.object === obj) {
          transformControls.detach();
        }
        scene.remove(obj);
        disposeSceneObject(obj, scene);
        meshMap.delete(entityId);
      }

      applySelectionState(selectedEntityId);
    };

    resizeObserverRef.current = new ResizeObserver(() => {
      resizeRenderer();
    });
    resizeObserverRef.current.observe(container);
    resizeRenderer();

    // Click raycasting to select objects
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    let pointerDownTime = 0;
    const pointerDownPos = new THREE.Vector2();
    let clickedGizmo = false;

    const onPointerDown = (event: PointerEvent) => {
      pointerDownTime = Date.now();
      pointerDownPos.set(event.clientX, event.clientY);
      clickedGizmo = transformControls.axis !== null;
    };

    const onPointerUp = (event: PointerEvent) => {
      const duration = Date.now() - pointerDownTime;
      const dist = pointerDownPos.distanceTo(new THREE.Vector2(event.clientX, event.clientY));

      // Click threshold
      if (duration < 500 && dist < 10) {
        if (clickedGizmo) {
          return;
        }

        const rect = renderer.domElement.getBoundingClientRect();
        mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

        if (cameraRef.current) {
          raycaster.setFromCamera(mouse, cameraRef.current);
        }

        const targets: THREE.Object3D[] = [];
        meshMap.forEach((obj) => {
          if (obj.visible && !obj.userData.locked) {
            targets.push(obj);
            if (obj.userData.helper) {
              targets.push(obj.userData.helper);
            }
          }
        });

        const intersects = raycaster.intersectObjects(targets, true);

        if (intersects.length > 0) {
          let hitObject: THREE.Object3D | null = intersects[0].object;
          while (hitObject && !hitObject.userData.entityId) {
            hitObject = hitObject.parent;
          }
          if (hitObject && hitObject.userData.entityId) {
            useEditorStore.getState().selectEntity(hitObject.userData.entityId);
            return;
          }
        }

        // If clicked in empty space, clear selection
        useEditorStore.getState().selectEntity(null);
      }
    };

    renderer.domElement.addEventListener("pointerdown", onPointerDown);
    renderer.domElement.addEventListener("pointerup", onPointerUp);

    // Subscriptions
    const unsubEntities = useEditorStore.subscribe(
      (state) => state.entities,
      (entities) => {
        syncMeshes(entities, useEditorStore.getState().selectedEntityId);
      },
      { fireImmediately: true }
    );

    const unsubSelection = useEditorStore.subscribe(
      (state) => state.selectedEntityId,
      (selectedEntityId) => {
        applySelectionState(selectedEntityId);
      },
      { fireImmediately: true }
    );

    const unsubActiveTransformTool = useEditorStore.subscribe(
      (state) => state.activeTransformTool,
      (tool) => {
        if (transformControls) transformControls.setMode(tool);
      }
    );

    const unsubTransformSpace = useEditorStore.subscribe(
      (state) => state.transformSpace,
      (space) => {
        if (transformControls) transformControls.setSpace(space);
      }
    );

    const unsubSceneSettings = useEditorStore.subscribe(
      (state) => state.sceneSettings,
      (settings) => {
        const color = new THREE.Color(settings.bgColor);
        scene.background = color;
        if (scene.fog instanceof THREE.FogExp2) {
          scene.fog.color = color;
        }
      }
    );

    const unsubGridPlane = useEditorStore.subscribe(
      (state) => state.sceneSettings.gridPlane,
      (gridPlane) => {
        gridHelper.visible = (gridPlane !== "None");
        gridHelper.rotation.set(0, 0, 0);
        if (gridPlane === "Wall (XY)") {
          gridHelper.rotation.x = Math.PI / 2;
        } else if (gridPlane === "Side (YZ)") {
          gridHelper.rotation.z = Math.PI / 2;
        }
        updateGridColors(gridHelper, gridPlane);
      }
    );

    const unsubWireframe = useEditorStore.subscribe(
      (state) => state.sceneSettings.wireframe,
      (wireframe) => {
        meshMap.forEach((mesh) => {
          if (mesh instanceof THREE.Mesh && mesh.material instanceof THREE.MeshStandardMaterial) {
            mesh.material.wireframe = wireframe;
          }
        });
      }
    );

    const unsubLightIntensity = useEditorStore.subscribe(
      (state) => state.sceneSettings.lights.intensity,
      (intensity) => {
        ambientLight.intensity = intensity * 1.5;
      }
    );

    const unsubFogEnabled = useEditorStore.subscribe(
      (state) => state.sceneSettings.fogEnabled,
      (enabled) => {
        if (enabled) {
          scene.fog = new THREE.FogExp2(useEditorStore.getState().sceneSettings.bgColor || "#0b1020", 0.05);
        } else {
          scene.fog = null;
        }
      }
    );

    const unsubHudOverlay = useEditorStore.subscribe(
      (state) => state.hudOverlay,
      (hudOverlay) => {
        stats.dom.style.display = hudOverlay === "Stats" ? "block" : "none";
      },
      { fireImmediately: true }
    );

    const unsubViewportZoom = useEditorStore.subscribe(
      (state) => state.viewportZoom,
      (zoom) => {
        const currentCam = cameraRef.current;
        if (!currentCam) return;
        let currentZoom = 100;
        if (currentCam instanceof THREE.PerspectiveCamera) {
          const dist = currentCam.position.distanceTo(orbitControls.target);
          currentZoom = Math.round((defaultDistance / dist) * 100);
        } else if (currentCam instanceof THREE.OrthographicCamera) {
          currentZoom = Math.round(currentCam.zoom * 100);
        }

        if (Math.abs(currentZoom - zoom) > 1) {
          if (currentCam instanceof THREE.PerspectiveCamera) {
            const direction = new THREE.Vector3().subVectors(currentCam.position, orbitControls.target).normalize();
            if (direction.lengthSq() === 0) direction.set(0, 0, 1);
            currentCam.position.copy(orbitControls.target).addScaledVector(direction, defaultDistance * (100 / zoom));
            orbitControls.update();
          } else if (currentCam instanceof THREE.OrthographicCamera) {
            currentCam.zoom = zoom / 100;
            currentCam.updateProjectionMatrix();
          }
        }
      }
    );

    syncViewportFromProfile();

    // Center on selected object handler
    const handleCenterOnSelected = () => {
      const selectedId = useEditorStore.getState().selectedEntityId;
      if (!selectedId) return;
      const mesh = meshMap.get(selectedId);
      const currentCam = cameraRef.current;
      if (mesh && currentCam) {
        const targetPos = new THREE.Vector3();
        mesh.getWorldPosition(targetPos);

        const offset = new THREE.Vector3().subVectors(currentCam.position, orbitControls.target);
        orbitControls.target.copy(targetPos);
        currentCam.position.copy(targetPos).add(offset);
        orbitControls.update();
      }
    };

    // Orientate to selected object handler
    const handleOrientateToSelected = () => {
      const selectedId = useEditorStore.getState().selectedEntityId;
      if (!selectedId) return;
      const mesh = meshMap.get(selectedId);
      const currentCam = cameraRef.current;
      if (mesh && currentCam) {
        const targetPos = new THREE.Vector3();
        mesh.getWorldPosition(targetPos);

        orbitControls.target.copy(targetPos);
        const currentZoom = useEditorStore.getState().viewportZoom || 100;
        currentCam.position.set(
          targetPos.x,
          targetPos.y,
          targetPos.z + defaultDistance * (100 / currentZoom)
        );
        orbitControls.update();
      }
    };

    window.addEventListener("libre3d-center-on-selected", handleCenterOnSelected);
    window.addEventListener("libre3d-orientate-to-selected", handleOrientateToSelected);

    // Global KeyDown zoom handler
    const handleKeyDown = (event: KeyboardEvent) => {
      const isZoomIn = (event.ctrlKey || event.metaKey) && (event.key === "=" || event.key === "+");
      const isZoomOut = (event.ctrlKey || event.metaKey) && event.key === "-";

      if (isZoomIn || isZoomOut) {
        event.preventDefault();
        const currentZoom = useEditorStore.getState().viewportZoom;
        const delta = isZoomIn ? 10 : -10;
        const nextZoom = Math.max(10, Math.min(500, currentZoom + delta));
        useEditorStore.getState().setEditorState({ viewportZoom: nextZoom });
      }
    };
    window.addEventListener("keydown", handleKeyDown);

    const animate = (): void => {
      animationFrameId = window.requestAnimationFrame(animate);
      if (useEditorStore.getState().isPreviewMode) {
        return;
      }
      stats.update();

      const selectedEntityId = useEditorStore.getState().selectedEntityId;
      if (selectedEntityId && transformControls.object === null) {
        applySelectionState(selectedEntityId);
      }
      orbitControls.enabled = !transformControls.dragging;
      orbitControls.object = cameraRef.current || activeCamera;
      orbitControls.update();

      const renderCamera: THREE.Camera = cameraRef.current || activeCamera;

      meshMap.forEach((obj, id) => {
        const entity = useEditorStore.getState().entities.find((e) => e.id === id);
        const isSelected = (id === selectedEntityId);
        if (obj.userData.helper) {
          const helper = obj.userData.helper as THREE.DirectionalLightHelper;
          const shouldShowHelper = entity ? entity.visible : false;

          if (shouldShowHelper) {
            if (!helper.parent && sceneRef.current) {
              sceneRef.current.add(helper);
            }
            helper.visible = true;
            helper.color = isSelected ? 0xfde047 : 0xffffff;
            helper.update();
          } else {
            if (helper.parent) {
              helper.parent.remove(helper);
            }
            helper.visible = false;
          }
        }
      });

      renderPass.camera = renderCamera;

      renderer.render(scene, renderCamera);
    };
    animate();

    return () => {
      window.cancelAnimationFrame(animationFrameId);
      renderer.domElement.removeEventListener("pointerdown", onPointerDown);
      renderer.domElement.removeEventListener("pointerup", onPointerUp);
      unsubEntities();
      unsubSelection();
      unsubActiveTransformTool();
      unsubTransformSpace();
      unsubSceneSettings();
      unsubGridPlane();
      unsubWireframe();
      unsubLightIntensity();
      unsubFogEnabled();
      unsubViewportZoom();
      unsubHudOverlay();
      window.removeEventListener("libre3d-center-on-selected", handleCenterOnSelected);
      window.removeEventListener("libre3d-orientate-to-selected", handleOrientateToSelected);
      window.removeEventListener("keydown", handleKeyDown);
      stats.dom.remove();
      resizeObserverRef.current?.disconnect();
      resizeObserverRef.current = null;
      resizeRendererRef.current = null;

      for (const obj of meshMap.values()) {
        scene.remove(obj);
        disposeSceneObject(obj, scene);
      }
      meshMap.clear();

      scene.remove(transformControls.getHelper());
      transformControls.dispose();

      scene.remove(gridHelper);
      scene.remove(ambientLight);

      renderer.dispose();
      renderer.forceContextLoss();
      renderer.domElement.remove();

      const globalWindow = window as Window & { __libre3dScene?: THREE.Scene | null };
      if (globalWindow.__libre3dScene === scene) {
        delete globalWindow.__libre3dScene;
      }

      sceneRef.current = null;
      cameraRef.current = null;
      rendererRef.current = null;
    };
  }, []); // Only run setup on mount

  useEffect(() => {
    if (!rendererRef.current || !sceneRef.current) return;
    syncViewportFromProfile();

    const nextCamera = projectionMode === "perspective" ? perspCameraRef.current : orthoCameraRef.current;
    if (nextCamera && transformControlsRef.current) {
      transformControlsRef.current.camera = nextCamera;
    }
  }, [projectionMode, activeProfile]);

  useEffect(() => {
    resizeRendererRef.current?.();
  }, [frame.mode, frame.width, frame.height]);

  useEffect(() => {
    const wrapper = wrapperRef.current;
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

      const viewportRect = viewportHost.getBoundingClientRect();
      const leftSidebar = document.querySelector<HTMLElement>(".left-sidebar");
      const rightSidebar = document.querySelector<HTMLElement>(".right-sidebar");
      const floatingToolbar = document.querySelector<HTMLElement>(".floating-toolbar");

      const leftInset = leftSidebar ? Math.max(0, leftSidebar.getBoundingClientRect().right - viewportRect.left) : 280;
      const rightInset = rightSidebar ? Math.max(0, viewportRect.right - rightSidebar.getBoundingClientRect().left) : 320;
      const topInset = floatingToolbar ? Math.max(0, floatingToolbar.getBoundingClientRect().bottom - viewportRect.top) : 0;
      const bottomInset = 0;

      const availableWidth = Math.max(1, viewportRect.width - leftInset - rightInset);
      const availableHeight = Math.max(1, viewportRect.height - topInset - bottomInset);
      const nextScale = Math.min(1, availableWidth / frame.width, availableHeight / frame.height);
      setAutoScaleFactor(Number.isFinite(nextScale) ? Math.max(nextScale, 0.1) : 1);
    };

    updateScale();

    const observer = new ResizeObserver(updateScale);
    observer.observe(viewportHost);
    const leftSidebar = document.querySelector<HTMLElement>(".left-sidebar");
    const rightSidebar = document.querySelector<HTMLElement>(".right-sidebar");
    const floatingToolbar = document.querySelector<HTMLElement>(".floating-toolbar");

    if (leftSidebar) {
      observer.observe(leftSidebar);
    }
    if (rightSidebar) {
      observer.observe(rightSidebar);
    }
    if (floatingToolbar) {
      observer.observe(floatingToolbar);
    }

    return () => {
      observer.disconnect();
    };
  }, [frame.mode, frame.width, frame.height]);

  const frameScaleLabel = `${Math.round(autoScaleFactor * 100)}%`;

  return (
    <div
      ref={wrapperRef}
      className="viewport-sandbox-wrapper"
      style={{
        display: isPreviewMode ? "none" : "flex",
        width: frame.mode === "fixed" ? frame.width : "100%",
        height: frame.mode === "fixed" ? frame.height : "100%",
        transform: frame.mode === "fixed" ? `scale(${autoScaleFactor})` : "scale(1)",
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