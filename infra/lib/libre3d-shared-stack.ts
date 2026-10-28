/**
 * PURPOSE: Account-wide resources shared by every stage.
 *
 * IAM allows only one OIDC provider per issuer URL per account, so the Vercel provider lives here
 * rather than in each stage stack. Stage stacks reference it by its ARN (see vercel.ts).
 */

import { Stack, type StackProps } from "aws-cdk-lib";
import * as iam from "aws-cdk-lib/aws-iam";
import type { Construct } from "constructs";

import { VERCEL_OIDC_AUDIENCE, VERCEL_OIDC_HOST } from "./vercel";

export class Libre3dSharedStack extends Stack {
  constructor(scope: Construct, id: string, props: StackProps) {
    super(scope, id, props);

    new iam.OidcProviderNative(this, "VercelOidcProvider", {
      url: `https://${VERCEL_OIDC_HOST}`,
      clientIds: [VERCEL_OIDC_AUDIENCE],
    });
  }
}
