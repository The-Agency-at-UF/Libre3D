import { useState, useEffect } from "react";
import { useEditorStore } from "../../store/useEditorStore";
import { PanelSection } from "../ui/PanelSection";
import { Switch } from "../ui/Switch";
import { Select } from "../ui/Select";

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

        {/* Background Color */}
        <div className="prop prop--stacked">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%" }}>
            <span className="prop-label">Background Color</span>
            {sceneSettings.bgColor.toLowerCase() !== "#0b1020" && (
              <button
                type="button"
                onClick={() => {
                  updateSceneSettings({ bgColor: "#0b1020" });
                  setLocalColor("#0b1020");
                }}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "var(--text-tertiary)",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                  fontSize: "10.5px",
                  padding: "2px 6px",
                  borderRadius: "4px",
                  transition: "all 120ms ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = "var(--text-secondary)";
                  e.currentTarget.style.background = "var(--bg-hover)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = "var(--text-tertiary)";
                  e.currentTarget.style.background = "transparent";
                }}
                title="Reset to default background color"
              >
                <i className="ti ti-arrow-back-up" style={{ fontSize: "11px" }}></i>
                <span>Reset</span>
              </button>
            )}
          </div>
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
