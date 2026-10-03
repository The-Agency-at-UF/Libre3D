/**
 * PURPOSE: Server-side (Node) AWS setup shared by every API handler: required env vars, where the
 * credentials come from, and the S3/DynamoDB clients.
 *
 * Used by `awsPublishHandler.ts` and `awsSceneHandler.ts`, which the Vercel functions in `api/`
 * and the Vite dev middleware both call. Server modules import each other with `.js` extensions:
 * on Vercel they run under Node's ES module loader, which doesn't guess extensions.
 */

import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { S3Client } from "@aws-sdk/client-s3";
import { awsCredentialsProvider } from "@vercel/oidc-aws-credentials-provider";

export type ServerEnv = Record<string, string | undefined>;

type AwsCredentials = NonNullable<ConstructorParameters<typeof S3Client>[0]>["credentials"];

export interface AwsAccess {
  region: string;
  /** Undefined means the AWS SDK's default credential chain (e.g. an `AWS_PROFILE`). */
  credentials: AwsCredentials | undefined;
}

export const readRequiredEnv = (env: ServerEnv, name: string): string => {
  const value = env[name];

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
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
    return awsCredentialsProvider({ roleArn: env.AWS_ROLE_ARN, clientConfig: { region } });
  }

  if (env.AWS_ACCESS_KEY_ID && env.AWS_SECRET_ACCESS_KEY) {
    return { accessKeyId: env.AWS_ACCESS_KEY_ID, secretAccessKey: env.AWS_SECRET_ACCESS_KEY };
  }

  return undefined;
};

export const readAwsAccess = (env: ServerEnv): AwsAccess => {
  const region = readRequiredEnv(env, "AWS_REGION");

  return { region, credentials: resolveCredentials(env, region) };
};

export const createS3Client = (access: AwsAccess): S3Client =>
  new S3Client({ region: access.region, credentials: access.credentials });

export const createDynamoClient = (access: AwsAccess): DynamoDBClient =>
  new DynamoDBClient({ region: access.region, credentials: access.credentials });
