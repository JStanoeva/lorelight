import { STAR_PATH } from "../constants/starPath.js";

export default function StarGlyph({ className }) {
  return (
    <svg viewBox="0 0 24 34" aria-hidden="true" focusable="false" className={className}>
      <path fill="currentColor" d={STAR_PATH} />
    </svg>
  );
}
