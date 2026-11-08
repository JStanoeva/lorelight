import { Link } from "react-router";

// After sign-up, GuestGuard sends the new user straight to project creation.
const CREATE_AFTER_SIGN_UP = { from: { pathname: "/projects/create" } };

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
