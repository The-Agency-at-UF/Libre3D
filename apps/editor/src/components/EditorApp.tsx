import { useEffect, useRef } from "react";

import { EditorLayout } from "./EditorLayout";
import { ReadOnlyBanner } from "./ReadOnlyBanner";
import { SaveStatusIndicator } from "./SaveStatusIndicator";
import { SceneNameField } from "./SceneNameField";
import { Button } from "./ui/Button";
import { Link } from "./ui/Link";
import { PageStatus } from "./ui/PageStatus";

import { useOpenScene } from "../hooks/useOpenScene";
import { useSceneAutosave } from "../hooks/useSceneAutosave";
import { useSceneLock } from "../hooks/useSceneLock";

import { ApiAuthError } from "../utils/apiFetch";
import { signOut } from "../utils/authSession";
import { navigate } from "../utils/navigation";
import { createScene, type LockClaim, type OpenedScene } from "../utils/sceneLibrary";
import type { SaveStatus } from "../utils/sceneAutosave";
import type { DownloadProgress } from "../utils/assetTransfers";

const SIGN_OUT_SAVE_WAIT_MS = 3_000;

const describeDownload = ({ files, filesDone, loaded }: DownloadProgress): string => {
  const megabytes = loaded / (1024 * 1024);
  const amount = megabytes >= 0.1 ? ` (${megabytes < 10 ? megabytes.toFixed(1) : Math.round(megabytes)} MB)` : "";

  return `Downloading the scene's models and textures… ${filesDone} of ${files}${amount}`;
};

interface EditorAppProps {
  sceneId: string;
  accountEmail: string | null;
}

/*
 * BLOCK: EditorApp (React Component)
 * PURPOSE: The `/edit/:sceneId` page: opens that scene from the cloud, then shows the editor.
 *          Remounted per scene (keyed in App.tsx), so each scene starts with fresh managers and
 *          empty undo history.
 */
export function EditorApp({ sceneId, accountEmail }: EditorAppProps) {
  const openScene = useOpenScene(sceneId);

  switch (openScene.status) {
    case "loading":
      return <PageStatus label="Opening the scene…" />;
    case "downloading":
      return <PageStatus label={describeDownload(openScene.progress)} />;
    case "assetsMissing":
      return (
        <PageStatus
          label={`Couldn't download ${openScene.missing} of the scene's ${openScene.files} imported models and textures.`}
          isWorking={false}
        >
          <div className="page-status-actions">
            <Button variant="primary" onClick={openScene.retry}>Try again</Button>
            <Button onClick={openScene.openAnyway}>Open without them</Button>
          </div>
          <Link href="/scenes">Back to your scenes</Link>
        </PageStatus>
      );
    case "ready":
      return (
        <EditorWorkspace
          scene={openScene.scene}
          lock={openScene.lock}
          hasRecoveredEdits={openScene.hasRecoveredEdits}
          accountEmail={accountEmail}
        />
      );
    case "notFound":
      return (
        <PageStatus label="This scene doesn't exist, or it was deleted." isWorking={false}>
          <Link href="/scenes">Back to your scenes</Link>
        </PageStatus>
      );
    case "newer":
      return (
        <PageStatus label="This scene was saved by a newer version of Libre3D. Reload the page to open it." isWorking={false}>
          <Button variant="primary" onClick={() => window.location.reload()}>Reload</Button>
        </PageStatus>
      );
    default:
      return (
        <PageStatus label={openScene.message} isWorking={false}>
          <Link href="/scenes">Back to your scenes</Link>
        </PageStatus>
      );
  }
}

interface EditorWorkspaceProps {
  scene: OpenedScene;
  lock: LockClaim;
  hasRecoveredEdits: boolean;
  accountEmail: string | null;
}

function EditorWorkspace({ scene, lock, hasRecoveredEdits, accountEmail }: EditorWorkspaceProps) {
  // Before the autosave: the lock decides whether there's an edit session to autosave at all.
  const sceneLock = useSceneLock({ scene, lock, hasRecoveredEdits });
  const isViewOnly = sceneLock.editing.mode === "viewing";
  const autosave = useSceneAutosave(scene.sceneId, sceneLock.editing.mode === "editing" ? sceneLock.editing.session : null);
  const { reportLost } = sceneLock;

  // A save refused because another tab or device took the scene over.
  useEffect(() => {
    if (autosave.status.kind === "openElsewhere") {
      reportLost();
    }
  }, [autosave.status, reportLost]);

  const saveStatus: SaveStatus = sceneLock.problem
    ? { kind: sceneLock.problem }
    : isViewOnly
      ? { kind: "openElsewhere" }
      : autosave.status;

  // Signing out leaves the app at once, so give pending edits a few seconds to save first.
  const handleSignOut = async () => {
    await Promise.race([autosave.flush(), new Promise((resolve) => setTimeout(resolve, SIGN_OUT_SAVE_WAIT_MS))]);
    await signOut();
  };

  // A new scene, not a cleared one: with autosave, clearing would overwrite this scene for good.
  const isCreatingSceneRef = useRef(false);
  const handleNewFile = async () => {
    if (isCreatingSceneRef.current) {
      return;
    }

    isCreatingSceneRef.current = true;

    try {
      const { sceneId } = await createScene();
      navigate(`/edit/${encodeURIComponent(sceneId)}`);
    } catch (error) {
      console.error("Failed to create a scene.", error);
      window.alert(error instanceof ApiAuthError ? error.message : "A new scene could not be created. Try again.");
    } finally {
      isCreatingSceneRef.current = false;
    }
  };


  return (
    <EditorLayout
      backTitle="Back to Projects"
      onBack={() => navigate("/scenes")}
      headerText={
        <>
          <SceneNameField sceneId={scene.sceneId} initialName={scene.name} />
          <SaveStatusIndicator status={saveStatus} onRetry={autosave.retry} />
        </>
      }
      canEdit={!isViewOnly}
      onNewFile={() => void handleNewFile()}
      account={{ email: accountEmail, onSignOut: () => void handleSignOut() }}
      viewOnlyBanner={
        sceneLock.editing.mode === "viewing" ? (
          <ReadOnlyBanner
            heldByYou={sceneLock.editing.heldByYou}
            isTakingOver={sceneLock.isTakingOver}
            onTakeOver={() => void sceneLock.takeOver()}
          />
        ) : null
      }
      publishing={{ sceneId: scene.sceneId, initialPublishId: scene.publishId ?? null }}
    />
  );
}
