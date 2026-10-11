import { LORE_CATEGORIES } from "../../../lore/constants/categories.js";
import "../../styles/showcases.css";

const CHARACTER = LORE_CATEGORIES.find((category) => category.value === "character");

// Static preview for the Create panel: a sample Project with one Lore Entry hanging from it.
// The mock is hidden from screen readers; the visible caption says what it shows.
export default function CreateShowcase() {
  return (
    <figure className="min-w-0">
      <div className="preview-frame" aria-hidden="true">
        <span className="preview-tag">Example</span>

        <div className="mock-card mt-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="mock-label">Project</span>
            <span className="status-chip">Private</span>
          </div>
          <p className="mock-project-title mt-2">The Ember Isles</p>
          <p className="mt-1 text-sm text-parchment-300">
            A chain of volcanic islands where the sea glows at night.
          </p>
        </div>

        {/* The thread that ties the entry to its Project */}
        <svg viewBox="0 0 48 32" fill="none" focusable="false" className="thread">
          <path
            d="M6 3C6 18 30 14 30 29"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeOpacity="0.5"
            strokeLinecap="round"
          />
          <circle cx="6" cy="3" r="2.5" fill="currentColor" />
          <circle cx="30" cy="29" r="2.5" fill="currentColor" />
        </svg>

        <div className="mock-card ml-6">
          <div className="flex flex-wrap items-center gap-2">
            <span className={`badge ${CHARACTER.badgeClassName}`}>{CHARACTER.label}</span>
            <span className="status-chip">Private</span>
          </div>
          <p className="mock-entry-title mt-2">Captain Ilsa Varn</p>
          <p className="mt-1 text-sm text-parchment-300">
            A harbor-born navigator who charts the reefs that move with the tides.
          </p>
          <div className="mt-3 flex flex-wrap gap-1.5">
            <span className="tag-chip">navigator</span>
            <span className="tag-chip">ember isles</span>
            <span className="tag-chip">rebellion</span>
          </div>
        </div>
      </div>
      <figcaption className="mt-3 text-sm text-parchment-500">
        Illustration with sample content: a Project with one Lore Entry inside it.
      </figcaption>
    </figure>
  );
}
