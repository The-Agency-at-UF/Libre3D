interface PageStatusProps {
  label: string;
}

/*
 * BLOCK: PageStatus (React Component)
 * PURPOSE: A full-screen "working on it" state: finishing sign-in, or downloading the editor.
 */
export function PageStatus({ label }: PageStatusProps) {
  return (
    <main className="page-status" role="status">
      <div className="ui-spinner" aria-hidden="true" />
      <p className="page-status-label">{label}</p>
    </main>
  );
}
