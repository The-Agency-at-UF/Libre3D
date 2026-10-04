import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { HeadObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";

import { FakeDynamoDB, FakePresigner, FakeS3 } from "../testing/fakeAws";
import { handleScenesRequest, type SceneApiResponse, type SceneSubresource } from "./awsSceneHandler";
import { assetHashToBase64 } from "./sceneAssets";

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

// The real check is covered in verifyAuth.test.ts. Here `Bearer <name>` signs in as user `<name>`,
// so tests can act as two different people.
vi.mock("./verifyAuth.js", () => ({
  verifyAuth: async (headers: Record<string, string | undefined>) =>
    headers.authorization?.startsWith("Bearer ")
      ? { authorized: true, userId: headers.authorization.slice("Bearer ".length) }
      : { authorized: false, status: 401, error: "You need to be signed in to do that." },
}));

const ENV = { AWS_REGION: "us-east-2", S3_BUCKET_NAME: "bucket", USER_SCENES_TABLE_NAME: "user-scenes" };

let dynamo: FakeDynamoDB;
let s3: FakeS3;
let presigner: FakePresigner;

interface Call {
  sceneId?: string | null;
  lock?: boolean;
  subresource?: SceneSubresource;
  as?: string | null;
  body?: unknown;
}

const call = (method: string, { sceneId = null, lock = false, subresource, as = "alice", body }: Call = {}): Promise<SceneApiResponse> =>
  handleScenesRequest(
    {
      method,
      sceneId,
      subresource: lock ? "lock" : (subresource ?? null),
      headers: as ? { authorization: `Bearer ${as}` } : {},
      body,
    },
    ENV,
  );

// Editor sessions: one per browser tab.
const TAB_A = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
const TAB_B = "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb";

const sceneDocument = (marker: string) => ({ format: "libre3d.scene", schemaVersion: 1, scene: { entities: [{ id: marker }] } });

const createScene = async (body: unknown = {}, as = "alice"): Promise<string> => {
  const response = await call("POST", { body, as });
  expect(response.status).toBe(201);
  return (response.body as { sceneId: string }).sceneId;
};

const claim = (sceneId: string, { session = TAB_A, takeOver, as = "alice" }: { session?: string; takeOver?: boolean; as?: string } = {}) =>
  call("POST", { sceneId, lock: true, as, body: { sessionId: session, ...(takeOver === undefined ? {} : { takeOver }) } });

const release = (sceneId: string, { session = TAB_A, as = "alice" }: { session?: string; as?: string } = {}) =>
  call("DELETE", { sceneId, lock: true, as, body: { sessionId: session } });

/** A scene opened for editing in tab A, as the editor does when it opens one. */
const createLockedScene = async (body: unknown = {}, as = "alice"): Promise<string> => {
  const sceneId = await createScene(body, as);
  await expect(claim(sceneId, { as })).resolves.toMatchObject({ status: 200 });
  return sceneId;
};

const save = (sceneId: string, marker: string, baseRevision: number, { as = "alice", session = TAB_A } = {}) =>
  call("PUT", { sceneId, as, body: { document: sceneDocument(marker), baseRevision, sessionId: session } });

const lockExpiresAt = (sceneId: string, userId = "alice") => Number(dynamo.getItem(userId, sceneId)?.lockExpiresAt?.N);

// Content addresses (sceneAssets.ts). Their bytes don't matter here, only that S3 holds them under
// their hash's checksum.
const MODEL = "a".repeat(64);
const TEXTURE = "b".repeat(64);
const OTHER = "c".repeat(64);

/** An asset the browser uploaded through its presigned PUT: S3 checked its bytes against the hash. */
const storeAsset = (hash: string, { as = "alice", contentLength }: { as?: string; contentLength?: number } = {}) =>
  s3.upload(`users/${as}/assets/${hash}`, "bytes", { checksumSha256: assetHashToBase64(hash), contentLength });

/** A scene document whose entities use these models and textures. */
const documentUsing = (marker: string, { models = [] as string[], textures = [] as string[] } = {}) => ({
  ...sceneDocument(marker),
  scene: {
    entities: [
      { id: marker },
      ...models.map((assetId, index) => ({ id: `model-${index}`, assetId })),
      ...textures.map((textureAssetId, index) => ({
        id: `mesh-${index}`,
        materialLayers: [{ type: "image", textureAssetId }],
      })),
    ],
  },
});

const saveDocument = (sceneId: string, document: unknown, baseRevision: number, { as = "alice", session = TAB_A } = {}) =>
  call("PUT", { sceneId, as, body: { document, baseRevision, sessionId: session } });

const requestUploads = (sceneId: string, assets: unknown, { session = TAB_A, as = "alice" } = {}) =>
  call("POST", { sceneId, subresource: "assets/uploads", as, body: { sessionId: session, assets } });

const requestDownloads = (sceneId: string, hashes: unknown, { as = "alice" } = {}) =>
  call("POST", { sceneId, subresource: "assets/downloads", as, body: { hashes } });

const assetHashesOf = (sceneId: string, userId = "alice") => dynamo.getItem(userId, sceneId)?.assetHashes?.SS;

const objectsOf = (userId: string, sceneId: string) => s3.keysUnder(`users/${userId}/scenes/${sceneId}.`);

beforeEach(() => {
  dynamo = new FakeDynamoDB();
  s3 = new FakeS3();
  presigner = new FakePresigner();
  aws.dynamo = dynamo;
  aws.s3 = s3;
  aws.presigner = presigner;
  vi.useFakeTimers({ toFake: ["Date"] });
  vi.setSystemTime(new Date("2026-10-03T12:00:00.000Z"));
});

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe("routing and auth", () => {
  it.each<[string, string | null, boolean, string, string, SceneSubresource?]>([
    ["the collection", null, false, "DELETE", "GET, POST"],
    ["a scene", "00000000-0000-4000-8000-000000000000", false, "POST", "GET, PUT, PATCH, DELETE"],
    ["a scene's lock", "00000000-0000-4000-8000-000000000000", true, "GET", "POST, DELETE"],
    ["a scene's asset uploads", "00000000-0000-4000-8000-000000000000", false, "GET", "POST", "assets/uploads"],
    ["a scene's asset downloads", "00000000-0000-4000-8000-000000000000", false, "PUT", "POST", "assets/downloads"],
  ])("answers an unsupported method on %s with 405 and Allow", async (_label, sceneId, lock, method, allow, subresource) => {
    const response = await call(method, { sceneId, lock, subresource });

    expect(response.status).toBe(405);
    expect(response.headers).toEqual({ Allow: allow });
  });

  it("rejects a signed-out request before touching storage", async () => {
    dynamo.failNextWith = new Error("storage must not be reached");

    await expect(call("GET", { as: null })).resolves.toMatchObject({ status: 401 });
  });

  it("treats a scene ID that isn't a UUID as not found, before building any S3 key from it", async () => {
    await expect(call("GET", { sceneId: "../../other-user" })).resolves.toMatchObject({ status: 404 });
  });

  it("answers an AWS failure with a generic 500 that leaks nothing", async () => {
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    dynamo.failNextWith = new Error("AccessDenied: arn:aws:iam::123:role/secret");

    const response = await call("GET");

    expect(response).toEqual({ status: 500, body: { error: "Something went wrong on the server. Try again." }, headers: undefined });
  });
});

describe("create and list", () => {
  it("creates an empty scene (revision 0, no document) and lists it", async () => {
    const sceneId = await createScene();

    expect(sceneId).toMatch(/^[0-9a-f-]{36}$/);
    await expect(call("GET", { sceneId })).resolves.toMatchObject({
      status: 200,
      body: { scene: { sceneId, name: "Untitled scene", revision: 0, updatedAt: "2026-10-03T12:00:00.000Z" }, document: null },
    });
    await expect(call("GET")).resolves.toMatchObject({ body: { scenes: [{ sceneId, name: "Untitled scene" }] } });
    expect(objectsOf("alice", sceneId)).toEqual([]);
  });

  it("trims a given name and caps it at 120 characters", async () => {
    const trimmed = await createScene({ name: "  Orbit study  " });
    const capped = await createScene({ name: "x".repeat(200) });

    expect(dynamo.getItem("alice", trimmed)?.name).toEqual({ S: "Orbit study" });
    expect(dynamo.getItem("alice", capped)?.name?.S).toHaveLength(120);
  });

  it("creates a scene with a document (the pre-cloud upload) at revision 1", async () => {
    const sceneId = await createScene({ document: sceneDocument("legacy") });

    await expect(call("GET", { sceneId })).resolves.toMatchObject({
      body: { scene: { revision: 1 }, document: sceneDocument("legacy") },
    });
    expect(objectsOf("alice", sceneId)).toHaveLength(1);
  });

  it("rejects an invalid document on create without writing a row or an object", async () => {
    const response = await call("POST", { body: { document: { not: "a scene" } } });

    expect(response.status).toBe(400);
    expect(dynamo.items.size).toBe(0);
    expect(s3.objects.size).toBe(0);
  });

  it("lists only the caller's scenes, newest first, across result pages", async () => {
    const created: string[] = [];

    for (let minute = 0; minute < 5; minute += 1) {
      vi.setSystemTime(new Date(`2026-10-03T12:0${minute}:00.000Z`));
      created.push(await createScene({ name: `Scene ${minute}` }));
    }

    await createScene({ name: "Bob's scene" }, "bob");

    const response = await call("GET");
    const scenes = (response.body as { scenes: { sceneId: string; name: string }[] }).scenes;

    expect(scenes.map((scene) => scene.name)).toEqual(["Scene 4", "Scene 3", "Scene 2", "Scene 1", "Scene 0"]);
    expect(scenes.map((scene) => scene.sceneId)).toEqual([...created].reverse());
  });

  it("files the scene under the signed-in user, whatever the body claims", async () => {
    const sceneId = await createScene({ userId: "bob", name: "Mine" });

    expect(dynamo.getItem("alice", sceneId)).toBeDefined();
    expect(dynamo.getItem("bob", sceneId)).toBeUndefined();
  });

  it("accepts the raw JSON string body the Vite middleware passes", async () => {
    const sceneId = await createScene(JSON.stringify({ name: "From Vite" }));

    expect(dynamo.getItem("alice", sceneId)?.name).toEqual({ S: "From Vite" });
  });
});

describe("save", () => {
  it("saves on top of the current revision, bumps it, and keeps exactly one document object", async () => {
    const sceneId = await createLockedScene();

    vi.setSystemTime(new Date("2026-10-03T12:05:00.000Z"));
    await expect(save(sceneId, "first", 0)).resolves.toEqual({
      status: 200,
      body: { revision: 1, updatedAt: "2026-10-03T12:05:00.000Z" },
      headers: undefined,
    });
    await expect(save(sceneId, "second", 1)).resolves.toMatchObject({ status: 200, body: { revision: 2 } });

    await expect(call("GET", { sceneId })).resolves.toMatchObject({
      body: { scene: { revision: 2, updatedAt: "2026-10-03T12:05:00.000Z" }, document: sceneDocument("second") },
    });
    expect(objectsOf("alice", sceneId)).toHaveLength(1);
    expect(dynamo.getItem("alice", sceneId)?.schemaVersion).toEqual({ N: "1" });
  });

  it("refuses a save based on an old revision (409), keeps the newer document, and cleans up its own object", async () => {
    const sceneId = await createLockedScene();
    await save(sceneId, "newer", 0);

    // Same session, stale revision: e.g. an autosaver that missed the save before it.
    const stale = await save(sceneId, "stale", 0);

    expect(stale).toMatchObject({ status: 409, body: { revision: 1 } });
    await expect(call("GET", { sceneId })).resolves.toMatchObject({ body: { document: sceneDocument("newer") } });
    expect(objectsOf("alice", sceneId)).toHaveLength(1);
  });

  it("answers 404 for a scene deleted in the meantime, without leaving an object behind", async () => {
    const sceneId = await createLockedScene();
    await call("DELETE", { sceneId });

    await expect(save(sceneId, "too late", 0)).resolves.toMatchObject({ status: 404 });
    expect(objectsOf("alice", sceneId)).toEqual([]);
  });

  it.each([
    ["no baseRevision", { document: sceneDocument("x") }],
    ["a negative baseRevision", { document: sceneDocument("x"), baseRevision: -1 }],
    ["a fractional baseRevision", { document: sceneDocument("x"), baseRevision: 0.5 }],
    ["no document", { baseRevision: 0 }],
    ["a document in another format", { document: { format: "gltf", schemaVersion: 1 }, baseRevision: 0 }],
  ])("rejects %s with 400", async (_label, body) => {
    const sceneId = await createLockedScene();

    await expect(call("PUT", { sceneId, body: { ...body, sessionId: TAB_A } })).resolves.toMatchObject({ status: 400 });
    expect(objectsOf("alice", sceneId)).toEqual([]);
  });

  it("rejects a document over 2 MB with 413", async () => {
    const sceneId = await createLockedScene();
    const huge = { ...sceneDocument("big"), padding: "x".repeat(2 * 1024 * 1024) };

    await expect(call("PUT", { sceneId, body: { document: huge, baseRevision: 0, sessionId: TAB_A } })).resolves.toMatchObject({
      status: 413,
    });
    expect(objectsOf("alice", sceneId)).toEqual([]);
  });

  it("leaves the scene as it was when writing the document fails", async () => {
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    const sceneId = await createLockedScene();
    await save(sceneId, "kept", 0);
    s3.failNext = { command: PutObjectCommand, error: new Error("S3 is down") };

    await expect(save(sceneId, "lost", 1)).resolves.toMatchObject({ status: 500 });
    await expect(call("GET", { sceneId })).resolves.toMatchObject({
      body: { scene: { revision: 1 }, document: sceneDocument("kept") },
    });
  });
});

describe("open, rename, delete", () => {
  it("reports a row whose document object is missing, rather than opening an empty scene", async () => {
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    const sceneId = await createLockedScene();
    await save(sceneId, "doc", 0);
    s3.objects.clear();

    await expect(call("GET", { sceneId })).resolves.toMatchObject({ status: 500 });
  });

  it("renames without touching the revision, updatedAt, or the document", async () => {
    const sceneId = await createLockedScene();
    await save(sceneId, "doc", 0);
    const objectsBefore = objectsOf("alice", sceneId);
    vi.setSystemTime(new Date("2026-10-04T09:00:00.000Z"));

    await expect(call("PATCH", { sceneId, body: { name: "  Renamed  " } })).resolves.toMatchObject({
      status: 200,
      body: { name: "Renamed" },
    });
    await expect(call("GET", { sceneId })).resolves.toMatchObject({
      body: { scene: { name: "Renamed", revision: 1, updatedAt: "2026-10-03T12:00:00.000Z" } },
    });
    expect(objectsOf("alice", sceneId)).toEqual(objectsBefore);
  });

  it("rejects a blank name (400) and a missing scene (404) on rename", async () => {
    const sceneId = await createScene();

    await expect(call("PATCH", { sceneId, body: { name: "   " } })).resolves.toMatchObject({ status: 400 });
    await expect(
      call("PATCH", { sceneId: "00000000-0000-4000-8000-000000000000", body: { name: "Nope" } }),
    ).resolves.toMatchObject({ status: 404 });
  });

  it("deletes the row and every object under the scene's prefix, and nothing else", async () => {
    const sceneId = await createLockedScene();
    const otherSceneId = await createLockedScene();
    await save(sceneId, "doc", 0);
    await save(otherSceneId, "other", 0);
    s3.objects.set(`users/alice/scenes/${sceneId}.thumb.webp`, "thumbnail");
    s3.objects.set(`users/alice/scenes/${sceneId}.stray-1.json`, "{}");

    await expect(call("DELETE", { sceneId })).resolves.toMatchObject({ status: 200 });

    expect(dynamo.getItem("alice", sceneId)).toBeUndefined();
    expect(objectsOf("alice", sceneId)).toEqual([]);
    expect(objectsOf("alice", otherSceneId)).toHaveLength(1);
    await expect(call("DELETE", { sceneId })).resolves.toMatchObject({ status: 404 });
  });
});

describe("ownership", () => {
  it("never lets one user open, save, rename, delete, lock, or upload to another user's scene", async () => {
    const sceneId = await createLockedScene({ name: "Alice's" });
    await save(sceneId, "alice's work", 0);

    await expect(call("GET", { sceneId, as: "bob" })).resolves.toMatchObject({ status: 404 });
    // Even with Alice's tab's session ID, which a save body could carry.
    await expect(save(sceneId, "bob was here", 1, { as: "bob" })).resolves.toMatchObject({ status: 404 });
    await expect(call("PATCH", { sceneId, as: "bob", body: { name: "Bob's now" } })).resolves.toMatchObject({ status: 404 });
    await expect(claim(sceneId, { as: "bob", session: TAB_B, takeOver: true })).resolves.toMatchObject({ status: 404 });
    await expect(release(sceneId, { as: "bob" })).resolves.toMatchObject({ status: 200, body: { released: false } });
    await expect(call("DELETE", { sceneId, as: "bob" })).resolves.toMatchObject({ status: 404 });
    await expect(requestUploads(sceneId, [{ hash: MODEL, size: 10, kind: "model" }], { as: "bob" })).resolves.toMatchObject({
      status: 404,
    });
    await expect(requestDownloads(sceneId, [MODEL], { as: "bob" })).resolves.toMatchObject({ status: 404 });
    expect(presigner.signed).toEqual([]);

    await expect(call("GET", { sceneId })).resolves.toMatchObject({
      body: { scene: { name: "Alice's", revision: 1 }, document: sceneDocument("alice's work") },
    });
    expect(dynamo.getItem("alice", sceneId)?.lockHolder).toEqual({ S: TAB_A });
    expect(s3.keysUnder("users/bob/")).toEqual([]);
    expect(dynamo.getItem("bob", sceneId)).toBeUndefined();
  });
});

describe("editing lock", () => {
  const NOW = Date.parse("2026-10-03T12:00:00.000Z");

  it("claims a free lock for 60 s, records who holds it, and returns the scene's revision", async () => {
    const sceneId = await createScene({ document: sceneDocument("doc") });

    await expect(claim(sceneId)).resolves.toEqual({ status: 200, body: { revision: 1 }, headers: undefined });
    expect(dynamo.getItem("alice", sceneId)).toMatchObject({
      lockHolder: { S: TAB_A },
      lockUserId: { S: "alice" },
      lockExpiresAt: { N: String(NOW + 60_000) },
    });
  });

  it("renews the holder's lease (the heartbeat, or a reload of the same tab)", async () => {
    const sceneId = await createLockedScene();
    vi.setSystemTime(NOW + 20_000);

    await expect(claim(sceneId)).resolves.toMatchObject({ status: 200 });
    expect(lockExpiresAt(sceneId)).toBe(NOW + 80_000);
  });

  it("refuses another session while the lease runs (423, with the revision), and lets it in once it lapses", async () => {
    const sceneId = await createLockedScene();
    await save(sceneId, "doc", 0);

    await expect(claim(sceneId, { session: TAB_B })).resolves.toEqual({
      status: 423,
      body: { error: "This scene is open somewhere else.", revision: 1, heldByYou: true },
      headers: undefined,
    });

    vi.setSystemTime(NOW + 60_000);
    await expect(claim(sceneId, { session: TAB_B })).resolves.toMatchObject({ status: 423 });

    vi.setSystemTime(NOW + 60_001);
    await expect(claim(sceneId, { session: TAB_B })).resolves.toMatchObject({ status: 200, body: { revision: 1 } });
    expect(dynamo.getItem("alice", sceneId)?.lockHolder).toEqual({ S: TAB_B });
  });

  it("moves a held lock on take-over; the old holder's saves and renewals are then refused", async () => {
    const sceneId = await createLockedScene();

    await expect(claim(sceneId, { session: TAB_B, takeOver: true })).resolves.toMatchObject({ status: 200 });

    await expect(save(sceneId, "from the old tab", 0)).resolves.toMatchObject({ status: 423, body: { revision: 0 } });
    await expect(claim(sceneId)).resolves.toMatchObject({ status: 423 });
    await expect(save(sceneId, "from the new tab", 0, { session: TAB_B })).resolves.toMatchObject({ status: 200 });
  });

  it("frees the scene when the holder releases it, and ignores a release from anyone else", async () => {
    const sceneId = await createLockedScene();

    await expect(release(sceneId, { session: TAB_B })).resolves.toEqual({
      status: 200,
      body: { released: false },
      headers: undefined,
    });
    expect(dynamo.getItem("alice", sceneId)?.lockHolder).toEqual({ S: TAB_A });

    await expect(release(sceneId)).resolves.toMatchObject({ status: 200, body: { released: true } });
    const row = dynamo.getItem("alice", sceneId);
    expect(row?.lockHolder).toBeUndefined();
    expect(row?.lockUserId).toBeUndefined();
    expect(row?.lockExpiresAt).toBeUndefined();
    await expect(claim(sceneId, { session: TAB_B })).resolves.toMatchObject({ status: 200 });
  });

  it("answers 404 for a missing scene, and a quiet no-op for releasing one", async () => {
    const missing = "00000000-0000-4000-8000-000000000000";

    await expect(claim(missing)).resolves.toMatchObject({ status: 404 });
    await expect(claim(missing, { takeOver: true })).resolves.toMatchObject({ status: 404 });
    await expect(release(missing)).resolves.toMatchObject({ status: 200, body: { released: false } });
    expect(dynamo.items.size).toBe(0);
  });

  it.each([
    ["no sessionId", {}],
    ["a sessionId that isn't a UUID", { sessionId: "tab-1" }],
  ])("rejects a claim or release with %s (400)", async (_label, body) => {
    const sceneId = await createScene();

    await expect(call("POST", { sceneId, lock: true, body })).resolves.toMatchObject({ status: 400 });
    await expect(call("DELETE", { sceneId, lock: true, body })).resolves.toMatchObject({ status: 400 });
    expect(dynamo.getItem("alice", sceneId)?.lockHolder).toBeUndefined();
  });

  it("accepts the raw JSON string body the Vite middleware passes", async () => {
    const sceneId = await createScene();

    await expect(call("POST", { sceneId, lock: true, body: JSON.stringify({ sessionId: TAB_A }) })).resolves.toMatchObject({
      status: 200,
    });
  });
});

describe("saving under the lock", () => {
  const NOW = Date.parse("2026-10-03T12:00:00.000Z");

  it("refuses a save from a session that doesn't hold the lock (423), leaving the document and no stray object", async () => {
    const sceneId = await createLockedScene();
    await save(sceneId, "kept", 0);

    await expect(save(sceneId, "from the read-only tab", 1, { session: TAB_B })).resolves.toEqual({
      status: 423,
      body: { error: "This scene is open somewhere else.", revision: 1, heldByYou: true },
      headers: undefined,
    });
    await expect(call("GET", { sceneId })).resolves.toMatchObject({ body: { scene: { revision: 1 }, document: sceneDocument("kept") } });
    expect(objectsOf("alice", sceneId)).toHaveLength(1);
  });

  it("refuses a save to a scene nobody has claimed (423)", async () => {
    const sceneId = await createScene();

    await expect(save(sceneId, "unclaimed", 0)).resolves.toMatchObject({ status: 423 });
    expect(objectsOf("alice", sceneId)).toEqual([]);
  });

  it("checks the lock before the revision, so a read-only tab is told it's read-only, not that it's stale", async () => {
    const sceneId = await createLockedScene();
    await save(sceneId, "doc", 0);

    await expect(save(sceneId, "stale and unlocked", 0, { session: TAB_B })).resolves.toMatchObject({ status: 423 });
  });

  it("answers a save with no sessionId (a tab from before the lock) with 409, so it offers Reload", async () => {
    const sceneId = await createLockedScene();

    await expect(
      call("PUT", { sceneId, body: { document: sceneDocument("old client"), baseRevision: 0 } }),
    ).resolves.toMatchObject({ status: 409, body: { error: "Reload the page to keep editing this scene." } });
    expect(objectsOf("alice", sceneId)).toEqual([]);
  });

  it("renews the lease on every save", async () => {
    const sceneId = await createLockedScene();
    vi.setSystemTime(NOW + 45_000);

    await save(sceneId, "doc", 0);

    expect(lockExpiresAt(sceneId)).toBe(NOW + 105_000);
  });

  it("still accepts the holder's save after its lease lapsed, as long as nobody else claimed the scene", async () => {
    const sceneId = await createLockedScene();
    vi.setSystemTime(NOW + 5 * 60_000);

    await expect(save(sceneId, "after a sleep", 0)).resolves.toMatchObject({ status: 200, body: { revision: 1 } });
    expect(lockExpiresAt(sceneId)).toBe(NOW + 6 * 60_000);
  });
});

describe("asset uploads", () => {
  const NOW = Date.parse("2026-10-03T12:00:00.000Z");

  it("signs a PUT only for assets the cloud doesn't have, with size, type, and checksum as signed headers", async () => {
    const sceneId = await createLockedScene();
    storeAsset(TEXTURE);

    const response = await requestUploads(sceneId, [
      { hash: MODEL, size: 1234, kind: "model" },
      { hash: TEXTURE, size: 99, kind: "texture" },
      { hash: OTHER, size: 56, kind: "texture" },
      { hash: MODEL, size: 1234, kind: "model" },
    ]);

    expect(response.status).toBe(200);
    const { uploads } = response.body as { uploads: Array<{ hash: string; url: string; headers: Record<string, string> }> };
    expect(uploads.map((upload) => upload.hash)).toEqual([MODEL, OTHER]);
    expect(uploads[0].headers).toEqual({ "Content-Type": "model/gltf-binary", "x-amz-checksum-sha256": assetHashToBase64(MODEL) });
    expect(uploads[1].headers).toEqual({ "Content-Type": "image/png", "x-amz-checksum-sha256": assetHashToBase64(OTHER) });
    expect(presigner.find(uploads[0].url)).toEqual({
      url: uploads[0].url,
      operation: "PutObject",
      input: {
        Bucket: "bucket",
        Key: `users/alice/assets/${MODEL}`,
        ContentType: "model/gltf-binary",
        ContentLength: 1234,
        ChecksumSHA256: assetHashToBase64(MODEL),
      },
      expiresIn: 900,
      // Without these, S3 accepts another size, and the checksum isn't checked against the body.
      signableHeaders: ["content-length", "content-type"],
      unhoistableHeaders: ["x-amz-checksum-sha256"],
    });
    expect(presigner.signed).toHaveLength(2);
  });

  it("answers with no uploads when the cloud has everything", async () => {
    const sceneId = await createLockedScene();
    storeAsset(MODEL);

    await expect(requestUploads(sceneId, [{ hash: MODEL, size: 5, kind: "model" }])).resolves.toMatchObject({
      status: 200,
      body: { uploads: [] },
    });
  });

  it("treats an object that doesn't match its address as missing, so it gets replaced", async () => {
    const sceneId = await createLockedScene();
    s3.upload(`users/alice/assets/${MODEL}`, "no checksum");
    s3.upload(`users/alice/assets/${TEXTURE}`, "wrong checksum", { checksumSha256: assetHashToBase64(OTHER) });
    storeAsset(OTHER, { contentLength: 100 * 1024 * 1024 + 1 });

    const response = await requestUploads(sceneId, [
      { hash: MODEL, size: 5, kind: "model" },
      { hash: TEXTURE, size: 5, kind: "texture" },
      { hash: OTHER, size: 5, kind: "texture" },
    ]);

    expect((response.body as { uploads: Array<{ hash: string }> }).uploads.map((upload) => upload.hash)).toEqual([MODEL, TEXTURE, OTHER]);
  });

  it("refuses a session without the lock (423) and a scene nobody claimed, signing nothing", async () => {
    const sceneId = await createLockedScene();
    const unclaimedId = await createScene();
    const asset = [{ hash: MODEL, size: 5, kind: "model" }];

    await expect(requestUploads(sceneId, asset, { session: TAB_B })).resolves.toMatchObject({
      status: 423,
      body: { error: "This scene is open somewhere else.", heldByYou: true },
    });
    await expect(requestUploads(unclaimedId, asset)).resolves.toMatchObject({ status: 423 });
    await expect(requestUploads("00000000-0000-4000-8000-000000000000", asset)).resolves.toMatchObject({ status: 404 });
    expect(presigner.signed).toEqual([]);
  });

  it("renews the lease, like a save", async () => {
    const sceneId = await createLockedScene();
    vi.setSystemTime(NOW + 45_000);

    await requestUploads(sceneId, [{ hash: MODEL, size: 5, kind: "model" }]);

    expect(lockExpiresAt(sceneId)).toBe(NOW + 105_000);
  });

  it.each([
    ["no assets", []],
    ["more than 100 assets", Array.from({ length: 101 }, () => ({ hash: MODEL, size: 5, kind: "model" }))],
    ["an uppercase hash", [{ hash: MODEL.toUpperCase(), size: 5, kind: "model" }]],
    ["an ID from before cloud assets", [{ hash: "asset-m1abc2-x9y8z7", size: 5, kind: "model" }]],
    ["a path in place of a hash", [{ hash: `../${MODEL.slice(3)}`, size: 5, kind: "model" }]],
    ["an empty file", [{ hash: MODEL, size: 0, kind: "model" }]],
    ["a fractional size", [{ hash: MODEL, size: 1.5, kind: "model" }]],
    ["an unknown kind", [{ hash: MODEL, size: 5, kind: "audio" }]],
    ["something that isn't an asset", [null]],
  ])("rejects %s with 400", async (_label, assets) => {
    const sceneId = await createLockedScene();

    await expect(requestUploads(sceneId, assets)).resolves.toMatchObject({ status: 400 });
    expect(presigner.signed).toEqual([]);
  });

  it("rejects a file over 100 MB with 413, and a request without a session ID with 400", async () => {
    const sceneId = await createLockedScene();

    await expect(requestUploads(sceneId, [{ hash: MODEL, size: 100 * 1024 * 1024 + 1, kind: "model" }])).resolves.toMatchObject({
      status: 413,
      body: { hash: MODEL },
    });
    await expect(
      call("POST", { sceneId, subresource: "assets/uploads", body: { assets: [{ hash: MODEL, size: 5, kind: "model" }] } }),
    ).resolves.toMatchObject({ status: 400 });
    expect(presigner.signed).toEqual([]);
  });
});

describe("saving a scene's assets", () => {
  it("refuses a save naming an asset the cloud doesn't have (422, listing it), leaving the scene as it was", async () => {
    const sceneId = await createLockedScene();
    await save(sceneId, "kept", 0);
    storeAsset(MODEL);

    await expect(saveDocument(sceneId, documentUsing("new", { models: [MODEL], textures: [TEXTURE] }), 1)).resolves.toEqual({
      status: 422,
      body: { error: "Some of this scene's imported files haven't been uploaded yet.", missingAssets: [TEXTURE] },
      headers: undefined,
    });
    await expect(call("GET", { sceneId })).resolves.toMatchObject({ body: { scene: { revision: 1 }, document: sceneDocument("kept") } });
    expect(objectsOf("alice", sceneId)).toHaveLength(1);
  });

  it("saves once the assets are in the cloud, and records them on the row", async () => {
    const sceneId = await createLockedScene();
    storeAsset(MODEL);
    storeAsset(TEXTURE);

    await expect(saveDocument(sceneId, documentUsing("doc", { models: [MODEL], textures: [TEXTURE, MODEL] }), 0)).resolves.toMatchObject({
      status: 200,
      body: { revision: 1 },
    });
    expect(assetHashesOf(sceneId)).toEqual([MODEL, TEXTURE]);
  });

  it("checks only the assets that are new since the last save", async () => {
    const sceneId = await createLockedScene();
    storeAsset(MODEL);
    await saveDocument(sceneId, documentUsing("first", { models: [MODEL] }), 0);
    const heads = vi.spyOn(s3, "send");

    await expect(saveDocument(sceneId, documentUsing("second", { models: [MODEL] }), 1)).resolves.toMatchObject({ status: 200 });
    expect(heads.mock.calls.filter(([command]) => command instanceof HeadObjectCommand)).toHaveLength(0);

    await expect(saveDocument(sceneId, documentUsing("third", { models: [MODEL, OTHER] }), 2)).resolves.toMatchObject({
      status: 422,
      body: { missingAssets: [OTHER] },
    });
  });

  it("drops the row's asset list once the scene uses none, and leaves IDs from before cloud assets alone", async () => {
    const sceneId = await createLockedScene();
    storeAsset(MODEL);
    await saveDocument(sceneId, documentUsing("with", { models: [MODEL] }), 0);

    await expect(saveDocument(sceneId, documentUsing("old ids", { models: ["asset-old"], textures: ["texture-old"] }), 1)).resolves.toMatchObject({
      status: 200,
    });
    expect(dynamo.getItem("alice", sceneId)).not.toHaveProperty("assetHashes");
  });

  it("tells a tab without the lock it's read-only before looking at assets", async () => {
    const sceneId = await createLockedScene();
    const sends = vi.spyOn(s3, "send");

    await expect(saveDocument(sceneId, documentUsing("x", { models: [MODEL] }), 0, { session: TAB_B })).resolves.toMatchObject({
      status: 423,
    });
    expect(sends).not.toHaveBeenCalled();
  });

  it("rejects a scene using more than 500 assets with 413", async () => {
    const sceneId = await createLockedScene();
    const hashes = Array.from({ length: 501 }, (_unused, index) => index.toString(16).padStart(64, "0"));

    await expect(saveDocument(sceneId, documentUsing("big", { models: hashes }), 0)).resolves.toMatchObject({ status: 413 });
  });

  it("applies the same rule to a scene created with a document", async () => {
    await expect(call("POST", { body: { document: documentUsing("legacy", { models: [MODEL] }) } })).resolves.toMatchObject({
      status: 422,
      body: { missingAssets: [MODEL] },
    });
    expect(dynamo.items.size).toBe(0);
    expect(s3.keysUnder("users/alice/scenes/")).toEqual([]);

    storeAsset(MODEL);
    const sceneId = await createScene({ document: documentUsing("legacy", { models: [MODEL] }) });
    expect(assetHashesOf(sceneId)).toEqual([MODEL]);
  });

  it("keeps a scene's assets when the scene is deleted: other scenes may use them", async () => {
    const sceneId = await createLockedScene();
    storeAsset(MODEL);
    await saveDocument(sceneId, documentUsing("doc", { models: [MODEL] }), 0);

    await call("DELETE", { sceneId });

    expect(s3.keysUnder("users/alice/assets/")).toEqual([`users/alice/assets/${MODEL}`]);
  });
});

describe("asset downloads", () => {
  it("signs a GET for each requested asset the scene's saved document uses, and lists the rest as unavailable", async () => {
    const sceneId = await createLockedScene();
    storeAsset(MODEL);
    storeAsset(TEXTURE);
    // TEXTURE is Alice's, but this scene doesn't use it.
    await saveDocument(sceneId, documentUsing("doc", { models: [MODEL] }), 0);

    const response = await requestDownloads(sceneId, [MODEL, TEXTURE, MODEL]);

    expect(response.status).toBe(200);
    const body = response.body as { downloads: Array<{ hash: string; url: string }>; unavailable: string[] };
    expect(body.downloads.map((download) => download.hash)).toEqual([MODEL]);
    expect(body.unavailable).toEqual([TEXTURE]);
    expect(presigner.find(body.downloads[0].url)).toMatchObject({
      operation: "GetObject",
      input: { Bucket: "bucket", Key: `users/alice/assets/${MODEL}` },
      expiresIn: 900,
    });
  });

  it("doesn't need the lock: view-only tabs download too", async () => {
    const sceneId = await createLockedScene();
    storeAsset(MODEL);
    await saveDocument(sceneId, documentUsing("doc", { models: [MODEL] }), 0);
    await claim(sceneId, { session: TAB_B });

    await expect(requestDownloads(sceneId, [MODEL])).resolves.toMatchObject({ status: 200, body: { unavailable: [] } });
  });

  it("answers 404 for a missing scene, and 400 for a malformed list", async () => {
    const sceneId = await createLockedScene();

    await expect(requestDownloads("00000000-0000-4000-8000-000000000000", [MODEL])).resolves.toMatchObject({ status: 404 });

    for (const hashes of [[], undefined, ["asset-old"], [MODEL.toUpperCase()], Array.from({ length: 101 }, () => MODEL)]) {
      await expect(requestDownloads(sceneId, hashes)).resolves.toMatchObject({ status: 400 });
    }

    expect(presigner.signed).toEqual([]);
  });
});
