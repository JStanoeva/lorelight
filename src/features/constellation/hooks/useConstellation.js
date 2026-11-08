import { useCallback, useEffect, useState } from "react";
import { useViewerKey } from "../../auth/hooks/useViewerKey.js";
import { constellationService } from "../services/constellationService.js";

export function useConstellation(userId) {
  const viewerKey = useViewerKey();
  const [reloadCount, setReloadCount] = useState(0);
  const [result, setResult] = useState({ key: null, data: [], error: null });

  // A new key means "a new request is needed": a different user, a different viewer or a
  // refetch(). No key while the session is still being read, so nothing loads for the wrong viewer.
  const requestKey = viewerKey && `${userId}|${viewerKey}|${reloadCount}`;

  useEffect(() => {
    if (!requestKey) {
      return;
    }

    let isStale = false;

    constellationService.getConstellation(userId).then(
      (data) => {
        if (!isStale) setResult({ key: requestKey, data, error: null });
      },
      (error) => {
        if (!isStale) setResult({ key: requestKey, data: [], error });
      },
    );

    return () => {
      isStale = true;
    };
  }, [userId, requestKey]);

  const refetch = useCallback(() => setReloadCount((count) => count + 1), []);

  // Drops a removed entry without reloading. Only this request key's list changes, so a removal
  // that finishes after the user or viewer changed can't touch the newly loaded list.
  const removeEntry = useCallback(
    (loreId) =>
      setResult((current) =>
        current.key === requestKey
          ? { ...current, data: current.data.filter((entry) => entry.id !== loreId) }
          : current,
      ),
    [requestKey],
  );

  // Loading is derived, so the effect never calls setState synchronously.
  const isLoading = !requestKey || result.key !== requestKey;

  return {
    entries: isLoading ? [] : result.data,
    error: isLoading ? null : result.error,
    isLoading,
    refetch,
    removeEntry,
  };
}
