import { randomUUID } from "node:crypto";
import type { IncomingHttpHeaders } from "node:http";

import { PutItemCommand, GetItemCommand } from "@aws-sdk/client-dynamodb";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// `.js` is required: Vercel runs server modules under Node's ES module loader (see awsConfig.ts).
import {
  createDynamoClient,
  createS3Client,
  readAwsAccess,
  readRequiredEnv,
  type AwsAccess,
  type ServerEnv,
} from "./awsConfig.js";

export interface PublishSessionResult {
  sceneId: string;
  assetKey: string;
  uploadUrl: string;
  shareUrl: string;
}

interface AwsPublishConfig extends AwsAccess {
  bucketName: string;
  tableName: string;
}

type AwsPublishEnv = ServerEnv;

const readConfig = (env: AwsPublishEnv): AwsPublishConfig => ({
  ...readAwsAccess(env),
  bucketName: readRequiredEnv(env, "S3_BUCKET_NAME"),
  tableName: readRequiredEnv(env, "PUBLISHED_SCENES_TABLE_NAME"),
});

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