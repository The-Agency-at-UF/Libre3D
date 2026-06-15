import { useEffect, useState } from "react";

import { HierarchyPanel } from "./components/HierarchyPanel";
import { ViewportCanvas } from "./components/ViewportCanvas";
import { useEditorStore } from "./store/useEditorStore";
import { exportLiveScene, getLiveScene } from "./utils/exportScene";
import { publishLiveScene } from "./utils/publishScene";

// Subcomponents
import { ViewportOverlays } from "./components/ViewportOverlays";
import { RightSidebar } from "./components/RightSidebar";
import { ExportModal } from "./components/ExportModal";

// Custom state hook
import { useRightSidebarState } from "./hooks/useRightSidebarState";

declare module "react" {
  namespace JSX {
    interface IntrinsicElements {
      "model-viewer": React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        src?: string | null;
        "camera-controls"?: boolean;
        "auto-rotate"?: boolean;
        ar?: boolean;
        style?: React.CSSProperties;
      };
    }
  }
}

function PublicViewer({ sceneId }: { sceneId: string }) {
  const [cloudAssetUrl, setCloudAssetUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    fetch(`/api/scene/${sceneId}`)
      .then((res) => {
        if (!res.ok) {
          throw new Error(`Failed to load scene (status ${res.status})`);
        }
        return res.json();
      })
      .then((data) => {
        if (active) {
          if (data && data.cloudAssetUrl) {
            setCloudAssetUrl(data.cloudAssetUrl);
          } else {
            throw new Error("No asset URL found in scene data");
          }
          setIsLoading(false);
        }
      })
      .catch((err) => {
        if (active) {
          console.error(err);
          setError(err instanceof Error ? err.message : "An error occurred");
          setIsLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [sceneId]);

  if (isLoading) {
    return (
      <div className="viewer-container viewer-status">
        <div className="viewer-spinner"></div>
        <p>Loading scene...</p>
      </div>
    );
  }

  if (error || !cloudAssetUrl) {
    return (
      <div className="viewer-container viewer-status viewer-error">
        <p>Error: {error || "Failed to load scene"}</p>
      </div>
    );
  }

  return (
    <div className="viewer-container">
      <model-viewer
        src={cloudAssetUrl}
        camera-controls
        auto-rotate
        style={{ width: "100%", height: "100%" }}
      />
    </div>
  );
}

export function App() {
  const match = window.location.pathname.match(/^\/v\/([^/]+)$/);
  const sceneId = match ? match[1] : null;

  if (sceneId) {
    return <PublicViewer sceneId={sceneId} />;
  }

  return <EditorApp />;
}

function EditorApp() {
  const entities = useEditorStore((state) => state.entities) ?? [];
  const currentPublishId = useEditorStore((state) => state.currentPublishId);
  const setCurrentPublishId = useEditorStore((state) => state.setCurrentPublishId);
  const addEntity = useEditorStore((state) => state.addEntity);
  const setEditorState = useEditorStore((state) => state.setEditorState);

  const activeTransformTool = useEditorStore((state) => state.activeTransformTool);
  const transformSpace = useEditorStore((state) => state.transformSpace);
  const isPreviewMode = useEditorStore((state) => state.isPreviewMode);
  const previewGlbUrl = useEditorStore((state) => state.previewGlbUrl);

  // Hook for right sidebar local UI state
  const sidebarUI = useRightSidebarState(currentPublishId);

  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const [theme, setTheme] = useState<"dark" | "light">(() => {
    const saved = localStorage.getItem("libre3d-theme");
    if (saved === "dark" || saved === "light") {
      return saved;
    }
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    return prefersDark ? "dark" : "light";
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "light") {
      root.classList.add("light-theme");
    } else {
      root.classList.remove("light-theme");
    }
    // Only save to localStorage if user explicitly interacts,
    // or keep the check clean:
    if (localStorage.getItem("libre3d-theme") !== null) {
      localStorage.setItem("libre3d-theme", theme);
    }
  }, [theme]);

  // Listen to system theme preference changes if no manual override exists
  useEffect(() => {
    const saved = localStorage.getItem("libre3d-theme");
    if (saved) return;

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = (e: MediaQueryListEvent) => {
      setTheme(e.matches ? "dark" : "light");
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => {
      mediaQuery.removeEventListener("change", handleChange);
    };
  }, []);

  const handleToggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    localStorage.setItem("libre3d-theme", nextTheme); // Explicit manual override
    setIsMenuOpen(false);
  };

  const handleNewFile = () => {
    if (window.confirm("Are you sure you want to clear the scene?")) {
      useEditorStore.setState({
        entities: [
          {
            id: "directional-light-1",
            type: "directionalLight",
            name: "Directional Light",
            position: [5, 8, 4],
            rotation: [0, 0, 0],
            scale: [1, 1, 1],
            color: "#ffffff",
            visible: true,
            locked: false,
          }
        ],
        selectedEntityId: null,
        activeCameraId: "default"
      });
      setIsMenuOpen(false);
    }
  };

  const handleDuplicate = () => {
    const selectedId = useEditorStore.getState().selectedEntityId;
    if (selectedId) {
      const entityToDuplicate = entities.find(e => e.id === selectedId);
      if (entityToDuplicate) {
        const newId = `entity-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
        const duplicatedEntity = {
          ...entityToDuplicate,
          id: newId,
          name: `${entityToDuplicate.name} (Copy)`,
          position: [
            entityToDuplicate.position[0] + 0.5,
            entityToDuplicate.position[1],
            entityToDuplicate.position[2] + 0.5
          ] as [number, number, number]
        };
        useEditorStore.setState({
          entities: [...entities, duplicatedEntity],
          selectedEntityId: newId
        });
      }
    } else {
      window.alert("Please select an object first to duplicate.");
    }
    setIsMenuOpen(false);
  };

  const handleResetCamera = () => {
    setEditorState({
      viewportZoom: 100,
      activeCameraId: "default",
      projectionMode: "perspective"
    });
    setIsMenuOpen(false);
  };

  const triggerPlaceholder = (action: string) => {
    window.alert(`${action} action triggered.`);
    setIsMenuOpen(false);
  };

  // Hotkeys for transform tools
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const activeEl = document.activeElement;
      if (
        activeEl &&
        (activeEl.tagName === "INPUT" ||
          activeEl.tagName === "TEXTAREA" ||
          activeEl.getAttribute("contenteditable") === "true")
      ) {
        return;
      }

      // Ctrl + Key or Cmd + Key shortcuts
      if (event.ctrlKey || event.metaKey) {
        if (event.key.toLowerCase() === "d") {
          event.preventDefault();
          handleDuplicate();
          return;
        }
        if (event.key.toLowerCase() === "n") {
          event.preventDefault();
          handleNewFile();
          return;
        }
      }

      switch (event.key.toLowerCase()) {
        case "w":
          setEditorState({ activeTransformTool: "translate" });
          break;
        case "e":
          setEditorState({ activeTransformTool: "rotate" });
          break;
        case "r":
          setEditorState({ activeTransformTool: "scale" });
          break;
        default:
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [setEditorState, entities]);

  const handleExportAsset = async (): Promise<void> => {
    if (sidebarUI.isExporting) {
      return;
    }

    const liveScene = getLiveScene();

    if (!liveScene) {
      window.alert("The live scene is not ready yet.");
      return;
    }

    sidebarUI.setIsExporting(true);

    try {
      const exported = await exportLiveScene(liveScene);

      if (!exported) {
        window.alert("There is no exportable mesh content in the current scene.");
      }
    } catch (error) {
      console.error("Failed to export the current scene.", error);
      window.alert("The scene could not be exported. Check the console for details.");
    } finally {
      sidebarUI.setIsExporting(false);
    }
  };

  const handleExportJson = () => {
    try {
      const dataStr = JSON.stringify(entities, null, 2);
      const blob = new Blob([dataStr], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const downloadAnchor = document.createElement("a");
      downloadAnchor.setAttribute("href", url);
      downloadAnchor.setAttribute("download", "libre3d-scene.json");
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Failed to export JSON:", error);
      window.alert("Failed to export JSON.");
    }
  };

  const handlePublishLink = async (): Promise<void> => {
    if (sidebarUI.isPublishing) {
      return;
    }

    const liveScene = getLiveScene();

    if (!liveScene) {
      window.alert("The live scene is not ready yet.");
      return;
    }

    sidebarUI.setIsPublishing(true);

    try {
      const publishResult = await publishLiveScene(liveScene, currentPublishId);

      if (!publishResult) {
        window.alert("There is no exportable mesh content in the current scene.");
        return;
      }

      setCurrentPublishId(publishResult.sceneId);
      sidebarUI.setShareUrl(`http://${window.location.host}/v/${publishResult.sceneId}`);
    } catch (error) {
      console.error("Failed to publish the current scene.", error);
      window.alert("The scene could not be published. Check the console for details.");
    } finally {
      sidebarUI.setIsPublishing(false);
    }
  };

  return (
    <>
      <div className="editor-shell">
        {/* Left Sidebar */}
        <aside className="left-sidebar" style={isPreviewMode ? { opacity: 0.5, pointerEvents: "none" } : undefined}>
          {/* Top Header Row Container */}
          <div className="left-sidebar-header">
            <button
              className="left-sidebar-header-btn"
              type="button"
              title="Back to Projects"
              onClick={() => {
                window.location.href = "/scenes";
              }}
            >
              <i className="ti ti-arrow-left" style={{ fontSize: "16px" }}></i>
            </button>
            
            <span className="left-sidebar-header-title" title="Untitled Scene">
              Untitled Scene
            </span>

            <div className="hamburger-menu-wrap">
              <button
                className="left-sidebar-header-btn"
                type="button"
                title="Menu"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                <i className="ti ti-menu-2" style={{ fontSize: "16px" }}></i>
              </button>

              {isMenuOpen && (
                <>
                  <div
                    style={{
                      position: "fixed",
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      zIndex: 999,
                    }}
                    onClick={() => setIsMenuOpen(false)}
                  />
                  <div className="hamburger-dropdown">
                    <button
                      className="hamburger-dropdown-btn"
                      type="button"
                      onClick={handleNewFile}
                    >
                      <span><i className="ti ti-file" style={{ marginRight: "6px" }}></i>New File</span>
                      <span className="hamburger-dropdown-shortcut">Ctrl+N</span>
                    </button>
                    <button
                      className="hamburger-dropdown-btn"
                      type="button"
                      onClick={handleDuplicate}
                    >
                      <span><i className="ti ti-copy" style={{ marginRight: "6px" }}></i>Duplicate</span>
                      <span className="hamburger-dropdown-shortcut">Ctrl+D</span>
                    </button>
                    <div style={{ height: "1px", background: "var(--border)", margin: "4px 0" }} />
                    <button
                      className="hamburger-dropdown-btn"
                      type="button"
                      onClick={() => triggerPlaceholder("Undo")}
                    >
                      <span><i className="ti ti-arrow-back-up" style={{ marginRight: "6px" }}></i>Undo</span>
                      <span className="hamburger-dropdown-shortcut">Ctrl+Z</span>
                    </button>
                    <button
                      className="hamburger-dropdown-btn"
                      type="button"
                      onClick={() => triggerPlaceholder("Redo")}
                    >
                      <span><i className="ti ti-arrow-forward-up" style={{ marginRight: "6px" }}></i>Redo</span>
                      <span className="hamburger-dropdown-shortcut">Ctrl+Y</span>
                    </button>
                    <div style={{ height: "1px", background: "var(--border)", margin: "4px 0" }} />
                    <button
                      className="hamburger-dropdown-btn"
                      type="button"
                      onClick={handleResetCamera}
                    >
                      <span><i className="ti ti-camera" style={{ marginRight: "6px" }}></i>Reset Camera</span>
                    </button>
                    <button
                      className="hamburger-dropdown-btn"
                      type="button"
                      onClick={handleToggleTheme}
                    >
                      <span><i className="ti ti-palette" style={{ marginRight: "6px" }}></i>Toggle Theme</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="left-sidebar-tabs">
            <button
              className={`left-sidebar-tab-btn ${sidebarUI.activeSidebarTab === "objects" ? "active" : ""}`}
              type="button"
              onClick={() => sidebarUI.setActiveSidebarTab("objects")}
            >
              Objects
            </button>
            <button
              className={`left-sidebar-tab-btn ${sidebarUI.activeSidebarTab === "assets" ? "active" : ""}`}
              type="button"
              onClick={() => sidebarUI.setActiveSidebarTab("assets")}
            >
              Assets
            </button>
          </div>

          {sidebarUI.activeSidebarTab === "assets" && (
            <div className="left-sidebar-search-box">
              <input
                className="sidebar-search-input"
                type="text"
                placeholder="Search directory..."
                value={sidebarUI.searchQuery}
                onChange={(e) => sidebarUI.setSearchQuery(e.target.value)}
              />
            </div>
          )}

          <div className="outliner-container">
            {sidebarUI.activeSidebarTab === "objects" ? (
              <HierarchyPanel searchQuery={sidebarUI.searchQuery} />
            ) : (
              <div className="editor-meta" style={{ padding: "0.5rem" }}>
                Asset browser is empty.
              </div>
            )}
          </div>
        </aside>

        {/* Center Viewport */}
        <div className="viewport-container">
          {/* Floating Layout Toolbar */}
          {!isPreviewMode && (
            <div className="floating-toolbar">
            <button
              className={`toolbar-btn ${activeTransformTool === "translate" ? "active-translate" : ""}`}
              type="button"
              title="Translate Tool"
              onClick={() => setEditorState({ activeTransformTool: "translate" })}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                width="16"
                height="16"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="5 9 2 12 5 15" />
                <polyline points="9 5 12 2 15 5" />
                <polyline points="15 19 12 22 9 19" />
                <polyline points="19 9 22 12 19 15" />
                <line x1="2" y1="12" x2="22" y2="12" />
                <line x1="12" y1="2" x2="12" y2="22" />
              </svg>
            </button>
            <button
              className={`toolbar-btn ${activeTransformTool === "rotate" ? "active-translate" : ""}`}
              type="button"
              title="Rotate Tool"
              onClick={() => setEditorState({ activeTransformTool: "rotate" })}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                width="16"
                height="16"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
              </svg>
            </button>
            <button
              className={`toolbar-btn ${activeTransformTool === "scale" ? "active-translate" : ""}`}
              type="button"
              title="Scale Tool"
              onClick={() => setEditorState({ activeTransformTool: "scale" })}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                width="16"
                height="16"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="2" y="2" width="6" height="6" rx="1" />
                <rect x="16" y="16" width="6" height="6" rx="1" />
                <path d="M8 8l8 8" />
              </svg>
            </button>

            <div style={{ width: "1px", background: "rgba(255, 255, 255, 0.15)", margin: "4px 2px" }}></div>

            <button
              className="toolbar-btn"
              style={{ fontSize: "10px", fontWeight: "bold", width: "auto", paddingInline: "8px", borderRadius: "999px" }}
              type="button"
              title="Toggle Transform Space (Local / World)"
              onClick={() => setEditorState({ transformSpace: transformSpace === "world" ? "local" : "world" })}
            >
              {transformSpace === "world" ? "Global" : "Local"}
            </button>

            {/* Add Shape Dropdown */}
            <div style={{ position: "relative", display: "inline-block" }}>
              <button
                className="toolbar-btn"
                type="button"
                title="Add Shape"
                onClick={() => sidebarUI.setIsShapeDropdownOpen(!sidebarUI.isShapeDropdownOpen)}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  width="16"
                  height="16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
              </button>
              {sidebarUI.isShapeDropdownOpen && (
                <div
                  style={{
                    position: "absolute",
                    top: "100%",
                    left: "50%",
                    transform: "translateX(-50%)",
                    marginTop: "8px",
                    background: "var(--bg-panel)",
                    border: "1px solid var(--border-strong)",
                    borderRadius: "var(--radius-sm)",
                    padding: "4px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "2px",
                    zIndex: 100,
                    minWidth: "100px",
                    boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
                  }}
                >
                  <button
                    style={{
                      background: "transparent",
                      border: "none",
                      color: "var(--text-primary)",
                      padding: "6px 10px",
                      borderRadius: "3px",
                      textAlign: "left",
                      fontSize: "11px",
                      cursor: "pointer",
                      fontFamily: "var(--font)",
                    }}
                    type="button"
                    onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-hover)")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                    onClick={() => {
                      addEntity("cube");
                      sidebarUI.setIsShapeDropdownOpen(false);
                    }}
                  >
                    + Cube
                  </button>
                  <button
                    style={{
                      background: "transparent",
                      border: "none",
                      color: "var(--text-primary)",
                      padding: "6px 10px",
                      borderRadius: "3px",
                      textAlign: "left",
                      fontSize: "11px",
                      cursor: "pointer",
                      fontFamily: "var(--font)",
                    }}
                    type="button"
                    onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-hover)")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                    onClick={() => {
                      addEntity("sphere");
                      sidebarUI.setIsShapeDropdownOpen(false);
                    }}
                  >
                    + Sphere
                  </button>
                  <button
                    style={{
                      background: "transparent",
                      border: "none",
                      color: "var(--text-primary)",
                      padding: "6px 10px",
                      borderRadius: "3px",
                      textAlign: "left",
                      fontSize: "11px",
                      cursor: "pointer",
                      fontFamily: "var(--font)",
                    }}
                    type="button"
                    onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-hover)")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                    onClick={() => {
                      addEntity("torus");
                      sidebarUI.setIsShapeDropdownOpen(false);
                    }}
                  >
                    + Torus
                  </button>
                  <button
                    style={{
                      background: "transparent",
                      border: "none",
                      color: "var(--text-primary)",
                      padding: "6px 10px",
                      borderRadius: "3px",
                      textAlign: "left",
                      fontSize: "11px",
                      cursor: "pointer",
                      fontFamily: "var(--font)",
                    }}
                    type="button"
                    onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-hover)")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                    onClick={() => {
                      addEntity("directionalLight");
                      sidebarUI.setIsShapeDropdownOpen(false);
                    }}
                  >
                    + Directional Light
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
          
          {isPreviewMode && previewGlbUrl && (
            <div style={{ width: "100%", height: "100%", position: "absolute", inset: 0, zIndex: 10, background: "#020617" }}>
              <model-viewer
                src={previewGlbUrl}
                camera-controls
                auto-rotate
                style={{ width: "100%", height: "100%" }}
              />
            </div>
          )}

          <ViewportCanvas />

          {!isPreviewMode && <ViewportOverlays />}
        </div>

        {/* Right Inspector Sidebar */}
        <RightSidebar
          setIsModalOpen={sidebarUI.setIsModalOpen}
          setActiveTab={sidebarUI.setActiveTab}
        />
      </div>

      <ExportModal
        isModalOpen={sidebarUI.isModalOpen}
        setIsModalOpen={sidebarUI.setIsModalOpen}
        activeTab={sidebarUI.activeTab}
        setActiveTab={sidebarUI.setActiveTab}
        isExporting={sidebarUI.isExporting}
        isPublishing={sidebarUI.isPublishing}
        shareUrl={sidebarUI.shareUrl}
        isCopied={sidebarUI.isCopied}
        setIsCopied={sidebarUI.setIsCopied}
        handleExportAsset={handleExportAsset}
        handleExportJson={handleExportJson}
        handlePublishLink={handlePublishLink}
      />
    </>
  );
}