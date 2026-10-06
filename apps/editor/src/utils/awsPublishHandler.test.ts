import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { FakeDynamoDB, FakePresigner, FakeS3 } from "../testing/fakeAws";
import { handlePublishRequest, handlePublishedSceneRequest } from "./awsPublishHandler";
import { handleScenesRequest, type SceneApiResponse } from "./awsSceneHandler";

const aws = vi.hoisted(() => ({ dynamo: null as unknown, s3: null as unknown, presigner: null as unknown }));

vi.mock("./awsConfig.js", () => ({
  readAwsAccess: () => ({ region: "us-east-2", credentials: undefined }),
  readRequiredEnv: (env: Record<string, string | undefined>, name: string) => {
    const value = env[name];
    if (!value) throw new Error(`Missing required environment variable: ${name}`);
    return value;
  },
  createDynamoClient: () => aws.dynamo,
  createS3Client: () => aws.s3,
}));

vi.mock("@aws-sdk/s3-request-presigner", () => ({
  getSignedUrl: (...args: Parameters<FakePresigner["getSignedUrl"]>) => (aws.presigner as FakePresigner).getSignedUrl(...args),
}));

// `Bearer <name>` signs in as user `<name>` (the real check is in verifyAuth.test.ts).
vi.mock("./verifyAuth.js", () => ({
  verifyAuth: async (headers: Record<string, string | undefined>) =>
    headers.authorization?.startsWith("Bearer ")
      ? { authorized: true, userId: headers.authorization.slice("Bearer ".length) }
      : { authorized: false, status: 401, error: "You need to be signed in to do that." },
}));

const ENV = {
  AWS_REGION: "us-east-2",
  S3_BUCKET_NAME: "bucket",
  USER_SCENES_TABLE_NAME: "user-scenes",
  PUBLISHED_SCENES_TABLE_NAME: "published-scenes",
};

const MISSING_ID = "00000000-0000-4000-8000-000000000000";

let dynamo: FakeDynamoDB;
let s3: FakeS3;
let presigner: FakePresigner;

const publish = (body: unknown, { as = "alice" as string | null, method = "POST" } = {}): Promise<SceneApiResponse> =>
  handlePublishRequest({ method, headers: as ? { authorization: `Bearer ${as}` } : {}, body }, ENV);

const view = (publishId: string, method = "GET"): Promise<SceneApiResponse> => handlePublishedSceneRequest({ method, publishId }, ENV);

const scenes = (method: string, sceneId: string | null, as = "alice", body?: unknown): Promise<SceneApiResponse> =>
  handleScenesRequest({ method, sceneId, headers: { authorization: `Bearer ${as}` }, body }, ENV);

const createScene = async (as = "alice"): Promise<string> => {
  const response = await scenes("POST", null, as, {});
  return (response.body as { sceneId: string }).sceneId;
};

/** Publishes the scene and plays the browser's upload of its GLB. */
const publishAndUpload = async (sceneId: string, as = "alice"): Promise<string> => {
  const response = await publish({ sceneId }, { as });
  expect(response.status).toBe(200);
  const { publishId, uploadUrl } = response.body as { publishId: string; uploadUrl: string };
  s3.upload(String(presigner.find(uploadUrl).input.Key), "glb");
  return publishId;
};

beforeEach(() => {
  dynamo = new FakeDynamoDB();
  s3 = new FakeS3();
  presigner = new FakePresigner();
  aws.dynamo = dynamo;
  aws.s3 = s3;
  aws.presigner = presigner;
  vi.useFakeTimers({ toFake: ["Date"] });
  vi.setSystemTime(new Date("2026-10-06T12:00:00.000Z"));
});

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe("publishing", () => {
  it("answers anything but POST with 405, and a signed-out request with 401 before touching storage", async () => {
    await expect(publish({}, { method: "GET" })).resolves.toMatchObject({ status: 405, headers: { Allow: "POST" } });

    dynamo.failNextWith = new Error("storage must not be reached");
    await expect(publish({ sceneId: MISSING_ID }, { as: null })).resolves.toMatchObject({ status: 401 });
  });

  it("gives a scene a publish ID on its first publish, records the owner, and signs a PUT for its GLB", async () => {
    const sceneId = await createScene();

    const response = await publish({ sceneId });

    expect(response.status).toBe(200);
    const { publishId, uploadUrl } = response.body as { publishId: string; uploadUrl: string };
    expect(publishId).toMatch(/^[0-9a-f-]{36}$/);
    expect(publishId).not.toBe(sceneId);
    expect(dynamo.getItem("alice", sceneId)?.publishId).toEqual({ S: publishId });
    expect(dynamo.getPublished(publishId)).toEqual({
      sceneId: { S: publishId },
      assetKey: { S: `scenes/${publishId}.glb` },
      ownerId: { S: "alice" },
      sourceSceneId: { S: sceneId },
      updatedAt: { S: "2026-10-06T12:00:00.000Z" },
    });
    expect(presigner.find(uploadUrl)).toMatchObject({
      operation: "PutObject",
      input: { Bucket: "bucket", Key: `scenes/${publishId}.glb`, ContentType: "model/gltf-binary" },
      expiresIn: 900,
    });
  });

  it("keeps the same publish ID (and share link) when the scene is published again", async () => {
    const sceneId = await createScene();
    const first = await publishAndUpload(sceneId);
    vi.setSystemTime(new Date("2026-10-06T13:00:00.000Z"));

    const second = await publishAndUpload(sceneId);

    expect(second).toBe(first);
    expect(dynamo.getPublished(first)?.updatedAt).toEqual({ S: "2026-10-06T13:00:00.000Z" });
  });

  it("ignores a publish ID the client sends: there's no way to name another scene's link", async () => {
    const bobScene = await createScene("bob");
    const bobPublishId = await publishAndUpload(bobScene, "bob");
    const aliceScene = await createScene();

    const response = await publish({ sceneId: aliceScene, publishId: bobPublishId, currentPublishId: bobPublishId });

    expect((response.body as { publishId: string }).publishId).not.toBe(bobPublishId);
    expect(dynamo.getPublished(bobPublishId)?.ownerId).toEqual({ S: "bob" });
  });

  it("answers 404 for another user's scene or a missing one, and 400 without a scene ID, changing nothing", async () => {
    const bobScene = await createScene("bob");

    await expect(publish({ sceneId: bobScene })).resolves.toMatchObject({ status: 404 });
    await expect(publish({ sceneId: MISSING_ID })).resolves.toMatchObject({ status: 404 });

    for (const body of [{}, { sceneId: "../other" }, { sceneId: 42 }, "not json"]) {
      await expect(publish(body)).resolves.toMatchObject({ status: 400 });
    }

    expect(dynamo.getItem("bob", bobScene)).not.toHaveProperty("publishId");
    expect(dynamo.getItem("alice", MISSING_ID)).toBeUndefined();
    expect(presigner.signed).toEqual([]);
  });

  it("refuses (409) a published row owned by someone else, without signing anything", async () => {
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    const sceneId = await createScene();
    const takenId = "11111111-1111-4111-8111-111111111111";
    // Only reachable if storage were corrupted: the scene's row names a link someone else owns.
    dynamo.putItem("user-scenes", { ...dynamo.getItem("alice", sceneId)!, publishId: { S: takenId } });
    dynamo.putItem("published-scenes", { sceneId: { S: takenId }, assetKey: { S: `scenes/${takenId}.glb` }, ownerId: { S: "bob" } });

    await expect(publish({ sceneId })).resolves.toMatchObject({ status: 409 });
    expect(dynamo.getPublished(takenId)?.ownerId).toEqual({ S: "bob" });
    expect(presigner.signed).toEqual([]);
  });

  it("doesn't need the editing lock: a view-only tab can publish", async () => {
    const sceneId = await createScene();
    await scenes("POST", sceneId, "alice", { sessionId: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa" });

    await expect(publish({ sceneId })).resolves.toMatchObject({ status: 200 });
  });

  it("accepts the raw JSON string body the Vite middleware passes", async () => {
    const sceneId = await createScene();

    await expect(publish(JSON.stringify({ sceneId }))).resolves.toMatchObject({ status: 200 });
  });

  it("tells the gallery and the editor which scenes are published", async () => {
    const published = await createScene();
    const notPublished = await createScene();
    const publishId = await publishAndUpload(published);

    const list = (await scenes("GET", null)).body as { scenes: { sceneId: string; publishId?: string }[] };
    expect(list.scenes.find((scene) => scene.sceneId === published)?.publishId).toBe(publishId);
    expect(list.scenes.find((scene) => scene.sceneId === notPublished)?.publishId).toBeUndefined();
    await expect(scenes("GET", published)).resolves.toMatchObject({ body: { scene: { publishId } } });
  });

  it("answers an AWS failure with a generic 500 that leaks nothing", async () => {
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    const sceneId = await createScene();
    dynamo.failNextWith = new Error("AccessDenied: arn:aws:iam::123:role/secret");

    await expect(publish({ sceneId })).resolves.toEqual({
      status: 500,
      body: { error: "Something went wrong on the server. Try again." },
      headers: undefined,
    });
  });
});

describe("the public viewer", () => {
  it("signs a short-lived GET for the published GLB, for anyone, and asks not to be cached", async () => {
    const publishId = await publishAndUpload(await createScene());

    const response = await view(publishId);

    expect(response).toMatchObject({ status: 200, headers: { "Cache-Control": "no-store" } });
    expect(presigner.find((response.body as { cloudAssetUrl: string }).cloudAssetUrl)).toMatchObject({
      operation: "GetObject",
      input: { Bucket: "bucket", Key: `scenes/${publishId}.glb` },
      expiresIn: 900,
    });
  });

  it("still serves a scene published before publishing was tied to users", async () => {
    const oldId = "22222222-2222-4222-8222-222222222222";
    dynamo.putItem("published-scenes", {
      sceneId: { S: oldId },
      assetKey: { S: `scenes/${oldId}.glb` },
      assetUrl: { S: `https://bucket.s3.us-east-2.amazonaws.com/scenes/${oldId}.glb` },
      shareUrl: { S: `http://localhost:5173/v/${oldId}` },
      createdAt: { S: "2026-10-01T00:00:00.000Z" },
    });

    const response = await view(oldId);

    expect(presigner.find((response.body as { cloudAssetUrl: string }).cloudAssetUrl).input.Key).toBe(`scenes/${oldId}.glb`);
  });

  it("answers 404 for an unknown or malformed ID before building any key, and 405 for anything but GET", async () => {
    await expect(view(MISSING_ID)).resolves.toMatchObject({ status: 404 });

    dynamo.failNextWith = new Error("storage must not be reached");
    await expect(view("../users/alice/scenes/x")).resolves.toMatchObject({ status: 404 });
    await expect(view(MISSING_ID, "POST")).resolves.toMatchObject({ status: 405, headers: { Allow: "GET" } });
    expect(presigner.signed).toEqual([]);
  });
});
