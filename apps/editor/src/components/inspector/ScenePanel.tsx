import { useState, useEffect } from "react";
import { useEditorStore } from "../../store/useEditorStore";
import { PanelSection } from "../ui/PanelSection";

export function ScenePanel() {
  const sceneSettings = useEditorStore((state) => state.sceneSettings);
  const updateSceneSettings = useEditorStore((state) => state.updateSceneSettings);

  const [localColor, setLocalColor] = useState(sceneSettings.bgColor);

  useEffect(() => {
    setLocalColor(sceneSettings.bgColor);
  }, [sceneSettings.bgColor]);

  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateSceneSettings({ bgColor: e.target.value });
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value;
    val = val.replace(/^#+/, "");
    if (val.length > 0) {
      val = "#" + val;
    } else {
      val = "#";
    }

    setLocalColor(val);

    const hexRegex = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/;
    if (hexRegex.test(val)) {
      updateSceneSettings({ bgColor: val });
    }
  };

  const handleBlur = () => {
    const hexRegex = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/;
    if (!hexRegex.test(localColor)) {
      setLocalColor(sceneSettings.bgColor);
    }
  };

  return (
    <PanelSection title="Scene Settings" defaultOpen={true}>
      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        {/* Phase 5+6: Stacked layout + compound color control */}
        <div className="prop prop--stacked">
          <span className="prop-label">Background Color</span>
          {/* Swatch and hex input share a single bordered compound control */}
          <div className="inspector-color-field">
            <div className="inspector-color-swatch" style={{ background: sceneSettings.bgColor }}>
              <input
                type="color"
                value={sceneSettings.bgColor}
                onChange={handleColorChange}
                aria-label="Background color picker"
              />
            </div>
            <input
              type="text"
              className="hex-input"
              value={localColor}
              onChange={handleTextChange}
              onBlur={handleBlur}
              onClick={(e) => e.currentTarget.select()}
              style={{ padding: "5px 8px" }}
              aria-label="Background color hex value"
            />
          </div>
        </div>
      </div>
    </PanelSection>
  );
}
