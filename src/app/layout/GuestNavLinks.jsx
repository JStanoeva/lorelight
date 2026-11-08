import { Link, NavLink, useLocation } from "react-router";

export default function GuestNavLinks({ onNavigate }) {
  const location = useLocation();
  // Pass on the page the guest wanted (state.from) between /login and /register so it isn't
  // lost; GuestGuard validates it.
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
