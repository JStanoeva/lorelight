import ErrorMessage from "../../../shared/components/ErrorMessage.jsx";
import Loader from "../../../shared/components/Loader.jsx";
import { fourPointStarPath } from "../utils/pinLayout.js";

const GHOST_TILTS = [-2, 1.5, -1];

export default function BoardNotice({ kind, isOwner, errorMessage, onRetry }) {
  if (kind === "loading") {
    return (
      <div className="pin-notice">
        <div className="pin-ghosts" aria-hidden="true">
          {GHOST_TILTS.map((tilt) => (
            <span key={tilt} className="pin-ghost" style={{ "--tilt": `${tilt}deg` }} />
          ))}
        </div>
        <Loader label={isOwner ? "Loading your Constellation…" : "Loading the Constellation…"} />
      </div>
    );
  }

  return (
    <div className="pin-notice pin-notice-wide">
      <svg viewBox="0 0 220 70" className="pin-notice-art pin-notice-art-small" aria-hidden="true" focusable="false">
        <path d="M30 40 Q62 18 92 36" className="pin-notice-thread" />
        <path d="M128 38 Q160 20 190 40" className="pin-notice-thread" />
        <path d={fourPointStarPath(30, 40, 10)} className="pin-notice-pin" />
        <path d={fourPointStarPath(190, 40, 10)} className="pin-notice-pin" />
      </svg>
      <div className="pin-notice-error">
        <ErrorMessage message={errorMessage} onRetry={onRetry} />
      </div>
    </div>
  );
}
