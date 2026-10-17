import { useCallback, useEffect, useState } from "react";
import { loreService } from "../services/loreService.js";

export function useLoreEntry(entryId) {
  const [reloadCount, setReloadCount] = useState(0);
  const [result, setResult] = useState({ key: null, data: null, error: null });

  // A new key means "a new request is needed": a different entryId or a refetch().
  const requestKey = `${entryId}|${reloadCount}`;

  useEffect(() => {
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

  // Loading is derived, so the effect never calls setState synchronously.
  const isLoading = result.key !== requestKey;

  return {
    entry: isLoading ? null : result.data,
    error: isLoading ? null : result.error,
    isLoading,
    refetch,
  };
}
