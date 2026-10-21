import { Link } from "react-router";
import Icon from "../../../shared/components/Icon.jsx";
import { formatCollectionCount, getAllPageTitle } from "../utils/profileTabText.js";
import ProfileAvatar from "./ProfileAvatar.jsx";
import ProfileAvatarImage from "./ProfileAvatarImage.jsx";

// The top of an "All …" page: a compact version of the profile's card with the way back to the
// profile (on the same tab), the small crest, whose page it is, the h1 and how many items there
// are, plus the owner's note on who can see them. `tab` is one of PROFILE_TABS; `showCount` is
// false where the list shows its own count (the Constellation board).
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
          <p className="profile-all-eyebrow">
            <span className="profile-all-name">{profile.display_name}</span>
            <span className="profile-all-username">@{profile.username}</span>
          </p>
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
