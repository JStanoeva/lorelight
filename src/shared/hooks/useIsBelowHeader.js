import { useEffect, useState } from "react";

// True while the element with this id is fully visible below the sticky header.
// The state is set only inside the observer's callback, never directly in the effect.
export function useIsBelowHeader(elementId, isEnabled) {
  const [isBelowHeader, setIsBelowHeader] = useState(true);

  useEffect(() => {
    if (!isEnabled) {
      return;
    }

    const element = document.getElementById(elementId);
    if (!element) {
      return;
    }

    // rootMargin accepts only px or %, so the header height (4rem, as --header-height in
    // index.css) is converted here. That keeps it right when the default font size is larger.
    const remPx = parseFloat(getComputedStyle(document.documentElement).fontSize);
    const observer = new IntersectionObserver(
      // 0.99 rather than 1 allows for sub-pixel rounding
      ([entry]) => setIsBelowHeader(entry.intersectionRatio >= 0.99),
      { rootMargin: `-${remPx * 4}px 0px 0px 0px`, threshold: 0.99 },
    );
    observer.observe(element);

    return () => observer.disconnect();
  }, [elementId, isEnabled]);

  return isBelowHeader;
}
