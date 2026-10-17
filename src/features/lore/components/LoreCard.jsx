import { Link } from "react-router";
import Icon from "../../../shared/components/Icon.jsx";
import { getCategory } from "../utils/getCategory.js";
import "../styles/lore-card.css";

// A lore entry as a card. The glow and the top line take the category colour (currentColor).
// `folderName` is the entry's folder ("Unfiled" when null); `isOwner` shows the Private marker.
export default function LoreCard({ entry, folderName, isOwner = false }) {
  const category = getCategory(entry.category);

  return (
    <article className="card-interactive lore-card">
      <span className={`lore-card-glow ${category.starClassName}`} aria-hidden="true" />

      <div className="lore-card-top">
        <span className={`badge ${category.badgeClassName}`}>
          <Icon name="star" size={10} className="lore-card-badge-star" />
          {category.label}
        </span>
        {isOwner && !entry.is_public && (
          <span className="lore-card-private">
            <Icon name="lock" size={12} />
            Private
          </span>
        )}
      </div>

      <h3 className="lore-card-title">
        {/* The link stretches over the whole card (see .card-link) */}
        <Link to={`/lore/${entry.id}`} className="card-link">
          {entry.title}
        </Link>
      </h3>

      <p className="lore-card-excerpt">{entry.description}</p>

      <div className="lore-card-foot">
        <span className="lore-card-folder">
          <Icon name="folder" size={14} />
          {folderName ?? "Unfiled"}
        </span>
        <span className="lore-card-appreciations">
          <Icon name="heart" size={14} />
          {entry.appreciation_count}
          <span className="sr-only"> {entry.appreciation_count === 1 ? "appreciation" : "appreciations"}</span>
        </span>
      </div>
    </article>
  );
}
