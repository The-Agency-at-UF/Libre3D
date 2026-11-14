import type { NormalLayer } from "../../../store/useEditorStore";
import { useRowUpdate, type LayerRowData } from "../materialRows";

// A Normal layer, as Spline's: which of the surface direction's X, Y and Z colour it (red, green, blue).
export function NormalSettings({ row }: { row: LayerRowData }) {
  const update = useRowUpdate(row);
  const layer = row.pairs[0].layer as NormalLayer;
  return (
    <div className="prop">
      <span className="prop-label">Direction</span>
      <div className="mat-toggles">
        {["X", "Y", "Z"].map((axis, index) => (
          <button
            key={axis}
            type="button"
            className={`seg-btn ${layer.axes[index] ? "on" : ""}`}
            aria-pressed={layer.axes[index]}
            title={`${layer.axes[index] ? "Leave out" : "Use"} the surface's ${axis} direction (${["red", "green", "blue"][index]})`}
            onClick={() => update({ axes: layer.axes.map((on, i) => (i === index ? !on : on)) as NormalLayer["axes"] })}
          >
            {axis}
          </button>
        ))}
      </div>
    </div>
  );
}
