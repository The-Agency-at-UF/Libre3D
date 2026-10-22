import * as THREE from "three";

type GLTFExporterResult = ArrayBuffer | Blob | string | Record<string, unknown>;

type GLTFExporterOptions = {
  binary?: boolean;
  trs?: boolean;
  onlyVisible?: boolean;
  truncateDrawRange?: boolean;
  embedImages?: boolean;
};

type LiveSceneWindow = Window & {
  __libre3dScene?: THREE.Scene | null;
};

const FILE_BASE_NAME = "libre3d-scene";

const getSceneWindow = (): LiveSceneWindow | null => {
  if (typeof window === "undefined") {
    return null;
  }

  return window as LiveSceneWindow;
};

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

// The live scene the exporter reads is the *editor's* scene, so it also holds
// viewport furniture the user never asked to publish: the grid, directional-light
// helpers, selection outlines, the multi-select proxy and the transform gizmo.
// Left in, they end up as line/mesh nodes in every exported and published GLB.
// The light helper is the worst of them — three sets matrixAutoUpdate = false on
// it and drives it by matrix, so with `trs: true` the exporter reads its untouched
// position/quaternion/scale and writes the helper to the origin with no rotation,
// which is why it looked like the light moved between the editor and preview.
//
// Objects opt out by tagging themselves `userData.editorOnly` at creation. The
// export already runs with `onlyVisible: true`, so hiding them for the duration of
// the parse is enough to keep them out without touching the scene graph. The gallery
// thumbnail (viewport/thumbnailCapture.ts) hides them the same way for its render.
export const hideEditorOnlyObjects = (scene: THREE.Scene): (() => void) => {
  const hidden: THREE.Object3D[] = [];

  scene.traverse((object) => {
    if (object.userData?.editorOnly && object.visible) {
      object.visible = false;
      hidden.push(object);
    }
  });

  return () => {
    for (const object of hidden) {
      object.visible = true;
    }
  };
};

// The editor shows the selected object in the state being viewed by moving its Three object
// (ObjectManager.applyPose), so clicks, the selection outline, and the gizmo all follow it. Exports
// and the gallery thumbnail read that same scene and show every object in Base: each posed object's
// Base transform is kept here and put back for them. A WeakMap rather than userData, which the
// exporter writes into the file.
const basePoses = new WeakMap<THREE.Object3D, { position: THREE.Vector3; quaternion: THREE.Quaternion; scale: THREE.Vector3 }>();

/** Call before posing an object that's still in Base. */
export const rememberBasePose = (object: THREE.Object3D): void => {
  if (basePoses.has(object)) return;
  basePoses.set(object, { position: object.position.clone(), quaternion: object.quaternion.clone(), scale: object.scale.clone() });
};

/** Call when an object is put back in Base. */
export const forgetBasePose = (object: THREE.Object3D): void => {
  basePoses.delete(object);
};

/** Puts every posed object in Base; returns what puts them back. */
export const showBasePoses = (scene: THREE.Scene): (() => void) => {
  const restores: (() => void)[] = [];

  scene.traverse((object) => {
    const base = basePoses.get(object);
    if (!base) return;

    const posed = { position: object.position.clone(), quaternion: object.quaternion.clone(), scale: object.scale.clone() };
    object.position.copy(base.position);
    object.quaternion.copy(base.quaternion);
    object.scale.copy(base.scale);
    restores.push(() => {
      object.position.copy(posed.position);
      object.quaternion.copy(posed.quaternion);
      object.scale.copy(posed.scale);
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

const hasExportableMeshes = (scene: THREE.Scene): boolean => {
  let meshCount = 0;

  scene.traverse((object) => {
    if (object instanceof THREE.Mesh && object.visible && !object.userData?.editorOnly) {
      meshCount += 1;
    }
  });

  return meshCount > 0;
};

export const getLiveScene = (): THREE.Scene | null => getSceneWindow()?.__libre3dScene ?? null;

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
  const restoreEditorUserData = hideEditorUserData(scene);

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
    restorePoses();
    restoreEditorUserData();
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