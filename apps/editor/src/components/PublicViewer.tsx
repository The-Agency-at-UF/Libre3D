import { useEffect, useState } from "react";

/*
 * BLOCK: React JSX Custom Element Declaration
 * PURPOSE: Extends the built-in React JSX namespace to support `<model-viewer>` custom web elements.
 *          By default, TypeScript/React does not recognize custom elements, causing compilation errors.
 * INPUT: None (Module declaration level).
 * OUTPUT: Informs the compiler that `<model-viewer>` is a valid JSX element with specific optional properties.
 */
declare module "react" {
  namespace JSX {
    interface IntrinsicElements {
      "model-viewer": React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        src?: string | null;
        "camera-controls"?: boolean;
        "auto-rotate"?: boolean;
        // Spherical camera placement — set from the editor's active camera profile
        // (see utils/previewCamera.ts) so preview matches the viewport exactly.
        "camera-orbit"?: string;
        "camera-target"?: string;
        "field-of-view"?: string;
        "min-camera-orbit"?: string;
        "max-camera-orbit"?: string;
        "min-field-of-view"?: string;
        "max-field-of-view"?: string;
        "tone-mapping"?: string;
        ar?: boolean;
        ref?: React.Ref<any>;
        style?: React.CSSProperties;
      };
    }
  }
}

interface PublicViewerProps {
  sceneId: string;
}

/*
 * BLOCK: PublicViewer (React Component)
 * PURPOSE: A read-only view that fetches a published scene's GLB model URL from the server 
 *          and displays it interactively using the custom `<model-viewer>` component.
 * INPUT: Props object containing a single `sceneId` string (the database ID of the published scene).
 * OUTPUT: Renders a loading spinner, an error message, or the interactive 3D model-viewer canvas.
 */
export function PublicViewer({ sceneId }: PublicViewerProps) {
  // Local state to store the direct cloud URL of the GLB asset
  const [cloudAssetUrl, setCloudAssetUrl] = useState<string | null>(null);
  // Local state to manage showing a loading state while fetching from the backend
  const [isLoading, setIsLoading] = useState(true);
  // Local state to capture and display any API or network errors
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Flag to prevent state updates if the component unmounts during the fetch
    let active = true;

    // Fetch the scene document metadata from the backend API
    fetch(`/api/scene/${sceneId}`)
      .then((res) => {
        if (!res.ok) {
          throw new Error(`Failed to load scene (status ${res.status})`);
        }
        return res.json();
      })
      .then((data) => {
        if (active) {
          // If scene data contains a valid cloud asset URL, update the state
          if (data && data.cloudAssetUrl) {
            setCloudAssetUrl(data.cloudAssetUrl);
          } else {
            throw new Error("No asset URL found in scene data");
          }
          setIsLoading(false);
        }
      })
      .catch((err) => {
        if (active) {
          console.error(err);
          setError(err instanceof Error ? err.message : "An error occurred");
          setIsLoading(false);
        }
      });

    // Cleanup function: runs on unmount to invalidate pending asynchronous state updates
    return () => {
      active = false;
    };
  }, [sceneId]);

  if (isLoading) {
    return (
      <div className="viewer-container viewer-status">
        <div className="viewer-spinner"></div>
        <p>Loading scene...</p>
      </div>
    );
  }

  if (error || !cloudAssetUrl) {
    return (
      <div className="viewer-container viewer-status viewer-error">
        <p>Error: {error || "Failed to load scene"}</p>
      </div>
    );
  }

  return (
    <div className="viewer-container">
      <model-viewer
        src={cloudAssetUrl}
        camera-controls
        auto-rotate
        // Pinned rather than left on "auto" so the published scene keeps the exact
        // tone curve the editor renders with (see useViewportRenderer).
        tone-mapping="neutral"
        style={{ width: "100%", height: "100%" }}
      />
    </div>
  );
}
