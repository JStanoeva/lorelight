import { useContext } from "react";
import { HomeMotionContext } from "../context/HomeMotionContext.js";

// Returns { isMotionPaused, setIsMotionPaused, prefersReducedMotion, isMotionAllowed }.
export function useHomeMotion() {
  const context = useContext(HomeMotionContext);

  if (context === null) {
    throw new Error("useHomeMotion must be used inside HomeMotionProvider.");
  }

  return context;
}
