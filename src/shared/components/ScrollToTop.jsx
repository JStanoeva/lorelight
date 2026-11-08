import { useEffect } from "react";
import { useLocation } from "react-router";

const USER_SCROLL_EVENTS = ["wheel", "pointerdown", "keydown"];

// Declarative routing doesn't reset the scroll position between pages.
export default function ScrollToTop() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (!hash) {
      // "instant": a page change never animates, even where CSS turns on smooth scrolling
      window.scrollTo({ top: 0, left: 0, behavior: "instant" });
      return;
    }

    // Section ids are plain words, so the hash isn't decoded: that would throw on a broken
    // link such as "/lore#%" and crash the whole app.
    function scrollToSection() {
      document.getElementById(hash.slice(1))?.scrollIntoView();
    }

    scrollToSection();

    // Web fonts arriving late can push the section down, so scroll to it once more when they
    // load, unless the user has started scrolling by then.
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

    // After a move to another page or #hash, the old section is never scrolled to later
    return () => {
      cancelScrollAgain();
      USER_SCROLL_EVENTS.forEach((type) => window.removeEventListener(type, cancelScrollAgain));
    };
  }, [pathname, hash]);

  return null;
}
