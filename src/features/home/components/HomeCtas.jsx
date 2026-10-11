import { Link } from "react-router";

// After sign-up, GuestGuard sends the new user straight to project creation.
// `search: ""` is needed because GuestGuard joins `from.pathname` and `from.search`.
const CREATE_AFTER_SIGN_UP = { from: { pathname: "/projects/create", search: "" } };

// The call-to-action pair shared by the hero and the closing strip. "Create a world" keeps its
// label and place in both states, so nothing shifts when the auth state is known.
export default function HomeCtas({ isLoggedIn = false }) {
  if (isLoggedIn) {
    return (
      <div className="home-ctas">
        <Link to="/projects/create" className="btn btn-primary btn-lg">
          Create a world
        </Link>
        <Link to="/lore" className="btn btn-ghost btn-lg">
          Explore the lore
        </Link>
      </div>
    );
  }

  return (
    <div className="home-ctas">
      <Link to="/register" state={CREATE_AFTER_SIGN_UP} className="btn btn-primary btn-lg">
        Create a world
      </Link>
      <Link to="/login" className="btn btn-ghost btn-lg">
        Login
      </Link>
    </div>
  );
}
