export interface Vector3InputProps {
  label: string;
  values: [number, number, number];
  onChange: (index: number, val: number) => void;
}

export function Vector3Input({ label, values, onChange }: Vector3InputProps) {
  return (
    <div style={{ display: "grid", gap: "6px", margin: "4px 0", width: "100%" }}>
      <span style={{ fontSize: "11px", color: "var(--text-secondary)" }}>{label}</span>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px", width: "100%" }}>
        {["X", "Y", "Z"].map((axis, i) => (
          <div key={axis} style={{ position: "relative", width: "100%" }}>
            <span
              style={{
                position: "absolute",
                left: "8px",
                top: "50%",
                transform: "translateY(-50%)",
                fontSize: "9px",
                fontWeight: "bold",
                color: axis === "X" ? "#ef4444" : axis === "Y" ? "#22c55e" : "#3b82f6",
                pointerEvents: "none",
              }}
            >
              {axis}
            </span>
            <input
              type="number"
              step="0.1"
              value={Number((values[i] || 0).toFixed(2))}
              onChange={(e) => onChange(i, parseFloat(e.target.value) || 0)}
              style={{
                width: "100%",
                background: "var(--bg-input)",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius-sm)",
                color: "var(--text-primary)",
                padding: "4px 4px 4px 20px",
                fontSize: "11px",
                outline: "none",
                fontFamily: "monospace",
                boxSizing: "border-box",
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
