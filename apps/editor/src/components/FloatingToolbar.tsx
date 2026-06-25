import { useEditorStore } from "../store/useEditorStore";

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

  return (
    <div className="floating-toolbar">
      {/* Translate Tool Button */}
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

      {/* Rotate Tool Button */}
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

      {/* Scale Tool Button */}
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
          </div>
        )}
      </div>
    </div>
  );
}
