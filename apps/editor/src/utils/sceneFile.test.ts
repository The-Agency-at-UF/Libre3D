import { describe, expect, it } from "vitest";
import type { Entity } from "../store/useEditorStore";
import { hashAsset } from "./sceneAssets";
import { resolveSceneToOpen } from "./sceneCache";
import { CURRENT_SCENE_SCHEMA_VERSION, SCENE_DOCUMENT_FORMAT, type SceneDocument } from "./sceneDocument";
import { isSceneFile, readSceneFile, sceneFileAssetRefs, sceneFileName, writeSceneFile, type SceneFileAsset } from "./sceneFile";

const entity = (id: string, overrides: Partial<Entity> = {}): Entity => ({
  id,
  type: "cube",
  name: "Cube",
  position: [0, 0, 0],
  rotation: [0, 0, 0],
  scale: [1, 1, 1],
  visible: true,
  locked: false,
  parentId: null,
  ...overrides,
});

// Only what parseSceneDocument needs: the store fills the rest from its defaults on load.
const sceneDocument = (entities: Entity[], schemaVersion = CURRENT_SCENE_SCHEMA_VERSION) =>
  ({ format: SCENE_DOCUMENT_FORMAT, schemaVersion, scene: { entities, sceneSettings: { bgColor: "#123456" } } }) as unknown as SceneDocument;

const asset = async (kind: SceneFileAsset["kind"], text: string): Promise<SceneFileAsset> => {
  const bytes = new TextEncoder().encode(text);
  return { hash: await hashAsset(bytes.buffer), kind, bytes };
};

// A model and a picture of odd lengths, so the second starts on a padded boundary.
const sceneWithAssets = async () => {
  const model = await asset("model", "glb bytes");
  const picture = await asset("texture", "png");
  const entities = [
    entity("model-1", { type: "importedModel", name: "Robot", assetId: model.hash }),
    entity("image-1", {
      type: "image",
      name: "Logo",
      materialLayers: [{ id: "layer-1", type: "image", enabled: true, opacity: 1, textureAssetId: picture.hash, slot: "color", wrapS: 1001, wrapT: 1001 }],
    }),
  ];
  return { name: "My scene", document: sceneDocument(entities), assets: [model, picture] };
};

// The file with its JSON chunk edited, the binary chunk kept as it was.
const rewriteJson = (file: Uint8Array<ArrayBuffer>, edit: (json: Record<string, unknown>) => void): Uint8Array<ArrayBuffer> => {
  const length = new DataView(file.buffer).getUint32(12, true);
  const json = JSON.parse(new TextDecoder().decode(file.subarray(20, 20 + length)));
  edit(json);
  const jsonBytes = new TextEncoder().encode(JSON.stringify(json));
  const padded = (jsonBytes.byteLength + 3) & ~3;
  const bin = file.subarray(20 + length);
  const out = new Uint8Array(new ArrayBuffer(20 + padded + bin.byteLength));
  const view = new DataView(out.buffer);
  out.set(file.subarray(0, 8));
  view.setUint32(8, out.byteLength, true);
  view.setUint32(12, padded, true);
  view.setUint32(16, 0x4e4f534a, true); // "JSON"
  out.fill(0x20, 20, 20 + padded);
  out.set(jsonBytes, 20);
  out.set(bin, 20 + padded);
  return out;
};

describe("writeSceneFile / readSceneFile", () => {
  it("round-trips a scene, its name, and its assets' bytes", async () => {
    const scene = await sceneWithAssets();

    const read = await readSceneFile(writeSceneFile(scene).buffer);

    expect(read).toMatchObject({ ok: true, name: "My scene", document: scene.document });
    expect(read.ok && read.content.entities).toEqual(scene.document.scene.entities);
    expect(read.ok && read.assets).toEqual(scene.assets);
  });

  it("is laid out like a GLB: magic, version, length, then 4-byte-aligned chunks", async () => {
    const file = writeSceneFile(await sceneWithAssets());
    const view = new DataView(file.buffer);

    expect(new TextDecoder().decode(file.subarray(0, 4))).toBe("L3DF");
    expect(view.getUint32(4, true)).toBe(1);
    expect(view.getUint32(8, true)).toBe(file.byteLength);
    expect(file.byteLength % 4).toBe(0);
    expect(new TextDecoder().decode(file.subarray(16, 20))).toBe("JSON");
    const binAt = 20 + view.getUint32(12, true);
    expect(new TextDecoder().decode(file.subarray(binAt + 4, binAt + 7))).toBe("BIN");
  });

  it("leaves out the binary chunk for a scene without imported assets", async () => {
    const file = writeSceneFile({ name: "Plain", document: sceneDocument([entity("cube-1")]), assets: [] });

    expect(20 + new DataView(file.buffer).getUint32(12, true)).toBe(file.byteLength);
    expect(await readSceneFile(file.buffer)).toMatchObject({ ok: true, name: "Plain", assets: [] });
  });

  it("migrates an older document, and refuses a newer one or a newer container", async () => {
    const older = writeSceneFile({ name: "Old", document: sceneDocument([entity("cube-1")], 3), assets: [] });
    const newer = writeSceneFile({ name: "New", document: sceneDocument([entity("cube-1")], CURRENT_SCENE_SCHEMA_VERSION + 1), assets: [] });
    const newerContainer = writeSceneFile({ name: "New", document: sceneDocument([entity("cube-1")]), assets: [] });
    new DataView(newerContainer.buffer).setUint32(4, 2, true);

    const read = await readSceneFile(older.buffer);
    expect(read.ok && read.content.sceneSettings).toMatchObject({ environment: { enabled: false } }); // v3 → v4
    expect(await readSceneFile(newer.buffer)).toEqual({ ok: false, reason: "newer" });
    expect(await readSceneFile(newerContainer.buffer)).toEqual({ ok: false, reason: "newer" });
  });

  it("refuses a file that isn't one, or is cut short", async () => {
    const file = writeSceneFile(await sceneWithAssets());

    expect(await readSceneFile(new TextEncoder().encode("glTF and more").buffer)).toEqual({ ok: false, reason: "invalid" });
    expect(await readSceneFile(file.slice(0, file.byteLength - 4).buffer)).toEqual({ ok: false, reason: "invalid" });
    expect(await readSceneFile(new ArrayBuffer(0))).toEqual({ ok: false, reason: "invalid" });
  });

  it("refuses an asset whose bytes don't match its hash", async () => {
    const file = writeSceneFile(await sceneWithAssets());
    file[file.byteLength - 4] ^= 0xff; // inside the picture's bytes

    expect(await readSceneFile(file.buffer)).toEqual({ ok: false, reason: "invalid" });
  });

  it("refuses an asset that points outside the binary chunk, or isn't named by a hash", async () => {
    const scene = await sceneWithAssets();
    const outside = rewriteJson(writeSceneFile(scene), (json) => {
      json.assets = [{ hash: scene.assets[0].hash, kind: "model", byteOffset: 12, byteLength: 9 }]; // the chunk is 16 bytes
    });
    const badHash = rewriteJson(writeSceneFile(scene), (json) => {
      json.assets = [{ hash: "not-a-hash", kind: "model", byteOffset: 0, byteLength: 0 }];
    });

    expect(await readSceneFile(outside.buffer)).toEqual({ ok: false, reason: "invalid" });
    expect(await readSceneFile(badHash.buffer)).toEqual({ ok: false, reason: "invalid" });
  });

  it("skips chunks it doesn't know, as GLB readers do", async () => {
    const plain = writeSceneFile({ name: "Plain", document: sceneDocument([entity("cube-1")]), assets: [] });
    const withExtra = new Uint8Array(new ArrayBuffer(plain.byteLength + 12));
    withExtra.set(plain);
    const view = new DataView(withExtra.buffer);
    view.setUint32(8, withExtra.byteLength, true);
    view.setUint32(plain.byteLength, 4, true);
    view.setUint32(plain.byteLength + 4, 0x54584558, true); // "XEXT"

    expect(await readSceneFile(withExtra.buffer)).toMatchObject({ ok: true, name: "Plain" });
  });
});

describe("opening a file as a new cloud scene", () => {
  it("opens as the new scene's unsaved edits, so the editor saves it (sceneFileTransfers.ts)", async () => {
    const read = await readSceneFile(writeSceneFile(await sceneWithAssets()).buffer);
    if (!read.ok) throw new Error("unreadable");

    const toOpen = resolveSceneToOpen(
      { document: null, revision: 0 }, // a scene just created: never saved
      { ownerId: "user-1", sceneId: "scene-1", baseRevision: 0, document: JSON.parse(JSON.stringify(read.document)) },
    );

    expect(toOpen).toEqual({ status: "ready", content: read.content, hasRecoveredEdits: true, discardCache: false });
  });
});

describe("sceneFileAssetRefs", () => {
  it("is the content-addressed models and pictures, leaving out IDs from before cloud assets", async () => {
    const { document, assets } = await sceneWithAssets();
    const entities = [...document.scene.entities, entity("old-1", { type: "importedModel", assetId: "asset-123" })];

    expect(sceneFileAssetRefs(entities)).toEqual([
      { id: assets[0].hash, kind: "model" },
      { id: assets[1].hash, kind: "texture" },
    ]);
  });
});

describe("file names", () => {
  it("names the file after the scene, without characters file systems refuse", () => {
    expect(sceneFileName("My scene")).toBe("My scene.libre3d");
    expect(sceneFileName('a/b:c*"d"?')).toBe("a-b-c-d-.libre3d");
    expect(sceneFileName("  ")).toBe("scene.libre3d");
  });

  it("knows a scene file by its extension", () => {
    expect(isSceneFile(new File([], "Robot.LIBRE3D"))).toBe(true);
    expect(isSceneFile(new File([], "robot.glb"))).toBe(false);
  });
});
