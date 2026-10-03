import { useEffect, useState } from "react";

import { Button } from "./ui/Button";
import { Link } from "./ui/Link";
import { PageLayout } from "./ui/PageLayout";

import { signOut } from "../utils/authSession";
import { navigate } from "../utils/navigation";
import { createScene, listScenes, type SceneSummary } from "../utils/sceneLibrary";

interface GalleryPageProps {
  accountEmail: string | null;
}

type GalleryState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; scenes: SceneSummary[] };

/*
 * BLOCK: GalleryPage (React Component)
 * PURPOSE: The signed-in home at `/scenes`: the user's scenes as a grid of cards that open the
 *          editor, a "New scene" button, and the account's sign-out (the editor has its own in the
 *          menu). Reads scenes only through utils/sceneLibrary.ts.
 */
export function GalleryPage({ accountEmail }: GalleryPageProps) {
  const [gallery, setGallery] = useState<GalleryState>({ status: "loading" });
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    // Ignore a response that arrives after the page was left.
    let active = true;

    listScenes()
      .then((scenes) => {
        if (active) {
          setGallery({ status: "ready", scenes });
        }
      })
      .catch((error: unknown) => {
        if (active) {
          console.error("Failed to load scenes.", error);
          setGallery({ status: "error", message: "Your scenes could not be loaded. Check the console for details." });
        }
      });

    return () => {
      active = false;
    };
  }, []);

  const handleNewScene = async () => {
    setIsCreating(true);

    try {
      const { sceneId } = await createScene();
      navigate(`/edit/${encodeURIComponent(sceneId)}`);
    } catch (error) {
      console.error("Failed to create a scene.", error);
      window.alert("The scene could not be created. Check the console for details.");
      setIsCreating(false);
    }
  };

  const headerActions = (
    <>
      {accountEmail && (
        <span className="page-account" title={accountEmail}>
          {accountEmail}
        </span>
      )}
      <Button variant="ghost" onClick={() => void signOut()}>
        Sign out
      </Button>
    </>
  );

  return (
    <PageLayout headerActions={headerActions}>
      <div className="gallery-heading">
        <h1 className="gallery-title">Your scenes</h1>
        <Button variant="primary" onClick={handleNewScene} disabled={isCreating}>
          <i className="ti ti-plus" aria-hidden="true" />
          {isCreating ? "Creating…" : "New scene"}
        </Button>
      </div>

      {gallery.status === "loading" && <p className="page-message">Loading your scenes…</p>}

      {gallery.status === "error" && <p className="page-message page-message--error">{gallery.message}</p>}

      {gallery.status === "ready" && gallery.scenes.length === 0 && (
        <div className="gallery-empty">
          <i className="ti ti-cube gallery-empty-icon" aria-hidden="true" />
          <h2 className="gallery-empty-title">No scenes yet</h2>
          <p className="page-message">Select New scene to start building. Your scenes will appear here.</p>
        </div>
      )}

      {gallery.status === "ready" && gallery.scenes.length > 0 && (
        <ul className="gallery-grid">
          {gallery.scenes.map((scene) => (
            <li key={scene.sceneId}>
              <SceneCard scene={scene} />
            </li>
          ))}
        </ul>
      )}
    </PageLayout>
  );
}

const formatEditedDate = (iso: string): string =>
  new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });

function SceneCard({ scene }: { scene: SceneSummary }) {
  return (
    <Link className="gallery-card" href={`/edit/${encodeURIComponent(scene.sceneId)}`}>
      <div className="gallery-card-thumb">
        {scene.thumbnailUrl ? (
          <img className="gallery-card-image" src={scene.thumbnailUrl} alt="" />
        ) : (
          <i className="ti ti-cube" aria-hidden="true" />
        )}
      </div>
      <div className="gallery-card-body">
        <span className="gallery-card-name">{scene.name}</span>
        <span className="gallery-card-meta">Edited {formatEditedDate(scene.updatedAt)}</span>
      </div>
    </Link>
  );
}
