import { Link } from "react-router";
import VisibilityBadge from "../../lore/components/VisibilityBadge.jsx";
import CoverImage from "../../../shared/components/CoverImage.jsx";
import { getFormatLabel, getGenreLabel } from "../utils/projectLabels.js";

function formatLoreCount(count) {
  if (count === 0) return "No lore yet";
  if (count === 1) return "1 lore entry";
  return `${count} lore entries`;
}

// `showVisibility` is for the owner's own lists: visitors only ever see public projects.
export default function ProjectCard({ project, showVisibility = false }) {
  const formatLabel = getFormatLabel(project.format);
  const genreLabel = getGenreLabel(project.genre);
  const details = [formatLabel, genreLabel].filter(Boolean).join(" · ");

  return (
    <article className="card-interactive flex h-full flex-col">
      <div className="relative aspect-video overflow-hidden border-b border-night-700 bg-night-900">
        <CoverImage src={project.cover_url} seed={project.id} />
      </div>

      <div className="flex flex-1 flex-col gap-2 p-5">
        <div className="flex items-start justify-between gap-3">
          {/* min-w-0 + wrap-anywhere: a very long word wraps instead of pushing the badge off the card */}
          <h2 className="min-w-0 text-xl wrap-anywhere">
            {/* The link stretches over the whole card (see .card-link), so the card is one big target. */}
            <Link to={`/projects/${project.id}`} className="card-link">
              {project.title}
            </Link>
          </h2>
          {showVisibility && <VisibilityBadge visibility={project.is_public ? "public" : "private"} />}
        </div>

        {details && <p className="text-sm text-parchment-500">{details}</p>}

        {project.description && (
          <p className="line-clamp-3 text-sm text-parchment-300 wrap-anywhere">{project.description}</p>
        )}

        <p className="mt-auto pt-2 text-sm text-parchment-500">{formatLoreCount(project.lore_count)}</p>
      </div>
    </article>
  );
}
