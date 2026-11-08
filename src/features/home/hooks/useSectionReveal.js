import { useEffect, useState } from "react";
import { useHomeMotion } from "./useHomeMotion.js";

// Gap between parts that come into view together
const STEP_MS = 130;
// List rows (data-reveal-item="row") follow sooner, so the light runs down the list like a wave
const ROW_STEP_MS = 60;
// Longest fade-in (reveal.css keeps every transition within it); then the part is "shown"
const FADE_MS = 2200;

// Revealing a part can start its own transitions, so they jump to their end. Animations are left
// alone: the title's kindling always plays out, and endless ones have no end.
function showAtOnce(part) {
  part.dataset.reveal = "shown";
  // getAnimations() flushes styles first, so it sees the transitions this change just started
  part.getAnimations({ subtree: true }).forEach((animation) => {
    if (animation instanceof CSSTransition) {
      animation.finish();
    }
  });
}

// Fades in each [data-reveal-item] the first time it shows, writing data-reveal on the DOM
// (no React state): unset = hidden, "fading" after --reveal-delay, then "shown".
export function useSectionReveal() {
  const { isMotionAllowed, prefersReducedMotion } = useHomeMotion();
  const [element, setElement] = useState(null);

  // prefersReducedMotion is unread but a dependency: the Pause button (a part) reappears when
  // reduced motion turns off, so the parts must be looked up again.
  useEffect(() => {
    if (!element) {
      return;
    }

    const waitingParts = element.querySelectorAll("[data-reveal-item]:not([data-reveal])");

    // Motion off: nothing waits hidden, so no content pops in while scrolling
    if (!isMotionAllowed) {
      waitingParts.forEach(showAtOnce);
      return;
    }

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
      // Small enough that the hero's scroll cue and Pause pill still reveal on the first screen
      { rootMargin: "0px 0px -40px 0px" },
    );
    waitingParts.forEach((part) => observer.observe(part));

    // A focused part shows at once, so the focus ring never sits on a hidden part
    function handleFocusIn(event) {
      const part = event.target.closest("[data-reveal-item]");
      if (part && part.dataset.reveal !== "shown") {
        observer.unobserve(part);
        fadingParts.delete(part);
        showAtOnce(part);
      }
    }
    element.addEventListener("focusin", handleFocusIn);

    // Also runs on pause or resume: running fade-ins jump to their end, never half visible
    return () => {
      element.removeEventListener("focusin", handleFocusIn);
      observer.disconnect();
      timeoutIds.forEach((timeoutId) => clearTimeout(timeoutId));
      fadingParts.forEach(showAtOnce);
    };
  }, [element, isMotionAllowed, prefersReducedMotion]);

  return setElement;
}
