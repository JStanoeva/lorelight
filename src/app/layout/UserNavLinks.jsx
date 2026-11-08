import { Link, NavLink } from "react-router";

const SAVED_USERNAME_PATTERN = /^[a-z0-9]{3,30}$/;

export default function UserNavLinks({
  user,
  isHome = false,
  isLoggingOut = false,
  onNavigate,
  onLogout,
}) {
  // Users can edit their own metadata, so anything that isn't a username in the database's
  // format (an object would even crash the render) falls back to "My profile".
  const metadataUsername = user.user_metadata?.username;
  const username =
    typeof metadataUsername === "string" && SAVED_USERNAME_PATTERN.test(metadataUsername)
      ? metadataUsername
      : "";
  const profileLabel = username ? `@${username}` : "My profile";
  // On Home from xl up the section links share the bar, so the username gets less room
  const profileWidth = isHome ? "lg:max-w-40 xl:max-w-24" : "lg:max-w-40";

  return (
    <>
      {/* end: the project pages below /projects aren't "My Projects" */}
      <NavLink to="/projects" end onClick={onNavigate} className="nav-link py-3 lg:py-2">
        My Projects
      </NavLink>
      <NavLink to="/constellation" onClick={onNavigate} className="nav-link py-3 lg:py-2">
        My Constellation
      </NavLink>
      <Link
        to="/lore/create"
        onClick={onNavigate}
        className="btn btn-primary py-3 lg:mx-2 lg:py-2"
      >
        Create Lore
      </Link>
      <NavLink
        to={`/profile/${user.id}`}
        onClick={onNavigate}
        title={profileLabel}
        className={`nav-link truncate py-3 lg:py-2 ${profileWidth}`}
      >
        {profileLabel}
      </NavLink>
      <button
        type="button"
        onClick={onLogout}
        disabled={isLoggingOut}
        className="nav-link py-3 text-left lg:py-2"
      >
        Logout
      </button>
    </>
  );
}
