import StarGlyph from "../../home/components/StarGlyph.jsx";

// One category toggle: a star in the category's colour plus its name. `starClassName` sets the
// button's text colour, which the CSS turns into the star, the border, the tint and the glow
// of the pressed chip (currentColor).
export default function CategoryChip({ label, starClassName, isPressed, onClick }) {
  return (
    <button
      type="button"
      aria-pressed={isPressed}
      onClick={onClick}
      className={`catalog-chip ${starClassName}`}
    >
      <StarGlyph className="catalog-chip-star" />
      <span className="catalog-chip-label">{label}</span>
    </button>
  );
}
