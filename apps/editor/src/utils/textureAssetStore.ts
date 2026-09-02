// Imported-material texture bitmaps prefer their own OPFS subdirectory,
// mirroring the model buffer logic. IndexedDB structured-clones every value on
// write; OPFS skips that copy. Note this uses OPFS's async main-thread API
// (getFile/createWritable) — the fast synchronous createSyncAccessHandle path
// is worker-only by spec, and there's no worker in this codebase yet — so the
// win here is avoiding the structured-clone tax, not the order-of-magnitude
// numbers benchmarks cite for the sync worker API.
//
// Safari's implementation is inconsistent here: some builds expose the file-
// handle API but not createWritable(), so we fall back to IndexedDB rather than
// crashing during import or material loading.

const DIR_NAME = "libre3d-textures";
const IDB_DB_NAME = "libre3d-texture-assets";
const IDB_STORE_NAME = "texture-assets";

function supportsOpfs(): boolean {
  return (
    typeof navigator !== "undefined" &&
    typeof navigator.storage?.getDirectory === "function" &&
    typeof FileSystemFileHandle !== "undefined" &&
    typeof FileSystemFileHandle.prototype?.createWritable === "function"
  );
}

function isNotFound(error: unknown): boolean {
  return error instanceof DOMException && error.name === "NotFoundError";
}

function isUnsupportedBrowserFeature(error: unknown): boolean {
  if (!(error instanceof TypeError)) return false;
  const message = error.message.toLowerCase();
  return (
    message.includes("createwritable") ||
    message.includes("getdirectory") ||
    message.includes("storage") ||
    message.includes("is not a function")
  );
}

async function getTexturesDir(
  create: boolean,
): Promise<FileSystemDirectoryHandle> {
  const root = await navigator.storage.getDirectory();
  return root.getDirectoryHandle(DIR_NAME, { create });
}

async function openIdb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (!("indexedDB" in globalThis)) {
      reject(new Error("IndexedDB is unavailable in this browser."));
      return;
    }

    const request = indexedDB.open(IDB_DB_NAME, 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(IDB_STORE_NAME)) {
        db.createObjectStore(IDB_STORE_NAME);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () =>
      reject(request.error ?? new Error("Failed to open IndexedDB."));
  });
}

async function saveTextureAssetIdb(
  textureAssetId: string,
  data: Blob,
): Promise<void> {
  const db = await openIdb();
  try {
    await new Promise<void>((resolve, reject) => {
      const transaction = db.transaction(IDB_STORE_NAME, "readwrite");
      const store = transaction.objectStore(IDB_STORE_NAME);
      const request = store.put(data, textureAssetId);
      request.onsuccess = () => resolve();
      request.onerror = () =>
        reject(
          request.error ??
            new Error("Failed to store texture asset in IndexedDB."),
        );
    });
  } finally {
    db.close();
  }
}

async function loadTextureAssetIdb(
  textureAssetId: string,
): Promise<Blob | null> {
  const db = await openIdb();
  try {
    return await new Promise<Blob | null>((resolve, reject) => {
      const transaction = db.transaction(IDB_STORE_NAME, "readonly");
      const store = transaction.objectStore(IDB_STORE_NAME);
      const request = store.get(textureAssetId);
      request.onsuccess = () => {
        const result = request.result as Blob | undefined;
        resolve(result ?? null);
      };
      request.onerror = () =>
        reject(
          request.error ??
            new Error("Failed to load texture asset from IndexedDB."),
        );
    });
  } finally {
    db.close();
  }
}

async function deleteTextureAssetIdb(textureAssetId: string): Promise<void> {
  const db = await openIdb();
  try {
    await new Promise<void>((resolve, reject) => {
      const transaction = db.transaction(IDB_STORE_NAME, "readwrite");
      const store = transaction.objectStore(IDB_STORE_NAME);
      const request = store.delete(textureAssetId);
      request.onsuccess = () => resolve();
      request.onerror = () =>
        reject(
          request.error ??
            new Error("Failed to delete texture asset from IndexedDB."),
        );
    });
  } finally {
    db.close();
  }
}

async function listTextureAssetIdsIdb(): Promise<string[]> {
  const db = await openIdb();
  try {
    return await new Promise<string[]>((resolve, reject) => {
      const transaction = db.transaction(IDB_STORE_NAME, "readonly");
      const store = transaction.objectStore(IDB_STORE_NAME);
      const keys: string[] = [];
      const request = store.openCursor();
      request.onsuccess = () => {
        const cursor = request.result;
        if (cursor) {
          keys.push(String(cursor.key));
          cursor.continue();
          return;
        }
        resolve(keys);
      };
      request.onerror = () =>
        reject(
          request.error ??
            new Error("Failed to list texture assets from IndexedDB."),
        );
    });
  } finally {
    db.close();
  }
}

export async function saveTextureAsset(
  textureAssetId: string,
  data: Blob,
): Promise<void> {
  if (supportsOpfs()) {
    try {
      const dir = await getTexturesDir(true);
      const fileHandle = await dir.getFileHandle(textureAssetId, {
        create: true,
      });
      const writable = await fileHandle.createWritable();
      try {
        await writable.write(data);
      } finally {
        await writable.close();
      }
      return;
    } catch (error) {
      if (isNotFound(error) || isUnsupportedBrowserFeature(error)) {
        await saveTextureAssetIdb(textureAssetId, data);
        return;
      }
      throw error;
    }
  }

  await saveTextureAssetIdb(textureAssetId, data);
}

export async function loadTextureAsset(
  textureAssetId: string,
): Promise<Blob | null> {
  if (supportsOpfs()) {
    try {
      const dir = await getTexturesDir(false);
      const fileHandle = await dir.getFileHandle(textureAssetId, {
        create: false,
      });
      return await fileHandle.getFile();
    } catch (error) {
      if (isNotFound(error) || isUnsupportedBrowserFeature(error)) {
        return await loadTextureAssetIdb(textureAssetId);
      }
      throw error;
    }
  }

  return await loadTextureAssetIdb(textureAssetId);
}

export async function deleteTextureAsset(
  textureAssetId: string,
): Promise<void> {
  if (supportsOpfs()) {
    try {
      const dir = await getTexturesDir(false);
      await dir.removeEntry(textureAssetId);
      return;
    } catch (error) {
      if (isNotFound(error) || isUnsupportedBrowserFeature(error)) {
        await deleteTextureAssetIdb(textureAssetId);
        return;
      }
      throw error;
    }
  }

  await deleteTextureAssetIdb(textureAssetId);
}

export async function listTextureAssetIds(): Promise<string[]> {
  if (supportsOpfs()) {
    try {
      const dir = (await getTexturesDir(false)) as FileSystemDirectoryHandle & {
        keys(): AsyncIterableIterator<string>;
      };
      const ids = new Set<string>();
      for await (const name of dir.keys()) ids.add(name);
      for (const id of await listTextureAssetIdsIdb()) ids.add(id);
      return [...ids];
    } catch (error) {
      if (isNotFound(error) || isUnsupportedBrowserFeature(error)) {
        return await listTextureAssetIdsIdb();
      }
      throw error;
    }
  }

  return await listTextureAssetIdsIdb();
}
