import { fourPointStarPath } from "../utils/pinLayout.js";
import BoardStars from "./BoardStars.jsx";

const CORNERS = ["top-left", "top-right", "bottom-right", "bottom-left"];
const CORNER_STAR_PATH = fourPointStarPath(0, 0, 10);

// The framed board: a dark mat with tick marks like a star chart's border, a small star in each
// corner, a plaque on the top edge ("Pinned by you"), and the surface with the chart grid and the
// stars. The cards and threads, or a notice (loading, error, empty), go inside as children.
// `surfaceRef` (optional) lets the board measure where its pins are. `isCompact`: a notice.
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
