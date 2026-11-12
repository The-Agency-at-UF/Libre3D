import * as THREE from "three";
import { PathMesh } from "../paths/PathMesh";
import { showBasePoses } from "../viewport/basePoses";
import { hideEditorOnlyObjects } from "../viewport/editorOnly";
import { bakeLayerStacksForExport } from "../viewport/layerNodes";

type GLTFExporterResult = ArrayBuffer | Blob | string | Record<string, unknown>;

type GLTFExporterOptions = {
  binary?: boolean;
  trs?: boolean;
  onlyVisible?: boolean;
  truncateDrawRange?: boolean;
  embedImages?: boolean;
};

const FILE_BASE_NAME = "libre3d-scene";

export const createDownload = (content: BlobPart, fileName: string, mimeType: string): void => {
  const blob = new Blob([content], { type: mimeType });
  const objectUrl = window.URL.createObjectURL(blob);
  const anchor = document.createElement("a");

  anchor.href = objectUrl;
  anchor.download = fileName;
  anchor.rel = "noopener noreferrer";
  anchor.style.display = "none";

  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.URL.revokeObjectURL(objectUrl);
};

// A path is trimmed by its tube's draw range (paths/PathMesh.ts), which GLTFExporter ignores (three
// r178 no longer reads the `truncateDrawRange` option passed below): it would write the whole tube
// with the caps where the trim ends. For the parse, a trimmed path gets a
// copy of its tube holding only the drawn part, and one that draws nothing is left out like a
// hidden object. Run after showBasePoses, so it's the Base trim that's exported.
const trimPathsForExport = (scene: THREE.Scene): (() => void) => {
  const restores: (() => void)[] = [];

  scene.traverse((object) => {
    if (!(object instanceof PathMesh) || !object.visible) return;

    if (!object.isDrawn) {
      object.visible = false;
      restores.push(() => {
        object.visible = true;
      });
      return;
    }

    const trimmed = object.createTrimmedGeometry();
    if (!trimmed) return;
    const tube = object.geometry;
    object.geometry = trimmed;
    restores.push(() => {
      object.geometry = tube;
      trimmed.dispose();
    });
  });

  return () => restores.forEach((restore) => restore());
};

// GLTFExporter writes every object's userData into the file as that node's glTF `extras`, through
// JSON.stringify, so a Three object kept there ships its whole toJSON. ObjectManager keeps its own
// bookkeeping in userData: which entity an object is, whether it's locked, which parent it's tracked
// under, and its selection outline, light helper and light target. None of it means anything outside
// the editor (a cube and the default light carried about 3 KB of it). Like the furniture above, each
// object gets a copy without it for the duration of the parse. What's left is data an imported glTF
// node brought with it (GLTFLoader puts a node's extras in userData), and that ships.
//
// The plain values go by name. The references go by type: a file's extras are JSON, so they can't
// hold a Three object, and a node of the user's own with an extra called `target` keeps it.
const EDITOR_USER_DATA_KEYS = new Set(["editorOnly", "entityId", "entityType", "parentEntityId", "locked", "assetId", "loadError"]);

const isEditorUserData = (key: string, value: unknown): boolean =>
  EDITOR_USER_DATA_KEYS.has(key) || value instanceof THREE.Object3D;

const hideEditorUserData = (scene: THREE.Scene): (() => void) => {
  const swapped: { object: THREE.Object3D; userData: Record<string, unknown> }[] = [];

  scene.traverse((object) => {
    const userData = object.userData;
    if (!userData) return;

    const entries = Object.entries(userData);
    if (!entries.some(([key, value]) => isEditorUserData(key, value))) return;

    object.userData = Object.fromEntries(entries.filter(([key, value]) => !isEditorUserData(key, value)));
    swapped.push({ object, userData });
  });

  return () => {
    for (const { object, userData } of swapped) {
      // Keep anything the editor wrote while the export ran (a model that finishes loading
      // mid-export sets its selection outline then).
      object.userData = Object.assign(userData, object.userData);
    }
  };
};

// glTF has PBR (standard) and unlit materials only: GLTFExporter warns and guesses for any other.
// New 3D objects are Phong (task D2), so Phong, Lambert and Toon go out as a standard material with
// the same colour, maps, emissive and surface for the length of the export. Phong's shininess sets
// the roughness (the usual Blinn-Phong to GGX approximation); Lambert and Toon are fully rough.
const isBuiltInFlag = (material: THREE.Material, flag: string): boolean => (material as unknown as Record<string, unknown>)[flag] === true;

const standardCopyOf = (material: THREE.Material): THREE.MeshStandardMaterial => {
  const source = material as THREE.MeshPhongMaterial;
  const shininess = isBuiltInFlag(material, "isMeshPhongMaterial") ? source.shininess : 0;
  return new THREE.MeshStandardMaterial({
    name: source.name,
    color: source.color,
    map: source.map,
    opacity: source.opacity,
    transparent: source.transparent,
    alphaTest: source.alphaTest,
    alphaMap: source.alphaMap,
    side: source.side,
    vertexColors: source.vertexColors,
    emissive: source.emissive,
    emissiveIntensity: source.emissiveIntensity,
    emissiveMap: source.emissiveMap,
    normalMap: source.normalMap,
    normalScale: source.normalScale,
    aoMap: source.aoMap,
    aoMapIntensity: source.aoMapIntensity,
    roughness: shininess > 0 ? Math.sqrt(2 / (shininess + 2)) : 1,
    metalness: 0,
  });
};

const standardMaterialsForExport = (scene: THREE.Scene): (() => void) => {
  const copies = new Map<THREE.Material, THREE.MeshStandardMaterial>();
  const restores: (() => void)[] = [];

  scene.traverse((object) => {
    if (!(object instanceof THREE.Mesh) || Array.isArray(object.material)) return;
    const material = object.material as THREE.Material;
    if (!["isMeshPhongMaterial", "isMeshLambertMaterial", "isMeshToonMaterial"].some((flag) => isBuiltInFlag(material, flag))) return;
    let copy = copies.get(material);
    if (!copy) {
      copy = standardCopyOf(material);
      copies.set(material, copy);
    }
    object.material = copy;
    restores.push(() => {
      object.material = material;
    });
  });

  return () => {
    restores.forEach((restore) => restore());
    copies.forEach((copy) => copy.dispose());
  };
};

const hasExportableMeshes = (scene: THREE.Scene): boolean => {
  let meshCount = 0;

  scene.traverse((object) => {
    if (object instanceof THREE.Mesh && object.visible && !object.userData?.editorOnly) {
      meshCount += 1;
    }
  });

  return meshCount > 0;
};

const parseScene = async (
  exporter: {
    parse: (
      input: THREE.Object3D,
      onDone: (result: GLTFExporterResult) => void,
      onError: (error: unknown) => void,
      options: GLTFExporterOptions,
    ) => void;
  },
  scene: THREE.Scene,
  options: GLTFExporterOptions,
): Promise<GLTFExporterResult> =>
  new Promise((resolve, reject) => {
    exporter.parse(scene, resolve, reject, options);
  });

export const createSceneExportBlob = async (
  scene: THREE.Scene,
  format: "glb" | "gltf",
): Promise<Blob | null> => {
  if (!hasExportableMeshes(scene)) {
    return null;
  }

  const { GLTFExporter } = await import("three/examples/jsm/exporters/GLTFExporter.js");
  const exporter = new GLTFExporter();
  const restoreEditorOnlyObjects = hideEditorOnlyObjects(scene);
  const restorePoses = showBasePoses(scene);
  const restoreTrimmedPaths = trimPathsForExport(scene);
  const restoreEditorUserData = hideEditorUserData(scene);
  // A glTF material can't blend layers: a Depth stack goes out as vertex colours with the blend baked in.
  const restoreLayerStacks = bakeLayerStacksForExport(scene);
  // After the bake, which finds a stack by the object's own material.
  const restoreMaterials = standardMaterialsForExport(scene);

  try {
    const result = await parseScene(
      exporter,
      scene,
      format === "glb"
        ? {
            binary: true,
            trs: true,
            onlyVisible: true,
            truncateDrawRange: true,
            embedImages: true,
          }
        : {
            binary: false,
            trs: true,
            onlyVisible: true,
            truncateDrawRange: true,
            embedImages: true,
          },
    );

    if (result instanceof Blob) {
      return result;
    }

    if (result instanceof ArrayBuffer) {
      return new Blob([result], { type: "model/gltf-binary" });
    }

    if (format === "glb") {
      throw new Error("GLB export did not produce a binary payload.");
    }

    const payload = typeof result === "string" ? result : JSON.stringify(result, null, 2);

    return new Blob([payload], { type: "application/gltf+json" });
  } finally {
    // Restore even if the parse throws — a failed export must never leave the
    // editor's grid, helpers and gizmo invisible.
    restoreEditorOnlyObjects();
    restoreTrimmedPaths();
    restorePoses();
    restoreEditorUserData();
    restoreMaterials();
    restoreLayerStacks();
  }
};

export const exportLiveScene = async (scene: THREE.Scene): Promise<{ format: "glb" | "gltf"; fileName: string } | null> => {
  if (!hasExportableMeshes(scene)) {
    return null;
  }

  try {
    const binaryBlob = await createSceneExportBlob(scene, "glb");

    if (binaryBlob) {
      const fileName = `${FILE_BASE_NAME}.glb`;
      createDownload(binaryBlob, fileName, "model/gltf-binary");
      return { format: "glb", fileName };
    }
  } catch (error) {
    console.warn("GLB export failed, falling back to GLTF.", error);
  }

  const jsonBlob = await createSceneExportBlob(scene, "gltf");

  const fileName = `${FILE_BASE_NAME}.gltf`;
  if (jsonBlob) {
    createDownload(jsonBlob, fileName, "application/gltf+json");
  }
  return { format: "gltf", fileName };
};