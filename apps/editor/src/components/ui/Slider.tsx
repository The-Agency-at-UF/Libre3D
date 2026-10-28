import { useRef, useEffect } from "react";
import { useEditorStore } from "../../store/useEditorStore";

interface SliderProps {
  label: string;
  min: number;
  max: number;
  step?: number;
  value: number;
  onChange: (val: number) => void;
}

export function Slider({ label, min, max, step = 1, value, onChange }: SliderProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  // Phase 4: Keep --value-percent in sync so the CSS gradient fill tracks the thumb
  useEffect(() => {
    if (!inputRef.current) return;
    const percent = ((value - min) / (max - min)) * 100;
    inputRef.current.style.setProperty("--value-percent", `${percent}%`);
  }, [value, min, max]);

  const draggingRef = useRef(false);

  // Same pattern as the gizmo drag in useViewportControls: the first change of a drag records one
  // undo entry, then history is paused until the pointer is released.
  const endDrag = () => {
    if (!draggingRef.current) return;
    draggingRef.current = false;
    window.removeEventListener("pointerup", endDrag);
    window.removeEventListener("pointercancel", endDrag);
    useEditorStore.temporal.getState().resume();
  };

  useEffect(() => endDrag, []);

  const handlePointerDown = () => {
    draggingRef.current = true;
    window.addEventListener("pointerup", endDrag);
    window.addEventListener("pointercancel", endDrag);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const next = parseFloat(e.target.value);
    onChange(next);
    if (draggingRef.current) useEditorStore.temporal.getState().pause();
    const percent = ((next - min) / (max - min)) * 100;
    e.target.style.setProperty("--value-percent", `${percent}%`);
  };

  return (
    <div className="prop" style={{ width: "100%" }}>
      <span className="prop-label">{label}</span>
      <div className="slider-row" style={{ flex: 1, width: "100%" }}>
        <input
          ref={inputRef}
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={handleChange}
          onPointerDown={handlePointerDown}
          style={{ width: "100%" }}
        />
        <span className="slider-val">{value}</span>
      </div>
    </div>
  );
}
