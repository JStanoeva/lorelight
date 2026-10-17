import { useRef, useState } from "react";
import { flushSync } from "react-dom";
import ConfirmDialog from "../../../shared/components/ConfirmDialog.jsx";
import Icon from "../../../shared/components/Icon.jsx";
import { getErrorMessage } from "../../../shared/utils/getErrorMessage.js";
import { folderService } from "../services/folderService.js";
import { getNewEntryPath } from "../utils/projectContents.js";
import FolderMenu from "./FolderMenu.jsx";
import FolderNameForm from "./FolderNameForm.jsx";
import SidebarEntry from "./SidebarEntry.jsx";

function getDeleteFolderText(entryCount) {
  if (entryCount === 0) return "The folder is empty.";
  if (entryCount === 1) return "Its lore entry stays in the project, outside any folder. No lore is deleted.";
  return `Its ${entryCount} lore entries stay in the project, outside any folder. No lore is deleted.`;
}

// A collapsible folder with its entries, plus the owner's rename and delete actions.
// `entries` are the entries shown right now (the filter may hide some); `entryCount` counts them all.
export default function SidebarFolder({
  folder,
  folders,
  entries,
  entryCount,
  projectId,
  isOwner,
  isFiltering,
  activeEntryId,
  onNavigate,
  onFolderSaved,
  onFolderDeleted,
}) {
  const [isOpen, setIsOpen] = useState(true);
  const [isRenaming, setIsRenaming] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const toggleRef = useRef(null);
  const listId = `ws-folder-${folder.id}`;

  // While filtering, every folder with a match stays open, so the matches are visible
  const isExpanded = isOpen || isFiltering;

  async function handleRename(name) {
    const renamed = await folderService.renameFolder(folder.id, name);

    if (!renamed) {
      return "This folder no longer exists.";
    }

    onFolderSaved(renamed);
    closeRename();
  }

  // The rename form replaces the folder row, so after it closes focus goes back to the row.
  // flushSync brings the row back first, so it can take focus.
  function closeRename() {
    flushSync(() => setIsRenaming(false));
    toggleRef.current.focus();
  }

  function openDelete() {
    setDeleteError("");
    setIsDeleteOpen(true);
  }

  async function handleDelete() {
    setIsDeleting(true);
    setDeleteError("");

    try {
      const deleted = await folderService.deleteFolder(folder.id);

      if (!deleted) {
        setDeleteError("This folder no longer exists.");
        setIsDeleting(false);
        return;
      }

      // The folder leaves the list, so this component (and the dialog) disappear
      onFolderDeleted(folder.id);
    } catch (error) {
      setDeleteError(getErrorMessage(error));
      setIsDeleting(false);
    }
  }

  return (
    <li>
      {isRenaming ? (
        <FolderNameForm
          label={`New name for the folder ${folder.name}`}
          initialName={folder.name}
          folders={folders}
          folderId={folder.id}
          onSave={handleRename}
          onCancel={closeRename}
        />
      ) : (
        <div className="ws-folder-row">
          <button
            ref={toggleRef}
            type="button"
            className="ws-folder-toggle"
            aria-expanded={isExpanded}
            aria-controls={listId}
            onClick={() => setIsOpen(!isOpen)}
          >
            <Icon name="chevronRight" size={14} className="ws-chevron" />
            <Icon name="folder" className="ws-folder-icon" />
            <span className="ws-folder-name">{folder.name}</span>
            <span className="ws-folder-count">
              {entries.length}
              <span className="sr-only"> {entries.length === 1 ? "entry" : "entries"}</span>
            </span>
          </button>
          {isOwner && (
            <FolderMenu
              folderId={folder.id}
              folderName={folder.name}
              newEntryPath={getNewEntryPath(projectId, folder.id)}
              onRename={() => setIsRenaming(true)}
              onDelete={openDelete}
            />
          )}
        </div>
      )}

      <ul id={listId} className="ws-folder-entries" hidden={!isExpanded}>
        {entries.length === 0 && <li className="ws-tree-note">Empty folder</li>}
        {entries.map((entry) => (
          <SidebarEntry
            key={entry.id}
            entry={entry}
            isOwner={isOwner}
            isActive={entry.id === activeEntryId}
            onNavigate={onNavigate}
          />
        ))}
      </ul>

      {isDeleteOpen && (
        <ConfirmDialog
          isOpen
          title={`Delete the folder "${folder.name}"?`}
          error={deleteError}
          confirmLabel="Delete folder"
          isPending={isDeleting}
          onConfirm={handleDelete}
          onCancel={() => setIsDeleteOpen(false)}
        >
          {getDeleteFolderText(entryCount)}
        </ConfirmDialog>
      )}
    </li>
  );
}
