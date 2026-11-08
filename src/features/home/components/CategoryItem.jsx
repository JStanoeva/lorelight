import { Link } from "react-router";
import { getCategoryDetails } from "../utils/getCategoryDetails.js";
import StarGlyph from "./StarGlyph.jsx";

// The link is stretched over the whole item in CSS, so the entire item is clickable.
export default function CategoryItem({ category }) {
  const details = getCategoryDetails(category.value);
  const starClassName = category.starClassName ?? "text-slate-300";

  return (
    <li className="category-item">
      <h3 className="flex items-center gap-3 text-parchment-100">
        <StarGlyph className={`category-star ${starClassName}`} />
        {category.label}
      </h3>
      <p className="mt-2 leading-[1.7] text-parchment-300">{details.description}</p>
      {details.examples.length > 0 && (
        <p className="mt-2 text-sm text-parchment-500">
          <span className="font-semibold">For example:</span> {details.examples.join(", ")}
        </p>
      )}
      <Link to={`/lore?category=${category.value}`} className="category-link mt-4">
        Browse {category.label} lore
        <span aria-hidden="true">→</span>
      </Link>
    </li>
  );
}
