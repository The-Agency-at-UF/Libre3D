import type { ReactNode } from "react";

interface PageStatusProps {
  label: string;
  /** Show the spinner. Off for a final state such as "scene not found". */
  isWorking?: boolean;
  /** What to do next, under the label (e.g. a link back to the gallery). */
  children?: ReactNode;
}

/*
 * BLOCK: PageStatus (React Component)
 * PURPOSE: A full-screen state: "working on it" (finishing sign-in, opening a scene), or a dead end
 *          with a way out (a scene that was deleted).
 */
export function PageStatus({ label, isWorking = true, children }: PageStatusProps) {
  return (
    <main className="page-status" role="status">
      {isWorking && <div className="ui-spinner" aria-hidden="true" />}
      <p className="page-status-label">{label}</p>
      {children}
    </main>
  );
}
