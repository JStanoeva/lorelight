import StarGlyph from "./StarGlyph.jsx";

// Hand-placed bright stars, kept away from the text column and below the header strip.
// Fixed positions (never random) keep every render identical.
const FLARES = [
  { left: "11%", top: "22%", size: "0.875rem" },
  { left: "87%", top: "18%", size: "0.75rem" },
  { left: "92%", top: "56%", size: "0.625rem" },
  { left: "7%", top: "62%", size: "0.75rem" },
  { left: "28%", top: "86%", size: "0.5rem" },
];

// The hero's painted night sky: stacked CSS layers (hero.css), painted back to front in DOM
// order: sky, brush strokes, star field, bright flares, the lantern's light and its star, and
// paper grain. It is purely decorative, so assistive technology skips it.
export default function HeroBackdrop() {
  return (
    <div className="hero-backdrop" aria-hidden="true">
      <div className="hero-sky" />
      <div className="hero-strokes" />
      <div className="starfield hero-stars" />
      <div className="starfield-twinkle hero-stars" />
      {FLARES.map((flare) => (
        <span
          key={`${flare.left}-${flare.top}`}
          className="hero-flare"
          style={{ left: flare.left, top: flare.top, width: flare.size }}
        >
          <StarGlyph />
        </span>
      ))}
      <div className="hero-light" />
      <StarGlyph className="hero-star" />
      <div className="hero-grain" />
    </div>
  );
}
