import { Link } from "react-router";
import { getCategoryDetails } from "../utils/getCategoryDetails.js";

// The round reading lens in the middle of the wheel: the chosen category's name, what belongs
// there, examples and the link to its lore. Every star button points at it with aria-controls
// and says whether it is open with aria-expanded; the chosen star is also described by the
// lens's description (descriptionId), so a screen reader reads it out on that star.
// The content has the category as its key, so it re-mounts (and fades in again) when another
// star is chosen.
// While isClosing, the lens still shows the last category and fades out (inert, so its link
// can't be reached any more); CategoryOrrery empties it once the fade has had its time.
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
