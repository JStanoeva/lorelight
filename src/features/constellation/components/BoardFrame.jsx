import { fourPointStarPath } from "../utils/pinLayout.js";
import BoardStars from "./BoardStars.jsx";

const CORNERS = ["top-left", "top-right", "bottom-right", "bottom-left"];
const CORNER_STAR_PATH = fourPointStarPath(0, 0, 10);

export default function BoardFrame({ seed, plaque, surfaceRef, isCompact = false, children }) {
  return (
    <div className={isCompact ? "pin-frame pin-frame-compact" : "pin-frame"}>
      {/* The page heading already says whose board this is, so screen readers skip the plaque */}
      <p className="pin-frame-plaque" aria-hidden="true">
        {plaque}
      </p>

      {CORNERS.map((corner) => (
        <svg
          key={corner}
          viewBox="-12 -12 24 24"
          aria-hidden="true"
          focusable="false"
          className={`pin-frame-corner pin-frame-corner-${corner}`}
        >
          <path d={CORNER_STAR_PATH} />
        </svg>
      ))}

      <div ref={surfaceRef} className="pin-surface">
        <BoardStars seed={seed} />
        {children}
      </div>
    </div>
  );
}
