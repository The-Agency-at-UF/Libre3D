import { useRef, type KeyboardEvent, type PointerEvent } from "react";
import { useEditorStore, type RampStop } from "../../store/useEditorStore";
import { MAX_RAMP_STOPS, rampStopAt, reverseStops, sortedStops } from "../../scene/layerStack";
import { parseHex } from "../../utils/colorSpaces";
import { ColorField } from "../ui/ColorField";

const clamp01 = (value: number) => Math.min(1, Math.max(0, value));

const cssColor = (stop: RampStop) => `rgba(${(parseHex(stop.color) ?? [255, 255, 255]).join(", ")}, ${stop.alpha ?? 1})`;

/**
 * A ramp's stops, as Spline's (Depth, Gradient): a bar showing the ramp over a checkerboard with a
 * handle per stop, a ⇆ that turns it around, and the picked stop's colour and opacity under it.
 *
 * Click a handle to pick that stop, drag it to move it (one undo step), press Delete or Backspace
 * to remove it (a ramp keeps two), and click the bar to add a stop there in the colour the ramp has
 * there, up to MAX_RAMP_STOPS. Stops keep their order in the layer while dragged, so `selected`
 * (an index into them) stays on the dragged one; the ramp sorts them by position when it's drawn.
 */
export function RampEditor({
  stops,
  smooth,
  selected,
  onSelect,
  onChange,
}: {
  stops: RampStop[];
  smooth: boolean;
  selected: number;
  onSelect: (index: number) => void;
  onChange: (stops: RampStop[]) => void;
}) {
  const barRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ index: number; pointerId: number; historyPaused: boolean } | null>(null);
  const index = Math.min(selected, stops.length - 1);
  const stop = stops[index];

  const positionAt = (clientX: number) => {
    const rect = barRef.current?.getBoundingClientRect();
    return rect && rect.width > 0 ? clamp01((clientX - rect.left) / rect.width) : 0;
  };

  const ordered = sortedStops(stops);
  const ramp = `linear-gradient(to right, ${ordered.map((each) => `${cssColor(each)} ${each.position * 100}%`).join(", ")})`;

  const addStop = (event: PointerEvent) => {
    if (stops.length >= MAX_RAMP_STOPS) return;
    onChange([...stops, rampStopAt(stops, smooth, positionAt(event.clientX))]);
    onSelect(stops.length);
  };

  const startDrag = (event: PointerEvent<HTMLButtonElement>, at: number) => {
    event.stopPropagation();
    onSelect(at);
    event.currentTarget.focus();
    try {
      event.currentTarget.setPointerCapture(event.pointerId);
    } catch {
      // A pointer the browser doesn't track can't be held; the drag still works over the handle.
    }
    dragRef.current = { index: at, pointerId: event.pointerId, historyPaused: false };
  };

  const drag = (event: PointerEvent) => {
    const dragging = dragRef.current;
    if (!dragging || dragging.pointerId !== event.pointerId) return;
    const position = positionAt(event.clientX);
    if (position === stops[dragging.index]?.position) return;
    onChange(stops.map((each, i) => (i === dragging.index ? { ...each, position } : each)));
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

  const removeStop = (event: KeyboardEvent, at: number) => {
    if (event.key !== "Delete" && event.key !== "Backspace") return;
    // The scene's Delete shortcut must not take the object too.
    event.preventDefault();
    event.stopPropagation();
    if (stops.length <= 2) return;
    onChange(stops.filter((_, i) => i !== at));
    onSelect(Math.max(0, at - 1));
  };

  return (
    <>
      <div className="prop">
        <span className="prop-label ramp-label">
          Ramp
          <button
            type="button"
            className="mat-icon-btn ramp-reverse"
            title="Turn the ramp around"
            aria-label="Turn the ramp around"
            onClick={() => onChange(reverseStops(stops))}
          >
            <i className="ti ti-arrows-exchange"></i>
          </button>
        </span>
        <div
          ref={barRef}
          className="ramp-bar"
          onPointerDown={addStop}
          title={stops.length < MAX_RAMP_STOPS ? "Click to add a stop" : `Up to ${MAX_RAMP_STOPS} stops`}
        >
          <span className="ramp-bar-fill" style={{ background: ramp }} />
          {stops.map((each, i) => (
            <button
              key={i}
              type="button"
              className={`ramp-stop ${i === index ? "selected" : ""}`}
              style={{ left: `${each.position * 100}%`, background: cssColor(each) }}
              title={stops.length > 2 ? "Drag to move; Delete removes it" : "Drag to move"}
              aria-label={`Stop ${i + 1}`}
              onPointerDown={(event) => startDrag(event, i)}
              onPointerMove={drag}
              onPointerUp={endDrag}
              onLostPointerCapture={endDrag}
              onKeyDown={(event) => removeStop(event, i)}
            />
          ))}
        </div>
      </div>
      {stop && (
        <ColorField
          label="Color"
          color={stop.color}
          alpha={stop.alpha ?? 1}
          onChange={(change) =>
            onChange(stops.map((each, i) => (i === index ? { ...each, ...(change.color !== undefined ? { color: change.color } : { alpha: change.alpha }) } : each)))
          }
        />
      )}
    </>
  );
}
