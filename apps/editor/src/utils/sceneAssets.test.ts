import { describe, expect, it } from "vitest";

import { assetHashToBase64, collectAssetHashes, collectAssetRefs, hashAsset, isAssetHash } from "./sceneAssets";

// SHA-256 test vectors (FIPS 180-2).
const EMPTY_HASH = "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855";
const ABC_HASH = "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad";
const MODEL = "a".repeat(64);
const TEXTURE = "b".repeat(64);

const bytes = (text: string): ArrayBuffer => new TextEncoder().encode(text).buffer as ArrayBuffer;

describe("hashAsset", () => {
  it("is the SHA-256 of the bytes, as lowercase hex", async () => {
    await expect(hashAsset(bytes(""))).resolves.toBe(EMPTY_HASH);
    await expect(hashAsset(bytes("abc"))).resolves.toBe(ABC_HASH);
  });

  it("gives a Blob (a texture) the same address as the same bytes in an ArrayBuffer (a model)", async () => {
    await expect(hashAsset(new Blob(["abc"], { type: "image/png" }))).resolves.toBe(ABC_HASH);
  });
});

describe("assetHashToBase64", () => {
  it("re-encodes the hash the way S3 expects x-amz-checksum-sha256", () => {
    expect(assetHashToBase64(EMPTY_HASH)).toBe("47DEQpj8HBSa+/TImW+5JCeuQeRkm5NMpJWZG3hSuFU=");
    expect(assetHashToBase64(ABC_HASH)).toBe(Buffer.from(ABC_HASH, "hex").toString("base64"));
  });
});

describe("isAssetHash", () => {
  it("accepts only 64 lowercase hex characters", () => {
    expect(isAssetHash(ABC_HASH)).toBe(true);
    expect(isAssetHash(ABC_HASH.toUpperCase())).toBe(false);
    expect(isAssetHash(ABC_HASH.slice(1))).toBe(false);
    expect(isAssetHash(`${ABC_HASH}0`)).toBe(false);
    expect(isAssetHash(`../${ABC_HASH.slice(3)}`)).toBe(false);
    expect(isAssetHash(undefined)).toBe(false);
  });

  it("tells the IDs of assets imported before cloud assets apart", () => {
    expect(isAssetHash("asset-m1abc2-x9y8z7")).toBe(false);
    expect(isAssetHash("texture-m1abc2-x9y8z7")).toBe(false);
  });
});

describe("collectAssetRefs", () => {
  it("lists imported models and image layers' textures once each, in order of first use", () => {
    const entities = [
      { id: "root", assetId: MODEL, materialLayers: [] },
      {
        id: "mesh-1",
        materialLayers: [
          { type: "color", color: "#fff" },
          { type: "image", textureAssetId: TEXTURE },
        ],
      },
      { id: "mesh-2", materialLayers: [{ type: "image", textureAssetId: TEXTURE }] },
      { id: "copy", assetId: MODEL },
    ];

    expect(collectAssetRefs(entities)).toEqual([
      { id: MODEL, kind: "model" },
      { id: TEXTURE, kind: "texture" },
    ]);
  });

  it("includes the random IDs of assets imported before cloud assets", () => {
    expect(collectAssetRefs([{ assetId: "asset-old" }])).toEqual([{ id: "asset-old", kind: "model" }]);
  });

  it("tolerates whatever a request body holds", () => {
    expect(collectAssetRefs(undefined)).toEqual([]);
    expect(collectAssetRefs({ assetId: MODEL })).toEqual([]);
    expect(collectAssetRefs([null, 4, "x", { assetId: 7, materialLayers: "nope" }, { materialLayers: [null, { type: "image" }] }])).toEqual(
      [],
    );
  });
});

describe("collectAssetHashes", () => {
  it("keeps only the content addresses", () => {
    expect(collectAssetHashes([{ assetId: "asset-old" }, { assetId: MODEL }, { materialLayers: [{ type: "image", textureAssetId: TEXTURE }] }])).toEqual([
      MODEL,
      TEXTURE,
    ]);
  });
});
