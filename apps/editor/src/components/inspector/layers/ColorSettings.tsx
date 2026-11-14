import { getViewedState } from "../../../animation/objectStates";
import { colorLayerOf } from "../../../scene/layers";
import { useEditorStore, type ColorLayer } from "../../../store/useEditorStore";
import { ColorPicker } from "../../ui/ColorPicker";
import { asOneUndoStep, useRowUpdate, type LayerRowData } from "../materialRows";
import { StateValueExtra } from "../StateValueExtra";

/**
 * The Color layer's drawer is the colour picker; its opacity is the layer's (the row's number).
 *
 * A state can set an object's colour, which is its top Color layer's (animation/objectStates.ts).
 * So while a selected object is shown in a state, the top Color layer's picker shows and edits
 * that state's colour, for that object alone, though the layers may be a material asset's. Other
 * Color layers, the layer's opacity, and the Material Builder always edit the layers themselves.
 */
export function ColorSettings({ row }: { row: LayerRowData }) {
  const update = useRowUpdate(row);
  const updateShownLooks = useEditorStore((state) => state.updateShownLooks);
  const viewedStates = useEditorStore((state) => state.viewedStates);
  const objectStates = useEditorStore((state) => state.animation.states);
  const first = row.pairs[0].layer as ColorLayer;

  const isTopColor = row.pairs.every(({ owner, layer }) => colorLayerOf(owner.layers) === layer);
  const entityIds = isTopColor ? row.pairs.flatMap(({ owner }) => owner.entityIds) : [];
  const shownStates = entityIds.map((id) => getViewedState(viewedStates, objectStates, id));
  const inState = shownStates.some((state) => state !== null);
  // One object shown in a state: its colour gets the marker and "Reset to Base".
  const objectState = entityIds.length === 1 ? shownStates[0] : null;
  const stateColor = shownStates.find((state) => state?.values.color !== undefined)?.values.color;

  return (
    <>
      {objectState?.values.color !== undefined && (
        <div className="mat-state-value">
          <span>Color</span>
          <StateValueExtra objectState={objectState} field="color" />
        </div>
      )}
      <ColorPicker
        color={(inState && stateColor) || first.color}
        alpha={first.opacity}
        onChange={({ color, alpha }) => {
          const edits: Array<() => void> = [];
          if (inState && color !== undefined) edits.push(() => updateShownLooks(Object.fromEntries(entityIds.map((id) => [id, { color }]))));
          const layerEdit = { ...(color !== undefined && !inState ? { color } : null), ...(alpha !== undefined ? { opacity: alpha } : null) };
          if (Object.keys(layerEdit).length > 0) edits.push(() => update(layerEdit));
          asOneUndoStep(edits);
        }}
      />
    </>
  );
}
