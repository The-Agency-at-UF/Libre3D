/**
 * PURPOSE: The mute/unmute button on a scene with sound (decision tree C4), in the editor's Play and
 * on the share page. Scenes start muted; pressing it is also the click browsers want before sound.
 *
 * INPUT: Whether sound is muted, and what to do when pressed.
 * OUTPUT: A real button, labelled "Unmute" / "Mute" with `aria-pressed` (pressed = muted).
 *
 * Inline SVG icons drawn in `currentColor` (no icon font, no image files), so the later colour
 * setting is one style. Placed by `data-position` (only bottom-right for now) in styles/play.css.
 */

interface MuteButtonProps {
  muted: boolean;
  onToggle: (muted: boolean) => void;
  position?: "bottomRight";
  className?: string;
}

export function MuteButton({ muted, onToggle, position = "bottomRight", className = "" }: MuteButtonProps) {
  const label = muted ? "Unmute" : "Mute";
  return (
    <button
      type="button"
      className={`mute-button ${className}`.trim()}
      data-position={position}
      aria-label={label}
      aria-pressed={muted}
      title={label}
      onClick={() => onToggle(!muted)}
      // Space presses the button itself: the editor's Space-to-pan cancels a button's own Space
      // (useViewportControls.ts), which only text fields are spared.
      onKeyDown={(event) => {
        if (event.key !== " ") return;
        event.preventDefault();
        if (!event.repeat) onToggle(!muted);
      }}
    >
      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z" fill="currentColor" stroke="none" />
        {muted ? (
          <path d="M16 9.5l5 5M21 9.5l-5 5" />
        ) : (
          <>
            <path d="M15.5 9a4 4 0 0 1 0 6" />
            <path d="M18 6.5a7.5 7.5 0 0 1 0 11" />
          </>
        )}
      </svg>
    </button>
  );
}
