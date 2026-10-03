import type { ReactNode } from "react";

import { Link } from "./Link";

interface NavItemProps {
  href: string;
  /** Tabler icon name without the `ti-` prefix, e.g. "layout-grid". */
  icon: string;
  isActive?: boolean;
  children: ReactNode;
}

/*
 * BLOCK: NavItem (React Component)
 * PURPOSE: One entry in a sidebar's navigation list: an icon and a label, highlighted when it is
 *          the current section.
 */
export function NavItem({ href, icon, isActive = false, children }: NavItemProps) {
  return (
    <Link
      className={`ui-nav-item${isActive ? " ui-nav-item--active" : ""}`}
      href={href}
      aria-current={isActive ? "page" : undefined}
    >
      <i className={`ti ti-${icon}`} aria-hidden="true" />
      {children}
    </Link>
  );
}
