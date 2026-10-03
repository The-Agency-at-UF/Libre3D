interface SearchFieldProps {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}

/*
 * BLOCK: SearchField (React Component)
 * PURPOSE: A search box with a leading magnifier icon. The placeholder doubles as its accessible
 *          name, since the icon is the only visible label.
 */
export function SearchField({ value, onChange, placeholder }: SearchFieldProps) {
  return (
    <label className="ui-search">
      <i className="ti ti-search" aria-hidden="true" />
      <input
        className="ui-search-input"
        type="search"
        value={value}
        placeholder={placeholder}
        aria-label={placeholder}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}
