/**
 * PURPOSE: Which row edits each type of action in the Edit Event panel: one entry per type, so a new
 * action type without a row is a compile error.
 *
 * INPUT: The props every action row takes (`ActionEditorProps`).
 * OUTPUT: `ACTION_EDITORS`, by action type.
 */

import type { ReactElement } from "react";
import type { EventTrigger } from "../../../animation/events";
import type { ObjectState } from "../../../animation/objectStates";
import type { ActionType, SceneAction } from "../../../animation/actions";
import type { Entity } from "../../../store/useEditorStore";
import { OpenLinkActionRow } from "./OpenLinkActionRow";
import { SoundActionRow } from "./SoundActionRow";
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

export const ACTION_EDITORS: { [T in ActionType]: ActionEditor<T> } = {
  transition: TransitionActionEditor,
  openLink: OpenLinkActionRow,
  sound: SoundActionRow,
};

/** The row for an action, typed for any action (the map's entry matches the action's own type). */
export const actionEditorFor = (action: SceneAction) => ACTION_EDITORS[action.type] as (props: ActionEditorProps<SceneAction>) => ReactElement;
