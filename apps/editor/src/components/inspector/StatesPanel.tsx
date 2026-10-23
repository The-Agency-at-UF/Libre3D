import { useState } from "react";
import { selectViewedObjectState, useEditorStore, type Entity } from "../../store/useEditorStore";
import { getObjectStates, type ObjectState } from "../../animation/objectStates";
import { getEventsUsingState } from "../../animation/events";
import { PanelSection } from "../ui/PanelSection";

interface StatesPanelProps {
  entity: Entity;
}

// The selected object's Base State and its states. Click one to show the object in it (the
// viewport and the Transform panel then show it, and edits go to it; it stays shown that way when
// deselected); double-click to rename. Viewing works in a view-only scene; adding, renaming, and
// deleting don't.
export function StatesPanel({ entity }: StatesPanelProps) {
  const allStates = useEditorStore((state) => state.animation.states);
  const viewed = useEditorStore((state) => selectViewedObjectState(state, entity.id));
  const isReadOnly = useEditorStore((state) => state.readOnlyReason !== null);
  const setViewedState = useEditorStore((state) => state.setViewedState);
  const addState = useEditorStore((state) => state.addState);
  const renameState = useEditorStore((state) => state.renameState);
  const removeState = useEditorStore((state) => state.removeState);

  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");

  const states = getObjectStates(allStates, entity.id);

  // A state an event goes through asks first: those events' rows would say "Pick a state", and
  // Play would skip them until another is picked (or the deletion is undone).
  const deleteState = (objectState: ObjectState) => {
    const users = getEventsUsingState(useEditorStore.getState().animation.events, objectState.id);
    const used = users.length === 1 ? ["an event", "that event"] : [`${users.length} events`, "those events"];
    const message =
      `${objectState.name} is used by ${used[0]}. Deleting it leaves "Pick a state" in ${used[1]}, ` +
      `which Play skips until another state is picked. Delete it anyway?`;
    if (users.length === 0 || window.confirm(message)) removeState(objectState.id);
  };

  const startRename = (objectState: ObjectState) => {
    if (isReadOnly) return;
    setEditName(objectState.name);
    setRenamingId(objectState.id);
  };

  const saveRename = () => {
    if (renamingId) renameState(renamingId, editName);
    setRenamingId(null);
  };

  const handleRenameKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      saveRename();
    } else if (e.key === "Escape") {
      setRenamingId(null);
    }
  };

  return (
    <PanelSection title="States" defaultOpen={true}>
      <div className="state-list">
        <div className={`state-row${viewed ? "" : " state-row--active"}`}>
          <button type="button" className="state-row-select" onClick={() => setViewedState(entity.id, null)}>
            <span className="state-row-name">Base State</span>
          </button>
        </div>

        {states.map((objectState) => (
          <div
            key={objectState.id}
            className={`state-row${viewed?.id === objectState.id ? " state-row--active" : ""}`}
          >
            {renamingId === objectState.id ? (
              <input
                className="state-rename-input"
                type="text"
                value={editName}
                autoFocus
                onFocus={(e) => e.currentTarget.select()}
                onChange={(e) => setEditName(e.target.value)}
                onBlur={saveRename}
                onKeyDown={handleRenameKeyDown}
                aria-label="State name"
              />
            ) : (
              <button
                type="button"
                className="state-row-select"
                onClick={() => setViewedState(entity.id, objectState.id)}
                onDoubleClick={() => startRename(objectState)}
              >
                <span className="state-row-name">{objectState.name}</span>
              </button>
            )}
            <button
              type="button"
              className="mat-icon-btn"
              disabled={isReadOnly}
              title={`Delete ${objectState.name}`}
              aria-label={`Delete ${objectState.name}`}
              onClick={() => deleteState(objectState)}
            >
              <i className="ti ti-x"></i>
            </button>
          </div>
        ))}

        <button
          type="button"
          className="mat-add-btn"
          disabled={isReadOnly}
          title="Add a state to this object"
          onClick={() => addState(entity.id)}
        >
          <i className="ti ti-plus"></i>
          <span>State</span>
        </button>

        {viewed && (
          <p className="state-hint">
            {isReadOnly ? `Viewing ${viewed.name}.` : `Editing ${viewed.name}: moving, turning, and scaling change this state, not Base.`}
          </p>
        )}
      </div>
    </PanelSection>
  );
}
