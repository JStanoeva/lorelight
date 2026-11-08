import { Link } from "react-router";
import Icon from "../../../shared/components/Icon.jsx";
import { formatCollectionCount, getAllPageTitle } from "../utils/profileTabText.js";
import ProfileAvatar from "./ProfileAvatar.jsx";
import ProfileAvatarImage from "./ProfileAvatarImage.jsx";

// `showCount` is false where the list shows its own count (the Constellation board)
export default function AllCollectionHeader({ profile, starColor, tab, total, isOwner, showCount, headingRef }) {
  return (
    <header className="profile-card profile-all-card">
      <Link to={`/profile/${profile.id}?tab=${tab.value}`} className="profile-back-link">
        <span aria-hidden="true">←</span>
        Back to {isOwner ? "your profile" : `${profile.display_name}'s profile`}
      </Link>

      <div className="profile-all-head">
        <ProfileAvatar seed={profile.id} size="small">
          <ProfileAvatarImage src={profile.avatar_url} seed={profile.id} colorHex={starColor.hex} />
        </ProfileAvatar>

        <div className="profile-all-text">
          <h1 ref={headingRef} tabIndex={-1} className="profile-all-title">
            {getAllPageTitle(tab, profile.display_name)}
          </h1>
          {(showCount || isOwner) && (
            <p className="profile-all-count">
              {showCount && formatCollectionCount(tab, total)}
              {isOwner && (
                <span className="profile-all-note">
                  <Icon name="eye" size={14} className="profile-owner-note-icon" />
                  {tab.allOwnerNote}
                </span>
              )}
            </p>
          )}
        </div>
      </div>
    </header>
  );
}
