import StarGlyph from "../../home/components/StarGlyph.jsx";

// One category toggle: a star in the category's colour plus its name. `starClassName` sets the
// button's text colour, which the CSS turns into the star, the border, the tint and the glow
// of the pressed chip (currentColor). `count` (optional) adds how many entries it holds
// ("Character 3"); the Lore Catalog leaves it out.
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
