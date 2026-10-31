/**
 * PURPOSE: Saving the open scene as a `.libre3d` file and opening one (sceneFile.ts has the format).
 *
 * Downloading packs the scene's document with the imported models and pictures it uses, read from
 * this browser's asset storage. Opening one checks it, keeps its assets in this browser's storage
 * (content-addressed, so nothing already there changes), and hands its content to the editor: the
 * guest editor puts it in place of its one scene, the cloud editor makes it a new scene
 * (`openSceneFileAsNewScene`). A new cloud scene is never filled in by a save from here: the file's
 * document goes in as that scene's unsaved edits (sceneCache.ts), which the editor restores and saves
 * when it opens the scene (useOpenScene, useSceneAutosave), uploading the assets first, as it does
 * for edits a closed tab left behind.
 */

import { showAlert, showConfirm } from "../components/ui/Dialog";
import { selectSceneContent, useEditorStore } from "../store/useEditorStore";
import { getAuthSnapshot } from "./authSession";
import { createDownload } from "./exportScene";
import { loadModelAsset, saveModelAsset } from "./modelAssetStore";
import { navigate } from "./navigation";
import { readSceneCache, writeSceneCache } from "./sceneCache";
import { toSceneDocument, type StoredSceneContent } from "./sceneDocument";
import { readSceneFile, sceneFileAssetRefs, sceneFileName, SCENE_FILE_EXTENSION, writeSceneFile, type SceneFileAsset } from "./sceneFile";
import { createScene, deleteScene } from "./sceneLibrary";
import { loadTextureAsset, saveTextureAsset } from "./textureAssetStore";

/**
 * Downloads the open scene as `<name>.libre3d`, with the imported models and pictures it uses. When
 * some aren't in this browser, asks first: the file would open with those objects empty.
 */
export const downloadSceneFile = async (name: string): Promise<void> => {
  const document = toSceneDocument(selectSceneContent(useEditorStore.getState()));
  const assets: SceneFileAsset[] = [];
  let missing = 0;

  for (const ref of sceneFileAssetRefs(document.scene.entities)) {
    const data = ref.kind === "model" ? await loadModelAsset(ref.id) : await (await loadTextureAsset(ref.id))?.arrayBuffer();
    if (data) assets.push({ hash: ref.id, kind: ref.kind, bytes: new Uint8Array(data) });
    else missing += 1;
  }

  if (
    missing > 0 &&
    !(await showConfirm(
      `${missing === 1 ? "One imported model or picture isn't" : `${missing} imported models or pictures aren't`} in this browser, so the file won't include ${missing === 1 ? "it" : "them"}. Download it anyway?`,
      { title: "Download scene", confirmLabel: "Download" },
    ))
  ) {
    return;
  }

  try {
    createDownload(writeSceneFile({ name, document, assets }), sceneFileName(name), "application/octet-stream");
  } catch (error) {
    console.error("[Libre3D] Failed to write the scene file:", error);
    void showAlert(error instanceof RangeError ? error.message : "The scene file could not be made. Check the console for details.");
  }
};

/**
 * Reads a `.libre3d` and keeps its assets in this browser's storage, so the scene opens with them.
 * Null, after telling the user why, when it can't be opened.
 */
export const readSceneFileForOpening = async (
  file: File,
): Promise<{ name: string; document: unknown; content: StoredSceneContent } | null> => {
  const read = await readSceneFile(await file.arrayBuffer());

  if (!read.ok) {
    void showAlert(
      read.reason === "newer"
        ? "This scene was saved by a newer version of Libre3D. Reload the page to get it, then try again."
        : `${file.name} isn't a Libre3D scene file, or it's damaged.`,
      "Can't open this scene",
    );
    return null;
  }

  await Promise.all(
    read.assets.map((asset) =>
      asset.kind === "model" ? saveModelAsset(asset.hash, asset.bytes.buffer) : saveTextureAsset(asset.hash, new Blob([asset.bytes])),
    ),
  );

  return { name: read.name || file.name.slice(0, -SCENE_FILE_EXTENSION.length), document: read.document, content: read.content };
};

/** Opens a `.libre3d` as a new scene in the signed-in user's gallery, and switches to it. */
export const openSceneFileAsNewScene = async (file: File): Promise<void> => {
  const auth = getAuthSnapshot();
  const ownerId = auth.status === "signedIn" ? auth.userId : null;

  if (!ownerId) {
    void showAlert("Sign in again to open a scene file.");
    return;
  }

  const opened = await readSceneFileForOpening(file);
  if (!opened) return;

  let sceneId: string;

  try {
    ({ sceneId } = await createScene({ name: opened.name }));
  } catch (error) {
    console.error("[Libre3D] Failed to create a scene for the file:", error);
    void showAlert("A new scene could not be created for this file. Try again.");
    return;
  }

  // A new scene is at revision 0, so the editor takes this as its unsaved edits and saves them.
  writeSceneCache({ ownerId, sceneId, baseRevision: 0, document: opened.document });

  if (!readSceneCache(ownerId, sceneId)) {
    // Storage full or blocked: the scene would open empty. Don't leave it in the gallery.
    await deleteScene(sceneId).catch(() => undefined);
    void showAlert("This browser's storage is full or blocked, so the scene couldn't be opened.");
    return;
  }

  navigate(`/edit/${encodeURIComponent(sceneId)}`);
};
