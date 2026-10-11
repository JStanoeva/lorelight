import { STAR_PATH } from "../constants/starPath.js";

// The logo's star. Always decorative; it takes its colour from the CSS `color` (currentColor)
// and its size from `className`.
export default function StarGlyph({ className }) {
  return (
    <svg viewBox="0 0 24 34" aria-hidden="true" focusable="false" className={className}>
      <path fill="currentColor" d={STAR_PATH} />
    </svg>
  );
}
