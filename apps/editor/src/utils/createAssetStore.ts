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

// Deliberately narrow. This once matched any TypeError whose message contained
// "is not a function" or "storage", which also swallowed genuine bugs in the OPFS
// calls below -- a typo introduced by a refactor would have silently rerouted
// every user to IndexedDB with nothing logged anywhere. supportsOpfs() is the real
// gate; this only catches the residual case of a build that exposes
// createWritable on the prototype but throws when it is actually called.
function isMissingWritable(error: unknown): boolean {
  return (
    error instanceof TypeError &&
    error.message.toLowerCase().includes("createwritable")
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

  async function saveOpfs(id: string, data: T): Promise<void> {
    const dir = await getDir(true);
    const fileHandle = await dir.getFileHandle(id, { create: true });
    const writable = await fileHandle.createWritable();
    try {
      await writable.write(data);
      // close() is what flushes the bytes to disk, so it belongs on the success
      // path only -- closing after a failed write would commit a truncated file.
      await writable.close();
    } catch (error) {
      await writable.abort().catch(() => {});
      throw error;
    }
  }

  async function removeOpfs(id: string): Promise<void> {
    const dir = await getDir(false);
    await dir.removeEntry(id);
  }

  // One connection per store, memoized for the session. Opening and closing a
  // database around every individual get/put serialized a scene's texture loads
  // behind N full open handshakes on exactly the browsers using this path.
  let dbPromise: Promise<IDBDatabase> | null = null;

  function openIdb(): Promise<IDBDatabase> {
    if (dbPromise) return dbPromise;

    dbPromise = new Promise<IDBDatabase>((resolve, reject) => {
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
      request.onsuccess = () => {
        const db = request.result;
        // A connection held open forever would block another tab from upgrading
        // this database. Drop ours and let the memo re-open on next use.
        db.onversionchange = () => {
          db.close();
          dbPromise = null;
        };
        db.onclose = () => {
          dbPromise = null;
        };
        resolve(db);
      };
      request.onerror = () =>
        reject(request.error ?? new Error("Failed to open IndexedDB."));
    });

    // Never cache a failed open, or one transient error disables the fallback
    // for the rest of the session.
    dbPromise.catch(() => {
      dbPromise = null;
    });

    return dbPromise;
  }

  // Settles on the transaction's outcome, never on an individual request's.
  // store.put() firing onsuccess only means the request was accepted -- the
  // transaction can still abort afterwards (quota exceeded, disk error), and
  // resolving early would report a write that never landed, leaving an entity
  // persisted in localStorage pointing at bytes that do not exist.
  function runTransaction<R>(
    db: IDBDatabase,
    mode: IDBTransactionMode,
    run: (store: IDBObjectStore, setResult: (value: R) => void) => void,
  ): Promise<R | undefined> {
    return new Promise<R | undefined>((resolve, reject) => {
      let result: R | undefined;
      const transaction = db.transaction(storeName, mode);
      transaction.oncomplete = () => resolve(result);
      transaction.onabort = () =>
        reject(transaction.error ?? new Error("IndexedDB transaction aborted."));
      transaction.onerror = () =>
        reject(transaction.error ?? new Error("IndexedDB transaction failed."));

      try {
        run(transaction.objectStore(storeName), (value) => {
          result = value;
        });
      } catch (error) {
        transaction.abort();
        reject(error);
      }
    });
  }

  async function saveIdb(id: string, data: T): Promise<void> {
    const db = await openIdb();
    await runTransaction<void>(db, "readwrite", (store) => {
      store.put(data, id);
    });
  }

  async function loadIdb(id: string): Promise<T | null> {
    const db = await openIdb();
    const result = await runTransaction<T | null>(db, "readonly", (store, setResult) => {
      const request = store.get(id);
      request.onsuccess = () => setResult((request.result as T | undefined) ?? null);
    });
    return result ?? null;
  }

  async function removeIdb(id: string): Promise<void> {
    const db = await openIdb();
    await runTransaction<void>(db, "readwrite", (store) => {
      store.delete(id);
    });
  }

  async function listIdsIdb(): Promise<string[]> {
    const db = await openIdb();
    const result = await runTransaction<string[]>(db, "readonly", (store, setResult) => {
      const keys: string[] = [];
      const request = store.openCursor();
      request.onsuccess = () => {
        const cursor = request.result;
        if (cursor) {
          keys.push(String(cursor.key));
          cursor.continue();
          return;
        }
        setResult(keys);
      };
    });
    return result ?? [];
  }

  return {
    async save(id: string, data: T): Promise<void> {
      if (supportsOpfs()) {
        try {
          await saveOpfs(id, data);
          return;
        } catch (error) {
          if (!isMissingWritable(error) && !isNotFound(error)) throw error;
          // getFileHandle(create: true) has already created a zero-length file.
          // Left in place it would shadow the IndexedDB copy forever, because
          // load() checks OPFS first and a 0-byte read still looks like a hit.
          // Clear it before the payload goes anywhere else.
          await removeOpfs(id).catch(() => {});
        }
      }

      await saveIdb(id, data);
    },

    async load(id: string): Promise<T | null> {
      if (supportsOpfs()) {
        try {
          const dir = await getDir(false);
          const fileHandle = await dir.getFileHandle(id, { create: false });
          const file = await fileHandle.getFile();
          // A zero-length file is never a real asset -- it is the empty entry a
          // failed write leaves behind. Treat it as a miss so the fallback below
          // can still find the real copy. Without this the empty file wins every
          // read: a 0-byte ArrayBuffer is truthy, so a caller's `!buffer` guard
          // passes it straight to a parser that cannot use it.
          if (file.size > 0) return await decode(file);
        } catch (error) {
          if (!isNotFound(error) && !isMissingWritable(error)) throw error;
        }
      }

      return await loadIdb(id);
    },

    async remove(id: string): Promise<void> {
      let failure: unknown;

      if (supportsOpfs()) {
        try {
          await removeOpfs(id);
        } catch (error) {
          if (!isNotFound(error) && !isMissingWritable(error)) failure = error;
        }
      }

      // Always clear the IndexedDB side too. listIds() unions both backends, so
      // an id can legitimately live in either or both; stopping at the first
      // success left the other copy to be rediscovered and deleted only on a
      // later reload, so freeing one asset took two full sessions.
      try {
        await removeIdb(id);
      } catch (error) {
        if (failure === undefined) failure = error;
      }

      if (failure !== undefined) throw failure;
    },

    // Every stored id, across both backends. Used by the app-load reconciliation
    // sweep to diff against entity-referenced ids and free orphans. A missing
    // directory means nothing has been stored yet, so it's an empty list.
    async listIds(): Promise<string[]> {
      const ids = new Set<string>();

      if (supportsOpfs()) {
        try {
          // keys() is part of the OPFS spec and shipped in every OPFS-capable
          // browser, but the installed TS DOM lib doesn't declare it yet -- cast
          // to reach it.
          const dir = (await getDir(false)) as FileSystemDirectoryHandle & {
            keys(): AsyncIterableIterator<string>;
          };
          for await (const name of dir.keys()) ids.add(name);
        } catch (error) {
          if (!isNotFound(error) && !isMissingWritable(error)) throw error;
        }
      }

      // An unavailable IndexedDB (blocked site data, private-mode quirks) must
      // not take down the whole sweep: assetReconciliation awaits this without a
      // catch and useEditorStore invokes it as a bare `void`, so a rejection here
      // would surface only as an unhandled rejection and silently disable orphan
      // cleanup for the session. Returning a short list is safe -- reconciliation
      // only ever deletes ids it can actually see.
      try {
        for (const id of await listIdsIdb()) ids.add(id);
      } catch (error) {
        console.warn(`[Libre3D] Could not list IndexedDB assets in "${dbName}":`, error);
      }

      return [...ids];
    },
  };
}
