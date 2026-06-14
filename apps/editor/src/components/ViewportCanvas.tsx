import { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { TransformControls } from "three/examples/jsm/controls/TransformControls.js";
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
    wireframe: useEditorStore.getState().wireframe,
  });

const createMesh = (entity: Entity): THREE.Mesh => {
  const mesh = new THREE.Mesh(createGeometry(entity), createMaterial(entity));

  mesh.position.set(...entity.position);
  mesh.rotation.set(...entity.rotation);
  mesh.scale.set(...entity.scale);

  return mesh;
};

const disposeMesh = (mesh: THREE.Mesh): void => {
  mesh.geometry.dispose();

  const material = mesh.material;
  if (Array.isArray(material)) {
    material.forEach((entry) => entry.dispose());
  } else {
    material.dispose();
  }
};

const syncEntityToMesh = (mesh: THREE.Mesh, entity: Entity, isBeingDragged: boolean): void => {
  if (!isBeingDragged) {
    mesh.position.set(...entity.position);
    mesh.rotation.set(...entity.rotation);
    mesh.scale.set(...entity.scale);
  }
  mesh.visible = entity.visible;
  mesh.userData.locked = entity.locked;

  if (mesh.material instanceof THREE.MeshStandardMaterial) {
    mesh.material.color.set(entity.color);
  }
};

export interface ViewportCanvasProps {
  activeTransformTool?: "translate" | "rotate" | "scale";
  transformSpace?: "world" | "local";
  projectionMode?: "perspective" | "orthographic";
}

export function ViewportCanvas({
  activeTransformTool = "translate",
  transformSpace = "world",
  projectionMode = "perspective",
}: ViewportCanvasProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.Camera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);

  const transformControlsRef = useRef<TransformControls | null>(null);
  const orbitControlsRef = useRef<OrbitControls | null>(null);

  // Sync mode and space when props change
  useEffect(() => {
    if (transformControlsRef.current) {
      transformControlsRef.current.setMode(activeTransformTool);
    }
  }, [activeTransformTool]);

  useEffect(() => {
    if (transformControlsRef.current) {
      transformControlsRef.current.setSpace(transformSpace);
    }
  }, [transformSpace]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const initialStoreState = useEditorStore.getState();
    const initialBgColor = new THREE.Color(initialStoreState.bgColor || "#0b1020");

    const scene = new THREE.Scene();
    scene.background = initialBgColor;
    if (initialStoreState.fogEnabled) {
      scene.fog = new THREE.FogExp2(initialStoreState.bgColor || "#0b1020", 0.05);
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
    renderer.setClearColor(initialBgColor, 1);
    renderer.outputColorSpace = THREE.SRGBColorSpace;

    const ambientLight = new THREE.AmbientLight(0xffffff, initialStoreState.lightIntensity * 1.5);
    const directionalLight = new THREE.DirectionalLight(new THREE.Color(initialStoreState.lightColor), 2.2);
    directionalLight.position.set(5, 8, 4);
    directionalLight.target.position.set(0, 0, 0);
    scene.add(directionalLight.target);

    const gridHelper = new THREE.GridHelper(20, 20, 0x334155, 0x1f2937);
    gridHelper.visible = initialStoreState.gridPlane !== "None";
    gridHelper.rotation.set(0, 0, 0);
    if (initialStoreState.gridPlane === "Wall (XY)") {
      gridHelper.rotation.x = Math.PI / 2;
    } else if (initialStoreState.gridPlane === "Side (YZ)") {
      gridHelper.rotation.z = Math.PI / 2;
    }

    const meshMap = new Map<string, THREE.Mesh>();
    let selectedMesh: THREE.Mesh | null = null;
    let animationFrameId = 0;

    scene.add(ambientLight);
    scene.add(directionalLight);
    scene.add(gridHelper);

    sceneRef.current = scene;
    rendererRef.current = renderer;
    (window as Window & { __libre3dScene?: THREE.Scene | null }).__libre3dScene = scene;

    renderer.domElement.style.width = "100%";
    renderer.domElement.style.height = "100%";
    renderer.domElement.style.display = "block";
    container.appendChild(renderer.domElement);

    // Controls setup
    const orbitControls = new OrbitControls(activeCamera, renderer.domElement);
    orbitControls.enableDamping = true;
    orbitControls.dampingFactor = 0.05;
    orbitControlsRef.current = orbitControls;

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

    // Selection application
    const applySelectionState = (selectedEntityId: string | null): void => {
      // Clean up previous selected emissive
      if (selectedMesh?.material instanceof THREE.MeshStandardMaterial) {
        selectedMesh.material.emissive.set(0x000000);
      }

      selectedMesh = selectedEntityId ? meshMap.get(selectedEntityId) ?? null : null;

      if (selectedMesh && !selectedMesh.userData.locked) {
        if (selectedMesh.material instanceof THREE.MeshStandardMaterial) {
          selectedMesh.material.emissive.set(0x143c2d);
        }
        transformControls.attach(selectedMesh);
      } else {
        transformControls.detach();
      }
    };

    const syncMeshes = (entities: Entity[], selectedEntityId: string | null): void => {
      const nextIds = new Set(entities.map((entity) => entity.id));

      for (const entity of entities) {
        const existingMesh = meshMap.get(entity.id);
        const isBeingDragged = transformControls.object === existingMesh && transformControls.dragging;

        if (!existingMesh) {
          const mesh = createMesh(entity);
          mesh.userData.entityId = entity.id;
          mesh.userData.entityType = entity.type;
          mesh.userData.locked = entity.locked;
          mesh.visible = entity.visible;
          scene.add(mesh);
          meshMap.set(entity.id, mesh);
          continue;
        }

        syncEntityToMesh(existingMesh, entity, isBeingDragged);

        if (existingMesh.userData.entityType !== entity.type) {
          existingMesh.geometry.dispose();
          existingMesh.geometry = createGeometry(entity);
          existingMesh.userData.entityType = entity.type;
        }

        const material = existingMesh.material;
        if (material instanceof THREE.MeshStandardMaterial) {
          material.color.set(entity.color);
        }
      }

      for (const [entityId, mesh] of meshMap) {
        if (nextIds.has(entityId)) {
          continue;
        }

        if (transformControls.object === mesh) {
          transformControls.detach();
        }
        scene.remove(mesh);
        disposeMesh(mesh);
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
        meshMap.forEach((mesh) => {
          if (mesh.visible && !mesh.userData.locked) {
            targets.push(mesh);
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

    const unsubBgColor = useEditorStore.subscribe(
      (state) => state.bgColor,
      (bgColor) => {
        const color = new THREE.Color(bgColor);
        scene.background = color;
        renderer.setClearColor(color, 1);
        if (scene.fog instanceof THREE.FogExp2) {
          scene.fog.color = color;
        }
      }
    );

    const unsubGridPlane = useEditorStore.subscribe(
      (state) => state.gridPlane,
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
      (state) => state.wireframe,
      (wireframe) => {
        meshMap.forEach((mesh) => {
          if (mesh.material instanceof THREE.MeshStandardMaterial) {
            mesh.material.wireframe = wireframe;
          }
        });
      }
    );

    const unsubLightIntensity = useEditorStore.subscribe(
      (state) => state.lightIntensity,
      (intensity) => {
        ambientLight.intensity = intensity * 1.5;
      }
    );

    const unsubLightColor = useEditorStore.subscribe(
      (state) => state.lightColor,
      (color) => {
        directionalLight.color.set(color);
      }
    );

    const unsubFogEnabled = useEditorStore.subscribe(
      (state) => state.fogEnabled,
      (enabled) => {
        if (enabled) {
          scene.fog = new THREE.FogExp2(useEditorStore.getState().bgColor || "#0b1020", 0.05);
        } else {
          scene.fog = null;
        }
      }
    );

    // Animation Loop
    const animate = (): void => {
      animationFrameId = window.requestAnimationFrame(animate);
      orbitControls.update();
      renderer.render(scene, activeCamera);
    };
    animate();

    return () => {
      window.cancelAnimationFrame(animationFrameId);
      renderer.domElement.removeEventListener("pointerdown", onPointerDown);
      renderer.domElement.removeEventListener("pointerup", onPointerUp);
      unsubEntities();
      unsubSelection();
      unsubBgColor();
      unsubGridPlane();
      unsubWireframe();
      unsubLightIntensity();
      unsubLightColor();
      unsubFogEnabled();
      resizeObserverRef.current?.disconnect();
      resizeObserverRef.current = null;

      for (const mesh of meshMap.values()) {
        scene.remove(mesh);
        disposeMesh(mesh);
      }
      meshMap.clear();

      scene.remove(transformControls.getHelper());
      transformControls.dispose();

      scene.remove(gridHelper);
      scene.remove(ambientLight);
      scene.remove(directionalLight);
      scene.remove(directionalLight.target);

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
      }}
    />
  );
}