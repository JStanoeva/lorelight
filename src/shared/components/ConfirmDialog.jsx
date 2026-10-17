import { useEffect, useId, useRef } from "react";

// `isConfirmDisabled` blocks only the confirm button (e.g. while the dialog is still loading
// something it needs); `isPending` blocks both buttons while the request runs.
export default function ConfirmDialog({
  isOpen,
  title,
  children,
  error,
  confirmLabel = "Delete",
  pendingLabel = "Deleting…",
  cancelLabel = "Cancel",
  isPending = false,
  isConfirmDisabled = false,
  onConfirm,
  onCancel,
}) {
  const dialogRef = useRef(null);
  const titleId = useId();

  // The native <dialog> is opened and closed through its own methods,
  // so the effect keeps it in sync with the isOpen prop.
  useEffect(() => {
    const dialog = dialogRef.current;

    if (isOpen && !dialog.open) {
      dialog.showModal();
    } else if (!isOpen && dialog.open) {
      dialog.close();
    }
  }, [isOpen]);

  // Escape fires the native "cancel" event; keep the dialog open while a request is running.
  function handleEscape(event) {
    if (isPending) {
      event.preventDefault();
    }
  }

  // Escape belongs to this dialog only, not to a drawer or menu the dialog sits in
  function handleKeyDown(event) {
    if (event.key === "Escape") {
      event.stopPropagation();
    }
  }

  // Closing through the dialog itself (like Escape does) lets the browser give focus back to the
  // button that opened it; the "close" event then tells the parent through onCancel.
  function handleCancelClick() {
    dialogRef.current.close();
  }

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      onCancel={handleEscape}
      onClose={onCancel}
      onKeyDown={handleKeyDown}
      className="dialog"
    >
      <h2 id={titleId} className="text-xl">
        {title}
      </h2>
      <div className="mt-3 text-parchment-300">{children}</div>
      {error && (
        <p role="alert" className="alert-error mt-4 text-sm">
          {error}
        </p>
      )}
      <div className="mt-6 flex justify-end gap-3">
        <button type="button" onClick={handleCancelClick} disabled={isPending} className="btn btn-ghost">
          {cancelLabel}
        </button>
        <button
          type="button"
          onClick={onConfirm}
          disabled={isPending || isConfirmDisabled}
          className="btn btn-danger"
        >
          {isPending ? pendingLabel : confirmLabel}
        </button>
      </div>
    </dialog>
  );
}
