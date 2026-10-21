import { useId, useMemo } from "react";
import { STAR_TILE, createStarTile, fourPointStarPath } from "../utils/pinLayout.js";

// The star chart behind the cards: a seeded tile of faint stars, repeated over the whole board by
// an SVG <pattern>. Seeded by the Constellation owner's id, so every board has its own sky and
// keeps it. Purely decorative.
export default function BoardStars({ seed }) {
  // React 19's ids (like _r_0_) can go straight into url(#…)
  const patternId = `board-stars${useId()}`;
  // The board re-renders on every hover, so the stars are only computed again for a new seed
  const tile = useMemo(() => createStarTile(seed), [seed]);

  return (
    <svg className="pin-stars" aria-hidden="true" focusable="false">
      <defs>
        <pattern id={patternId} patternUnits="userSpaceOnUse" width={STAR_TILE.width} height={STAR_TILE.height}>
          {tile.dust.map((star) => (
            <circle key={star.key} cx={star.x} cy={star.y} r={star.r} opacity={star.opacity} className="pin-stars-dust" />
          ))}
          {tile.sparks.map((star) => (
            <path
              key={star.key}
              d={fourPointStarPath(star.x, star.y, star.size)}
              opacity={star.opacity}
              className="pin-stars-spark"
            />
          ))}
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${patternId})`} />
    </svg>
  );
}
