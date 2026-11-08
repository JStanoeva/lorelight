import Loader from "../../../shared/components/Loader.jsx";
import { PROFILE_TABS } from "../constants/profileTabs.js";
import { PENDING_SEED } from "../utils/profileArt.js";
import ProfileAvatar from "./ProfileAvatar.jsx";
import ProfileHero from "./ProfileHero.jsx";

const GHOST_STATS = [1, 2, 3, 4];
const GHOST_CARDS = [1, 2, 3];

// `isOwnProfile` (known from the URL) keeps room for the owner's Edit profile button and tab note.
export default function ProfileSkeleton({ isOwnProfile = false, headingRef }) {
  return (
    <div className="profile-page profile-page-pending profile-page-loading">
      <h1 ref={headingRef} tabIndex={-1} className="sr-only">
        Creator profile
      </h1>

      <ProfileHero seed={PENDING_SEED}>
        <div className="profile-card" aria-hidden="true">
          <div className={isOwnProfile ? "profile-card-main profile-card-main-owner" : "profile-card-main"}>
            <div className="profile-card-avatar">
              <ProfileAvatar seed={PENDING_SEED} />
            </div>
            <div className="profile-identity">
              <span className="profile-skeleton-bar profile-skeleton-ribbon" />
              <span className="profile-skeleton-bar profile-skeleton-name" />
              <span className="profile-skeleton-bar profile-skeleton-meta" />
              <span className="profile-skeleton-bar profile-skeleton-line" />
              <span className="profile-skeleton-bar profile-skeleton-line profile-skeleton-line-next" />
              <span className="profile-skeleton-bar profile-skeleton-line profile-skeleton-line-short" />
            </div>
            {isOwnProfile && (
              <div className="profile-card-actions">
                <span className="profile-skeleton-bar profile-skeleton-button" />
              </div>
            )}
          </div>
          <div className="profile-ledger">
            <div className="profile-stats">
              {GHOST_STATS.map((stat) => (
                <div key={stat} className="profile-stat profile-skeleton-stat">
                  <span className="profile-skeleton-bar profile-skeleton-figure" />
                  <span className="profile-skeleton-bar profile-skeleton-label" />
                </div>
              ))}
            </div>
            <span className="profile-spotlight profile-skeleton-spotlight">
              <span className="profile-skeleton-bar profile-skeleton-label" />
              <span className="profile-skeleton-bar profile-skeleton-spotlight-link" />
            </span>
          </div>
        </div>
      </ProfileHero>

      <div className="profile-collections site-column">
        <div className="profile-tabs-bar" aria-hidden="true">
          <div className="profile-tablist">
            {PROFILE_TABS.map((tab) => (
              <span key={tab.value} className="profile-tab profile-skeleton-tab">
                <span className="profile-tab-label">{tab.label}</span>
                <span className="profile-tab-count">0</span>
              </span>
            ))}
          </div>
          {isOwnProfile && (
            <p className="profile-owner-note">
              <span className="profile-skeleton-bar profile-skeleton-note" />
            </p>
          )}
        </div>

        <div className="profile-skeleton-panel">
          <div className="profile-grid" aria-hidden="true">
            {GHOST_CARDS.map((card) => (
              <div key={card} className="profile-ghost-card">
                <span className="profile-ghost-picture" />
                <span className="profile-ghost-body">
                  <span className="profile-skeleton-bar profile-skeleton-line-short" />
                  <span className="profile-skeleton-bar profile-skeleton-meta" />
                </span>
              </div>
            ))}
          </div>
          <div className="profile-skeleton-status">
            <Loader label="Loading profile…" />
          </div>
        </div>
      </div>
    </div>
  );
}
