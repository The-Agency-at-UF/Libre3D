/**
 * PURPOSE: The Edit Event panel, in place of the inspector's panels: one event's trigger (and a key
 * trigger's key), and its actions, each edited by its type's own row (actionEditors.tsx), added
 * from "Add action".
 *
 * INPUT: The event, and how to close the panel.
 * OUTPUT: Every change is one `updateEvent` (one undo step). In a view-only scene everything shows
 *         but nothing can be changed.
 */

import { useCallback, useEffect } from "react";
import { useEditorStore } from "../../../store/useEditorStore";
import { EVENT_TRIGGERS, TRIGGER_INFO, isKeyTrigger, type EventTrigger, type SceneEvent } from "../../../animation/events";
import { ACTION_INFO, OFFERED_ACTIONS, createAction, type ActionType, type SceneAction } from "../../../animation/actions";
import { Menu } from "../../ui/Menu";
import { Select } from "../../ui/Select";
import { KeyCaptureField } from "../KeyCaptureField";
import { actionEditorFor } from "./actionEditors";

interface EditEventPanelProps {
  event: SceneEvent;
  onClose: () => void;
}

/**
 * BLOCK: EditEventPanel (React Component)
 * PURPOSE: Edits one event (notes/animation-plan.md, A3), in place of the inspector's panels: its
 *          trigger and its actions. Every change is one undo step (updateEvent). In a view-only
 *          scene everything shows but nothing can be changed. Closes on × or Escape.
 */
export function EditEventPanel({ event, onClose }: EditEventPanelProps) {
  const entities = useEditorStore((state) => state.entities);
  const states = useEditorStore((state) => state.animation.states);
  const isReadOnly = useEditorStore((state) => state.readOnlyReason !== null);
  const updateEvent = useEditorStore((state) => state.updateEvent);

  // Escape closes, unless it's putting back a field being typed in. (An open dropdown takes its own
  // Escape before the page sees it.)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const tag = (document.activeElement as HTMLElement | null)?.tagName;
      if (e.key === "Escape" && tag !== "INPUT" && tag !== "TEXTAREA") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const trigger = TRIGGER_INFO[event.trigger];
  const setActions = (actions: SceneAction[]) => updateEvent(event.id, { actions });
  const addAction = (type: ActionType) => setActions([...event.actions, createAction(type, { states, ownerId: event.ownerId })]);
  const setKey = useCallback((key: string) => updateEvent(event.id, { key }), [updateEvent, event.id]);

  return (
    <div className="event-editor" role="dialog" aria-label="Edit Event">
      <div className="event-editor-header">
        <span>Edit Event</span>
        <button type="button" className="mat-icon-btn" title="Close (Esc)" aria-label="Close" onClick={onClose}>
          <i className="ti ti-x"></i>
        </button>
      </div>

      <div className="event-editor-body">
        <fieldset className="inspector-fieldset" disabled={isReadOnly}>
          <div className="event-trigger">
            <i className={`ti ti-${trigger.icon}`}></i>
            <Select
              options={EVENT_TRIGGERS.map(({ value, label }) => ({ value, label }))}
              value={event.trigger}
              onChange={(value) => updateEvent(event.id, { trigger: value as EventTrigger })}
            />
          </div>

          {isKeyTrigger(event.trigger) && (
            <div className="prop event-key-row">
              <span className="prop-label">Key</span>
              <KeyCaptureField value={event.key} onChange={setKey} disabled={isReadOnly} />
            </div>
          )}

          <div className="event-editor-heading">
            <span>Actions</span>
            <AddActionButton onAdd={addAction} />
          </div>
        </fieldset>

        {event.actions.length === 0 && <p className="state-hint">No actions yet: + adds one.</p>}
        {event.actions.map((action, index) => {
          const Editor = actionEditorFor(action);
          return (
            <Editor
              key={action.id}
              action={action}
              entities={entities}
              states={states}
              trigger={event.trigger}
              isReadOnly={isReadOnly}
              isScrubbed={event.trigger === "scroll"}
              onChange={(next) => setActions(event.actions.map((other, i) => (i === index ? next : other)))}
              onRemove={() => setActions(event.actions.filter((_, i) => i !== index))}
            />
          );
        })}

        {isReadOnly && <p className="state-hint">This scene is open for editing elsewhere, so its events can't be changed here.</p>}
      </div>
    </div>
  );
}

// The Actions heading's +: adds the one offered type at once, or opens a menu of them when there are several.
function AddActionButton({ onAdd }: { onAdd: (type: ActionType) => void }) {
  if (OFFERED_ACTIONS.length === 1) {
    const [only] = OFFERED_ACTIONS;
    const label = `Add a ${ACTION_INFO[only].label.toLowerCase()}`;
    return (
      <button type="button" className="mat-icon-btn" title={label} aria-label={label} onClick={() => onAdd(only)}>
        <i className="ti ti-plus"></i>
      </button>
    );
  }
  return (
    <Menu
      label="Add an action"
      align="end"
      trigger={<i className="ti ti-plus"></i>}
      items={OFFERED_ACTIONS.map((type) => ({ label: ACTION_INFO[type].label, icon: ACTION_INFO[type].icon, onSelect: () => onAdd(type) }))}
    />
  );
}
