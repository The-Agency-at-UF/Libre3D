import { activeSceneCameraId } from "../scene/activeCamera";
import { useEditorStore, type PlayCameraMode, type PlayCameraSettings } from "../store/useEditorStore";
import { PLAY_CAMERA_LIMITS, PLAY_CAMERA_MODES, resolveScenePlay } from "../viewport/PlayCamera";
import { Select } from "./ui/Select";
import { Slider } from "./ui/Slider";

// What each mode does, under the menu.
const DESCRIPTIONS: Record<PlayCameraMode, string> = {
  fixed: "The camera stays where it is.",
  softOrbit: "The camera turns a little towards the pointer and settles back when it leaves.",
  orbit: "Drag to turn the camera around its target.",
  autoRotate: "The camera turns slowly around its target.",
};

/*
 * BLOCK: PlaySettingsPanel (React Component)
 * PURPOSE: What the visitor can do in Play and on the share page (decision tree §C3, C7): how the
 *          camera moves, Fixed, Soft Orbit, Orbit or Auto-Rotate, with each mode's settings. One set
 *          per scene, `sceneSettings.play`, in the Export dialog under both tabs. It shows what the
 *          scene plays with now (resolveScenePlay: a scene from before it plays with its camera
 *          profile's), and the first change writes the whole setting to the scene.
 *          A scene camera that is looked through plays Fixed, so then it says so instead of offering
 *          modes that wouldn't apply. Disabled while view only: it edits the scene.
 */
export function PlaySettingsPanel() {
  const scenePlay = useEditorStore((state) => state.sceneSettings.play);
  const profilePlay = useEditorStore((state) => (state.cameraProfiles[state.activeProfileId] ?? state.cameraProfiles.personal)?.play);
  const sceneCameraName = useEditorStore((state) => {
    const id = activeSceneCameraId(state);
    return id === null ? null : (state.entities.find((entity) => entity.id === id)?.name ?? "Camera");
  });
  const isReadOnly = useEditorStore((state) => state.readOnlyReason !== null);
  const updateSceneSettings = useEditorStore((state) => state.updateSceneSettings);
  const settings = resolveScenePlay(scenePlay, profilePlay);

  // The whole setting goes each time, so a scene still playing with its profile's keeps those values.
  const update = (changes: Partial<PlayCameraSettings>) => updateSceneSettings({ play: { ...settings, ...changes } });

  return (
    <fieldset className="inspector-fieldset play-settings" disabled={isReadOnly}>
      <h3 className="play-settings-title">Play settings</h3>
      <p className="editor-modal-copy play-settings-copy">
        How visitors can move the camera in Play and on the share page. Saved with the scene and in the .libre3d file; the
        .glb doesn't have it. The share page changes when you Update Published Scene.
      </p>
      {sceneCameraName !== null ? (
        <p className="state-hint">
          The scene plays through {sceneCameraName}, which stays Fixed: its states and events move it. Pick a camera
          profile in the viewport to set how visitors move the camera.
        </p>
      ) : (
        <>
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
        </>
      )}
    </fieldset>
  );
}
