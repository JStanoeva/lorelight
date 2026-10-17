import { useRef, useState } from "react";
import { flushSync } from "react-dom";
import Icon from "../../../shared/components/Icon.jsx";
import ProjectSidebar from "./ProjectSidebar.jsx";
import "../styles/workspace.css";

// The workspace frame: the contents sidebar on the left and the page's own content (`children`)
// on the right. Below 1024px a "Contents" bar opens the sidebar as a drawer instead.
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
  const [isContentsOpen, setIsContentsOpen] = useState(false);
  const contentsButtonRef = useRef(null);
  const closeButtonRef = useRef(null);

  function openContents() {
    // flushSync shows the drawer right away, so focus can move into it
    flushSync(() => setIsContentsOpen(true));
    closeButtonRef.current.focus();
  }

  // Closed with the close button, Escape or the backdrop: focus goes back to the Contents button
  function closeContents() {
    setIsContentsOpen(false);
    contentsButtonRef.current.focus();
  }

  // A link inside was followed: just close, the new page takes over
  function handleNavigate() {
    setIsContentsOpen(false);
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
