import { useEditorStore, FrameSizePreset } from "../../store/useEditorStore";
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
        <input
          type="number"
          min={1}
          value={frame.width}
          onChange={(e) => updateFrameDimension("width", Number(e.target.value) || 0)}
          disabled={isResponsiveFrame}
          style={{ width: "100%" }}
        />
      </div>

      <div className="prop" style={{ opacity: isResponsiveFrame ? 0.45 : 1 }}>
        <span className="prop-label">Height</span>
        <input
          type="number"
          min={1}
          value={frame.height}
          onChange={(e) => updateFrameDimension("height", Number(e.target.value) || 0)}
          disabled={isResponsiveFrame}
          style={{ width: "100%" }}
        />
      </div>
    </PanelSection>
  );
}
