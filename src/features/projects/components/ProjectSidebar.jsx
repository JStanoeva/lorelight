import { useId, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { Link } from "react-router";
import CoverImage from "../../../shared/components/CoverImage.jsx";
import Icon from "../../../shared/components/Icon.jsx";
import { folderService } from "../services/folderService.js";
import { filterEntries, formatEntryCount, getFolderEntries } from "../utils/projectContents.js";
import FolderNameForm from "./FolderNameForm.jsx";
import NewMenu from "./NewMenu.jsx";
import SidebarEntry from "./SidebarEntry.jsx";
import SidebarFolder from "./SidebarFolder.jsx";

// The project's contents: a filter box, the folders with their entries, and the unfiled entries.
// It stays mounted across Project Details and Lore Details (see ProjectWorkspaceLayout), where
// `activeEntryId` marks the open entry.
// On wide screens it's a fixed column; below 1024px it's a drawer: `onClose` closes it (close button,
// Escape), `onNavigate` closes it when a link inside is followed or focus leaves it.
export default function ProjectSidebar({
  project,
  folders,
  entries,
  isOwner,
  activeEntryId,
  isOpen,
  onClose,
  onNavigate,
  closeButtonRef,
  onFolderSaved,
  onFolderDeleted,
}) {
  const [filterText, setFilterText] = useState("");
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  // The last deleted folder, read out by screen readers since its row is gone. `count` goes up with
  // every delete, so the line is replaced and announced again even when two folders share a name.
  const [deleted, setDeleted] = useState({ name: "", count: 0 });
  const filterId = useId();
  const treeRef = useRef(null);

  // The filter box is hidden without entries (e.g. after the last one is deleted), so then any text
  // left in it is ignored: otherwise it would hide every folder
  const isFiltering = entries.length > 0 && filterText.trim() !== "";
  const shownEntries = filterEntries(entries, filterText);
  // While filtering, folders without a match are hidden
  const shownFolders = isFiltering
    ? folders.filter((folder) => getFolderEntries(shownEntries, folder.id).length > 0)
    : folders;
  const unfiledEntries = getFolderEntries(shownEntries, null);
  const isEmpty = folders.length === 0 && entries.length === 0;

  // The form is gone after saving, so focus moves to the new folder's button, and screen readers
  // hear its name. flushSync shows the folder (and removes the form) first. While filtering, the
  // empty new folder is hidden, so the tree takes focus instead.
  async function handleCreateFolder(name) {
    const folder = await folderService.createFolder(project.id, name);
    flushSync(() => {
      onFolderSaved(folder);
      setIsCreatingFolder(false);
    });
    // SidebarFolder's button points at its entry list, whose id is "ws-folder-" + the folder's id
    const folderButton = treeRef.current.querySelector(`[aria-controls="ws-folder-${folder.id}"]`);
    (folderButton ?? treeRef.current).focus();
  }

  // The form is gone after cancelling, so focus moves to the tree (flushSync first)
  function closeFolderForm() {
    flushSync(() => setIsCreatingFolder(false));
    treeRef.current.focus();
  }

  // The deleted folder and its menu button are gone, so focus moves to the tree instead of the top
  // of the page. flushSync removes the folder (and its open dialog) first: nothing outside an open
  // dialog can take focus.
  function handleFolderDeleted(folderId) {
    const folder = folders.find((item) => item.id === folderId);
    flushSync(() => onFolderDeleted(folderId));
    setDeleted((current) => ({ name: folder.name, count: current.count + 1 }));
    treeRef.current.focus();
  }

  function handleKeyDown(event) {
    if (event.key === "Escape" && isOpen) {
      onClose();
    }
  }

  // Tabbing out of the open drawer closes it, so it never covers the element that gets focus
  function handleBlur(event) {
    if (isOpen && event.relatedTarget && !event.currentTarget.contains(event.relatedTarget)) {
      onNavigate();
    }
  }

  return (
    <nav
      id="ws-contents"
      aria-label="Project contents"
      className={isOpen ? "ws-sidebar is-open" : "ws-sidebar"}
      onKeyDown={handleKeyDown}
      onBlur={handleBlur}
    >
      <div className="ws-sidebar-head">
        <div className="ws-sidebar-topline">
          <Link to={isOwner ? "/projects" : `/profile/${project.owner_id}`} className="ws-back-link">
            <Icon name="chevronLeft" size={14} />
            {isOwner ? "My Projects" : `@${project.owner?.username ?? "creator"}`}
          </Link>
          {/* Only visible in the drawer (below 1024px) */}
          <button
            ref={closeButtonRef}
            type="button"
            className="ws-icon-button ws-drawer-close"
            aria-label="Close contents"
            onClick={onClose}
          >
            <Icon name="close" size={18} />
          </button>
        </div>

        <Link
          to={`/projects/${project.id}`}
          className="ws-sidebar-project"
          aria-current={activeEntryId ? undefined : "page"}
          onClick={onNavigate}
        >
          <span className="ws-sidebar-emblem">
            <CoverImage src={project.cover_url} seed={project.id} />
          </span>
          <span className="ws-sidebar-project-text">
            <span className="ws-sidebar-project-title">{project.title}</span>
            <span className="ws-sidebar-project-meta">{formatEntryCount(entries.length)}</span>
          </span>
        </Link>

        {isOwner && <NewMenu projectId={project.id} onNewFolder={() => setIsCreatingFolder(true)} />}
      </div>

      {entries.length > 0 && (
        <>
          <div className="ws-filter">
            <label htmlFor={filterId} className="sr-only">
              Filter entries
            </label>
            <Icon name="search" className="ws-filter-icon" />
            <input
              id={filterId}
              type="search"
              className="ws-filter-input"
              placeholder="Filter entries…"
              value={filterText}
              onChange={(event) => setFilterText(event.target.value)}
              autoComplete="off"
            />
          </div>
          {/* Screen readers hear how many entries match while the user types */}
          <p className="ws-filter-status" aria-live="polite">
            {isFiltering &&
              (shownEntries.length === 0
                ? "No entries match."
                : `${shownEntries.length} ${shownEntries.length === 1 ? "match" : "matches"}`)}
          </p>
        </>
      )}

      {/* A short name, so focus landing here (after a folder is deleted or the new-folder form is
          cancelled) isn't read as every folder and entry inside */}
      <div ref={treeRef} className="ws-tree" tabIndex={-1} role="group" aria-label="Folders and entries">
        {(shownFolders.length > 0 || (isOwner && !isFiltering)) && <p className="ws-tree-label">Folders</p>}

        {isCreatingFolder && (
          <FolderNameForm
            label="New folder name"
            folders={folders}
            onSave={handleCreateFolder}
            onCancel={closeFolderForm}
          />
        )}

        {shownFolders.length > 0 ? (
          <ul className="ws-tree-list">
            {shownFolders.map((folder) => (
              <SidebarFolder
                key={folder.id}
                folder={folder}
                folders={folders}
                entries={getFolderEntries(shownEntries, folder.id)}
                entryCount={getFolderEntries(entries, folder.id).length}
                projectId={project.id}
                isOwner={isOwner}
                isFiltering={isFiltering}
                activeEntryId={activeEntryId}
                onNavigate={onNavigate}
                onFolderSaved={onFolderSaved}
                onFolderDeleted={handleFolderDeleted}
              />
            ))}
          </ul>
        ) : (
          isOwner && !isCreatingFolder && !isFiltering && <p className="ws-tree-note">No folders yet</p>
        )}

        {unfiledEntries.length > 0 && (
          <>
            <p className="ws-tree-label">Unfiled</p>
            <ul className="ws-tree-list">
              {unfiledEntries.map((entry) => (
                <SidebarEntry
                  key={entry.id}
                  entry={entry}
                  isOwner={isOwner}
                  isActive={entry.id === activeEntryId}
                  onNavigate={onNavigate}
                />
              ))}
            </ul>
          </>
        )}

        {isEmpty && <p className="ws-tree-note">{isOwner ? "No lore entries yet" : "No public lore yet"}</p>}
      </div>

      {/* Always rendered, so a change of its text is noticed. A new key per delete replaces the
          text, so it's announced every time */}
      <p role="status" className="sr-only">
        {deleted.name && <span key={deleted.count}>Deleted the folder “{deleted.name}”.</span>}
      </p>
    </nav>
  );
}
