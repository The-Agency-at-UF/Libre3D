import { useEditorStore, type Entity } from "../../store/useEditorStore";
import {
  EVENT_TRIGGERS,
  getObjectEvents,
  stateRefLabel,
  transitionProblem,
  type EventTrigger,
  type SceneEvent,
} from "../../animation/events";
import type { ObjectState } from "../../animation/objectStates";
import { transitionRows } from "../../animation/transitions";
import { PanelSection } from "../ui/PanelSection";

interface EventsPanelProps {
  entity: Entity;
  /** Opens the Edit Event panel on an event. */
  onEditEvent: (eventId: string) => void;
}

// One line for the Events list: "Start · Cube: Base State → Up", or how many actions it has.
const describeEvent = (event: SceneEvent, entities: Entity[], states: Record<string, ObjectState>): string => {
  const trigger = EVENT_TRIGGERS.find((option) => option.value === event.trigger)?.label ?? event.trigger;
  if (event.actions.length !== 1) {
    return `${trigger} · ${event.actions.length === 0 ? "No actions" : `${event.actions.length} transitions`}`;
  }

  const [action] = event.actions;
  const target = entities.find((entity) => entity.id === action.targetId)?.name ?? "Pick a target";
  const rows = transitionRows(action).map((ref) => stateRefLabel(ref, action.targetId, states));
  return `${trigger} · ${target}: ${rows.join(" → ")}`;
};

// The selected object's events: its trigger and what it does, one line each. Click one to open it in
// the Edit Event panel. A view-only scene can look at them; adding and deleting are disabled.
export function EventsPanel({ entity, onEditEvent }: EventsPanelProps) {
  const allEvents = useEditorStore((state) => state.animation.events);
  const states = useEditorStore((state) => state.animation.states);
  const entities = useEditorStore((state) => state.entities);
  const isReadOnly = useEditorStore((state) => state.readOnlyReason !== null);
  const addEvent = useEditorStore((state) => state.addEvent);
  const removeEvent = useEditorStore((state) => state.removeEvent);

  const events = getObjectEvents(allEvents, entity.id);
  const entityExists = (id: string) => entities.some((candidate) => candidate.id === id);

  const add = (trigger: EventTrigger) => {
    const eventId = addEvent(entity.id, trigger);
    if (eventId) onEditEvent(eventId);
  };

  return (
    <PanelSection title="Events" defaultOpen={true}>
      <div className="state-list">
        {events.map((event) => {
          const summary = describeEvent(event, entities, states);
          const trigger = EVENT_TRIGGERS.find((option) => option.value === event.trigger);
          const hasProblem = event.actions.some((action) => transitionProblem(action, entityExists, states));

          return (
            <div key={event.id} className="state-row">
              <button type="button" className="state-row-select" title={summary} onClick={() => onEditEvent(event.id)}>
                <i className={`ti ti-${trigger?.icon ?? "bolt"} event-row-icon`}></i>
                <span className="state-row-name">{summary}</span>
              </button>
              {hasProblem && (
                <i
                  className="ti ti-alert-triangle event-row-warning"
                  title="Something this event moves is missing, so Play skips it. Open it to pick a target or state."
                ></i>
              )}
              <button
                type="button"
                className="mat-icon-btn"
                disabled={isReadOnly}
                title="Delete this event"
                aria-label="Delete this event"
                onClick={() => removeEvent(event.id)}
              >
                <i className="ti ti-x"></i>
              </button>
            </div>
          );
        })}

        <div className="event-add-row">
          {EVENT_TRIGGERS.map((trigger) => (
            <button
              key={trigger.value}
              type="button"
              className="mat-add-btn"
              disabled={isReadOnly}
              title={`Add a ${trigger.label} event to this object`}
              onClick={() => add(trigger.value)}
            >
              <i className="ti ti-plus"></i>
              <span>{trigger.label}</span>
            </button>
          ))}
        </div>

        {events.length === 0 && (
          <p className="state-hint">Events run in Play: Start when it begins, Mouse Down when this object is clicked.</p>
        )}
      </div>
    </PanelSection>
  );
}
