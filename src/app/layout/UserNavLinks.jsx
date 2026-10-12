import { Link, NavLink } from "react-router";

// The shape the database saves (profiles.username)
const SAVED_USERNAME_PATTERN = /^[a-z0-9]{3,30}$/;

// The account links for a logged-in user. Header shows them after "Lore Catalog".
export default function UserNavLinks({
  user,
  isHome = false,
  isLoggingOut = false,
  onNavigate,
  onLogout,
}) {
  // Saved with the account at sign-up, so the header can show it without asking the database.
  // Users can edit this metadata themselves, so anything that isn't a saved-style username
  // (an object would even crash the render) falls back to "My profile".
  const metadataUsername = user.user_metadata?.username;
  const username =
    typeof metadataUsername === "string" && SAVED_USERNAME_PATTERN.test(metadataUsername)
      ? metadataUsername
      : "";
  const profileLabel = username ? `@${username}` : "My profile";
  // On Home from xl up, the section links share the bar, so the username gets less room there
  const profileWidth = isHome ? "lg:max-w-40 xl:max-w-24" : "lg:max-w-40";

  return (
    <>
      {/* end: only /projects itself is "My Projects", not every project's page below it */}
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
      {/* In the bar, a long username ends in "…" so it can't push the other links out;
          the title shows it in full on hover */}
      <NavLink
        to={`/profile/${user.id}`}
        onClick={onNavigate}
        title={profileLabel}
        className={`nav-link truncate py-3 lg:py-2 ${profileWidth}`}
      >
        {profileLabel}
      </NavLink>
      {/* text-left lines the label up with the links in the dropdown. Disabled while the
          logout request runs, so repeated clicks don't start it again. */}
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
