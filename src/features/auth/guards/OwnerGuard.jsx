import { Navigate } from "react-router";
import { useAuth } from "../hooks/useAuth.js";

// Used under AuthGuard once the record has loaded, so the user is already known.
export default function OwnerGuard({ ownerId, redirectTo, children }) {
  const { user } = useAuth();

  if (user?.id !== ownerId) {
    return <Navigate to={redirectTo} replace />;
  }

  return children;
}
