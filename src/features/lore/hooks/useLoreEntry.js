import { useCallback, useEffect, useState } from "react";
import { useViewerKey } from "../../auth/hooks/useViewerKey.js";
import { loreService } from "../services/loreService.js";

export function useLoreEntry(entryId) {
  const viewerKey = useViewerKey();
  const [reloadCount, setReloadCount] = useState(0);
  const [result, setResult] = useState({ key: null, data: null, error: null });

  // A new key means "a new request is needed": a different entryId, a different viewer or a
  // refetch(). No key while the session is still being read, so nothing loads for the wrong viewer.
  const requestKey = viewerKey && `${entryId}|${viewerKey}|${reloadCount}`;

  useEffect(() => {
    if (!requestKey) {
      return;
    }

    // Mount / update: fetch whenever the key changes.
    let isStale = false;

    loreService.getLoreById(entryId).then(
      (data) => {
        if (!isStale) setResult({ key: requestKey, data, error: null });
      },
      (error) => {
        if (!isStale) setResult({ key: requestKey, data: null, error });
      },
    );

    // Unmount / before the next fetch: ignore this request's late response.
    return () => {
      isStale = true;
    };
  }, [entryId, requestKey]);

  const refetch = useCallback(() => setReloadCount((count) => count + 1), []);

  // Applies a change to the entry it already has (e.g. the appreciation count after the database
  // accepted a new appreciation), so the screen updates without reloading.
  // `updater(entry)` returns the new entry. Only the data of this request key is changed, like
  // useProject's updateData, and an entry that wasn't found stays not found.
  const updateData = useCallback(
    (updater) =>
      setResult((current) =>
        current.key === requestKey && current.data ? { ...current, data: updater(current.data) } : current,
      ),
    [requestKey],
  );

  // Loading is derived, so the effect never calls setState synchronously.
  const isLoading = !requestKey || result.key !== requestKey;

  return {
    entry: isLoading ? null : result.data,
    error: isLoading ? null : result.error,
    isLoading,
    refetch,
    updateData,
  };
}
