/**
 * PURPOSE: CDK entry point. Declares every Libre3D stack and where it deploys.
 *
 * One shared stack holds account-wide singletons (the Vercel OIDC provider can only exist once per
 * account), and one stack per stage holds everything a deployment of the editor talks to. Dev and
 * prod are the same class with different settings, so they cannot drift apart.
 */

import { App } from "aws-cdk-lib";

import { Libre3dSharedStack } from "../lib/libre3d-shared-stack";
import { Libre3dStack } from "../lib/libre3d-stack";

const app = new App();

// The agency's Libre3D account. us-east-2 is the agency's chosen Region.
const env = { account: "574317421428", region: "us-east-2" };

const shared = new Libre3dSharedStack(app, "Libre3d-shared", { env });

const dev = new Libre3dStack(app, "Libre3d-dev", {
  env,
  stage: "dev",
  // Local dev server plus this project's Vercel preview deployments.
  allowedOrigins: ["http://localhost:5173", "https://libre3d-editor-*-libre3-d.vercel.app"],
  vercelEnvironment: "preview",
  // The dev branch's stable Vercel preview (staging); per-PR preview URLs change every time.
  appUrl: "https://libre3d-editor-git-dev-libre3-d.vercel.app",
});

const prod = new Libre3dStack(app, "Libre3d-prod", {
  env,
  stage: "prod",
  allowedOrigins: ["https://libre3d.emilyapel.com"],
  vercelEnvironment: "production",
  appUrl: "https://libre3d.emilyapel.com",
});

// Stage roles trust the shared OIDC provider by its well-known ARN rather than a cross-stack
// export, so the shared stack can change without being pinned by its consumers.
dev.addStackDependency(shared);
prod.addStackDependency(shared);
