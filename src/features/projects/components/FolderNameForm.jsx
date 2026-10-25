import { useId, useRef, useState } from "react";
import Icon from "../../../shared/components/Icon.jsx";
import { getFolderErrorMessage, validateFolderName } from "../utils/folderValidation.js";

// The small inline form for a new folder's name, or a new name for an existing folder.
// `onSave(name)` saves and closes the form; if it returns a message instead, the form shows it.
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

  // Focus goes back to the field the message is about (the Save button may have had it).
  // ?. because the form may be gone by then: a link was followed while the folder was saving.
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
      // On success the parent closes the form, so there is nothing more to do here
      if (saveMessage) {
        showError(saveMessage);
      }
    } catch (saveError) {
      showError(getFolderErrorMessage(saveError));
    }
  }

  function handleKeyDown(event) {
    if (event.key === "Escape") {
      // Stop here, so Escape closes only this form and not the whole Contents drawer
      event.stopPropagation();
      // Like the disabled Cancel button: a save that is already running can't be cancelled
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
          // Opened by a click on "New folder" or "Rename folder", so the typing can start right away
          autoFocus
        />
        {/* aria-disabled instead of disabled while the folder saves: a disabled button would drop
            keyboard focus to the page. handleSubmit ignores a second press. */}
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
      {/* Focus may stay on Save while it waits, so this hidden line tells screen reader users what is
          happening. Always rendered, so a change of its text is noticed. */}
      <p role="status" className="sr-only">
        {isPending ? "Saving the folder…" : ""}
      </p>
      {/* role="alert" announces the message as soon as it appears. A new key on every failure
          re-creates it, so it is announced again even when the message is the same as last time */}
      {error && (
        <p key={failedAttempts} id={errorId} role="alert" className="ws-inline-error">
          {error}
        </p>
      )}
    </div>
  );
}
