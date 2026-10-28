import { useEffect, useRef } from "react";
import { useEditorStore } from "../store/useEditorStore";

/**
 * Makes a slider's drag one undo step, as the transform gizmo does: the value still updates as it
 * drags, but only the drag's first change records a step, and the rest join it until the slider
 * lets go (keyboard steps too, once the key comes up). Undo then goes back to the value from before
 * the drag. Call `changed` after each write, and spread `endProps` on the input.
 */
export function useSliderUndoStep() {
  const historyPaused = useRef(false);
  const end = () => {
    if (!historyPaused.current) return;
    historyPaused.current = false;
    useEditorStore.temporal.getState().resume();
  };
  const changed = () => {
    if (historyPaused.current) return;
    useEditorStore.temporal.getState().pause();
    historyPaused.current = true;
  };
  // Gone mid-drag (its panel closed): history goes on.
  useEffect(() => end, []);
  return { changed, endProps: { onPointerUp: end, onKeyUp: end, onBlur: end } };
}
