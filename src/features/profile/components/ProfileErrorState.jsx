import ErrorMessage from "../../../shared/components/ErrorMessage.jsx";
import { getErrorMessage } from "../../../shared/utils/getErrorMessage.js";
import { PENDING_SEED } from "../utils/profileArt.js";
import ProfileAvatar from "./ProfileAvatar.jsx";
import ProfileHero from "./ProfileHero.jsx";

// A profile (or "All …" page) that couldn't be loaded: the header card's frame with an unlit
// crest, the page's h1 and the error with Try again. Nothing below it, so it can't be mistaken
// for a profile that is still loading. `headingRef` lets the page move focus to the h1 after
// another failed Try again.
export default function ProfileErrorState({ error, onRetry, headingRef }) {
  return (
    <div className="profile-page profile-page-pending">
      <ProfileHero seed={PENDING_SEED}>
        <div className="profile-card">
          <div className="profile-card-main">
            <div className="profile-card-avatar" aria-hidden="true">
              <ProfileAvatar seed={PENDING_SEED} />
            </div>
            <div className="profile-identity">
              <h1 ref={headingRef} tabIndex={-1} className="profile-name">
                Creator profile
              </h1>
              <div className="profile-error">
                <ErrorMessage message={getErrorMessage(error)} onRetry={onRetry} />
              </div>
            </div>
          </div>
        </div>
      </ProfileHero>
    </div>
  );
}
