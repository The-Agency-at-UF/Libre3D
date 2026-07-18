import { useEffect, useRef, useState } from "react";

export interface CameraDropdownProps {
  value: string;
  options: Array<{ id: string; name: string }>;
  onSelect: (id: string) => void;
  onAddNew: () => void;
  onDelete: (id: string) => void;
}

export function CameraDropdown({ value, options, onSelect, onAddNew, onDelete }: CameraDropdownProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handlePointerDown = (event: MouseEvent) => {
      const rootNode = rootRef.current;
      if (rootNode && !rootNode.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, []);

  const currentLabel = options.find((option) => option.id === value)?.name ?? "Camera";

  const handleSelect = (id: string) => {
    onSelect(id);
    setOpen(false);
  };

  const handleDelete = (id: string) => {
    onDelete(id);
    setOpen(false);
  };

  return (
    <div className="camera-dropdown" ref={rootRef}>
      <button
        type="button"
        className="camera-dropdown-trigger"
        onClick={() => setOpen((nextOpen) => !nextOpen)}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className="camera-dropdown-trigger-label">{currentLabel}</span>
        <span className="camera-dropdown-trigger-caret" aria-hidden="true">
          ▾
        </span>
      </button>

      {open ? (
        <div className="camera-dropdown-menu" role="listbox" aria-label="Camera presets">
          {options.map((option) => (
            <div className="camera-dropdown-row" key={option.id}>
              <button
                type="button"
                className="camera-dropdown-option"
                onClick={() => handleSelect(option.id)}
              >
                {option.name}
              </button>
              {option.id !== "personal" ? (
                <button
                  type="button"
                  className="camera-dropdown-delete"
                  onClick={() => handleDelete(option.id)}
                  aria-label={`Delete ${option.name}`}
                  title={`Delete ${option.name}`}
                >
                  x
                </button>
              ) : null}
            </div>
          ))}

          <button type="button" className="camera-dropdown-add" onClick={onAddNew}>
            + Add New Camera...
          </button>
        </div>
      ) : null}
    </div>
  );
}
