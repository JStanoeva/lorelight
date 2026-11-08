import { useCallback } from "react";
import { Link } from "react-router";
import { useInView } from "../../../shared/hooks/useInView.js";
import { useIsPageVisible } from "../../../shared/hooks/useIsPageVisible.js";
import { HERO_EYEBROW_ID, SECTION_IDS } from "../constants/homeSections.js";
import { useHomeMotion } from "../hooks/useHomeMotion.js";
import { useSectionReveal } from "../hooks/useSectionReveal.js";
import HeroBackdrop from "./HeroBackdrop.jsx";
import HomeCtas from "./HomeCtas.jsx";
import KindlingTitle from "./KindlingTitle.jsx";
import NebulaCanvas from "./NebulaCanvas.jsx";
import PauseAnimationsButton from "./PauseAnimationsButton.jsx";
import StarGlyph from "./StarGlyph.jsx";
import "../styles/hero.css";

// No z-index needed: positioned children paint in DOM order (CSS sky, animated sky, scrim, text)
export default function HeroSection({ isLoggedIn = false, isAuthLoading = false }) {
  const { prefersReducedMotion, isMotionAllowed } = useHomeMotion();
  const [setHeroElement, isHeroInView] = useInView();
  const setRevealElement = useSectionReveal();
  const isPageVisible = useIsPageVisible();
  const isHeroMoving = isMotionAllowed && isHeroInView && isPageVisible;

  // Both hooks watch the same element; their setters are stable, so this ref function is too
  const setSectionElement = useCallback(
    (element) => {
      setHeroElement(element);
      setRevealElement(element);
    },
    [setHeroElement, setRevealElement],
  );

  // "invisible" keeps the space and leaves the tab order, so the wrong buttons never flash
  const ctaVisibility = isAuthLoading ? "invisible" : "";
  const isGuest = !isAuthLoading && !isLoggedIn;

  return (
    <section
      ref={setSectionElement}
      id={SECTION_IDS.hero}
      aria-labelledby="hero-title"
      data-motion={isHeroMoving ? "running" : "paused"}
      className="hero flex flex-col items-center px-4 text-center sm:px-6"
    >
      <HeroBackdrop />
      <NebulaCanvas isRunning={isHeroMoving} isStill={prefersReducedMotion} />
      <div className="hero-scrim" aria-hidden="true" />

      <div className="relative my-auto flex w-full max-w-3xl flex-col items-center pt-10 pb-6">
        {/* data-sky-guard marks the small text that the sky's embers and stars stay out of */}
        <p id={HERO_EYEBROW_ID} className="hero-eyebrow" data-sky-guard data-reveal-item>
          <StarGlyph className="hero-eyebrow-star" />
          A worldbuilding archive
          <StarGlyph className="hero-eyebrow-star" />
        </p>
        <KindlingTitle />
        <p className="hero-tagline mt-5" data-sky-guard data-reveal-item>
          Where your worlds come to light.
        </p>
        <p
          className="mt-4 max-w-xl text-base leading-[1.7] text-pretty text-parchment-300 sm:text-lg"
          data-sky-guard
          data-reveal-item
        >
          Keep the lore of your fictional worlds in one place. Write in private, publish when
          you're ready, and explore what other creators share.
        </p>
        <div className={`mt-9 flex w-full justify-center ${ctaVisibility}`} data-reveal-item>
          <HomeCtas isLoggedIn={isLoggedIn} />
        </div>
        {/* Always rendered so nothing shifts when the session arrives; only guests can see it */}
        <p
          className={`mt-5 text-sm text-parchment-300 ${isGuest ? "" : "invisible"}`}
          data-sky-guard
          data-reveal-item
        >
          Just here to read?{" "}
          <Link to="/lore" className="underline">
            Browse the Lore Catalog
          </Link>
        </p>
      </div>

      {/* Sits bottom-left; placed here so it tabs after the actions and before the scroll cue */}
      <PauseAnimationsButton />

      <a
        href={`#${SECTION_IDS.about}`}
        className="hero-cue relative mt-8 mb-6"
        data-sky-guard
        data-reveal-item
      >
        <span>See how it works</span>
        <span className="hero-cue-line" aria-hidden="true" />
      </a>
    </section>
  );
}
