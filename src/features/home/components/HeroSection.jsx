import { Link } from "react-router";
import { HERO_EYEBROW_ID, SECTION_IDS } from "../constants/homeSections.js";
import HeroBackdrop from "./HeroBackdrop.jsx";
import HomeCtas from "./HomeCtas.jsx";
import StarGlyph from "./StarGlyph.jsx";
import "../styles/hero.css";

// The full-screen opening of the Home page. It slides under the sticky header (hero.css).
// No z-index is needed: positioned children paint in DOM order, so the painted sky comes
// first, then the readability scrim, then the text. An animated canvas can be layered between
// the painting and the scrim, and the scrim keeps the text readable on top of it.
export default function HeroSection({ isLoggedIn = false }) {
  return (
    <section
      id={SECTION_IDS.hero}
      aria-labelledby="hero-title"
      className="hero flex flex-col items-center px-4 text-center sm:px-6"
    >
      <HeroBackdrop />
      <div className="hero-scrim" aria-hidden="true" />

      <div className="relative my-auto flex w-full max-w-3xl flex-col items-center pt-10 pb-6">
        <p id={HERO_EYEBROW_ID} className="hero-eyebrow">
          <StarGlyph className="hero-eyebrow-star" />
          A worldbuilding archive
          <StarGlyph className="hero-eyebrow-star" />
        </p>
        <h1 id="hero-title" className="hero-title mt-5">
          Lorelight
        </h1>
        <p className="hero-tagline mt-5">Where your worlds come to light.</p>
        <p className="mt-4 max-w-xl text-base leading-[1.7] text-pretty text-parchment-300 sm:text-lg">
          Keep the lore of your fictional worlds in one place. Write in private, publish when
          you're ready, and explore what other creators share.
        </p>
        <div className="mt-9 flex w-full justify-center">
          <HomeCtas isLoggedIn={isLoggedIn} />
        </div>
        {!isLoggedIn && (
          <p className="mt-5 text-sm text-parchment-300">
            Just here to read?{" "}
            <Link to="/lore" className="underline">
              Browse the Lore Catalog
            </Link>
          </p>
        )}
      </div>

      <a href={`#${SECTION_IDS.about}`} className="hero-cue relative mt-8 mb-6">
        <span>See how it works</span>
        <span className="hero-cue-line" aria-hidden="true" />
      </a>
    </section>
  );
}
