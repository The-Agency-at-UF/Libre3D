import { useEffect, useRef, useState, type ReactNode } from "react";

// tsx components for editor scene and UI
import { HierarchyPanel } from "./HierarchyPanel";
import { ViewportCanvas } from "./ViewportCanvas";
import { ViewportOverlays } from "./ViewportOverlays";
import { RightSidebar } from "./RightSidebar";
import { ExportModal } from "./ExportModal";
import { HamburgerMenu, type MenuAccount } from "./HamburgerMenu";
import { FloatingToolbar } from "./FloatingToolbar";
import { PreviewControls } from "./PreviewControls";

// Custom state hook to manage right sidebar UI states like exporting, publishing, search, and tab selections
import { useRightSidebarState } from "../hooks/useRightSidebarState";
import { useHotkeys } from "../hooks/useHotkeys";
import { usePreviewSession } from "../hooks/usePreviewSession";

//import tsx utils for editor export and publish
import { exportLiveScene, getLiveScene, createDownload } from "../utils/exportScene";
import { publishLiveScene } from "../utils/publishScene";
import { ApiAuthError } from "../utils/apiFetch";
import { getModelViewerCamera } from "../utils/previewCamera";
import { getSafeColor } from "../utils/sceneColor";
import { toggleTheme } from "../utils/theme";

//import tsx hook for editor store
import { useEditorStore } from "../store/useEditorStore";

// Dev-only console handle for manual smoke tests (store actions are exercised from the devtools
// console). Set here rather than in main.tsx so the store, and the Three.js it imports, stay in the
// editor's chunks.
if (import.meta.env.DEV) {
  (window as unknown as Record<string, unknown>).__libre3dStore = useEditorStore;
}

export interface EditorLayoutProps {
  /** The header's back button: its tooltip and where it goes. */
  backTitle: string;
  onBack: () => void;
  /** Under the back button: the scene's name and save status. */
  headerText: ReactNode;
  /** False while the scene is view only: the menu items that would change it are disabled. */
  canEdit: boolean;
  /** The menu's New Scene and Ctrl+N. */
  onNewFile: () => void;
  /** Who is signed in, with Sign Out, in the menu. Null for a guest. */
  account: MenuAccount | null;
  /** Shown in the floating toolbar's place, e.g. why the scene is view only. Null shows the toolbar. */
  viewOnlyBanner: ReactNode | null;
  /** The cloud scene that Share publishes. Null hides Share (a guest's scene isn't in the cloud). */
  publishing: { sceneId: string; initialPublishId: string | null } | null;
}

/*
 * BLOCK: EditorLayout (React Component)
 * PURPOSE: The editor itself: hierarchy, viewport, inspector, preview, and the export/share dialog.
 *          Where the scene comes from and how it's kept are the caller's: the cloud editor
 *          (EditorApp.tsx) adds the editing lock and autosave, the guest editor (GuestEditorApp.tsx)
 *          keeps one scene in this browser.
 */
export function EditorLayout({
  backTitle,
  onBack,
  headerText,
  canEdit,
  onNewFile,
  account,
  viewOnlyBanner,
  publishing,
}: EditorLayoutProps) {
  const entities = useEditorStore((state) => state.entities) ?? [];
  // The scene's share link once published. Kept on its row by the server; publishing the first
  // time sets it, and it never changes after that.
  const [publishId, setPublishId] = useState<string | null>(publishing?.initialPublishId ?? null);
  const setEditorState = useEditorStore((state) => state.setEditorState);
  const duplicateEntity = useEditorStore((state) => state.duplicateEntity);
  const sceneSettings = useEditorStore((state) => state.sceneSettings);
  const updateSceneSettings = useEditorStore((state) => state.updateSceneSettings);
  const showAxisGuides = sceneSettings.showAxisGuides === true;
  const handleToggleAxisGuides = () => updateSceneSettings({ showAxisGuides: !showAxisGuides });

  const isPreviewMode = useEditorStore((state) => state.isPreviewMode);
  const previewGlbUrl = useEditorStore((state) => state.previewGlbUrl);
  const activeCameraProfile = useEditorStore((state) => state.cameraProfiles[state.activeProfileId]);
  // Stable strings for a given profile, so React only writes the attributes when
  // the editor camera actually moved — never mid-preview while the viewer orbits.
  const previewCamera = activeCameraProfile ? getModelViewerCamera(activeCameraProfile) : null;
  const modelViewerRef = useRef<(HTMLElement & { jumpCameraToGoal?: () => void }) | null>(null);

  // Leaving the editor (Back, or the projects button) unmounts it without a page
  // reload, so end any preview here: otherwise its blob URL leaks and the editor
  // reopens in preview mode next time.
  const { stopPreview } = usePreviewSession();
  useEffect(() => () => {
    if (useEditorStore.getState().isPreviewMode) {
      stopPreview();
    }
  }, [stopPreview]);

  // model-viewer eases toward a new camera goal. That easing is wrong here — it is
  // a follower of the editor's OrbitControls, so anything but an immediate jump
  // leaves the preview trailing the viewport during a drag.
  useEffect(() => {
    modelViewerRef.current?.jumpCameraToGoal?.();
  }, [previewCamera?.cameraOrbit, previewCamera?.cameraTarget, previewCamera?.fieldOfView]);

  // Hook for right sidebar local UI state
  const sidebarUI = useRightSidebarState();

  // Left sidebar width — non-persisted-store UI state (local component state,
  // per the "no parallel stores" rule), persisted like the theme (utils/theme.ts)
  // via a plain localStorage key instead of useEditorStore.
  const LEFT_SIDEBAR_MIN_WIDTH = 220;
  const LEFT_SIDEBAR_MAX_WIDTH = 520;
  const [leftSidebarWidth, setLeftSidebarWidth] = useState<number>(() => {
    const saved = Number(localStorage.getItem("libre3d-left-sidebar-width"));
    return Number.isFinite(saved) && saved > 0 ? saved : 260;
  });

  const handleSidebarResizeStart = (e: React.PointerEvent) => {
    e.preventDefault();
    const startX = e.clientX;
    const startWidth = leftSidebarWidth;

    const onPointerMove = (moveEvent: PointerEvent) => {
      const next = Math.min(
        LEFT_SIDEBAR_MAX_WIDTH,
        Math.max(LEFT_SIDEBAR_MIN_WIDTH, startWidth + (moveEvent.clientX - startX))
      );
      setLeftSidebarWidth(next);
    };

    const onPointerUp = () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
      setLeftSidebarWidth((width) => {
        localStorage.setItem("libre3d-left-sidebar-width", String(width));
        return width;
      });
    };

    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
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
    onNewFile,
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
    if (!publishing || sidebarUI.isPublishing) {
      return;
    }

    const liveScene = getLiveScene();

    if (!liveScene) {
      window.alert("The live scene is not ready yet.");
      return;
    }

    sidebarUI.setIsPublishing(true);

    try {
      // Read at publish time (not from the render closure) so a colour picked just before
      // clicking Share is what gets published.
      const bgColor = getSafeColor(useEditorStore.getState().sceneSettings.bgColor);
      // Publishing requires a signed-in user; the server checks the session's access token.
      const publishResult = await publishLiveScene(liveScene, publishing.sceneId, bgColor);

      if (!publishResult) {
        window.alert("There is no exportable mesh content in the current scene.");
        return;
      }

      setPublishId(publishResult.publishId);
    } catch (error) {
      if (error instanceof ApiAuthError) {
        window.alert(error.message);
        return;
      }

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
        <aside
          className="left-sidebar"
          style={{
            width: leftSidebarWidth,
            // Hidden, not unmounted: the hierarchy panel's collapse state is
            // deliberately non-persisted, so unmounting would reset it every
            // time the user previews.
            ...(isPreviewMode ? { display: "none" } : {}),
          }}
        >
          {/* Top Header Row Container */}
          <div className="left-sidebar-header">
            <button
              className="left-sidebar-header-btn"
              type="button"
              title={backTitle}
              onClick={onBack}
            >
              <i className="ti ti-arrow-left" style={{ fontSize: "16px" }}></i>
            </button>
            
            <div className="left-sidebar-header-text">{headerText}</div>

            <HamburgerMenu
              canEdit={canEdit}
              onNewFile={onNewFile}
              onDuplicate={handleDuplicate}
              onResetCamera={handleResetCamera}
              onToggleTheme={toggleTheme}
              showAxisGuides={showAxisGuides}
              onToggleAxisGuides={handleToggleAxisGuides}
              account={account}
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

          <div
            className="left-sidebar-resize-handle"
            onPointerDown={handleSidebarResizeStart}
            role="separator"
            aria-orientation="vertical"
            aria-label="Resize left sidebar"
          />
        </aside>

        {/* Center Viewport */}
        <div className="viewport-container">
          {/* Floating Layout Toolbar, or why there's none (e.g. the scene is open for editing elsewhere) */}
          {!isPreviewMode &&
            (viewOnlyBanner ?? (
              <FloatingToolbar
                isShapeDropdownOpen={sidebarUI.isShapeDropdownOpen}
                setIsShapeDropdownOpen={sidebarUI.setIsShapeDropdownOpen}
              />
            ))}
          
          {isPreviewMode && previewGlbUrl && previewCamera && (
            // On top of the viewport canvas, but pointer-events:none, so the
            // editor's own camera controls keep working: every pointer/wheel
            // gesture falls through to the canvas and its OrbitControls, which
            // write to the camera profile this element follows.
            //
            // It has to be on top, not underneath: model-viewer stops rendering
            // entirely while its element is occluded (its internal canvas goes
            // display:none and only a resize re-evaluates it), so stacking it
            // behind the canvas leaves preview blank.
            <div
              style={{
                width: "100%",
                height: "100%",
                position: "absolute",
                inset: 0,
                zIndex: 10,
                pointerEvents: "none",
                background: getSafeColor(sceneSettings.bgColor),
              }}
            >
              {/* Preview opens on the editor's own camera and holds still: no
                  auto-fit zoom, no auto-rotate. model-viewer's own camera-controls
                  are deliberately off — it is a follower here, driven entirely by
                  the editor's OrbitControls, so interpolation is disabled to keep
                  it locked to the viewport rather than easing a frame behind. */}
              <model-viewer
                ref={modelViewerRef}
                src={previewGlbUrl}
                camera-orbit={previewCamera.cameraOrbit}
                camera-target={previewCamera.cameraTarget}
                field-of-view={previewCamera.fieldOfView}
                min-camera-orbit={previewCamera.minCameraOrbit}
                max-camera-orbit={previewCamera.maxCameraOrbit}
                min-field-of-view={previewCamera.minFieldOfView}
                max-field-of-view={previewCamera.maxFieldOfView}
                tone-mapping="neutral"
                style={{ width: "100%", height: "100%", backgroundColor: getSafeColor(sceneSettings.bgColor) }}
              >
                {/* Replaces model-viewer's default poster, whose button is the one
                    thing in its shadow DOM that sets pointer-events:auto and would
                    swallow camera gestures until the model reveals. */}
                <div slot="poster" style={{ width: "100%", height: "100%", pointerEvents: "none", background: getSafeColor(sceneSettings.bgColor) }} />
              </model-viewer>
            </div>
          )}

          {isPreviewMode && <PreviewControls />}

          <ViewportCanvas />

          {!isPreviewMode && <ViewportOverlays />}
        </div>

        {/* Right Inspector Sidebar */}
        <RightSidebar
          setIsModalOpen={sidebarUI.setIsModalOpen}
          setActiveTab={sidebarUI.setActiveTab}
          canShare={publishing !== null}
        />
      </div>

      <ExportModal
        isModalOpen={sidebarUI.isModalOpen}
        setIsModalOpen={sidebarUI.setIsModalOpen}
        activeTab={sidebarUI.activeTab}
        setActiveTab={sidebarUI.setActiveTab}
        isExporting={sidebarUI.isExporting}
        isPublishing={sidebarUI.isPublishing}
        canShare={publishing !== null}
        publishId={publishId}
        isCopied={sidebarUI.isCopied}
        setIsCopied={sidebarUI.setIsCopied}
        handleExportAsset={handleExportAsset}
        handleExportJson={handleExportJson}
        handlePublishLink={handlePublishLink}
      />
    </>
  );
}