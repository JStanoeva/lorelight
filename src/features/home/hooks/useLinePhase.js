import { useEffect, useState } from "react";

// Share of the wheel that must be on screen before its lines draw in
const DRAW_IN_SHARE = 0.75;

// Returns "waiting", "drawing" (plays once) or "drawn". While paused, the lines count as drawn
// as soon as any part of the wheel is on screen.
export function useLinePhase(elementRef, isMotionAllowed) {
  const [phase, setPhase] = useState("waiting");

  useEffect(() => {
    const element = elementRef.current;
    if (!element || phase !== "waiting") {
      return;
    }

    // A window shorter than the wheel can't show 75% of it, so the share shrinks to what fits.
    // The guard avoids 0 / 0 (a hidden wheel in a 0 px window), an invalid threshold that throws.
    const largestVisibleShare =
      element.offsetHeight > 0 ? Math.min(1, window.innerHeight / element.offsetHeight) : 1;
    const drawInThreshold = DRAW_IN_SHARE * largestVisibleShare;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!isMotionAllowed && entry.isIntersecting) {
          setPhase("drawn");
        } else if (isMotionAllowed && entry.intersectionRatio >= drawInThreshold) {
          setPhase("drawing");
        }
      },
      { threshold: isMotionAllowed ? drawInThreshold : 0 },
    );
    observer.observe(element);

    return () => observer.disconnect();
  }, [elementRef, phase, isMotionAllowed]);

  return phase;
}
