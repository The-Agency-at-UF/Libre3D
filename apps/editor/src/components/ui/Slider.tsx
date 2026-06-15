interface SliderProps {
  label: string;
  min: number;
  max: number;
  step?: number;
  value: number;
  onChange: (val: number) => void;
}

export function Slider({ label, min, max, step = 1, value, onChange }: SliderProps) {
  return (
    <div className="prop" style={{ width: "100%" }}>
      <span className="prop-label">{label}</span>
      <div className="slider-row" style={{ flex: 1, width: "100%" }}>
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          style={{ width: "100%" }}
        />
        <span className="slider-val">{value}</span>
      </div>
    </div>
  );
}
