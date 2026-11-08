import HeroFlares from "./HeroFlares.jsx";
import StarGlyph from "./StarGlyph.jsx";

// CSS layers (hero.css) painted back to front in DOM order. It is the first paint and stays
// under the animated sky (NebulaCanvas) as its fallback.
export default function HeroBackdrop() {
  return (
    <div className="hero-backdrop" aria-hidden="true">
      <div className="hero-sky" />
      <div className="hero-strokes" />
      <div className="starfield hero-stars" />
      <div className="starfield-twinkle hero-stars" />
      <HeroFlares />
      <div className="hero-light" />
      <StarGlyph className="hero-star" />
      <div className="hero-grain" />
    </div>
  );
}
