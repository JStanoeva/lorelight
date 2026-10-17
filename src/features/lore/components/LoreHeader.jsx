import { Link } from "react-router";
import CoverImage from "../../../shared/components/CoverImage.jsx";
import CreatorLink from "../../../shared/components/CreatorLink.jsx";
import Icon from "../../../shared/components/Icon.jsx";
import { formatDate } from "../../../shared/utils/formatDate.js";
import { getCategory } from "../utils/getCategory.js";
import LorePlaceholder from "./LorePlaceholder.jsx";

// The top of Lore Details: the entry's picture (or its emblem print) as a banner, with the category,
// the title and the byline (author, project, folder and dates) on a dark gradient over it.
// `folderName` is null when the entry isn't in a folder.
export default function LoreHeader({ entry, folderName }) {
  const category = getCategory(entry.category);
  const created = formatDate(entry.created_at);
  const updated = formatDate(entry.updated_at);

  return (
    <header className="lore-hero">
      <div className="lore-hero-picture">
        {/* alt="" because the title on the banner already names the entry */}
        <CoverImage
          src={entry.image_url}
          alt=""
          placeholder={<LorePlaceholder seed={entry.id} category={entry.category} />}
        />
      </div>
      <div className="lore-hero-shade" aria-hidden="true" />

      <div className="lore-hero-text">
        {/* A dark plate under the see-through badge, so it stays readable over any picture */}
        <span className="lore-badge-plate">
          <span className={`badge ${category.badgeClassName}`}>
            <Icon name="star" size={10} className="lore-badge-star" />
            {category.label}
          </span>
        </span>

        <h1 className="page-title lore-title">{entry.title}</h1>

        <p className="lore-byline">
          <CreatorLink userId={entry.author_id} profile={entry.author} />
          <span>
            in{" "}
            <Link to={`/projects/${entry.project_id}`} className="lore-project-link">
              {entry.project?.title ?? "its project"}
            </Link>
          </span>
        </p>

        <p className="lore-meta">
          <span>
            <Icon name="folder" size={14} />
            {folderName ?? "Unfiled"}
          </span>
          <span>
            Created <time dateTime={entry.created_at}>{created}</time>
          </span>
          {/* Changes made on the day the entry was written don't need a second date */}
          {updated !== created && (
            <span>
              Updated <time dateTime={entry.updated_at}>{updated}</time>
            </span>
          )}
        </p>
      </div>
    </header>
  );
}
