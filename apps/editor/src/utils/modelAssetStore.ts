// Raw imported-model buffers live in the Origin Private File System (OPFS)
// instead of IndexedDB. IndexedDB structured-clones every value on write; OPFS
// moves the bytes through a real file handle and skips that copy. Note this
// uses OPFS's async main-thread API (getFile/createWritable) — the fast
// synchronous createSyncAccessHandle path is worker-only by spec, and there's
// no worker in this codebase yet — so the win here is avoiding the structured-
// clone tax, not the order-of-magnitude numbers benchmarks cite for the sync
// worker API.
//
// Safari's implementation is inconsistent here: some builds expose the file-
// handle API but not createWritable(), so we fall back to IndexedDB instead of
// seeing function errors during import.
//
// The three exported functions keep their original signatures — callers are
// unchanged.

const DIR_NAME = "libre3d-models";
const IDB_DB_NAME = "libre3d-model-assets";
const IDB_STORE_NAME = "model-assets";

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

// Grabs the OPFS subdirectory holding model buffers. With { create: true } it's
// made on demand (used on write); with { create: false } a missing directory
// surfaces as a NotFoundError, which read/delete treat as "no such asset".
async function getModelsDir(
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

async function saveModelAssetIdb(
  assetId: string,
  data: ArrayBuffer,
): Promise<void> {
  const db = await openIdb();
  try {
    await new Promise<void>((resolve, reject) => {
      const transaction = db.transaction(IDB_STORE_NAME, "readwrite");
      const store = transaction.objectStore(IDB_STORE_NAME);
      const request = store.put(data, assetId);
      request.onsuccess = () => resolve();
      request.onerror = () =>
        reject(
          request.error ??
            new Error("Failed to store model asset in IndexedDB."),
        );
    });
  } finally {
    db.close();
  }
}

async function loadModelAssetIdb(assetId: string): Promise<ArrayBuffer | null> {
  const db = await openIdb();
  try {
    return await new Promise<ArrayBuffer | null>((resolve, reject) => {
      const transaction = db.transaction(IDB_STORE_NAME, "readonly");
      const store = transaction.objectStore(IDB_STORE_NAME);
      const request = store.get(assetId);
      request.onsuccess = () => {
        const result = request.result as ArrayBuffer | undefined;
        resolve(result ?? null);
      };
      request.onerror = () =>
        reject(
          request.error ??
            new Error("Failed to load model asset from IndexedDB."),
        );
    });
  } finally {
    db.close();
  }
}

async function deleteModelAssetIdb(assetId: string): Promise<void> {
  const db = await openIdb();
  try {
    await new Promise<void>((resolve, reject) => {
      const transaction = db.transaction(IDB_STORE_NAME, "readwrite");
      const store = transaction.objectStore(IDB_STORE_NAME);
      const request = store.delete(assetId);
      request.onsuccess = () => resolve();
      request.onerror = () =>
        reject(
          request.error ??
            new Error("Failed to delete model asset from IndexedDB."),
        );
    });
  } finally {
    db.close();
  }
}

async function listModelAssetIdsIdb(): Promise<string[]> {
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
            new Error("Failed to list model assets from IndexedDB."),
        );
    });
  } finally {
    db.close();
  }
}

export async function saveModelAsset(
  assetId: string,
  data: ArrayBuffer,
): Promise<void> {
  if (supportsOpfs()) {
    try {
      const dir = await getModelsDir(true);
      const fileHandle = await dir.getFileHandle(assetId, { create: true });
      const writable = await fileHandle.createWritable();
      try {
        await writable.write(data);
      } finally {
        await writable.close();
      }
      return;
    } catch (error) {
      if (isNotFound(error) || isUnsupportedBrowserFeature(error)) {
        await saveModelAssetIdb(assetId, data);
        return;
      }
      throw error;
    }
  }

  await saveModelAssetIdb(assetId, data);
}

export async function loadModelAsset(
  assetId: string,
): Promise<ArrayBuffer | null> {
  if (supportsOpfs()) {
    try {
      const dir = await getModelsDir(false);
      const fileHandle = await dir.getFileHandle(assetId, { create: false });
      const file = await fileHandle.getFile();
      return await file.arrayBuffer();
    } catch (error) {
      if (isNotFound(error) || isUnsupportedBrowserFeature(error)) {
        return await loadModelAssetIdb(assetId);
      }
      throw error;
    }
  }

  return await loadModelAssetIdb(assetId);
}

export async function deleteModelAsset(assetId: string): Promise<void> {
  if (supportsOpfs()) {
    try {
      const dir = await getModelsDir(false);
      await dir.removeEntry(assetId);
      return;
    } catch (error) {
      if (isNotFound(error) || isUnsupportedBrowserFeature(error)) {
        await deleteModelAssetIdb(assetId);
        return;
      }
      throw error;
    }
  }

  await deleteModelAssetIdb(assetId);
}

// Every stored model buffer's id. Used by the app-load reconciliation sweep to
// diff against entity-referenced ids and free orphans. A missing directory means
// nothing has been stored yet, so it's an empty list, not an error.
export async function listModelAssetIds(): Promise<string[]> {
  if (supportsOpfs()) {
    try {
      const dir = (await getModelsDir(false)) as FileSystemDirectoryHandle & {
        keys(): AsyncIterableIterator<string>;
      };
      const ids = new Set<string>();
      for await (const name of dir.keys()) ids.add(name);
      for (const id of await listModelAssetIdsIdb()) ids.add(id);
      return [...ids];
    } catch (error) {
      if (isNotFound(error) || isUnsupportedBrowserFeature(error)) {
        return await listModelAssetIdsIdb();
      }
      throw error;
    }
  }

  return await listModelAssetIdsIdb();
}
