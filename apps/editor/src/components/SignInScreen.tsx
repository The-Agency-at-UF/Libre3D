import { useState } from "react";

import { isAuthConfigured, startSignIn } from "../utils/authSession";

interface SignInScreenProps {
  /** Shown above the button, e.g. why a previous sign-in attempt failed. */
  message?: string;
}

/*
 * BLOCK: SignInScreen (React Component)
 * PURPOSE: Shown instead of the editor while signed out. There is no form here on purpose: the
 *          button hands off to Cognito's hosted login, which owns passwords, MFA setup, and resets.
 */
export function SignInScreen({ message }: SignInScreenProps) {
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isConfigured = isAuthConfigured();

  const handleSignIn = async () => {
    setIsRedirecting(true);
    setError(null);

    try {
      await startSignIn();
    } catch (signInError) {
      console.error("Failed to start sign-in.", signInError);
      setError("Sign-in could not be started. Check the console for details.");
      setIsRedirecting(false);
    }
  };

  return (
    <main className="auth-screen">
      <div className="auth-card">
        <h1 className="auth-title">Libre3D</h1>
        <p className="auth-text">Sign in to open the editor. Access is by invitation only.</p>

        {message && <p className="auth-text auth-text--error">{message}</p>}
        {error && <p className="auth-text auth-text--error">{error}</p>}

        {isConfigured ? (
          <button className="auth-button" type="button" onClick={handleSignIn} disabled={isRedirecting}>
            {isRedirecting ? "Opening sign-in…" : "Sign in"}
          </button>
        ) : (
          <p className="auth-text auth-text--error">
            Sign-in isn't configured for this deployment (VITE_COGNITO_DOMAIN / VITE_COGNITO_CLIENT_ID).
          </p>
        )}
      </div>
    </main>
  );
}
