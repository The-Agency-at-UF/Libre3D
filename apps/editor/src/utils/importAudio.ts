/**
 * PURPOSE: Adding a sound to a scene from a file (the Sound action's upload, C3): checks it, names it
 * by its content hash (sceneAssets.ts) and keeps it in this browser's storage. Autosave uploads it
 * with the scene's other assets (it's found through the action, `collectAssetRefs`), so nothing is
 * uploaded here, and a guest scene keeps it locally only.
 *
 * INPUT: The picked file, and the sizes of the scene's other sounds (for the per-scene cap).
 * OUTPUT: `{ ok: true, assetId, name, size, large }` (large: a .wav, worth a warning), or
 *         `{ ok: false, message }` saying why it was refused (nothing stored).
 *
 * The server checks the same caps (awsSceneHandler.ts); these are here so the author hears it at
 * once, not on the next save.
 */

import { saveAudioAsset } from "./audioAssetStore";
import { hashAsset, MAX_AUDIO_BYTES, MAX_SCENE_AUDIO_BYTES } from "./sceneAssets";

/** The formats a Sound action takes; every browser decodes these (Safari has no Ogg before 17). */
export const AUDIO_EXTENSIONS = [".mp3", ".ogg", ".m4a", ".wav"] as const;

/** For the file picker. */
export const AUDIO_ACCEPT = [...AUDIO_EXTENSIONS, "audio/mpeg", "audio/ogg", "audio/mp4", "audio/wav"].join(",");

const megabytes = (bytes: number) => `${Math.round((bytes / (1024 * 1024)) * 10) / 10} MB`;

/** A file's size as the panel shows it. */
export const formatFileSize = (bytes: number): string => (bytes < 1024 * 1024 ? `${Math.max(1, Math.round(bytes / 1024))} KB` : megabytes(bytes));

export const isWavName = (name: string): boolean => name.toLowerCase().endsWith(".wav");

export type AudioFileCheck = { ok: true; large: boolean } | { ok: false; message: string };

/**
 * Whether a file can be a scene's sound: one of the formats, at most 5 MB, and the scene's sounds
 * at most 20 MB together (`otherSounds`: the sizes of the others, each once).
 */
export const checkAudioFile = (name: string, size: number, otherSounds: number[] = []): AudioFileCheck => {
  const lower = name.toLowerCase();
  if (!AUDIO_EXTENSIONS.some((extension) => lower.endsWith(extension))) {
    return { ok: false, message: `${name} isn't a sound Libre3D can play. Use an MP3, OGG, M4A or WAV file.` };
  }
  if (size > MAX_AUDIO_BYTES) {
    return { ok: false, message: `${name} is ${megabytes(size)}. Sounds can be up to ${megabytes(MAX_AUDIO_BYTES)}: try a shorter clip, or an MP3 at a lower bitrate.` };
  }
  const total = otherSounds.reduce((sum, other) => sum + other, size);
  if (total > MAX_SCENE_AUDIO_BYTES) {
    return { ok: false, message: `With ${name}, this scene's sounds would add up to ${megabytes(total)}. A scene's sounds can add up to ${megabytes(MAX_SCENE_AUDIO_BYTES)}.` };
  }
  return { ok: true, large: isWavName(name) };
};

export type ImportedAudio = { ok: true; assetId: string; name: string; size: number; large: boolean } | { ok: false; message: string };

/** Checks a picked file and keeps it in this browser's storage under its content hash. */
export const importAudioFile = async (file: File, otherSounds: number[] = []): Promise<ImportedAudio> => {
  const check = checkAudioFile(file.name, file.size, otherSounds);
  if (!check.ok) return check;
  const bytes = await file.arrayBuffer();
  const assetId = await hashAsset(bytes);
  await saveAudioAsset(assetId, bytes);
  return { ok: true, assetId, name: file.name, size: file.size, large: check.large };
};
