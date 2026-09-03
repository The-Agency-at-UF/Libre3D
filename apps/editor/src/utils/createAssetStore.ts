// Shared implementation behind modelAssetStore and textureAssetStore. Both keep
// raw binary payloads out of the persisted store -- an entity holds only an id
// pointing here -- and both prefer the Origin Private File System (OPFS) with an
// IndexedDB fallback for browsers whose OPFS is read-only in practice.
//
// The two stores had been byte-for-byte copies apart from their names, which is
// why every fix had to be written twice (the OPFS migration and the IndexedDB
// fallback each touched both files). The only genuine difference is how a stored
// file is decoded on read: models want an ArrayBuffer, textures want a Blob. That
// is the single config hook; everything else lives here once.

// OPFS is two capabilities, not one, and Safari shipped only half: it exposes the
// directory/file handle API but not createWritable() -- its write path is
// createSyncAccessHandle(), which is worker-only by spec and there is no worker in
// this codebase. Probing the prototype up front is cheaper and more honest than
// discovering it mid-import.
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

// Payloads are always binary. Constraining T here means write() and the decode
// hook typecheck without casts, since both ArrayBuffer and Blob are valid
// FileSystemWriteChunkType values and valid IndexedDB values.
export type AssetPayload = ArrayBuffer | Blob;

export interface AssetStoreConfig<T extends AssetPayload> {
  // OPFS subdirectory holding this store's files.
  dirName: string;
  // IndexedDB database and object store used when OPFS cannot be written to.
  // Each store owns its own database so the two never contend.
  dbName: string;
  storeName: string;
  // Turns a stored OPFS file into the payload type callers expect. Models read
  // through to an ArrayBuffer; textures keep the File as-is, since File is a Blob.
  decode: (file: File) => T | Promise<T>;
}

export interface AssetStore<T extends AssetPayload> {
  save(id: string, data: T): Promise<void>;
  load(id: string): Promise<T | null>;
  remove(id: string): Promise<void>;
  listIds(): Promise<string[]>;
}

export function createAssetStore<T extends AssetPayload>(
  config: AssetStoreConfig<T>,
): AssetStore<T> {
  const { dirName, dbName, storeName, decode } = config;

  // Grabs this store's OPFS subdirectory. With { create: true } it is made on
  // demand (used on write); with { create: false } a missing directory surfaces
  // as a NotFoundError, which read/delete treat as "no such asset".
  async function getDir(create: boolean): Promise<FileSystemDirectoryHandle> {
    const root = await navigator.storage.getDirectory();
    return root.getDirectoryHandle(dirName, { create });
  }

  async function openIdb(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      if (!("indexedDB" in globalThis)) {
        reject(new Error("IndexedDB is unavailable in this browser."));
        return;
      }

      const request = indexedDB.open(dbName, 1);
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(storeName)) {
          db.createObjectStore(storeName);
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () =>
        reject(request.error ?? new Error("Failed to open IndexedDB."));
    });
  }

  async function saveIdb(id: string, data: T): Promise<void> {
    const db = await openIdb();
    try {
      await new Promise<void>((resolve, reject) => {
        const transaction = db.transaction(storeName, "readwrite");
        const store = transaction.objectStore(storeName);
        const request = store.put(data, id);
        request.onsuccess = () => resolve();
        request.onerror = () =>
          reject(request.error ?? new Error("Failed to store asset in IndexedDB."));
      });
    } finally {
      db.close();
    }
  }

  async function loadIdb(id: string): Promise<T | null> {
    const db = await openIdb();
    try {
      return await new Promise<T | null>((resolve, reject) => {
        const transaction = db.transaction(storeName, "readonly");
        const store = transaction.objectStore(storeName);
        const request = store.get(id);
        request.onsuccess = () => resolve((request.result as T | undefined) ?? null);
        request.onerror = () =>
          reject(request.error ?? new Error("Failed to load asset from IndexedDB."));
      });
    } finally {
      db.close();
    }
  }

  async function removeIdb(id: string): Promise<void> {
    const db = await openIdb();
    try {
      await new Promise<void>((resolve, reject) => {
        const transaction = db.transaction(storeName, "readwrite");
        const store = transaction.objectStore(storeName);
        const request = store.delete(id);
        request.onsuccess = () => resolve();
        request.onerror = () =>
          reject(request.error ?? new Error("Failed to delete asset from IndexedDB."));
      });
    } finally {
      db.close();
    }
  }

  async function listIdsIdb(): Promise<string[]> {
    const db = await openIdb();
    try {
      return await new Promise<string[]>((resolve, reject) => {
        const transaction = db.transaction(storeName, "readonly");
        const store = transaction.objectStore(storeName);
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
          reject(request.error ?? new Error("Failed to list assets from IndexedDB."));
      });
    } finally {
      db.close();
    }
  }

  return {
    async save(id: string, data: T): Promise<void> {
      if (supportsOpfs()) {
        try {
          const dir = await getDir(true);
          const fileHandle = await dir.getFileHandle(id, { create: true });
          const writable = await fileHandle.createWritable();
          try {
            await writable.write(data);
          } finally {
            // close() flushes the bytes to disk; skipping it on an error would
            // leave a truncated/locked file behind.
            await writable.close();
          }
          return;
        } catch (error) {
          if (isNotFound(error) || isUnsupportedBrowserFeature(error)) {
            await saveIdb(id, data);
            return;
          }
          throw error;
        }
      }

      await saveIdb(id, data);
    },

    async load(id: string): Promise<T | null> {
      if (supportsOpfs()) {
        try {
          const dir = await getDir(false);
          const fileHandle = await dir.getFileHandle(id, { create: false });
          return await decode(await fileHandle.getFile());
        } catch (error) {
          if (isNotFound(error) || isUnsupportedBrowserFeature(error)) {
            return await loadIdb(id);
          }
          throw error;
        }
      }

      return await loadIdb(id);
    },

    async remove(id: string): Promise<void> {
      if (supportsOpfs()) {
        try {
          const dir = await getDir(false);
          await dir.removeEntry(id);
          return;
        } catch (error) {
          if (isNotFound(error) || isUnsupportedBrowserFeature(error)) {
            await removeIdb(id);
            return;
          }
          throw error;
        }
      }

      await removeIdb(id);
    },

    // Every stored id. Used by the app-load reconciliation sweep to diff against
    // entity-referenced ids and free orphans. A missing directory means nothing
    // has been stored yet, so it's an empty list, not an error.
    async listIds(): Promise<string[]> {
      if (supportsOpfs()) {
        try {
          // keys() is part of the OPFS spec and shipped in every OPFS-capable
          // browser, but the installed TS DOM lib doesn't declare it yet -- cast
          // to reach it.
          const dir = (await getDir(false)) as FileSystemDirectoryHandle & {
            keys(): AsyncIterableIterator<string>;
          };
          const ids = new Set<string>();
          for await (const name of dir.keys()) ids.add(name);
          for (const id of await listIdsIdb()) ids.add(id);
          return [...ids];
        } catch (error) {
          if (isNotFound(error) || isUnsupportedBrowserFeature(error)) {
            return await listIdsIdb();
          }
          throw error;
        }
      }

      return await listIdsIdb();
    },
  };
}
