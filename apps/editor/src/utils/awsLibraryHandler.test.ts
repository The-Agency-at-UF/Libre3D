import { beforeEach, describe, expect, it, vi } from "vitest";

import { FakeS3 } from "../testing/fakeAws";
import { handleMaterialLibraryRequest, LIBRARY_MATERIALS_KEY } from "./awsLibraryHandler";
import { LIBRARY_EDITORS_GROUP, type LibraryMaterial } from "./materialLibraryShared";

const aws = vi.hoisted(() => ({ s3: null as unknown }));

vi.mock("./awsConfig.js", () => ({
  readRequiredEnv: (env: Record<string, string | undefined>, name: string) => {
    const value = env[name];
    if (!value) throw new Error(`Missing required environment variable: ${name}`);
    return value;
  },
  getAwsClients: () => ({ s3: aws.s3 }),
}));

// `Bearer dev` signs in as a library editor, `Bearer <anyone else>` as a user who isn't one (the
// real check is in verifyAuth.test.ts).
vi.mock("./verifyAuth.js", () => ({
  verifyAuth: async (headers: Record<string, string | undefined>) => {
    const user = headers.authorization?.startsWith("Bearer ") ? headers.authorization.slice("Bearer ".length) : null;
    return user
      ? { authorized: true, userId: user, groups: user === "dev" ? ["library-editors"] : ["someone-else"] }
      : { authorized: false, status: 401, error: "You need to be signed in to do that." };
  },
}));

const ENV = { AWS_REGION: "us-east-2", S3_BUCKET_NAME: "bucket" };
const LAYERS = [
  { id: "l", type: "lighting" },
  { id: "c", type: "color", color: "#ff0000" },
];

let s3: FakeS3;

const call = (method: string, { as = null as string | null, body = undefined as unknown } = {}) =>
  handleMaterialLibraryRequest({ method, headers: as ? { authorization: `Bearer ${as}` } : {}, body }, ENV);

const listed = async (): Promise<LibraryMaterial[]> => ((await call("GET")).body as { materials: LibraryMaterial[] }).materials;

beforeEach(() => {
  s3 = new FakeS3();
  aws.s3 = s3;
});

describe("the material library", () => {
  it("names the group the server checks", () => {
    expect(LIBRARY_EDITORS_GROUP).toBe("library-editors");
  });

  it("is empty, and readable without signing in, before anything is added", async () => {
    const response = await call("GET");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ materials: [] });
  });

  it("lets a developer add a material, which everyone then sees", async () => {
    const response = await call("POST", { as: "dev", body: { name: " Red gloss ", category: "Plastic", layers: LAYERS, opacity: 0.5 } });

    expect(response.status).toBe(201);
    const { material } = response.body as { material: LibraryMaterial };
    expect(material).toMatchObject({ name: "Red gloss", category: "Plastic", layers: LAYERS, opacity: 0.5 });
    expect(material.id).toMatch(/^[0-9a-f-]{36}$/);
    expect(await listed()).toEqual([material]);
    expect(JSON.parse(s3.objects.get(LIBRARY_MATERIALS_KEY)!)).toEqual({ version: 1, materials: [material] });
  });

  it("files a material without a category under General, solid", async () => {
    await call("POST", { as: "dev", body: JSON.stringify({ name: "Plain", layers: LAYERS }) });

    const [material] = await listed();
    expect(material.category).toBe("General");
    expect(material).not.toHaveProperty("opacity");
  });

  it("refuses to add or remove for someone signed out (401) or not a developer (403), and changes nothing", async () => {
    await call("POST", { as: "dev", body: { name: "Kept", layers: LAYERS } });
    const [kept] = await listed();
    const body = { name: "Mine", layers: LAYERS };

    expect((await call("POST", { body })).status).toBe(401);
    expect((await call("POST", { as: "alice", body })).status).toBe(403);
    expect((await call("DELETE", { body: { id: kept.id } })).status).toBe(401);
    expect((await call("DELETE", { as: "alice", body: { id: kept.id } })).status).toBe(403);
    expect(await listed()).toEqual([kept]);
  });

  it.each([
    ["no name", { layers: LAYERS }, 400],
    ["a name that is too long", { name: "x".repeat(81), layers: LAYERS }, 400],
    ["a category that is too long", { name: "A", category: "x".repeat(41), layers: LAYERS }, 400],
    ["no layers", { name: "A", layers: [] }, 400],
    ["layers that aren't layers", { name: "A", layers: ["color"] }, 400],
    ["a picture layer", { name: "A", layers: [...LAYERS, { id: "i", type: "image", textureAssetId: "a".repeat(64) }] }, 422],
    ["a Lighting map", { name: "A", layers: [{ id: "l", type: "lighting", maps: { normal: { textureAssetId: "b".repeat(64) } } }] }, 422],
  ])("rejects %s", async (_label, body, status) => {
    expect((await call("POST", { as: "dev", body })).status).toBe(status);
    expect(await listed()).toEqual([]);
  });

  it("lets a developer remove a material, and answers 404 for one that isn't there", async () => {
    await call("POST", { as: "dev", body: { name: "One", layers: LAYERS } });
    await call("POST", { as: "dev", body: { name: "Two", layers: LAYERS } });
    const [one, two] = await listed();

    expect((await call("DELETE", { as: "dev", body: { id: one.id } })).status).toBe(200);
    expect(await listed()).toEqual([two]);
    expect((await call("DELETE", { as: "dev", body: { id: one.id } })).status).toBe(404);
    expect((await call("DELETE", { as: "dev", body: {} })).status).toBe(404);
  });

  it("answers 405 to other methods", async () => {
    const response = await call("PUT", { as: "dev" });

    expect(response.status).toBe(405);
    expect(response.headers).toEqual({ Allow: "GET, POST, DELETE" });
  });
});
