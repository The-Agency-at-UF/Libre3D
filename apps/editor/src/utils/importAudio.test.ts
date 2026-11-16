import { describe, expect, it, vi } from "vitest";
import { checkAudioFile, formatFileSize, importAudioFile } from "./importAudio";
import { hashAsset } from "./sceneAssets";

const saved = vi.hoisted(() => new Map<string, ArrayBuffer>());
vi.mock("./audioAssetStore", () => ({ saveAudioAsset: async (id: string, data: ArrayBuffer) => void saved.set(id, data) }));

const MB = 1024 * 1024;

describe("checkAudioFile", () => {
  it("takes mp3, ogg, m4a and wav (wav flagged as large), whatever the case", () => {
    expect(checkAudioFile("loop.mp3", MB)).toEqual({ ok: true, large: false });
    expect(checkAudioFile("Chime.OGG", MB)).toEqual({ ok: true, large: false });
    expect(checkAudioFile("voice.m4a", MB)).toEqual({ ok: true, large: false });
    expect(checkAudioFile("raw.wav", MB)).toEqual({ ok: true, large: true });
  });

  it("refuses other formats, a file over 5 MB, and a scene going over 20 MB, saying why", () => {
    expect(checkAudioFile("song.flac", MB)).toMatchObject({ ok: false, message: expect.stringContaining("MP3, OGG, M4A or WAV") });
    expect(checkAudioFile("big.mp3", 6 * MB)).toMatchObject({ ok: false, message: expect.stringContaining("up to 5 MB") });
    expect(checkAudioFile("five.mp3", 5 * MB)).toMatchObject({ ok: true });
    expect(checkAudioFile("last.mp3", 2 * MB, [5 * MB, 5 * MB, 5 * MB, 4 * MB])).toMatchObject({
      ok: false,
      message: expect.stringContaining("add up to 20 MB"),
    });
    expect(checkAudioFile("last.mp3", MB, [5 * MB, 5 * MB, 5 * MB, 4 * MB])).toMatchObject({ ok: true });
  });

  it("shows sizes in KB under a megabyte", () => {
    expect(formatFileSize(200 * 1024)).toBe("200 KB");
    expect(formatFileSize(10)).toBe("1 KB");
    expect(formatFileSize(2.25 * MB)).toBe("2.3 MB");
  });
});

describe("importAudioFile", () => {
  it("keeps the bytes under their content hash", async () => {
    const file = new File(["ogg bytes"], "chime.ogg");

    const result = await importAudioFile(file);

    const hash = await hashAsset(await file.arrayBuffer());
    expect(result).toEqual({ ok: true, assetId: hash, name: "chime.ogg", size: 9, large: false });
    expect(saved.has(hash)).toBe(true);
  });

  it("stores nothing for a refused file", async () => {
    saved.clear();
    await expect(importAudioFile(new File(["x"], "notes.txt"))).resolves.toMatchObject({ ok: false });
    expect(saved.size).toBe(0);
  });
});
