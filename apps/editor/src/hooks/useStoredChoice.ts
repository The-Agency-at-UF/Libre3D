import { useState } from "react";

/**
 * Local UI state for a choice among fixed options (a sort order, a view mode) that is remembered
 * in this browser under a plain localStorage key, like the sidebar width and theme. Not editor
 * state, so it stays out of `useEditorStore`. A stored value that isn't one of `options` (renamed
 * option, hand-edited storage) falls back to `fallback`.
 */
export function useStoredChoice<T extends string>(
  storageKey: string,
  options: readonly T[],
  fallback: T,
): [T, (value: T) => void] {
  const [choice, setChoice] = useState<T>(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      return options.find((option) => option === stored) ?? fallback;
    } catch {
      return fallback;
    }
  });

  const updateChoice = (value: T) => {
    setChoice(value);

    try {
      localStorage.setItem(storageKey, value);
    } catch {
      // Non-fatal: the choice just won't survive a reload.
    }
  };

  return [choice, updateChoice];
}
