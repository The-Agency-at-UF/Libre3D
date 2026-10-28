/// <reference types="vite/client" />

// Public build-time config. Anything prefixed VITE_ ships to every visitor's browser, so only
// values that are safe to publish belong here, never secrets.
interface ImportMetaEnv {
  /** Hosted login base URL, e.g. https://libre3d-dev-login.auth.us-east-2.amazoncognito.com */
  readonly VITE_COGNITO_DOMAIN?: string;
  readonly VITE_COGNITO_CLIENT_ID?: string;
  readonly VITE_COGNITO_USER_POOL_ID?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
