import { useHomeMotion } from "../hooks/useHomeMotion.js";

// The Home page's "Pause animations" switch (WCAG 2.2.2: endless motion needs a way to stop
// it). It pauses every Home animation, not only the hero's sky (HomeMotionProvider). A toggle
// button with a fixed name: aria-pressed tells screen readers whether it is on. On phones only
// the icon shows; the words stay for screen readers. With reduced motion nothing moves, so
// there is nothing to pause and the button isn't shown.
export default function PauseAnimationsButton() {
  const { isMotionPaused, setIsMotionPaused, prefersReducedMotion } = useHomeMotion();

  if (prefersReducedMotion) {
    return null;
  }

  return (
    <button
      type="button"
      className="motion-pause"
      aria-pressed={isMotionPaused}
      onClick={() => setIsMotionPaused(!isMotionPaused)}
    >
      <svg className="motion-pause-icon" viewBox="0 0 16 16" aria-hidden="true" focusable="false">
        <rect x="4" y="3" width="2.5" height="10" rx="1" fill="currentColor" />
        <rect x="9.5" y="3" width="2.5" height="10" rx="1" fill="currentColor" />
      </svg>
      <span className="motion-pause-label">Pause animations</span>
    </button>
  );
}
