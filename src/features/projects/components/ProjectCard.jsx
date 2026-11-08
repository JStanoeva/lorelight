import { Link } from "react-router";
import VisibilityBadge from "../../lore/components/VisibilityBadge.jsx";
import CoverImage from "../../../shared/components/CoverImage.jsx";
import { getFormatLabel, getGenreLabel } from "../utils/projectLabels.js";

function formatLoreCount(count) {
  if (count === 0) return "No lore yet";
  if (count === 1) return "1 lore entry";
  return `${count} lore entries`;
}

export default function ProjectCard({ project, showVisibility = false, headingLevel = 2 }) {
  const Title = headingLevel === 3 ? "h3" : "h2";
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
          {/* min-w-0 + wrap-anywhere: a long word wraps instead of pushing the badge off */}
          <Title className="min-w-0 text-xl wrap-anywhere">
            {/* .card-link stretches the link over the whole card */}
            <Link to={`/projects/${project.id}`} className="card-link">
              {project.title}
            </Link>
          </Title>
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
