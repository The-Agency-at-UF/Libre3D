import { lazy, Suspense, useEffect, useState } from "react";

import { parseSceneDocument, type StoredSceneContent } from "../utils/sceneDocument";

// Three.js and the viewer load only once there's a scene to show.
const PublishedSceneView = lazy(() => import("./PublishedSceneView"));

interface PublicViewerProps {
  sceneId: string;
}

type ViewerState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; content: StoredSceneContent; assets: Record<string, string> };

// The server answers failures with `{ error }` (awsPublishHandler.ts), e.g. a scene published as a
// GLB before scenes were published whole, whose owner needs to publish it again.
const readServerError = async (response: Response): Promise<string | null> => {
  try {
    const body = (await response.json()) as { error?: unknown };
    return typeof body.error === "string" && body.error ? body.error : null;
  } catch {
    return null;
  }
};

const Spinner = () => (
  <div className="viewer-container viewer-status">
    <div className="viewer-spinner"></div>
    <p>Loading scene...</p>
  </div>
);

/*
 * BLOCK: PublicViewer (React Component)
 * PURPOSE: The public share page, `/v/:sceneId` (the ID is a publish ID): fetches the published
 *          scene (its document and download links for its imported assets, `GET /api/scene/:id`),
 *          reads the document as the editor does (older ones upgrade, a newer one is refused), and
 *          plays it with PublishedSceneView. Loading and error states while it can't.
 */
export function PublicViewer({ sceneId }: PublicViewerProps) {
  const [state, setState] = useState<ViewerState>({ status: "loading" });

  useEffect(() => {
    // Ignore an answer for a scene that was left before it arrived.
    let active = true;
    setState({ status: "loading" });

    void (async () => {
      let next: ViewerState;

      try {
        const response = await fetch(`/api/scene/${encodeURIComponent(sceneId)}`);

        if (!response.ok) {
          next = {
            status: "error",
            message:
              response.status === 404
                ? "This scene doesn't exist, or isn't published any more."
                : ((await readServerError(response)) ?? "The scene couldn't be loaded."),
          };
        } else {
          const data = (await response.json()) as { document?: unknown; assets?: Record<string, string> };
          const parsed = parseSceneDocument(data.document);
          next = parsed.ok
            ? { status: "ready", content: parsed.content, assets: data.assets ?? {} }
            : {
                status: "error",
                message:
                  parsed.reason === "newer"
                    ? "This scene was published with a newer version of Libre3D. Reload the page to see it."
                    : "This scene couldn't be read.",
              };
        }
      } catch (error) {
        console.error(error);
        next = { status: "error", message: "The scene couldn't be loaded. Check your connection and try again." };
      }

      if (active) setState(next);
    })();

    return () => {
      active = false;
    };
  }, [sceneId]);

  if (state.status === "loading") {
    return <Spinner />;
  }

  if (state.status === "error") {
    return (
      <div className="viewer-container viewer-status viewer-error">
        <p>{state.message}</p>
      </div>
    );
  }

  return (
    <div className="viewer-container">
      <Suspense fallback={<Spinner />}>
        <PublishedSceneView content={state.content} assets={state.assets} />
      </Suspense>
    </div>
  );
}
