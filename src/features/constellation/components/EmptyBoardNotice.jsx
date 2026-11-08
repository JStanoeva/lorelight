import { Link } from "react-router";
import { fourPointStarPath } from "../utils/pinLayout.js";

// `category` (from LORE_CATEGORIES) is set when only the chosen category has no saved entries
export default function EmptyBoardNotice({ category, isOwner, ownerName, onShowAll }) {
  let title;
  let text;
  if (category) {
    title = `No ${category.label} lore on the board`;
    text = isOwner
      ? `None of the entries you've saved is ${category.label} lore right now.`
      : `None of the entries ${ownerName} saved is ${category.label} lore right now.`;
  } else {
    title = isOwner ? "Your Constellation is waiting for its first star" : "No saved lore yet";
    text = isOwner
      ? "Find lore you love in the Lore Catalog and press Save on its page. It's pinned here, ready for your next idea."
      : `${ownerName} hasn't saved any lore to their Constellation yet.`;
  }

  return (
    <div className={category ? `pin-notice ${category.starClassName}` : "pin-notice"}>
      <svg viewBox="0 0 220 170" className="pin-notice-art" aria-hidden="true" focusable="false">
        <path d="M110 28 C 78 18, 46 40, 12 30" className="pin-notice-thread" />
        <rect x="66" y="28" width="88" height="118" rx="10" transform="rotate(-3 110 28)" className="pin-notice-card" />
        <circle cx="110" cy="28" r="15" className="pin-notice-halo" />
        <path d={fourPointStarPath(110, 28, 11)} className="pin-notice-pin" />
      </svg>

      <h2 className="pin-notice-title">{title}</h2>
      <p className="pin-notice-text">{text}</p>

      {category && (
        <div className="pin-notice-actions">
          <button type="button" className="btn btn-ghost" onClick={onShowAll}>
            Show all
          </button>
          {isOwner && (
            <Link to={`/lore?category=${category.value}`} className="btn btn-primary">
              Explore {category.label} lore
            </Link>
          )}
        </div>
      )}

      {!category && isOwner && (
        <div className="pin-notice-actions">
          <Link to="/lore" className="btn btn-primary btn-lg">
            Explore the catalog
          </Link>
        </div>
      )}
    </div>
  );
}
