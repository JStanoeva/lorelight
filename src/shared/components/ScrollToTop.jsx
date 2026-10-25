import { useEffect } from "react";
import { useLocation } from "react-router";

// The ways a user scrolls on their own: the mouse wheel, a touch or mouse press, the keyboard
const USER_SCROLL_EVENTS = ["wheel", "pointerdown", "keydown"];

// Declarative routing doesn't reset the scroll position between pages.
// Links with a #hash (e.g. "/#about") scroll to that section instead.
export default function ScrollToTop() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (!hash) {
      // "instant": a page change never animates, even where smooth scrolling is turned on
      window.scrollTo({ top: 0, left: 0, behavior: "instant" });
      return;
    }

    // Section ids are plain words, so the hash is used as it is. Decoding it would throw
    // on a broken link such as "/lore#%" and crash the whole app.
    // Default behavior follows the CSS, so on Home this glides (unless reduced motion is on)
    function scrollToSection() {
      document.getElementById(hash.slice(1))?.scrollIntoView();
    }

    scrollToSection();

    // On a first visit the web fonts can still be loading. When they arrive, the text above the
    // section can grow and push it down, so it is scrolled to once more, unless the user has
    // started scrolling on their own by then.
    if (document.fonts.status === "loaded") {
      return;
    }

    let shouldScrollAgain = true;

    function cancelScrollAgain() {
      shouldScrollAgain = false;
    }

    USER_SCROLL_EVENTS.forEach((type) => window.addEventListener(type, cancelScrollAgain));
    document.fonts.ready.then(() => {
      if (shouldScrollAgain) {
        scrollToSection();
      }
    });

    // Cleanup (another page or #hash, or unmount): this section is never scrolled to again later
    return () => {
      cancelScrollAgain();
      USER_SCROLL_EVENTS.forEach((type) => window.removeEventListener(type, cancelScrollAgain));
    };
  }, [pathname, hash]);

  return null;
}
