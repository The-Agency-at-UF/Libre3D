import { ReactNode } from "react";

interface PanelSectionProps {
  title: string;
  children: ReactNode;
  defaultOpen?: boolean;
}

export function PanelSection({ title, children, defaultOpen = true }: PanelSectionProps) {
  return (
    <details className="section" open={defaultOpen}>
      <summary className="section-header">
        <div className="section-title-row">
          <i className="ti ti-chevron-right chevron"></i>
          <span className="section-label">{title}</span>
        </div>
      </summary>
      <div className="section-body">
        {children}
      </div>
    </details>
  );
}
