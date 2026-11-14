/**
 * PURPOSE: The merge behind every nested-settings update (`sceneSettings`, `postProcessing`,
 * `frame`): the values in `source` over `target`, level by level, so a partial update never drops
 * the settings it doesn't mention.
 *
 * INPUT: The current settings and a partial update (or a saved scene's settings over the defaults).
 * OUTPUT: A new object; neither argument is changed. Arrays and null are values, not merged into.
 */
export function deepMerge<T>(target: T, source: unknown): T {
  const result = { ...target } as Record<string, unknown>;
  const from = (source ?? {}) as Record<string, unknown>;
  for (const key in from) {
    if (Object.prototype.hasOwnProperty.call(from, key)) {
      const sourceVal = from[key];
      if (sourceVal !== null && typeof sourceVal === "object" && !Array.isArray(sourceVal)) {
        result[key] = deepMerge((target as Record<string, unknown>)[key] || {}, sourceVal);
      } else {
        result[key] = sourceVal;
      }
    }
  }
  return result as T;
}
