import { useEditorStore } from "../store/useEditorStore";
import { Select } from "./ui/Select";
import { PanelSection } from "./ui/PanelSection";
import { InspectorTopbar } from "./inspector/InspectorTopbar";
import { TransformPanel } from "./inspector/TransformPanel";
import { ScenePanel } from "./inspector/ScenePanel";
import { CameraPanel } from "./inspector/CameraPanel";

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
  const updateFrameSettings = useEditorStore((state) => state.updateFrameSettings);
  const cameraProfiles = useEditorStore((state) => state.cameraProfiles);
  const isPreviewMode = useEditorStore((state) => state.isPreviewMode);

  const cameraProfileEntries = Object.values(cameraProfiles);
  const selectedEntity = entities.find((e) => e.id === selectedEntityId);
  const isResponsiveFrame = frame.mode === "responsive";

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
          <Select
            label="Camera"
            options={[
              ...cameraProfileEntries.map((profile) => ({ label: profile.name, value: profile.id })),
              { label: "➕ Add New Camera...", value: "__ADD_NEW__" },
            ]}
            value={activeProfileId}
            onChange={(val) => {
              if (val === "__ADD_NEW__") {
                const nextIndex = cameraProfileEntries.filter((profile) => profile.id !== "personal").length + 1;
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
              } else {
                setActiveProfile(val);
              }
            }}
          />
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
