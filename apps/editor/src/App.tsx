import { PublicViewer } from "./components/PublicViewer";
import { SignInScreen } from "./components/SignInScreen";
import { AuthCallback } from "./components/AuthCallback";
import { EditorApp } from "./components/EditorApp";

import { useAuthSession } from "./hooks/useAuthSession";
import { usePathname } from "./hooks/usePathname";

import { AUTH_CALLBACK_PATH } from "./utils/authSession";


export function App() {
  const pathname = usePathname();
  const match = pathname.match(/^\/v\/([^/]+)$/);
  const sceneId = match ? match[1] : null;

  // Published scenes stay public; everything else requires sign-in.
  if (sceneId) {
    return <PublicViewer sceneId={sceneId} />;
  }

  if (pathname === AUTH_CALLBACK_PATH) {
    return <AuthCallback />;
  }

  return <SignedInEditor />;
}

// The editor (and its WebGL context and saved scene) only mounts once someone is signed in.
function SignedInEditor() {
  const auth = useAuthSession();

  if (auth.status !== "signedIn") {
    return <SignInScreen />;
  }

  return <EditorApp accountEmail={auth.email} />;
}
