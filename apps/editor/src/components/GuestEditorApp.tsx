import { useEffect, useState } from "react";
import { shallow } from "zustand/shallow";

import { EditorLayout } from "./EditorLayout";
import { Button } from "./ui/Button";
import { PageStatus } from "./ui/PageStatus";

import { selectSceneContent, useEditorStore } from "../store/useEditorStore";
import { setSceneForAssetDownloads } from "../utils/assetTransfers";
import { readGuestScene, writeGuestScene } from "../utils/guestScene";
import { HOME_PATH, navigate } from "../utils/navigation";

// How long after the last edit the scene is written to this browser.
const GUEST_SAVE_DELAY_MS = 1_000;

type GuestEditorState = { status: "loading" } | { status: "ready" } | { status: "newer" };

interface GuestEditorAppProps {
  /** A signed-in visitor gets a link to their scenes instead of Sign in. */
  isSignedIn: boolean;
}

/*
 * BLOCK: GuestEditorApp (React Component)
 * PURPOSE: The `/try` page: the editor without an account. One scene, kept in this browser
 *          (guestScene.ts) and reopened on the next visit. No gallery, no editing lock, no cloud
 *          autosave, and no Share: nothing here calls the API. Imported models and textures stay
 *          in this browser's asset storage, and Export still downloads the scene.
 */
export function GuestEditorApp({ isSignedIn }: GuestEditorAppProps) {
  const [state, setState] = useState<GuestEditorState>({ status: "loading" });
  // False once the browser refused to keep the scene (storage full or blocked).
  const [isKept, setIsKept] = useState(true);

  useEffect(() => {
    const toOpen = readGuestScene();

    if (toOpen.status === "newer") {
      setState({ status: "newer" });
      return;
    }

    const store = useEditorStore.getState();
    // Not a cloud scene: there's no lock to make it view only, and nowhere to download assets from.
    store.setReadOnly(null);
    setSceneForAssetDownloads(null);
    store.loadScene(toOpen.content);

    let timer: ReturnType<typeof setTimeout> | null = null;

    const writeNow = () => {
      if (timer !== null) {
        clearTimeout(timer);
        timer = null;
      }

      setIsKept(writeGuestScene(selectSceneContent(useEditorStore.getState())));
    };

    // Subscribed after the load, so the load itself isn't an edit.
    const unsubscribe = useEditorStore.subscribe(
      selectSceneContent,
      () => {
        timer ??= setTimeout(writeNow, GUEST_SAVE_DELAY_MS);
      },
      { equalityFn: shallow },
    );

    // Closing the tab or leaving the site within the delay still keeps the last edit.
    const handlePageHide = () => {
      if (timer !== null) {
        writeNow();
      }
    };

    window.addEventListener("pagehide", handlePageHide);
    setState({ status: "ready" });

    return () => {
      unsubscribe();
      window.removeEventListener("pagehide", handlePageHide);

      if (timer !== null) {
        writeNow();
      }
    };
  }, []);

  if (state.status === "newer") {
    return (
      <PageStatus label="This scene was saved by a newer version of Libre3D. Reload the page to open it." isWorking={false}>
        <Button variant="primary" onClick={() => window.location.reload()}>Reload</Button>
      </PageStatus>
    );
  }

  if (state.status === "loading") {
    return <PageStatus label="Opening the editor…" />;
  }

  // There's one guest scene, so a new one replaces it.
  const handleStartOver = () => {
    if (window.confirm("Start over with a new scene? The scene kept in this browser will be replaced.")) {
      useEditorStore.getState().loadScene(null);
    }
  };

  return (
    <EditorLayout
      backTitle="Back to the home page"
      onBack={() => navigate("/")}
      headerText={
        <>
          <span className="left-sidebar-header-title">Guest scene</span>
          <span className={`save-status${isKept ? "" : " save-status--warning"}`} role="status">
            {isKept ? "Saved in this browser" : "Couldn't be kept in this browser"}
            {" · "}
            <button type="button" className="save-status-action" onClick={() => navigate(isSignedIn ? HOME_PATH : "/")}>
              {isSignedIn ? "Your scenes" : "Sign in"}
            </button>
          </span>
        </>
      }
      canEdit
      onNewFile={handleStartOver}
      account={null}
      viewOnlyBanner={null}
      publishing={null}
    />
  );
}
