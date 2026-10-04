import { useCallback, useEffect, useRef, useState } from "react";
import { shallow } from "zustand/shallow";

import { selectSceneContent, useEditorStore } from "../store/useEditorStore";
import { AssetUploader } from "../utils/assetTransfers";
import { getAuthSnapshot } from "../utils/authSession";
import { collectAssetRefs } from "../utils/sceneAssets";
import { SceneAutosaver, type SaveStatus } from "../utils/sceneAutosave";
import { clearSceneCache, writeSceneCache } from "../utils/sceneCache";
import { toSceneDocument, type SceneDocument } from "../utils/sceneDocument";

// How often unsaved edits are copied to this browser's cache while editing continues.
const CACHE_WRITE_INTERVAL_MS = 500;

/**
 * One stretch of editing a scene while this tab holds its lock: from opening it (or getting the lock
 * back) to losing the lock or leaving. A new object starts a new autosaver.
 */
export interface EditSession {
  /** The cloud revision the scene was loaded at. */
  revision: number;
  /** The scene was loaded from this browser's copy of unsaved edits: save them right away. */
  hasRecoveredEdits: boolean;
  /** The imported assets the cloud copy uses (`OpenedScene.assetHashes`): never uploaded again. */
  assetHashes: string[];
}

/**
 * Autosaves the open scene (see `SceneAutosaver` for the timing) while there's an edit session,
 * i.e. while this tab holds the scene's editing lock: every change to the scene's content in the
 * store counts as an edit. With no session (read-only) nothing is saved or cached. Until an edit is
 * saved, a copy stays in this browser (sceneCache.ts) so a closed tab, lost connection, or lost lock
 * can't lose it. Leaving the editor saves right away; closing the tab with unsaved edits asks first.
 * Each save first uploads the imported assets its document uses that the cloud doesn't have yet.
 *
 * Returns the save status for the indicator, `retry` (save now), and `flush` (save everything and
 * report whether that worked, e.g. before signing out).
 */
export function useSceneAutosave(sceneId: string, session: EditSession | null) {
  const [status, setStatus] = useState<SaveStatus>({ kind: "saved", savedAt: null });
  const autosaverRef = useRef<SceneAutosaver | null>(null);
  // The latest saved revision, kept across effect runs: a save fired by one run's cleanup (e.g.
  // StrictMode's remount) must not leave the next autosaver building on the old revision (a 409).
  // A new session (the scene reloaded after getting the lock back) starts from its own revision.
  const revisionRef = useRef(session?.revision ?? 0);
  const sessionRef = useRef(session);

  useEffect(() => {
    if (!session) {
      return;
    }

    if (sessionRef.current !== session) {
      sessionRef.current = session;
      revisionRef.current = session.revision;
      setStatus({ kind: "saved", savedAt: null });
    }

    const auth = getAuthSnapshot();
    const ownerId = auth.status === "signedIn" ? auth.userId : null;
    const readDocument = () => toSceneDocument(selectSceneContent(useEditorStore.getState()));
    const uploader = new AssetUploader({ sceneId, confirmed: session.assetHashes });
    let cacheTimer: ReturnType<typeof setTimeout> | null = null;

    const writeCacheNow = () => {
      if (cacheTimer !== null) {
        clearTimeout(cacheTimer);
        cacheTimer = null;
      }

      if (ownerId) {
        writeSceneCache({
          ownerId,
          sceneId,
          baseRevision: revisionRef.current,
          document: readDocument(),
        });
      }
    };

    const autosaver = new SceneAutosaver({
      sceneId,
      readRevision: () => revisionRef.current,
      readDocument,
      prepareSave: (document, report) => uploader.upload(collectAssetRefs((document as SceneDocument).scene.entities), report),
      onMissingAssets: (hashes) => uploader.reportMissing(hashes),
      onStatus: setStatus,
      onSaved: (revision, hasPendingEdits) => {
        revisionRef.current = revision;

        if (hasPendingEdits) {
          // Re-key the copy to the new revision, or reopening would think the cloud moved on.
          writeCacheNow();
        } else {
          if (cacheTimer !== null) {
            clearTimeout(cacheTimer);
            cacheTimer = null;
          }

          clearSceneCache(sceneId);
        }
      },
    });
    autosaverRef.current = autosaver;

    // Subscribed after the scene was loaded, so the load itself isn't an edit.
    const unsubscribe = useEditorStore.subscribe(
      selectSceneContent,
      () => {
        autosaver.markChanged();
        cacheTimer ??= setTimeout(writeCacheNow, CACHE_WRITE_INTERVAL_MS);
      },
      { equalityFn: shallow },
    );

    if (session.hasRecoveredEdits) {
      autosaver.markChanged();
    }

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (autosaver.hasUnsavedWork) {
        writeCacheNow();
        void autosaver.saveNow();
        event.preventDefault();
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      unsubscribe();
      window.removeEventListener("beforeunload", handleBeforeUnload);

      if (autosaver.hasUnsavedWork) {
        writeCacheNow();
      }

      // Leaving for the gallery (or losing the lock): save now. The gallery's list and the lock's
      // release wait for this save to land, and onSaved clears the local copy once it has.
      void autosaver.saveNow();
      autosaver.dispose();
      autosaverRef.current = null;
    };
  }, [sceneId, session]);

  const retry = useCallback(() => {
    void autosaverRef.current?.saveNow();
  }, []);

  const flush = useCallback(async (): Promise<boolean> => (await autosaverRef.current?.flush()) ?? true, []);

  return { status, retry, flush };
}
