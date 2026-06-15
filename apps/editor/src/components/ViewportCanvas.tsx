import { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { TransformControls } from "three/examples/jsm/controls/TransformControls.js";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "three/examples/jsm/postprocessing/OutputPass.js";
import Stats from "three/examples/jsm/libs/stats.module.js";
import { useEditorStore, type Entity } from "../store/useEditorStore";

class CustomCameraRig extends THREE.Group {
  perspCamera: THREE.PerspectiveCamera;
  orthoCamera: THREE.OrthographicCamera;

  constructor(aspect: number = 1.6) {
    super();
    this.perspCamera = new THREE.PerspectiveCamera(45, aspect, 0.1, 100);
    const orthoSize = 5;
    this.orthoCamera = new THREE.OrthographicCamera(
      -orthoSize * aspect,
      orthoSize * aspect,
      orthoSize,
      -orthoSize,
      0.1,
      100
    );
  }

  updateAspect(aspect: number) {
    this.perspCamera.aspect = aspect;
    this.perspCamera.updateProjectionMatrix();

    const orthoSize = 5;
    this.orthoCamera.left = -orthoSize * aspect;
    this.orthoCamera.right = orthoSize * aspect;
    this.orthoCamera.top = orthoSize;
    this.orthoCamera.bottom = -orthoSize;
    this.orthoCamera.updateProjectionMatrix();

    if (this.userData.helper) {
      this.userData.helper.update();
    }
  }
}

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
  } else if (entity.type === "camera") {
    const rig = new CustomCameraRig(1.6);
    rig.position.set(...entity.position);
    rig.rotation.set(...entity.rotation);
    rig.scale.set(...entity.scale);

    // Sync sub-lenses to parent rig coordinates
    rig.perspCamera.position.copy(rig.position);
    rig.perspCamera.rotation.copy(rig.rotation);
    rig.orthoCamera.position.copy(rig.position);
    rig.orthoCamera.rotation.copy(rig.rotation);

    scene.add(rig.perspCamera);
    scene.add(rig.orthoCamera);

    // Helper setup
    const helper = new THREE.CameraHelper(rig.perspCamera);
    helper.userData.entityId = entity.id;
    scene.add(helper);
    rig.userData.helper = helper;

    return rig;
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
  } else if (obj instanceof CustomCameraRig) {
    scene.remove(obj.perspCamera);
    scene.remove(obj.orthoCamera);
    if (obj.userData.helper) {
      scene.remove(obj.userData.helper);
      obj.userData.helper.dispose();
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
  } else if (obj instanceof CustomCameraRig) {
    if (!isBeingDragged) {
      obj.perspCamera.position.copy(obj.position);
      obj.perspCamera.rotation.copy(obj.rotation);
      obj.orthoCamera.position.copy(obj.position);
      obj.orthoCamera.rotation.copy(obj.rotation);
    }
    if (obj.userData.helper) {
      obj.userData.helper.visible = entity.visible;
      obj.userData.helper.update();
    }
  }
};

export function ViewportCanvas() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.Camera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);

  const transformControlsRef = useRef<TransformControls | null>(null);
  const orbitControlsRef = useRef<OrbitControls | null>(null);

  const projectionMode = useEditorStore((state) => state.projectionMode);
  const isPreviewMode = useEditorStore((state) => state.isPreviewMode);

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

    // Set up both perspective and orthographic cameras
    const aspect = container.clientWidth / container.clientHeight || 1;
    const perspCamera = new THREE.PerspectiveCamera(45, aspect, 0.1, 100);
    perspCamera.position.set(0, 5, 10);
    perspCamera.lookAt(0, 0, 0);

    const orthoSize = 5;
    const orthoCamera = new THREE.OrthographicCamera(
      -orthoSize * aspect,
      orthoSize * aspect,
      orthoSize,
      -orthoSize,
      0.1,
      100
    );
    orthoCamera.position.set(0, 5, 10);
    orthoCamera.lookAt(0, 0, 0);

    let activeCamera: THREE.Camera = projectionMode === "perspective" ? perspCamera : orthoCamera;
    cameraRef.current = activeCamera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(window.devicePixelRatio || 1);
    renderer.outputColorSpace = THREE.SRGBColorSpace;

    const composer = new EffectComposer(renderer);
    composer.setPixelRatio(window.devicePixelRatio || 1);
    const renderPass = new RenderPass(scene, activeCamera);
    composer.addPass(renderPass);

    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(container.clientWidth, container.clientHeight),
      (initialStoreState.postProcessing.bloom.intensity / 100) * 3.0,
      initialStoreState.postProcessing.bloom.radius,
      initialStoreState.postProcessing.bloom.threshold
    );
    bloomPass.enabled = initialStoreState.postProcessing.bloom.enabled;
    composer.addPass(bloomPass);

    const outputPass = new OutputPass();
    composer.addPass(outputPass);

    const ambientLight = new THREE.AmbientLight(0xffffff, initialStoreState.sceneSettings.lights.intensity * 1.5);

    const gridHelper = new THREE.GridHelper(20, 20, 0x334155, 0x1f2937);
    gridHelper.visible = initialStoreState.sceneSettings.gridPlane !== "None";
    gridHelper.rotation.set(0, 0, 0);
    if (initialStoreState.sceneSettings.gridPlane === "Wall (XY)") {
      gridHelper.rotation.x = Math.PI / 2;
    } else if (initialStoreState.sceneSettings.gridPlane === "Side (YZ)") {
      gridHelper.rotation.z = Math.PI / 2;
    }

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

    let isOrbitingCustomCamera = false;
    orbitControls.addEventListener("start", () => {
      if (useEditorStore.getState().activeCameraId !== "default") {
        isOrbitingCustomCamera = true;
      }
    });

    orbitControls.addEventListener("end", () => {
      isOrbitingCustomCamera = false;
    });

    orbitControls.addEventListener("change", () => {
      const state = useEditorStore.getState();
      const currentActiveCameraId = state.activeCameraId;

      if (currentActiveCameraId !== "default") {
        const rig = meshMap.get(currentActiveCameraId);
        if (rig instanceof CustomCameraRig) {
          const selectedCam = state.projectionMode === "perspective" ? rig.perspCamera : rig.orthoCamera;
          rig.position.copy(selectedCam.position);
          rig.rotation.copy(selectedCam.rotation);

          const otherCam = selectedCam === rig.perspCamera ? rig.orthoCamera : rig.perspCamera;
          otherCam.position.copy(selectedCam.position);
          otherCam.rotation.copy(selectedCam.rotation);

          state.updateEntityTransform(currentActiveCameraId, {
            position: [selectedCam.position.x, selectedCam.position.y, selectedCam.position.z],
            rotation: [selectedCam.rotation.x, selectedCam.rotation.y, selectedCam.rotation.z],
          });
        }
      }

      let currentZoom = 100;
      if (activeCamera instanceof THREE.PerspectiveCamera) {
        const dist = activeCamera.position.distanceTo(orbitControls.target);
        currentZoom = Math.round((defaultDistance / dist) * 100);
      } else if (activeCamera instanceof THREE.OrthographicCamera) {
        currentZoom = Math.round(activeCamera.zoom * 100);
      }
      currentZoom = Math.max(10, Math.min(500, currentZoom));
      if (state.viewportZoom !== currentZoom) {
        state.setEditorState({ viewportZoom: currentZoom });
      }
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
      composer.setSize(nextWidth, nextHeight);
      bloomPass.setSize(nextWidth, nextHeight);

      meshMap.forEach((obj) => {
        if (obj instanceof THREE.PerspectiveCamera) {
          obj.aspect = nextAspect;
          obj.updateProjectionMatrix();
          if (obj.userData.helper) {
            obj.userData.helper.update();
          }
        }
      });
    };

    // Selection application
    const applySelectionState = (selectedEntityId: string | null): void => {
      // Clean up previous selected emissive
      if (selectedObj instanceof THREE.Mesh && selectedObj.material instanceof THREE.MeshStandardMaterial) {
        selectedObj.material.emissive.set(0x000000);
      }

      selectedObj = selectedEntityId ? meshMap.get(selectedEntityId) ?? null : null;

      if (selectedObj && !selectedObj.userData.locked) {
        if (selectedObj instanceof THREE.Mesh && selectedObj.material instanceof THREE.MeshStandardMaterial) {
          selectedObj.material.emissive.set(0x143c2d);
        }
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

        const currentActiveCameraId = useEditorStore.getState().activeCameraId;
        const isOrbitingThisCustomCamera = entity.id === currentActiveCameraId && isOrbitingCustomCamera;
        const skipSync = !!isBeingDragged || isOrbitingThisCustomCamera;
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

        raycaster.setFromCamera(mouse, activeCamera);

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

    let useComposer = initialStoreState.postProcessing.enabled;

    const unsubPostProcessing = useEditorStore.subscribe(
      (state) => state.postProcessing,
      (postProcessing) => {
        console.log("Canvas received bloom updates:", postProcessing.bloom.intensity);
        useComposer = postProcessing.enabled;
        bloomPass.enabled = postProcessing.bloom.enabled;
        bloomPass.strength = (postProcessing.bloom.intensity / 100) * 3.0;
        bloomPass.threshold = postProcessing.bloom.threshold;
        bloomPass.radius = postProcessing.bloom.radius;
      },
      { fireImmediately: true }
    );

    const unsubViewportZoom = useEditorStore.subscribe(
      (state) => state.viewportZoom,
      (zoom) => {
        let currentZoom = 100;
        if (activeCamera instanceof THREE.PerspectiveCamera) {
          const dist = activeCamera.position.distanceTo(orbitControls.target);
          currentZoom = Math.round((defaultDistance / dist) * 100);
        } else if (activeCamera instanceof THREE.OrthographicCamera) {
          currentZoom = Math.round(activeCamera.zoom * 100);
        }

        if (Math.abs(currentZoom - zoom) > 1) {
          if (activeCamera instanceof THREE.PerspectiveCamera) {
            const direction = new THREE.Vector3().subVectors(activeCamera.position, orbitControls.target).normalize();
            if (direction.lengthSq() === 0) direction.set(0, 0, 1);
            activeCamera.position.copy(orbitControls.target).addScaledVector(direction, defaultDistance * (100 / zoom));
            orbitControls.update();
          } else if (activeCamera instanceof THREE.OrthographicCamera) {
            activeCamera.zoom = zoom / 100;
            activeCamera.updateProjectionMatrix();
          }
        }
      }
    );

    // Center on selected object handler
    const handleCenterOnSelected = () => {
      const selectedId = useEditorStore.getState().selectedEntityId;
      if (!selectedId) return;
      const mesh = meshMap.get(selectedId);
      if (mesh) {
        const targetPos = new THREE.Vector3();
        mesh.getWorldPosition(targetPos);

        const offset = new THREE.Vector3().subVectors(activeCamera.position, orbitControls.target);
        orbitControls.target.copy(targetPos);
        activeCamera.position.copy(targetPos).add(offset);
        orbitControls.update();
      }
    };

    // Orientate to selected object handler
    const handleOrientateToSelected = () => {
      const selectedId = useEditorStore.getState().selectedEntityId;
      if (!selectedId) return;
      const mesh = meshMap.get(selectedId);
      if (mesh) {
        const targetPos = new THREE.Vector3();
        mesh.getWorldPosition(targetPos);

        orbitControls.target.copy(targetPos);
        const currentZoom = useEditorStore.getState().viewportZoom || 100;
        activeCamera.position.set(
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

      const currentActiveCameraId = useEditorStore.getState().activeCameraId;
      const currentProjectionMode = useEditorStore.getState().projectionMode;
      let renderCamera: THREE.Camera = activeCamera;

      if (currentActiveCameraId === "default") {
        orbitControls.object = activeCamera;
        orbitControls.enabled = !transformControls.dragging;
        renderCamera = activeCamera;
        orbitControls.update();
      } else {
        const rig = meshMap.get(currentActiveCameraId);
        if (rig instanceof CustomCameraRig) {
          const selectedCam = currentProjectionMode === "perspective" ? rig.perspCamera : rig.orthoCamera;
          orbitControls.object = selectedCam;
          orbitControls.enabled = !transformControls.dragging;
          renderCamera = selectedCam;
          orbitControls.update();
        } else {
          orbitControls.object = activeCamera;
          orbitControls.enabled = !transformControls.dragging;
          renderCamera = activeCamera;
          orbitControls.update();
        }
      }

      meshMap.forEach((obj) => {
        if (obj.userData.helper) {
          obj.userData.helper.update();
        }
      });

      renderPass.camera = renderCamera;

      if (useComposer) {
        composer.render();
      } else {
        renderer.render(scene, renderCamera);
      }
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
      unsubPostProcessing();
      unsubViewportZoom();
      unsubHudOverlay();
      window.removeEventListener("libre3d-center-on-selected", handleCenterOnSelected);
      window.removeEventListener("libre3d-orientate-to-selected", handleOrientateToSelected);
      window.removeEventListener("keydown", handleKeyDown);
      stats.dom.remove();
      resizeObserverRef.current?.disconnect();
      resizeObserverRef.current = null;

      for (const obj of meshMap.values()) {
        scene.remove(obj);
        disposeSceneObject(obj, scene);
      }
      meshMap.clear();

      scene.remove(transformControls.getHelper());
      transformControls.dispose();

      scene.remove(gridHelper);
      scene.remove(ambientLight);

      composer.dispose();
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
  }, [projectionMode]); // Recreate cameras/controls on projection mode change

  return (
    <div
      ref={containerRef}
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        minHeight: "360px",
        overflow: "hidden",
        borderRadius: "0px",
        background: "#0b1020",
        display: isPreviewMode ? "none" : "block",
      }}
    />
  );
}