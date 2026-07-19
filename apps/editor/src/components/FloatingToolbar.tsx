import { useRef } from "react";
import { useEditorStore } from "../store/useEditorStore";
import { TranslateIcon, RotateIcon, ScaleIcon, PlusIcon } from "./ui/Icons";
import { prepareModelImport } from "../utils/importModel";

interface FloatingToolbarProps {
  isShapeDropdownOpen: boolean;
  setIsShapeDropdownOpen: (open: boolean) => void;
}

/*
 * BLOCK: FloatingToolbar (React Component)
 * PURPOSE: Renders the toolbar overlays in the center of the viewport canvas, providing buttons
 *          to select transform tools (translate, rotate, scale), toggle transform space (Local/Global),
 *          and add primitives (Cubes, Spheres, Toruses, Lights) via a dropdown menu.
 */
export function FloatingToolbar({
  isShapeDropdownOpen,
  setIsShapeDropdownOpen,
}: FloatingToolbarProps) {
  // Read state and setters directly from the shared Zustand store
  const activeTransformTool = useEditorStore((state) => state.activeTransformTool);
  const transformSpace = useEditorStore((state) => state.transformSpace);
  const setEditorState = useEditorStore((state) => state.setEditorState);
  const addEntity = useEditorStore((state) => state.addEntity);
  const addImportedModelHierarchy = useEditorStore((state) => state.addImportedModelHierarchy);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileSelected = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    try {
      const { assetId, nodes } = await prepareModelImport(file);
      addImportedModelHierarchy(assetId, nodes);
    } catch (error) {
      console.error("[Libre3D] Failed to import model:", error);
    }
  };

  return (
    <div className="floating-toolbar">
      {/* Translate Tool Button */}
      <button
        className={`toolbar-btn ${activeTransformTool === "translate" ? "active-translate" : ""}`}
        type="button"
        title="Translate Tool"
        onClick={() => setEditorState({ activeTransformTool: "translate" })}
      >
        <TranslateIcon />
      </button>

      {/* Rotate Tool Button */}
      <button
        className={`toolbar-btn ${activeTransformTool === "rotate" ? "active-translate" : ""}`}
        type="button"
        title="Rotate Tool"
        onClick={() => setEditorState({ activeTransformTool: "rotate" })}
      >
        <RotateIcon />
      </button>

      {/* Scale Tool Button */}
      <button
        className={`toolbar-btn ${activeTransformTool === "scale" ? "active-translate" : ""}`}
        type="button"
        title="Scale Tool"
        onClick={() => setEditorState({ activeTransformTool: "scale" })}
      >
        <ScaleIcon />
      </button>

      <div style={{ width: "1px", background: "rgba(255, 255, 255, 0.15)", margin: "4px 2px" }}></div>

      {/* Local/World Transform Space Toggle Button */}
      <button
        className="toolbar-btn"
        style={{ fontSize: "10px", fontWeight: "bold", width: "auto", paddingInline: "8px", borderRadius: "999px" }}
        type="button"
        title="Toggle Transform Space (Local / World)"
        onClick={() => setEditorState({ transformSpace: transformSpace === "world" ? "local" : "world" })}
      >
        {transformSpace === "world" ? "Global" : "Local"}
      </button>

      {/* Add Shape Dropdown Wrapper */}
      <div style={{ position: "relative", display: "inline-block" }}>
        <button
          className="toolbar-btn"
          type="button"
          title="Add Shape"
          onClick={() => setIsShapeDropdownOpen(!isShapeDropdownOpen)}
        >
          <PlusIcon />
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
                setIsShapeDropdownOpen(false);
              }}
            >
              + Directional Light
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
                fileInputRef.current?.click();
                setIsShapeDropdownOpen(false);
              }}
            >
              Import Model...
            </button>
          </div>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept=".glb"
          style={{ display: "none" }}
          onChange={handleFileSelected}
        />
      </div>
    </div>
  );
}

