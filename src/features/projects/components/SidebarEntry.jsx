import { Link } from "react-router";
import { getCategory } from "../../lore/utils/getCategory.js";
import Icon from "../../../shared/components/Icon.jsx";

// One row in the contents tree: a star in the category's colour, the title, and (owner only)
// a lock on private entries. The open entry gets the gold ribbon (see .ws-entry.is-active).
export default function SidebarEntry({ entry, isOwner, isActive, onNavigate }) {
  const category = getCategory(entry.category);
  const isPrivate = isOwner && !entry.is_public;

  return (
    <li>
      <Link
        to={`/lore/${entry.id}`}
        className={isActive ? "ws-entry is-active" : "ws-entry"}
        aria-current={isActive ? "page" : undefined}
        onClick={onNavigate}
      >
        <Icon name="star" size={12} className={category.starClassName} />
        <span className="ws-entry-title">{entry.title}</span>
        {isPrivate && (
          <span className="ws-entry-lock">
            <Icon name="lock" size={13} />
            <span className="sr-only">(private)</span>
          </span>
        )}
      </Link>
    </li>
  );
}
