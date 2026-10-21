import { Link } from "react-router";
import StarGlyph from "../../home/components/StarGlyph.jsx";
import CoverImage from "../../../shared/components/CoverImage.jsx";
import Icon from "../../../shared/components/Icon.jsx";
import LorePlaceholder from "./LorePlaceholder.jsx";
import { getCategory } from "../utils/getCategory.js";
import { getVisibility } from "../utils/visibility.js";
import "../../../shared/styles/creator-link.css";
import "../styles/lore-card.css";

// How many tags the catalog card lists before "+N"
const VISIBLE_TAGS = 3;

// A lore entry as a card: a picture strip on top (the entry's image, or its emblem print), then the text.
// The line under the picture and the glow behind the text take the category colour (currentColor).
// variant "project" (Project Details): the folder in the footer. `folderName` is the entry's folder
// ("Unfiled" when null); `isOwner` shows the Private marker.
// variant "catalog" (Lore Catalog, profiles): the world (project) under the title, up to three tags,
// and the author in the footer, because the reader may not know whose lore it is. `showAuthor`
// false leaves the author out where the page already says whose lore it is (a creator's own lore
// on their profile).
// `isOwner` also shows "Hidden" (a public entry in a private project), but only when the entry was
// loaded with its project's is_public (a profile's lists); otherwise the project isn't known here.
export default function LoreCard({ entry, variant = "project", folderName, isOwner = false, showAuthor = true }) {
  const category = getCategory(entry.category);
  const isCatalog = variant === "catalog";
  const authorName = entry.author?.display_name ?? "Unknown creator";
  const tags = entry.tags ?? [];
  const shownTags = tags.slice(0, VISIBLE_TAGS);
  const hiddenTagCount = tags.length - shownTags.length;
  const isProjectKnown = typeof entry.project?.is_public === "boolean";
  const isHidden = isProjectKnown && getVisibility(entry, entry.project) === "hidden";

  return (
    <article className={isCatalog ? "card-interactive lore-card lore-card-catalog" : "card-interactive lore-card"}>
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
          {isOwner && isHidden && (
            <span className="lore-card-private lore-card-hidden">
              <Icon name="lock" size={12} />
              Hidden
              {/* The short label alone doesn't say why a public entry is hidden (as VisibilityBadge) */}
              <span className="sr-only">: public, but its project is private</span>
            </span>
          )}
        </div>

        <h3 className="lore-card-title">
          {/* The link stretches over the whole card, picture included (see .card-link) */}
          <Link to={`/lore/${entry.id}`} className="card-link">
            {entry.title}
          </Link>
        </h3>

        {isCatalog && entry.project && (
          <p className="lore-card-world">
            <StarGlyph className="lore-card-world-star" />
            <span className="sr-only">World: </span>
            <span className="lore-card-world-name">{entry.project.title}</span>
          </p>
        )}

        <p className="lore-card-excerpt">{entry.description}</p>

        {isCatalog && shownTags.length > 0 && (
          <ul aria-label="Tags" className="lore-card-tags">
            {shownTags.map((tag) => (
              <li key={tag} className="lore-card-tag">
                {tag}
              </li>
            ))}
            {hiddenTagCount > 0 && (
              <li className="lore-card-tag lore-card-tag-more">
                +{hiddenTagCount}
                <span className="sr-only"> more</span>
              </li>
            )}
          </ul>
        )}

        <div className="lore-card-foot">
          {isCatalog ? (
            showAuthor && (
              // Sits above the stretched title link (z-index), so it opens the profile, not the entry
              <Link to={`/profile/${entry.author_id}`} className="lore-card-author">
                <span className="creator-avatar" aria-hidden="true">
                  {authorName.charAt(0).toUpperCase()}
                </span>
                <span className="sr-only">By </span>
                <span className="lore-card-author-name">{authorName}</span>
              </Link>
            )
          ) : (
            <span className="lore-card-folder">
              <Icon name="folder" size={14} />
              {folderName ?? "Unfiled"}
            </span>
          )}
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
