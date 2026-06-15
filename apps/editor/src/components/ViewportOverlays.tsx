import { useEditorStore } from "../store/useEditorStore";

export function ViewportOverlays() {
  const projectionMode = useEditorStore((state) => state.projectionMode);
  const setEditorState = useEditorStore((state) => state.setEditorState);

  return (
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
