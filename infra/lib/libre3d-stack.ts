/**
 * PURPOSE: Everything one deployment of the editor (dev or prod) talks to.
 *
 * - Cognito user pool + browser app client: who the user is.
 * - S3 bucket, fully private: scene JSON, imported assets, and published GLBs. Browsers only ever
 *   reach objects through short-lived presigned URLs minted by the API, never public URLs.
 * - DynamoDB `published-scenes`: public lookup from a share link's sceneId to its GLB, plus owner.
 * - DynamoDB `user-scenes`: one row per user scene (gallery metadata + single-editor lock).
 * - IAM role the Vercel functions assume via OIDC: no long-lived AWS keys anywhere.
 *
 * Prod data survives stack deletion (RETAIN + point-in-time recovery); dev is disposable.
 */

import { CfnOutput, Duration, RemovalPolicy, Stack, type StackProps, Tags } from "aws-cdk-lib";
import * as cognito from "aws-cdk-lib/aws-cognito";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import * as iam from "aws-cdk-lib/aws-iam";
import * as s3 from "aws-cdk-lib/aws-s3";
import type { Construct } from "constructs";

import {
  VERCEL_OIDC_AUDIENCE,
  VERCEL_OIDC_HOST,
  VERCEL_PROJECT_NAME,
  VERCEL_TEAM_SLUG,
  type VercelEnvironment,
} from "./vercel";

export interface Libre3dStackProps extends StackProps {
  stage: "dev" | "prod";
  /** Origins allowed to PUT/GET bucket objects from the browser (S3 CORS; one `*` allowed each). */
  allowedOrigins: string[];
  /** Which Vercel environment may assume this stage's API role. */
  vercelEnvironment: VercelEnvironment;
}

export class Libre3dStack extends Stack {
  constructor(scope: Construct, id: string, props: Libre3dStackProps) {
    super(scope, id, props);

    const { stage, allowedOrigins, vercelEnvironment } = props;
    const isProd = stage === "prod";
    const removalPolicy = isProd ? RemovalPolicy.RETAIN : RemovalPolicy.DESTROY;
    const name = (suffix: string) => `libre3d-${stage}-${suffix}`;

    Tags.of(this).add("project", "libre3d");
    Tags.of(this).add("stage", stage);

    // ---- Auth -------------------------------------------------------------------------------

    const userPool = new cognito.UserPool(this, "UserPool", {
      userPoolName: name("users"),
      selfSignUpEnabled: true,
      signInAliases: { email: true },
      autoVerify: { email: true },
      standardAttributes: { email: { required: true, mutable: true } },
      passwordPolicy: {
        minLength: 8,
        requireLowercase: true,
        requireUppercase: true,
        requireDigits: true,
        requireSymbols: false,
      },
      accountRecovery: cognito.AccountRecovery.EMAIL_ONLY,
      deletionProtection: isProd,
      removalPolicy,
    });

    // Browser client: no secret (it would be public anyway), SRP so the password never leaves the
    // browser in plain form, and no "user does not exist" leaks on sign-in.
    const userPoolClient = userPool.addClient("WebClient", {
      userPoolClientName: name("web"),
      generateSecret: false,
      authFlows: { userSrp: true },
      preventUserExistenceErrors: true,
      accessTokenValidity: Duration.hours(1),
      idTokenValidity: Duration.hours(1),
      refreshTokenValidity: Duration.days(30),
    });

    // ---- Storage ----------------------------------------------------------------------------

    const bucket = new s3.Bucket(this, "AssetsBucket", {
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      encryption: s3.BucketEncryption.S3_MANAGED,
      enforceSSL: true,
      objectOwnership: s3.ObjectOwnership.BUCKET_OWNER_ENFORCED,
      cors: [
        {
          allowedOrigins,
          allowedMethods: [s3.HttpMethods.GET, s3.HttpMethods.PUT, s3.HttpMethods.HEAD],
          allowedHeaders: ["*"],
          exposedHeaders: ["ETag"],
          maxAge: 3000,
        },
      ],
      // Clean up uploads the browser started but never finished.
      lifecycleRules: [{ abortIncompleteMultipartUploadAfter: Duration.days(1) }],
      removalPolicy,
      autoDeleteObjects: !isProd,
    });

    const pointInTimeRecoverySpecification = { pointInTimeRecoveryEnabled: isProd };

    // Public share links resolve sceneId -> GLB key here. ownerId lets publish refuse to overwrite
    // someone else's scene.
    const publishedScenesTable = new dynamodb.TableV2(this, "PublishedScenesTable", {
      tableName: name("published-scenes"),
      partitionKey: { name: "sceneId", type: dynamodb.AttributeType.STRING },
      billing: dynamodb.Billing.onDemand(),
      pointInTimeRecoverySpecification,
      deletionProtection: isProd,
      removalPolicy,
    });

    // One row per user scene: gallery metadata (name, updatedAt, publishId, thumbnail) plus the
    // single-editor lease (lockHolder, lockExpiresAt). Query by userId lists a user's gallery.
    const userScenesTable = new dynamodb.TableV2(this, "UserScenesTable", {
      tableName: name("user-scenes"),
      partitionKey: { name: "userId", type: dynamodb.AttributeType.STRING },
      sortKey: { name: "sceneId", type: dynamodb.AttributeType.STRING },
      billing: dynamodb.Billing.onDemand(),
      pointInTimeRecoverySpecification,
      deletionProtection: isProd,
      removalPolicy,
    });

    // ---- API role (Vercel OIDC) -------------------------------------------------------------

    const vercelOidcProviderArn = `arn:aws:iam::${this.account}:oidc-provider/${VERCEL_OIDC_HOST}`;

    const apiRole = new iam.Role(this, "VercelApiRole", {
      roleName: name("vercel-api"),
      description: `Assumed by Vercel ${vercelEnvironment} functions of ${VERCEL_PROJECT_NAME} via OIDC`,
      maxSessionDuration: Duration.hours(1),
      assumedBy: new iam.WebIdentityPrincipal(vercelOidcProviderArn, {
        StringEquals: {
          [`${VERCEL_OIDC_HOST}:aud`]: VERCEL_OIDC_AUDIENCE,
          [`${VERCEL_OIDC_HOST}:sub`]:
            `owner:${VERCEL_TEAM_SLUG}:project:${VERCEL_PROJECT_NAME}:environment:${vercelEnvironment}`,
        },
      }),
    });

    // Least privilege: item-level access to the two tables and object-level access to the bucket.
    // No table/bucket management, no other resources.
    publishedScenesTable.grantReadWriteData(apiRole);
    userScenesTable.grantReadWriteData(apiRole);
    bucket.grantReadWrite(apiRole);
    bucket.grantDelete(apiRole);

    // ---- Outputs: exactly what goes into .env (dev) / Vercel env vars ------------------------

    const output = (id: string, value: string, description: string) =>
      new CfnOutput(this, id, { value, description });

    output("Region", this.region, "AWS_REGION");
    output("UserPoolId", userPool.userPoolId, "VITE_COGNITO_USER_POOL_ID");
    output("UserPoolClientId", userPoolClient.userPoolClientId, "VITE_COGNITO_CLIENT_ID");
    output("BucketName", bucket.bucketName, "S3_BUCKET_NAME");
    output("PublishedScenesTableName", publishedScenesTable.tableName, "PUBLISHED_SCENES_TABLE_NAME");
    output("UserScenesTableName", userScenesTable.tableName, "USER_SCENES_TABLE_NAME");
    output("VercelApiRoleArn", apiRole.roleArn, "AWS_ROLE_ARN (Vercel only)");
  }
}
