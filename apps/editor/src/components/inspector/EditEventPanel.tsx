import { useEffect, useState, type ReactNode } from "react";
import { useEditorStore, type Entity } from "../../store/useEditorStore";
import { getChildren } from "../../store/entityIndex";
import {
  createTransition,
  EVENT_TRIGGERS,
  isRowValid,
  stateRefLabel,
  transitionProblem,
  type EventTrigger,
  type SceneEvent,
} from "../../animation/events";
import { EASINGS, type Easing } from "../../animation/easing";
import { getObjectStates, type ObjectState } from "../../animation/objectStates";
import {
  transitionRows,
  type Cycle,
  type DelayRepeat,
  type StateRef,
  type TransitionAction,
  type TransitionStep,
} from "../../animation/transitions";
import { Select } from "../ui/Select";

const DELAY_REPEATS: { value: DelayRepeat; label: string }[] = [
  { value: "none", label: "None" },
  { value: "start", label: "Start" },
  { value: "end", label: "End" },
  { value: "startEnd", label: "Start & End" },
];

const CYCLES: { value: Cycle; label: string }[] = [
  { value: "restart", label: "Restart" },
  { value: "pingPong", label: "Ping Pong" },
];

const LOOPS = [
  { value: "none", label: "None" },
  { value: "infinite", label: "Infinite" },
  { value: "count", label: "Count" },
];

/** Scene objects for the Target dropdown, in hierarchy order, children indented under parents. */
const targetOptions = (entities: Entity[]) => {
  const ids = new Set(entities.map((entity) => entity.id));
  const options: { label: string; value: string }[] = [];
  const visit = (entity: Entity, depth: number) => {
    options.push({ label: `${"   ".repeat(depth)}${entity.name}`, value: entity.id });
    getChildren(entities, entity.id).forEach((child) => visit(child, depth + 1));
  };
  entities.filter((entity) => !entity.parentId || !ids.has(entity.parentId)).forEach((entity) => visit(entity, 0));
  return options;
};

/**
 * A number typed in and kept on Enter or leaving the field (Escape puts it back), so one edit is
 * one undo step rather than one per keystroke.
 */
function NumberField({
  value,
  onCommit,
  label,
  min = 0,
  step = 0.1,
  integer = false,
}: {
  value: number;
  onCommit: (value: number) => void;
  label: string;
  min?: number;
  step?: number;
  integer?: boolean;
}) {
  const [draft, setDraft] = useState<string | null>(null);

  const commit = () => {
    if (draft === null) return;
    const parsed = parseFloat(draft);
    setDraft(null);
    if (!Number.isFinite(parsed)) return;
    const next = Math.max(min, integer ? Math.round(parsed) : parsed);
    if (next !== value) onCommit(next);
  };

  return (
    <input
      type="number"
      aria-label={label}
      title={label}
      min={min}
      step={step}
      value={draft ?? String(Number(value.toFixed(2)))}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={commit}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          e.currentTarget.blur();
        } else if (e.key === "Escape") {
          setDraft(null);
          e.stopPropagation();
        }
      }}
    />
  );
}

function PropRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="prop">
      <span className="prop-label">{label}</span>
      <div className="event-prop-control">{children}</div>
    </div>
  );
}

interface TransitionEditorProps {
  action: TransitionAction;
  entities: Entity[];
  states: Record<string, ObjectState>;
  onChange: (action: TransitionAction) => void;
  onRemove: () => void;
}

// One Transition action: its target, the states it goes through with a duration and easing between
// each, and the Sequence settings that repeat it. Collapsible, like a material layer.
function TransitionEditor({ action, entities, states, onChange, onRemove }: TransitionEditorProps) {
  const [open, setOpen] = useState(true);

  const target = entities.find((entity) => entity.id === action.targetId);
  const targetStates = getObjectStates(states, action.targetId);
  const rows = transitionRows(action);
  const problem = transitionProblem(action, (id) => entities.some((entity) => entity.id === id), states);

  const stateOptions = (index: number, ref: StateRef | "current") => {
    const options = [
      ...(index === 0 ? [{ label: "Current", value: "current" }] : []),
      { label: "Base State", value: "base" },
      ...targetStates.map((objectState) => ({ label: objectState.name, value: objectState.id })),
    ];
    return isRowValid(ref, index, action.targetId, states)
      ? options
      : [{ label: stateRefLabel(ref, action.targetId, states), value: ref }, ...options];
  };

  const setRow = (index: number, ref: string) =>
    onChange(
      index === 0
        ? { ...action, from: ref }
        : { ...action, steps: action.steps.map((step, i) => (i === index - 1 ? { ...step, to: ref } : step)) },
    );

  const setStep = (index: number, update: Partial<TransitionStep>) =>
    onChange({ ...action, steps: action.steps.map((step, i) => (i === index ? { ...step, ...update } : step)) });

  // A new last row: back to Base after a state, else the target's first state; timed like the last step.
  const addRow = () => {
    const last = action.steps[action.steps.length - 1];
    const lastRef = rows[rows.length - 1];
    const to = lastRef === "base" ? (targetStates[0]?.id ?? "base") : "base";
    onChange({ ...action, steps: [...action.steps, { to, duration: last?.duration ?? 1, easing: last?.easing ?? "easeInOut" }] });
  };

  const removeRow = (index: number) => onChange({ ...action, steps: action.steps.filter((_, i) => i !== index - 1) });

  // Another target has other states: rows naming the old one's become "Pick a state".
  const setTarget = (targetId: string) => {
    const keep = <T extends string>(ref: T): T => (ref === "base" || ref === "current" ? ref : ("" as T));
    onChange({ ...action, targetId, from: keep(action.from), steps: action.steps.map((step) => ({ ...step, to: keep(step.to) })) });
  };

  const loopMode = action.loop === "infinite" ? "infinite" : action.loop === 0 ? "none" : "count";
  const setLoopMode = (mode: string) =>
    onChange({ ...action, loop: mode === "infinite" ? "infinite" : mode === "none" ? 0 : Math.max(1, typeof action.loop === "number" ? action.loop : 1) });

  return (
    <div className="mat-layer event-action" data-open={open}>
      <div className="mat-layer-header">
        <button type="button" className="mat-layer-toggle" onClick={() => setOpen((o) => !o)} aria-expanded={open}>
          <i className="ti ti-chevron-right chevron"></i>
          <span className="mat-layer-icon">
            <i className="ti ti-arrows-exchange"></i>
          </span>
          <span className="mat-layer-name">Transition</span>
          {problem && <i className="ti ti-alert-triangle event-row-warning" title="Play skips this transition until it's fixed"></i>}
        </button>
        <div className="mat-layer-action">
          <button type="button" className="mat-icon-btn" title="Delete this transition" aria-label="Delete this transition" onClick={onRemove}>
            <i className="ti ti-x"></i>
          </button>
        </div>
      </div>

      {open && (
        <div className="mat-layer-body">
          <Select
            label="Target"
            options={target ? targetOptions(entities) : [{ label: "Pick a target", value: action.targetId }, ...targetOptions(entities)]}
            value={action.targetId}
            onChange={setTarget}
          />

          <div className="event-editor-heading">
            <span>Transitions</span>
            <button type="button" className="mat-icon-btn" title="Add a state to go to" aria-label="Add a state to go to" onClick={addRow}>
              <i className="ti ti-plus"></i>
            </button>
          </div>

          <div className="transition-rows">
            {rows.map((ref, index) => (
              <div key={index}>
                {index > 0 && (
                  <div className="transition-step">
                    <NumberField
                      label={`Seconds from ${index} to ${index + 1}`}
                      value={action.steps[index - 1].duration}
                      onCommit={(duration) => setStep(index - 1, { duration })}
                    />
                    <span className="transition-step-unit">s</span>
                    <Select
                      className="transition-step-easing"
                      options={EASINGS}
                      value={action.steps[index - 1].easing}
                      onChange={(easing) => setStep(index - 1, { easing: easing as Easing })}
                    />
                  </div>
                )}
                <div className="transition-row">
                  <span className="transition-row-number">{index + 1}</span>
                  <Select options={stateOptions(index, ref)} value={ref} onChange={(value) => setRow(index, value)} />
                  {index >= 2 ? (
                    <button
                      type="button"
                      className="mat-icon-btn"
                      title={`Remove row ${index + 1}`}
                      aria-label={`Remove row ${index + 1}`}
                      onClick={() => removeRow(index)}
                    >
                      <i className="ti ti-x"></i>
                    </button>
                  ) : (
                    <span className="transition-row-spacer" />
                  )}
                </div>
              </div>
            ))}
          </div>

          {problem === "target" && <p className="state-hint event-problem">Pick a target: Play skips this transition until then.</p>}
          {problem === "state" && <p className="state-hint event-problem">Pick a state for every row: Play skips this transition until then.</p>}
          {target && targetStates.length === 0 && (
            <p className="state-hint">{target.name} has no states yet. Add one in its States section to move it somewhere.</p>
          )}

          <div className="event-editor-heading">
            <span>Sequence (1 → {rows.length})</span>
          </div>
          <PropRow label="Delay">
            <NumberField label="Delay in seconds" value={action.delay} onCommit={(delay) => onChange({ ...action, delay })} />
            <span className="transition-step-unit">s</span>
          </PropRow>
          <Select
            label="Delay Repeat"
            options={DELAY_REPEATS}
            value={action.delayRepeat}
            onChange={(delayRepeat) => onChange({ ...action, delayRepeat: delayRepeat as DelayRepeat })}
          />
          <Select label="Loop" options={LOOPS} value={loopMode} onChange={setLoopMode} />
          {loopMode === "count" && (
            <PropRow label="Repeats">
              <NumberField
                label="Repeats after the first run"
                value={action.loop as number}
                min={1}
                step={1}
                integer
                onCommit={(loop) => onChange({ ...action, loop })}
              />
            </PropRow>
          )}
          {loopMode !== "none" && (
            <Select label="Cycle" options={CYCLES} value={action.cycle} onChange={(cycle) => onChange({ ...action, cycle: cycle as Cycle })} />
          )}
        </div>
      )}
    </div>
  );
}

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

  const trigger = EVENT_TRIGGERS.find((option) => option.value === event.trigger);
  const setActions = (actions: TransitionAction[]) => updateEvent(event.id, { actions });

  return (
    <div className="event-editor" role="dialog" aria-label="Edit Event">
      <div className="event-editor-header">
        <span>Edit Event</span>
        <button type="button" className="mat-icon-btn" title="Close (Esc)" aria-label="Close" onClick={onClose}>
          <i className="ti ti-x"></i>
        </button>
      </div>

      <fieldset className="inspector-fieldset" disabled={isReadOnly}>
        <div className="event-editor-body">
          <div className="event-trigger">
            <i className={`ti ti-${trigger?.icon ?? "bolt"}`}></i>
            <Select
              options={EVENT_TRIGGERS.map(({ value, label }) => ({ value, label }))}
              value={event.trigger}
              onChange={(value) => updateEvent(event.id, { trigger: value as EventTrigger })}
            />
          </div>

          <div className="event-editor-heading">
            <span>Actions</span>
            <button
              type="button"
              className="mat-icon-btn"
              title="Add a transition"
              aria-label="Add a transition"
              onClick={() => setActions([...event.actions, createTransition(states, event.ownerId)])}
            >
              <i className="ti ti-plus"></i>
            </button>
          </div>

          {event.actions.length === 0 && <p className="state-hint">No actions yet: + adds a transition.</p>}
          {event.actions.map((action, index) => (
            <TransitionEditor
              key={action.id}
              action={action}
              entities={entities}
              states={states}
              onChange={(next) => setActions(event.actions.map((other, i) => (i === index ? next : other)))}
              onRemove={() => setActions(event.actions.filter((_, i) => i !== index))}
            />
          ))}

          {isReadOnly && <p className="state-hint">This scene is open for editing elsewhere, so its events can't be changed here.</p>}
        </div>
      </fieldset>
    </div>
  );
}
