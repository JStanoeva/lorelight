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
      className="m-auto max-w-md p-6"
    >
      <h2 id={titleId}>{title}</h2>
      <div className="mt-3">{children}</div>
      {error && (
        <p role="alert" className="mt-3">
          {error}
        </p>
      )}
      <div className="mt-6 flex justify-end gap-3">
        <button type="button" onClick={onCancel} disabled={isPending}>
          {cancelLabel}
        </button>
        <button type="button" onClick={onConfirm} disabled={isPending}>
          {isPending ? pendingLabel : confirmLabel}
        </button>
      </div>
    </dialog>
  );
}
