import { useCallback, useEffect, useState } from "react";
import { useViewerKey } from "../../auth/hooks/useViewerKey.js";
import { constellationService } from "../services/constellationService.js";

// The entries one user saved to their Constellation, most recently saved first. Without a valid
// user id the service returns an empty list without sending a request.
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

    // Mount / update: fetch whenever the key changes.
    let isStale = false;

    constellationService.getConstellation(userId).then(
      (data) => {
        if (!isStale) setResult({ key: requestKey, data, error: null });
      },
      (error) => {
        if (!isStale) setResult({ key: requestKey, data: [], error });
      },
    );

    // Unmount / before the next fetch: ignore this request's late response.
    return () => {
      isStale = true;
    };
  }, [userId, requestKey]);

  const refetch = useCallback(() => setReloadCount((count) => count + 1), []);

  // For the page, after the database removed a save: takes that entry off the list it already
  // has, so the screen updates without reloading. Only the list of this request key is changed:
  // a removal that finishes after the user or the viewer changed (e.g. a logout in another tab)
  // can't change the newly loaded list.
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
