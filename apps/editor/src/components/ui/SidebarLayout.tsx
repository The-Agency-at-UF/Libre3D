import type { ReactNode } from "react";

interface SidebarLayoutProps {
  /** Left column: account, search, navigation. */
  sidebar: ReactNode;
  /** Heading of the current section, shown in the header bar. */
  title: string;
  /** Right side of the header bar, e.g. the page's main "create" action. */
  headerActions?: ReactNode;
  children: ReactNode;
}

/*
 * BLOCK: SidebarLayout (React Component)
 * PURPOSE: The file-browser frame for signed-in pages outside the editor (the gallery): a fixed
 *          left sidebar, and a main column with a header bar above the scrolling content.
 */
export function SidebarLayout({ sidebar, title, headerActions, children }: SidebarLayoutProps) {
  return (
    <div className="page-shell">
      <aside className="page-sidebar">{sidebar}</aside>
      <div className="page-shell-main">
        <header className="page-topbar">
          <h1 className="page-title">{title}</h1>
          {headerActions && <div className="page-topbar-actions">{headerActions}</div>}
        </header>
        <main className="page-content">{children}</main>
      </div>
    </div>
  );
}
