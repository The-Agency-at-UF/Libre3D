import { useEffect, useState } from "react";

// tsx components for editor scene and UI
import { HierarchyPanel } from "./components/HierarchyPanel";
import { ViewportCanvas } from "./components/ViewportCanvas";
import { ViewportOverlays } from "./components/ViewportOverlays";
import { RightSidebar } from "./components/RightSidebar";
import { ExportModal } from "./components/ExportModal";
import { PublicViewer } from "./components/PublicViewer";
import { HamburgerMenu } from "./components/HamburgerMenu";
import { FloatingToolbar } from "./components/FloatingToolbar";

// Custom state hook to manage right sidebar UI states like exporting, publishing, search, and tab selections
import { useRightSidebarState } from "./hooks/useRightSidebarState";
import { useHotkeys } from "./hooks/useHotkeys";

//import tsx utils for editor export and publish
import { exportLiveScene, getLiveScene, createDownload } from "./utils/exportScene";
import { publishLiveScene } from "./utils/publishScene";

//import tsx hook for editor store
import { initialFrameDefaults, useEditorStore } from "./store/useEditorStore";


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
  const setEditorState = useEditorStore((state) => state.setEditorState);
  const duplicateEntity = useEditorStore((state) => state.duplicateEntity);
  const sceneSettings = useEditorStore((state) => state.sceneSettings);
  const updateSceneSettings = useEditorStore((state) => state.updateSceneSettings);
  const showAxisGuides = sceneSettings.showAxisGuides === true;
  const handleToggleAxisGuides = () => updateSceneSettings({ showAxisGuides: !showAxisGuides });

  const isPreviewMode = useEditorStore((state) => state.isPreviewMode);
  const previewGlbUrl = useEditorStore((state) => state.previewGlbUrl);

  // Hook for right sidebar local UI state
  const sidebarUI = useRightSidebarState(currentPublishId);

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
        selectedEntityIds: [],
        activeProfileId: "personal",
        cameraProfiles: {
          personal: {
            id: "personal",
            name: "Personal Camera",
            position: [0, 5, 10],
            target: [0, 0, 0],
            fov: 45,
            near: 0.1,
            far: 100,
            zoom: 1,
          },
        },
        frame: { ...initialFrameDefaults },
        activeTransformTool: "translate"
      });
    }
  };

  const handleDuplicate = () => {
    const selectedIds = useEditorStore.getState().selectedEntityIds;
    if (selectedIds.length > 0) {
      duplicateEntity(selectedIds);
    } else {
      window.alert("Please select an object first to duplicate.");
    }
  };

  const handleResetCamera = () => {
    setEditorState({
      viewportZoom: 100,
      activeProfileId: "personal",
      projectionMode: "perspective"
    });
  };

  // Global Hotkeys
  useHotkeys({
    onDuplicate: handleDuplicate,
    onNewFile: handleNewFile
  });

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
      createDownload(dataStr, "libre3d-scene.json", "application/json");
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

            <HamburgerMenu
              onNewFile={handleNewFile}
              onDuplicate={handleDuplicate}
              onResetCamera={handleResetCamera}
              onToggleTheme={handleToggleTheme}
              showAxisGuides={showAxisGuides}
              onToggleAxisGuides={handleToggleAxisGuides}
            />
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
            <FloatingToolbar
              isShapeDropdownOpen={sidebarUI.isShapeDropdownOpen}
              setIsShapeDropdownOpen={sidebarUI.setIsShapeDropdownOpen}
            />
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