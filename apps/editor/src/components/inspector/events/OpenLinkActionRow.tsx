/**
 * PURPOSE: The Open Link action's row in the Edit Event panel (C2): the link, and whether it opens in
 * a new tab.
 *
 * INPUT: `ActionEditorProps<OpenLinkAction>`.
 * OUTPUT: Each change through `onChange` (one undo step each: the link commits on Enter or blur).
 *
 * The link is kept as typed, so a half-typed one isn't lost; `linkProblem` (animation/links.ts)
 * warns when Play won't open it, and a bare domain gets an "https://" fix. Play itself refuses
 * anything but http, https and mailto, whatever the document says.
 */

import { useEffect, useState } from "react";
import type { OpenLinkAction } from "../../../animation/actions";
import type { EventTrigger } from "../../../animation/events";
import { linkProblem, withHttps } from "../../../animation/links";
import { Switch } from "../../ui/Switch";
import type { ActionEditorProps } from "./actionEditors";

// Triggers with a click behind them: the browser lets those open a tab.
const CLICK_TRIGGERS: readonly EventTrigger[] = ["mouseDown", "mouseUp"];

export function OpenLinkActionRow({ action, trigger, isReadOnly, onChange, onRemove }: ActionEditorProps<OpenLinkAction>) {
  const [open, setOpen] = useState(true);
  const [draft, setDraft] = useState(action.url);
  // Undo, or another tab, changing the link shows here.
  useEffect(() => setDraft(action.url), [action.url]);

  const commit = (url: string) => {
    if (url !== action.url) onChange({ ...action, url });
  };

  const problem = linkProblem(action.url);
  const fix = problem === "unsafe" ? withHttps(action.url) : null;

  return (
    <div className="mat-layer event-action" data-open={open}>
      <div className="mat-layer-header">
        <button type="button" className="mat-layer-toggle" onClick={() => setOpen((o) => !o)} aria-expanded={open}>
          <i className="ti ti-chevron-right chevron"></i>
          <span className="mat-layer-icon">
            <i className="ti ti-link"></i>
          </span>
          <span className="mat-layer-name">Open Link</span>
          {problem && <i className="ti ti-alert-triangle event-row-warning" title="Play skips this link until it's fixed"></i>}
        </button>
        <div className="mat-layer-action">
          <button type="button" className="mat-icon-btn" disabled={isReadOnly} title="Delete this link" aria-label="Delete this link" onClick={onRemove}>
            <i className="ti ti-x"></i>
          </button>
        </div>
      </div>

      {open && (
        <fieldset className="inspector-fieldset" disabled={isReadOnly}>
          <div className="mat-layer-body">
            <div className="prop event-link-row">
              <span className="prop-label">URL</span>
              <input
                type="text"
                inputMode="url"
                spellCheck={false}
                autoComplete="off"
                placeholder="https://example.com"
                aria-label="Link to open"
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                onBlur={() => commit(draft)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") event.currentTarget.blur();
                  else if (event.key === "Escape") setDraft(action.url);
                }}
              />
            </div>
            <Switch label="New Tab" checked={action.newTab} onChange={(newTab) => onChange({ ...action, newTab })} />

            {problem === "empty" && <p className="state-hint event-problem">Type a link: Play skips this until then.</p>}
            {problem === "unsafe" && (
              <p className="state-hint event-problem">
                Only web (http, https) and email (mailto) links open; Play skips this one.
                {fix && (
                  <>
                    {" "}
                    <button type="button" className="event-link-fix" onClick={() => onChange({ ...action, url: fix })}>
                      Use {fix}
                    </button>
                  </>
                )}
              </p>
            )}
            {!CLICK_TRIGGERS.includes(trigger) && (
              <p className="state-hint">With no click behind it, the browser may block this link as a popup.</p>
            )}
            <p className="state-hint">In the editor's Play, links always open in a new tab.</p>
          </div>
        </fieldset>
      )}
    </div>
  );
}
