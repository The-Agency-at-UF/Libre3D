import { useEffect } from "react";

import { PublicViewer } from "./components/PublicViewer";
import { LandingPage } from "./components/LandingPage";
import { AuthCallback } from "./components/AuthCallback";
import { EditorApp } from "./components/EditorApp";

import { useAuthSession } from "./hooks/useAuthSession";
import { usePathname } from "./hooks/usePathname";

import { AUTH_CALLBACK_PATH } from "./utils/authSession";
import { getPostSignInPath, landingPathFor, navigate } from "./utils/navigation";

/*
 * Routes (every one needs a rewrite in vercel.json so a hard refresh works):
 *   /v/:sceneId      published scene, public
 *   /auth/callback   where Cognito's hosted login returns (registered in CDK; don't rename)
 *   /                landing page; signed-in visitors go on to `?next` or the gallery
 *   anything else    the editor, signed in only; signed-out visitors go to `/?next=<path>`
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

  if (pathname === "/") {
    return auth.status === "signedIn" ? <Redirect to={getPostSignInPath()} /> : <LandingPage />;
  }

  // Remember where they were headed, so a deep link survives signing in. Also where a sign-out
  // or an expired session lands.
  if (auth.status !== "signedIn") {
    return <Redirect to={landingPathFor(pathname + window.location.search)} />;
  }

  return <EditorApp accountEmail={auth.email} />;
}

// Navigating during render isn't allowed, so routes that only forward do it right after.
function Redirect({ to }: { to: string }) {
  useEffect(() => navigate(to, { replace: true }), [to]);

  return null;
}
