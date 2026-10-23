import { useCallback, useEffect, useState } from "react";
import { useAuth } from "../../auth/hooks/useAuth.js";
import { profileService } from "../services/profileService.js";

// The logged-in user's own profile row, for the Edit Profile page. Only the profile itself is
// loaded (none of its collections), with the same derived-loading pattern as the other data hooks.
export function useOwnProfile() {
  const { user } = useAuth();
  const userId = user?.id;
  const [reloadCount, setReloadCount] = useState(0);
  const [result, setResult] = useState({ key: null, profile: null, error: null });

  // A new key means "a new request is needed": another user (e.g. after logging in again in
  // another tab) or a refetch(). No key while there is no user: there is no profile to load yet.
  const requestKey = userId && `${userId}|${reloadCount}`;

  useEffect(() => {
    if (!requestKey) {
      return;
    }

    // Mount / update: load the profile.
    let isStale = false;

    profileService.getProfileById(userId).then(
      (profile) => {
        if (!isStale) setResult({ key: requestKey, profile, error: null });
      },
      (error) => {
        if (!isStale) setResult({ key: requestKey, profile: null, error });
      },
    );

    // Unmount / before the next fetch: ignore this request's late response.
    return () => {
      isStale = true;
    };
  }, [userId, requestKey]);

  const refetch = useCallback(() => setReloadCount((count) => count + 1), []);

  // Loading is derived, so the effect never calls setState synchronously.
  const isLoading = !requestKey || result.key !== requestKey;

  return {
    profile: isLoading ? null : result.profile,
    error: isLoading ? null : result.error,
    isLoading,
    refetch,
  };
}
