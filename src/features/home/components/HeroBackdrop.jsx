import HeroFlares from "./HeroFlares.jsx";
import StarGlyph from "./StarGlyph.jsx";

// The hero's painted night sky: stacked CSS layers (hero.css), painted back to front in DOM
// order: sky, brush strokes, star field, bright flares, the lantern's light and its star, and
// paper grain. It is the first paint and stays underneath the animated sky (NebulaCanvas) as
// its fallback. It is purely decorative, so assistive technology skips it.
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
