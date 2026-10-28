import type { AnchorHTMLAttributes, MouseEvent } from "react";

import { navigate } from "../../utils/navigation";

interface LinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string;
}

/*
 * BLOCK: Link (React Component)
 * PURPOSE: A real `<a href>` for in-app paths, so middle-click, Ctrl/Cmd+click, and "Copy link"
 *          still work, while a plain left click navigates without reloading the page.
 */
export function Link({ href, onClick, ...rest }: LinkProps) {
  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(event);

    const isPlainLeftClick =
      event.button === 0 && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey;

    if (!event.defaultPrevented && isPlainLeftClick && !rest.target) {
      event.preventDefault();
      navigate(href);
    }
  };

  return <a href={href} onClick={handleClick} {...rest} />;
}
