import type { ReactNode } from "react";

import { Link } from "./Link";

interface PageLayoutProps {
  /** Right side of the header, e.g. the account and sign-out on the gallery. */
  headerActions?: ReactNode;
  children: ReactNode;
}

/*
 * BLOCK: PageLayout (React Component)
 * PURPOSE: The frame shared by every page outside the editor: a header with the product name and
 *          optional actions, then the page's own content. The editor has its own full-screen shell.
 */
export function PageLayout({ headerActions, children }: PageLayoutProps) {
  return (
    <div className="page">
      <header className="page-header">
        <Link className="page-brand" href="/">
          Libre3D
        </Link>
        {headerActions && <div className="page-header-actions">{headerActions}</div>}
      </header>
      <main className="page-main">{children}</main>
    </div>
  );
}
