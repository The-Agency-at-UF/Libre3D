/**
 * PURPOSE: The Sound action's row in the Edit Event panel (C3): which sound (one the scene already
 * has, or a file uploaded here), Play or Stop, Volume and Loop.
 *
 * INPUT: `ActionEditorProps<SoundAction>`; the scene's other Sound actions, read from the store, for
 *        the list of its sounds.
 * OUTPUT: Each change through `onChange` (one undo step each; Volume one per drag, as `Slider` does).
 *
 * An uploaded file is checked and kept in this browser by `importAudioFile` (utils/importAudio.ts);
 * autosave uploads it with the scene's other assets, since it's found through this action. Playback
 * is viewport/sceneAudio.ts. Read-only disables everything (the row's fieldset),
 * and an upload from a view-only tab never starts.
 */

import { useEffect, useMemo, useRef, useState } from "react";
import type { SoundAction } from "../../../animation/actions";
import { useEditorStore } from "../../../store/useEditorStore";
import { loadAudioAsset } from "../../../utils/audioAssetStore";
import { AUDIO_ACCEPT, formatFileSize, importAudioFile, isWavName } from "../../../utils/importAudio";
import { showAlert } from "../../ui/Dialog";
import { Select } from "../../ui/Select";
import { Slider } from "../../ui/Slider";
import { Switch } from "../../ui/Switch";
import type { ActionEditorProps } from "./actionEditors";

const MODES = [
  { label: "Play", value: "play" },
  { label: "Stop", value: "stop" },
];

/** The scene's sounds, once each by asset, with the name each was added under. */
const useSceneSounds = (): { assetId: string; name: string }[] => {
  const events = useEditorStore((state) => state.animation.events);
  return useMemo(() => {
    const sounds = new Map<string, string>();
    for (const event of Object.values(events)) {
      for (const action of event.actions) {
        if (action.type === "sound" && action.assetId && !sounds.has(action.assetId)) sounds.set(action.assetId, action.name ?? "Sound");
      }
    }
    return Array.from(sounds, ([assetId, name]) => ({ assetId, name }));
  }, [events]);
};

/** The size of a sound kept in this browser, or null while it's being read or isn't here. */
const useLocalSoundSize = (assetId: string): number | null => {
  const [size, setSize] = useState<{ assetId: string; bytes: number | null } | null>(null);
  useEffect(() => {
    if (!assetId) return;
    let active = true;
    loadAudioAsset(assetId)
      .then((bytes) => active && setSize({ assetId, bytes: bytes?.byteLength ?? null }))
      .catch(() => active && setSize({ assetId, bytes: null }));
    return () => {
      active = false;
    };
  }, [assetId]);
  return size?.assetId === assetId ? size.bytes : null;
};

const UPLOAD = "__upload__";

export function SoundActionRow({ action, isReadOnly, onChange, onRemove }: ActionEditorProps<SoundAction>) {
  const [open, setOpen] = useState(true);
  const [uploading, setUploading] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);
  const sounds = useSceneSounds();
  const size = useLocalSoundSize(action.assetId);

  const pickFile = async (file: File | undefined) => {
    if (!file || isReadOnly) return;
    setUploading(true);
    try {
      // The cap is per scene: the other sounds' sizes, those this browser has.
      const others = await Promise.all(
        sounds.filter((sound) => sound.assetId !== action.assetId).map(async (sound) => (await loadAudioAsset(sound.assetId))?.byteLength ?? 0),
      );
      const imported = await importAudioFile(file, others);
      if (!imported.ok) {
        await showAlert(imported.message, "Can't add this sound");
        return;
      }
      onChange({ ...action, assetId: imported.assetId, name: imported.name });
    } catch (error) {
      console.error("[Libre3D] Couldn't add a sound.", error);
      await showAlert("This sound couldn't be added. Try again.", "Can't add this sound");
    } finally {
      setUploading(false);
    }
  };

  const options = [
    ...(action.assetId ? [] : [{ label: "Pick a sound", value: "" }]),
    ...sounds.map((sound) => ({ label: sound.name, value: sound.assetId })),
    // A sound this action names that no action lists (it can't happen, but shows rather than hides it).
    ...(action.assetId && !sounds.some((sound) => sound.assetId === action.assetId) ? [{ label: action.name ?? "Sound", value: action.assetId }] : []),
    { label: "Upload a sound…", value: UPLOAD },
  ];

  const choose = (value: string) => {
    if (value === UPLOAD) {
      fileInput.current?.click();
      return;
    }
    const sound = sounds.find((other) => other.assetId === value);
    if (sound) onChange({ ...action, assetId: sound.assetId, name: sound.name });
  };

  const label = action.mode === "stop" ? "Stop Sound" : "Sound";

  return (
    <div className="mat-layer event-action" data-open={open}>
      <div className="mat-layer-header">
        <button type="button" className="mat-layer-toggle" onClick={() => setOpen((o) => !o)} aria-expanded={open}>
          <i className="ti ti-chevron-right chevron"></i>
          <span className="mat-layer-icon">
            <i className={`ti ti-${action.mode === "stop" ? "volume-off" : "volume"}`}></i>
          </span>
          <span className="mat-layer-name">{label}</span>
          {!action.assetId && <i className="ti ti-alert-triangle event-row-warning" title="Play skips this until a sound is picked"></i>}
        </button>
        <div className="mat-layer-action">
          <button type="button" className="mat-icon-btn" disabled={isReadOnly} title="Delete this sound" aria-label="Delete this sound" onClick={onRemove}>
            <i className="ti ti-x"></i>
          </button>
        </div>
      </div>

      {open && (
        <fieldset className="inspector-fieldset" disabled={isReadOnly}>
          <div className="mat-layer-body">
            <Select label="Mode" options={MODES} value={action.mode} onChange={(mode) => onChange({ ...action, mode: mode as SoundAction["mode"] })} />
            <Select label="Sound" options={options} value={action.assetId} onChange={choose} />
            <input
              ref={fileInput}
              type="file"
              accept={AUDIO_ACCEPT}
              hidden
              aria-label="Upload a sound"
              onChange={(event) => {
                void pickFile(event.target.files?.[0]);
                event.target.value = "";
              }}
            />

            {uploading && <p className="state-hint">Adding the sound…</p>}
            {action.assetId && !uploading && (
              <p className="state-hint event-sound-file">
                {action.name ?? "Sound"}
                {size !== null && ` · ${formatFileSize(size)}`}
              </p>
            )}
            {action.assetId && isWavName(action.name ?? "") && (
              <p className="state-hint">WAV files are large (about 10 MB a minute) and slow the share link down. An MP3 of it is a tenth of the size.</p>
            )}
            {!action.assetId && <p className="state-hint event-problem">Pick a sound: Play skips this until then.</p>}

            {action.mode === "play" ? (
              <>
                <Slider label="Volume %" min={0} max={100} step={1} value={Math.round(action.volume * 100)} onChange={(percent) => onChange({ ...action, volume: percent / 100 })} />
                <Switch label="Loop" checked={action.loop} onChange={(loop) => onChange({ ...action, loop })} />
              </>
            ) : (
              <p className="state-hint">Stops this sound wherever it's playing.</p>
            )}
            <p className="state-hint">Scenes start muted: visitors hear sound once they press the sound button.</p>
          </div>
        </fieldset>
      )}
    </div>
  );
}
