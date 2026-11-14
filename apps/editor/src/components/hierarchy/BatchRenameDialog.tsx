import { useState } from "react";
import { useEditorStore } from "../../store/useEditorStore";
import { isEffectivelyLocked } from "../../scene/entityIndex";

// Blender's Ctrl+F2 equivalent: find/replace plus prefix/suffix across the
// whole selection, applied through renameEntities in one undo step.
export function BatchRenameDialog({ onClose }: { onClose: () => void }) {
  const [find, setFind] = useState("");
  const [replace, setReplace] = useState("");
  const [prefix, setPrefix] = useState("");
  const [suffix, setSuffix] = useState("");
  const selectedCount = useEditorStore((state) => state.selectedEntityIds.length);

  const apply = () => {
    const state = useEditorStore.getState();
    const updates: Record<string, string> = {};
    state.selectedEntityIds.forEach((id) => {
      const entity = state.entities.find((e) => e.id === id);
      if (!entity || isEffectivelyLocked(state.entities, id)) return;
      let name = entity.name;
      if (find) name = name.split(find).join(replace);
      name = `${prefix}${name}${suffix}`;
      if (name.trim() && name !== entity.name) updates[id] = name;
    });
    if (Object.keys(updates).length > 0) state.renameEntities(updates);
    onClose();
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Enter") apply();
    if (event.key === "Escape") onClose();
  };

  return (
    <>
      <div className="hierarchy-context-overlay" onClick={onClose} />
      <div className="hierarchy-batch-rename" onKeyDown={handleKeyDown}>
        <div className="hierarchy-batch-rename-title">
          Batch Rename ({selectedCount} selected)
        </div>
        <label>
          Find
          <input autoFocus type="text" value={find} onChange={(e) => setFind(e.target.value)} />
        </label>
        <label>
          Replace with
          <input type="text" value={replace} onChange={(e) => setReplace(e.target.value)} />
        </label>
        <label>
          Prefix
          <input type="text" value={prefix} onChange={(e) => setPrefix(e.target.value)} />
        </label>
        <label>
          Suffix
          <input type="text" value={suffix} onChange={(e) => setSuffix(e.target.value)} />
        </label>
        <div className="hierarchy-batch-rename-actions">
          <button type="button" className="hamburger-dropdown-btn" onClick={onClose}>
            Cancel
          </button>
          <button type="button" className="hamburger-dropdown-btn hierarchy-batch-rename-apply" onClick={apply}>
            Apply
          </button>
        </div>
      </div>
    </>
  );
}
