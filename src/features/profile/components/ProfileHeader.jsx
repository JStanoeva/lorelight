import { Link } from "react-router";
import Icon from "../../../shared/components/Icon.jsx";
import { formatShortMonthYear } from "../../../shared/utils/formatDate.js";
import StarGlyph from "../../home/components/StarGlyph.jsx";
import ProfileAvatar from "./ProfileAvatar.jsx";
import ProfileAvatarImage from "./ProfileAvatarImage.jsx";
import ProfileStats from "./ProfileStats.jsx";

export default function ProfileHeader({ profile, starColor, stats, creatorTitle, spotlight, isOwner, headingRef }) {
  const memberSince = formatShortMonthYear(profile.created_at);
  const bio = profile.bio?.trim() ?? "";

  return (
    <header className="profile-card">
      <div className={isOwner ? "profile-card-main profile-card-main-owner" : "profile-card-main"}>
        <div className="profile-card-avatar">
          <ProfileAvatar seed={profile.id}>
            <ProfileAvatarImage src={profile.avatar_url} seed={profile.id} colorHex={starColor.hex} />
          </ProfileAvatar>
        </div>

        <div className="profile-identity">
          {creatorTitle && (
            <p className="profile-title-ribbon">
              <StarGlyph className="profile-title-star" />
              <span className="sr-only">Creator title: </span>
              {creatorTitle.title}
            </p>
          )}

          <h1 ref={headingRef} tabIndex={-1} className="profile-name">
            {profile.display_name}
          </h1>

          <p className="profile-meta">
            <span className="profile-username">@{profile.username}</span>
            {memberSince && (
              <>
                <span className="profile-meta-dot" aria-hidden="true">
                  ·
                </span>
                <span>Member since {memberSince}</span>
              </>
            )}
          </p>

          {bio ? (
            <p className="profile-bio">{bio}</p>
          ) : (
            isOwner && <p className="profile-bio-empty">No bio yet. Add a short introduction with Edit profile.</p>
          )}
        </div>

        {isOwner && (
          <div className="profile-card-actions">
            <Link to="/profile/edit" className="btn btn-ghost profile-edit">
              <Icon name="pencil" size={16} />
              Edit profile
            </Link>
          </div>
        )}
      </div>

      <div className="profile-ledger">
        <ProfileStats stats={stats} />

        {spotlight && (
          <p className="profile-spotlight">
            <span className="profile-spotlight-label">
              <StarGlyph className="profile-spotlight-star" />
              Currently worldbuilding
              <span className="sr-only">:</span>
            </span>
            <Link to={`/projects/${spotlight.id}`} className="profile-spotlight-link">
              {spotlight.title}
            </Link>
          </p>
        )}
      </div>
    </header>
  );
}
