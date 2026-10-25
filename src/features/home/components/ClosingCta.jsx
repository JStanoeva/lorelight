import { SECTION_IDS } from "../constants/homeSections.js";
import { useSectionReveal } from "../hooks/useSectionReveal.js";
import ClosingLantern from "./ClosingLantern.jsx";
import HomeCtas from "./HomeCtas.jsx";

// The last call to action before the footer, with the same CTA pair as the hero. It fades in
// the first time it comes into view: the lantern (drawn and lit), then the heading, the text
// and the buttons.
export default function ClosingCta({ isLoggedIn = false, isAuthLoading = false }) {
  const setSectionElement = useSectionReveal();

  return (
    <section
      ref={setSectionElement}
      id={SECTION_IDS.closing}
      aria-labelledby="closing-title"
      className="closing"
    >
      <div className="starfield closing-stars" aria-hidden="true" />

      <div className="closing-content">
        {/* Decorative: the heading below carries the meaning, so screen readers skip the
            lantern. As a part of the fade-in, this wrapper also plays the lantern's intro. */}
        <div className="closing-lantern" aria-hidden="true" data-reveal-item>
          <ClosingLantern />
        </div>

        {/* relative: positioned elements paint in DOM order, so the text paints above the
            lantern's halo instead of under it */}
        <div className="relative mt-8">
          <h2 id="closing-title" className="section-title" data-reveal-item>
            Every world begins with a single light.
          </h2>
          <p className="closing-text mt-4" data-reveal-item>
            Start with one character, one place or one forgotten war, and share it when you're ready.
          </p>

          {/* Until the session is known, the buttons keep their space but stay hidden */}
          <div className={`mt-10 ${isAuthLoading ? "invisible" : ""}`} data-reveal-item>
            <HomeCtas isLoggedIn={isLoggedIn} />
          </div>
        </div>
      </div>
    </section>
  );
}
