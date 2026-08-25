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
// the parse is enough to keep them out without touching the scene graph.
const hideEditorOnlyObjects = (scene: THREE.Scene): (() => void) => {
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