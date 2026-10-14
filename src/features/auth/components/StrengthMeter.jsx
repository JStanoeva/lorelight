import { STAR_PATH } from "../../home/constants/starPath.js";
import { METER_STARS } from "../constants/strengthMeter.js";
import { PASSWORD_RULE_COUNT } from "../utils/authValidation.js";

// Five stars joined like a constellation. Star n, and the line leading to it, lights up once
// n password rules are met; with all of them met, the whole constellation turns green.
// Decorative only: the strength label and the live summary next to it carry the meaning.
export default function StrengthMeter({ strength }) {
  const isComplete = strength === PASSWORD_RULE_COUNT;

  return (
    <div
      className={isComplete ? "pw-meter-sky pw-meter-sky-complete" : "pw-meter-sky"}
      aria-hidden="true"
    >
      {/* This SVG stretches to fill the meter (preserveAspectRatio="none"), so its 0–100
          coordinates are percentages, the same numbers that place the stars below */}
      <svg
        className="pw-meter-lines"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        focusable="false"
      >
        {METER_STARS.map((star, index) => {
          // Every star after the first is joined to the one before it
          if (index === 0) {
            return null;
          }

          const previousStar = METER_STARS[index - 1];

          return (
            <line
              key={index}
              className={index < strength ? "pw-meter-line pw-meter-line-lit" : "pw-meter-line"}
              x1={previousStar.x}
              y1={previousStar.y}
              x2={star.x}
              y2={star.y}
            />
          );
        })}
      </svg>

      {/* Each star is a small SVG of its own, so stretching the lines never squashes a star.
          The viewBox adds 2 units around the logo star's 24 × 34 box, so the outline isn't cut off. */}
      {METER_STARS.map((star, index) => (
        <svg
          key={index}
          className={index < strength ? "pw-meter-star pw-meter-star-lit" : "pw-meter-star"}
          style={{ left: `${star.x}%`, top: `${star.y}%`, width: `${star.size}rem` }}
          viewBox="-2 -2 28 38"
          focusable="false"
        >
          <path className="pw-star-path" d={STAR_PATH} />
        </svg>
      ))}
    </div>
  );
}
