import { STAR_PATH } from "../constants/starPath.js";

// The drawn shapes of each icon. Stroked shapes carry pathLength="1" so they can later be traced
// in with stroke-dashoffset; the stars are filled and never stroked.
function getShapes(name) {
  switch (name) {
    case "create":
      // A quill with a star at its tip
      return (
        <>
          <path pathLength="1" d="M37 6C26 8 17 17 14 30L12 40" />
          <path pathLength="1" d="M37 6C35 17 28 26 15 31" />
          <path d={STAR_PATH} transform="translate(32.4 30) scale(0.3)" fill="currentColor" stroke="none" />
        </>
      );
    case "share":
      // A lantern with a star inside
      return (
        <>
          <circle pathLength="1" cx="24" cy="6.5" r="2.5" />
          <path pathLength="1" d="M15 17L24 10L33 17Z" />
          <path pathLength="1" d="M16 17H32L30.5 37H17.5Z" />
          <path pathLength="1" d="M15.5 37H32.5V40H15.5Z" />
          <path d={STAR_PATH} transform="translate(20.4 21) scale(0.3)" fill="currentColor" stroke="none" />
        </>
      );
    case "explore":
      // A small constellation (a star in place of its top point) and a magnifying lens
      return (
        <>
          <path pathLength="1" d="M7 15L16 9L23 16L15 22" />
          <circle cx="7" cy="15" r="1.75" fill="currentColor" stroke="none" />
          <circle cx="23" cy="16" r="1.75" fill="currentColor" stroke="none" />
          <circle cx="15" cy="22" r="1.75" fill="currentColor" stroke="none" />
          <path d={STAR_PATH} transform="translate(12.4 3) scale(0.3)" fill="currentColor" stroke="none" />
          <circle pathLength="1" cx="31" cy="31" r="8" />
          <path pathLength="1" d="M37 37L43 43" />
        </>
      );
    default:
      return null;
  }
}

// Line icon for an About card: name is "create", "share" or "explore". Decorative, because the
// card's title already says what it is.
export default function AboutIcon({ name }) {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      className="size-8"
    >
      {getShapes(name)}
    </svg>
  );
}
