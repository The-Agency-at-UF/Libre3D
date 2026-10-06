import { lazy, Suspense, useEffect } from "react";

import { PublicViewer } from "./components/PublicViewer";
import { LandingPage } from "./components/LandingPage";
import { GalleryPage } from "./components/GalleryPage";
import { AuthCallback } from "./components/AuthCallback";
import { PageStatus } from "./components/ui/PageStatus";

import { useAuthSession } from "./hooks/useAuthSession";
import { usePathname } from "./hooks/usePathname";

import { AUTH_CALLBACK_PATH } from "./utils/authSession";
import { GUEST_PATH, HOME_PATH, getPostSignInPath, landingPathFor, navigate } from "./utils/navigation";

// Loaded on demand: the editor brings Three.js and the whole viewport (most of the app's JS),
// which the landing page, gallery, and viewer never need.
const EditorApp = lazy(() => import("./components/EditorApp").then((module) => ({ default: module.EditorApp })));
const GuestEditorApp = lazy(() =>
  import("./components/GuestEditorApp").then((module) => ({ default: module.GuestEditorApp })),
);

/*
 * Routes (every one needs a rewrite in vercel.json so a hard refresh works):
 *   /v/:sceneId      published scene, public
 *   /auth/callback   where Cognito's hosted login returns (registered in CDK; don't rename)
 *   /                landing page; signed-in visitors go on to `?next` or the gallery
 *   /try             the editor without an account (one scene kept in this browser), public
 *   /scenes          gallery, signed in only
 *   /edit/:sceneId   editor, signed in only
 *   anything else    redirects to /
 * Signed-out visits to a signed-in-only path go to `/?next=<path>`.
 */
export function App() {
  const pathname = usePathname();
  const auth = useAuthSession();
  const match = pathname.match(/^\/v\/([^/]+)$/);
  const sceneId = match ? match[1] : null;

  // Published scenes stay public; everything else requires sign-in.
  if (sceneId) {
    return <PublicViewer sceneId={sceneId} />;
  }

  if (pathname === AUTH_CALLBACK_PATH) {
    return <AuthCallback />;
  }

  if (pathname === GUEST_PATH) {
    return (
      <Suspense fallback={<PageStatus label="Opening the editor…" />}>
        <GuestEditorApp isSignedIn={auth.status === "signedIn"} />
      </Suspense>
    );
  }

  if (pathname === "/") {
    return auth.status === "signedIn" ? <Redirect to={getPostSignInPath()} /> : <LandingPage />;
  }

  const editMatch = pathname.match(/^\/edit\/([^/]+)$/);

  if (pathname !== HOME_PATH && !editMatch) {
    return <Redirect to="/" />;
  }

  // Remember where they were headed, so a deep link survives signing in. Also where a sign-out
  // or an expired session lands.
  if (auth.status !== "signedIn") {
    return <Redirect to={landingPathFor(pathname + window.location.search)} />;
  }

  if (editMatch) {
    // Keyed so moving between scenes (e.g. with Back) remounts the editor: fresh managers, a fresh
    // load, and no undo history carried over from the previous scene.
    const editSceneId = decodePathSegment(editMatch[1]);

    return (
      <Suspense fallback={<PageStatus label="Opening the editor…" />}>
        <EditorApp key={editSceneId} sceneId={editSceneId} accountEmail={auth.email} />
      </Suspense>
    );
  }

  return <GalleryPage accountEmail={auth.email} />;
}

// A malformed escape (`/edit/%E0`) would throw; the raw text then just finds no scene.
const decodePathSegment = (segment: string): string => {
  try {
    return decodeURIComponent(segment);
  } catch {
    return segment;
  }
};

// Navigating during render isn't allowed, so routes that only forward do it right after.
function Redirect({ to }: { to: string }) {
  useEffect(() => navigate(to, { replace: true }), [to]);

  return null;
}
