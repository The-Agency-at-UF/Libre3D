interface SwitchProps {
  label: string;
  checked: boolean;
  onChange: (val: boolean) => void;
}

export function Switch({ label, checked, onChange }: SwitchProps) {
  return (
    <div className="prop" style={{ width: "100%" }}>
      <span className="prop-label">{label}</span>
      <label className="toggle">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
        />
        <span className="toggle-track" />
      </label>
    </div>
  );
}
