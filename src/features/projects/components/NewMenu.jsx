import { useCallback, useRef, useState } from "react";
import { Link } from "react-router";
import Icon from "../../../shared/components/Icon.jsx";
import { useOutsideClick } from "../../../shared/hooks/useOutsideClick.js";
import { getNewEntryPath } from "../utils/projectContents.js";

// Owner only: the "+ New" button at the top of the sidebar and its small menu.
export default function NewMenu({ projectId, onNewFolder }) {
  const [isOpen, setIsOpen] = useState(false);
  const anchorRef = useRef(null);
  const buttonRef = useRef(null);

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
      // Stop here, so Escape closes only the menu and not the whole Contents drawer.
      // The focused item disappears with the menu, so focus goes back to the button.
      event.stopPropagation();
      buttonRef.current.focus();
      close();
    }
  }

  function handleNewFolder() {
    close();
    onNewFolder();
  }

  return (
    <div ref={anchorRef} className="ws-popover-anchor" onBlur={handleBlur} onKeyDown={handleKeyDown}>
      <button
        ref={buttonRef}
        type="button"
        className="btn btn-primary ws-new-button"
        aria-expanded={isOpen}
        aria-controls="ws-new-menu"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Icon name="plus" />
        New
        <Icon name="chevronDown" size={14} className="ws-new-caret" />
      </button>

      {isOpen && (
        <ul id="ws-new-menu" className="ws-popover ws-popover-wide">
          <li>
            <Link to={getNewEntryPath(projectId)} className="ws-popover-item" onClick={close}>
              <Icon name="page" size={18} />
              <span>
                <span className="ws-popover-item-title">New lore entry</span>
                <span className="ws-popover-item-hint">A character, place, event…</span>
              </span>
            </Link>
          </li>
          <li>
            <button type="button" className="ws-popover-item" onClick={handleNewFolder}>
              <Icon name="folder" size={18} />
              <span>
                <span className="ws-popover-item-title">New folder</span>
                <span className="ws-popover-item-hint">Group related entries</span>
              </span>
            </button>
          </li>
        </ul>
      )}
    </div>
  );
}
