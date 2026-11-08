import { useRef, useState } from "react";
import { flushSync } from "react-dom";
import { useLocation } from "react-router";
import Icon from "../../../shared/components/Icon.jsx";
import ProjectSidebar from "./ProjectSidebar.jsx";
import "../styles/workspace.css";

export default function ProjectWorkspace({
  project,
  folders,
  entries,
  isOwner,
  activeEntryId = null,
  onFolderSaved,
  onFolderDeleted,
  children,
}) {
  const { pathname } = useLocation();
  // The drawer is open only on the page it was opened on, so Back or Forward also closes it
  const [openedOnPath, setOpenedOnPath] = useState(null);
  // Reset during render (no effect needed), so coming back to that page doesn't reopen the drawer
  if (openedOnPath !== null && openedOnPath !== pathname) {
    setOpenedOnPath(null);
  }
  const isContentsOpen = openedOnPath === pathname;
  const contentsButtonRef = useRef(null);
  const closeButtonRef = useRef(null);

  function openContents() {
    // flushSync shows the drawer right away, so focus can move into it
    flushSync(() => setOpenedOnPath(pathname));
    closeButtonRef.current.focus();
  }

  function closeContents() {
    setOpenedOnPath(null);
    contentsButtonRef.current.focus();
  }

  // No focus return: a followed link or tabbing out has already moved focus
  function handleNavigate() {
    setOpenedOnPath(null);
  }

  return (
    <div className="ws">
      <div className="ws-mobile-bar">
        <button
          ref={contentsButtonRef}
          type="button"
          className="ws-contents-toggle"
          aria-expanded={isContentsOpen}
          aria-controls="ws-contents"
          onClick={openContents}
        >
          <Icon name="sidebar" size={18} />
          Contents
          <span className="ws-contents-count">
            {entries.length}
            <span className="sr-only"> {entries.length === 1 ? "entry" : "entries"}</span>
          </span>
        </button>
        <span className="ws-mobile-bar-title">{project.title}</span>
      </div>

      {isContentsOpen && <div className="ws-backdrop" aria-hidden="true" onClick={closeContents} />}

      <ProjectSidebar
        project={project}
        folders={folders}
        entries={entries}
        isOwner={isOwner}
        activeEntryId={activeEntryId}
        isOpen={isContentsOpen}
        onClose={closeContents}
        onNavigate={handleNavigate}
        closeButtonRef={closeButtonRef}
        onFolderSaved={onFolderSaved}
        onFolderDeleted={onFolderDeleted}
      />

      <div className="ws-main">
        <div className="ws-content">{children}</div>
      </div>
    </div>
  );
}
