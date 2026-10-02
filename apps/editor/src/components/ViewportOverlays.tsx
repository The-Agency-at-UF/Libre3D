import { useEditorStore } from "../store/useEditorStore";

// NOTE: this used to also render a `.axis-orb-gizmo` — a static, purely
// decorative SVG "3D Axis Gizmo" with no click/drag behavior. It's been
// replaced by a real, interactive navigation gizmo (Blender-style) docked to
// the top-right of the viewport instead of floating here at bottom-center:
// see `viewport/hooks/useViewportGizmo.ts` (wiring) and
// `viewport/gizmoTheme.ts` (styling — it also carries forward this
// placeholder's exact X/Y/Z axis colors, #ef4444/#22c55e/#3b82f6, so the
// app's "which color is which axis" convention didn't change). It's mounted
// directly into the Three.js canvas by that hook (inside
// ViewportCanvas.tsx), not rendered here as a sibling overlay, so there's no
// JSX replacement for it in this component.

export function ViewportOverlays() {
  const projectionMode = useEditorStore((state) => state.projectionMode);
  const setEditorState = useEditorStore((state) => state.setEditorState);

  return (
    <div className="viewport-bottom-overlays">
      <div className="projection-toggle-capsule">
        <button
          className={`projection-btn ${projectionMode === "perspective" ? "active" : ""}`}
          type="button"
          onClick={() => setEditorState({ projectionMode: "perspective" })}
        >
          Persp
        </button>
        <button
          className={`projection-btn ${projectionMode === "orthographic" ? "active" : ""}`}
          type="button"
          onClick={() => setEditorState({ projectionMode: "orthographic" })}
        >
          Ortho
        </button>
      </div>
    </div>
  );
}
