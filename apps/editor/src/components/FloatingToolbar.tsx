import { useEffect, useRef, useState } from "react";
import { useEditorStore } from "../store/useEditorStore";
import { TranslateIcon, RotateIcon, ScaleIcon, PenIcon, PathIcon, CheckIcon, PlusIcon } from "./ui/Icons";
import { prepareModelImport } from "../utils/importModel";
import { importSvgFile, isSvgFile } from "../utils/importSvg";
import { importImageFile, isImageFile } from "../utils/importImage";

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
  const isDrawing = useEditorStore((state) => state.penTool?.mode === "draw");
  const draws = useEditorStore((state) => (state.penTool?.mode === "draw" ? (state.penTool.draws ?? "shape") : null));
  const isReadOnly = useEditorStore((state) => state.readOnlyReason !== null);
  const setEditorState = useEditorStore((state) => state.setEditorState);
  const setPenTool = useEditorStore((state) => state.setPenTool);
  const addEntity = useEditorStore((state) => state.addEntity);
  const addImportedModelHierarchy = useEditorStore((state) => state.addImportedModelHierarchy);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isPenMenuOpen, setIsPenMenuOpen] = useState(false);
  const penMenuRef = useRef<HTMLDivElement | null>(null);

  // A press anywhere outside the pen menu closes it.
  useEffect(() => {
    if (!isPenMenuOpen) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!penMenuRef.current?.contains(event.target as Node)) setIsPenMenuOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown, true);
    return () => document.removeEventListener("pointerdown", onPointerDown, true);
  }, [isPenMenuOpen]);

  const handleFileSelected = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    if (isSvgFile(file)) {
      await importSvgFile(file).catch((error) => console.error("[Libre3D] Failed to import SVG:", error));
      return;
    }
    if (isImageFile(file)) {
      await importImageFile(file).catch((error) => console.error("[Libre3D] Failed to import image:", error));
      return;
    }

    useEditorStore.getState().adjustPendingImports(1);
    try {
      const { assetId, nodes } = await prepareModelImport(file);
      addImportedModelHierarchy(assetId, nodes);
    } catch (error) {
      console.error("[Libre3D] Failed to import model:", error);
    } finally {
      useEditorStore.getState().adjustPendingImports(-1);
    }
  };

  return (
    <div className="floating-toolbar">
      {/* Translate Tool Button (a transform tool puts the pen down) */}
      <button
        className={`toolbar-btn ${activeTransformTool === "translate" && !isDrawing ? "active-translate" : ""}`}
        type="button"
        title="Translate Tool"
        onClick={() => setEditorState({ activeTransformTool: "translate", penTool: null })}
      >
        <TranslateIcon />
      </button>

      {/* Rotate Tool Button */}
      <button
        className={`toolbar-btn ${activeTransformTool === "rotate" && !isDrawing ? "active-translate" : ""}`}
        type="button"
        title="Rotate Tool"
        onClick={() => setEditorState({ activeTransformTool: "rotate", penTool: null })}
      >
        <RotateIcon />
      </button>

      {/* Scale Tool Button */}
      <button
        className={`toolbar-btn ${activeTransformTool === "scale" && !isDrawing ? "active-translate" : ""}`}
        type="button"
        title="Scale Tool"
        onClick={() => setEditorState({ activeTransformTool: "scale", penTool: null })}
      >
        <ScaleIcon />
      </button>

      {/* Pen: a menu of what it draws, filled shapes (Pen) or tube paths (Path) (useViewportPenTool).
          Picking the one that's on puts the pen down. Not while view only. */}
      <div ref={penMenuRef} style={{ position: "relative", display: "inline-block" }}>
        <button
          className={`toolbar-btn ${isDrawing ? "active-translate" : ""}`}
          type="button"
          title="Pen (P)"
          disabled={isReadOnly}
          onClick={() => setIsPenMenuOpen(!isPenMenuOpen)}
        >
          {draws === "path" ? <PathIcon /> : <PenIcon />}
        </button>
        {isPenMenuOpen && !isReadOnly && (
          <div className="pen-menu">
            {(
              [
                { kind: "shape", label: "Pen", icon: <PenIcon /> },
                { kind: "path", label: "Path", icon: <PathIcon /> },
              ] as const
            ).map(({ kind, label, icon }) => (
              <button
                key={kind}
                className="pen-menu-item"
                type="button"
                onClick={() => {
                  setPenTool(draws === kind ? null : { mode: "draw", pathId: null, selectedPoints: [], draws: kind });
                  setIsPenMenuOpen(false);
                }}
              >
                <span className="pen-menu-check">{draws === kind && <CheckIcon />}</span>
                {icon}
                {label}
              </button>
            ))}
          </div>
        )}
      </div>

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
                addEntity("path");
                setIsShapeDropdownOpen(false);
              }}
            >
              + Path
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
              Import...
            </button>
          </div>
        )}
        {/* A model (.glb), a drawing whose strokes become paths (.svg), or a picture on a plane */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".glb,.svg,.png,.jpg,.jpeg"
          style={{ display: "none" }}
          onChange={handleFileSelected}
        />
      </div>
    </div>
  );
}

