import { Link } from "react-router";
import { getCategoryDetails } from "../utils/getCategoryDetails.js";

// Keyed by category, so the content re-mounts (and fades in again) for another star. While
// isClosing it fades out, inert so its link can't be reached; CategoryOrrery then empties it.
export default function OrreryLens({ id, descriptionId, category, isClosing }) {
  if (!category) {
    return <div id={id} className="orrery-lens" role="region" aria-label="Category" hidden />;
  }

  const details = getCategoryDetails(category.value);
  const titleId = `${id}-title`;

  return (
    <div
      id={id}
      className={`orrery-lens ${category.starClassName ?? "text-slate-300"}`}
      role="region"
      aria-labelledby={titleId}
      data-closing={isClosing ? "true" : undefined}
      inert={isClosing}
    >
      <div key={category.value} className="orrery-lens-content">
        <h3 id={titleId} className="orrery-lens-title">
          {category.label}
        </h3>
        <p id={descriptionId} className="orrery-lens-description">
          {details.description}
        </p>
        {details.examples.length > 0 && (
          <p className="orrery-lens-examples">
            <span className="font-semibold">For example:</span> {details.examples.join(", ")}
          </p>
        )}
        <Link to={`/lore?category=${category.value}`} className="orrery-lens-link">
          Browse {category.label} lore
          <span aria-hidden="true">→</span>
        </Link>
      </div>
    </div>
  );
}
