import { useEffect, useState } from "react";
import { useHomeMotion } from "./useHomeMotion.js";

// The time between two parts that come into view together, so they appear one after another
const STEP_MS = 130;
// The rows of a list (data-reveal-item="row": the FAQ questions) are slim and many, so the
// next one follows sooner and the light runs down the list like a wave
const ROW_STEP_MS = 60;
// How long a part's fade-in may take after its turn (reveal.css keeps every transition within
// it). After that the part is marked "shown", so it gets its own transitions back.
const FADE_MS = 2200;

// Shows a part at once. Its change of look can also start the part's own transitions (an About
// card's border, a FAQ question's colour), so every transition inside it jumps to its end and
// nothing moves. Only transitions: the title's kindling always plays to its end (hero.css), and
// an endless animation (the orrery's twinkling stars) has no end to jump to.
function showAtOnce(part) {
  part.dataset.reveal = "shown";
  // getAnimations() brings the styles up to date first, so it sees the transitions that this
  // change has just started
  part.getAnimations({ subtree: true }).forEach((animation) => {
    if (animation instanceof CSSTransition) {
      animation.finish();
    }
  });
}

// The parts of a Home section fade in, each the first time it comes into view (the hero's as
// soon as the page opens). Returns setElement: pass it as the section's ref. The parts are the
// elements inside it marked with data-reveal-item ("row" for a list's rows, which follow each
// other faster). The fade-in only changes how they look, so this hook writes it straight onto
// them as a data-reveal attribute, like the orrery writes its angle, instead of keeping React
// state for every part:
// - no data-reveal: not seen yet, hidden (reveal.css)
// - "fading": its fade-in runs now, after --reveal-delay
// - "shown": finished
// While the animations are paused, every part not seen yet is simply shown. With reduced
// motion, reveal.css applies nothing, so every part is visible from the start.
export function useSectionReveal() {
  const { isMotionAllowed, prefersReducedMotion } = useHomeMotion();
  const [element, setElement] = useState(null);

  // prefersReducedMotion is a dependency although the effect doesn't read it: the Pause button
  // is a part, and it appears again when reduced motion is turned off, so its parts are looked
  // up again then, even while the animations stay paused
  useEffect(() => {
    if (!element) {
      return;
    }

    const waitingParts = element.querySelectorAll("[data-reveal-item]:not([data-reveal])");

    // Paused (or reduced motion): nothing waits hidden, so no content pops in while scrolling
    if (!isMotionAllowed) {
      waitingParts.forEach(showAtOnce);
      return;
    }

    // When the next part may start, so parts seen at the same moment take turns
    let nextStartTime = 0;
    const fadingParts = new Set();
    const timeoutIds = [];

    function finish(part) {
      part.dataset.reveal = "shown";
      fadingParts.delete(part);
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const now = performance.now();
        // Entries come in page order, which is the order the parts take turns in
        entries
          .filter((entry) => entry.isIntersecting)
          .forEach(({ target: part }) => {
            observer.unobserve(part);
            const delay = Math.max(0, nextStartTime - now);
            const step = part.dataset.revealItem === "row" ? ROW_STEP_MS : STEP_MS;
            nextStartTime = now + delay + step;
            part.style.setProperty("--reveal-delay", `${Math.round(delay)}ms`);
            part.dataset.reveal = "fading";
            fadingParts.add(part);
            timeoutIds.push(setTimeout(() => finish(part), delay + FADE_MS));
          });
      },
      // A part starts once it is 40 px above the bottom of the screen (the hero's scroll cue
      // and Pause pill, near the bottom, still count on the first screen)
      { rootMargin: "0px 0px -40px 0px" },
    );
    waitingParts.forEach((part) => observer.observe(part));

    // A part that receives keyboard focus is shown at once, so the focus ring never sits on a
    // part that is still hidden or waiting for its turn
    function handleFocusIn(event) {
      const part = event.target.closest("[data-reveal-item]");
      if (part && part.dataset.reveal !== "shown") {
        observer.unobserve(part);
        fadingParts.delete(part);
        showAtOnce(part);
      }
    }
    element.addEventListener("focusin", handleFocusIn);

    // Runs when the page closes and when the visitor pauses or resumes the animations (the
    // effect then starts again with the new setting): a fade-in that is still running jumps to
    // its end, so nothing stays half visible
    return () => {
      element.removeEventListener("focusin", handleFocusIn);
      observer.disconnect();
      timeoutIds.forEach((timeoutId) => clearTimeout(timeoutId));
      fadingParts.forEach(showAtOnce);
    };
  }, [element, isMotionAllowed, prefersReducedMotion]);

  return setElement;
}
