import { useCallback, useRef, useState } from "react";
import { Link } from "react-router";
import Icon from "../../../shared/components/Icon.jsx";
import { useOutsideClick } from "../../../shared/hooks/useOutsideClick.js";

// Owner only: the "⋯" button on a folder row (new entry here, rename, delete).
export default function FolderMenu({ folderId, folderName, newEntryPath, onRename, onDelete }) {
  const [isOpen, setIsOpen] = useState(false);
  const anchorRef = useRef(null);
  const buttonRef = useRef(null);
  const menuId = `ws-folder-menu-${folderId}`;

  const close = useCallback(() => setIsOpen(false), []);
  useOutsideClick(anchorRef, isOpen, close);

  // Tabbing out of the menu closes it (a click elsewhere is handled by useOutsideClick)
  function handleBlur(event) {
    if (event.relatedTarget && !event.currentTarget.contains(event.relatedTarget)) {
      close();
    }
  }

  function handleKeyDown(event) {
    if (event.key === "Escape" && isOpen) {
      // The focused item disappears with the menu, so focus goes back to the "⋯" button
      event.stopPropagation();
      buttonRef.current.focus();
      close();
    }
  }

  // Focus the "⋯" button first: a dialog opened next (Delete) returns focus to it when it closes
  function choose(action) {
    buttonRef.current.focus();
    close();
    action();
  }

  return (
    <div ref={anchorRef} className="ws-popover-anchor" onBlur={handleBlur} onKeyDown={handleKeyDown}>
      <button
        ref={buttonRef}
        type="button"
        className="ws-icon-button"
        aria-label={`Actions for the folder ${folderName}`}
        aria-expanded={isOpen}
        aria-controls={menuId}
        onClick={() => setIsOpen(!isOpen)}
      >
        <Icon name="more" />
      </button>

      {isOpen && (
        <ul id={menuId} className="ws-popover ws-popover-right">
          <li>
            <Link to={newEntryPath} className="ws-popover-item is-compact" onClick={close}>
              <Icon name="plus" />
              New lore entry here
            </Link>
          </li>
          <li>
            <button type="button" className="ws-popover-item is-compact" onClick={() => choose(onRename)}>
              <Icon name="pencil" />
              Rename folder
            </button>
          </li>
          <li>
            <button type="button" className="ws-popover-item is-compact is-danger" onClick={() => choose(onDelete)}>
              <Icon name="trash" />
              Delete folder
            </button>
          </li>
        </ul>
      )}
    </div>
  );
}
