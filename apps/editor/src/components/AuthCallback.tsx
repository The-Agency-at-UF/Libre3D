import { useEffect, useState } from "react";

import { completeSignIn } from "../utils/authSession";
import { SignInScreen } from "./SignInScreen";

/*
 * BLOCK: AuthCallback (React Component)
 * PURPOSE: The `/auth/callback` page Cognito returns to after sign-in. Redeems the one-time code for
 *          tokens, then replaces this URL (so the code never lingers in history) with where the user
 *          was headed. On failure it falls back to the sign-in screen with the reason.
 */
export function AuthCallback() {
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    completeSignIn(new URL(window.location.href))
      .then((returnTo) => window.location.replace(returnTo))
      .catch((signInError: unknown) => {
        console.error("Failed to complete sign-in.", signInError);
        window.history.replaceState(null, "", "/");
        setError(signInError instanceof Error ? signInError.message : "Sign-in failed. Please try again.");
      });
  }, []);

  if (error) {
    return <SignInScreen message={error} />;
  }

  return (
    <main className="auth-screen">
      <div className="viewer-spinner" />
      <p className="auth-text">Signing you in…</p>
    </main>
  );
}
