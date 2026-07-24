// Raw imported-model buffers live in the Origin Private File System (OPFS)
// instead of IndexedDB. IndexedDB structured-clones every value on write; OPFS
// moves the bytes through a real file handle and skips that copy. Note this
// uses OPFS's async main-thread API (getFile/createWritable) — the fast
// synchronous createSyncAccessHandle path is worker-only by spec, and there's
// no worker in this codebase yet — so the win here is avoiding the structured-
// clone tax, not the order-of-magnitude numbers benchmarks cite for the sync
// worker API.
//
// The three exported functions keep their original signatures — callers are
// unchanged.

const DIR_NAME = "libre3d-models";

// Grabs the OPFS subdirectory holding model buffers. With { create: true } it's
// made on demand (used on write); with { create: false } a missing directory
// surfaces as a NotFoundError, which read/delete treat as "no such asset".
async function getModelsDir(create: boolean): Promise<FileSystemDirectoryHandle> {
  const root = await navigator.storage.getDirectory();
  return root.getDirectoryHandle(DIR_NAME, { create });
}

function isNotFound(error: unknown): boolean {
  return error instanceof DOMException && error.name === "NotFoundError";
}

export async function saveModelAsset(assetId: string, data: ArrayBuffer): Promise<void> {
  const dir = await getModelsDir(true);
  const fileHandle = await dir.getFileHandle(assetId, { create: true });
  const writable = await fileHandle.createWritable();
  try {
    await writable.write(data);
  } finally {
    // close() flushes the bytes to disk; skipping it on an error would leave a
    // truncated/locked file behind.
    await writable.close();
  }
}

export async function loadModelAsset(assetId: string): Promise<ArrayBuffer | null> {
  try {
    const dir = await getModelsDir(false);
    const fileHandle = await dir.getFileHandle(assetId, { create: false });
    const file = await fileHandle.getFile();
    return await file.arrayBuffer();
  } catch (error) {
    if (isNotFound(error)) return null;
    throw error;
  }
}

export async function deleteModelAsset(assetId: string): Promise<void> {
  try {
    const dir = await getModelsDir(false);
    await dir.removeEntry(assetId);
  } catch (error) {
    // Already gone (or the directory never existed) — nothing to free.
    if (isNotFound(error)) return;
    throw error;
  }
}
