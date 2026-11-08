import { useId, useRef, useState } from "react";
import Icon from "../../../shared/components/Icon.jsx";
import { getFolderErrorMessage, validateFolderName } from "../utils/folderValidation.js";

// onSave(name) may return an error message to show; on success the parent closes the form
export default function FolderNameForm({ label, initialName = "", folders, folderId = null, onSave, onCancel }) {
  const [name, setName] = useState(initialName);
  const [error, setError] = useState("");
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [isPending, setIsPending] = useState(false);
  const inputRef = useRef(null);
  const errorId = useId();

  function handleChange(event) {
    setName(event.target.value);
    setError("");
  }

  // ?. because the form may be gone: a link was followed while the folder was saving
  function showError(message) {
    setError(message);
    setFailedAttempts((count) => count + 1);
    setIsPending(false);
    inputRef.current?.focus();
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (isPending) {
      return;
    }

    const message = validateFolderName(name, folders, folderId);
    if (message) {
      showError(message);
      return;
    }

    setIsPending(true);

    try {
      const saveMessage = await onSave(name.trim());
      if (saveMessage) {
        showError(saveMessage);
      }
    } catch (saveError) {
      showError(getFolderErrorMessage(saveError));
    }
  }

  function handleKeyDown(event) {
    if (event.key === "Escape") {
      // Escape closes only this form, not the whole Contents drawer
      event.stopPropagation();
      if (!isPending) {
        onCancel();
      }
    }
  }

  return (
    <div>
      <form
        className={error ? "ws-inline-form is-invalid" : "ws-inline-form"}
        noValidate
        onSubmit={handleSubmit}
        onKeyDown={handleKeyDown}
      >
        <Icon name="folder" className="ws-folder-icon" />
        <input
          ref={inputRef}
          className="ws-inline-input"
          aria-label={label}
          placeholder="Folder name"
          value={name}
          onChange={handleChange}
          readOnly={isPending}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          autoComplete="off"
          // Opened by a click on "New folder" or "Rename folder", so typing can start right away
          autoFocus
        />
        {/* aria-disabled, not disabled: a disabled button would drop keyboard focus to the page */}
        <button
          type="submit"
          className="ws-icon-button"
          aria-label="Save folder"
          aria-disabled={isPending || undefined}
        >
          <Icon name="check" />
        </button>
        <button type="button" className="ws-icon-button" aria-label="Cancel" disabled={isPending} onClick={onCancel}>
          <Icon name="close" />
        </button>
      </form>
      {/* Always rendered, so screen readers notice when its text changes */}
      <p role="status" className="sr-only">
        {isPending ? "Saving the folder…" : ""}
      </p>
      {/* A new key per failure, so the same message is announced again */}
      {error && (
        <p key={failedAttempts} id={errorId} role="alert" className="ws-inline-error">
          {error}
        </p>
      )}
    </div>
  );
}
