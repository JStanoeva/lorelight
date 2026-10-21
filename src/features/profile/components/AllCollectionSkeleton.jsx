import Loader from "../../../shared/components/Loader.jsx";
import { PENDING_SEED } from "../utils/profileArt.js";
import ProfileAvatar from "./ProfileAvatar.jsx";
import ProfileHero from "./ProfileHero.jsx";

// While an "All …" page loads: its compact card in a quiet night blue with faint bars, then the
// Loader with `label` (e.g. "Loading lore entries…"). `headingRef` lets the page move focus to the
// (visually hidden) h1 after Try again.
export default function AllCollectionSkeleton({ label, headingRef }) {
  return (
    <div className="profile-page profile-page-pending profile-page-loading">
      <h1 ref={headingRef} tabIndex={-1} className="sr-only">
        Creator profile
      </h1>

      <ProfileHero seed={PENDING_SEED} isCompact>
        <div className="profile-card profile-all-card" aria-hidden="true">
          <span className="profile-back-link">
            <span className="profile-skeleton-bar profile-skeleton-meta" />
          </span>
          <div className="profile-all-head">
            <ProfileAvatar seed={PENDING_SEED} size="small" />
            <div className="profile-all-text">
              <span className="profile-skeleton-bar profile-skeleton-meta" />
              <span className="profile-skeleton-bar profile-skeleton-name" />
              <span className="profile-skeleton-bar profile-skeleton-label" />
            </div>
          </div>
        </div>
      </ProfileHero>

      <div className="profile-all-body site-column">
        <Loader label={label} />
      </div>
    </div>
  );
}
