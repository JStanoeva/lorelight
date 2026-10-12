import { Navigate } from "react-router";
import { useAuth } from "../hooks/useAuth.js";

// Used inside the edit pages once the record has loaded. They already sit under AuthGuard,
// so the user is known: anyone but the owner goes to `redirectTo` (the details page).
export default function OwnerGuard({ ownerId, redirectTo, children }) {
  const { user } = useAuth();

  if (user?.id !== ownerId) {
    return <Navigate to={redirectTo} replace />;
  }

  return children;
}
