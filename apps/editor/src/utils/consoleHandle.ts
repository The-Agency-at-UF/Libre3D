/**
 * Puts `value` on `window` under `name`, for a person at the devtools console (and the browser test
 * scripts) to inspect. Returns a function that takes it off again, if it's still this value.
 *
 * Handles are for looking, never for code: nothing in `src/` may read one back. Code that needs the
 * editor's live scene or renderer imports viewport/liveViewport.ts.
 */
export const exposeConsoleHandle = (name: `__libre3d${string}`, value: unknown): (() => void) => {
  const handles = window as unknown as Record<string, unknown>;
  handles[name] = value;
  return () => {
    if (handles[name] === value) delete handles[name];
  };
};
