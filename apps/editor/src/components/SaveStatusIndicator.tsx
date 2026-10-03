import type { SaveStatus } from "../utils/sceneAutosave";

interface SaveStatusIndicatorProps {
  status: SaveStatus;
  onRetry: () => void;
}

const formatTime = (date: Date): string => date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });

/*
 * BLOCK: SaveStatusIndicator (React Component)
 * PURPOSE: One line under the scene name saying whether the scene is saved: "Saved", "Saving…",
 *          offline, or what went wrong and what to do about it.
 */
export function SaveStatusIndicator({ status, onRetry }: SaveStatusIndicatorProps) {
  switch (status.kind) {
    case "saved":
      return (
        <span className="save-status" role="status" title={status.savedAt ? `Saved at ${formatTime(status.savedAt)}` : undefined}>
          Saved
        </span>
      );
    case "saving":
      return (
        <span className="save-status" role="status">
          Saving…
        </span>
      );
    case "offline":
      return (
        <span className="save-status save-status--warning" role="status">
          Offline · will save when you're back
        </span>
      );
    case "error":
      return (
        <span className="save-status save-status--error" role="alert">
          {status.message}
          {status.willRetry && (
            <>
              {" · "}
              <button type="button" className="save-status-action" onClick={onRetry}>
                Retry
              </button>
            </>
          )}
        </span>
      );
    case "conflict":
      return (
        <span className="save-status save-status--error" role="alert">
          Changed somewhere else ·{" "}
          <button type="button" className="save-status-action" onClick={() => window.location.reload()}>
            Reload
          </button>
        </span>
      );
    case "deleted":
      return (
        <span className="save-status save-status--error" role="alert">
          This scene was deleted
        </span>
      );
    default:
      return (
        <span className="save-status save-status--error" role="alert">
          Signed out · not saving
        </span>
      );
  }
}
