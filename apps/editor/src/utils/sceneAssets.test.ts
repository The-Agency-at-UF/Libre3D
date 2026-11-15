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

    expect(collectAssetRefs({ entities })).toEqual([
      { id: MODEL, kind: "model" },
      { id: TEXTURE, kind: "texture" },
    ]);
  });

  it("lists a Lighting layer's maps' pictures too", () => {
    const entities = [{ id: "mesh", materialLayers: [{ type: "lighting", maps: { normal: { textureAssetId: TEXTURE }, roughness: { textureAssetId: MODEL } } }] }];

    expect(collectAssetRefs({ entities })).toEqual([
      { id: TEXTURE, kind: "texture" },
      { id: MODEL, kind: "texture" },
    ]);
  });

  it("finds a picture used only inside a material asset, after the entities' own", () => {
    const entities = [{ materialAssetId: "m", materialLayers: [{ type: "image", textureAssetId: TEXTURE }] }];
    const materials = {
      m: { id: "m", name: "Gloss", layers: [{ type: "matcap", textureAssetId: MODEL }, { type: "lighting", maps: { normal: { textureAssetId: "c".repeat(64) } } }] },
      n: { id: "n", name: "Same picture", layers: [{ type: "image", textureAssetId: TEXTURE }] },
    };

    expect(collectAssetRefs({ entities, materials })).toEqual([
      { id: TEXTURE, kind: "texture" },
      { id: MODEL, kind: "texture" },
      { id: "c".repeat(64), kind: "texture" },
    ]);
    expect(collectAssetHashes({ materials })).toEqual([MODEL, "c".repeat(64), TEXTURE]);
    // Whatever a request body holds for `materials`.
    expect(collectAssetRefs({ materials: "nope" })).toEqual([]);
    expect(collectAssetRefs({ materials: { m: null, n: { layers: "nope" }, o: { layers: [null, { type: "image" }] } } })).toEqual([]);
  });

  it("includes the random IDs of assets imported before cloud assets", () => {

    expect(collectAssetRefs({ entities: [{ assetId: "asset-old" }] })).toEqual([{ id: "asset-old", kind: "model" }]);
  });

  it("tolerates whatever a request body holds", () => {
    expect(collectAssetRefs(undefined)).toEqual([]);
    // An entities array where the scene belongs: a compile error, and nothing found at run time.
    expect(collectAssetRefs([{ assetId: MODEL }] as never)).toEqual([]);
    expect(collectAssetRefs({ entities: { assetId: MODEL } })).toEqual([]);
    expect(collectAssetRefs({ entities: [null, 4, "x", { assetId: 7, materialLayers: "nope" }, { materialLayers: [null, { type: "image" }] }] })).toEqual(
      [],
    );
  });
});

describe("collectAssetRefs: sounds", () => {
  const AUDIO = "d".repeat(64);
  const sound = (assetId: unknown) => ({ id: "s", type: "sound", assetId, volume: 1, loop: false, mode: "play" });

  it("finds each Sound action's audio once, after the pictures and models", () => {
    const scene = {
      entities: [{ id: "cube", assetId: MODEL }],
      animation: {
        events: {
          a: { id: "a", ownerId: "cube", trigger: "mouseDown", actions: [sound(AUDIO), { id: "t", type: "transition", targetId: "cube" }] },
          b: { id: "b", ownerId: "cube", trigger: "start", actions: [sound(AUDIO), { id: "l", type: "openLink", url: "https://example.com" }] },
        },
      },
    };

    expect(collectAssetRefs(scene)).toEqual([
      { id: MODEL, kind: "model" },
      { id: AUDIO, kind: "audio" },
    ]);
    expect(collectAssetHashes(scene)).toEqual([MODEL, AUDIO]);
  });

  it("skips sounds with none picked, and tolerates malformed animation data", () => {
    expect(collectAssetRefs({ animation: { events: { a: { actions: [sound(""), sound(7), sound(undefined)] } } } })).toEqual([]);
    for (const animation of [null, "x", { events: null }, { events: [] }, { events: { a: null, b: { actions: "x" }, c: { actions: [null, 4] } } }]) {
      expect(() => collectAssetRefs({ animation })).not.toThrow();
      expect(collectAssetRefs({ animation })).toEqual([]);
    }
  });

  it("still works on entities alone", () => {
    expect(collectAssetRefs({ entities: [{ assetId: MODEL }] })).toEqual([{ id: MODEL, kind: "model" }]);
  });
});

describe("collectAssetHashes", () => {
  it("keeps only the content addresses", () => {
    expect(collectAssetHashes({ entities: [{ assetId: "asset-old" }, { assetId: MODEL }, { materialLayers: [{ type: "image", textureAssetId: TEXTURE }] }] })).toEqual([
      MODEL,
      TEXTURE,
    ]);
  });
});
