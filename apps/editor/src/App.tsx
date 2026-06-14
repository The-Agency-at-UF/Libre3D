import { useEffect, useState } from "react";

import { EditorSidebar } from "./components/EditorSidebar";
import { HierarchyPanel } from "./components/HierarchyPanel";
import { ViewportCanvas } from "./components/ViewportCanvas";
import { useEditorStore } from "./store/useEditorStore";
import { exportLiveScene, getLiveScene } from "./utils/exportScene";
import { publishLiveScene } from "./utils/publishScene";

type TransformAxis = 0 | 1 | 2;

const VECTOR_LABELS = ["X", "Y", "Z"] as const;
const PROPERTY_KEYS = ["position", "rotation", "scale"] as const;

const updateVectorAxis = (
  vector: [number, number, number],
  axis: TransformAxis,
  rawValue: string,
): [number, number, number] => {
  const nextValue = Number.parseFloat(rawValue);

  if (Number.isNaN(nextValue)) {
    return vector;
  }

  return vector.map((value, index) => (index === axis ? nextValue : value)) as [
    number,
    number,
    number,
  ];
};

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
  const selectedEntityId = useEditorStore((state) => state.selectedEntityId);
  const currentPublishId = useEditorStore((state) => state.currentPublishId);
  const setCurrentPublishId = useEditorStore((state) => state.setCurrentPublishId);
  const addEntity = useEditorStore((state) => state.addEntity);
  const removeEntity = useEditorStore((state) => state.removeEntity);
  const selectEntity = useEditorStore((state) => state.selectEntity);
  const updateEntityTransform = useEditorStore((state) => state.updateEntityTransform);
  const [isExporting, setIsExporting] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"export" | "share">("export");
  const [isCopied, setIsCopied] = useState(false);
  const [shareUrl, setShareUrl] = useState<string | null>(
    currentPublishId ? `http://${window.location.host}/v/${currentPublishId}` : null,
  );
  const [activeSidebarTab, setActiveSidebarTab] = useState<"objects" | "assets">("objects");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTransformTool, setActiveTransformTool] = useState<"translate" | "rotate" | "scale">("translate");
  const [projectionMode, setProjectionMode] = useState<"perspective" | "orthographic">("perspective");
  const [transformSpace, setTransformSpace] = useState<"world" | "local">("world");

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

      switch (event.key.toLowerCase()) {
        case "w":
          setActiveTransformTool("translate");
          break;
        case "e":
          setActiveTransformTool("rotate");
          break;
        case "r":
          setActiveTransformTool("scale");
          break;
        default:
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);
  const [collapsibleStates, setCollapsibleStates] = useState<Record<string, boolean>>({
    frame: true,
    scene: true,
    globalSettings: true,
    materialAssets: true,
  });

  // Redesigned Sidebar States - Bound to useEditorStore
  const storeBgColor = useEditorStore((state) => state.bgColor);
  const setStoreBgColor = useEditorStore((state) => state.setBgColor);
  const bgColor = storeBgColor.replace("#", "");
  const setBgColor = (cleanColor: string) => setStoreBgColor("#" + cleanColor.replace("#", ""));

  const gridPlane = useEditorStore((state) => state.gridPlane);
  const setGridPlane = useEditorStore((state) => state.setGridPlane);

  const wireframeEnabled = useEditorStore((state) => state.wireframe);
  const setWireframeEnabled = useEditorStore((state) => state.setWireframe);

  const lightIntensity = useEditorStore((state) => state.lightIntensity);
  const setLightIntensity = useEditorStore((state) => state.setLightIntensity);

  const storeLightColor = useEditorStore((state) => state.lightColor);
  const setStoreLightColor = useEditorStore((state) => state.setLightColor);
  const lightColor = storeLightColor.replace("#", "");
  const setLightColor = (cleanColor: string) => setStoreLightColor("#" + cleanColor.replace("#", ""));

  const fogEnabled = useEditorStore((state) => state.fogEnabled);
  const setFogEnabled = useEditorStore((state) => state.setFogEnabled);

  // Frame
  const [viewport, setViewport] = useState("Personal Camera");
  const [resolution, setResolution] = useState("Responsive");
  const [autoZoom, setAutoZoom] = useState(false);
  const [hudOverlay, setHudOverlay] = useState("None");

  // Scene (Local states for layout visuals)
  const [bgAlpha, setBgAlpha] = useState("100%");
  const [environment, setEnvironment] = useState("Studio");
  const [lightAmbientEnabled, setLightAmbientEnabled] = useState(true);
  const [lightDirectionalEnabled, setLightDirectionalEnabled] = useState(true);
  const [lightShadow, setLightShadow] = useState("Soft");
  const [physicsEnabled, setPhysicsEnabled] = useState(false);
  const [gravityY, setGravityY] = useState(-9.8);
  const [collisionType, setCollisionType] = useState("Mesh");

  // Post Processing
  const [postProcessingEnabled, setPostProcessingEnabled] = useState(true);
  const [toneMap, setToneMap] = useState("ACES Filmic");
  const [exposure, setExposure] = useState(0.00);
  const [bloomEnabled, setBloomEnabled] = useState(true);
  const [bloomIntensity, setBloomIntensity] = useState(40);
  const [bloomThreshold, setBloomThreshold] = useState(0.85);
  const [bloomRadius, setBloomRadius] = useState(0.4);
  const [ssaoEnabled, setSsaoEnabled] = useState(false);
  const [ssaoIntensity, setSsaoIntensity] = useState(25);
  const [dofEnabled, setDofEnabled] = useState(false);
  const [dofFocusDist, setDofFocusDist] = useState(10.0);
  const [dofBokeh, setDofBokeh] = useState(0.30);
  const [chromaticAberrationEnabled, setChromaticAberrationEnabled] = useState(false);
  const [chromaticAberrationIntensity, setChromaticAberrationIntensity] = useState(0);
  const [motionBlurEnabled, setMotionBlurEnabled] = useState(false);
  const [motionBlurIntensity, setMotionBlurIntensity] = useState(0);
  const [filmGrainEnabled, setFilmGrainEnabled] = useState(false);
  const [filmGrainIntensity, setFilmGrainIntensity] = useState(0);
  const [vignetteEnabled, setVignetteEnabled] = useState(true);
  const [vignetteIntensity, setVignetteIntensity] = useState(15);
  const [outlineEnabled, setOutlineEnabled] = useState(false);
  const [outlineColor, setOutlineColor] = useState("5865F2");
  const [colorGradingEnabled, setColorGradingEnabled] = useState(false);
  const [colorGradingBrightness, setColorGradingBrightness] = useState(0.00);
  const [colorGradingContrast, setColorGradingContrast] = useState(0.00);
  const [colorGradingSaturation, setColorGradingSaturation] = useState(0.00);

  // Global Settings
  const [snapping, setSnapping] = useState("Object");
  const [snapSize, setSnapSize] = useState(1.0);
  const [renderer, setRenderer] = useState("WebGL 2");

  // Material Builder
  const [materialName, setMaterialName] = useState("New Material");
  const [materialType, setMaterialType] = useState("Standard (PBR)");
  const [materialBaseColor, setMaterialBaseColor] = useState("888888");
  const [materialMetalness, setMaterialMetalness] = useState(0.00);
  const [materialRoughness, setMaterialRoughness] = useState(0.50);
  const [materialOpacity, setMaterialOpacity] = useState(1.00);
  const [materialSide, setMaterialSide] = useState("Front");
  const [materialEmissiveColor, setMaterialEmissiveColor] = useState("000000");
  const [materialEmissiveIntensity, setMaterialEmissiveIntensity] = useState(0.0);
  const [materialClearcoat, setMaterialClearcoat] = useState(0.00);
  const [materialTransmission, setMaterialTransmission] = useState(0.00);
  const [materialIor, setMaterialIor] = useState(1.50);
  const [materialIridescence, setMaterialIridescence] = useState(0.00);
  const [materialLibraryTab, setMaterialLibraryTab] = useState("materials");
  const [activeMaterialCard, setActiveMaterialCard] = useState("rough");
  const [isShapeDropdownOpen, setIsShapeDropdownOpen] = useState(false);

  const renameEntity = useEditorStore((state) => state.renameEntity);

  const toggleCollapsible = (section: string) => {
    setCollapsibleStates((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const handleExportAsset = async (): Promise<void> => {
    if (isExporting) {
      return;
    }

    const liveScene = getLiveScene();

    if (!liveScene) {
      window.alert("The live scene is not ready yet.");
      return;
    }

    setIsExporting(true);

    try {
      const exported = await exportLiveScene(liveScene);

      if (!exported) {
        window.alert("There is no exportable mesh content in the current scene.");
      }
    } catch (error) {
      console.error("Failed to export the current scene.", error);
      window.alert("The scene could not be exported. Check the console for details.");
    } finally {
      setIsExporting(false);
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
    if (isPublishing) {
      return;
    }

    const liveScene = getLiveScene();

    if (!liveScene) {
      window.alert("The live scene is not ready yet.");
      return;
    }

    setIsPublishing(true);

    try {
      const publishResult = await publishLiveScene(liveScene, currentPublishId);

      if (!publishResult) {
        window.alert("There is no exportable mesh content in the current scene.");
        return;
      }

      setCurrentPublishId(publishResult.sceneId);
      setShareUrl(`http://${window.location.host}/v/${publishResult.sceneId}`);
    } catch (error) {
      console.error("Failed to publish the current scene.", error);
      window.alert("The scene could not be published. Check the console for details.");
    } finally {
      setIsPublishing(false);
    }
  };

  const selectedEntity =
    entities.find((entity) => entity.id === selectedEntityId) ?? null;

  return (
    <>
      <div className="editor-shell">
        {/* Left Sidebar */}
        <aside className="left-sidebar">
          <div className="left-sidebar-tabs">
            <button
              className={`left-sidebar-tab-btn ${activeSidebarTab === "objects" ? "active" : ""}`}
              type="button"
              onClick={() => setActiveSidebarTab("objects")}
            >
              Objects
            </button>
            <button
              className={`left-sidebar-tab-btn ${activeSidebarTab === "assets" ? "active" : ""}`}
              type="button"
              onClick={() => setActiveSidebarTab("assets")}
            >
              Assets
            </button>
          </div>

          <div className="left-sidebar-search-box">
            <input
              className="sidebar-search-input"
              type="text"
              placeholder="Search directory..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="outliner-container">
            {activeSidebarTab === "objects" ? (
              <HierarchyPanel searchQuery={searchQuery} />
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
          <div className="floating-toolbar">
            <button
              className={`toolbar-btn ${activeTransformTool === "translate" ? "active-translate" : ""}`}
              type="button"
              title="Translate Tool"
              onClick={() => setActiveTransformTool("translate")}
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
              onClick={() => setActiveTransformTool("rotate")}
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
              onClick={() => setActiveTransformTool("scale")}
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
              onClick={() => setTransformSpace((prev) => (prev === "world" ? "local" : "world"))}
            >
              {transformSpace === "world" ? "Global" : "Local"}
            </button>

            {/* Add Shape Dropdown */}
            <div style={{ position: "relative", display: "inline-block" }}>
              <button
                className="toolbar-btn"
                type="button"
                title="Add Shape"
                onClick={() => setIsShapeDropdownOpen(!isShapeDropdownOpen)}
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
              {isShapeDropdownOpen && (
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
                      setIsShapeDropdownOpen(false);
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
                      setIsShapeDropdownOpen(false);
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
                      setIsShapeDropdownOpen(false);
                    }}
                  >
                    + Torus
                  </button>
                </div>
              )}
            </div>
          </div>

          <ViewportCanvas
            activeTransformTool={activeTransformTool}
            transformSpace={transformSpace}
            projectionMode={projectionMode}
          />

          {/* Viewport Bottom Overlays */}
          <div className="viewport-bottom-overlays">
            <div className="axis-orb-gizmo" title="3D Axis Gizmo">
              <svg width="32" height="32" viewBox="0 0 32 32">
                <circle cx="16" cy="16" r="12" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" />
                <line x1="16" y1="16" x2="24" y2="16" stroke="#ef4444" strokeWidth="2.2" strokeLinecap="round" />
                <line x1="16" y1="16" x2="16" y2="8" stroke="#22c55e" strokeWidth="2.2" strokeLinecap="round" />
                <line x1="16" y1="16" x2="11" y2="21" stroke="#3b82f6" strokeWidth="2.2" strokeLinecap="round" />
                <circle cx="24" cy="16" r="2" fill="#ef4444" />
                <circle cx="16" cy="8" r="2" fill="#22c55e" />
                <circle cx="11" cy="21" r="2" fill="#3b82f6" />
              </svg>
            </div>
            <div className="projection-toggle-capsule">
              <button
                className={`projection-btn ${projectionMode === "perspective" ? "active" : ""}`}
                type="button"
                onClick={() => setProjectionMode("perspective")}
              >
                Persp
              </button>
              <button
                className={`projection-btn ${projectionMode === "orthographic" ? "active" : ""}`}
                type="button"
                onClick={() => setProjectionMode("orthographic")}
              >
                Ortho
              </button>
            </div>
          </div>
        </div>

        {/* Right Inspector Sidebar */}
        <aside className="right-sidebar panel" aria-label="Properties inspector">
          {/* TOPBAR */}
          <div className="topbar">
              <div className="topbar-left">
                  <div className="avatar">E</div>
                  <div className="viewport-pill">
                      <span>86%</span>
                      <i className="ti ti-chevron-down"></i>
                  </div>
              </div>
              <div className="topbar-right">
                  <button className="btn-chip" onClick={() => { setActiveTab("share"); setIsModalOpen(true); }}>Share</button>
                  <button className="btn-chip primary" onClick={() => { setActiveTab("export"); setIsModalOpen(true); }}>Export</button>
              </div>
          </div>

          {/* SCROLLABLE BODY */}
          <div className="panel-body">
              
              {/* ── TRANSFORM (Selected Entity Properties) ── */}
              {selectedEntity && (
                <>
                  <details open className="section">
                      <summary className="section-header">
                          <div className="section-title-row">
                              <i className="ti ti-arrows-maximize" style={{ fontSize: "12px", color: "var(--text-tertiary)" }}></i>
                              <span className="section-label">Transform</span>
                          </div>
                          <div className="section-actions">
                              <i className="chevron ti ti-chevron-right"></i>
                          </div>
                      </summary>
                      <div className="section-body">
                          <div className="prop">
                              <span className="prop-label">Name</span>
                              <input
                                  type="text"
                                  style={{ width: "60%" }}
                                  value={selectedEntity.name}
                                  disabled={selectedEntity.locked}
                                  onChange={(e) => renameEntity(selectedEntity.id, e.target.value)}
                              />
                          </div>
                          {PROPERTY_KEYS.map((property) => (
                              <div key={property} style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                                  <div className="prop-group-label" style={{ padding: "4px 0 2px" }}>{property}</div>
                                  <div className="two-col" style={{ display: "flex", gap: "4px" }}>
                                      {selectedEntity[property].map((value, index) => (
                                          <div key={index} style={{ display: "flex", alignItems: "center", gap: "3px", background: "var(--bg-input)", border: "1px solid var(--border)", borderRadius: "var(--radius-sm)", padding: "2px 4px" }}>
                                              <span style={{ color: "var(--text-tertiary)", fontWeight: "bold", fontSize: "9px" }}>{VECTOR_LABELS[index]}</span>
                                              <input
                                                  type="number"
                                                  step="0.1"
                                                  disabled={selectedEntity.locked}
                                                  style={{ background: "transparent", border: "none", color: "var(--text-primary)", width: "100%", padding: 0, fontSize: "10px", textAlign: "right" }}
                                                  value={value}
                                                  onChange={(event) =>
                                                      updateEntityTransform(selectedEntity.id, {
                                                          [property]: updateVectorAxis(
                                                              selectedEntity[property],
                                                              index as TransformAxis,
                                                              event.target.value,
                                                          ),
                                                      })
                                                  }
                                              />
                                          </div>
                                      ))}
                                  </div>
                              </div>
                          ))}
                      </div>
                  </details>
                  <div className="section-divider"></div>
                </>
              )}

              {/* ── FRAME ── */}
              <details open className="section">
                  <summary className="section-header">
                      <div className="section-title-row">
                          <i className="ti ti-layout" style={{ fontSize: "12px", color: "var(--text-tertiary)" }}></i>
                          <span className="section-label">Frame</span>
                      </div>
                      <div className="section-actions">
                          <i className="ti ti-maximize" aria-label="Fullscreen"></i>
                          <i className="chevron ti ti-chevron-right"></i>
                      </div>
                  </summary>
                  <div className="section-body">
                      <div className="prop">
                          <span className="prop-label">Viewport</span>
                          <div className="select-wrap w-60">
                              <select value={viewport} onChange={(e) => setViewport(e.target.value)}>
                                  <option>Personal Camera</option>
                                  <option>Top</option>
                                  <option>Front</option>
                                  <option>Right</option>
                              </select>
                          </div>
                      </div>
                      <div className="prop">
                          <span className="prop-label">Resolution</span>
                          <div className="select-wrap w-60">
                              <select value={resolution} onChange={(e) => setResolution(e.target.value)}>
                                  <option>Responsive</option>
                                  <option>1920 × 1080</option>
                                  <option>1280 × 720</option>
                                  <option>Square 1:1</option>
                              </select>
                          </div>
                      </div>
                      <div className="prop">
                          <span className="prop-label">Auto Zoom</span>
                          <div className="seg w-40">
                              <button className={`seg-btn ${autoZoom ? "on" : ""}`} onClick={() => setAutoZoom(true)}>On</button>
                              <button className={`seg-btn ${!autoZoom ? "on" : ""}`} onClick={() => setAutoZoom(false)}>Off</button>
                          </div>
                      </div>
                      <div className="prop">
                          <span className="prop-label">HUD Overlay</span>
                          <div className="select-wrap w-60">
                              <select value={hudOverlay} onChange={(e) => setHudOverlay(e.target.value)}>
                                  <option>None</option>
                                  <option>Stats</option>
                                  <option>Axes</option>
                                  <option>Grid</option>
                              </select>
                          </div>
                      </div>
                  </div>
              </details>

              <div className="section-divider"></div>

              {/* ── SCENE ── */}
              <details open className="section">
                  <summary className="section-header">
                      <div className="section-title-row">
                          <i className="ti ti-cube" style={{ fontSize: "12px", color: "var(--text-tertiary)" }}></i>
                          <span className="section-label">Scene</span>
                      </div>
                      <div className="section-actions">
                          <i className="chevron ti ti-chevron-right"></i>
                      </div>
                  </summary>
                  <div className="section-body">
                      <div className="prop">
                          <span className="prop-label">Background</span>
                          <div className="color-row w-60">
                              <div className="swatch" style={{ background: "#" + bgColor }} onClick={() => {
                                  const c = prompt("Enter Hex Color (e.g. 000000):", bgColor);
                                  if (c !== null) setBgColor(c.replace("#", ""));
                              }}></div>
                              <input type="text" className="hex-input" value={bgColor} onChange={(e) => setBgColor(e.target.value)} />
                              <input type="text" className="hex-input alpha-input" value={bgAlpha} onChange={(e) => setBgAlpha(e.target.value)} />
                          </div>
                      </div>

                      <div className="prop">
                          <span className="prop-label">Environment</span>
                          <div className="select-wrap w-60">
                              <select value={environment} onChange={(e) => setEnvironment(e.target.value)}>
                                  <option>Studio</option>
                                  <option>Outdoor</option>
                                  <option>Night</option>
                                  <option>Custom HDRI</option>
                              </select>
                          </div>
                      </div>

                      <div className="prop">
                          <span className="prop-label">Fog</span>
                          <label className="toggle">
                              <input type="checkbox" checked={fogEnabled} onChange={(e) => setFogEnabled(e.target.checked)} />
                              <span className="toggle-track"></span>
                          </label>
                      </div>

                      {/* LIGHTS nested */}
                      <details className="nested">
                          <summary className="nested-header">
                              <div className="nested-label">
                                  <i className="ti ti-sun"></i>
                                  <span>Lights</span>
                              </div>
                              <i className="chevron ti ti-chevron-right"></i>
                          </summary>
                          <div className="nested-body">
                              <div className="prop">
                                  <span className="prop-label">Ambient</span>
                                  <label className="toggle">
                                      <input type="checkbox" checked={lightAmbientEnabled} onChange={(e) => setLightAmbientEnabled(e.target.checked)} />
                                      <span className="toggle-track"></span>
                                  </label>
                              </div>
                              <div className="prop">
                                  <span className="prop-label">Intensity</span>
                                  <div className="slider-row w-60">
                                      <input type="range" min="0" max="2" step="0.05" value={lightIntensity} onChange={(e) => setLightIntensity(parseFloat(e.target.value))} />
                                      <span className="slider-val">{lightIntensity.toFixed(2)}</span>
                                  </div>
                              </div>
                              <div className="prop">
                                  <span className="prop-label">Directional</span>
                                  <label className="toggle">
                                      <input type="checkbox" checked={lightDirectionalEnabled} onChange={(e) => setLightDirectionalEnabled(e.target.checked)} />
                                      <span className="toggle-track"></span>
                                  </label>
                              </div>
                              <div className="prop">
                                  <span className="prop-label">Color</span>
                                  <div className="color-row">
                                      <div className="swatch" style={{ background: "#" + lightColor }} onClick={() => {
                                          const c = prompt("Enter Hex Color:", lightColor);
                                          if (c !== null) setLightColor(c.replace("#", ""));
                                      }}></div>
                                      <input type="text" className="hex-input" value={lightColor} onChange={(e) => setLightColor(e.target.value)} />
                                  </div>
                              </div>
                              <div className="prop">
                                  <span className="prop-label">Shadow</span>
                                  <div className="seg w-60">
                                      <button className={`seg-btn ${lightShadow === "Soft" ? "on" : ""}`} onClick={() => setLightShadow("Soft")}>Soft</button>
                                      <button className={`seg-btn ${lightShadow === "Hard" ? "on" : ""}`} onClick={() => setLightShadow("Hard")}>Hard</button>
                                      <button className={`seg-btn ${lightShadow === "Off" ? "on" : ""}`} onClick={() => setLightShadow("Off")}>Off</button>
                                  </div>
                              </div>
                          </div>
                      </details>

                      {/* SIMULATION nested */}
                      <details className="nested">
                          <summary className="nested-header">
                              <div className="nested-label">
                                  <i className="ti ti-atom-2"></i>
                                  <span>Simulation</span>
                              </div>
                              <i className="chevron ti ti-chevron-right"></i>
                          </summary>
                          <div className="nested-body">
                              <div className="prop">
                                  <span className="prop-label">Physics</span>
                                  <label className="toggle">
                                      <input type="checkbox" checked={physicsEnabled} onChange={(e) => setPhysicsEnabled(e.target.checked)} />
                                      <span className="toggle-track"></span>
                                  </label>
                              </div>
                              <div className="prop">
                                  <span className="prop-label">Gravity Y</span>
                                  <div className="slider-row w-60">
                                      <input type="range" min="-20" max="0" step="0.1" value={gravityY} onChange={(e) => setGravityY(parseFloat(e.target.value))} />
                                      <span className="slider-val">{gravityY.toFixed(1)}</span>
                                  </div>
                              </div>
                              <div className="prop">
                                  <span className="prop-label">Collision</span>
                                  <div className="select-wrap w-60">
                                      <select value={collisionType} onChange={(e) => setCollisionType(e.target.value)}>
                                          <option>Mesh</option>
                                          <option>Box</option>
                                          <option>Sphere</option>
                                          <option>Capsule</option>
                                      </select>
                                  </div>
                              </div>
                          </div>
                      </details>

                  </div>
              </details>

              <div className="section-divider"></div>

              {/* ── POST PROCESSING ── */}
              <details open className="section">
                  <summary className="section-header">
                      <div className="section-title-row">
                          <i className="ti ti-sparkles" style={{ fontSize: "12px", color: "var(--text-tertiary)" }}></i>
                          <span className="section-label">Post Processing</span>
                      </div>
                      <div className="section-actions" onClick={(e) => e.stopPropagation()}>
                          <label className="toggle">
                              <input type="checkbox" checked={postProcessingEnabled} onChange={(e) => setPostProcessingEnabled(e.target.checked)} />
                              <span className="toggle-track"></span>
                          </label>
                          <i className="chevron ti ti-chevron-right" onClick={(e) => { e.stopPropagation(); const d = e.currentTarget.closest("details"); if (d) d.open = !d.open; }}></i>
                      </div>
                  </summary>
                  <div className="section-body">

                      {/* Tone Mapping */}
                      <div className="prop">
                          <span className="prop-label">Tone Map</span>
                          <div className="select-wrap w-60">
                              <select value={toneMap} onChange={(e) => setToneMap(e.target.value)}>
                                  <option>ACES Filmic</option>
                                  <option>Reinhard</option>
                                  <option>Cineon</option>
                                  <option>AgX</option>
                                  <option>Linear</option>
                                  <option>None</option>
                              </select>
                          </div>
                      </div>
                      <div className="prop">
                          <span className="prop-label">Exposure</span>
                          <div className="slider-row w-60">
                              <input type="range" min="-2" max="2" step="0.05" value={exposure} onChange={(e) => setExposure(parseFloat(e.target.value))} />
                              <span className="slider-val">{exposure.toFixed(2)}</span>
                          </div>
                      </div>

                      <div className="section-divider" style={{ margin: "4px 0" }}></div>

                      {/* Effect rows grouped */}
                      <div className="effect-group">

                          {/* BLOOM */}
                          <details className="nested" style={{ all: "unset", display: "block" }}>
                              <summary style={{ all: "unset", display: "block" }}>
                                  <div className="effect-row" style={{ cursor: "pointer" }}>
                                      <i className="ti ti-stars effect-icon"></i>
                                      <span className="effect-name">Bloom</span>
                                      <div className="effect-controls" onClick={(e) => e.stopPropagation()}>
                                          <span className="effect-val">{bloomIntensity}%</span>
                                          <input type="range" style={{ width: "60px" }} min="0" max="100" value={bloomIntensity} onChange={(e) => setBloomIntensity(parseInt(e.target.value))} />
                                          <label className="toggle">
                                              <input type="checkbox" checked={bloomEnabled} onChange={(e) => setBloomEnabled(e.target.checked)} />
                                              <span className="toggle-track"></span>
                                          </label>
                                      </div>
                                  </div>
                              </summary>
                              <div className="effect-row sub">
                                  <span className="prop-label">Threshold</span>
                                  <div className="slider-row" style={{ flex: 1, marginLeft: "8px" }}>
                                      <input type="range" min="0" max="1" step="0.05" value={bloomThreshold} onChange={(e) => setBloomThreshold(parseFloat(e.target.value))} />
                                      <span className="slider-val">{bloomThreshold.toFixed(2)}</span>
                                  </div>
                              </div>
                              <div className="effect-row sub">
                                  <span className="prop-label">Radius</span>
                                  <div className="slider-row" style={{ flex: 1, marginLeft: "8px" }}>
                                      <input type="range" min="0" max="2" step="0.1" value={bloomRadius} onChange={(e) => setBloomRadius(parseFloat(e.target.value))} />
                                      <span className="slider-val">{bloomRadius.toFixed(1)}</span>
                                  </div>
                              </div>
                          </details>

                          {/* SSAO */}
                          <div className="effect-row">
                              <i className="ti ti-shadow effect-icon"></i>
                              <span className="effect-name">SSAO</span>
                              <div className="effect-controls">
                                  <span className="effect-val">{ssaoIntensity}%</span>
                                  <input type="range" style={{ width: "60px" }} min="0" max="100" value={ssaoIntensity} onChange={(e) => setSsaoIntensity(parseInt(e.target.value))} />
                                  <label className="toggle">
                                      <input type="checkbox" checked={ssaoEnabled} onChange={(e) => setSsaoEnabled(e.target.checked)} />
                                      <span className="toggle-track"></span>
                                  </label>
                              </div>
                          </div>

                          {/* DEPTH OF FIELD */}
                          <details className="nested" style={{ all: "unset", display: "block" }}>
                              <summary style={{ all: "unset", display: "block" }}>
                                  <div className="effect-row" style={{ cursor: "pointer" }}>
                                      <i className="ti ti-camera effect-icon"></i>
                                      <span className="effect-name">Depth of Field</span>
                                      <div className="effect-controls" onClick={(e) => e.stopPropagation()}>
                                          <label className="toggle">
                                              <input type="checkbox" checked={dofEnabled} onChange={(e) => setDofEnabled(e.target.checked)} />
                                              <span className="toggle-track"></span>
                                          </label>
                                      </div>
                                  </div>
                              </summary>
                              <div className="effect-row sub">
                                  <span className="prop-label">Focus dist.</span>
                                  <div className="slider-row" style={{ flex: 1, marginLeft: "8px" }}>
                                      <input type="range" min="0.1" max="50" step="0.1" value={dofFocusDist} onChange={(e) => setDofFocusDist(parseFloat(e.target.value))} />
                                      <span className="slider-val">{dofFocusDist.toFixed(1)}</span>
                                  </div>
                              </div>
                              <div className="effect-row sub">
                                  <span className="prop-label">Bokeh</span>
                                  <div className="slider-row" style={{ flex: 1, marginLeft: "8px" }}>
                                      <input type="range" min="0" max="1" step="0.05" value={dofBokeh} onChange={(e) => setDofBokeh(parseFloat(e.target.value))} />
                                      <span className="slider-val">{dofBokeh.toFixed(2)}</span>
                                  </div>
                              </div>
                          </details>

                          {/* CHROMATIC ABR */}
                          <div className="effect-row">
                              <i className="ti ti-color-filter effect-icon"></i>
                              <span className="effect-name">Chromatic Aberration</span>
                              <div className="effect-controls">
                                  <span className="effect-val">{chromaticAberrationIntensity}%</span>
                                  <input type="range" style={{ width: "60px" }} min="0" max="100" value={chromaticAberrationIntensity} onChange={(e) => setChromaticAberrationIntensity(parseInt(e.target.value))} />
                                  <label className="toggle">
                                      <input type="checkbox" checked={chromaticAberrationEnabled} onChange={(e) => setChromaticAberrationEnabled(e.target.checked)} />
                                      <span className="toggle-track"></span>
                                  </label>
                              </div>
                          </div>

                          {/* MOTION BLUR */}
                          <div className="effect-row">
                              <i className="ti ti-wind effect-icon"></i>
                              <span className="effect-name">Motion Blur</span>
                              <div className="effect-controls">
                                  <span className="effect-val">{motionBlurIntensity}%</span>
                                  <input type="range" style={{ width: "60px" }} min="0" max="100" value={motionBlurIntensity} onChange={(e) => setMotionBlurIntensity(parseInt(e.target.value))} />
                                  <label className="toggle">
                                      <input type="checkbox" checked={motionBlurEnabled} onChange={(e) => setMotionBlurEnabled(e.target.checked)} />
                                      <span className="toggle-track"></span>
                                  </label>
                              </div>
                          </div>

                          {/* FILM GRAIN */}
                          <div className="effect-row">
                              <i className="ti ti-grain effect-icon"></i>
                              <span className="effect-name">Film Grain</span>
                              <div className="effect-controls">
                                  <span className="effect-val">{filmGrainIntensity}%</span>
                                  <input type="range" style={{ width: "60px" }} min="0" max="100" value={filmGrainIntensity} onChange={(e) => setFilmGrainIntensity(parseInt(e.target.value))} />
                                  <label className="toggle">
                                      <input type="checkbox" checked={filmGrainEnabled} onChange={(e) => setFilmGrainEnabled(e.target.checked)} />
                                      <span className="toggle-track"></span>
                                  </label>
                              </div>
                          </div>

                          {/* VIGNETTE */}
                          <div className="effect-row">
                              <i className="ti ti-circle-half-vertical effect-icon"></i>
                              <span className="effect-name">Vignette</span>
                              <div className="effect-controls">
                                  <span className="effect-val">{vignetteIntensity}%</span>
                                  <input type="range" style={{ width: "60px" }} min="0" max="100" value={vignetteIntensity} onChange={(e) => setVignetteIntensity(parseInt(e.target.value))} />
                                  <label className="toggle">
                                      <input type="checkbox" checked={vignetteEnabled} onChange={(e) => setVignetteEnabled(e.target.checked)} />
                                      <span className="toggle-track"></span>
                                  </label>
                              </div>
                          </div>

                          {/* OUTLINE */}
                          <div className="effect-row">
                              <i className="ti ti-vector-triangle effect-icon"></i>
                              <span className="effect-name">Outline</span>
                              <div className="effect-controls">
                                  <div className="swatch" style={{ background: "#" + outlineColor, width: "14px", height: "14px", borderRadius: "3px" }} onClick={() => {
                                      const c = prompt("Enter Outline Hex Color:", outlineColor);
                                      if (c !== null) setOutlineColor(c.replace("#", ""));
                                  }}></div>
                                  <label className="toggle">
                                      <input type="checkbox" checked={outlineEnabled} onChange={(e) => setOutlineEnabled(e.target.checked)} />
                                      <span className="toggle-track"></span>
                                  </label>
                              </div>
                          </div>

                          {/* COLOR GRADING */}
                          <details className="nested" style={{ all: "unset", display: "block" }}>
                              <summary style={{ all: "unset", display: "block" }}>
                                  <div className="effect-row" style={{ cursor: "pointer", borderBottom: "none" }}>
                                      <i className="ti ti-adjustments-horizontal effect-icon"></i>
                                      <span className="effect-name">Color Grading</span>
                                      <div className="effect-controls" onClick={(e) => e.stopPropagation()}>
                                          <label className="toggle">
                                              <input type="checkbox" checked={colorGradingEnabled} onChange={(e) => setColorGradingEnabled(e.target.checked)} />
                                              <span className="toggle-track"></span>
                                          </label>
                                      </div>
                                  </div>
                              </summary>
                              <div className="effect-row sub">
                                  <span className="prop-label">Brightness</span>
                                  <div className="slider-row" style={{ flex: 1, marginLeft: "8px" }}>
                                      <input type="range" min="-1" max="1" step="0.05" value={colorGradingBrightness} onChange={(e) => setColorGradingBrightness(parseFloat(e.target.value))} />
                                      <span className="slider-val">{colorGradingBrightness.toFixed(2)}</span>
                                  </div>
                              </div>
                              <div className="effect-row sub">
                                  <span className="prop-label">Contrast</span>
                                  <div className="slider-row" style={{ flex: 1, marginLeft: "8px" }}>
                                      <input type="range" min="-1" max="1" step="0.05" value={colorGradingContrast} onChange={(e) => setColorGradingContrast(parseFloat(e.target.value))} />
                                      <span className="slider-val">{colorGradingContrast.toFixed(2)}</span>
                                  </div>
                              </div>
                              <div className="effect-row sub" style={{ borderBottom: "none" }}>
                                  <span className="prop-label">Saturation</span>
                                  <div className="slider-row" style={{ flex: 1, marginLeft: "8px" }}>
                                      <input type="range" min="-1" max="1" step="0.05" value={colorGradingSaturation} onChange={(e) => setColorGradingSaturation(parseFloat(e.target.value))} />
                                      <span className="slider-val">{colorGradingSaturation.toFixed(2)}</span>
                                  </div>
                              </div>
                          </details>

                      </div>{/* /effect-group */}
                  </div>
              </details>

              <div className="section-divider"></div>

              {/* ── GLOBAL SETTINGS ── */}
              <details className="section">
                  <summary className="section-header">
                      <div className="section-title-row">
                          <i className="ti ti-settings" style={{ fontSize: "12px", color: "var(--text-tertiary)" }}></i>
                          <span className="section-label">Global Settings</span>
                      </div>
                      <div className="section-actions">
                          <i className="chevron ti ti-chevron-right"></i>
                      </div>
                  </summary>
                  <div className="section-body">
                      <div className="prop">
                          <span className="prop-label">Grid Plane</span>
                          <div className="select-wrap w-60 font-inherit">
                              <select value={gridPlane} onChange={(e) => setGridPlane(e.target.value)}>
                                  <option>Floor (XZ)</option>
                                  <option>Wall (XY)</option>
                                  <option>Side (YZ)</option>
                                  <option>None</option>
                              </select>
                          </div>
                      </div>
                      <div className="prop">
                          <span className="prop-label">Snapping</span>
                          <div className="seg" style={{ width: "60%" }}>
                              <button className={`seg-btn ${snapping === "Object" ? "on" : ""}`} onClick={() => setSnapping("Object")}>Object</button>
                              <button className={`seg-btn ${snapping === "Grid" ? "on" : ""}`} onClick={() => setSnapping("Grid")}>Grid</button>
                              <button className={`seg-btn ${snapping === "Off" ? "on" : ""}`} onClick={() => setSnapping("Off")}>Off</button>
                          </div>
                      </div>
                      <div className="prop">
                          <span className="prop-label">Snap Size</span>
                          <div className="slider-row w-60">
                              <input type="range" min="0.1" max="5" step="0.1" value={snapSize} onChange={(e) => setSnapSize(parseFloat(e.target.value))} />
                              <span className="slider-val">{snapSize.toFixed(1)}</span>
                          </div>
                      </div>
                      <div className="prop">
                          <span className="prop-label">Wireframe</span>
                          <label className="toggle">
                              <input type="checkbox" checked={wireframeEnabled} onChange={(e) => setWireframeEnabled(e.target.checked)} />
                              <span className="toggle-track"></span>
                          </label>
                      </div>
                      <div className="prop">
                          <span className="prop-label">Renderer</span>
                          <div className="select-wrap w-60">
                              <select value={renderer} onChange={(e) => setRenderer(e.target.value)}>
                                  <option>WebGL 2</option>
                                  <option>WebGPU</option>
                              </select>
                          </div>
                      </div>
                  </div>
              </details>

              <div className="section-divider"></div>

              {/* ── MATERIAL BUILDER ── */}
              <details open className="section">
                  <summary className="section-header">
                      <div className="section-title-row">
                          <i className="ti ti-sphere" style={{ fontSize: "12px", color: "var(--text-tertiary)" }}></i>
                          <span className="section-label">Material</span>
                      </div>
                      <div className="section-actions">
                          <i className="ti ti-plus" aria-label="New material" onClick={() => { setMaterialName("New Material"); setMaterialBaseColor("888888"); }}></i>
                          <i className="chevron ti ti-chevron-right"></i>
                      </div>
                  </summary>
                  <div className="section-body">

                      {/* Preview + Name */}
                      <div className="mat-preview-row">
                          <div className="mat-sphere" id="mat-sphere" style={{
                              background: `radial-gradient(circle at 38% 35%, #${selectedEntity ? selectedEntity.color.replace("#", "") : materialBaseColor}, #111)`
                          }}></div>
                          <div className="mat-name-col">
                              <input
                                  type="text"
                                  className="mat-name-input"
                                  value={selectedEntity ? selectedEntity.name : materialName}
                                  onChange={(e) => {
                                      if (selectedEntity) {
                                          renameEntity(selectedEntity.id, e.target.value);
                                      } else {
                                          setMaterialName(e.target.value);
                                      }
                                  }}
                              />
                              <div className="mat-type-tag">MeshStandardMaterial</div>
                          </div>
                      </div>

                      {/* Material Type */}
                      <div className="prop">
                          <span className="prop-label">Type</span>
                          <div className="select-wrap w-60">
                              <select value={materialType} onChange={(e) => setMaterialType(e.target.value)}>
                                  <option>Standard (PBR)</option>
                                  <option>Physical</option>
                                  <option>Toon</option>
                                  <option>Lambert</option>
                                  <option>Phong</option>
                                  <option>Normal</option>
                                  <option>Depth</option>
                                  <option>Custom Shader</option>
                              </select>
                          </div>
                      </div>

                      {/* ── PBR SURFACE ── */}
                      <div className="prop-group-label">Surface</div>

                      <div className="prop">
                          <span className="prop-label">Base Color</span>
                          <div className="color-row">
                              <div className="swatch" id="base-swatch" style={{
                                  background: selectedEntity ? selectedEntity.color : "#" + materialBaseColor
                              }} onClick={() => {
                                  const defaultC = selectedEntity ? selectedEntity.color : "#" + materialBaseColor;
                                  const c = prompt("Enter Base Color Hex:", defaultC);
                                  if (c !== null) {
                                      const cleanHex = c.startsWith("#") ? c : "#" + c;
                                      if (selectedEntity) {
                                          updateEntityTransform(selectedEntity.id, { color: cleanHex });
                                      } else {
                                          setMaterialBaseColor(cleanHex.replace("#", ""));
                                      }
                                  }
                              }}></div>
                              <input
                                  type="text"
                                  className="hex-input"
                                  value={selectedEntity ? selectedEntity.color.replace("#", "") : materialBaseColor}
                                  onChange={(e) => {
                                      const nextColor = e.target.value;
                                      if (selectedEntity) {
                                          updateEntityTransform(selectedEntity.id, { color: "#" + nextColor });
                                      } else {
                                          setMaterialBaseColor(nextColor);
                                      }
                                  }}
                              />
                          </div>
                      </div>

                      <div className="prop">
                          <span className="prop-label">Metalness</span>
                          <div className="slider-row w-60">
                              <input type="range" min="0" max="1" step="0.01" value={materialMetalness} onChange={(e) => setMaterialMetalness(parseFloat(e.target.value))} />
                              <span className="slider-val">{materialMetalness.toFixed(2)}</span>
                          </div>
                      </div>

                      <div className="prop">
                          <span className="prop-label">Roughness</span>
                          <div className="slider-row w-60">
                              <input type="range" min="0" max="1" step="0.01" value={materialRoughness} onChange={(e) => setMaterialRoughness(parseFloat(e.target.value))} />
                              <span className="slider-val">{materialRoughness.toFixed(2)}</span>
                          </div>
                      </div>

                      <div className="prop">
                          <span className="prop-label">Opacity</span>
                          <div className="slider-row w-60">
                              <input type="range" min="0" max="1" step="0.01" value={materialOpacity} onChange={(e) => setMaterialOpacity(parseFloat(e.target.value))} />
                              <span className="slider-val">{materialOpacity.toFixed(2)}</span>
                          </div>
                      </div>

                      <div className="prop">
                          <span className="prop-label">Side</span>
                          <div className="seg" style={{ width: "60%" }}>
                              <button className={`seg-btn ${materialSide === "Front" ? "on" : ""}`} onClick={() => setMaterialSide("Front")}>Front</button>
                              <button className={`seg-btn ${materialSide === "Back" ? "on" : ""}`} onClick={() => setMaterialSide("Back")}>Back</button>
                              <button className={`seg-btn ${materialSide === "Both" ? "on" : ""}`} onClick={() => setMaterialSide("Both")}>Both</button>
                          </div>
                      </div>

                      {/* ── EMISSION ── */}
                      <div className="prop-group-label">Emission</div>
                      <div className="prop">
                          <span className="prop-label">Emissive</span>
                          <div className="color-row">
                              <div className="swatch" style={{ background: "#" + materialEmissiveColor }} onClick={() => {
                                  const c = prompt("Enter Emissive Hex Color:", materialEmissiveColor);
                                  if (c !== null) setMaterialEmissiveColor(c.replace("#", ""));
                              }}></div>
                              <input type="text" className="hex-input" value={materialEmissiveColor} onChange={(e) => setMaterialEmissiveColor(e.target.value)} />
                          </div>
                      </div>
                      <div className="prop">
                          <span className="prop-label">Intensity</span>
                          <div className="slider-row w-60">
                              <input type="range" min="0" max="10" step="0.1" value={materialEmissiveIntensity} onChange={(e) => setMaterialEmissiveIntensity(parseFloat(e.target.value))} />
                              <span className="slider-val">{materialEmissiveIntensity.toFixed(1)}</span>
                          </div>
                      </div>

                      {/* ── ADVANCED (Physical only) ── */}
                      {materialType === "Physical" && (
                          <>
                              <div className="prop-group-label">Advanced</div>
                              <div className="prop">
                                  <span className="prop-label">Clearcoat</span>
                                  <div className="slider-row w-60">
                                      <input type="range" min="0" max="1" step="0.01" value={materialClearcoat} onChange={(e) => setMaterialClearcoat(parseFloat(e.target.value))} />
                                      <span className="slider-val">{materialClearcoat.toFixed(2)}</span>
                                  </div>
                              </div>
                              <div className="prop">
                                  <span className="prop-label">Transmission</span>
                                  <div className="slider-row w-60">
                                      <input type="range" min="0" max="1" step="0.01" value={materialTransmission} onChange={(e) => setMaterialTransmission(parseFloat(e.target.value))} />
                                      <span className="slider-val">{materialTransmission.toFixed(2)}</span>
                                  </div>
                              </div>
                              <div className="prop">
                                  <span className="prop-label">IOR</span>
                                  <div className="slider-row w-60">
                                      <input type="range" min="1" max="2.5" step="0.01" value={materialIor} onChange={(e) => setMaterialIor(parseFloat(e.target.value))} />
                                      <span className="slider-val">{materialIor.toFixed(2)}</span>
                                  </div>
                              </div>
                              <div className="prop">
                                  <span className="prop-label">Iridescence</span>
                                  <div className="slider-row w-60">
                                      <input type="range" min="0" max="1" step="0.01" value={materialIridescence} onChange={(e) => setMaterialIridescence(parseFloat(e.target.value))} />
                                      <span className="slider-val">{materialIridescence.toFixed(2)}</span>
                                  </div>
                              </div>
                          </>
                      )}

                      {/* ── MAPS slots ── */}
                      <div className="prop-group-label">Maps</div>

                      <div className="map-row">
                          <div className="map-thumb"><i className="ti ti-photo"></i></div>
                          <span className="map-name">Map</span>
                          <i className="map-action ti ti-arrow-bar-to-down"></i>
                      </div>

                      <div className="map-row">
                          <div className="map-thumb"><i className="ti ti-photo"></i></div>
                          <span className="map-name">Normal Map</span>
                          <i className="map-action ti ti-arrow-bar-to-down"></i>
                      </div>

                      <div className="map-row">
                          <div className="map-thumb"><i className="ti ti-photo"></i></div>
                          <span className="map-name">Roughness Map</span>
                          <i className="map-action ti ti-arrow-bar-to-down"></i>
                      </div>

                      <div className="map-row">
                          <div className="map-thumb"><i className="ti ti-photo"></i></div>
                          <span className="map-name">Metalness Map</span>
                          <i className="map-action ti ti-arrow-bar-to-down"></i>
                      </div>

                      {/* ── ASSET LIBRARY ── */}
                      <div className="prop-group-label" style={{ padding: "12px 0 6px" }}>Asset Library</div>

                      <div className="lib-tabs">
                          <button className={`lib-tab ${materialLibraryTab === "materials" ? "on" : ""}`} onClick={() => setMaterialLibraryTab("materials")}>
                              <i className="ti ti-sphere"></i>
                              <span>Mats</span>
                          </button>
                          <button className={`lib-tab ${materialLibraryTab === "textures" ? "on" : ""}`} onClick={() => setMaterialLibraryTab("textures")}>
                              <i className="ti ti-photo"></i>
                              <span>Texs</span>
                          </button>
                          <button className={`lib-tab ${materialLibraryTab === "shaders" ? "on" : ""}`} onClick={() => setMaterialLibraryTab("shaders")}>
                              <i className="ti ti-terminal-2"></i>
                              <span>Shad</span>
                          </button>
                      </div>

                      {materialLibraryTab === "materials" && (
                          <div style={{ display: "flex", flexDirection: "column", gap: "6px", marginTop: "6px" }}>
                              <div className={`asset-card ${activeMaterialCard === "metal" ? "active" : ""}`} onClick={() => {
                                  setActiveMaterialCard("metal");
                                  setMaterialName("Chrome Steel");
                                  setMaterialType("Physical");
                                  setMaterialBaseColor("D0D0D0");
                                  setMaterialMetalness(1.0);
                                  setMaterialRoughness(0.05);
                                  setMaterialClearcoat(0.8);
                              }}>
                                  <div className="mat-ball metal"></div>
                                  <div className="card-info">
                                      <div className="card-name">Chrome Steel</div>
                                      <div className="card-meta">Physical PBR • 1.2 MB</div>
                                  </div>
                                  <div className="card-actions">
                                      <i className="ti ti-heart"></i>
                                      <i className="ti ti-dots-vertical"></i>
                                  </div>
                              </div>

                              <div className={`asset-card ${activeMaterialCard === "glass" ? "active" : ""}`} onClick={() => {
                                  setActiveMaterialCard("glass");
                                  setMaterialName("Frosted Glass");
                                  setMaterialType("Physical");
                                  setMaterialBaseColor("B4DCFF");
                                  setMaterialMetalness(0.0);
                                  setMaterialRoughness(0.15);
                                  setMaterialTransmission(0.9);
                                  setMaterialIor(1.52);
                              }}>
                                  <div className="mat-ball glass"></div>
                                  <div className="card-info">
                                      <div className="card-name">Frosted Glass</div>
                                      <div className="card-meta">Physical PBR • 400 KB</div>
                                  </div>
                                  <div className="card-actions">
                                      <i className="ti ti-heart"></i>
                                      <i className="ti ti-dots-vertical"></i>
                                  </div>
                              </div>

                              <div className={`asset-card ${activeMaterialCard === "emissive" ? "active" : ""}`} onClick={() => {
                                  setActiveMaterialCard("emissive");
                                  setMaterialName("Neon Glow");
                                  setMaterialType("Standard (PBR)");
                                  setMaterialBaseColor("4C1D95");
                                  setMaterialEmissiveColor("A78BFA");
                                  setMaterialEmissiveIntensity(5.0);
                              }}>
                                  <div className="mat-ball emissive"></div>
                                  <div className="card-info">
                                      <div className="card-name">Neon Glow</div>
                                      <div className="card-meta">Standard PBR • 120 KB</div>
                                  </div>
                                  <div className="card-actions">
                                      <i className="ti ti-heart"></i>
                                      <i className="ti ti-dots-vertical"></i>
                                  </div>
                              </div>

                              <div className={`asset-card ${activeMaterialCard === "rough" ? "active" : ""}`} onClick={() => {
                                  setActiveMaterialCard("rough");
                                  setMaterialName("Terracotta Clay");
                                  setMaterialType("Standard (PBR)");
                                  setMaterialBaseColor("C2956A");
                                  setMaterialMetalness(0.0);
                                  setMaterialRoughness(0.9);
                              }}>
                                  <div className="mat-ball rough"></div>
                                  <div className="card-info">
                                      <div className="card-name">Terracotta Clay</div>
                                      <div className="card-meta">Standard PBR • 3.4 MB</div>
                                  </div>
                                  <div className="card-actions">
                                      <i className="ti ti-heart"></i>
                                      <i className="ti ti-dots-vertical"></i>
                                  </div>
                              </div>
                          </div>
                      )}

                      {materialLibraryTab === "textures" && (
                          <div className="editor-meta" style={{ padding: "0.5rem", fontSize: "10.5px" }}>
                              Texture assets list is empty.
                          </div>
                      )}

                      {materialLibraryTab === "shaders" && (
                          <div className="editor-meta" style={{ padding: "0.5rem", fontSize: "10.5px" }}>
                              Custom shader templates list is empty.
                          </div>
                      )}

                      <div className="section-footer">
                          <button className="footer-btn" onClick={() => alert("Material configuration saved locally!")}>
                              <i className="ti ti-device-floppy"></i>
                              <span>Save Mat</span>
                          </button>
                          <button className="footer-btn" onClick={() => {
                              setMaterialName("New Material");
                              setMaterialType("Standard (PBR)");
                              setMaterialBaseColor("888888");
                              setMaterialMetalness(0.00);
                              setMaterialRoughness(0.50);
                              setMaterialOpacity(1.00);
                              setMaterialSide("Front");
                              setMaterialEmissiveColor("000000");
                              setMaterialEmissiveIntensity(0.0);
                              setActiveMaterialCard("");
                          }}>
                              <i className="ti ti-rotate"></i>
                              <span>Reset</span>
                          </button>
                      </div>

                  </div>
              </details>

          </div>
        </aside>
      </div>

      {isModalOpen ? (
        <div className="editor-modal-backdrop" role="presentation" onClick={() => setIsModalOpen(false)}>
          <section
            className="editor-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-dialog-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="modal-tabs">
              <button
                className={`modal-tab-btn ${activeTab === "export" ? "active" : ""}`}
                type="button"
                onClick={() => setActiveTab("export")}
              >
                Export Asset
              </button>
              <button
                className={`modal-tab-btn ${activeTab === "share" ? "active" : ""}`}
                type="button"
                onClick={() => setActiveTab("share")}
              >
                Share Scene
              </button>
            </div>

            {activeTab === "export" ? (
              <div className="modal-tab-content">
                <h2 className="editor-modal-title" id="modal-dialog-title">
                  Export Scene Options
                </h2>
                <p className="editor-modal-copy">
                  Download the current scene locally as a standard 3D asset or save its configuration data.
                </p>
                <div className="modal-export-actions">
                  <button
                    className="editor-action editor-action--primary"
                    type="button"
                    onClick={handleExportAsset}
                    disabled={isExporting}
                  >
                    {isExporting ? "Exporting GLB..." : "Download 3D Asset (.glb)"}
                  </button>
                  <button
                    className="editor-action"
                    type="button"
                    onClick={handleExportJson}
                  >
                    Download Scene Config (.json)
                  </button>
                </div>
              </div>
            ) : (
              <div className="modal-tab-content">
                <h2 className="editor-modal-title" id="modal-dialog-title">
                  Publish to the Cloud
                </h2>
                <p className="editor-modal-copy">
                  Upload your scene to generate a shareable, interactive public view page.
                </p>
                <div className="modal-share-actions">
                  <button
                    className="editor-action editor-action--publish"
                    type="button"
                    onClick={handlePublishLink}
                    disabled={isPublishing}
                  >
                    {isPublishing ? "Publishing..." : currentPublishId ? "Update Published Scene" : "Publish Scene to Cloud"}
                  </button>

                  {shareUrl ? (
                    <div className="share-url-container">
                      <input
                        className="share-url-input"
                        type="text"
                        readOnly
                        value={shareUrl}
                      />
                      <button
                        className="editor-action copy-btn"
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(shareUrl)
                            .then(() => {
                              setIsCopied(true);
                              setTimeout(() => setIsCopied(false), 2000);
                            })
                            .catch((err) => {
                              console.error("Failed to copy", err);
                            });
                        }}
                      >
                        {isCopied ? "Copied!" : "Copy Link"}
                      </button>
                    </div>
                  ) : null}
                </div>
              </div>
            )}

            <div className="editor-modal-actions">
              <button
                className="editor-action"
                type="button"
                onClick={() => setIsModalOpen(false)}
              >
                Close
              </button>
            </div>
          </section>
        </div>
      ) : null}
    </>
  );
}