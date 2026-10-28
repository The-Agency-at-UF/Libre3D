import { useEffect, useState } from "react";

import { Button } from "./ui/Button";
import { PageLayout } from "./ui/PageLayout";

import { isAuthConfigured, startSignIn } from "../utils/authSession";
import { GUEST_PATH, getPostSignInPath, navigate } from "../utils/navigation";

interface LandingPageProps {
  /** Shown above the button, e.g. why a previous sign-in attempt failed. */
  message?: string;
}

/*
 * BLOCK: LandingPage (React Component)
 * PURPOSE: The signed-out home page at `/`. There is no form here on purpose: Sign in hands off to
 *          Cognito's hosted login, which owns passwords, MFA setup, and resets. Signed-out visits to
 *          a private page arrive here as `/?next=<path>` and return to that path after sign-in.
 *          Try it without an account opens the guest editor (`/try`), which needs no sign-in.
 */
export function LandingPage({ message }: LandingPageProps) {
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isConfigured = isAuthConfigured();

  // Coming Back from the hosted login restores this page from the back/forward cache, still
  // showing "Opening sign-in…"; re-enable the button.
  useEffect(() => {
    const handlePageShow = (event: PageTransitionEvent) => {
      if (event.persisted) {
        setIsRedirecting(false);
      }
    };

    window.addEventListener("pageshow", handlePageShow);
    return () => window.removeEventListener("pageshow", handlePageShow);
  }, []);

  const handleSignIn = async () => {
    setIsRedirecting(true);
    setError(null);

    try {
      await startSignIn(getPostSignInPath());
    } catch (signInError) {
      console.error("Failed to start sign-in.", signInError);
      setError("Sign-in could not be started. Check the console for details.");
      setIsRedirecting(false);
    }
  };

  return (
    <PageLayout>
      <section className="landing-hero">
        <h1 className="landing-title">Build interactive 3D scenes in your browser</h1>
        <p className="landing-text">
          Libre3D is an open-source, code-free editor for 3D scenes you can publish and embed anywhere.
        </p>

        {message && <p className="page-message page-message--error">{message}</p>}
        {error && <p className="page-message page-message--error">{error}</p>}

        {isConfigured ? (
          <Button variant="primary" onClick={handleSignIn} disabled={isRedirecting}>
            {isRedirecting ? "Opening sign-in…" : "Sign in"}
          </Button>
        ) : (
          <p className="page-message page-message--error">
            Sign-in isn't configured for this deployment (VITE_COGNITO_DOMAIN / VITE_COGNITO_CLIENT_ID).
          </p>
        )}

        <Button onClick={() => navigate(GUEST_PATH)}>Try it without an account</Button>

        <p className="landing-note">
          Accounts are by invitation only. Without one, your scene is kept in this browser and can't be shared.
        </p>
      </section>
    </PageLayout>
  );
}
