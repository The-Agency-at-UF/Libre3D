/**
 * PURPOSE: Everything one deployment of the editor (dev or prod) talks to.
 *
 * - Cognito user pool + browser app client: who the user is.
 * - S3 bucket, fully private: scene JSON, imported assets, and published GLBs. Browsers only ever
 *   reach objects through short-lived presigned URLs minted by the API, never public URLs.
 * - DynamoDB `published-scenes`: public lookup from a share link's sceneId to its GLB, plus owner.
 * - DynamoDB `user-scenes`: one row per user scene (gallery metadata + single-editor lock).
 * - IAM role the Vercel functions assume via OIDC: no long-lived AWS keys on Vercel.
 * - Dev only: an IAM user with the same permissions, whose key powers `pnpm dev` on a laptop.
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
  /** Where people use this stage of the editor; invitation emails link here. */
  appUrl: string;
}

export class Libre3dStack extends Stack {
  constructor(scope: Construct, id: string, props: Libre3dStackProps) {
    super(scope, id, props);

    const { stage, allowedOrigins, vercelEnvironment, appUrl } = props;
    const isProd = stage === "prod";
    const removalPolicy = isProd ? RemovalPolicy.RETAIN : RemovalPolicy.DESTROY;
    const name = (suffix: string) => `libre3d-${stage}-${suffix}`;

    Tags.of(this).add("project", "libre3d");
    Tags.of(this).add("stage", stage);

    // ---- Auth -------------------------------------------------------------------------------

    // Invite-only: access is a short, hand-picked list of people, and the user list in this pool
    // *is* that list. Nobody can sign themselves up; an admin creates each user, and Cognito emails
    // them a temporary password. Disabling a user (plus a global sign-out) removes their access.
    //
    // MFA is required and limited to authenticator apps (TOTP), so a leaked password alone gets
    // nobody in. Managed login walks each user through linking an app on their first sign-in.
    // SMS stays off (cost, SIM-swap risk) and email codes stay off (recovery already uses email).
    const userPool = new cognito.UserPool(this, "UserPool", {
      userPoolName: name("users"),
      selfSignUpEnabled: false,
      userInvitation: {
        emailSubject: "You're invited to Libre3D",
        emailBody:
          "You've been given access to Libre3D.<br><br>" +
          `Sign in at <a href="${appUrl}">${appUrl}</a> with:<br>` +
          "Email: {username}<br>" +
          "Temporary password: {####}<br><br>" +
          "You'll choose your own password and link an authenticator app (such as Google " +
          "Authenticator or Duo Mobile) the first time you sign in. The temporary password " +
          "expires in 7 days.",
      },
      mfa: cognito.Mfa.REQUIRED,
      mfaSecondFactor: { otp: true, sms: false },
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

    // Least privilege: exactly the operations the API performs, on these resources only. CDK's
    // grantReadWriteData/grantReadWrite would add Scan (read every user's rows), stream reads, and
    // object-lock settings, none of which the API uses. A factory, so every identity that runs the
    // API code gets its own copy of the same statements.
    const apiPolicyStatements = (): iam.PolicyStatement[] => [
      new iam.PolicyStatement({
        sid: "SceneTableItems",
        actions: [
          "dynamodb:GetItem",
          "dynamodb:PutItem",
          "dynamodb:UpdateItem",
          "dynamodb:DeleteItem",
          "dynamodb:Query",
          // Needed for the condition checks inside TransactWriteItems (e.g. the editor lock).
          "dynamodb:ConditionCheckItem",
        ],
        resources: [publishedScenesTable.tableArn, userScenesTable.tableArn],
      }),
      // Presigned URLs carry the signer's permissions: GET for loading, PUT for saving/publishing.
      new iam.PolicyStatement({
        sid: "SceneObjects",
        actions: ["s3:GetObject", "s3:PutObject", "s3:DeleteObject"],
        resources: [bucket.arnForObjects("*")],
      }),
      // Without ListBucket, HeadObject on a missing key answers 403 instead of 404, and the
      // "upload this asset only if it isn't stored yet" check could not tell the two apart.
      new iam.PolicyStatement({
        sid: "SceneBucketList",
        actions: ["s3:ListBucket"],
        resources: [bucket.bucketArn],
      }),
    ];

    for (const statement of apiPolicyStatements()) {
      apiRole.addToPolicy(statement);
    }

    // ---- Local dev user (dev only) ----------------------------------------------------------

    // `pnpm dev` runs the API in Vite middleware on a laptop, where there is no Vercel OIDC token
    // and the agency's SSO session lasts only 30 minutes. This user has the API role's permissions
    // and nothing else: no console password, no other resources. Its access key is created by hand
    // in the console and lives only in the local `.env`, so the secret never passes through
    // CloudFormation or git. Never created for prod.
    let localDevUser: iam.User | undefined;

    if (!isProd) {
      localDevUser = new iam.User(this, "LocalDevUser", { userName: name("local") });

      for (const statement of apiPolicyStatements()) {
        localDevUser.addToPolicy(statement);
      }
    }

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

    if (localDevUser) {
      output("LocalDevUserName", localDevUser.userName, "Create its access key in the console for the local .env");
    }
  }
}
