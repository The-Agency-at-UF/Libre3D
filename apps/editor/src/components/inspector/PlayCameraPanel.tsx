import { useEditorStore, type PlayCameraMode, type PlayCameraSettings } from "../../store/useEditorStore";
import { PLAY_CAMERA_LIMITS, PLAY_CAMERA_MODES, resolvePlayCamera } from "../../viewport/PlayCamera";
import { PanelSection } from "../ui/PanelSection";
import { Select } from "../ui/Select";
import { Slider } from "../ui/Slider";

// What each mode does, under the menu.
const DESCRIPTIONS: Record<PlayCameraMode, string> = {
  fixed: "The camera stays where it is.",
  softOrbit: "The camera turns a little towards the pointer and settles back when it leaves.",
  orbit: "Drag to turn the camera around its target.",
  autoRotate: "The camera turns slowly around its target.",
};

/*
 * BLOCK: PlayCameraPanel (React Component)
 * PURPOSE: How the camera moves in Play (and, once share links play scenes, there too): Fixed, Soft
 *          Orbit, Orbit or Auto-Rotate, with each mode's settings. Saved on the active camera as
 *          `play`, so it's part of the scene; Play reads it when it starts (viewport/PlayCamera.ts)
 *          and never writes the camera. In the inspector's view-only fieldset: it edits the scene.
 */
export function PlayCameraPanel() {
  const activeProfileId = useEditorStore((state) => state.activeProfileId);
  const play = useEditorStore((state) => (state.cameraProfiles[state.activeProfileId] ?? state.cameraProfiles.personal).play);
  const updateProfileData = useEditorStore((state) => state.updateProfileData);
  const settings = resolvePlayCamera(play);

  // The whole setting goes back each time, merged: `play` is replaced, never patched in place.
  const update = (changes: Partial<PlayCameraSettings>) => updateProfileData(activeProfileId, { play: { ...settings, ...changes } });

  return (
    <PanelSection title="Play Camera" defaultOpen={true}>
      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        <Select label="Movement" options={PLAY_CAMERA_MODES} value={settings.mode} onChange={(mode) => update({ mode: mode as PlayCameraMode })} />
        <p className="state-hint">{DESCRIPTIONS[settings.mode]}</p>
        {settings.mode === "softOrbit" && (
          <Slider
            label="Range (°)"
            min={PLAY_CAMERA_LIMITS.range.min}
            max={PLAY_CAMERA_LIMITS.range.max}
            step={1}
            value={settings.range}
            onChange={(range) => update({ range })}
          />
        )}
        {(settings.mode === "softOrbit" || settings.mode === "orbit") && (
          <Slider
            label="Smoothness"
            min={PLAY_CAMERA_LIMITS.smoothness.min}
            max={PLAY_CAMERA_LIMITS.smoothness.max}
            step={0.05}
            value={settings.smoothness}
            onChange={(smoothness) => update({ smoothness })}
          />
        )}
        {settings.mode === "autoRotate" && (
          <Slider
            label="Speed (°/s)"
            min={PLAY_CAMERA_LIMITS.speed.min}
            max={PLAY_CAMERA_LIMITS.speed.max}
            step={1}
            value={settings.speed}
            onChange={(speed) => update({ speed })}
          />
        )}
      </div>
    </PanelSection>
  );
}
