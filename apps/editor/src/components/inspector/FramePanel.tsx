import { useEditorStore, FrameSizePreset } from "../../store/useEditorStore";
import { NumberField } from "../ui/NumberField";
import { PanelSection } from "../ui/PanelSection";
import { Select } from "../ui/Select";

export function FramePanel() {
  const frame = useEditorStore((state) => state.frame);
  const updateFrameSettings = useEditorStore((state) => state.updateFrameSettings);

  const isResponsiveFrame = frame.mode === "responsive";

  const setFramePreset = (preset: string) => {
    const presetType = preset as FrameSizePreset;
    if (presetType === "responsive") {
      updateFrameSettings({ mode: "responsive", preset: presetType });
    } else if (presetType === "custom") {
      updateFrameSettings({ mode: "fixed", preset: presetType });
    } else {
      const [width, height] = presetType.split("x").map(Number);
      updateFrameSettings({ mode: "fixed", preset: presetType, width, height });
    }
  };

  const updateFrameDimension = (field: "width" | "height", value: number) => {
    updateFrameSettings({
      mode: "fixed",
      preset: "custom",
      [field]: value,
    });
  };

  return (
    <PanelSection title="Frame" defaultOpen={true}>
      <Select
        label="Size Preset"
        options={[
          { label: "Responsive", value: "responsive" },
          { label: "1920x1080", value: "1920x1080" },
          { label: "1080x1080 Square", value: "1080x1080" },
          { label: "Custom", value: "custom" },
        ]}
        value={frame.preset}
        onChange={setFramePreset}
      />

      <div className="prop" style={{ opacity: isResponsiveFrame ? 0.45 : 1 }}>
        <span className="prop-label">Width</span>
        <NumberField
          label="Frame width in pixels"
          min={1}
          step={1}
          integer
          value={frame.width}
          onChange={(width) => updateFrameDimension("width", width)}
          disabled={isResponsiveFrame}
          style={{ width: "100%" }}
        />
      </div>

      <div className="prop" style={{ opacity: isResponsiveFrame ? 0.45 : 1 }}>
        <span className="prop-label">Height</span>
        <NumberField
          label="Frame height in pixels"
          min={1}
          step={1}
          integer
          value={frame.height}
          onChange={(height) => updateFrameDimension("height", height)}
          disabled={isResponsiveFrame}
          style={{ width: "100%" }}
        />
      </div>
    </PanelSection>
  );
}
