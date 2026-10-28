import { useEffect, useLayoutEffect, useState, type CSSProperties } from "react";
import { createPortal } from "react-dom";

// Plain localStorage key, like "libre3d-theme" — UI-only, so it stays out of useEditorStore.
const TUTORIAL_SEEN_KEY = "libre3d-tutorial-seen";

type Placement = "below" | "left" | "right" | "inside";

// `target` is a selector for the area the step spotlights; `placement` is where the card sits relative to it.
const TUTORIAL_STEPS: { icon: string; title: string; body: string; target?: string; placement?: Placement }[] = [
  {
    icon: "ti-cube",
    title: "Welcome to Libre3D",
    body: "Build interactive 3D scenes right in your browser — no code required. This quick tour covers the basics.",
  },
  {
    icon: "ti-square-plus",
    title: "Add objects",
    body: "Click the + button in the floating toolbar to add shapes to your scene.",
    target: '[title="Add Shape"]',
    placement: "below",
  },
  {
    icon: "ti-list-tree",
    title: "Your scene's objects",
    body: "Everything in your scene lives in the Objects panel. Click to select, right-click for more options.",
    target: ".left-sidebar",
    placement: "right",
  },
  {
    icon: "ti-arrows-move",
    title: "Move, rotate, scale",
    body: "Click an object to select it, then drag the gizmo. Switch tools here or with W (move), E (rotate) and R (scale).",
    target: ".floating-toolbar",
    placement: "below",
  },
  {
    icon: "ti-video",
    title: "Navigate the viewport",
    body: "Hold Alt and drag to orbit, hold Space (or the middle mouse button) and drag to pan, and scroll to zoom. Press F to focus the selection.",
    target: ".viewport-container",
    placement: "inside",
  },
  {
    icon: "ti-adjustments",
    title: "Fine-tune in the inspector",
    body: "The right sidebar edits the selected object's transform and materials, plus scene, camera and frame settings.",
    target: ".right-sidebar",
    placement: "left",
  },
  {
    icon: "ti-player-play",
    title: "Preview, share, export",
    body: "Press Play to preview your scene, Share to publish a public link, or Export to download a .glb. You can reopen this tour anytime from the info button.",
    target: ".topbar-right",
    placement: "left",
  },
];

const HOTKEY_GROUPS = [
  {
    title: "Tools",
    keys: [
      ["Move tool", "W"],
      ["Rotate tool", "E"],
      ["Scale tool", "R"],
      ["Pen tool", "P"],
      ["Edit points", "Enter"],
    ],
  },
  {
    title: "Edit",
    keys: [
      ["Undo", "Ctrl+Z"],
      ["Redo", "Ctrl+Shift+Z"],
      ["Duplicate", "Ctrl+D"],
      ["Group selection", "Ctrl+G"],
      ["Delete selection", "Delete"],
      ["New file", "Ctrl+N"],
    ],
  },
  {
    title: "Viewport",
    keys: [
      ["Focus selection", "F"],
      ["Orbit", "Alt+Drag"],
      ["Pan", "Space+Drag"],
      ["Zoom in", "Ctrl+="],
      ["Zoom out", "Ctrl+-"],
      ["Exit preview", "Esc"],
    ],
  },
];

const CARD_WIDTH = 360;
const SPOTLIGHT_PAD = 6;
const CARD_GAP = 14;

function tourCardStyle(rect: DOMRect, placement: Placement): CSSProperties {
  const { innerWidth: vw, innerHeight: vh } = window;
  const clampX = (x: number) => Math.min(Math.max(16, x), vw - CARD_WIDTH - 16);
  const clampY = (y: number) => Math.min(Math.max(16, y), vh - 280);
  const centerX = clampX(rect.left + rect.width / 2 - CARD_WIDTH / 2);
  const centerY = clampY(rect.top + rect.height / 2 - 120);
  const offset = SPOTLIGHT_PAD + CARD_GAP;
  const base: CSSProperties = { position: "fixed", width: CARD_WIDTH };
  switch (placement) {
    case "below":
      return { ...base, top: rect.bottom + offset, left: centerX };
    case "left":
      return { ...base, top: centerY, right: vw - rect.left + offset };
    case "right":
      return { ...base, top: centerY, left: rect.right + offset };
    case "inside":
      return { ...base, bottom: vh - rect.bottom + 24, left: centerX };
  }
}

/*
 * BLOCK: HelpMenu (React Component)
 * PURPOSE: Compact info button in the inspector topbar with a dropdown that opens the
 *          first-run tutorial or the keyboard shortcuts reference. Auto-opens the
 *          tutorial once for first-time users.
 */
export function HelpMenu() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [openDialog, setOpenDialog] = useState<"tutorial" | "hotkeys" | null>(() => {
    try {
      return localStorage.getItem(TUTORIAL_SEEN_KEY) ? null : "tutorial";
    } catch {
      return null; // Storage blocked: never auto-open, or it would reappear on every load.
    }
  });
  const [step, setStep] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);

  // Marked seen as soon as it's shown, so leaving mid-tour (Back, reload) doesn't auto-open it again.
  useEffect(() => {
    if (openDialog !== "tutorial") return;
    try {
      localStorage.setItem(TUTORIAL_SEEN_KEY, "1");
    } catch {
      // Nothing to do.
    }
  }, [openDialog]);

  const closeDialog = () => setOpenDialog(null);

  useEffect(() => {
    if (!openDialog) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeDialog();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  });

  const current = TUTORIAL_STEPS[step];
  const isLastStep = step === TUTORIAL_STEPS.length - 1;
  const isTour = openDialog === "tutorial";

  // Track the spotlit element's box; a hidden target (e.g. sidebar during preview) falls back to a centered card.
  useLayoutEffect(() => {
    if (!isTour || !current.target) {
      setTargetRect(null);
      return;
    }
    const measure = () => {
      const rect = document.querySelector(current.target!)?.getBoundingClientRect();
      setTargetRect(rect && rect.width > 0 ? rect : null);
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [isTour, current.target]);

  const spotlight = isTour && targetRect && current.placement ? targetRect : null;

  const openFromMenu = (dialog: "tutorial" | "hotkeys") => {
    setStep(0);
    setOpenDialog(dialog);
    setIsMenuOpen(false);
  };

  return (
    <div className="hamburger-menu-wrap">
      <button
        className="btn-chip btn-chip--icon"
        type="button"
        title="Help"
        aria-label="Help"
        onClick={() => setIsMenuOpen(!isMenuOpen)}
      >
        <i className="ti ti-info-circle"></i>
      </button>

      {isMenuOpen && (
        <>
          <div className="hierarchy-context-overlay" onClick={() => setIsMenuOpen(false)} />
          <div className="hamburger-dropdown">
            <button className="hamburger-dropdown-btn" type="button" onClick={() => openFromMenu("tutorial")}>
              <span>
                <i className="ti ti-school" style={{ marginRight: "6px" }}></i>
                Tutorial
              </span>
            </button>
            <button className="hamburger-dropdown-btn" type="button" onClick={() => openFromMenu("hotkeys")}>
              <span>
                <i className="ti ti-keyboard" style={{ marginRight: "6px" }}></i>
                Keyboard Shortcuts
              </span>
            </button>
          </div>
        </>
      )}

      {/* Portaled: the right sidebar's backdrop-filter would otherwise trap position:fixed. */}
      {openDialog && createPortal(
        <div
          className={`editor-modal-backdrop ${spotlight ? "help-tour-backdrop" : ""}`}
          role="presentation"
          // The tour only closes deliberately (Skip / ✕ / Esc), so a stray click on the spotlit area doesn't end it.
          onClick={isTour ? undefined : closeDialog}
        >
          {spotlight && (
            <div
              className="help-spotlight"
              style={{
                top: spotlight.top - SPOTLIGHT_PAD,
                left: spotlight.left - SPOTLIGHT_PAD,
                width: spotlight.width + SPOTLIGHT_PAD * 2,
                height: spotlight.height + SPOTLIGHT_PAD * 2,
              }}
            />
          )}
          <section
            key={isTour ? step : "hotkeys"}
            className="editor-modal help-modal"
            style={spotlight ? tourCardStyle(spotlight, current.placement!) : undefined}
            role="dialog"
            aria-modal="true"
            aria-labelledby="help-dialog-title"
            onClick={(event) => event.stopPropagation()}
          >
            <button className="help-modal-close" type="button" aria-label="Close" onClick={closeDialog}>
              <i className="ti ti-x"></i>
            </button>

            {openDialog === "tutorial" ? (
              <>
                <i className={`ti ${current.icon} help-tutorial-icon`}></i>
                <h2 className="editor-modal-title" id="help-dialog-title">
                  {current.title}
                </h2>
                <p className="editor-modal-copy">{current.body}</p>
                <div className="help-tutorial-footer">
                  <div className="help-tutorial-dots">
                    {TUTORIAL_STEPS.map((s, i) => (
                      <span key={s.title} className={i === step ? "active" : ""} />
                    ))}
                  </div>
                  <div className="help-tutorial-nav">
                    {step === 0 ? (
                      <button className="editor-action" type="button" onClick={closeDialog}>
                        Skip
                      </button>
                    ) : (
                      <button className="editor-action" type="button" onClick={() => setStep(step - 1)}>
                        Back
                      </button>
                    )}
                    <button
                      className="editor-action editor-action--primary"
                      type="button"
                      onClick={isLastStep ? closeDialog : () => setStep(step + 1)}
                    >
                      {isLastStep ? "Get started" : "Next"}
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <>
                <h2 className="editor-modal-title" id="help-dialog-title">
                  Keyboard Shortcuts
                </h2>
                <div className="help-hotkeys">
                  {HOTKEY_GROUPS.map((group) => (
                    <div key={group.title}>
                      <div className="help-hotkeys-title">{group.title}</div>
                      {group.keys.map(([label, key]) => (
                        <div key={label} className="help-hotkeys-row">
                          <span>{label}</span>
                          <kbd>{key}</kbd>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </>
            )}
          </section>
        </div>,
        document.body
      )}
    </div>
  );
}
