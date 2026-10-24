import { HERO_FLARES } from "../constants/heroFlares.js";
import StarGlyph from "./StarGlyph.jsx";

// The hero's bright flares (.hero-flare in hero.css). HeroBackdrop paints them into the CSS sky,
// and NebulaCanvas paints them again above the canvas, so they stay crisp over the moving sky.
export default function HeroFlares() {
  return (
    <>
      {HERO_FLARES.map((flare) => (
        <span
          key={`${flare.left}-${flare.top}`}
          className="hero-flare"
          style={{ left: flare.left, top: flare.top, width: flare.size }}
        >
          <StarGlyph />
        </span>
      ))}
    </>
  );
}
