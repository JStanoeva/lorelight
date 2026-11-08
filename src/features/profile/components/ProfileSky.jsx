import { useMemo } from "react";
import { createSkyStars, starPath } from "../utils/profileArt.js";

const SPARK_PATH = starPath(0, 0, 1, 0.2);

export default function ProfileSky({ seed }) {
  const { dust, sparks } = useMemo(() => createSkyStars(seed), [seed]);

  return (
    <div className="profile-sky" aria-hidden="true">
      <div className="profile-sky-wash" />
      <svg className="profile-sky-stars" focusable="false">
        {dust.map((star) => (
          <circle
            key={star.key}
            cx={`${star.x}%`}
            cy={`${star.y}%`}
            r={star.r}
            opacity={star.opacity}
            className={star.isTinted ? "profile-sky-dust profile-sky-dust-tinted" : "profile-sky-dust"}
          />
        ))}
        {/* Each spark sits in an inner <svg> at x%, y% and is drawn around 0, 0 */}
        {sparks.map((spark) => (
          <svg key={spark.key} x={`${spark.x}%`} y={`${spark.y}%`} overflow="visible">
            <g
              className={spark.isTinted ? "profile-sky-spark profile-sky-spark-tinted" : "profile-sky-spark"}
              style={{ animationDelay: `${spark.delay}s` }}
            >
              <path d={SPARK_PATH} transform={`scale(${spark.size})`} />
            </g>
          </svg>
        ))}
      </svg>
    </div>
  );
}
