import { useCallback, useLayoutEffect, useRef } from "react";

/**
 * Returns a function that is the same object on every render and runs the `callback` from the
 * latest one. For handlers passed to a memoized child (`React.memo`): the child isn't re-rendered
 * just because its parent made a new closure, and the handler still sees the parent's current
 * state and props.
 *
 * Only for event handlers and other calls made after rendering. The latest `callback` is stored
 * once the render is committed, so a call made during a render would run the previous one.
 */
export function useStableCallback<Args extends unknown[], Result>(
  callback: (...args: Args) => Result,
): (...args: Args) => Result {
  const latest = useRef(callback);
  useLayoutEffect(() => {
    latest.current = callback;
  });
  return useCallback((...args: Args) => latest.current(...args), []);
}
