import { useEffect } from "react";
import { useLocation } from "react-router";

// Declarative routing doesn't reset the scroll position between pages.
// Links with a #hash (e.g. "/#about") scroll to that section instead.
export default function ScrollToTop() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (hash) {
      // Default behavior follows the CSS, so on Home this glides (unless reduced motion is on)
      document.getElementById(decodeURIComponent(hash.slice(1)))?.scrollIntoView();
      return;
    }

    // "instant": a page change never animates, even where smooth scrolling is turned on
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [pathname, hash]);

  return null;
}
