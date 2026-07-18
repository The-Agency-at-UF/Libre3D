import { useState, useEffect } from "react";
import { useEditorStore } from "../../store/useEditorStore";
import { getLiveScene, createSceneExportBlob } from "../../utils/exportScene";

interface InspectorTopbarProps {
  setIsModalOpen: (open: boolean) => void;
  setActiveTab: (tab: "export" | "share") => void;
  viewportZoom: number;
  hasSelection: boolean;
}

export function InspectorTopbar({
  setIsModalOpen,
  setActiveTab,
  viewportZoom,
  hasSelection,
}: InspectorTopbarProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const setEditorState = useEditorStore((state) => state.setEditorState);
  const isPreviewMode = useEditorStore((state) => state.isPreviewMode);
  const previewGlbUrl = useEditorStore((state) => state.previewGlbUrl);
  const setPreviewMode = useEditorStore((state) => state.setPreviewMode);

  useEffect(() => {
    return () => {
      const currentUrl = useEditorStore.getState().previewGlbUrl;
      if (currentUrl) {
        URL.revokeObjectURL(currentUrl);
      }
    };
  }, []);

  const handlePlayToggle = async () => {
    if (isPreviewMode) {
      if (previewGlbUrl) {
        URL.revokeObjectURL(previewGlbUrl);
      }
      setPreviewMode(false, null);
    } else {
      const liveScene = getLiveScene();
      if (!liveScene) {
        window.alert("The live scene is not ready yet.");
        return;
      }
      try {
        const blob = await createSceneExportBlob(liveScene, "glb");
        if (!blob) {
          window.alert("There is no exportable mesh content in the current scene to preview.");
          return;
        }
        const url = URL.createObjectURL(blob);
        setPreviewMode(true, url);
      } catch (error) {
        console.error("Failed to generate preview GLB:", error);
        window.alert("Failed to start Play Mode.");
      }
    }
  };

  const zoomPresets = [25, 50, 75, 100, 150, 200];

  const handleZoomIn = () => {
    const nextZoom = Math.max(10, Math.min(500, viewportZoom + 10));
    setEditorState({ viewportZoom: nextZoom });
  };

  const handleZoomOut = () => {
    const nextZoom = Math.max(10, Math.min(500, viewportZoom - 10));
    setEditorState({ viewportZoom: nextZoom });
  };

  const triggerCenterOnObject = () => {
    if (!hasSelection) return;
    window.dispatchEvent(new CustomEvent("libre3d-center-on-selected"));
    setDropdownOpen(false);
  };

  const triggerOrientToObject = () => {
    if (!hasSelection) return;
    window.dispatchEvent(new CustomEvent("libre3d-orientate-to-selected"));
    setDropdownOpen(false);
  };

  return (
    <div className="topbar">
      <div className="topbar-left">
        <div className="avatar">E</div>
        <div style={{ position: "relative" }}>
          <div
            className="viewport-pill"
            style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: "4px" }}
            onClick={() => setDropdownOpen(!dropdownOpen)}
          >
            <span>{viewportZoom}%</span>
            <i className="ti ti-chevron-down" style={{ fontSize: "10px" }}></i>
          </div>
          {dropdownOpen && (
            <>
              <div
                style={{
                  position: "fixed",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  zIndex: 99,
                }}
                onClick={() => setDropdownOpen(false)}
              />
              <div
                style={{
                  position: "absolute",
                  top: "100%",
                  left: 0,
                  marginTop: "6px",
                  background: "#181d2e",
                  border: "1px solid rgba(255, 255, 255, 0.08)",
                  borderRadius: "6px",
                  boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.5)",
                  zIndex: 100,
                  minWidth: "160px",
                  overflow: "hidden",
                }}
              >
                {zoomPresets.map((preset) => (
                  <div
                    key={preset}
                    style={{
                      padding: "6px 12px",
                      cursor: "pointer",
                      fontSize: "11px",
                      color: viewportZoom === preset ? "#fff" : "rgba(255, 255, 255, 0.7)",
                      background: viewportZoom === preset ? "rgba(255, 255, 255, 0.08)" : "transparent",
                      transition: "background 0.15s, color 0.15s",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "rgba(255, 255, 255, 0.05)";
                      e.currentTarget.style.color = "#fff";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background =
                        viewportZoom === preset ? "rgba(255, 255, 255, 0.08)" : "transparent";
                      e.currentTarget.style.color =
                        viewportZoom === preset ? "#fff" : "rgba(255, 255, 255, 0.7)";
                    }}
                    onClick={() => {
                      setEditorState({ viewportZoom: preset });
                      setDropdownOpen(false);
                    }}
                  >
                    {preset}%
                  </div>
                ))}

                <div style={{ height: "1px", background: "rgba(255, 255, 255, 0.08)", margin: "4px 0" }} />

                {/* Zoom In */}
                <div
                  style={{
                    padding: "6px 12px",
                    cursor: "pointer",
                    fontSize: "11px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    color: "rgba(255, 255, 255, 0.7)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "rgba(255, 255, 255, 0.05)";
                    e.currentTarget.style.color = "#fff";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "transparent";
                    e.currentTarget.style.color = "rgba(255, 255, 255, 0.7)";
                  }}
                  onClick={handleZoomIn}
                >
                  <span>Zoom In</span>
                  <span style={{ fontSize: "9px", opacity: 0.5 }}>Ctrl + =</span>
                </div>

                {/* Zoom Out */}
                <div
                  style={{
                    padding: "6px 12px",
                    cursor: "pointer",
                    fontSize: "11px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    color: "rgba(255, 255, 255, 0.7)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "rgba(255, 255, 255, 0.05)";
                    e.currentTarget.style.color = "#fff";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "transparent";
                    e.currentTarget.style.color = "rgba(255, 255, 255, 0.7)";
                  }}
                  onClick={handleZoomOut}
                >
                  <span>Zoom Out</span>
                  <span style={{ fontSize: "9px", opacity: 0.5 }}>Ctrl + -</span>
                </div>

                <div style={{ height: "1px", background: "rgba(255, 255, 255, 0.08)", margin: "4px 0" }} />

                {/* Center on Object */}
                <div
                  style={{
                    padding: "6px 12px",
                    cursor: hasSelection ? "pointer" : "not-allowed",
                    fontSize: "11px",
                    color: hasSelection ? "rgba(255, 255, 255, 0.7)" : "rgba(255, 255, 255, 0.3)",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                  onMouseEnter={(e) => {
                    if (hasSelection) {
                      e.currentTarget.style.background = "rgba(255, 255, 255, 0.05)";
                      e.currentTarget.style.color = "#fff";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (hasSelection) {
                      e.currentTarget.style.background = "transparent";
                      e.currentTarget.style.color = "rgba(255, 255, 255, 0.7)";
                    }
                  }}
                  onClick={triggerCenterOnObject}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <i className="ti ti-focus-2" style={{ fontSize: "12px" }}></i>
                    <span>Center on Object</span>
                  </div>
                  <span style={{ fontSize: "9px", opacity: 0.5 }}>F</span>
                </div>

                {/* Orient to Object */}
                <div
                  style={{
                    padding: "6px 12px",
                    cursor: hasSelection ? "pointer" : "not-allowed",
                    fontSize: "11px",
                    color: hasSelection ? "rgba(255, 255, 255, 0.7)" : "rgba(255, 255, 255, 0.3)",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                  onMouseEnter={(e) => {
                    if (hasSelection) {
                      e.currentTarget.style.background = "rgba(255, 255, 255, 0.05)";
                      e.currentTarget.style.color = "#fff";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (hasSelection) {
                      e.currentTarget.style.background = "transparent";
                      e.currentTarget.style.color = "rgba(255, 255, 255, 0.7)";
                    }
                  }}
                  onClick={triggerOrientToObject}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <i className="ti ti-compass" style={{ fontSize: "12px" }}></i>
                    <span>Orient to Object</span>
                  </div>
                  <span style={{ fontSize: "9px", opacity: 0.5 }}>F</span>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
      <div className="topbar-right">
        <button
          className={`btn-chip ${isPreviewMode ? "stop-btn" : "play-btn"}`}
          onClick={handlePlayToggle}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "4px",
            background: isPreviewMode ? "var(--bg-danger, #ef4444)" : "var(--brand-primary, #10b981)",
            color: "#fff",
            border: "none",
          }}
        >
          <i className={isPreviewMode ? "ti ti-player-stop" : "ti ti-player-play"} style={{ fontSize: "12px" }}></i>
          <span>{isPreviewMode ? "Stop" : "Play"}</span>
        </button>
        <button
          className="btn-chip"
          disabled={isPreviewMode}
          onClick={() => {
            setActiveTab("share");
            setIsModalOpen(true);
          }}
        >
          Share
        </button>
        <button
          className="btn-chip primary"
          disabled={isPreviewMode}
          onClick={() => {
            setActiveTab("export");
            setIsModalOpen(true);
          }}
        >
          Export
        </button>
      </div>
    </div>
  );
}
