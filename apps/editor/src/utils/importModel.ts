import * as THREE from "three";
import { saveModelAsset } from "./modelAssetStore";
import { createId } from "./createId";
import { walkGltfScene, nodePathKey } from "./gltfHierarchy";
import type { ImportNodeSpec } from "../store/useEditorStore";
import type { GLTF } from "three/examples/jsm/loaders/GLTFLoader.js";

// Hands the freshly parsed glTF off to the very first hydrate of the same
// asset (ObjectManager.hydrateImportedModel), which would otherwise re-fetch
// the identical buffer from IndexedDB and parse it a second time. Entries are
// one-shot: takeParsedModel deletes on read, so a reload — where nothing was
// parsed this session — falls through to the buffer as before.
const parsedModelCache = new Map<string, GLTF>();
const parsedModelTimers = new Map<string, ReturnType<typeof setTimeout>>();

// Hydration follows a fresh import within the same tick, so anything still
// cached after this long was never claimed (an import that failed between the
// parse and the store update). Drop it rather than pin a whole parsed scene —
// geometry, textures and all — in memory for the life of the page.
const PARSED_MODEL_TTL_MS = 30_000;

function cacheParsedModel(assetId: string, gltf: GLTF): void {
  parsedModelCache.set(assetId, gltf);
  parsedModelTimers.set(
    assetId,
    setTimeout(() => {
      parsedModelCache.delete(assetId);
      parsedModelTimers.delete(assetId);
    }, PARSED_MODEL_TTL_MS),
  );
}

// Get-and-delete. Returns undefined on a miss, which is the signal to parse
// from the stored buffer instead.
export function takeParsedModel(assetId: string): GLTF | undefined {
  const gltf = parsedModelCache.get(assetId);
  parsedModelCache.delete(assetId);
  const timer = parsedModelTimers.get(assetId);
  if (timer !== undefined) {
    clearTimeout(timer);
    parsedModelTimers.delete(assetId);
  }
  return gltf;
}

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

  const nodes = await extractModelHierarchy(buffer, assetId);
  const root = nodes.find((node) => node.parentTempId === null);
  if (root) root.name = file.name.replace(/\.glb$/i, "");

  return { assetId, nodes };
}

// Parses the .glb once and DFS-walks gltf.scene into a flat ImportNodeSpec list.
// The root spec (parentTempId === null) is a synthetic wrapper for the whole
// import — it has no corresponding glTF node — while every other spec maps to
// one node, keyed by its nodePath (child-index path from gltf.scene).
// The parsed result is also cached under assetId for the imminent hydrate.
async function extractModelHierarchy(buffer: ArrayBuffer, assetId: string): Promise<ImportNodeSpec[]> {
  const { GLTFLoader } = await import("three/examples/jsm/loaders/GLTFLoader.js");
  const loader = new GLTFLoader();

  const gltf = await new Promise<GLTF>((resolve, reject) => {
    loader.parse(buffer, "", resolve, reject);
  });
  cacheParsedModel(assetId, gltf);

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
      // glTF nodes are frequently unnamed (compensation/wrapper nodes, loose
      // exporters, etc.). Fall back to the THREE.js object type (Mesh, Bone,
      // Group, SkinnedMesh...) instead of a meaningless positional "Node 4" —
      // it's the closest thing to a name the file actually gives us.
      name: object.name || object.type,
      nodePath,
      position: [object.position.x, object.position.y, object.position.z],
      rotation: [euler.x, euler.y, euler.z],
      scale: [object.scale.x, object.scale.y, object.scale.z],
    });
  });

  return nodes;
}
