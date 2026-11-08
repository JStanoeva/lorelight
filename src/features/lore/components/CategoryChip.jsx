import StarGlyph from "../../home/components/StarGlyph.jsx";

// starClassName sets the text colour; the CSS derives the star, border and glow from currentColor.
export default function CategoryChip({ label, starClassName, count, isPressed, onClick }) {
  return (
    <button
      type="button"
      aria-pressed={isPressed}
      onClick={onClick}
      className={`catalog-chip ${starClassName}`}
    >
      <StarGlyph className="catalog-chip-star" />
      <span className="catalog-chip-label">{label}</span>
      {count !== undefined && (
        <span className="catalog-chip-count">
          {count}
          <span className="sr-only"> {count === 1 ? "entry" : "entries"}</span>
        </span>
      )}
    </button>
  );
}
