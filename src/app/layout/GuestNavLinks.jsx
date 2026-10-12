import { Link, NavLink, useLocation } from "react-router";

// The account links for a guest. Header shows them after "Lore Catalog".
export default function GuestNavLinks({ onNavigate }) {
  const location = useLocation();
  // On /login and /register, the state remembers the page the guest wanted (state.from).
  // Passing it on means switching between the two pages, or clicking the current one,
  // doesn't lose it. GuestGuard checks it before using it.
  const isAuthPage = location.pathname === "/login" || location.pathname === "/register";
  const authState = isAuthPage ? location.state : undefined;

  return (
    <>
      <NavLink to="/login" state={authState} onClick={onNavigate} className="nav-link py-3 lg:py-2">
        Login
      </NavLink>
      <Link
        to="/register"
        state={authState}
        onClick={onNavigate}
        className="btn btn-primary py-3 lg:ml-2 lg:py-2"
      >
        Register
      </Link>
    </>
  );
}
