import { useEditorStore } from "../../store/useEditorStore";
import { ColorField } from "../ui/ColorField";
import { PanelSection } from "../ui/PanelSection";
import { Switch } from "../ui/Switch";
import { Select } from "../ui/Select";
import { Slider } from "../ui/Slider";

const DEFAULT_BACKGROUND = "#0b1020";

export function ScenePanel() {
  const sceneSettings = useEditorStore((state) => state.sceneSettings);
  const updateSceneSettings = useEditorStore((state) => state.updateSceneSettings);

  return (
    <PanelSection title="Scene Settings" defaultOpen={true}>
      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>

        {/* Background colour: the editor's own picker (ui/ColorPicker.tsx), as every other colour */}
        <ColorField label="Background" color={sceneSettings.bgColor} onChange={(change) => change.color && updateSceneSettings({ bgColor: change.color })} />
        {sceneSettings.bgColor.toLowerCase() !== DEFAULT_BACKGROUND && (
          <button type="button" className="scene-reset-btn" title="Reset to the default background colour" onClick={() => updateSceneSettings({ bgColor: DEFAULT_BACKGROUND })}>
            <i className="ti ti-arrow-back-up"></i>
            <span>Reset</span>
          </button>
        )}

        {/* Environment light (replaces the ambient light while on) */}
        <Switch
          label="Environment Light"
          checked={sceneSettings.environment.enabled}
          onChange={(val) => updateSceneSettings({ environment: { enabled: val } })}
        />
        {sceneSettings.environment.enabled && (
          <Slider
            label="Intensity"
            min={0}
            max={2}
            step={0.05}
            value={sceneSettings.environment.intensity}
            onChange={(val) => updateSceneSettings({ environment: { intensity: val } })}
          />
        )}

        {/* Grid */}
        <Switch
          label="Show Grid"
          checked={sceneSettings.showGrid !== false}
          onChange={(val) => updateSceneSettings({ showGrid: val })}
        />

        {/* Wireframe */}
        <Switch
          label="Wireframe Mode"
          checked={sceneSettings.wireframe}
          onChange={(val) => updateSceneSettings({ wireframe: val })}
        />

        {/* Fog */}
        <Switch
          label="Fog Effect"
          checked={sceneSettings.fogEnabled}
          onChange={(val) => updateSceneSettings({ fogEnabled: val })}
        />

      </div>
    </PanelSection>
  );
}
