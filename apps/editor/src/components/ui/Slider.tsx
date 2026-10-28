import { useRef, useEffect } from "react";
import { useSliderUndoStep } from "../../hooks/useSliderUndoStep";

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
  const undoStep = useSliderUndoStep();

  // Phase 4: Keep --value-percent in sync so the CSS gradient fill tracks the thumb
  useEffect(() => {
    if (!inputRef.current) return;
    const percent = ((value - min) / (max - min)) * 100;
    inputRef.current.style.setProperty("--value-percent", `${percent}%`);
  }, [value, min, max]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const next = parseFloat(e.target.value);
    onChange(next);
    undoStep.changed();
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
          {...undoStep.endProps}
          style={{ width: "100%" }}
        />
        <span className="slider-val">{value}</span>
      </div>
    </div>
  );
}
