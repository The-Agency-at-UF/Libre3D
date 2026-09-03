import * as THREE from "three";
import { saveModelAsset } from "./modelAssetStore";
import { createId } from "./createId";
import { walkGltfScene, nodePathKey, collectSkinnedBones } from "./gltfHierarchy";
import { pruneImportNodes, type PrunableNode } from "./pruneImportHierarchy";
import { createConfiguredGltfLoader } from "./createGltfLoader";
import type { ImportNodeSpec } from "../store/useEditorStore";
import type { GLTF } from "three/examples/jsm/loaders/GLTFLoader.js";

// Hands the freshly parsed glTF off to the very first hydrate of the same
// asset (ObjectManager.hydrateImportedModel), which would otherwise re-fetch
// the identical buffer from storage and parse it a second time. Entries are
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

// glTF declares its unit as the metre, but nothing enforces it and exporters
// routinely bake a unit conversion into the file instead: a Sketchfab download of
// a 4.7 m car authored in centimetres arrives with a RootNode scaled to 0.01, so
// the whole model measures 0.047 units and lands as an invisible speck beside the
// 1-unit default cube. Measuring the parsed scene and giving the import root a
// starting scale puts it on screen.
//
// Only wildly out-of-range models are touched. Anything whose longest axis
// already falls inside the band below keeps scale 1, so a correctly authored
// model retains its real proportions and several imports from the same source
// stay consistent with each other. The factor lands on the synthetic import root
// -- no geometry and no child transform is modified -- which makes it a starting
// value the user can reset to 1 in the inspector.
const NORMALIZE_TARGET_UNITS = 2;
const NORMALIZE_MIN_UNITS = 0.5;
const NORMALIZE_MAX_UNITS = 100;

function computeImportRootScale(scene: THREE.Object3D): number {
  // setFromObject reads each mesh's world matrix, which GLTFLoader has not
  // necessarily flushed yet on the freshly parsed scene.
  scene.updateMatrixWorld(true);

  const box = new THREE.Box3().setFromObject(scene);
  // An import with no renderable geometry (an empty scene, lights or cameras
  // only) has nothing to measure.
  if (box.isEmpty()) return 1;

  const size = box.getSize(new THREE.Vector3());
  const longest = Math.max(size.x, size.y, size.z);
  // A degenerate box -- a single point, or NaN from malformed vertex data --
  // would otherwise divide into an infinite or NaN scale.
  if (!Number.isFinite(longest) || longest <= 0) return 1;
  if (longest >= NORMALIZE_MIN_UNITS && longest <= NORMALIZE_MAX_UNITS) return 1;

  return NORMALIZE_TARGET_UNITS / longest;
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
  const loader = await createConfiguredGltfLoader();

  const gltf = await new Promise<GLTF>((resolve, reject) => {
    loader.parse(buffer, "", resolve, reject);
  });
  cacheParsedModel(assetId, gltf);

  const boneSet = collectSkinnedBones(gltf.scene);

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

  // hasMesh/isProtected are only needed transiently to decide what to prune
  // below -- not part of the persisted ImportNodeSpec shape -- so they're
  // tracked in a side map keyed by tempId instead of widening that type.
  const hasMeshByTempId = new Map<string, boolean>([[rootTempId, false]]);
  const isProtectedByTempId = new Map<string, boolean>([[rootTempId, true]]); // root is never prunable

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
    hasMeshByTempId.set(tempId, object instanceof THREE.Mesh);
    isProtectedByTempId.set(tempId, boneSet.has(object));
  });

  const pruned = pruneExtractedNodes(nodes, hasMeshByTempId, isProtectedByTempId);

  // Applied after pruning so the factor lands on whichever spec survives as the
  // root, and measured from the parsed scene rather than the specs because the
  // bounds depend on geometry the specs don't carry.
  const rootScale = computeImportRootScale(gltf.scene);
  if (rootScale === 1) return pruned;

  return pruned.map((node) =>
    node.parentTempId === null ? { ...node, scale: [rootScale, rootScale, rootScale] as [number, number, number] } : node,
  );
}

// Collapses pass-through wrappers and drops dead leaves from a freshly
// extracted node list via the shared pruneImportNodes algorithm -- reused
// as-is by ObjectManager's backfill pass for pre-existing imports, so both
// call sites share one implementation of the actual graph/matrix logic.
function pruneExtractedNodes(
  nodes: ImportNodeSpec[],
  hasMeshById: Map<string, boolean>,
  isProtectedById: Map<string, boolean>,
): ImportNodeSpec[] {
  const prunable: PrunableNode[] = nodes.map((node) => ({
    id: node.tempId,
    parentId: node.parentTempId,
    hasMesh: hasMeshById.get(node.tempId) ?? false,
    isProtected: isProtectedById.get(node.tempId) ?? false,
    position: node.position,
    rotation: node.rotation,
    scale: node.scale,
  }));

  const { keptById, removedIds } = pruneImportNodes(prunable);
  if (removedIds.size === 0) return nodes;

  return nodes
    .filter((node) => keptById.has(node.tempId))
    .map((node) => {
      const kept = keptById.get(node.tempId)!;
      return { ...node, parentTempId: kept.parentId, position: kept.position, rotation: kept.rotation, scale: kept.scale };
    });
}
