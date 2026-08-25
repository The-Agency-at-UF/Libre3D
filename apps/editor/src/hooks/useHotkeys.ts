import { useEffect } from "react";
import { useEditorStore } from "../store/useEditorStore";

interface UseHotkeysProps {
  onDuplicate?: () => void;
  onNewFile?: () => void;
}

export function useHotkeys({ onDuplicate, onNewFile }: UseHotkeysProps = {}) {
  const setEditorState = useEditorStore((state) => state.setEditorState);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Don't trigger hotkeys if user is typing in an input field
      const activeEl = document.activeElement;
      if (
        activeEl &&
        (activeEl.tagName === "INPUT" ||
          activeEl.tagName === "TEXTAREA" ||
          activeEl.getAttribute("contenteditable") === "true")
      ) {
        return;
      }

      const cmdOrCtrl = event.ctrlKey || event.metaKey;

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
          case "w":
            setEditorState({ activeTransformTool: "translate" });
            break;
          case "e":
            setEditorState({ activeTransformTool: "rotate" });
            break;
          case "r":
            setEditorState({ activeTransformTool: "scale" });
            break;
          case "delete":
          case "backspace": {
            const selectedIds = useEditorStore.getState().selectedEntityIds;
            if (selectedIds.length > 0) {
              useEditorStore.getState().removeEntity(selectedIds);
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
