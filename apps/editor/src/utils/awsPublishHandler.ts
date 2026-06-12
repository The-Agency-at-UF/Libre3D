import { randomUUID } from "node:crypto";

import { DynamoDBClient, PutItemCommand, GetItemCommand } from "@aws-sdk/client-dynamodb";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

export interface PublishSessionResult {
  sceneId: string;
  assetKey: string;
  uploadUrl: string;
  shareUrl: string;
}

interface AwsPublishConfig {
  region: string;
  bucketName: string;
  tableName: string;
  accessKeyId: string;
  secretAccessKey: string;
}

type AwsPublishEnv = Record<string, string | undefined>;

const readRequiredEnv = (env: AwsPublishEnv, name: string): string => {
  const value = env[name];

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
};

const readConfig = (env: AwsPublishEnv): AwsPublishConfig => ({
  region: readRequiredEnv(env, "AWS_REGION"),
  bucketName: readRequiredEnv(env, "S3_BUCKET_NAME"),
  tableName: readRequiredEnv(env, "DYNAMODB_TABLE_NAME"),
  accessKeyId: readRequiredEnv(env, "AWS_ACCESS_KEY_ID"),
  secretAccessKey: readRequiredEnv(env, "AWS_SECRET_ACCESS_KEY"),
});

const createS3Client = (config: AwsPublishConfig): S3Client =>
  new S3Client({
    region: config.region,
    credentials: {
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey,
    },
  });

const createDynamoClient = (config: AwsPublishConfig): DynamoDBClient =>
  new DynamoDBClient({
    region: config.region,
    credentials: {
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey,
    },
  });

const createShareUrl = (sceneId: string): string => `http://localhost:5173/v/${sceneId}`;

const createAssetUrl = (config: AwsPublishConfig, assetKey: string): string =>
  `https://${config.bucketName}.s3.${config.region}.amazonaws.com/${assetKey}`;

export const createPublishSession = async (
  env: AwsPublishEnv,
  currentPublishId?: string | null,
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
        shareUrl: { S: createShareUrl(sceneId) },
        createdAt: { S: new Date().toISOString() },
      },
    }),
  );

  return {
    sceneId,
    assetKey,
    uploadUrl,
    shareUrl: createShareUrl(sceneId),
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