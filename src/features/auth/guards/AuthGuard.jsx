import { Navigate, Outlet, useLocation } from "react-router";
import Loader from "../../../shared/components/Loader.jsx";
import { useAuth } from "../hooks/useAuth.js";

// Layout route for the pages that need a logged-in user.
export default function AuthGuard() {
  const { user, isAuthLoading } = useAuth();
  const location = useLocation();

  // Until the stored session is known, a redirect would send logged-in users to /login on refresh.
  if (isAuthLoading) {
    return <Loader />;
  }

  if (!user) {
    // GuestGuard sends the user back to this page after login.
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
}
