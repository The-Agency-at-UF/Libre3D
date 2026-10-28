/**
 * Identifiers for the Vercel team and project, used to build the OIDC trust relationship.
 * Vercel's team-mode issuer is `https://oidc.vercel.com/<team slug>`, and its tokens carry
 * `aud = https://vercel.com/<team slug>` and
 * `sub = owner:<team slug>:project:<project name>:environment:<production|preview|development>`.
 */
export const VERCEL_TEAM_SLUG = "libre3-d";
export const VERCEL_PROJECT_NAME = "libre3d-editor";

export const VERCEL_OIDC_HOST = `oidc.vercel.com/${VERCEL_TEAM_SLUG}`;
export const VERCEL_OIDC_AUDIENCE = `https://vercel.com/${VERCEL_TEAM_SLUG}`;

export type VercelEnvironment = "production" | "preview";
