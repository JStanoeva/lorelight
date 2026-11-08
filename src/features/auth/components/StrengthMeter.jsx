import { STAR_PATH } from "../../home/constants/starPath.js";
import { METER_STARS } from "../constants/strengthMeter.js";
import { PASSWORD_RULE_COUNT } from "../utils/authValidation.js";

export default function StrengthMeter({ strength }) {
  const isComplete = strength === PASSWORD_RULE_COUNT;

  return (
    <div
      className={isComplete ? "pw-meter-sky pw-meter-sky-complete" : "pw-meter-sky"}
      aria-hidden="true"
    >
      {/* Stretched to fill the meter, so its 0–100 coordinates match the stars' percentages */}
      <svg
        className="pw-meter-lines"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        focusable="false"
      >
        {METER_STARS.map((star, index) => {
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

      {/* One SVG per star, so the stretched lines never squash it. The viewBox pads the
          24 × 34 star by 2 units, so its outline isn't cut off. */}
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
