import { randomUUID } from "node:crypto";
import type { IncomingHttpHeaders } from "node:http";

import { DynamoDBClient, PutItemCommand, GetItemCommand } from "@aws-sdk/client-dynamodb";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { awsCredentialsProvider } from "@vercel/oidc-aws-credentials-provider";

export interface PublishSessionResult {
  sceneId: string;
  assetKey: string;
  uploadUrl: string;
  shareUrl: string;
}

type AwsCredentials = NonNullable<ConstructorParameters<typeof S3Client>[0]>["credentials"];

interface AwsPublishConfig {
  region: string;
  bucketName: string;
  tableName: string;
  /** Undefined means the AWS SDK's default credential chain (e.g. an `AWS_PROFILE`). */
  credentials: AwsCredentials | undefined;
}

type AwsPublishEnv = Record<string, string | undefined>;

const readRequiredEnv = (env: AwsPublishEnv, name: string): string => {
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
const resolveCredentials = (env: AwsPublishEnv, region: string): AwsCredentials | undefined => {
  if (env.AWS_ROLE_ARN) {
    return awsCredentialsProvider({ roleArn: env.AWS_ROLE_ARN, clientConfig: { region } });
  }

  if (env.AWS_ACCESS_KEY_ID && env.AWS_SECRET_ACCESS_KEY) {
    return { accessKeyId: env.AWS_ACCESS_KEY_ID, secretAccessKey: env.AWS_SECRET_ACCESS_KEY };
  }

  return undefined;
};

const readConfig = (env: AwsPublishEnv): AwsPublishConfig => {
  const region = readRequiredEnv(env, "AWS_REGION");

  return {
    region,
    bucketName: readRequiredEnv(env, "S3_BUCKET_NAME"),
    tableName: readRequiredEnv(env, "PUBLISHED_SCENES_TABLE_NAME"),
    credentials: resolveCredentials(env, region),
  };
};

const createS3Client = (config: AwsPublishConfig): S3Client =>
  new S3Client({ region: config.region, credentials: config.credentials });

const createDynamoClient = (config: AwsPublishConfig): DynamoDBClient =>
  new DynamoDBClient({ region: config.region, credentials: config.credentials });

const trimTrailingSlashes = (value: string): string => value.replace(/\/+$/, "");

const readHeader = (headers: IncomingHttpHeaders, name: string): string | undefined => {
  const value = headers[name];

  return Array.isArray(value) ? value[0] : value;
};

const isLocalHost = (host: string): boolean => host.startsWith("localhost") || host.startsWith("127.0.0.1");

/**
 * Resolves the origin that published share links should point at.
 *
 * `PUBLIC_BASE_URL` wins when it is set, which pins production links to the real domain and
 * keeps a spoofed `Host` header out of the share URL we persist. Without it we fall back to the
 * incoming request, so dev servers and Vercel preview deployments link to themselves.
 */
export const resolveRequestBaseUrl = (headers: IncomingHttpHeaders, env: AwsPublishEnv): string => {
  const configuredBaseUrl = env.PUBLIC_BASE_URL;

  if (configuredBaseUrl) {
    return trimTrailingSlashes(configuredBaseUrl);
  }

  const host = readHeader(headers, "x-forwarded-host") ?? readHeader(headers, "host");

  if (!host) {
    throw new Error("Unable to resolve the request host. Set PUBLIC_BASE_URL to provide one.");
  }

  const protocol = readHeader(headers, "x-forwarded-proto") ?? (isLocalHost(host) ? "http" : "https");

  return `${protocol}://${host}`;
};

const createShareUrl = (baseUrl: string, sceneId: string): string => `${trimTrailingSlashes(baseUrl)}/v/${sceneId}`;

const createAssetUrl = (config: AwsPublishConfig, assetKey: string): string =>
  `https://${config.bucketName}.s3.${config.region}.amazonaws.com/${assetKey}`;

export const createPublishSession = async (
  env: AwsPublishEnv,
  currentPublishId: string | null | undefined,
  baseUrl: string,
): Promise<PublishSessionResult> => {
  const config = readConfig(env);
  const s3Client = createS3Client(config);
  const dynamoClient = createDynamoClient(config);
  const sceneId = currentPublishId && currentPublishId.trim() ? currentPublishId : randomUUID();
  const assetKey = `scenes/${sceneId}.glb`;
  const assetUrl = createAssetUrl(config, assetKey);

  const uploadUrl = await getSignedUrl(
    s3Client,
    new PutObjectCommand({
      Bucket: config.bucketName,
      Key: assetKey,
      ContentType: "model/gltf-binary",
    }),
    { expiresIn: 900 },
  );

  await dynamoClient.send(
    new PutItemCommand({
      TableName: config.tableName,
      Item: {
        sceneId: { S: sceneId },
        assetKey: { S: assetKey },
        assetUrl: { S: assetUrl },
        shareUrl: { S: createShareUrl(baseUrl, sceneId) },
        createdAt: { S: new Date().toISOString() },
      },
    }),
  );

  return {
    sceneId,
    assetKey,
    uploadUrl,
    shareUrl: createShareUrl(baseUrl, sceneId),
  };
};

export const getPublishedScene = async (
  sceneId: string,
  env: AwsPublishEnv,
): Promise<{ assetUrl: string } | null> => {
  try {
    const config = readConfig(env);
    const dynamoClient = createDynamoClient(config);

    const response = await dynamoClient.send(
      new GetItemCommand({
        TableName: config.tableName,
        Key: {
          sceneId: { S: sceneId },
        },
      }),
    );

    if (!response.Item || !response.Item.assetUrl || !response.Item.assetUrl.S) {
      return null;
    }

    return {
      assetUrl: response.Item.assetUrl.S,
    };
  } catch (error) {
    console.error("Failed to retrieve scene from DynamoDB:", error);
    return null;
  }
};