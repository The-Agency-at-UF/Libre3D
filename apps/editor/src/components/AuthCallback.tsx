import { useEffect, useState } from "react";

import { completeSignIn } from "../utils/authSession";
import { navigate } from "../utils/navigation";
import { LandingPage } from "./LandingPage";
import { PageStatus } from "./ui/PageStatus";

/*
 * BLOCK: AuthCallback (React Component)
 * PURPOSE: The `/auth/callback` page Cognito returns to after sign-in. Redeems the one-time code for
 *          tokens, then replaces this URL (so the code never lingers in history) with where the user
 *          was headed. On failure it falls back to the landing page with the reason.
 */
export function AuthCallback() {
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    completeSignIn(new URL(window.location.href))
      .then((returnTo) => navigate(returnTo, { replace: true }))
      .catch((signInError: unknown) => {
        console.error("Failed to complete sign-in.", signInError);
        // Not navigate(): that would route to a fresh landing page and drop the reason shown below.
        window.history.replaceState(null, "", "/");
        setError(signInError instanceof Error ? signInError.message : "Sign-in failed. Please try again.");
      });
  }, []);

  if (error) {
    return <LandingPage message={error} />;
  }

  return <PageStatus label="Signing you in…" />;
}
