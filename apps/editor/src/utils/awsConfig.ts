/**
 * PURPOSE: Server-side (Node) AWS setup shared by every API handler: required env vars, where the
 * credentials come from, and the S3/DynamoDB clients.
 *
 * Used by `awsPublishHandler.ts` and `awsSceneHandler.ts`, which the Vercel functions in `api/`
 * and the Vite dev middleware both call. Server modules import each other with `.js` extensions:
 * on Vercel they run under Node's ES module loader, which doesn't guess extensions.
 *
 * The clients are made once and reused by every request (on Vercel, by every invocation of a warm
 * function), so a request doesn't open new TLS connections or, on Vercel, exchange the OIDC token
 * for a new role session each time.
 */

import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { S3Client } from "@aws-sdk/client-s3";
import { awsCredentialsProvider } from "@vercel/oidc-aws-credentials-provider";

export type ServerEnv = Record<string, string | undefined>;

type AwsCredentials = NonNullable<ConstructorParameters<typeof S3Client>[0]>["credentials"];
type RoleSessionProvider = ReturnType<typeof awsCredentialsProvider>;
type RoleSession = Awaited<ReturnType<RoleSessionProvider>>;

export interface AwsClients {
  s3: S3Client;
  dynamo: DynamoDBClient;
}

// The longest a presigned URL from the API lasts (ASSET_URL_TTL_SECONDS and
// THUMBNAIL_URL_TTL_SECONDS in awsSceneHandler.ts, GLB_URL_TTL_SECONDS in awsPublishHandler.ts).
const MAX_PRESIGNED_URL_TTL_MS = 15 * 60_000;
// The SDK replaces credentials that expire within 5 minutes; a shared session follows the same rule.
const SESSION_REFRESH_WINDOW_MS = 5 * 60_000;

export const readRequiredEnv = (env: ServerEnv, name: string): string => {
  const value = env[name];

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
};

/**
 * One role session for both clients, so they share each OIDC → STS exchange.
 *
 * A presigned URL stops working when the session that signed it expires. The SDK keeps using
 * credentials until 5 minutes before their expiry, so a URL signed then would last 5 minutes, not
 * its 15. The expiry given to the SDK is therefore the real one minus the longest URL lifetime:
 * a session is replaced with about 20 minutes left, and every URL lasts its full lifetime. With
 * STS's default 1-hour sessions, that's one exchange about every 40 minutes per warm function.
 *
 * The OIDC token is read at each exchange from the request in progress, so a cached provider never
 * reuses an old token. A failed exchange isn't kept: the next request tries again.
 */
const shareRoleSession = (provider: RoleSessionProvider): RoleSessionProvider => {
  let session: RoleSession | undefined;
  let pending: Promise<RoleSession> | undefined;

  return async () => {
    if (session?.expiration && session.expiration.getTime() - Date.now() > SESSION_REFRESH_WINDOW_MS) {
      return session;
    }

    pending ??= provider()
      .then((fresh) => {
        session = fresh.expiration
          ? { ...fresh, expiration: new Date(fresh.expiration.getTime() - MAX_PRESIGNED_URL_TTL_MS) }
          : fresh;
        return session;
      })
      .finally(() => {
        pending = undefined;
      });

    return pending;
  };
};

/**
 * Where the server's AWS access comes from, in order:
 *
 * 1. `AWS_ROLE_ARN` (Vercel): exchange the function's Vercel OIDC token for short-lived credentials
 *    of the stage's API role. No long-lived keys on Vercel. Don't pass `audience` here: the role's
 *    trust policy expects Vercel's default audience, and setting one exchanges the token for a
 *    different audience that the trust policy then rejects.
 * 2. `AWS_ACCESS_KEY_ID` + `AWS_SECRET_ACCESS_KEY` (local `pnpm dev`): the dev-only
 *    `libre3d-dev-local` user's key from the root `.env`. Read explicitly because Vite middleware
 *    gets `.env` values from `loadEnv`, not `process.env`, where the SDK would look for them.
 * 3. Otherwise the SDK's default credential chain.
 */
const resolveCredentials = (env: ServerEnv, region: string): AwsCredentials | undefined => {
  if (env.AWS_ROLE_ARN) {
    return shareRoleSession(awsCredentialsProvider({ roleArn: env.AWS_ROLE_ARN, clientConfig: { region } }));
  }

  if (env.AWS_ACCESS_KEY_ID && env.AWS_SECRET_ACCESS_KEY) {
    return { accessKeyId: env.AWS_ACCESS_KEY_ID, secretAccessKey: env.AWS_SECRET_ACCESS_KEY };
  }

  return undefined;
};

let cached: { key: string; clients: AwsClients } | undefined;

/**
 * The S3 and DynamoDB clients for this env, made on first use and then reused. Different settings
 * (another region or credentials) get new clients, so the dev server never keeps using old ones.
 */
export const getAwsClients = (env: ServerEnv): AwsClients => {
  const region = readRequiredEnv(env, "AWS_REGION");
  // Only ever held in memory, never logged.
  const key = JSON.stringify([region, env.AWS_ROLE_ARN, env.AWS_ACCESS_KEY_ID, env.AWS_SECRET_ACCESS_KEY]);

  if (cached?.key !== key) {
    const credentials = resolveCredentials(env, region);

    cached = {
      key,
      clients: { s3: new S3Client({ region, credentials }), dynamo: new DynamoDBClient({ region, credentials }) },
    };
  }

  return cached.clients;
};
