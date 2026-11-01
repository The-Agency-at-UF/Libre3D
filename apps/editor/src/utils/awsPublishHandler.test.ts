import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { DeleteObjectCommand } from "@aws-sdk/client-s3";

import { FakeDynamoDB, FakePresigner, FakeS3 } from "../testing/fakeAws";
import { handlePublishRequest, handlePublishedSceneRequest } from "./awsPublishHandler";
import { handleScenesRequest, type SceneApiResponse } from "./awsSceneHandler";
import { assetHashToBase64, collectAssetHashes } from "./sceneAssets";

const aws = vi.hoisted(() => ({ dynamo: null as unknown, s3: null as unknown, presigner: null as unknown }));

vi.mock("./awsConfig.js", () => ({
  readRequiredEnv: (env: Record<string, string | undefined>, name: string) => {
    const value = env[name];
    if (!value) throw new Error(`Missing required environment variable: ${name}`);
    return value;
  },
  getAwsClients: () => ({ s3: aws.s3, dynamo: aws.dynamo }),
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
const TAB = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
// Content addresses (sceneAssets.ts).
const MODEL = "a".repeat(64);
const TEXTURE = "b".repeat(64);

let dynamo: FakeDynamoDB;
let s3: FakeS3;
let presigner: FakePresigner;

const publish = (body: unknown, { as = "alice" as string | null, method = "POST" } = {}): Promise<SceneApiResponse> =>
  handlePublishRequest({ method, headers: as ? { authorization: `Bearer ${as}` } : {}, body }, ENV);

const view = (publishId: string, method = "GET"): Promise<SceneApiResponse> => handlePublishedSceneRequest({ method, publishId }, ENV);

const scenes = (method: string, sceneId: string | null, as = "alice", body?: unknown, subresource: "lock" | null = null) =>
  handleScenesRequest({ method, sceneId, subresource, headers: { authorization: `Bearer ${as}` }, body }, ENV);

const createScene = async (as = "alice"): Promise<string> => {
  const response = await scenes("POST", null, as, {});
  return (response.body as { sceneId: string }).sceneId;
};

/** A scene document, told apart by `marker`, whose objects use these imported assets. */
const documentUsing = (marker: string, { models = [] as string[], textures = [] as string[] } = {}) => ({
  format: "libre3d.scene",
  schemaVersion: 4,
  scene: {
    entities: [
      { id: marker },
      ...models.map((assetId, index) => ({ id: `model-${index}`, assetId })),
      ...textures.map((textureAssetId, index) => ({ id: `mesh-${index}`, materialLayers: [{ type: "image", textureAssetId }] })),
    ],
  },
});

/** Saves the scene from an editor tab, as autosave does, with its assets already in the cloud. */
const save = async (sceneId: string, document: ReturnType<typeof documentUsing>, as = "alice") => {
  for (const hash of collectAssetHashes(document.scene.entities)) {
    s3.upload(`users/${as}/assets/${hash}`, "bytes", { checksumSha256: assetHashToBase64(hash) });
  }
  await scenes("POST", sceneId, as, { sessionId: TAB }, "lock");
  const { revision } = ((await scenes("GET", sceneId, as)).body as { scene: { revision: number } }).scene;
  const response = await scenes("PUT", sceneId, as, { document, baseRevision: revision, sessionId: TAB });
  expect(response.status).toBe(200);
};

/** A scene saved once, with `marker` in its document. */
const createSavedScene = async (marker = "first", options: Parameters<typeof documentUsing>[1] = {}, as = "alice") => {
  const sceneId = await createScene(as);
  await save(sceneId, documentUsing(marker, options), as);
  return sceneId;
};

const publishOk = async (sceneId: string, as = "alice"): Promise<string> => {
  const response = await publish({ sceneId }, { as });
  expect(response.status).toBe(200);
  return (response.body as { publishId: string }).publishId;
};

const publishedDocument = (publishId: string) => JSON.parse(s3.objects.get(`scenes/${publishId}.json`) ?? "null");

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

  it("publishes a copy of the scene as last saved, under an ID made on its first publish, with its owner and assets", async () => {
    const sceneId = await createSavedScene("first", { models: [MODEL], textures: [TEXTURE] });

    const response = await publish({ sceneId });

    expect(response).toMatchObject({ status: 200 });
    const { publishId } = response.body as { publishId: string };
    expect(publishId).toMatch(/^[0-9a-f-]{36}$/);
    expect(publishId).not.toBe(sceneId);
    expect(dynamo.getItem("alice", sceneId)?.publishId).toEqual({ S: publishId });
    expect(dynamo.getPublished(publishId)).toEqual({
      sceneId: { S: publishId },
      documentKey: { S: `scenes/${publishId}.json` },
      ownerId: { S: "alice" },
      sourceSceneId: { S: sceneId },
      updatedAt: { S: "2026-10-06T12:00:00.000Z" },
      assetHashes: { SS: [MODEL, TEXTURE] },
    });
    expect(publishedDocument(publishId)).toEqual(documentUsing("first", { models: [MODEL], textures: [TEXTURE] }));
    expect(presigner.signed).toEqual([]);
  });

  it("keeps showing what was published until it's published again, under the same link", async () => {
    const sceneId = await createSavedScene("first");
    const first = await publishOk(sceneId);
    await save(sceneId, documentUsing("second"));

    expect(publishedDocument(first).scene.entities[0].id).toBe("first");

    vi.setSystemTime(new Date("2026-10-06T13:00:00.000Z"));
    const second = await publishOk(sceneId);
    expect(second).toBe(first);
    expect(publishedDocument(first).scene.entities[0].id).toBe("second");
    expect(dynamo.getPublished(first)?.updatedAt).toEqual({ S: "2026-10-06T13:00:00.000Z" });
    expect(dynamo.getPublished(first)).not.toHaveProperty("assetHashes"); // the scene uses none now
  });

  it("refuses (409) a scene that was never saved, changing nothing", async () => {
    const sceneId = await createScene();

    await expect(publish({ sceneId })).resolves.toMatchObject({ status: 409 });
    expect(dynamo.getItem("alice", sceneId)).not.toHaveProperty("publishId");
    expect([...s3.objects.keys()].filter((key) => key.startsWith("scenes/"))).toEqual([]);
  });

  it("ignores a publish ID the client sends: there's no way to name another scene's link", async () => {
    const bobScene = await createSavedScene("bob's", {}, "bob");
    const bobPublishId = await publishOk(bobScene, "bob");
    const aliceScene = await createSavedScene("alice's");

    const response = await publish({ sceneId: aliceScene, publishId: bobPublishId, currentPublishId: bobPublishId });

    expect((response.body as { publishId: string }).publishId).not.toBe(bobPublishId);
    expect(dynamo.getPublished(bobPublishId)?.ownerId).toEqual({ S: "bob" });
    expect(publishedDocument(bobPublishId).scene.entities[0].id).toBe("bob's");
  });

  it("answers 404 for another user's scene or a missing one, and 400 without a scene ID, changing nothing", async () => {
    const bobScene = await createSavedScene("bob's", {}, "bob");

    await expect(publish({ sceneId: bobScene })).resolves.toMatchObject({ status: 404 });
    await expect(publish({ sceneId: MISSING_ID })).resolves.toMatchObject({ status: 404 });

    for (const body of [{}, { sceneId: "../other" }, { sceneId: 42 }, "not json"]) {
      await expect(publish(body)).resolves.toMatchObject({ status: 400 });
    }

    expect(dynamo.getItem("bob", bobScene)).not.toHaveProperty("publishId");
    expect(dynamo.getItem("alice", MISSING_ID)).toBeUndefined();
  });

  it("refuses (409) a published row owned by someone else, writing nothing over it", async () => {
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    const sceneId = await createSavedScene();
    const takenId = "11111111-1111-4111-8111-111111111111";
    // Only reachable if storage were corrupted: the scene's row names a link someone else owns.
    dynamo.putItem("user-scenes", { ...dynamo.getItem("alice", sceneId)!, publishId: { S: takenId } });
    dynamo.putItem("published-scenes", { sceneId: { S: takenId }, documentKey: { S: `scenes/${takenId}.json` }, ownerId: { S: "bob" } });
    s3.upload(`scenes/${takenId}.json`, "bob's scene");

    await expect(publish({ sceneId })).resolves.toMatchObject({ status: 409 });
    expect(dynamo.getPublished(takenId)?.ownerId).toEqual({ S: "bob" });
    expect(s3.objects.get(`scenes/${takenId}.json`)).toBe("bob's scene");
  });

  it("takes away the GLB a scene was published as before scenes were published whole", async () => {
    const sceneId = await createSavedScene();
    const oldId = "22222222-2222-4222-8222-222222222222";
    dynamo.putItem("user-scenes", { ...dynamo.getItem("alice", sceneId)!, publishId: { S: oldId } });
    dynamo.putItem("published-scenes", { sceneId: { S: oldId }, assetKey: { S: `scenes/${oldId}.glb` }, ownerId: { S: "alice" } });
    s3.upload(`scenes/${oldId}.glb`, "glb");

    await expect(publishOk(sceneId)).resolves.toBe(oldId);

    expect(s3.objects.has(`scenes/${oldId}.glb`)).toBe(false);
    expect(dynamo.getPublished(oldId)).not.toHaveProperty("assetKey");
    await expect(view(oldId)).resolves.toMatchObject({ status: 200 });
  });

  it("doesn't need the editing lock: it publishes what's saved, whoever is editing", async () => {
    const sceneId = await createSavedScene();

    await expect(publish({ sceneId })).resolves.toMatchObject({ status: 200 });
  });

  it("accepts the raw JSON string body the Vite middleware passes", async () => {
    const sceneId = await createSavedScene();

    await expect(publish(JSON.stringify({ sceneId }))).resolves.toMatchObject({ status: 200 });
  });

  it("tells the gallery and the editor which scenes are published", async () => {
    const published = await createSavedScene();
    const notPublished = await createScene();
    const publishId = await publishOk(published);

    const list = (await scenes("GET", null)).body as { scenes: { sceneId: string; publishId?: string }[] };
    expect(list.scenes.find((scene) => scene.sceneId === published)?.publishId).toBe(publishId);
    expect(list.scenes.find((scene) => scene.sceneId === notPublished)?.publishId).toBeUndefined();
    await expect(scenes("GET", published)).resolves.toMatchObject({ body: { scene: { publishId } } });
  });

  it("answers an AWS failure with a generic 500 that leaks nothing", async () => {
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    const sceneId = await createSavedScene();
    dynamo.failNextWith = new Error("AccessDenied: arn:aws:iam::123:role/secret");

    await expect(publish({ sceneId })).resolves.toEqual({
      status: 500,
      body: { error: "Something went wrong on the server. Try again." },
      headers: undefined,
    });
  });
});

describe("the public viewer", () => {
  it("gets the published document and a short-lived GET for each asset from its owner's copies, for anyone, uncached", async () => {
    const publishId = await publishOk(await createSavedScene("first", { models: [MODEL], textures: [TEXTURE] }));

    const response = await view(publishId);

    expect(response).toMatchObject({ status: 200, headers: { "Cache-Control": "no-store" } });
    const { document, assets } = response.body as { document: unknown; assets: Record<string, string> };
    expect(document).toEqual(documentUsing("first", { models: [MODEL], textures: [TEXTURE] }));
    expect(Object.keys(assets).sort()).toEqual([MODEL, TEXTURE]);
    expect(presigner.find(assets[MODEL])).toMatchObject({
      operation: "GetObject",
      input: { Bucket: "bucket", Key: `users/alice/assets/${MODEL}` },
      expiresIn: 900,
    });
  });

  it("signs nothing but asset hashes the row lists", async () => {
    const publishId = await publishOk(await createSavedScene("first", { models: [MODEL] }));
    dynamo.putItem("published-scenes", { ...dynamo.getPublished(publishId)!, assetHashes: { SS: [MODEL, "../../scenes/x"] } });

    const { assets } = (await view(publishId)).body as { assets: Record<string, string> };

    expect(Object.keys(assets)).toEqual([MODEL]);
  });

  it("answers 410 for a scene published as a GLB before, so its owner publishes it again", async () => {
    const oldId = "33333333-3333-4333-8333-333333333333";
    dynamo.putItem("published-scenes", { sceneId: { S: oldId }, assetKey: { S: `scenes/${oldId}.glb` }, ownerId: { S: "alice" } });

    await expect(view(oldId)).resolves.toMatchObject({ status: 410, body: { error: expect.stringContaining("publish it again") } });
    expect(presigner.signed).toEqual([]);
  });

  it("answers 404 for an unknown or malformed ID before building any key, and 405 for anything but GET", async () => {
    await expect(view(MISSING_ID)).resolves.toMatchObject({ status: 404 });

    dynamo.failNextWith = new Error("storage must not be reached");
    await expect(view("../users/alice/scenes/x")).resolves.toMatchObject({ status: 404 });
    await expect(view(MISSING_ID, "POST")).resolves.toMatchObject({ status: 405, headers: { Allow: "GET" } });
    expect(presigner.signed).toEqual([]);
  });
});

describe("deleting a published scene", () => {
  it("takes its share link down (row and document) and leaves other published scenes alone", async () => {
    const sceneId = await createSavedScene();
    const otherScene = await createSavedScene("other");
    const publishId = await publishOk(sceneId);
    const otherPublishId = await publishOk(otherScene);

    await expect(scenes("DELETE", sceneId)).resolves.toMatchObject({ status: 200 });

    expect(dynamo.getPublished(publishId)).toBeUndefined();
    expect(s3.objects.has(`scenes/${publishId}.json`)).toBe(false);
    await expect(view(publishId)).resolves.toMatchObject({ status: 404 });
    expect(dynamo.getPublished(otherPublishId)).toBeDefined();
    expect(s3.objects.has(`scenes/${otherPublishId}.json`)).toBe(true);
  });

  it("takes down a GLB from before scenes were published whole too", async () => {
    const sceneId = await createSavedScene();
    const oldId = "44444444-4444-4444-8444-444444444444";
    dynamo.putItem("user-scenes", { ...dynamo.getItem("alice", sceneId)!, publishId: { S: oldId } });
    dynamo.putItem("published-scenes", { sceneId: { S: oldId }, assetKey: { S: `scenes/${oldId}.glb` }, ownerId: { S: "alice" } });
    s3.upload(`scenes/${oldId}.glb`, "glb");

    await expect(scenes("DELETE", sceneId)).resolves.toMatchObject({ status: 200 });

    expect(dynamo.getPublished(oldId)).toBeUndefined();
    expect(s3.objects.has(`scenes/${oldId}.glb`)).toBe(false);
  });

  it("keeps the scene when taking the link down fails, so the delete can be tried again", async () => {
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    const sceneId = await createSavedScene();
    const publishId = await publishOk(sceneId);
    s3.failNext = { command: DeleteObjectCommand, error: new Error("S3 is down") };

    await expect(scenes("DELETE", sceneId)).resolves.toMatchObject({ status: 500 });
    expect(dynamo.getItem("alice", sceneId)).toBeDefined();

    await expect(scenes("DELETE", sceneId)).resolves.toMatchObject({ status: 200 });
    expect(s3.objects.has(`scenes/${publishId}.json`)).toBe(false);
  });

  it("never deletes a published row someone else owns", async () => {
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    const sceneId = await createScene();
    const takenId = "11111111-1111-4111-8111-111111111111";
    dynamo.putItem("user-scenes", { ...dynamo.getItem("alice", sceneId)!, publishId: { S: takenId } });
    dynamo.putItem("published-scenes", { sceneId: { S: takenId }, documentKey: { S: `scenes/${takenId}.json` }, ownerId: { S: "bob" } });
    s3.upload(`scenes/${takenId}.json`, "bob's scene");

    await expect(scenes("DELETE", sceneId)).resolves.toMatchObject({ status: 200 });

    expect(dynamo.getPublished(takenId)?.ownerId).toEqual({ S: "bob" });
    expect(s3.objects.has(`scenes/${takenId}.json`)).toBe(true);
  });
});
