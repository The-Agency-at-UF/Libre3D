import { useEditorStore } from "../store/useEditorStore";
import { getViewedState } from "../animation/objectStates";

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
  const selectedEntityIds = useEditorStore((state) => state.selectedEntityIds);
  const viewedStates = useEditorStore((state) => state.viewedStates);
  const objectStates = useEditorStore((state) => state.animation.states);
  const isReadOnly = useEditorStore((state) => state.readOnlyReason !== null);
  const penMode = useEditorStore((state) => state.penTool?.mode ?? null);

  // The selected objects shown in one of their states, where their edits go.
  const selectedInStates = selectedEntityIds
    .map((id) => getViewedState(viewedStates, objectStates, id))
    .filter((objectState) => objectState !== null);
  const verb = isReadOnly ? "Viewing" : "Editing";

  return (
    <div className="viewport-bottom-overlays">
      {/* The pen's keys, since nothing else on screen says them. */}
      {penMode === "draw" && <div className="viewport-state-badge">Pen: click for a corner, drag for a curve · Enter to finish</div>}
      {/* So nobody edits a state thinking it's Base, even with the States section scrolled away. */}
      {selectedInStates.length > 0 && (
        <div className="viewport-state-badge">
          {selectedEntityIds.length === 1
            ? `${verb} ${selectedInStates[0].name}`
            : `${verb} states (${selectedInStates.length}/${selectedEntityIds.length})`}
        </div>
      )}
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
