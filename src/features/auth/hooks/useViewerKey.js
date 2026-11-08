import { useAuth } from "./useAuth.js";

// The user's id, "guest", or null while the session loads. Data hooks key requests on it, since
// owners see their private rows; a token refresh keeps the same id, so it causes no reload.
export function useViewerKey() {
  const { user, isAuthLoading } = useAuth();

  if (isAuthLoading) {
    return null;
  }

  return user?.id ?? "guest";
}
