// Single source for generated ids across the app. Prefers a real UUID; the
// prefixed timestamp form is only a fallback for environments without
// crypto.randomUUID. `prefix` distinguishes the fallback ids by origin
// (entity / asset / node) and is unused on the UUID happy path.
export function createId(prefix: string): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}
