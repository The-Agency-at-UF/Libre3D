import { useEffect, useRef } from "react";

import * as THREE from "three";

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

const syncEntityToMesh = (mesh: THREE.Mesh, entity: Entity): void => {
  mesh.position.set(...entity.position);
  mesh.rotation.set(...entity.rotation);
  mesh.scale.set(...entity.scale);
  mesh.visible = entity.visible;
  mesh.userData.locked = entity.locked;

  if (mesh.material instanceof THREE.MeshStandardMaterial) {
    mesh.material.color.set(entity.color);
  }
};

export function ViewportCanvas() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);

  useEffect(() => {
    const container = containerRef.current;

    if (!container) {
      return;
    }

    const initialStoreState = useEditorStore.getState();
    const initialBgColor = new THREE.Color(initialStoreState.bgColor || "#0b1020");

    const scene = new THREE.Scene();
    scene.background = initialBgColor;
    if (initialStoreState.fogEnabled) {
      scene.fog = new THREE.FogExp2(initialStoreState.bgColor || "#0b1020", 0.05);
    }

    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
    camera.position.set(0, 5, 10);
    camera.lookAt(0, 0, 0);

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
    cameraRef.current = camera;
    rendererRef.current = renderer;
    (window as Window & { __libre3dScene?: THREE.Scene | null }).__libre3dScene = scene;

    renderer.domElement.style.width = "100%";
    renderer.domElement.style.height = "100%";
    renderer.domElement.style.display = "block";
    container.appendChild(renderer.domElement);

    const resizeRenderer = (): void => {
      const nextWidth = container.clientWidth || 1;
      const nextHeight = container.clientHeight || 1;

      camera.aspect = nextWidth / nextHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(nextWidth, nextHeight, false);
    };

    const applySelectionState = (selectedEntityId: string | null): void => {
      if (selectedMesh?.material instanceof THREE.MeshStandardMaterial) {
        selectedMesh.material.emissive.set(0x000000);
        selectedMesh.material.wireframe = false;
      }

      selectedMesh = selectedEntityId ? meshMap.get(selectedEntityId) ?? null : null;

      if (selectedMesh && !selectedMesh.userData.locked && selectedMesh.material instanceof THREE.MeshStandardMaterial) {
        selectedMesh.material.emissive.set(0x143c2d);
        selectedMesh.material.wireframe = false;
      }
    };

    const syncMeshes = (entities: Entity[], selectedEntityId: string | null): void => {
      const nextIds = new Set(entities.map((entity) => entity.id));

      for (const entity of entities) {
        const existingMesh = meshMap.get(entity.id);

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

        syncEntityToMesh(existingMesh, entity);

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

    const unsubEntities = useEditorStore.subscribe(
      (state) => state.entities,
      (entities) => {
        syncMeshes(entities, useEditorStore.getState().selectedEntityId);
      },
      {
        fireImmediately: true,
      },
    );

    const unsubSelection = useEditorStore.subscribe(
      (state) => state.selectedEntityId,
      (selectedEntityId) => {
        applySelectionState(selectedEntityId);
      },
      {
        fireImmediately: true,
      },
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

    const animate = (): void => {
      animationFrameId = window.requestAnimationFrame(animate);
      renderer.render(scene, camera);
    };

    animate();

    return () => {
      window.cancelAnimationFrame(animationFrameId);
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
  }, []);

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