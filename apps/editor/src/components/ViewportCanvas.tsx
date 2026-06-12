import { useEffect, useRef } from "react";

import * as THREE from "three";

import { useEditorStore } from "../store/useEditorStore";
import type { SceneObject } from "../types/editor";

const sceneBackground = new THREE.Color("#0b1020");

const createGeometry = (object: SceneObject): THREE.BufferGeometry => {
  switch (object.type) {
    case "sphere":
      return new THREE.SphereGeometry(0.5, 32, 16);
    case "cylinder":
      return new THREE.CylinderGeometry(0.5, 0.5, 1, 32);
    case "box":
    default:
      return new THREE.BoxGeometry(1, 1, 1);
  }
};

const createMesh = (object: SceneObject): THREE.Mesh => {
  const mesh = new THREE.Mesh(
    createGeometry(object),
    new THREE.MeshStandardMaterial({ color: object.color }),
  );

  mesh.position.set(...object.position);
  mesh.scale.set(...object.scale);

  return mesh;
};

const disposeGroup = (group: THREE.Group): void => {
  group.children.forEach((child) => {
    if (child instanceof THREE.Mesh) {
      child.geometry.dispose();

      const material = child.material;
      if (Array.isArray(material)) {
        material.forEach((entry) => entry.dispose());
      } else {
        material.dispose();
      }
    }
  });

  group.clear();
};

export function ViewportCanvas() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const objectsGroupRef = useRef<THREE.Group | null>(null);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);

  const objects = useEditorStore((state) => state.objects);

  useEffect(() => {
    const container = containerRef.current;

    if (!container) {
      return;
    }

    const scene = new THREE.Scene();
    scene.background = sceneBackground;

    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
    camera.position.set(4, 3, 6);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(window.devicePixelRatio || 1);
    renderer.setClearColor(sceneBackground, 1);
    renderer.outputColorSpace = THREE.SRGBColorSpace;

    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 2.2);
    directionalLight.position.set(5, 8, 4);

    const gridHelper = new THREE.GridHelper(20, 20, 0x334155, 0x1f2937);
    const objectsGroup = new THREE.Group();

    scene.add(ambientLight);
    scene.add(directionalLight);
    scene.add(gridHelper);
    scene.add(objectsGroup);

    sceneRef.current = scene;
    cameraRef.current = camera;
    rendererRef.current = renderer;
    objectsGroupRef.current = objectsGroup;

    container.appendChild(renderer.domElement);

    const resizeRenderer = (): void => {
      const nextWidth = container.clientWidth || 1;
      const nextHeight = container.clientHeight || 1;

      camera.aspect = nextWidth / nextHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(nextWidth, nextHeight, false);
      renderer.render(scene, camera);
    };

    resizeObserverRef.current = new ResizeObserver(() => {
      resizeRenderer();
    });

    resizeObserverRef.current.observe(container);
    resizeRenderer();

    return () => {
      resizeObserverRef.current?.disconnect();
      resizeObserverRef.current = null;

      disposeGroup(objectsGroup);
      scene.remove(gridHelper);
      scene.remove(ambientLight);
      scene.remove(directionalLight);
      scene.remove(objectsGroup);

      renderer.dispose();
      renderer.domElement.remove();

      sceneRef.current = null;
      cameraRef.current = null;
      rendererRef.current = null;
      objectsGroupRef.current = null;
    };
  }, []);

  useEffect(() => {
    const scene = sceneRef.current;
    const camera = cameraRef.current;
    const renderer = rendererRef.current;
    const objectsGroup = objectsGroupRef.current;

    if (!scene || !camera || !renderer || !objectsGroup) {
      return;
    }

    disposeGroup(objectsGroup);

    objects.forEach((object) => {
      objectsGroup.add(createMesh(object));
    });

    renderer.render(scene, camera);
  }, [objects]);

  return (
    <div
      ref={containerRef}
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        minHeight: "360px",
        overflow: "hidden",
        borderRadius: "24px",
        background: "#0b1020",
      }}
    />
  );
}