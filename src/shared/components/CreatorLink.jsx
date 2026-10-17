import { Link } from "react-router";
import "../styles/creator-link.css";

// A link to a creator's profile: initial avatar, display name and @username.
// `profile` is the joined profiles row ({ display_name, username }), or null when it couldn't be read.
export default function CreatorLink({ userId, profile }) {
  const name = profile?.display_name ?? "Unknown creator";

  return (
    <Link to={`/profile/${userId}`} className="creator-link">
      <span className="creator-avatar" aria-hidden="true">
        {name.charAt(0).toUpperCase()}
      </span>
      <span className="creator-name">{name}</span>
      {profile && <span className="creator-handle">@{profile.username}</span>}
    </Link>
  );
}
