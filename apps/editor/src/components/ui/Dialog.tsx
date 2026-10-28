import { useEffect, useRef, useState, type FormEvent } from "react";
import ReactDOM from "react-dom/client";
import { Button } from "./Button";

interface DialogProps {
  title?: string;
  message: string;
  confirmLabel: string;
  /** Omitted for an alert, which only has the confirm button. */
  cancelLabel?: string;
  /** Styles the confirm button for an action that can't be undone, like deleting. */
  danger?: boolean;
  /** Set to show a text field, prefilled with this value. */
  defaultValue?: string;
  /** The field's value when confirmed (or "" without a field); null when cancelled or dismissed. */
  onClose: (result: string | null) => void;
}

/*
 * BLOCK: Dialog (React Component)
 * PURPOSE: Libre3D's replacement for window.alert/confirm/prompt. A native <dialog> opened with
 *          showModal(), so the browser handles focus trapping, Escape and the top layer. Styled
 *          only through tokens.css variables, so it follows the dark/light theme on any page.
 */
function Dialog({ title, message, confirmLabel, cancelLabel, danger, defaultValue, onClose }: DialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [value, setValue] = useState(defaultValue ?? "");

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    // showModal() focuses the first control: the field, else Cancel, else the only button.
    dialog.showModal();
    dialog.querySelector("input")?.select();
  }, []);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    onClose(value);
  };

  return (
    <dialog
      ref={dialogRef}
      className="ui-dialog"
      aria-label={title ?? message}
      onCancel={(event) => {
        event.preventDefault();
        onClose(null);
      }}
    >
      <form className="ui-dialog-form" onSubmit={handleSubmit}>
        {title && <h2 className="ui-dialog-title">{title}</h2>}
        <p className="ui-dialog-message">{message}</p>
        {defaultValue !== undefined && (
          <input
            className="ui-dialog-input"
            aria-label={title ?? message}
            value={value}
            onChange={(event) => setValue(event.target.value)}
          />
        )}
        <div className="ui-dialog-actions">
          {cancelLabel && <Button onClick={() => onClose(null)}>{cancelLabel}</Button>}
          <Button type="submit" variant="primary" className={danger ? "ui-button--danger" : undefined}>
            {confirmLabel}
          </Button>
        </div>
      </form>
    </dialog>
  );
}

// Each dialog gets its own short-lived root, so callers can await it without a provider or store.
const openDialog = (props: Omit<DialogProps, "onClose">) =>
  new Promise<string | null>((resolve) => {
    const host = document.createElement("div");
    document.body.append(host);
    const root = ReactDOM.createRoot(host);

    root.render(
      <Dialog
        {...props}
        onClose={(result) => {
          resolve(result);
          // Unmount after the click/keydown that closed it has finished.
          queueMicrotask(() => {
            root.unmount();
            host.remove();
          });
        }}
      />,
    );
  });

export const showAlert = async (message: string, title?: string): Promise<void> => {
  await openDialog({ title, message, confirmLabel: "OK" });
};

export const showConfirm = async (
  message: string,
  { title, confirmLabel = "OK", danger }: { title?: string; confirmLabel?: string; danger?: boolean } = {},
): Promise<boolean> =>
  (await openDialog({ title, message, confirmLabel, cancelLabel: "Cancel", danger })) !== null;

/** Resolves to the entered text, or null when cancelled. */
export const showPrompt = (
  message: string,
  defaultValue = "",
  { title, confirmLabel = "OK" }: { title?: string; confirmLabel?: string } = {},
): Promise<string | null> =>
  openDialog({ title, message, confirmLabel, cancelLabel: "Cancel", defaultValue });
