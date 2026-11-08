import { useCallback, useEffect, useState } from "react";
import { useAuth } from "../../auth/hooks/useAuth.js";
import { useViewerKey } from "../../auth/hooks/useViewerKey.js";
import { appreciationService } from "../services/appreciationService.js";

export function useAppreciation(loreId) {
  const viewerKey = useViewerKey();
  // The id, not the user object: a token refresh replaces the object and mustn't refetch
  const userId = useAuth().user?.id ?? null;
  const [reloadCount, setReloadCount] = useState(0);
  const [result, setResult] = useState({ key: null, data: false, error: null });

  // A new key means a new request; no key while the session is still being read
  const requestKey = viewerKey && `${loreId}|${viewerKey}|${reloadCount}`;

  useEffect(() => {
    if (!requestKey) {
      return;
    }

    let isStale = false;

    appreciationService.hasAppreciated(loreId, userId).then(
      (data) => {
        if (!isStale) setResult({ key: requestKey, data, error: null });
      },
      (error) => {
        if (!isStale) setResult({ key: requestKey, data: false, error });
      },
    );

    return () => {
      isStale = true;
    };
  }, [loreId, userId, requestKey]);

  const refetch = useCallback(() => setReloadCount((count) => count + 1), []);

  // Applies a confirmed answer without refetching, only for the current key, so a click that
  // finishes after the entry or viewer changed can't leak into the new answer
  const setHasAppreciated = useCallback(
    (value) => setResult((current) => (current.key === requestKey ? { ...current, data: value } : current)),
    [requestKey],
  );

  // Loading is derived, so the effect never calls setState synchronously.
  const isLoading = !requestKey || result.key !== requestKey;

  return {
    hasAppreciated: isLoading ? false : result.data,
    error: isLoading ? null : result.error,
    isLoading,
    refetch,
    setHasAppreciated,
  };
}
