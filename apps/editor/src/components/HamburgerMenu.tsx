import { useState } from "react";

interface HamburgerMenuProps {
  onNewFile: () => void;
  onDuplicate: () => void;
  onResetCamera: () => void;
  onToggleTheme: () => void;
  onTriggerPlaceholder: (action: string) => void;
  showAxisGuides: boolean;
  onToggleAxisGuides: () => void;
}

/*
 * BLOCK: HamburgerMenu (React Component)
 * PURPOSE: Renders the sidebar menu button and the dropdown list containing editor action items
 *          (New File, Duplicate, Undo/Redo, Reset Camera, Toggle Theme).
 */
export function HamburgerMenu({
  onNewFile,
  onDuplicate,
  onResetCamera,
  onToggleTheme,
  onTriggerPlaceholder,
  showAxisGuides,
  onToggleAxisGuides,
}: HamburgerMenuProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleItemClick = (action: () => void) => {
    action();
    setIsMenuOpen(false);
  };

  return (
    <div className="hamburger-menu-wrap">
      <button
        className="left-sidebar-header-btn"
        type="button"
        title="Menu"
        onClick={() => setIsMenuOpen(!isMenuOpen)}
      >
        <i className="ti ti-menu-2" style={{ fontSize: "16px" }}></i>
      </button>

      {isMenuOpen && (
        <>
          {/* Overlay to close the menu on backdrop click */}
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 999,
            }}
            onClick={() => setIsMenuOpen(false)}
          />
          <div className="hamburger-dropdown">
            <button
              className="hamburger-dropdown-btn"
              type="button"
              onClick={() => handleItemClick(onNewFile)}
            >
              <span>
                <i className="ti ti-file" style={{ marginRight: "6px" }}></i>
                New File
              </span>
              <span className="hamburger-dropdown-shortcut">Ctrl+N</span>
            </button>
            <button
              className="hamburger-dropdown-btn"
              type="button"
              onClick={() => handleItemClick(onDuplicate)}
            >
              <span>
                <i className="ti ti-copy" style={{ marginRight: "6px" }}></i>
                Duplicate
              </span>
              <span className="hamburger-dropdown-shortcut">Ctrl+D</span>
            </button>
            <div style={{ height: "1px", background: "var(--border)", margin: "4px 0" }} />
            <button
              className="hamburger-dropdown-btn"
              type="button"
              onClick={() => handleItemClick(() => onTriggerPlaceholder("Undo"))}
            >
              <span>
                <i className="ti ti-arrow-back-up" style={{ marginRight: "6px" }}></i>
                Undo
              </span>
              <span className="hamburger-dropdown-shortcut">Ctrl+Z</span>
            </button>
            <button
              className="hamburger-dropdown-btn"
              type="button"
              onClick={() => handleItemClick(() => onTriggerPlaceholder("Redo"))}
            >
              <span>
                <i className="ti ti-arrow-forward-up" style={{ marginRight: "6px" }}></i>
                Redo
              </span>
              <span className="hamburger-dropdown-shortcut">Ctrl+Y</span>
            </button>
            <div style={{ height: "1px", background: "var(--border)", margin: "4px 0" }} />
            <button
              className="hamburger-dropdown-btn"
              type="button"
              onClick={() => handleItemClick(onResetCamera)}
            >
              <span>
                <i className="ti ti-camera" style={{ marginRight: "6px" }}></i>
                Reset Camera
              </span>
            </button>
            <button
              className="hamburger-dropdown-btn"
              type="button"
              onClick={() => handleItemClick(onToggleTheme)}
            >
              <span>
                <i className="ti ti-palette" style={{ marginRight: "6px" }}></i>
                Toggle Theme
              </span>
            </button>
            <button
              className="hamburger-dropdown-btn"
              type="button"
              onClick={() => handleItemClick(onToggleAxisGuides)}
            >
              <span>
                <i className={showAxisGuides ? "ti ti-axis-3d" : "ti ti-axis-3d"} style={{ marginRight: "6px", opacity: showAxisGuides ? 1 : 0.4 }}></i>
                Axis Guidelines
              </span>
              <span className="hamburger-dropdown-shortcut">{showAxisGuides ? "On" : "Off"}</span>
            </button>
          </div>
        </>
      )}
    </div>
  );
}
