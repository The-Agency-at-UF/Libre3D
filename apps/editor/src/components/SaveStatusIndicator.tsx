import type { SaveStatus } from "../utils/sceneAutosave";

interface SaveStatusIndicatorProps {
  status: SaveStatus;
  onRetry: () => void;
}

const formatTime = (date: Date): string => date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });

const MEGABYTE = 1024 * 1024;

// "1.2 of 4.8 MB", "12 of 48 MB": decimals chosen by the total, so the numbers don't jump format.
const formatUploadedMegabytes = (loaded: number, total: number): string => {
  const decimals = total < 10 * MEGABYTE ? 1 : 0;

  return `${(loaded / MEGABYTE).toFixed(decimals)} of ${(total / MEGABYTE).toFixed(decimals)} MB`;
};

/*
 * BLOCK: SaveStatusIndicator (React Component)
 * PURPOSE: One line under the scene name saying whether the scene is saved: "Saved", "Saving…",
 *          "Uploading…" (imported files, before the save), offline, or what went wrong and what to
 *          do about it.
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
    case "uploading":
      return (
        <span className="save-status" role="status" title="Imported models and textures are saved with the scene">
          Uploading… {status.total > 0 ? Math.floor((status.loaded / status.total) * 100) : 0}%
          {status.total >= MEGABYTE && ` (${formatUploadedMegabytes(status.loaded, status.total)})`}
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
    case "openElsewhere":
      // The read-only banner over the viewport explains why and offers Take over.
      return (
        <span className="save-status save-status--warning" role="status">
          View only
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
