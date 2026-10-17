import { useState } from "react";
import ConfirmDialog from "../../../shared/components/ConfirmDialog.jsx";
import { getErrorMessage } from "../../../shared/utils/getErrorMessage.js";
import { loreService } from "../services/loreService.js";

// Rendered only while open, and only for the author. `onDeleted` runs after a successful delete
// (the details page then returns to the entry's project).
export default function DeleteLoreDialog({ entry, onCancel, onDeleted }) {
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState("");

  async function handleConfirm() {
    setIsPending(true);
    setError("");

    try {
      const deleted = await loreService.deleteLore(entry.id);

      if (!deleted) {
        setError("This entry no longer exists.");
        setIsPending(false);
        return;
      }

      onDeleted();
    } catch (requestError) {
      setError(getErrorMessage(requestError));
      setIsPending(false);
    }
  }

  return (
    <ConfirmDialog
      isOpen
      title={`Delete "${entry.title}"?`}
      error={error}
      confirmLabel="Delete entry"
      isPending={isPending}
      onConfirm={handleConfirm}
      onCancel={onCancel}
    >
      <p>Its appreciations and Constellation saves are removed too. Deleting it can&apos;t be undone.</p>
    </ConfirmDialog>
  );
}
