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

const hasExportableMeshes = (scene: THREE.Scene): boolean => {
  let meshCount = 0;

  scene.traverse((object) => {
    if (object instanceof THREE.Mesh) {
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