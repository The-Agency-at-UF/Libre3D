import type { ObjectState, StateValueKey } from "../../animation/objectStates";
import { useEditorStore } from "../../store/useEditorStore";

interface StateValueExtraProps {
  objectState: ObjectState | null; // the state the object is shown in, or null for Base
  field: StateValueKey;
}

/**
 * Next to a field's label: when the shown state sets that field, a marker and a "Reset to Base"
 * (which stops the state setting it, so it follows Base again). Nothing in Base.
 */
export function StateValueExtra({ objectState, field }: StateValueExtraProps) {
  const clearStateValue = useEditorStore((state) => state.clearStateValue);

  // `!== undefined`, not truthiness: a trim of 0 is a value.
  if (objectState?.values[field] === undefined) return null;

  return (
    <>
      <span className="state-value-marker" title={`Set in ${objectState.name}`} />
      <button
        type="button"
        className="state-reset-btn"
        title={`Stop setting this in ${objectState.name}, so it follows Base`}
        onClick={() => clearStateValue(objectState.id, field)}
      >
        <i className="ti ti-arrow-back-up"></i>
        <span>Reset to Base</span>
      </button>
    </>
  );
}
