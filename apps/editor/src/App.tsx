import { EditorSidebar } from "./components/EditorSidebar";
import { ViewportCanvas } from "./components/ViewportCanvas";
import { useEditorStore } from "./store/useEditorStore";

export function App() {
  const objects = useEditorStore((state) => state.objects);
  const addObject = useEditorStore((state) => state.addObject);
  const resetObjects = useEditorStore((state) => state.resetObjects);
  const objectCountLabel = `${objects.length} object${objects.length === 1 ? "" : "s"}`;

  return (
    <div
      className="editor-shell"
    >
      <EditorSidebar
        title="Walking Skeleton"
        subtitle="A minimal scene editor shell for primitives, materials, and export work."
        children={
          <div style={{ display: "grid", gap: "0.75rem" }}>
            <div className="editor-meta">{objectCountLabel}</div>
            <div className="editor-actions">
              <button
                className="editor-action"
                type="button"
                onClick={() => addObject({ type: "box" })}
              >
                Add Box
              </button>
              <button
                className="editor-action"
                type="button"
                onClick={() => addObject({ type: "sphere", color: "#3DFFA0" })}
              >
                Add Sphere
              </button>
              <button
                className="editor-action"
                type="button"
                onClick={() => addObject({ type: "cylinder", color: "#FF7AE0" })}
              >
                Add Cylinder
              </button>
              <button className="editor-action" type="button" onClick={resetObjects}>
                Reset
              </button>
            </div>
          </div>
        }
      >
      </EditorSidebar>

      <main
        className="editor-main"
      >
        <ViewportCanvas />
      </main>
    </div>
  );
}