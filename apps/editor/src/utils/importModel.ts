import * as THREE from "three";
import { saveModelAsset } from "./modelAssetStore";
import type { ImportNodeSpec } from "../store/useEditorStore";

const createAssetId = (): string => {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  return `asset-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
};

const createTempId = (): string => {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  return `node-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
};

export async function importModelFile(file: File): Promise<{ assetId: string; name: string }> {
  if (!/\.glb$/i.test(file.name)) {
    window.alert("Only .glb files are supported for import.");
    throw new Error("Unsupported file type: only .glb files are supported for import.");
  }

  const buffer = await file.arrayBuffer();
  const assetId = createAssetId();
  await saveModelAsset(assetId, buffer);

  return { assetId, name: file.name.replace(/\.glb$/i, "") };
}

// Parses the .glb once and DFS-walks gltf.scene into a flat ImportNodeSpec list.
// The root spec (parentTempId === null) is a synthetic wrapper for the whole
// import — it has no corresponding glTF node — while every other spec maps to
// one node, keyed by its nodePath (child-index path from gltf.scene).
export async function extractModelHierarchy(buffer: ArrayBuffer): Promise<ImportNodeSpec[]> {
  const { GLTFLoader } = await import("three/examples/jsm/loaders/GLTFLoader.js");
  const loader = new GLTFLoader();

  const gltf = await new Promise<any>((resolve, reject) => {
    loader.parse(buffer, "", resolve, reject);
  });

  const rootTempId = createTempId();
  const nodes: ImportNodeSpec[] = [
    {
      tempId: rootTempId,
      parentTempId: null,
      name: "Imported Model",
      nodePath: [],
      position: [0, 0, 0],
      rotation: [0, 0, 0],
      scale: [1, 1, 1],
    },
  ];

  const euler = new THREE.Euler();
  const walk = (object: THREE.Object3D, nodePath: number[], parentTempId: string) => {
    const tempId = createTempId();
    euler.setFromQuaternion(object.quaternion, "XYZ");
    nodes.push({
      tempId,
      parentTempId,
      name: object.name || `Node ${nodePath[nodePath.length - 1]}`,
      nodePath,
      position: [object.position.x, object.position.y, object.position.z],
      rotation: [euler.x, euler.y, euler.z],
      scale: [object.scale.x, object.scale.y, object.scale.z],
    });

    object.children.forEach((child, index) => walk(child, [...nodePath, index], tempId));
  };

  gltf.scene.children.forEach((child: THREE.Object3D, index: number) => walk(child, [index], rootTempId));

  return nodes;
}
