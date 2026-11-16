import { useEditorStore, type Entity } from "../../store/useEditorStore";
import {
  EVENT_TRIGGERS,
  TRIGGER_INFO,
  getObjectEvents,
  isKeyTrigger,
  stateRefLabel,
  transitionProblem,
  type EventTrigger,
  type SceneEvent,
} from "../../animation/events";
import type { ObjectState } from "../../animation/objectStates";
import { transitionRows } from "../../animation/transitions";
import { keyLabel } from "../../animation/keys";
import { ACTION_INFO, isTransition } from "../../animation/actions";
import { linkProblem } from "../../animation/links";
import { PanelSection } from "../ui/PanelSection";

interface EventsPanelProps {
  entity: Entity;
  /** Opens the Edit Event panel on an event. */
  onEditEvent: (eventId: string) => void;
}

// One line for the Events list: "Start · Cube: Base State → Up", or how many actions it has. A key
// trigger says its key ("Key Down Space"), or "Pick a key" before one is picked: it never fires till then.
const describeEvent = (event: SceneEvent, entities: Entity[], states: Record<string, ObjectState>): string => {
  const { label } = TRIGGER_INFO[event.trigger];
  if (isKeyTrigger(event.trigger) && !event.key) return `${label} · Pick a key`;
  const trigger = isKeyTrigger(event.trigger) ? `${label} ${keyLabel(event.key!)}` : label;
  if (event.actions.length !== 1) {
    return `${trigger} · ${event.actions.length === 0 ? "No actions" : `${event.actions.length} actions`}`;
  }

  const [action] = event.actions;
  if (!isTransition(action)) return `${trigger} · ${ACTION_INFO[action.type].label}`;
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
          const missingKey = isKeyTrigger(event.trigger) && !event.key;
          const movesMissing = event.actions.some((action) => isTransition(action) && transitionProblem(action, entityExists, states));
          const badLink = event.actions.some((action) => action.type === "openLink" && linkProblem(action.url));
          const hasProblem = missingKey || movesMissing || badLink;

          return (
            <div key={event.id} className="state-row">
              <button type="button" className="state-row-select" title={summary} onClick={() => onEditEvent(event.id)}>
                <i className={`ti ti-${TRIGGER_INFO[event.trigger].icon} event-row-icon`}></i>
                <span className="state-row-name">{summary}</span>
              </button>
              {hasProblem && (
                <i
                  className="ti ti-alert-triangle event-row-warning"
                  title={
                    missingKey
                      ? "This event has no key yet, so it never fires. Open it to pick one."
                      : movesMissing
                        ? "Something this event moves is missing, so Play skips it. Open it to pick a target or state."
                        : "This event's link can't open, so Play skips it. Open it to fix the link."
                  }
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
          <p className="state-hint">
            Events run in Play: Start when it begins, the mouse ones when the pointer is on this object, the key ones
            when a key is pressed or let go, Scroll as the page scrolls.
          </p>
        )}
      </div>
    </PanelSection>
  );
}
