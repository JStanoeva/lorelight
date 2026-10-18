import { useAuth } from "./useAuth.js";

// Who is looking: the user's id, "guest", or null while the stored session is still being read.
// Data hooks put it in their request key because the database shows owners their private rows, so
// a different viewer (e.g. after logging out in another tab) needs a fresh request. A token refresh
// keeps the same id, so it doesn't cause a reload.
export function useViewerKey() {
  const { user, isAuthLoading } = useAuth();

  if (isAuthLoading) {
    return null;
  }

  return user?.id ?? "guest";
}
