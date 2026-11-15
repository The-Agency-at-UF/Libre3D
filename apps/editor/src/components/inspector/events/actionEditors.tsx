/**
 * PURPOSE: Which row edits each type of action in the Edit Event panel: one entry per type, so a new
 * action type without a row is a compile error.
 *
 * INPUT: The props every action row takes (`ActionEditorProps`).
 * OUTPUT: `ACTION_EDITORS`, by action type.
 *
 * Sound isn't offered yet (C3 builds it): an event that holds one, from a later build, shows it by
 * name with its remove button, and keeps it as it is.
 */

import type { ReactElement } from "react";
import type { EventTrigger } from "../../../animation/events";
import type { ObjectState } from "../../../animation/objectStates";
import { ACTION_INFO, type ActionType, type SceneAction } from "../../../animation/actions";
import type { Entity } from "../../../store/useEditorStore";
import { OpenLinkActionRow } from "./OpenLinkActionRow";
import { TransitionActionEditor } from "./TransitionActionEditor";

/** What every action row is given. */
export interface ActionEditorProps<A extends SceneAction> {
  action: A;
  entities: Entity[];
  states: Record<string, ObjectState>;
  /** Its event's trigger. */
  trigger: EventTrigger;
  isReadOnly: boolean;
  /** Whether its event is a Scroll event (which plays transitions by scroll, not time). */
  isScrubbed: boolean;
  onChange: (action: A) => void;
  onRemove: () => void;
}

type ActionEditor<T extends ActionType> = (props: ActionEditorProps<Extract<SceneAction, { type: T }>>) => ReactElement;

// A type this build can't edit yet: its name and its remove button.
function NamedActionRow<A extends SceneAction>({ action, isReadOnly, onRemove }: ActionEditorProps<A>) {
  const { label, icon } = ACTION_INFO[action.type];
  return (
    <div className="mat-layer event-action">
      <div className="mat-layer-header">
        <span className="mat-layer-toggle">
          <span className="mat-layer-icon">
            <i className={`ti ti-${icon}`}></i>
          </span>
          <span className="mat-layer-name">{label}</span>
        </span>
        <button type="button" className="mat-icon-btn" disabled={isReadOnly} title={`Delete this ${label.toLowerCase()}`} aria-label={`Delete this ${label.toLowerCase()}`} onClick={onRemove}>
          <i className="ti ti-x"></i>
        </button>
      </div>
    </div>
  );
}

export const ACTION_EDITORS: { [T in ActionType]: ActionEditor<T> } = {
  transition: TransitionActionEditor,
  openLink: OpenLinkActionRow,
  sound: NamedActionRow,
};

/** The row for an action, typed for any action (the map's entry matches the action's own type). */
export const actionEditorFor = (action: SceneAction) => ACTION_EDITORS[action.type] as (props: ActionEditorProps<SceneAction>) => ReactElement;
