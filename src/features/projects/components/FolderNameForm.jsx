import { useId, useState } from "react";
import Icon from "../../../shared/components/Icon.jsx";
import { getFolderErrorMessage, validateFolderName } from "../utils/folderValidation.js";

// The small inline form for a new folder's name, or a new name for an existing folder.
// `onSave(name)` saves and closes the form; if it returns a message instead, the form shows it.
export default function FolderNameForm({ label, initialName = "", folders, folderId = null, onSave, onCancel }) {
  const [name, setName] = useState(initialName);
  const [error, setError] = useState("");
  const [isPending, setIsPending] = useState(false);
  const errorId = useId();

  function handleChange(event) {
    setName(event.target.value);
    setError("");
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (isPending) {
      return;
    }

    const message = validateFolderName(name, folders, folderId);
    if (message) {
      setError(message);
      return;
    }

    setIsPending(true);

    try {
      const saveMessage = await onSave(name.trim());
      // On success the parent closes the form, so there is nothing more to do here
      if (saveMessage) {
        setError(saveMessage);
        setIsPending(false);
      }
    } catch (saveError) {
      setError(getFolderErrorMessage(saveError));
      setIsPending(false);
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
        <button type="submit" className="ws-icon-button" aria-label="Save folder" disabled={isPending}>
          <Icon name="check" />
        </button>
        <button type="button" className="ws-icon-button" aria-label="Cancel" disabled={isPending} onClick={onCancel}>
          <Icon name="close" />
        </button>
      </form>
      {/* role="alert" announces the message as soon as it appears */}
      {error && (
        <p id={errorId} role="alert" className="ws-inline-error">
          {error}
        </p>
      )}
    </div>
  );
}
