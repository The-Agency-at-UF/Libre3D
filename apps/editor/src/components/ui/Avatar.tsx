interface AvatarProps {
  /** Who it represents; the first letter is shown. */
  name: string;
}

/*
 * BLOCK: Avatar (React Component)
 * PURPOSE: A round initial standing in for a person (there are no profile pictures).
 */
export function Avatar({ name }: AvatarProps) {
  return (
    <span className="ui-avatar" aria-hidden="true">
      {name.trim().charAt(0).toUpperCase() || "?"}
    </span>
  );
}
