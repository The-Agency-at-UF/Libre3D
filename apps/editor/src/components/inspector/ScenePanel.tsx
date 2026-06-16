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
        {/* Background Color */}
        <div className="prop">
          <span className="prop-label">Background Color</span>
          <div className="color-row" style={{ flex: 1, display: "flex", justifyContent: "flex-end", gap: "8px" }}>
            <div
              style={{
                position: "relative",
                width: "20px",
                height: "20px",
                borderRadius: "4px",
                overflow: "hidden",
                border: "1px solid var(--border-strong)",
                cursor: "pointer",
              }}
            >
              <input
                type="color"
                value={sceneSettings.bgColor}
                onChange={handleColorChange}
                style={{
                  position: "absolute",
                  top: "-5px",
                  left: "-5px",
                  width: "30px",
                  height: "30px",
                  padding: 0,
                  border: "none",
                  cursor: "pointer",
                  background: "transparent",
                }}
              />
            </div>
            <input
              type="text"
              className="hex-input"
              value={localColor}
              onChange={handleTextChange}
              onBlur={handleBlur}
              onClick={(e) => e.currentTarget.select()}
              style={{ width: "70px", flex: "none" }}
            />
          </div>
        </div>
      </div>
    </PanelSection>
  );
}


