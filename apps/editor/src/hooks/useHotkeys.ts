import { useEffect } from "react";
import { useEditorStore } from "../store/useEditorStore";
import { isEffectivelyLocked } from "../store/entityIndex";
import { editPath } from "../viewport/hooks/useViewportPenTool";

interface UseHotkeysProps {
  onDuplicate?: () => void;
  onNewFile?: () => void;
}

export function useHotkeys({ onDuplicate, onNewFile }: UseHotkeysProps = {}) {
  const setEditorState = useEditorStore((state) => state.setEditorState);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Don't trigger hotkeys if user is typing in an input field. Undo is the exception from a
      // slider: it keeps focus after a drag, and it steps history like everywhere else.
      const activeEl = document.activeElement;
      const isSlider = activeEl?.tagName === "INPUT" && (activeEl as HTMLInputElement).type === "range";
      const isUndo = (event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "z";
      if (
        activeEl &&
        !(isSlider && isUndo) &&
        (activeEl.tagName === "INPUT" ||
          activeEl.tagName === "TEXTAREA" ||
          activeEl.getAttribute("contenteditable") === "true")
      ) {
        return;
      }

      const cmdOrCtrl = event.ctrlKey || event.metaKey;

      // Play is for looking: Stop must find the scene and selection as they were, so only the
      // camera zoom shortcuts work while it runs.
      const isZoomShortcut = cmdOrCtrl && ["=", "+", "-"].includes(event.key);
      if (useEditorStore.getState().isPreviewMode && !isZoomShortcut) {
        return;
      }

      // Ctrl/Cmd shortcuts
      if (cmdOrCtrl) {
        const key = event.key.toLowerCase();

        if (key === "d") {
          event.preventDefault();
          onDuplicate?.();
          return;
        }

        if (key === "n") {
          event.preventDefault();
          onNewFile?.();
          return;
        }

        // Group the selection into a new group node. Two or more entities only —
        // the store action itself still rejects illegal groupings (cycles, the
        // imported-model boundary). Shift is left free for a future Ungroup.
        if (key === "g" && !event.shiftKey) {
          event.preventDefault();
          const selectedIds = useEditorStore.getState().selectedEntityIds;
          if (selectedIds.length > 1) {
            useEditorStore.getState().groupEntities(selectedIds);
          }
          return;
        }

        if (key === "z") {
          event.preventDefault();
          // View only: there's no history to step through (the store drops other edits itself).
          if (useEditorStore.getState().readOnlyReason) {
            return;
          }
          if (event.shiftKey) {
            useEditorStore.temporal.getState().redo();
          } else {
            useEditorStore.temporal.getState().undo();
          }
          return;
        }

        // Viewport Zooming
        if (key === "=" || key === "+" || event.key === "=" || event.key === "+") {
          event.preventDefault();
          const currentZoom = useEditorStore.getState().viewportZoom;
          const nextZoom = Math.max(10, Math.min(500, currentZoom + 10));
          setEditorState({ viewportZoom: nextZoom });
          return;
        }

        if (key === "-" || event.key === "-") {
          event.preventDefault();
          const currentZoom = useEditorStore.getState().viewportZoom;
          const nextZoom = Math.max(10, Math.min(500, currentZoom - 10));
          setEditorState({ viewportZoom: nextZoom });
          return;
        }
      }

      // Single key shortcuts (no modifiers)
      if (!cmdOrCtrl && !event.altKey && !event.shiftKey) {
        switch (event.key.toLowerCase()) {
          // A transform tool puts the pen down.
          case "w":
            setEditorState({ activeTransformTool: "translate", penTool: null });
            break;
          case "e":
            setEditorState({ activeTransformTool: "rotate", penTool: null });
            break;
          case "r":
            setEditorState({ activeTransformTool: "scale", penTool: null });
            break;
          case "p": {
            const { penTool, setPenTool } = useEditorStore.getState();
            setPenTool(penTool?.mode === "draw" ? null : { mode: "draw", pathId: null, selectedPoint: null });
            break;
          }
          // Edits the selected path's points (the pen takes Enter itself while it's on).
          case "enter": {
            const selectedIds = useEditorStore.getState().selectedEntityIds;
            if (selectedIds.length === 1) editPath(selectedIds[0]);
            break;
          }
          case "delete":
          case "backspace": {
            const { entities, selectedEntityIds } = useEditorStore.getState();
            const deletableIds = selectedEntityIds.filter((id) => !isEffectivelyLocked(entities, id));
            if (deletableIds.length > 0) {
              useEditorStore.getState().removeEntity(deletableIds);
            }
            break;
          }
          case "f": {
            const selectedIds = useEditorStore.getState().selectedEntityIds;
            if (selectedIds.length > 0) {
              window.dispatchEvent(new CustomEvent("libre3d-center-on-selected"));
              window.dispatchEvent(new CustomEvent("libre3d-orientate-to-selected"));
            }
            break;
          }
          default:
            break;
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onDuplicate, onNewFile, setEditorState]);
}
