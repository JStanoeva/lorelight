import { Link } from "react-router";
import VisibilityBadge from "../../lore/components/VisibilityBadge.jsx";
import CoverImage from "../../../shared/components/CoverImage.jsx";
import CreatorLink from "../../../shared/components/CreatorLink.jsx";
import Icon from "../../../shared/components/Icon.jsx";
import { formatDate } from "../../../shared/utils/formatDate.js";
import { formatEntryCount } from "../utils/projectContents.js";
import { getFormatLabel, getGenreLabel } from "../utils/projectLabels.js";

// The top of Project Details: banner, title, owner, dates, owner actions and the description.
// `headingRef` goes to the title (h1), where focus lands after Try again.
export default function ProjectHeader({ headingRef, project, entryCount, isOwner, onDelete }) {
  const details = [getFormatLabel(project.format), getGenreLabel(project.genre)].filter(Boolean).join(" · ");

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

          {/* tabIndex -1: it can take focus from code (after Try again), but isn't a Tab stop */}
          <h1 ref={headingRef} tabIndex={-1} className="page-title ws-title">
            {project.title}
          </h1>

          <div className="ws-byline">
            <CreatorLink userId={project.owner_id} profile={project.owner} />
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
