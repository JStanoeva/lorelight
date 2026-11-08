import { useState } from "react";
import { usePrefersReducedMotion } from "../../../shared/hooks/usePrefersReducedMotion.js";
import { HomeMotionContext } from "./HomeMotionContext.js";

// One "Pause animations" switch stops every moving part of the Home page (WCAG 2.2.2).
export default function HomeMotionProvider({ children }) {
  const [isMotionPaused, setIsMotionPaused] = useState(false);
  const prefersReducedMotion = usePrefersReducedMotion();

  const value = {
    isMotionPaused,
    setIsMotionPaused,
    prefersReducedMotion,
    isMotionAllowed: !isMotionPaused && !prefersReducedMotion,
  };

  return <HomeMotionContext value={value}>{children}</HomeMotionContext>;
}
