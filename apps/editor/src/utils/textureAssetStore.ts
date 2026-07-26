// Imported-material texture bitmaps live in their own OPFS subdirectory,
// mirroring modelAssetStore.ts exactly (same getFileHandle/createWritable/getFile
// pattern, different directory) rather than inventing a second storage mechanism.
// Pixel data is far too large to inline into materialLayers, which is persisted
// straight to localStorage — an ImageLayer stores only a textureAssetId pointing
// here. Each blob is a PNG re-encode of one unique glTF texture image, deduped by
// underlying image identity at extraction time (see utils/materialLayers.ts).

const DIR_NAME = "libre3d-textures";

// Grabs the OPFS subdirectory holding texture blobs. With { create: true } it's
// made on demand (used on write); with { create: false } a missing directory
// surfaces as a NotFoundError, which read/delete treat as "no such asset".
async function getTexturesDir(create: boolean): Promise<FileSystemDirectoryHandle> {
  const root = await navigator.storage.getDirectory();
  return root.getDirectoryHandle(DIR_NAME, { create });
}

function isNotFound(error: unknown): boolean {
  return error instanceof DOMException && error.name === "NotFoundError";
}

export async function saveTextureAsset(textureAssetId: string, data: Blob): Promise<void> {
  const dir = await getTexturesDir(true);
  const fileHandle = await dir.getFileHandle(textureAssetId, { create: true });
  const writable = await fileHandle.createWritable();
  try {
    await writable.write(data);
  } finally {
    // close() flushes the bytes to disk; skipping it on an error would leave a
    // truncated/locked file behind.
    await writable.close();
  }
}

export async function loadTextureAsset(textureAssetId: string): Promise<Blob | null> {
  try {
    const dir = await getTexturesDir(false);
    const fileHandle = await dir.getFileHandle(textureAssetId, { create: false });
    return await fileHandle.getFile();
  } catch (error) {
    if (isNotFound(error)) return null;
    throw error;
  }
}

export async function deleteTextureAsset(textureAssetId: string): Promise<void> {
  try {
    const dir = await getTexturesDir(false);
    await dir.removeEntry(textureAssetId);
  } catch (error) {
    // Already gone (or the directory never existed) — nothing to free.
    if (isNotFound(error)) return;
    throw error;
  }
}
