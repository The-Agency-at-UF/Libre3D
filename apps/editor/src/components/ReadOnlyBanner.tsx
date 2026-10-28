interface ReadOnlyBannerProps {
  /** Whoever holds the scene is this user (another tab or device), so taking it over is theirs to do. */
  heldByYou: boolean;
  isTakingOver: boolean;
  onTakeOver: () => void;
}

/*
 * BLOCK: ReadOnlyBanner (React Component)
 * PURPOSE: Shown over the viewport, in the floating toolbar's place, while the scene is open for
 *          editing somewhere else (useSceneLock.ts). Says why nothing can be changed here and offers
 *          to move editing to this tab. Editing also comes back on its own once the other tab closes.
 */
export function ReadOnlyBanner({ heldByYou, isTakingOver, onTakeOver }: ReadOnlyBannerProps) {
  return (
    <div className="read-only-banner" role="status">
      <i className="ti ti-eye read-only-banner-icon" aria-hidden="true"></i>
      <div className="read-only-banner-text">
        <strong>View only</strong>
        <span>
          {heldByYou
            ? "It's open in another tab or window. You can edit here once it's closed there."
            : "Someone else is editing this scene. You can edit once they're done."}
        </span>
      </div>
      {heldByYou && (
        <button
          type="button"
          className="btn-chip primary read-only-banner-action"
          onClick={onTakeOver}
          disabled={isTakingOver}
          title="Edit here instead. The other tab or window becomes view only."
        >
          {isTakingOver ? "Taking over…" : "Take over editing"}
        </button>
      )}
    </div>
  );
}
