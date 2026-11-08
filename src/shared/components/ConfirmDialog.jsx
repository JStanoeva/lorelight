import { useEffect, useId, useRef } from "react";

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
  const descriptionId = useId();

  // A native <dialog> opens and closes through its own methods, so this keeps it in sync
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

  // Closing through the dialog itself lets the browser give focus back to the button that
  // opened it; the "close" event then calls onCancel.
  function handleCancelClick() {
    dialogRef.current.close();
  }

  function handleConfirmClick() {
    if (isPending) {
      return;
    }
    onConfirm();
  }

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
      onCancel={handleEscape}
      onClose={onCancel}
      onKeyDown={handleKeyDown}
      className="dialog"
    >
      <h2 id={titleId} className="text-xl">
        {title}
      </h2>
      <div id={descriptionId} className="mt-3 text-parchment-300">
        {children}
      </div>
      {error && (
        <p role="alert" className="alert-error mt-4 text-sm">
          {error}
        </p>
      )}
      <div className="mt-6 flex justify-end gap-3">
        <button type="button" onClick={handleCancelClick} disabled={isPending} className="btn btn-ghost">
          {cancelLabel}
        </button>
        {/* aria-disabled while pending: a disabled button would drop focus to the page, and after
            a failure the next Tab would leave the dialog */}
        <button
          type="button"
          onClick={handleConfirmClick}
          disabled={isConfirmDisabled}
          aria-disabled={isPending || undefined}
          className="btn btn-danger"
        >
          {isPending ? pendingLabel : confirmLabel}
        </button>
      </div>
      {/* Focus stays on the button while it waits, so this tells screen readers what's happening.
          Always rendered, so a change of its text is noticed. */}
      <p role="status" className="sr-only">
        {isPending ? pendingLabel : ""}
      </p>
    </dialog>
  );
}
