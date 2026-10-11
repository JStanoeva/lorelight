import { useEffect } from "react";
import { useLocation } from "react-router";

// Declarative routing doesn't reset the scroll position between pages.
// Links with a #hash (e.g. "/#about") scroll to that section instead.
export default function ScrollToTop() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (hash) {
      document.getElementById(decodeURIComponent(hash.slice(1)))?.scrollIntoView();
      return;
    }

    window.scrollTo(0, 0);
  }, [pathname, hash]);

  return null;
}
