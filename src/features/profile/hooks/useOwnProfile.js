import { useCallback, useEffect, useState } from "react";
import { useAuth } from "../../auth/hooks/useAuth.js";
import { profileService } from "../services/profileService.js";

export function useOwnProfile() {
  const { user } = useAuth();
  const userId = user?.id;
  const [reloadCount, setReloadCount] = useState(0);
  const [result, setResult] = useState({ key: null, profile: null, error: null });

  // A new key means a new request: another user or a refetch(). No user, no key: nothing to load.
  const requestKey = userId && `${userId}|${reloadCount}`;

  useEffect(() => {
    if (!requestKey) {
      return;
    }

    let isStale = false;

    profileService.getProfileById(userId).then(
      (profile) => {
        if (!isStale) setResult({ key: requestKey, profile, error: null });
      },
      (error) => {
        if (!isStale) setResult({ key: requestKey, profile: null, error });
      },
    );

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
