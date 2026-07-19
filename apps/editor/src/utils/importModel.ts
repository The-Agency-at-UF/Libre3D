import * as THREE from "three";
import { saveModelAsset } from "./modelAssetStore";
import { createId } from "./createId";
import { walkGltfScene, nodePathKey } from "./gltfHierarchy";
import type { ImportNodeSpec } from "../store/useEditorStore";

// The single entry point for importing a .glb: validates, reads the file once,
// stores the raw buffer, parses it once into a node hierarchy, and names the
// import root after the file. Call sites just hand the result to
// addImportedModelHierarchy.
export async function prepareModelImport(file: File): Promise<{ assetId: string; nodes: ImportNodeSpec[] }> {
  if (!/\.glb$/i.test(file.name)) {
    window.alert("Only .glb files are supported for import.");
    throw new Error("Unsupported file type: only .glb files are supported for import.");
  }

  const buffer = await file.arrayBuffer();
  const assetId = createId("asset");
  await saveModelAsset(assetId, buffer);

  const nodes = await extractModelHierarchy(buffer);
  const root = nodes.find((node) => node.parentTempId === null);
  if (root) root.name = file.name.replace(/\.glb$/i, "");

  return { assetId, nodes };
}

// Parses the .glb once and DFS-walks gltf.scene into a flat ImportNodeSpec list.
// The root spec (parentTempId === null) is a synthetic wrapper for the whole
// import — it has no corresponding glTF node — while every other spec maps to
// one node, keyed by its nodePath (child-index path from gltf.scene).
async function extractModelHierarchy(buffer: ArrayBuffer): Promise<ImportNodeSpec[]> {
  const { GLTFLoader } = await import("three/examples/jsm/loaders/GLTFLoader.js");
  const loader = new GLTFLoader();

  const gltf = await new Promise<any>((resolve, reject) => {
    loader.parse(buffer, "", resolve, reject);
  });

  const rootTempId = createId("node");
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

  // Parent lookup by path, so we don't have to re-thread parent ids through the
  // shared walk. Pre-order DFS guarantees a parent is recorded before its
  // children; the empty path maps to the synthetic import root.
  const tempIdByPath = new Map<string, string>([["", rootTempId]]);
  const euler = new THREE.Euler();

  walkGltfScene(gltf.scene, (object, nodePath) => {
    const tempId = createId("node");
    tempIdByPath.set(nodePathKey(nodePath), tempId);
    const parentTempId = tempIdByPath.get(nodePathKey(nodePath.slice(0, -1))) ?? rootTempId;

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
  });

  return nodes;
}
