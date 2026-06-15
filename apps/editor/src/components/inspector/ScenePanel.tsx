import { useEditorStore } from "../../store/useEditorStore";
import { PanelSection } from "../ui/PanelSection";

export function ScenePanel() {
  const sceneSettings = useEditorStore((state) => state.sceneSettings);
  const updateSceneSettings = useEditorStore((state) => state.updateSceneSettings);

  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateSceneSettings({ bgColor: e.target.value });
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
              value={sceneSettings.bgColor}
              onChange={(e) => updateSceneSettings({ bgColor: e.target.value })}
              style={{ width: "70px", flex: "none" }}
            />
          </div>
        </div>
      </div>
    </PanelSection>
  );
}

