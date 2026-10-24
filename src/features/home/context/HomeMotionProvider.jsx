import { useState } from "react";
import { usePrefersReducedMotion } from "../../../shared/hooks/usePrefersReducedMotion.js";
import { HomeMotionContext } from "./HomeMotionContext.js";

// One "Pause animations" switch for the whole Home page: the hero sky, the About previews and
// the category orrery all read it, so a single press stops every moving part (WCAG 2.2.2).
// The system's reduced-motion setting is read here once and shared the same way.
export default function HomeMotionProvider({ children }) {
  const [isMotionPaused, setIsMotionPaused] = useState(false);
  const prefersReducedMotion = usePrefersReducedMotion();

  const value = {
    isMotionPaused,
    setIsMotionPaused,
    prefersReducedMotion,
    // Endless motion runs only while this is true (and while it is on screen and the tab is
    // visible: useInView, useIsPageVisible)
    isMotionAllowed: !isMotionPaused && !prefersReducedMotion,
  };

  return <HomeMotionContext value={value}>{children}</HomeMotionContext>;
}
