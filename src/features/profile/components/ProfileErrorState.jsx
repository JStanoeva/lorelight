import ErrorMessage from "../../../shared/components/ErrorMessage.jsx";
import PageTitle from "../../../shared/components/PageTitle.jsx";
import { getErrorMessage } from "../../../shared/utils/getErrorMessage.js";
import { PENDING_SEED } from "../utils/profileArt.js";
import ProfileAvatar from "./ProfileAvatar.jsx";
import ProfileHero from "./ProfileHero.jsx";

export default function ProfileErrorState({ error, onRetry, headingRef }) {
  return (
    <div className="profile-page profile-page-pending">
      <PageTitle title="Creator profile" />
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
