import StarGlyph from "./StarGlyph.jsx";

// One category star on the wheel: a real button (its name is the label inside it). orrery.css
// places it on the ring from --angle (its place on the wheel) plus --turn (how far the wheel has
// turned), and keeps the label upright on the outside of the ring. The twinkle timing comes
// from the index alone, so it is the same on every render. While chosen, the star is described
// by the lens's description text.
export default function OrreryStar({
  ref,
  category,
  star,
  index,
  isSelected,
  isTabStop,
  lensId,
  lensDescriptionId,
  onChoose,
  onKeyDown,
  onFocus,
}) {
  const starClassName = category.starClassName ?? "text-slate-300";

  return (
    <button
      ref={ref}
      type="button"
      className={`orrery-star ${starClassName}`}
      style={{
        "--angle": `${star.angle}deg`,
        "--ring": star.radius,
        "--twinkle-delay": `${-((index * 1.7) % 5).toFixed(2)}s`,
        "--twinkle-duration": `${(3.2 + (index % 4) * 0.7).toFixed(1)}s`,
      }}
      aria-expanded={isSelected}
      aria-controls={lensId}
      aria-describedby={isSelected ? lensDescriptionId : undefined}
      tabIndex={isTabStop ? 0 : -1}
      onClick={() => onChoose(index)}
      onKeyDown={(event) => onKeyDown(event, index)}
      onFocus={() => onFocus(index)}
    >
      <span className="orrery-star-halo" aria-hidden="true" />
      <span className="orrery-star-flare" aria-hidden="true" />
      <StarGlyph className="orrery-star-glyph" />
      <span className="orrery-star-label">{category.label}</span>
    </button>
  );
}
