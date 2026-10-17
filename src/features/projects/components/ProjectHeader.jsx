import { Link } from "react-router";
import VisibilityBadge from "../../lore/components/VisibilityBadge.jsx";
import CoverImage from "../../../shared/components/CoverImage.jsx";
import Icon from "../../../shared/components/Icon.jsx";
import { formatDate } from "../../../shared/utils/formatDate.js";
import { formatEntryCount } from "../utils/projectContents.js";
import { getFormatLabel, getGenreLabel } from "../utils/projectLabels.js";

// The top of Project Details: banner, title, owner, dates, owner actions and the description.
export default function ProjectHeader({ project, entryCount, isOwner, onDelete }) {
  const details = [getFormatLabel(project.format), getGenreLabel(project.genre)].filter(Boolean).join(" · ");
  const ownerName = project.owner?.display_name ?? "Unknown creator";

  return (
    <>
      <div className="ws-banner">
        <CoverImage src={project.cover_url} seed={project.id} />
      </div>

      <header className="ws-head">
        <div className="ws-head-text">
          <div className="ws-kicker">
            {isOwner && <VisibilityBadge visibility={project.is_public ? "public" : "private"} />}
            {details && <span className="ws-details">{details}</span>}
          </div>

          <h1 className="page-title ws-title">{project.title}</h1>

          <div className="ws-byline">
            <Link to={`/profile/${project.owner_id}`} className="ws-owner">
              <span className="ws-owner-avatar" aria-hidden="true">
                {ownerName.charAt(0).toUpperCase()}
              </span>
              <span className="ws-owner-name">{ownerName}</span>
              {project.owner && <span className="ws-owner-handle">@{project.owner.username}</span>}
            </Link>
            <span className="ws-byline-meta">
              <span>Started {formatDate(project.created_at)}</span>
              <span>{formatEntryCount(entryCount)}</span>
            </span>
          </div>
        </div>

        {isOwner && (
          <div className="ws-actions">
            <Link to={`/projects/${project.id}/edit`} className="btn btn-ghost">
              <Icon name="pencil" />
              Edit
            </Link>
            <button type="button" className="btn btn-danger" onClick={onDelete}>
              <Icon name="trash" />
              Delete
            </button>
          </div>
        )}
      </header>

      {project.description && <p className="ws-description">{project.description}</p>}
    </>
  );
}
