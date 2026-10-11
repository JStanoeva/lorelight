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

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      onCancel={handleEscape}
      onClose={onCancel}
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
        <button type="button" onClick={onCancel} disabled={isPending} className="btn btn-ghost">
          {cancelLabel}
        </button>
        <button type="button" onClick={onConfirm} disabled={isPending} className="btn btn-danger">
          {isPending ? pendingLabel : confirmLabel}
        </button>
      </div>
    </dialog>
  );
}
