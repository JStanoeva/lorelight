import StarGlyph from "../StarGlyph.jsx";
import "../../styles/showcases.css";

// 14px status icons, created once at module level. Decorative: the chip text says the same.
const LOCK_ICON = (
  <svg
    viewBox="0 0 16 16"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    focusable="false"
    className="chip-icon"
  >
    <rect x="3" y="7" width="10" height="7" rx="1.5" />
    <path d="M5.5 7V5a2.5 2.5 0 0 1 5 0v2" />
  </svg>
);

const GLOBE_ICON = (
  <svg
    viewBox="0 0 16 16"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    focusable="false"
    className="chip-icon"
  >
    <circle cx="8" cy="8" r="6" />
    <path d="M2 8H14" />
    <path d="M8 2C5.5 4.5 5.5 11.5 8 14C10.5 11.5 10.5 4.5 8 2Z" />
  </svg>
);

// Static preview for the Share panel. Unlike the other previews, this one is real information
// (the visibility rule), so it stays readable for screen readers as an ordered list.
export default function ShareShowcase() {
  return (
    <figure className="preview-frame min-w-0">
      <figcaption className="preview-caption">Who can see an entry</figcaption>
      <ol className="mt-3 flex flex-col gap-3">
        <li className="visibility-step">
          <StarGlyph className="visibility-star" />
          <div className="min-w-0">
            <div className="flex flex-wrap gap-2">
              <span className="status-chip">{LOCK_ICON}Entry: Private</span>
              <span className="status-chip">{LOCK_ICON}Project: Private</span>
            </div>
            <p className="mt-2 text-sm text-parchment-300">Only you can see it.</p>
          </div>
        </li>

        <li className="visibility-step">
          <StarGlyph className="visibility-star" />
          <div className="min-w-0">
            <div className="flex flex-wrap gap-2">
              <span className="status-chip status-chip-public">{GLOBE_ICON}Entry: Public</span>
              <span className="status-chip">{LOCK_ICON}Project: Private</span>
            </div>
            <p className="mt-2 text-sm text-parchment-300">Still hidden: its Project is private.</p>
          </div>
        </li>

        {/* The light comes on: gold appears only as light (the star and a glow) */}
        <li className="visibility-step visibility-step-lit">
          <StarGlyph className="visibility-star visibility-star-lit" />
          <div className="min-w-0">
            <div className="flex flex-wrap gap-2">
              <span className="status-chip status-chip-public">{GLOBE_ICON}Entry: Public</span>
              <span className="status-chip status-chip-public">{GLOBE_ICON}Project: Public</span>
            </div>
            <p className="mt-2 text-sm font-semibold text-parchment-100">Shown in the Lore Catalog.</p>
          </div>
        </li>
      </ol>
    </figure>
  );
}
