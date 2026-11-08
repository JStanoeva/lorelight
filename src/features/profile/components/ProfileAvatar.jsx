import { useId, useMemo } from "react";
import { createCrest, CREST_TICKS, starPath } from "../utils/profileArt.js";

const JEWEL_PATH = starPath(0, -78, 9, 0.22);

// Coloured by the CSS variable --star. Without `children` (the picture) the portrait stays empty.
export default function ProfileAvatar({ seed, size = "large", children }) {
  // A page can show several crests, so the gradient ids must be unique
  const idBase = `profile-crest-${useId()}`;
  const crest = useMemo(() => createCrest(seed), [seed]);
  const isSmall = size === "small";

  return (
    <div className={isSmall ? "profile-crest profile-crest-small" : "profile-crest"}>
      <svg className="profile-crest-art" viewBox="-120 -120 240 240" aria-hidden="true" focusable="false">
        <defs>
          <radialGradient id={`${idBase}-halo`}>
            <stop offset="0.45" className="profile-crest-stop" stopOpacity="0.32" />
            <stop offset="1" className="profile-crest-stop" stopOpacity="0" />
          </radialGradient>
          <radialGradient id={`${idBase}-ray`} r="0.5">
            <stop offset="0.55" className="profile-crest-stop" stopOpacity="0.55" />
            <stop offset="1" className="profile-crest-stop" stopOpacity="0.04" />
          </radialGradient>
        </defs>

        <circle r="119" fill={`url(#${idBase}-halo)`} />

        {!isSmall && (
          <g>
            {CREST_TICKS.map((tick) => (
              <line
                key={tick.key}
                x1={tick.x1}
                y1={tick.y1}
                x2={tick.x2}
                y2={tick.y2}
                className={tick.isLong ? "profile-crest-tick profile-crest-tick-long" : "profile-crest-tick"}
              />
            ))}
          </g>
        )}

        <g transform="rotate(45)">
          <path
            d={starPath(0, 0, crest.diagonal, 0.15)}
            fill={`url(#${idBase}-ray)`}
            className="profile-crest-ray profile-crest-ray-diagonal"
          />
        </g>
        <path d={starPath(0, 0, crest.cardinal, 0.13)} fill={`url(#${idBase}-ray)`} className="profile-crest-ray" />

        <circle r="88" className="profile-crest-orbit-ring profile-crest-orbit-ring-inner" />
        {!isSmall && <circle r="104" className="profile-crest-orbit-ring" />}

        <g className="profile-crest-orbit" style={{ "--orbit-start": `${crest.innerStart}deg` }}>
          <circle cx="88" cy="0" r="7" className="profile-crest-satellite-glow" />
          <circle cx="88" cy="0" r="2.6" className="profile-crest-satellite" />
        </g>
        {!isSmall && (
          <g
            className="profile-crest-orbit profile-crest-orbit-outer"
            style={{ "--orbit-start": `${crest.outerStart}deg` }}
          >
            <circle cx="104" cy="0" r="5" className="profile-crest-satellite-glow" />
            <circle cx="104" cy="0" r="1.8" className="profile-crest-satellite" />
          </g>
        )}
      </svg>

      <div className="profile-portrait">{children}</div>

      <svg className="profile-crest-front" viewBox="-120 -120 240 240" aria-hidden="true" focusable="false">
        <circle cx="0" cy="-78" r="11" className="profile-crest-jewel-glow" />
        <path d={JEWEL_PATH} className="profile-crest-jewel" />
        <circle cx="0" cy="-78" r="1.6" className="profile-crest-jewel-core" />
      </svg>
    </div>
  );
}
