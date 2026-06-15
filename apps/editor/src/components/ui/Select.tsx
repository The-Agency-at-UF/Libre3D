interface SelectOption {
  label: string;
  value: string;
}

interface SelectProps {
  label?: string;
  options: SelectOption[];
  value: string;
  onChange: (val: string) => void;
  className?: string;
}

export function Select({ label, options, value, onChange, className = "w-60" }: SelectProps) {
  const selectNode = (
    <div className={`select-wrap ${className}`} style={{ flex: 1, width: "100%" }}>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{ width: "100%" }}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );

  if (label) {
    return (
      <div className="prop" style={{ width: "100%" }}>
        <span className="prop-label">{label}</span>
        {selectNode}
      </div>
    );
  }

  return selectNode;
}
