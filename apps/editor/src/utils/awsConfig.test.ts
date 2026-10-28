import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

import type { getAwsClients as GetAwsClients, ServerEnv } from "./awsConfig";

const MINUTE = 60_000;

// A fake Vercel OIDC → STS exchange: each call is a new numbered 1-hour session (STS's default),
// remembered so a test can check how long a presigned URL's session really has left.
const sts = vi.hoisted(() => ({
  providersCreated: 0,
  exchanges: 0,
  failing: false,
  expiresAt: new Map<string, number>(),
}));

vi.mock("@vercel/oidc-aws-credentials-provider", () => ({
  awsCredentialsProvider: () => {
    sts.providersCreated += 1;

    return async () => {
      if (sts.failing) {
        throw new Error("STS is unavailable.");
      }

      sts.exchanges += 1;
      const sessionToken = `session-${sts.exchanges}`;
      const expiration = new Date(Date.now() + 60 * MINUTE);
      sts.expiresAt.set(sessionToken, expiration.getTime());

      return { accessKeyId: "ASIATEST", secretAccessKey: "secret", sessionToken, expiration };
    };
  },
}));

const roleEnv: ServerEnv = { AWS_REGION: "us-east-2", AWS_ROLE_ARN: "arn:aws:iam::123456789012:role/test-api" };
const keyEnv: ServerEnv = { AWS_REGION: "us-east-2", AWS_ACCESS_KEY_ID: "AKIATEST", AWS_SECRET_ACCESS_KEY: "secret" };

const presign = async (clients: ReturnType<typeof GetAwsClients>): Promise<URL> =>
  new URL(await getSignedUrl(clients.s3, new GetObjectCommand({ Bucket: "bucket", Key: "key" }), { expiresIn: 900 }));

describe("getAwsClients", () => {
  let getAwsClients: typeof GetAwsClients;

  beforeEach(async () => {
    vi.useFakeTimers({ toFake: ["Date"], now: new Date("2026-10-06T12:00:00Z") });
    Object.assign(sts, { providersCreated: 0, exchanges: 0, failing: false });
    sts.expiresAt.clear();
    // A fresh module per test, so each starts with no cached clients.
    vi.resetModules();
    ({ getAwsClients } = await import("./awsConfig"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("reuses the clients while the settings stay the same", () => {
    const first = getAwsClients(roleEnv);
    const second = getAwsClients({ ...roleEnv });

    expect(second.s3).toBe(first.s3);
    expect(second.dynamo).toBe(first.dynamo);
    expect(sts.providersCreated).toBe(1);
  });

  it("makes new clients when the region or credentials change", () => {
    const role = getAwsClients(roleEnv);
    const otherRegion = getAwsClients({ ...roleEnv, AWS_REGION: "us-west-2" });
    const otherRole = getAwsClients({ ...roleEnv, AWS_ROLE_ARN: "arn:aws:iam::123456789012:role/other-api" });
    const keys = getAwsClients(keyEnv);
    const otherKeys = getAwsClients({ ...keyEnv, AWS_ACCESS_KEY_ID: "AKIAOTHER" });

    const s3Clients = new Set([role, otherRegion, otherRole, keys, otherKeys].map((clients) => clients.s3));
    expect(s3Clients.size).toBe(5);
  });

  it("needs AWS_REGION", () => {
    expect(() => getAwsClients({ AWS_ROLE_ARN: roleEnv.AWS_ROLE_ARN })).toThrow("AWS_REGION");
  });

  it("uses the local keys without a role session", async () => {
    const credentials = await getAwsClients(keyEnv).s3.config.credentials();

    expect(credentials.accessKeyId).toBe("AKIATEST");
    expect(sts.providersCreated).toBe(0);
  });

  it("shares one role session between S3 and DynamoDB across requests", async () => {
    for (let request = 0; request < 3; request += 1) {
      const clients = getAwsClients(roleEnv);
      await presign(clients);
      await clients.dynamo.config.credentials();
    }

    expect(sts.exchanges).toBe(1);
  });

  it("gives every presigned URL a session that outlives its 15 minutes", async () => {
    // A URL a minute for three hours, as a warm function would hand them out.
    for (let minute = 0; minute <= 180; minute += 1) {
      vi.setSystemTime(new Date("2026-10-06T12:00:00Z").getTime() + minute * MINUTE);

      const url = await presign(getAwsClients(roleEnv));
      const sessionToken = url.searchParams.get("X-Amz-Security-Token") ?? "";

      expect(url.searchParams.get("X-Amz-Expires")).toBe("900");
      expect(sts.expiresAt.get(sessionToken)! - Date.now()).toBeGreaterThanOrEqual(15 * MINUTE);
    }

    // About one exchange per 40 minutes, not one per request.
    expect(sts.exchanges).toBeGreaterThan(1);
    expect(sts.exchanges).toBeLessThanOrEqual(5);
  });

  it("tries a failed exchange again on the next request", async () => {
    sts.failing = true;
    await expect(presign(getAwsClients(roleEnv))).rejects.toThrow("STS is unavailable.");

    sts.failing = false;
    const url = await presign(getAwsClients(roleEnv));

    expect(url.searchParams.get("X-Amz-Security-Token")).toBe("session-1");
  });
});
