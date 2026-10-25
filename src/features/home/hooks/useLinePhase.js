import { useEffect, useState } from "react";

// How much of the wheel must be on screen before its lines draw in
const DRAW_IN_SHARE = 0.75;

// The neighbour lines draw themselves in once, the first time most of the wheel is on screen.
// Returns "waiting" (not seen yet), "drawing" (the one-time draw-in plays) or "drawn".
// While the animations are paused, there is no draw-in to wait for: the lines are "drawn" as
// soon as any part of the wheel is on screen, so a still wheel never shows without them.
export function useLinePhase(elementRef, isMotionAllowed) {
  const [phase, setPhase] = useState("waiting");

  useEffect(() => {
    const element = elementRef.current;
    if (!element || phase !== "waiting") {
      return;
    }

    // A window shorter than the wheel can never show three quarters of it; then three
    // quarters of what fits is enough, so the lines always get drawn. A hidden wheel (below
    // 1024 px) is 0 px tall. In a window that is 0 px tall too (e.g. a hidden preview frame),
    // 0 / 0 would give an invalid threshold and crash the page, so it falls back to the full share.
    const largestVisibleShare =
      element.offsetHeight > 0 ? Math.min(1, window.innerHeight / element.offsetHeight) : 1;
    const drawInThreshold = DRAW_IN_SHARE * largestVisibleShare;

    // The state is set only inside the observer's callback, never directly in the effect. The
    // observer is made again when isMotionAllowed changes, so the callback always sees the
    // current value.
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!isMotionAllowed && entry.isIntersecting) {
          setPhase("drawn");
        } else if (isMotionAllowed && entry.intersectionRatio >= drawInThreshold) {
          setPhase("drawing");
        }
      },
      // While paused, the observer reports as soon as the first pixel of the wheel shows
      { threshold: isMotionAllowed ? drawInThreshold : 0 },
    );
    observer.observe(element);

    return () => observer.disconnect();
  }, [elementRef, phase, isMotionAllowed]);

  return phase;
}
