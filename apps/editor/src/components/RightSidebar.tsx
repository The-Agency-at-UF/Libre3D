import { useEffect, useRef, useState } from "react";
import { useEditorStore } from "../store/useEditorStore";
import { Select } from "./ui/Select";
import { PanelSection } from "./ui/PanelSection";
import { InspectorTopbar } from "./inspector/InspectorTopbar";
import { TransformPanel } from "./inspector/TransformPanel";
import { ScenePanel } from "./inspector/ScenePanel";
import { CameraPanel } from "./inspector/CameraPanel";

interface CameraDropdownProps {
  value: string;
  options: Array<{ id: string; name: string }>;
  onSelect: (id: string) => void;
  onAddNew: () => void;
  onDelete: (id: string) => void;
}

function CameraDropdown({ value, options, onSelect, onAddNew, onDelete }: CameraDropdownProps) {
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

export interface RightSidebarProps {
  setIsModalOpen: (open: boolean) => void;
  setActiveTab: (tab: "export" | "share") => void;
}

export function RightSidebar({ setIsModalOpen, setActiveTab }: RightSidebarProps) {
  const viewportZoom = useEditorStore((state) => state.viewportZoom);
  const frame = useEditorStore((state) => state.frame);
  const selectedEntityId = useEditorStore((state) => state.selectedEntityId);
  const entities = useEditorStore((state) => state.entities) ?? [];
  const activeProfileId = useEditorStore((state) => state.activeProfileId);
  const setActiveProfile = useEditorStore((state) => state.setActiveProfile);
  const addCameraProfile = useEditorStore((state) => state.addCameraProfile);
  const deleteCameraProfile = useEditorStore((state) => state.deleteCameraProfile);
  const updateFrameSettings = useEditorStore((state) => state.updateFrameSettings);
  const cameraProfiles = useEditorStore((state) => state.cameraProfiles);
  const isPreviewMode = useEditorStore((state) => state.isPreviewMode);

  const cameraProfileEntries = [
    cameraProfiles.personal,
    ...Object.values(cameraProfiles).filter((profile) => profile.id !== "personal"),
  ].filter(Boolean);
  const selectedEntity = entities.find((e) => e.id === selectedEntityId);
  const isResponsiveFrame = frame.mode === "responsive";

  const handleAddCamera = () => {
    const nextIndex =
      cameraProfileEntries.reduce((highest, profile) => {
        const match = profile.id.match(/^camera_(\d+)$/);
        if (!match) {
          return highest;
        }

        return Math.max(highest, Number(match[1]));
      }, 0) + 1;

    const nextId = `camera_${nextIndex}`;
    addCameraProfile(nextId, {
      id: nextId,
      name: `Camera ${nextIndex}`,
      position: [5, 5, 5],
      target: [0, 0, 0],
      fov: 45,
      near: 0.5,
      far: 1000,
      zoom: 1,
    });
  };

  const setFramePreset = (preset: string) => {
    switch (preset) {
      case "responsive":
        updateFrameSettings({
          mode: "responsive",
          preset: "responsive",
        });
        break;
      case "1920x1080":
        updateFrameSettings({
          mode: "fixed",
          preset: "1920x1080",
          width: 1920,
          height: 1080,
        });
        break;
      case "1080x1080":
        updateFrameSettings({
          mode: "fixed",
          preset: "1080x1080",
          width: 1080,
          height: 1080,
        });
        break;
      default:
        updateFrameSettings({
          mode: "fixed",
          preset: "custom",
        });
        break;
    }
  };

  const updateFrameDimension = (field: "width" | "height", value: number) => {
    updateFrameSettings({
      mode: "fixed",
      preset: "custom",
      [field]: value,
    });
  };

  return (
    <aside className="right-sidebar panel" aria-label="Properties inspector">
      <InspectorTopbar
        setIsModalOpen={setIsModalOpen}
        setActiveTab={setActiveTab}
        viewportZoom={viewportZoom}
        selectedEntityId={selectedEntityId}
      />

      {/* SCROLLABLE BODY */}
      <div className="panel-body" style={isPreviewMode ? { opacity: 0.5, pointerEvents: "none" } : undefined}>
        <PanelSection title="Frame" defaultOpen={true}>
          <Select
            label="Size Preset"
            options={[
              { label: "Responsive", value: "responsive" },
              { label: "1920x1080", value: "1920x1080" },
              { label: "1080x1080 Square", value: "1080x1080" },
              { label: "Custom", value: "custom" },
            ]}
            value={frame.preset}
            onChange={setFramePreset}
          />

          <div className="prop" style={{ opacity: isResponsiveFrame ? 0.45 : 1 }}>
            <span className="prop-label">Width</span>
            <input
              type="number"
              min={1}
              value={frame.width}
              onChange={(e) => updateFrameDimension("width", Number(e.target.value) || 0)}
              disabled={isResponsiveFrame}
              style={{ width: "100%" }}
            />
          </div>

          <div className="prop" style={{ opacity: isResponsiveFrame ? 0.45 : 1 }}>
            <span className="prop-label">Height</span>
            <input
              type="number"
              min={1}
              value={frame.height}
              onChange={(e) => updateFrameDimension("height", Number(e.target.value) || 0)}
              disabled={isResponsiveFrame}
              style={{ width: "100%" }}
            />
          </div>
        </PanelSection>

        <PanelSection title="Viewport Settings" defaultOpen={true}>
          <div className="prop" style={{ width: "100%" }}>
            <span className="prop-label">Camera</span>
            <CameraDropdown
              value={activeProfileId}
              options={cameraProfileEntries.map((profile) => ({ id: profile.id, name: profile.name }))}
              onSelect={setActiveProfile}
              onAddNew={handleAddCamera}
              onDelete={deleteCameraProfile}
            />
          </div>
        </PanelSection>

        <ScenePanel />

        {selectedEntity ? (
          <>
            <TransformPanel selectedEntity={selectedEntity} />
          </>
        ) : (
          <CameraPanel />
        )}
      </div>
    </aside>
  );
}
