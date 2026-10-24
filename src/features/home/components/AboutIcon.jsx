import { STAR_PATH } from "../constants/starPath.js";
import { useHomeMotion } from "../hooks/useHomeMotion.js";

// The drawn shapes of each icon. Stroked shapes carry pathLength="1" and the about-icon-line
// class, so CSS can trace them in with stroke-dashoffset (CSS selects them by the class, because
// a selector for the camel-case pathLength attribute is unreliable); --i sets the order in which
// the strokes are drawn. The stars are filled, never stroked: they light up once their lines are
// drawn.
function getShapes(name) {
  switch (name) {
    case "create":
      // A quill with a star at its tip
      return (
        <>
          <path pathLength="1" className="about-icon-line" style={{ "--i": 0 }} d="M37 6C26 8 17 17 14 30L12 40" />
          <path pathLength="1" className="about-icon-line" style={{ "--i": 1 }} d="M37 6C35 17 28 26 15 31" />
          <path
            d={STAR_PATH}
            transform="translate(32.4 30) scale(0.3)"
            fill="currentColor"
            stroke="none"
            className="about-icon-star"
          />
        </>
      );
    case "share":
      // A lantern with a star inside
      return (
        <>
          <circle pathLength="1" className="about-icon-line" style={{ "--i": 0 }} cx="24" cy="6.5" r="2.5" />
          <path pathLength="1" className="about-icon-line" style={{ "--i": 1 }} d="M15 17L24 10L33 17Z" />
          <path pathLength="1" className="about-icon-line" style={{ "--i": 2 }} d="M16 17H32L30.5 37H17.5Z" />
          <path pathLength="1" className="about-icon-line" style={{ "--i": 3 }} d="M15.5 37H32.5V40H15.5Z" />
          <path
            d={STAR_PATH}
            transform="translate(20.4 21) scale(0.3)"
            fill="currentColor"
            stroke="none"
            className="about-icon-star"
          />
        </>
      );
    case "explore":
      // A small constellation (a star in place of its top point) and a magnifying lens
      return (
        <>
          <path pathLength="1" className="about-icon-line" style={{ "--i": 0 }} d="M7 15L16 9L23 16L15 22" />
          <circle cx="7" cy="15" r="1.75" fill="currentColor" stroke="none" className="about-icon-star" />
          <circle cx="23" cy="16" r="1.75" fill="currentColor" stroke="none" className="about-icon-star" />
          <circle cx="15" cy="22" r="1.75" fill="currentColor" stroke="none" className="about-icon-star" />
          <path
            d={STAR_PATH}
            transform="translate(12.4 3) scale(0.3)"
            fill="currentColor"
            stroke="none"
            className="about-icon-star"
          />
          <circle pathLength="1" className="about-icon-line" style={{ "--i": 1 }} cx="31" cy="31" r="8" />
          <path pathLength="1" className="about-icon-line" style={{ "--i": 2 }} d="M37 37L43 43" />
        </>
      );
    default:
      return null;
  }
}

// Line icon for an About card: name is "create", "share" or "explore". Decorative, because the
// card's title already says what it is. data-motion lets "Pause animations" freeze its tracing
// (the shared rule in home.css); it sits on the icon rather than on the whole grid, so the
// panels' short opening animation is never held.
export default function AboutIcon({ name }) {
  const { isMotionPaused } = useHomeMotion();

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
      className="about-icon size-8"
      data-motion={isMotionPaused ? "paused" : "running"}
    >
      {getShapes(name)}
    </svg>
  );
}
