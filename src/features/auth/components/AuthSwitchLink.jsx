import { Link, useLocation } from "react-router";

export default function AuthSwitchLink({ question, to, label }) {
  const location = useLocation();

  // A blur error in the focused field would push the link down mid-click and lose the click.
  // Main button only, so middle-click (new tab) keeps working.
  function handleMouseDown(event) {
    if (event.button === 0) {
      event.preventDefault();
    }
  }

  return (
    <p className="auth-switch">
      {question}{" "}
      {/* Pass on the page the guest wanted (state.from, read by GuestGuard) */}
      <Link to={to} state={location.state} onMouseDown={handleMouseDown}>
        {label}
      </Link>
    </p>
  );
}
