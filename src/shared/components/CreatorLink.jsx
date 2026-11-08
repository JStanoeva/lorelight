import { Link } from "react-router";
import "../styles/creator-link.css";

// `profile` is the joined profiles row, or null when it couldn't be read.
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
