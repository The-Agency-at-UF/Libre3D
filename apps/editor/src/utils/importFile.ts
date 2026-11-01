import { useEditorStore } from "../store/useEditorStore";
import { prepareModelImport } from "./importModel";
import { importImageFile, isImageFile } from "./importImage";
import { importSvgFile, isSvgFile } from "./importSvg";

/**
 * Imports a picked (Import...) or dropped (DropOverlay) file into the open scene by its type: an
 * .svg as shapes and paths, a .png/.jpg/.jpeg as an image plane, anything else as a model, which
 * prepareModelImport takes only as a .glb (and tells the user otherwise). A `.libre3d` scene isn't
 * imported into a scene: it opens as one (sceneFileTransfers.ts).
 */
export const importFileIntoScene = async (file: File): Promise<void> => {
  try {
    if (isSvgFile(file)) {
      await importSvgFile(file);
    } else if (isImageFile(file)) {
      await importImageFile(file);
    } else {
      useEditorStore.getState().adjustPendingImports(1);
      try {
        const { assetId, nodes } = await prepareModelImport(file);
        useEditorStore.getState().addImportedModelHierarchy(assetId, nodes);
      } finally {
        useEditorStore.getState().adjustPendingImports(-1);
      }
    }
  } catch (error) {
    console.error(`[Libre3D] Failed to import ${file.name}:`, error);
  }
};
