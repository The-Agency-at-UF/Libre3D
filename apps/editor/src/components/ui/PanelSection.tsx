import { ReactNode } from "react";

interface PanelSectionProps {
  title: string;
  children: ReactNode;
  defaultOpen?: boolean;
  /** A control at the right of the header (a "+" button): using it doesn't fold the section. */
  action?: ReactNode;
}

export function PanelSection({ title, children, defaultOpen = true, action }: PanelSectionProps) {
  return (
    <details className="section" open={defaultOpen}>
      <summary className="section-header">
        <div className="section-title-row">
          <i className="ti ti-chevron-right chevron"></i>
          <span className="section-label">{title}</span>
        </div>
        {action && (
          // A click in the summary folds the section; one on the action shouldn't.
          <div className="section-action" onClick={(event) => event.preventDefault()}>
            {action}
          </div>
        )}
      </summary>
      <div className="section-body">
        {children}
      </div>
    </details>
  );
}
