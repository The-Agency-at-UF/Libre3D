import { useRef } from "react";
import { useEditorStore, type DepthLayer, type DepthStop } from "../../store/useEditorStore";
import { depthRampHex, MAX_DEPTH_STOPS } from "../../utils/depthColors";

const clamp01 = (value: number) => Math.min(1, Math.max(0, value));

/*
 * The Depth layer's ramp: a bar showing its colours, with a handle per stop. Click a handle to pick
 * that stop (its colour and position are edited below the ramp, in MaterialsPanel), drag it to move
 * it (one undo step), and click the bar to add a stop there in the colour the ramp has there, up to
 * MAX_DEPTH_STOPS. Stops keep their order in the layer while dragged, so `selected` (an index into
 * them) stays on the dragged one; the ramp sorts them by position when it's sampled.
 */
export function DepthRamp({
  layer,
  selected,
  onSelect,
  onChange,
}: {
  layer: DepthLayer;
  selected: number;
  onSelect: (index: number) => void;
  onChange: (stops: DepthStop[]) => void;
}) {
  const barRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ index: number; historyPaused: boolean } | null>(null);
  const { stops } = layer;

  const positionAt = (clientX: number) => {
    const rect = barRef.current?.getBoundingClientRect();
    return rect && rect.width > 0 ? clamp01((clientX - rect.left) / rect.width) : 0;
  };

  const sorted = [...stops].sort((a, b) => a.position - b.position);
  const background = `linear-gradient(to right, ${sorted.map((stop) => `${stop.color} ${stop.position * 100}%`).join(", ")})`;

  const addStop = (event: React.PointerEvent) => {
    if (stops.length >= MAX_DEPTH_STOPS) return;
    const position = positionAt(event.clientX);
    onChange([...stops, { color: depthRampHex(layer, position), position }]);
    onSelect(stops.length);
  };

  const startDrag = (event: React.PointerEvent, index: number) => {
    event.stopPropagation();
    onSelect(index);
    event.currentTarget.setPointerCapture(event.pointerId);
    dragRef.current = { index, historyPaused: false };
  };

  const drag = (event: React.PointerEvent) => {
    const dragging = dragRef.current;
    if (!dragging) return;
    const position = positionAt(event.clientX);
    if (position === stops[dragging.index]?.position) return;
    onChange(stops.map((stop, i) => (i === dragging.index ? { ...stop, position } : stop)));
    // The first move records the undo step; the rest of the drag joins it.
    if (!dragging.historyPaused) {
      useEditorStore.temporal.getState().pause();
      dragging.historyPaused = true;
    }
  };

  const endDrag = () => {
    if (dragRef.current?.historyPaused) useEditorStore.temporal.getState().resume();
    dragRef.current = null;
  };

  return (
    <div className="prop">
      <span className="prop-label">Ramp</span>
      <div
        ref={barRef}
        className="depth-ramp"
        style={{ background }}
        onPointerDown={addStop}
        title={stops.length < MAX_DEPTH_STOPS ? "Click to add a stop" : `Up to ${MAX_DEPTH_STOPS} stops`}
      >
        {stops.map((stop, i) => (
          <button
            key={i}
            type="button"
            className={`depth-ramp-stop ${i === selected ? "selected" : ""}`}
            style={{ left: `${stop.position * 100}%`, background: stop.color }}
            aria-label={`Stop ${i + 1}`}
            onPointerDown={(event) => startDrag(event, i)}
            onPointerMove={drag}
            onPointerUp={endDrag}
            onPointerCancel={endDrag}
          />
        ))}
      </div>
    </div>
  );
}
