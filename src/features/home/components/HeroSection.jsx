import { Link } from "react-router";
import { useInView } from "../../../shared/hooks/useInView.js";
import { useIsPageVisible } from "../../../shared/hooks/useIsPageVisible.js";
import { HERO_EYEBROW_ID, SECTION_IDS } from "../constants/homeSections.js";
import { useHomeMotion } from "../hooks/useHomeMotion.js";
import HeroBackdrop from "./HeroBackdrop.jsx";
import HomeCtas from "./HomeCtas.jsx";
import KindlingTitle from "./KindlingTitle.jsx";
import NebulaCanvas from "./NebulaCanvas.jsx";
import PauseAnimationsButton from "./PauseAnimationsButton.jsx";
import StarGlyph from "./StarGlyph.jsx";
import "../styles/hero.css";

// The full-screen opening of the Home page. It slides under the sticky header (hero.css).
// No z-index is needed: positioned children paint in DOM order, so the CSS painting comes
// first (the first paint and the fallback), then the animated sky, then the readability scrim,
// then the text. Everything that moves endlessly (the sky and the CSS twinkling) only runs
// while motion is allowed, the hero is on screen and the tab is visible.
export default function HeroSection({ isLoggedIn = false, isAuthLoading = false }) {
  const { prefersReducedMotion, isMotionAllowed } = useHomeMotion();
  const [setHeroElement, isHeroInView] = useInView();
  const isPageVisible = useIsPageVisible();
  const isHeroMoving = isMotionAllowed && isHeroInView && isPageVisible;

  // Until the session is known, the actions keep their space but stay hidden ("invisible" also
  // takes them out of the tab order), so nobody sees the wrong buttons flash
  const ctaVisibility = isAuthLoading ? "invisible" : "";
  const isGuest = !isAuthLoading && !isLoggedIn;

  return (
    <section
      ref={setHeroElement}
      id={SECTION_IDS.hero}
      aria-labelledby="hero-title"
      // One condition for the sky and the CSS motion: when the hero stops (paused, off screen,
      // hidden tab), its CSS animations freeze where they are too (home.css)
      data-motion={isHeroMoving ? "running" : "paused"}
      className="hero flex flex-col items-center px-4 text-center sm:px-6"
    >
      <HeroBackdrop />
      <NebulaCanvas isRunning={isHeroMoving} isStill={prefersReducedMotion} />
      <div className="hero-scrim" aria-hidden="true" />

      <div className="relative my-auto flex w-full max-w-3xl flex-col items-center pt-10 pb-6">
        {/* data-sky-guard marks the small text that the sky's embers and stars stay out of */}
        <p id={HERO_EYEBROW_ID} className="hero-eyebrow" data-sky-guard>
          <StarGlyph className="hero-eyebrow-star" />
          A worldbuilding archive
          <StarGlyph className="hero-eyebrow-star" />
        </p>
        <KindlingTitle />
        <p className="hero-tagline mt-5" data-sky-guard>
          Where your worlds come to light.
        </p>
        <p
          className="mt-4 max-w-xl text-base leading-[1.7] text-pretty text-parchment-300 sm:text-lg"
          data-sky-guard
        >
          Keep the lore of your fictional worlds in one place. Write in private, publish when
          you're ready, and explore what other creators share.
        </p>
        <div className={`mt-9 flex w-full justify-center ${ctaVisibility}`}>
          <HomeCtas isLoggedIn={isLoggedIn} />
        </div>
        {/* Always rendered, so the hero never shifts when the session arrives,
            but only guests can see it */}
        <p className={`mt-5 text-sm text-parchment-300 ${isGuest ? "" : "invisible"}`} data-sky-guard>
          Just here to read?{" "}
          <Link to="/lore" className="underline">
            Browse the Lore Catalog
          </Link>
        </p>
      </div>

      {/* Placed in the bottom-left corner; in the tab order it comes after the hero's actions
          and before the scroll cue beside it */}
      <PauseAnimationsButton />

      <a href={`#${SECTION_IDS.about}`} className="hero-cue relative mt-8 mb-6" data-sky-guard>
        <span>See how it works</span>
        <span className="hero-cue-line" aria-hidden="true" />
      </a>
    </section>
  );
}
