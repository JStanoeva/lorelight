import { LORE_CATEGORIES } from "../../../lore/constants/categories.js";
import { STAR_PATH } from "../../constants/starPath.js";
import "../../styles/showcases.css";

const CREATURE = LORE_CATEGORIES.find((category) => category.value === "creature");
const LOCATION = LORE_CATEGORIES.find((category) => category.value === "location");

// Static preview for the Explore panel: a catalog search, two results (one matched by its tag,
// one by its title) and the Constellation that just gained a save. The mock is hidden from
// screen readers; the visible caption says what it shows.
export default function ExploreShowcase() {
  return (
    <figure className="min-w-0">
      <div className="preview-frame" aria-hidden="true">
        <span className="preview-tag">Example</span>

        <div className="mock-search mt-3">
          <svg
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            focusable="false"
            className="mock-search-icon"
          >
            <circle cx="7" cy="7" r="4.5" />
            <path d="M10.5 10.5L14 14" />
          </svg>
          dragon
        </div>
        <div className="mt-2 flex flex-wrap gap-2">
          <span className="mock-pill">All categories</span>
          <span className="mock-pill">Newest</span>
        </div>

        <div className="mt-4 flex flex-col gap-3">
          <div className="mock-card">
            <div className="flex flex-wrap items-center gap-2">
              <span className="mock-result-title">The Ashen Wyrm of Kessa</span>
              <span className={`badge ${CREATURE.badgeClassName}`}>{CREATURE.label}</span>
            </div>
            <p className="mt-1 text-sm text-parchment-300">
              Sleeps beneath the old mines and wakes when the forges go cold.
            </p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              <span className="tag-chip">dragon</span>
              <span className="tag-chip">kessa</span>
            </div>
            <p className="mt-2 text-xs text-parchment-300">24 appreciations</p>
          </div>

          <div className="mock-card">
            <div className="flex flex-wrap items-center gap-2">
              <span className="mock-result-title">The Dragon Roads of Veyr</span>
              <span className={`badge ${LOCATION.badgeClassName}`}>{LOCATION.label}</span>
            </div>
            <p className="mt-1 text-sm text-parchment-300">Trade routes carved by migrating dragons.</p>
            <p className="mt-2 text-xs text-parchment-300">17 appreciations</p>
          </div>
        </div>

        <div className="mt-4">
          <span className="mock-label">Your Constellation · 1 new save</span>
          {/* Four saved entries joined by lines, and a gold star for the new save */}
          <svg viewBox="0 0 200 40" fill="none" focusable="false" className="constellation-strip mt-2">
            <path d="M16 26L58 12L100 24L142 10L182 24" className="constellation-line" />
            <circle cx="16" cy="26" r="2.5" className="constellation-dot" />
            <circle cx="58" cy="12" r="2.5" className="constellation-dot" />
            <circle cx="100" cy="24" r="2.5" className="constellation-dot" />
            <circle cx="142" cy="10" r="2.5" className="constellation-dot" />
            <path d={STAR_PATH} transform="translate(176 14) scale(0.5)" className="constellation-new-star" />
          </svg>
        </div>
      </div>
      <figcaption className="mt-3 text-sm text-parchment-500">
        Illustration with sample content: a catalog search and a saved entry.
      </figcaption>
    </figure>
  );
}
