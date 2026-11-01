import { useEffect, useRef, useState } from "react";
import { useEditorStore } from "../store/useEditorStore";
import { importFileIntoScene } from "../utils/importFile";
import { isSceneFile } from "../utils/sceneFile";

interface DropOverlayProps {
  /** A dropped `.libre3d`: the caller opens it (as a new scene, or in place of the guest's one). */
  onOpenSceneFile: (file: File) => void;
  /** What dropping a `.libre3d` does here, shown on its card. */
  sceneFileAction: string;
}

// What can be dropped. The first three go into the open scene; a scene file opens as a scene.
const DROP_TYPES = [
  { name: "3D Model", formats: "GLB", icon: "ti ti-package", addsToScene: true },
  { name: "Vector", formats: "SVG", icon: "ti ti-vector-bezier", addsToScene: true },
  { name: "Image", formats: "JPG, PNG", icon: "ti ti-photo", addsToScene: true },
  { name: "Libre3D Scene", formats: ".libre3d", icon: "ti ti-file-3d", addsToScene: false },
];

/*
 * BLOCK: DropOverlay (React Component)
 * PURPOSE: While a file is dragged over the editor, covers it with the kinds of file it takes, and
 *          imports what's dropped anywhere on it (utils/importFile.ts), or opens a `.libre3d` scene.
 *          It listens on the window, so a file dropped on a sidebar is imported too rather than
 *          opened by the browser in place of the editor. Nothing is shown or taken during Play,
 *          and a view-only scene takes only a scene file (the store would drop anything added).
 */
export function DropOverlay({ onOpenSceneFile, sceneFileAction }: DropOverlayProps) {
  const [isDragging, setIsDragging] = useState(false);
  const isViewOnly = useEditorStore((state) => state.readOnlyReason !== null);
  const onOpenSceneFileRef = useRef(onOpenSceneFile);
  onOpenSceneFileRef.current = onOpenSceneFile;

  useEffect(() => {
    // dragenter and dragleave come in pairs for every element the drag crosses (the new one's enter
    // first), so the count is 0 only once the drag has left the window or been cancelled.
    let depth = 0;
    const carriesFiles = (event: DragEvent) => event.dataTransfer?.types.includes("Files") ?? false;
    const isPlaying = () => useEditorStore.getState().isPreviewMode;

    const handleDragEnter = (event: DragEvent) => {
      if (!carriesFiles(event)) return;
      depth += 1;
      if (!isPlaying()) setIsDragging(true);
    };

    const handleDragLeave = (event: DragEvent) => {
      if (!carriesFiles(event)) return;
      depth = Math.max(0, depth - 1);
      if (depth === 0) setIsDragging(false);
    };

    const handleDragOver = (event: DragEvent) => {
      if (!carriesFiles(event)) return;
      event.preventDefault(); // takes the drop, so the browser never opens the file instead
      if (event.dataTransfer) event.dataTransfer.dropEffect = isPlaying() ? "none" : "copy";
    };

    const handleDrop = (event: DragEvent) => {
      if (!carriesFiles(event)) return;
      event.preventDefault();
      depth = 0;
      setIsDragging(false);
      if (isPlaying()) return; // Play is for looking

      const files = Array.from(event.dataTransfer?.files ?? []);
      const sceneFile = files.find(isSceneFile);

      if (sceneFile) {
        // A scene opens on its own; anything dropped with it isn't added to the scene being left.
        onOpenSceneFileRef.current(sceneFile);
        return;
      }

      if (useEditorStore.getState().readOnlyReason) return;
      files.forEach((file) => void importFileIntoScene(file));
    };

    window.addEventListener("dragenter", handleDragEnter);
    window.addEventListener("dragleave", handleDragLeave);
    window.addEventListener("dragover", handleDragOver);
    window.addEventListener("drop", handleDrop);
    return () => {
      window.removeEventListener("dragenter", handleDragEnter);
      window.removeEventListener("dragleave", handleDragLeave);
      window.removeEventListener("dragover", handleDragOver);
      window.removeEventListener("drop", handleDrop);
    };
  }, []);

  if (!isDragging) return null;

  return (
    <div className="drop-overlay" aria-hidden="true">
      <div className="drop-overlay-panel">
        <div className="drop-overlay-title">Drop to import</div>
        <div className="drop-overlay-grid">
          {DROP_TYPES.map((type) => (
            <div
              key={type.name}
              className={`drop-overlay-card${type.addsToScene && isViewOnly ? " drop-overlay-card--unavailable" : ""}`}
            >
              <span className="drop-overlay-icon">
                <i className={type.icon}></i>
              </span>
              <span className="drop-overlay-name">{type.name}</span>
              <span className="drop-overlay-formats">{type.formats}</span>
              {!type.addsToScene && <span className="drop-overlay-action">{sceneFileAction}</span>}
            </div>
          ))}
        </div>
        {isViewOnly && <div className="drop-overlay-note">This scene is view only, so only a scene file can be opened.</div>}
      </div>
    </div>
  );
}
