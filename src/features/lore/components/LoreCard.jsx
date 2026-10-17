import { Link } from "react-router";
import CoverImage from "../../../shared/components/CoverImage.jsx";
import Icon from "../../../shared/components/Icon.jsx";
import LorePlaceholder from "./LorePlaceholder.jsx";
import { getCategory } from "../utils/getCategory.js";
import "../styles/lore-card.css";

// A lore entry as a card: a picture strip on top (the entry's image, or its emblem print), then the text.
// The line under the picture and the glow behind the text take the category colour (currentColor).
// `folderName` is the entry's folder ("Unfiled" when null); `isOwner` shows the Private marker.
export default function LoreCard({ entry, folderName, isOwner = false }) {
  const category = getCategory(entry.category);

  return (
    <article className="card-interactive lore-card">
      <div className="lore-card-picture">
        {/* alt="" because the title right below already names the entry */}
        <CoverImage
          src={entry.image_url}
          alt=""
          placeholder={<LorePlaceholder seed={entry.id} category={entry.category} />}
        />
      </div>

      <div className={`lore-card-body ${category.starClassName}`}>
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
          {/* The link stretches over the whole card, picture included (see .card-link) */}
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
      </div>
    </article>
  );
}
