import { Link, useLocation } from "react-router";

// The "Log in" / "Create an account" line under the Login and Register forms.
export default function AuthSwitchLink({ question, to, label }) {
  const location = useLocation();

  // Like the submit button: pressing the mouse would blur the field being typed in, its error
  // would push the link down before the mouse is released, and the click would be lost.
  // Only the main button: middle-click (open in a new tab) keeps working.
  function handleMouseDown(event) {
    if (event.button === 0) {
      event.preventDefault();
    }
  }

  return (
    <p className="auth-switch">
      {question}{" "}
      {/* The state holds the page the guest wanted (state.from, read by GuestGuard), so it goes along */}
      <Link to={to} state={location.state} onMouseDown={handleMouseDown}>
        {label}
      </Link>
    </p>
  );
}
