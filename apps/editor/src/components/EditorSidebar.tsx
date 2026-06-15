import type { ReactNode } from "react";
import { useEditorStore } from "../store/useEditorStore";
import { PanelSection } from "./ui/PanelSection";
import { Slider } from "./ui/Slider";
import { Switch } from "./ui/Switch";
import { Select } from "./ui/Select";

interface EditorSidebarSectionProps {
  title: string;
  description: string;
  children?: ReactNode;
}

interface EditorSidebarProps {
  title?: string;
  subtitle?: string;
  children?: ReactNode;
}

function EditorSidebarSection({
  title,
  description,
  children,
}: EditorSidebarSectionProps) {
  return (
    <section
      style={{
        display: "grid",
        gap: "0.75rem",
        padding: "1rem",
        borderRadius: "16px",
        background: "rgba(15, 23, 42, 0.72)",
        border: "1px solid rgba(148, 163, 184, 0.16)",
      }}
    >
      <div style={{ display: "grid", gap: "0.25rem" }}>
        <h3 style={{ margin: 0, fontSize: "0.95rem", fontWeight: 600 }}>
          {title}
        </h3>
        <p
          style={{
            margin: 0,
            fontSize: "0.85rem",
            lineHeight: 1.5,
            color: "rgba(226, 232, 240, 0.72)",
          }}
        >
          {description}
        </p>
      </div>
      {children}
    </section>
  );
}

export function EditorSidebar({
  title = "Scene",
  subtitle = "Add primitives, edit transforms, and pick materials.",
  children,
}: EditorSidebarProps) {
  const sceneSettings = useEditorStore((state) => state.sceneSettings);
  const updateSceneSettings = useEditorStore((state) => state.updateSceneSettings);

  const handleGridPlaneChange = (val: string) => {
    updateSceneSettings({ gridPlane: val });
  };

  const handleWireframeChange = (val: boolean) => {
    updateSceneSettings({ wireframe: val });
  };

  const handleFogChange = (val: boolean) => {
    updateSceneSettings({ fogEnabled: val });
  };

  const handleEnvironmentChange = (val: string) => {
    updateSceneSettings({ environment: val });
  };

  const handleLightIntensityChange = (val: number) => {
    updateSceneSettings({ lights: { intensity: val } });
  };

  const handlePhysicsChange = (val: boolean) => {
    updateSceneSettings({ physics: { enabled: val } });
  };

  const handleGravityChange = (val: number) => {
    updateSceneSettings({ physics: { gravityY: val } });
  };

  return (
    <aside
      style={{
        width: "320px",
        minWidth: "280px",
        maxWidth: "360px",
        height: "100%",
        display: "grid",
        gridTemplateRows: "auto 1fr",
        gap: "1rem",
        padding: "1.25rem",
        color: "#e2e8f0",
        background:
          "linear-gradient(180deg, rgba(2, 6, 23, 0.98) 0%, rgba(15, 23, 42, 0.94) 100%)",
        borderRight: "1px solid rgba(148, 163, 184, 0.14)",
      }}
    >
      <header style={{ display: "grid", gap: "0.35rem" }}>
        <span
          style={{
            fontSize: "0.75rem",
            fontWeight: 700,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: "#94a3b8",
          }}
        >
          Libre3D
        </span>
        <h2 style={{ margin: 0, fontSize: "1.3rem", fontWeight: 700 }}>
          {title}
        </h2>
        <p
          style={{
            margin: 0,
            fontSize: "0.9rem",
            lineHeight: 1.5,
            color: "rgba(226, 232, 240, 0.72)",
          }}
        >
          {subtitle}
        </p>
      </header>

      <div style={{ display: "grid", alignContent: "start", gap: "0.85rem", overflowY: "auto" }}>
        <EditorSidebarSection
          title="Objects"
          description="Start with primitive shapes and keep the list easy to scan."
        >
          {children}
        </EditorSidebarSection>

        <PanelSection title="Environment & Grid" defaultOpen={true}>
          <Select
            label="Grid Plane"
            value={sceneSettings.gridPlane}
            options={[
              { label: "None", value: "None" },
              { label: "Floor (XZ)", value: "Floor (XZ)" },
              { label: "Wall (XY)", value: "Wall (XY)" },
              { label: "Side (YZ)", value: "Side (YZ)" },
            ]}
            onChange={handleGridPlaneChange}
          />
          <Select
            label="Environment"
            value={sceneSettings.environment}
            options={[
              { label: "Studio", value: "Studio" },
              { label: "Sunset", value: "Sunset" },
              { label: "Outdoors", value: "Outdoors" },
              { label: "Abstract", value: "Abstract" },
            ]}
            onChange={handleEnvironmentChange}
          />
          <Switch
            label="Wireframe Mode"
            checked={sceneSettings.wireframe}
            onChange={handleWireframeChange}
          />
          <Switch
            label="Fog Effect"
            checked={sceneSettings.fogEnabled}
            onChange={handleFogChange}
          />
        </PanelSection>

        <PanelSection title="Lights Settings" defaultOpen={false}>
          <Slider
            label="Light Intensity"
            min={0}
            max={3}
            step={0.1}
            value={sceneSettings.lights.intensity}
            onChange={handleLightIntensityChange}
          />
        </PanelSection>

        <PanelSection title="Physics Settings" defaultOpen={false}>
          <Switch
            label="Enable Physics"
            checked={sceneSettings.physics.enabled}
            onChange={handlePhysicsChange}
          />
          <Slider
            label="Gravity Y"
            min={-20}
            max={20}
            step={0.5}
            value={sceneSettings.physics.gravityY}
            onChange={handleGravityChange}
          />
        </PanelSection>
      </div>
    </aside>
  );
}